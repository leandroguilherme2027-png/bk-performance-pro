/**
 * Free Fire sensitivity engine.
 *
 * Pure, deterministic function: the same inputs always produce the same six
 * values. It does NOT discover the "best" sensitivity automatically — it
 * applies a documented, transparent rule set derived from the chosen
 * sensitivity type, DPI mode, play style and finger mode. The user is always
 * told to test and adjust in-game.
 */

import { DpiMode, FingerMode, PlayStyle, SensitivityType } from "@/backend";

/** Free Fire accepts sensitivity values from 0 to 200. */
export const SENSI_MIN = 0;
export const SENSI_MAX = 200;

export interface SensiInput {
  brand: string;
  model: string;
  sensitivityType: SensitivityType;
  dpiMode: DpiMode;
  /** Current DPI when dpiMode is `current`; ignored otherwise. */
  dpiValue: number | null;
  playStyle: PlayStyle;
  fingerMode: FingerMode;
}

export interface SensiValues {
  general: number;
  redDot: number;
  scope2x: number;
  scope4x: number;
  scopeAWM: number;
  lookAround: number;
}

export interface SensiResult {
  values: SensiValues;
  /** Recommended DPI for the chosen mode, or null when DPI is not used. */
  recommendedDpi: number | null;
  /** Human-readable explanation of how the values were derived. */
  rationale: string;
}

/** Base value per sensitivity type — the anchor the modifiers move around. */
const TYPE_BASE: Record<SensitivityType, number> = {
  low: 62,
  medium: 82,
  high: 104,
  custom: 82,
};

/** Per-axis offset from the general value, before style/finger modifiers. */
const AXIS_OFFSET: Record<keyof SensiValues, number> = {
  general: 0,
  redDot: -6,
  scope2x: -10,
  scope4x: -16,
  scopeAWM: -22,
  lookAround: 14,
};

/** Play style shifts the whole set toward control or speed. */
const STYLE_SHIFT: Record<PlayStyle, number> = {
  precision: -10,
  dragScope: -4,
  balanced: 0,
  closeCombat: 8,
  custom: 0,
};

/** Finger mode shifts the set: more fingers means more control is available. */
const FINGER_SHIFT: Record<FingerMode, number> = {
  two: 6,
  three: 2,
  four: -4,
  custom: 0,
};

/** Recommended DPI per DPI mode. */
const DPI_BY_MODE: Record<DpiMode, number> = {
  recommended: 480,
  current: 0,
  withoutDpi: 0,
};

function clamp(value: number): number {
  return Math.max(SENSI_MIN, Math.min(SENSI_MAX, Math.round(value)));
}

/**
 * Build the six Free Fire sensitivity values plus a recommended DPI.
 * Deterministic and side-effect free.
 */
export function generateSensi(input: SensiInput): SensiResult {
  const base = TYPE_BASE[input.sensitivityType];
  const shift = STYLE_SHIFT[input.playStyle] + FINGER_SHIFT[input.fingerMode];
  const anchor = base + shift;

  const values: SensiValues = {
    general: clamp(anchor + AXIS_OFFSET.general),
    redDot: clamp(anchor + AXIS_OFFSET.redDot),
    scope2x: clamp(anchor + AXIS_OFFSET.scope2x),
    scope4x: clamp(anchor + AXIS_OFFSET.scope4x),
    scopeAWM: clamp(anchor + AXIS_OFFSET.scopeAWM),
    lookAround: clamp(anchor + AXIS_OFFSET.lookAround),
  };

  let recommendedDpi: number | null = null;
  if (input.dpiMode === "recommended") {
    recommendedDpi = DPI_BY_MODE.recommended;
  } else if (input.dpiMode === "current") {
    recommendedDpi =
      input.dpiValue !== null && Number.isFinite(input.dpiValue)
        ? Math.round(input.dpiValue)
        : null;
  }

  const rationale = buildRationale(input, recommendedDpi);

  return { values, recommendedDpi, rationale };
}

function buildRationale(
  input: SensiInput,
  recommendedDpi: number | null,
): string {
  const parts: string[] = [];
  parts.push(`Base ${labelSensitivityType(input.sensitivityType)}`);
  parts.push(`estilo ${labelPlayStyle(input.playStyle)}`);
  parts.push(`${labelFingerMode(input.fingerMode)} dedos`);
  if (recommendedDpi !== null) {
    parts.push(`DPI ${recommendedDpi}`);
  } else {
    parts.push("sem DPI definido");
  }
  return `${parts.join(" · ")}. Teste no treino e ajuste conforme sua preferência.`;
}

/** Copy-ready text block for the six values. */
export function formatSensiText(
  values: SensiValues,
  recommendedDpi: number | null,
): string {
  const lines = [
    "SENSI FREE FIRE — BK PERFORMANCE PRO",
    `Geral: ${values.general}`,
    `Ponto vermelho: ${values.redDot}`,
    `Mira 2x: ${values.scope2x}`,
    `Mira 4x: ${values.scope4x}`,
    `Mira AWM: ${values.scopeAWM}`,
    `Olhadinha: ${values.lookAround}`,
  ];
  if (recommendedDpi !== null) {
    lines.push(`DPI recomendado: ${recommendedDpi}`);
  }
  return lines.join("\n");
}

export function labelSensitivityType(type: SensitivityType): string {
  const labels: Record<SensitivityType, string> = {
    [SensitivityType.low]: "Baixa",
    [SensitivityType.medium]: "Média",
    [SensitivityType.high]: "Alta",
    [SensitivityType.custom]: "Personalizada",
  };
  return labels[type] ?? "Personalizada";
}

export function labelPlayStyle(style: PlayStyle): string {
  const labels: Record<PlayStyle, string> = {
    [PlayStyle.precision]: "Precisão",
    [PlayStyle.closeCombat]: "Combate próximo",
    [PlayStyle.dragScope]: "Arrastar mira",
    [PlayStyle.balanced]: "Equilibrado",
    [PlayStyle.custom]: "Personalizado",
  };
  return labels[style] ?? "Personalizado";
}

export function labelFingerMode(mode: FingerMode): string {
  const labels: Record<FingerMode, string> = {
    [FingerMode.two]: "2",
    [FingerMode.three]: "3",
    [FingerMode.four]: "4",
    [FingerMode.custom]: "Personalizado",
  };
  return labels[mode] ?? "Personalizado";
}

export function labelDpiMode(mode: DpiMode): string {
  const labels: Record<DpiMode, string> = {
    [DpiMode.recommended]: "DPI recomendado",
    [DpiMode.current]: "Meu DPI atual",
    [DpiMode.withoutDpi]: "Sem DPI",
  };
  return labels[mode] ?? "Sem DPI";
}

/** Ordered axis labels for rendering the six values consistently. */
export const SENSI_AXES: Array<{ key: keyof SensiValues; label: string }> = [
  { key: "general", label: "Geral" },
  { key: "redDot", label: "Ponto vermelho" },
  { key: "scope2x", label: "Mira 2x" },
  { key: "scope4x", label: "Mira 4x" },
  { key: "scopeAWM", label: "Mira AWM" },
  { key: "lookAround", label: "Olhadinha" },
];
