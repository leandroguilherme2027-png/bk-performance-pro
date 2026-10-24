import { describe, expect, it } from "vitest";
import {
  DEVICE_BRANDS,
  findBrand,
  requiresManualModel,
  resolveModel,
  searchModels,
} from "./device-catalog";

describe("device catalog", () => {
  it("exposes Samsung with the Galaxy A54 model", () => {
    const samsung = findBrand("samsung");
    expect(samsung?.name).toBe("Samsung");
    expect(samsung?.models).toContain("Galaxy A54");
  });

  it("returns undefined for an unknown brand id", () => {
    expect(findBrand("nao-existe")).toBeUndefined();
  });

  it("returns all models for an empty query", () => {
    const samsung = findBrand("samsung");
    expect(searchModels("samsung", "")).toEqual(samsung?.models);
  });

  it("searches models case-insensitively", () => {
    const results = searchModels("samsung", "a54");
    expect(results).toContain("Galaxy A54");
  });

  it("returns no models for an unknown brand", () => {
    expect(searchModels("nao-existe", "a54")).toEqual([]);
  });

  it("prefers the manual model over the selected one", () => {
    expect(resolveModel("Galaxy A54", "Meu Aparelho")).toBe("Meu Aparelho");
  });

  it("falls back to the selected model when manual entry is blank", () => {
    expect(resolveModel("Galaxy A54", "   ")).toBe("Galaxy A54");
  });

  it("requires manual entry for a brand with no preset models", () => {
    expect(requiresManualModel("outras")).toBe(true);
    expect(requiresManualModel("samsung")).toBe(false);
  });

  it("keeps every brand id unique", () => {
    const ids = DEVICE_BRANDS.map((brand) => brand.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
