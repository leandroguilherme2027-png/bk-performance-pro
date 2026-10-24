/**
 * Performance monitor screen.
 *
 * The monitor starts OFF. Pressing ATIVAR MONITOR mounts the live telemetry
 * reader, which refreshes FPS, battery, RAM and storage on its own while the
 * screen stays open. DESATIVAR MONITOR unmounts the reader and returns the
 * screen to its initial state. Metrics the browser cannot provide are shown as
 * "Dado não disponível neste dispositivo" with an explanation — never invented.
 */

import { PageShell } from "@/components/Layout";
import {
  ActionButton,
  SectionHeading,
  StatusBadge,
  TelemetryCard,
  TelemetryLabel,
  TelemetryValue,
  UnavailableState,
} from "@/components/telemetry";
import {
  type DeviceMetrics,
  type MetricReading,
  formatBytes,
  useDeviceMetrics,
} from "@/hooks/use-device-metrics";
import {
  Activity,
  BatteryCharging,
  Flame,
  HardDrive,
  MemoryStick,
} from "lucide-react";
import { useState } from "react";

type HealthTone = "success" | "warning" | "destructive" | "neutral";

interface HealthAssessment {
  tone: HealthTone;
  label: string;
  summary: string;
  alerts: string[];
  recommendations: string[];
}

const UNAVAILABLE_REASON = "Dado não disponível neste dispositivo";

/** Compute the device health state from the metrics that are actually available. */
function assessHealth(metrics: DeviceMetrics): HealthAssessment {
  const alerts: string[] = [];
  const recommendations: string[] = [];
  let score = 0;
  let signals = 0;

  const { battery, memory, storage, fps } = metrics;

  if (battery.available && battery.value) {
    signals += 1;
    const { level, charging } = battery.value;
    if (level <= 15 && !charging) {
      score += 2;
      alerts.push(
        `Bateria em ${level}% e sem carregador. O desempenho cai quando o aparelho entra em economia de energia.`,
      );
      recommendations.push(
        "Conecte o carregador ou reduza o brilho e feche apps em segundo plano antes de jogar.",
      );
    } else if (level <= 30 && !charging) {
      score += 1;
      alerts.push(`Bateria em ${level}% sem carregador.`);
      recommendations.push(
        "Carregue o aparelho antes de partidas longas para evitar queda de FPS.",
      );
    }
  }

  if (memory.available && memory.value) {
    signals += 1;
    const gb = memory.value.deviceMemoryGb;
    if (gb <= 2) {
      score += 2;
      alerts.push(
        `Apenas ${gb} GB de memória declarados pelo navegador. Pouca RAM limita o desempenho em partidas longas.`,
      );
      recommendations.push(
        "Feche apps em segundo plano e evite alternar entre jogos durante a partida.",
      );
    } else if (gb <= 4) {
      score += 1;
      recommendations.push(
        "Com 4 GB de RAM, mantenha apenas o Free Fire aberto para preservar o FPS.",
      );
    }
  }

  if (storage.available && storage.value) {
    signals += 1;
    const { usageBytes, quotaBytes } = storage.value;
    const usedRatio = quotaBytes > 0 ? usageBytes / quotaBytes : 0;
    if (usedRatio >= 0.9) {
      score += 2;
      alerts.push(
        `Armazenamento quase cheio (${Math.round(usedRatio * 100)}% da cota do navegador em uso).`,
      );
      recommendations.push(
        "Libere espaço no aparelho: armazenamento cheio causa travamentos e engasgos.",
      );
    } else if (usedRatio >= 0.75) {
      score += 1;
      recommendations.push(
        "O armazenamento está ficando cheio. Libere espaço antes de atualizar o jogo.",
      );
    }
  }

  if (fps.available && fps.value) {
    signals += 1;
    const value = fps.value.fps;
    if (value < 30) {
      score += 2;
      alerts.push(
        `FPS medido em ${value}. Abaixo de 30 indica travamento perceptível.`,
      );
      recommendations.push(
        "Reduza a qualidade gráfica no jogo e feche apps em segundo plano.",
      );
    } else if (value < 45) {
      score += 1;
      recommendations.push(
        "FPS entre 30 e 45. Ajuste os gráficos para ganhar fluidez.",
      );
    }
  }

  if (signals === 0) {
    return {
      tone: "neutral",
      label: "Sem dados",
      summary:
        "Este navegador não expõe nenhuma métrica de desempenho. Nenhum número é inventado.",
      alerts: [],
      recommendations: [
        "Abra o app em um navegador compatível com as APIs de bateria, memória e armazenamento para ver o estado do aparelho.",
      ],
    };
  }

  if (score >= 3) {
    return {
      tone: "destructive",
      label: "Crítico",
      summary:
        "Os dados disponíveis indicam risco de travamento e queda de desempenho.",
      alerts,
      recommendations,
    };
  }
  if (score >= 1) {
    return {
      tone: "warning",
      label: "Atenção",
      summary: "Os dados disponíveis pedem ajustes antes de entrar em partida.",
      alerts,
      recommendations,
    };
  }
  return {
    tone: "success",
    label: "Bom",
    summary: "Os dados disponíveis indicam um aparelho pronto para jogar.",
    alerts,
    recommendations,
  };
}

/** A single metric card that renders its value or an explicit unavailable state. */
function MetricCard({
  label,
  icon: Icon,
  reading,
  value,
  detail,
  badge,
  ocid,
}: {
  label: string;
  icon: typeof Activity;
  reading: MetricReading<unknown>;
  value?: string;
  detail?: string;
  badge?: { tone: HealthTone; text: string };
  ocid: string;
}) {
  return (
    <TelemetryCard data-ocid={ocid}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Icon className="size-4 text-primary" aria-hidden="true" />
          <TelemetryLabel>{label}</TelemetryLabel>
        </div>
        {badge && <StatusBadge tone={badge.tone}>{badge.text}</StatusBadge>}
      </div>
      {reading.available && value ? (
        <div className="space-y-1">
          <TelemetryValue>{value}</TelemetryValue>
          {detail && <p className="text-xs text-muted-foreground">{detail}</p>}
        </div>
      ) : (
        <UnavailableState
          reason={reading.reason ?? UNAVAILABLE_REASON}
          className="mt-1"
        />
      )}
    </TelemetryCard>
  );
}

/** Live telemetry reader — mounted only while the monitor is on. */
function LiveMonitor() {
  const metrics = useDeviceMetrics();
  const health = assessHealth(metrics);

  const battery = metrics.battery;
  const memory = metrics.memory;
  const storage = metrics.storage;
  const fps = metrics.fps;

  const batteryBadge =
    battery.available && battery.value
      ? battery.value.level <= 20 && !battery.value.charging
        ? { tone: "destructive" as HealthTone, text: "Baixa" }
        : battery.value.charging
          ? { tone: "success" as HealthTone, text: "Carregando" }
          : { tone: "neutral" as HealthTone, text: "Na bateria" }
      : undefined;

  const fpsBadge =
    fps.available && fps.value
      ? fps.value.fps < 30
        ? { tone: "destructive" as HealthTone, text: "Baixo" }
        : fps.value.fps < 45
          ? { tone: "warning" as HealthTone, text: "Instável" }
          : { tone: "success" as HealthTone, text: "Fluido" }
      : undefined;

  const storageBadge =
    storage.available && storage.value
      ? storage.value.quotaBytes > 0 &&
        storage.value.usageBytes / storage.value.quotaBytes >= 0.9
        ? { tone: "destructive" as HealthTone, text: "Cheio" }
        : storage.value.quotaBytes > 0 &&
            storage.value.usageBytes / storage.value.quotaBytes >= 0.75
          ? { tone: "warning" as HealthTone, text: "Atenção" }
          : { tone: "success" as HealthTone, text: "Livre" }
      : undefined;

  const memoryBadge =
    memory.available && memory.value
      ? memory.value.deviceMemoryGb <= 2
        ? { tone: "destructive" as HealthTone, text: "Baixa" }
        : memory.value.deviceMemoryGb <= 4
          ? { tone: "warning" as HealthTone, text: "Limitada" }
          : { tone: "success" as HealthTone, text: "Ok" }
      : undefined;

  return (
    <div className="space-y-6" data-ocid="monitor.live_panel">
      <TelemetryCard data-ocid="monitor.health_card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Activity className="size-4 text-primary" aria-hidden="true" />
            <TelemetryLabel>Estado do aparelho</TelemetryLabel>
          </div>
          <span data-ocid="monitor.health_badge">
            <StatusBadge tone={health.tone}>{health.label}</StatusBadge>
          </span>
        </div>
        <p className="text-sm text-muted-foreground">{health.summary}</p>
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <span
            aria-hidden="true"
            className="relative flex size-2 rounded-full bg-primary"
          >
            <span className="absolute inset-0 animate-pulse-ring rounded-full bg-primary" />
          </span>
          Leitura automática ativa enquanto esta tela estiver aberta.
        </p>
      </TelemetryCard>

      <div className="grid gap-4 sm:grid-cols-2">
        <MetricCard
          label="FPS"
          icon={Activity}
          reading={fps}
          value={fps.value ? `${fps.value.fps}` : undefined}
          detail="Quadros por segundo medidos em tempo real"
          badge={fpsBadge}
          ocid="monitor.fps_card"
        />
        <MetricCard
          label="Bateria"
          icon={BatteryCharging}
          reading={battery}
          value={battery.value ? `${battery.value.level}%` : undefined}
          detail={
            battery.value
              ? battery.value.charging
                ? "Carregando"
                : "Descarregando"
              : undefined
          }
          badge={batteryBadge}
          ocid="monitor.battery_card"
        />
        <MetricCard
          label="RAM"
          icon={MemoryStick}
          reading={memory}
          value={memory.value ? `${memory.value.deviceMemoryGb} GB` : undefined}
          detail="Memória declarada pelo navegador"
          badge={memoryBadge}
          ocid="monitor.memory_card"
        />
        <MetricCard
          label="Armazenamento"
          icon={HardDrive}
          reading={storage}
          value={
            storage.value
              ? `${formatBytes(storage.value.usageBytes)} / ${formatBytes(storage.value.quotaBytes)}`
              : undefined
          }
          detail="Uso da cota de armazenamento do navegador"
          badge={storageBadge}
          ocid="monitor.storage_card"
        />
      </div>

      <TelemetryCard data-ocid="monitor.alerts_card">
        <div className="flex items-center gap-2">
          <Flame className="size-4 text-warning" aria-hidden="true" />
          <TelemetryLabel>
            Alertas de aquecimento e recomendações
          </TelemetryLabel>
        </div>
        {health.alerts.length === 0 && health.recommendations.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhum alerta no momento. Continue monitorando durante a partida
            para detectar aquecimento.
          </p>
        ) : (
          <div className="space-y-3">
            {health.alerts.length > 0 && (
              <ul className="space-y-2" data-ocid="monitor.alerts_list">
                {health.alerts.map((alert) => (
                  <li
                    key={alert}
                    className="flex items-start gap-2 rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-foreground"
                  >
                    <Flame
                      className="mt-0.5 size-4 shrink-0 text-destructive"
                      aria-hidden="true"
                    />
                    <span>{alert}</span>
                  </li>
                ))}
              </ul>
            )}
            {health.recommendations.length > 0 && (
              <ul
                className="space-y-2"
                data-ocid="monitor.recommendations_list"
              >
                {health.recommendations.map((tip) => (
                  <li
                    key={tip}
                    className="flex items-start gap-2 rounded-xl border border-border bg-muted/30 px-3 py-2 text-sm text-muted-foreground"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent"
                    />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </TelemetryCard>
    </div>
  );
}

export default function MonitorPage() {
  const [monitoring, setMonitoring] = useState(false);

  return (
    <PageShell>
      <SectionHeading
        title="Monitor de desempenho"
        description="Acompanhe FPS, bateria, RAM e armazenamento em tempo real e receba alertas de aquecimento."
      />

      {!monitoring ? (
        <TelemetryCard
          data-ocid="monitor.off_panel"
          className="items-center text-center"
        >
          <div className="flex flex-col items-center gap-3 py-2">
            <span
              aria-hidden="true"
              className="flex size-14 items-center justify-center rounded-full border border-border bg-muted/40"
            >
              <Activity className="size-6 text-muted-foreground" />
            </span>
            <TelemetryLabel>Monitor desativado</TelemetryLabel>
            <p className="max-w-md text-sm text-muted-foreground">
              Ative o monitor para começar a ler os indicadores do aparelho.
              Nada é medido enquanto o monitor estiver desligado.
            </p>
            <ActionButton
              type="button"
              data-ocid="monitor.activate_button"
              onClick={() => setMonitoring(true)}
              className="mt-1 max-w-sm"
            >
              Ativar monitor
            </ActionButton>
          </div>
        </TelemetryCard>
      ) : (
        <div className="space-y-6">
          <LiveMonitor />
          <ActionButton
            type="button"
            tone="outline"
            data-ocid="monitor.deactivate_button"
            onClick={() => setMonitoring(false)}
            className="max-w-sm"
          >
            Desativar monitor
          </ActionButton>
        </div>
      )}
    </PageShell>
  );
}
