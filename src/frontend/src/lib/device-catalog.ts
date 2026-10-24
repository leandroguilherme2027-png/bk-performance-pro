/**
 * Device catalog for the sensitivity generator.
 *
 * The web platform cannot read the installed device model, so the user picks
 * their brand and model manually (or types a model that is not listed). This
 * module is pure data plus lookup helpers — no device access, no guessing.
 */

export interface DeviceBrand {
  /** Stable identifier used in saved profiles. */
  id: string;
  /** Display name shown in the brand picker. */
  name: string;
  /** Models offered for this brand, in display order. */
  models: string[];
}

export const DEVICE_BRANDS: DeviceBrand[] = [
  {
    id: "samsung",
    name: "Samsung",
    models: [
      "Galaxy A13",
      "Galaxy A12",
      "Galaxy A14",
      "Galaxy A15",
      "Galaxy A24",
      "Galaxy A34",
      "Galaxy A54",
      "Galaxy M13",
      "Galaxy M23",
      "Galaxy S21",
      "Galaxy S22",
      "Galaxy S23",
      "Galaxy S24",
      "Galaxy Note 20",
    ],
  },
  {
    id: "xiaomi",
    name: "Xiaomi",
    models: [
      "Redmi Note 10",
      "Redmi Note 11",
      "Redmi Note 12",
      "Redmi Note 13",
      "Mi 11",
      "Mi 12",
      "Xiaomi 13",
      "Xiaomi 14",
      "Poco X3",
      "Poco X5",
    ],
  },
  {
    id: "redmi",
    name: "Redmi",
    models: [
      "Redmi 9",
      "Redmi 9A",
      "Redmi 10",
      "Redmi 10A",
      "Redmi 12",
      "Redmi 12C",
      "Redmi 13C",
      "Redmi Note 8",
      "Redmi Note 9",
      "Redmi Note 10 Pro",
      "Redmi Note 11 Pro",
      "Redmi Note 12 Pro",
    ],
  },
  {
    id: "motorola",
    name: "Motorola",
    models: [
      "Moto E7",
      "Moto E13",
      "Moto E22",
      "Moto G9",
      "Moto G20",
      "Moto G22",
      "Moto G31",
      "Moto G32",
      "Moto G52",
      "Moto G54",
      "Moto G73",
      "Edge 30",
      "Edge 40",
    ],
  },
  {
    id: "realme",
    name: "Realme",
    models: [
      "C21",
      "C25",
      "C33",
      "C35",
      "C53",
      "C55",
      "Narzo 50",
      "Narzo 60",
      "Realme 8",
      "Realme 9",
      "Realme 10",
      "Realme 11",
    ],
  },
  {
    id: "poco",
    name: "POCO",
    models: [
      "POCO M3",
      "POCO M4",
      "POCO M5",
      "POCO M6",
      "POCO X3 Pro",
      "POCO X4 Pro",
      "POCO X5 Pro",
      "POCO X6",
      "POCO F3",
      "POCO F4",
      "POCO F5",
    ],
  },
  {
    id: "asus",
    name: "ASUS",
    models: [
      "Zenfone 8",
      "Zenfone 9",
      "Zenfone 10",
      "ROG Phone 5",
      "ROG Phone 6",
      "ROG Phone 7",
      "ROG Phone 8",
    ],
  },
  {
    id: "infinix",
    name: "Infinix",
    models: [
      "Hot 10",
      "Hot 11",
      "Hot 12",
      "Hot 20",
      "Hot 30",
      "Note 10",
      "Note 11",
      "Note 12",
      "Note 30",
      "Zero 5G",
    ],
  },
  {
    id: "tecno",
    name: "Tecno",
    models: [
      "Spark 7",
      "Spark 8",
      "Spark 9",
      "Spark 10",
      "Camon 17",
      "Camon 18",
      "Camon 19",
      "Camon 20",
      "Pova 3",
      "Pova 4",
    ],
  },
  {
    id: "outras",
    name: "Outras marcas",
    models: [],
  },
];

/** Find a brand by its stable id. */
export function findBrand(brandId: string): DeviceBrand | undefined {
  return DEVICE_BRANDS.find((brand) => brand.id === brandId);
}

/** Case-insensitive model search within a brand. Empty query returns all models. */
export function searchModels(brandId: string, query: string): string[] {
  const brand = findBrand(brandId);
  if (!brand) return [];
  const trimmed = query.trim().toLowerCase();
  if (trimmed === "") return brand.models;
  return brand.models.filter((model) => model.toLowerCase().includes(trimmed));
}

/**
 * Resolve the model string to store in a profile. Falls back to the manual
 * entry when the user typed a model that is not in the catalog.
 */
export function resolveModel(
  selectedModel: string,
  manualModel: string,
): string {
  const manual = manualModel.trim();
  if (manual !== "") return manual;
  return selectedModel.trim();
}

/** True when the brand has no preset models and requires manual entry. */
export function requiresManualModel(brandId: string): boolean {
  const brand = findBrand(brandId);
  return !brand || brand.models.length === 0;
}
