import { DpiMode, FingerMode, PlayStyle, SensitivityType } from "@/backend";
import { describe, expect, it } from "vitest";
import {
  SENSI_AXES,
  SENSI_MAX,
  SENSI_MIN,
  type SensiInput,
  formatSensiText,
  generateSensi,
  labelDpiMode,
  labelFingerMode,
  labelPlayStyle,
  labelSensitivityType,
} from "./sensi-engine";

const baseInput: SensiInput = {
  brand: "Samsung",
  model: "Galaxy A54",
  sensitivityType: SensitivityType.high,
  dpiMode: DpiMode.recommended,
  dpiValue: null,
  playStyle: PlayStyle.balanced,
  fingerMode: FingerMode.three,
};

describe("generateSensi", () => {
  it("is deterministic for the same inputs", () => {
    const first = generateSensi(baseInput);
    const second = generateSensi(baseInput);
    expect(second).toEqual(first);
  });

  it("produces all six values within the Free Fire range", () => {
    const { values } = generateSensi(baseInput);
    for (const axis of SENSI_AXES) {
      const value = values[axis.key];
      expect(Number.isInteger(value)).toBe(true);
      expect(value).toBeGreaterThanOrEqual(SENSI_MIN);
      expect(value).toBeLessThanOrEqual(SENSI_MAX);
    }
  });

  it("orders the axes consistently around the general value", () => {
    const { values } = generateSensi(baseInput);
    expect(values.general).toBeGreaterThan(values.redDot);
    expect(values.redDot).toBeGreaterThan(values.scope2x);
    expect(values.scope2x).toBeGreaterThan(values.scope4x);
    expect(values.scope4x).toBeGreaterThan(values.scopeAWM);
    expect(values.lookAround).toBeGreaterThan(values.general);
  });

  it("recommends 480 DPI in recommended mode", () => {
    const result = generateSensi({
      ...baseInput,
      dpiMode: DpiMode.recommended,
    });
    expect(result.recommendedDpi).toBe(480);
  });

  it("echoes the current DPI in current mode", () => {
    const result = generateSensi({
      ...baseInput,
      dpiMode: DpiMode.current,
      dpiValue: 480,
    });
    expect(result.recommendedDpi).toBe(480);
  });

  it("reports no DPI in withoutDpi mode", () => {
    const result = generateSensi({
      ...baseInput,
      dpiMode: DpiMode.withoutDpi,
      dpiValue: 480,
    });
    expect(result.recommendedDpi).toBeNull();
  });

  it("reports no DPI in current mode when no value is provided", () => {
    const result = generateSensi({
      ...baseInput,
      dpiMode: DpiMode.current,
      dpiValue: null,
    });
    expect(result.recommendedDpi).toBeNull();
  });

  it("raises the whole set for high sensitivity versus low", () => {
    const high = generateSensi({
      ...baseInput,
      sensitivityType: SensitivityType.high,
    });
    const low = generateSensi({
      ...baseInput,
      sensitivityType: SensitivityType.low,
    });
    expect(high.values.general).toBeGreaterThan(low.values.general);
  });

  it("always includes a test-and-adjust rationale", () => {
    const { rationale } = generateSensi(baseInput);
    expect(rationale).toContain("Teste no treino");
  });
});

describe("formatSensiText", () => {
  it("lists the six values and the DPI when present", () => {
    const { values, recommendedDpi } = generateSensi(baseInput);
    const text = formatSensiText(values, recommendedDpi);
    expect(text).toContain(`Geral: ${values.general}`);
    expect(text).toContain(`Ponto vermelho: ${values.redDot}`);
    expect(text).toContain(`Mira 2x: ${values.scope2x}`);
    expect(text).toContain(`Mira 4x: ${values.scope4x}`);
    expect(text).toContain(`Mira AWM: ${values.scopeAWM}`);
    expect(text).toContain(`Olhadinha: ${values.lookAround}`);
    expect(text).toContain(`DPI recomendado: ${recommendedDpi}`);
  });

  it("omits the DPI line when there is no DPI", () => {
    const { values } = generateSensi(baseInput);
    const text = formatSensiText(values, null);
    expect(text).not.toContain("DPI recomendado");
  });
});

describe("labels", () => {
  it("labels every sensitivity type", () => {
    expect(labelSensitivityType(SensitivityType.low)).toBe("Baixa");
    expect(labelSensitivityType(SensitivityType.medium)).toBe("Média");
    expect(labelSensitivityType(SensitivityType.high)).toBe("Alta");
    expect(labelSensitivityType(SensitivityType.custom)).toBe("Personalizada");
  });

  it("labels every DPI mode", () => {
    expect(labelDpiMode(DpiMode.recommended)).toBe("DPI recomendado");
    expect(labelDpiMode(DpiMode.current)).toBe("Meu DPI atual");
    expect(labelDpiMode(DpiMode.withoutDpi)).toBe("Sem DPI");
  });

  it("labels play styles and finger modes", () => {
    expect(labelPlayStyle(PlayStyle.precision)).toBe("Precisão");
    expect(labelPlayStyle(PlayStyle.balanced)).toBe("Equilibrado");
    expect(labelFingerMode(FingerMode.two)).toBe("2");
    expect(labelFingerMode(FingerMode.four)).toBe("4");
  });
});
