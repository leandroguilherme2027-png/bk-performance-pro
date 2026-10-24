/**
 * Sensitivity result screen (/sensi/resultado).
 *
 * Reads the generated result handed over by the generator through the router
 * state, shows the six Free Fire values plus the DPI that was used, lets the
 * user copy the whole block, and sends them back to the generator keeping the
 * previous choices. When no result is available yet the user is returned to
 * the generator instead of seeing an empty screen.
 */

import type { GeneratedSensitivity } from "@/backend";
import { PageShell } from "@/components/Layout";
import {
  ActionButton,
  SectionHeading,
  StatusBadge,
  TelemetryCard,
  TelemetryLabel,
  TelemetryValue,
} from "@/components/telemetry";
import {
  SENSI_AXES,
  type SensiValues,
  formatSensiText,
  labelDpiMode,
  labelSensitivityType,
} from "@/lib/sensi-engine";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { Check, ClipboardCopy, RotateCcw, TriangleAlert } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

/** Convert the backend bigint values into the engine's numeric shape. */
function toSensiValues(result: GeneratedSensitivity): SensiValues {
  const { values } = result;
  return {
    general: Number(values.general),
    redDot: Number(values.redDot),
    scope2x: Number(values.scope2x),
    scope4x: Number(values.scope4x),
    scopeAWM: Number(values.awmScope),
    lookAround: Number(values.freeLook),
  };
}

/** The DPI actually used: the user's choice, else the backend echo. */
function resolveDpi(
  dpi: number | null | undefined,
  result: GeneratedSensitivity,
): number | null {
  if (dpi !== null && dpi !== undefined) return dpi;
  return result.dpi !== undefined ? Number(result.dpi) : null;
}

export default function SensiResultPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState<string | null>(null);

  const state = location.state;
  const result = state?.result;

  const goToGenerator = useCallback(() => {
    // Forward the previous choices so the generator can restore the form.
    void navigate({
      to: "/sensi",
      state: {
        brand: state?.brand,
        model: state?.model,
        dpiMode: state?.dpiMode,
        dpi: state?.dpi,
        sensitivityType: state?.sensitivityType,
      },
    });
  }, [navigate, state]);

  const handleCopy = useCallback(async () => {
    if (!result) return;
    setCopyError(null);
    const text = formatSensiText(
      toSensiValues(result),
      resolveDpi(state?.dpi, result),
    );
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      setCopyError(
        "Não foi possível copiar automaticamente. Selecione os valores e copie manualmente.",
      );
    }
  }, [result, state?.dpi]);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 4000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  if (!result) {
    return (
      <PageShell>
        <SectionHeading
          title="Nenhuma sensi gerada ainda"
          description="Gere uma sensi para ver os seis valores e o DPI recomendado."
        />
        <TelemetryCard data-ocid="sensi_result.empty_state">
          <div className="flex items-start gap-3">
            <TriangleAlert
              className="mt-0.5 size-5 shrink-0 text-warning"
              aria-hidden="true"
            />
            <div className="space-y-1">
              <p className="font-display text-base font-semibold text-foreground">
                Você ainda não gerou uma sensi
              </p>
              <p className="text-sm text-muted-foreground">
                Volte ao gerador, escolha o aparelho, o DPI e o tipo de sensi e
                toque em GERAR SENSI.
              </p>
            </div>
          </div>
          <ActionButton
            type="button"
            data-ocid="sensi_result.back_to_generator_button"
            onClick={goToGenerator}
            className="mt-4"
          >
            <RotateCcw className="size-5" aria-hidden="true" />
            Voltar para o gerador
          </ActionButton>
        </TelemetryCard>
      </PageShell>
    );
  }

  const values = toSensiValues(result);
  const dpi = resolveDpi(state?.dpi, result);
  const withoutDpi = dpi === null;
  const dpiMode = state?.dpiMode;
  const sensitivityType = state?.sensitivityType;

  return (
    <PageShell>
      <SectionHeading
        title="Sua sensi está pronta"
        description="Confira os seis valores, copie e teste no treino do Free Fire."
      />

      {/* Summary of what was chosen */}
      <TelemetryCard data-ocid="sensi_result.summary_card">
        <TelemetryLabel>Configuração escolhida</TelemetryLabel>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge tone="neutral">
            {state?.brand} {state?.model}
          </StatusBadge>
          {dpiMode && (
            <StatusBadge tone={withoutDpi ? "warning" : "success"}>
              {labelDpiMode(dpiMode)}
            </StatusBadge>
          )}
          {sensitivityType && (
            <StatusBadge tone="neutral">
              Sensi {labelSensitivityType(sensitivityType)}
            </StatusBadge>
          )}
        </div>
      </TelemetryCard>

      {/* Highlighted button number + DPI */}
      <div className="grid gap-4 sm:grid-cols-2">
        <TelemetryCard
          data-ocid="sensi_result.general_card"
          className="border-primary/40"
        >
          <TelemetryLabel>Número do botão (Geral)</TelemetryLabel>
          <TelemetryValue className="text-5xl text-gradient-primary">
            {values.general}
          </TelemetryValue>
          <p className="text-xs text-muted-foreground">
            Este é o valor principal que você ajusta primeiro no jogo.
          </p>
        </TelemetryCard>

        <TelemetryCard
          data-ocid="sensi_result.dpi_card"
          className={withoutDpi ? "border-warning/40" : "border-accent/40"}
        >
          <TelemetryLabel>DPI</TelemetryLabel>
          {withoutDpi ? (
            <>
              <TelemetryValue className="text-3xl text-warning">
                Sem DPI
              </TelemetryValue>
              <p className="text-xs text-muted-foreground">
                Esta sensi foi gerada sem DPI. Use os valores abaixo como estão.
              </p>
            </>
          ) : (
            <>
              <TelemetryValue className="text-5xl text-accent">
                {dpi}
              </TelemetryValue>
              <p className="text-xs text-muted-foreground">
                DPI usado para este aparelho.
              </p>
            </>
          )}
        </TelemetryCard>
      </div>

      {/* The six values */}
      <TelemetryCard data-ocid="sensi_result.values_card">
        <TelemetryLabel>Os seis valores</TelemetryLabel>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {SENSI_AXES.map((axis) => (
            <li
              key={axis.key}
              data-ocid={`sensi_result.value.${axis.key}`}
              className="rounded-xl border border-border bg-muted/30 px-3 py-3"
            >
              <TelemetryLabel className="block">{axis.label}</TelemetryLabel>
              <TelemetryValue className="text-2xl">
                {values[axis.key]}
              </TelemetryValue>
            </li>
          ))}
        </ul>
      </TelemetryCard>

      {/* Copy feedback */}
      {copied && (
        <output
          data-ocid="sensi_result.success_state"
          className="flex items-center gap-2 rounded-xl border border-success/40 bg-success/15 px-4 py-3 text-sm font-medium text-success"
        >
          <Check className="size-4" aria-hidden="true" />
          Sensi copiada! Cole onde precisar.
        </output>
      )}
      {copyError && (
        <div
          role="alert"
          data-ocid="sensi_result.error_state"
          className="rounded-xl border border-destructive/40 bg-destructive/15 px-4 py-3 text-sm font-medium text-destructive"
        >
          {copyError}
        </div>
      )}

      {/* Actions */}
      <div className="grid gap-3 sm:grid-cols-2">
        <ActionButton
          type="button"
          data-ocid="sensi_result.copy_button"
          onClick={() => void handleCopy()}
        >
          <ClipboardCopy className="size-5" aria-hidden="true" />
          Copiar minha sensi
        </ActionButton>
        <ActionButton
          type="button"
          tone="outline"
          data-ocid="sensi_result.regenerate_button"
          onClick={goToGenerator}
        >
          <RotateCcw className="size-5" aria-hidden="true" />
          Gerar outra sensi
        </ActionButton>
      </div>

      {/* Honest notice */}
      <div
        data-ocid="sensi_result.notice"
        className="rounded-xl border border-dashed border-border bg-muted/30 px-4 py-3 text-xs text-muted-foreground"
      >
        Estes valores são um ponto de partida. Teste no modo treino do Free Fire
        e ajuste conforme sua preferência — nenhum ajuste garante capa ou
        ausência de tiros no peito.
      </div>
    </PageShell>
  );
}
