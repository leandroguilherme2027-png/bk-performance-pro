/**
 * Gerador de Sensi Full Capa.
 *
 * The user picks the device by brand and a searchable model (with a manual
 * fallback), chooses COM DPI or SEM DPI, and picks SENSI ALTA or SENSI BAIXA.
 * GERAR SENSI calls the backend generation service and hands the result to the
 * result screen through the router state.
 */

import type { DpiMode, GeneratedSensitivity, SensitivityType } from "@/backend";
import {
  DpiMode as DpiModeEnum,
  SensitivityType as SensiTypeEnum,
} from "@/backend";
import { PageShell } from "@/components/Layout";
import {
  ActionButton,
  SectionHeading,
  TelemetryCard,
  TelemetryLabel,
} from "@/components/telemetry";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useGenerateSensitivity } from "@/hooks/useQueries";
import {
  DEVICE_BRANDS,
  findBrand,
  requiresManualModel,
  resolveModel,
  searchModels,
} from "@/lib/device-catalog";
import { cn } from "@/lib/utils";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { AlertTriangle, Check, Loader2, Search } from "lucide-react";
import { useMemo, useState } from "react";

/** Payload handed to the result screen through the router state. */
export interface SensiResultState {
  brand: string;
  model: string;
  dpiMode: DpiMode;
  dpi: number | null;
  sensitivityType: SensitivityType;
  result: GeneratedSensitivity;
}

declare module "@tanstack/react-router" {
  interface HistoryState {
    brand?: string;
    model?: string;
    dpiMode?: DpiMode;
    dpi?: number | null;
    sensitivityType?: SensitivityType;
    result?: GeneratedSensitivity;
    /** Set by the result screen when returning to the generator. */
    previous?: SensiResultState;
  }
}

type DpiChoice = "with" | "without";
type LevelChoice = "high" | "low";

const LEVEL_OPTIONS: Array<{
  value: LevelChoice;
  label: string;
  hint: string;
}> = [
  { value: "high", label: "SENSI ALTA", hint: "Resposta mais rápida da mira" },
  { value: "low", label: "SENSI BAIXA", hint: "Mais controle e precisão" },
];

const DPI_OPTIONS: Array<{ value: DpiChoice; label: string; hint: string }> = [
  { value: "with", label: "COM DPI", hint: "Informe o DPI do seu aparelho" },
  { value: "without", label: "SEM DPI", hint: "Não usar DPI no cálculo" },
];

/** Form values restored from the choices forwarded by the result screen. */
interface RestoredChoices {
  brandId: string;
  modelQuery: string;
  selectedModel: string;
  manualModel: string;
  dpiChoice: DpiChoice | null;
  dpiValue: string;
  level: LevelChoice | null;
}

const EMPTY_CHOICES: RestoredChoices = {
  brandId: "",
  modelQuery: "",
  selectedModel: "",
  manualModel: "",
  dpiChoice: null,
  dpiValue: "",
  level: null,
};

/**
 * Map the choices forwarded by the result screen back onto the form. The
 * forwarded brand is the display name, so it is resolved to the catalog id; a
 * model that is not in the catalog is restored as a manual entry.
 */
function restoreChoices(
  previous: Partial<SensiResultState> | undefined,
): RestoredChoices {
  if (!previous) return EMPTY_CHOICES;

  const brand = DEVICE_BRANDS.find((item) => item.name === previous.brand);
  const brandId = brand?.id ?? "";
  const model = previous.model ?? "";
  const inCatalog = brand ? brand.models.includes(model) : false;

  return {
    brandId,
    modelQuery: inCatalog ? model : "",
    selectedModel: inCatalog ? model : "",
    manualModel: inCatalog ? "" : model,
    dpiChoice:
      previous.dpiMode === DpiModeEnum.current
        ? "with"
        : previous.dpiMode === DpiModeEnum.withoutDpi
          ? "without"
          : null,
    dpiValue:
      previous.dpi !== null && previous.dpi !== undefined
        ? String(previous.dpi)
        : "",
    level:
      previous.sensitivityType === SensiTypeEnum.high
        ? "high"
        : previous.sensitivityType === SensiTypeEnum.low
          ? "low"
          : null,
  };
}

export default function SensiGeneratorPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const generate = useGenerateSensitivity();

  const [initial] = useState(() => restoreChoices(location.state));

  const [brandId, setBrandId] = useState<string>(initial.brandId);
  const [modelQuery, setModelQuery] = useState(initial.modelQuery);
  const [selectedModel, setSelectedModel] = useState(initial.selectedModel);
  const [manualModel, setManualModel] = useState(initial.manualModel);
  const [dpiChoice, setDpiChoice] = useState<DpiChoice | null>(
    initial.dpiChoice,
  );
  const [dpiValue, setDpiValue] = useState(initial.dpiValue);
  const [level, setLevel] = useState<LevelChoice | null>(initial.level);

  const brand = brandId ? findBrand(brandId) : undefined;
  const manualRequired = brandId !== "" && requiresManualModel(brandId);

  const modelOptions = useMemo(
    () => (brandId ? searchModels(brandId, modelQuery) : []),
    [brandId, modelQuery],
  );

  const resolvedModel = resolveModel(selectedModel, manualModel);
  const dpiNumber = Number.parseInt(dpiValue, 10);
  const dpiValid =
    dpiChoice === "without" ||
    (dpiChoice === "with" && Number.isFinite(dpiNumber) && dpiNumber > 0);

  const canGenerate =
    brandId !== "" &&
    resolvedModel !== "" &&
    dpiChoice !== null &&
    dpiValid &&
    level !== null &&
    !generate.isPending;

  function selectBrand(id: string) {
    setBrandId(id);
    setModelQuery("");
    setSelectedModel("");
    setManualModel("");
  }

  function handleGenerate() {
    if (!canGenerate || !brand || dpiChoice === null || level === null) return;

    const dpiMode: DpiMode =
      dpiChoice === "with" ? DpiModeEnum.current : DpiModeEnum.withoutDpi;
    const sensitivityType: SensitivityType =
      level === "high" ? SensiTypeEnum.high : SensiTypeEnum.low;
    const dpi = dpiChoice === "with" ? dpiNumber : null;

    generate.mutate(
      {
        brand: brand.name,
        model: resolvedModel,
        dpiMode,
        dpi: dpi !== null ? BigInt(dpi) : undefined,
        sensitivityType,
      },
      {
        onSuccess: (result) => {
          const state: SensiResultState = {
            brand: brand.name,
            model: resolvedModel,
            dpiMode,
            dpi,
            sensitivityType,
            result,
          };
          void navigate({ to: "/sensi/resultado", state });
        },
      },
    );
  }

  return (
    <PageShell>
      <SectionHeading
        title="Gerador de Sensi Full Capa"
        description="Escolha o aparelho, o modo de DPI e o nível da sensi. O resultado é calculado pelo serviço do app."
      />

      {/* Device */}
      <TelemetryCard>
        <TelemetryLabel>1 · Aparelho</TelemetryLabel>
        <div className="space-y-4">
          <div className="space-y-2">
            <span className="block text-sm text-foreground">Marca</span>
            <div
              data-ocid="sensi.brand.select"
              className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4"
            >
              {DEVICE_BRANDS.map((item) => {
                const active = item.id === brandId;
                return (
                  <button
                    key={item.id}
                    type="button"
                    data-ocid={`sensi.brand.${item.id}`}
                    aria-pressed={active}
                    onClick={() => selectBrand(item.id)}
                    className={cn(
                      "min-h-11 rounded-xl border px-3 py-2 text-sm font-medium transition-fast focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                      active
                        ? "border-primary bg-primary/15 text-primary"
                        : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground",
                    )}
                  >
                    {item.name}
                  </button>
                );
              })}
            </div>
          </div>

          {brandId !== "" && !manualRequired && (
            <div className="space-y-2">
              <Label htmlFor="sensi-model" className="text-sm text-foreground">
                Modelo
              </Label>
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  id="sensi-model"
                  data-ocid="sensi.model.search_input"
                  value={modelQuery}
                  onChange={(event) => {
                    setModelQuery(event.target.value);
                    setSelectedModel("");
                  }}
                  placeholder="Buscar modelo (ex.: Redmi Note 12)"
                  className="h-12 rounded-xl pl-9"
                  autoComplete="off"
                />
              </div>
              {modelOptions.length > 0 ? (
                <ul
                  data-ocid="sensi.model.list"
                  className="max-h-56 space-y-1 overflow-y-auto rounded-xl border border-border bg-background/60 p-1"
                >
                  {modelOptions.map((model) => {
                    const active = model === selectedModel;
                    return (
                      <li key={model}>
                        <button
                          type="button"
                          data-ocid={`sensi.model.item.${modelOptions.indexOf(model) + 1}`}
                          aria-pressed={active}
                          onClick={() => {
                            setSelectedModel(model);
                            setModelQuery(model);
                          }}
                          className={cn(
                            "flex min-h-11 w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition-fast focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                            active
                              ? "bg-primary/15 text-primary"
                              : "text-foreground hover:bg-muted",
                          )}
                        >
                          <span className="min-w-0 truncate">{model}</span>
                          {active && (
                            <Check
                              className="size-4 shrink-0"
                              aria-hidden="true"
                            />
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p
                  data-ocid="sensi.model.empty_state"
                  className="rounded-xl border border-dashed border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground"
                >
                  Nenhum modelo encontrado. Digite o modelo no campo abaixo.
                </p>
              )}
            </div>
          )}

          {(manualRequired ||
            (brandId !== "" && modelOptions.length === 0)) && (
            <div className="space-y-2">
              <Label htmlFor="sensi-manual" className="text-sm text-foreground">
                {manualRequired
                  ? "Modelo do aparelho"
                  : "Modelo não encontrado — digite manualmente"}
              </Label>
              <Input
                id="sensi-manual"
                data-ocid="sensi.model.manual_input"
                value={manualModel}
                onChange={(event) => setManualModel(event.target.value)}
                placeholder="Ex.: Galaxy A15"
                className="h-12 rounded-xl"
                autoComplete="off"
              />
            </div>
          )}
        </div>
      </TelemetryCard>

      {/* DPI */}
      <TelemetryCard>
        <TelemetryLabel>2 · DPI</TelemetryLabel>
        <div className="space-y-4">
          <RadioGroup
            aria-label="Modo de DPI"
            data-ocid="sensi.dpi.select"
            value={dpiChoice ?? ""}
            onValueChange={(value) => setDpiChoice(value as DpiChoice)}
            className="grid gap-2 sm:grid-cols-2"
          >
            {DPI_OPTIONS.map((option) => {
              const active = option.value === dpiChoice;
              return (
                <Label
                  key={option.value}
                  htmlFor={`sensi-dpi-${option.value}`}
                  data-ocid={`sensi.dpi.${option.value}`}
                  className={cn(
                    "flex min-h-14 cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 transition-fast focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ring",
                    active
                      ? "border-primary bg-primary/15"
                      : "border-border bg-card hover:border-primary/50",
                  )}
                >
                  <RadioGroupItem
                    id={`sensi-dpi-${option.value}`}
                    value={option.value}
                    className="mt-1"
                  />
                  <span className="min-w-0">
                    <span
                      className={cn(
                        "block font-display text-sm font-semibold uppercase tracking-wide",
                        active ? "text-primary" : "text-foreground",
                      )}
                    >
                      {option.label}
                    </span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {option.hint}
                    </span>
                  </span>
                </Label>
              );
            })}
          </RadioGroup>

          {dpiChoice === "with" && (
            <div className="space-y-2">
              <Label htmlFor="sensi-dpi" className="text-sm text-foreground">
                DPI do aparelho
              </Label>
              <Input
                id="sensi-dpi"
                data-ocid="sensi.dpi.input"
                type="number"
                inputMode="numeric"
                min={1}
                value={dpiValue}
                onChange={(event) => setDpiValue(event.target.value)}
                placeholder="Ex.: 480"
                className="h-12 rounded-xl font-mono"
              />
              {dpiValue !== "" && !dpiValid && (
                <p
                  data-ocid="sensi.dpi.error_state"
                  className="text-xs text-destructive"
                >
                  Informe um número de DPI maior que zero.
                </p>
              )}
            </div>
          )}
        </div>
      </TelemetryCard>

      {/* Sensitivity level */}
      <TelemetryCard>
        <TelemetryLabel>3 · Nível da sensi</TelemetryLabel>
        <RadioGroup
          aria-label="Nível da sensibilidade"
          data-ocid="sensi.level.select"
          value={level ?? ""}
          onValueChange={(value) => setLevel(value as LevelChoice)}
          className="grid gap-2 sm:grid-cols-2"
        >
          {LEVEL_OPTIONS.map((option) => {
            const active = option.value === level;
            return (
              <Label
                key={option.value}
                htmlFor={`sensi-level-${option.value}`}
                data-ocid={`sensi.level.${option.value}`}
                className={cn(
                  "flex min-h-14 cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 transition-fast focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ring",
                  active
                    ? "border-primary bg-primary/15"
                    : "border-border bg-card hover:border-primary/50",
                )}
              >
                <RadioGroupItem
                  id={`sensi-level-${option.value}`}
                  value={option.value}
                  className="mt-1"
                />
                <span className="min-w-0">
                  <span
                    className={cn(
                      "block font-display text-sm font-semibold uppercase tracking-wide",
                      active ? "text-primary" : "text-foreground",
                    )}
                  >
                    {option.label}
                  </span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {option.hint}
                  </span>
                </span>
              </Label>
            );
          })}
        </RadioGroup>
      </TelemetryCard>

      {generate.isError && (
        <div
          data-ocid="sensi.error_state"
          role="alert"
          className="flex items-start gap-3 rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          <AlertTriangle
            className="mt-0.5 size-5 shrink-0"
            aria-hidden="true"
          />
          <div>
            <p className="font-semibold">Não foi possível gerar a sensi.</p>
            <p className="text-destructive/90">
              {generate.error instanceof Error && generate.error.message
                ? generate.error.message
                : "Tente novamente em instantes."}
            </p>
          </div>
        </div>
      )}

      <ActionButton
        type="button"
        data-ocid="sensi.generate_button"
        onClick={handleGenerate}
        disabled={!canGenerate}
        aria-busy={generate.isPending}
      >
        {generate.isPending ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="size-5 animate-spin" aria-hidden="true" />
            Gerando sensi...
          </span>
        ) : (
          "Gerar Sensi"
        )}
      </ActionButton>

      {!canGenerate && !generate.isPending && (
        <p
          data-ocid="sensi.hint"
          className="text-center text-xs text-muted-foreground"
        >
          Escolha aparelho, modo de DPI e nível da sensi para liberar o botão.
        </p>
      )}
    </PageShell>
  );
}
