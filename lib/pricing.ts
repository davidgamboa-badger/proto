// =============================
// /lib/pricing.ts
// Centralized pricing + helpers so both pages/components use the same math
// =============================

export type Part = {
  id: string;
  name: string;
  fileName?: string;
  fileSize?: number;
  thumbnailUrl?: string;
  drawingFileName?: string;
  drawingFileSize?: number;
  currentStep: number;
  selections: {
    process: string;
    material: string;
    surfaceFinish: string;
    coating: string;
    quantity: number;
    leadTime: string;
  };
};

export const pricingData = {
  process: {
    cnc: 1.0,
    "3d-printing": 0.7,
    "sheet-metal": 0.6,
  },
  material: {
    "6061": 1.0,
    "7075": 1.2,
    "304-stainless": 1.3,
    "316-stainless": 1.5,
    abs: 0.4,
    pla: 0.3,
    brass: 1.6,
    copper: 1.8,
    titanium: 4.5,
    delrin: 0.8,
    nylon: 0.6,
    peek: 8.0,
  },
  surfaceFinish: {
    "as-machined": 1.0,
    "bead-blast": 1.2,
    brushed: 1.4,
    anodized: 1.8,
    polished: 2.5,
    sandblasted: 1.3,
    tumbled: 1.1,
    passivated: 1.6,
  },
  coating: {
    none: 1.0,
    "clear-anodize": 1.4,
    "black-anodize": 1.6,
    "powder-coat": 1.8,
    "zinc-plate": 1.5,
    "nickel-plate": 2.2,
    "chrome-plate": 2.8,
    "gold-plate": 5.0,
    "teflon-coat": 3.2,
  },
} as const;

export const leadTimeMultipliers: Record<string, number> = {
  "1": 2.5,
  "2": 2.1,
  "3": 1.7,
  "5": 1.3,
  "7": 1.0,
};

export function calculatePartPrice(part: Part) {
  const basePrice = 75;

  const processMultiplier =
    pricingData.process[
      part.selections.process as keyof typeof pricingData.process
    ] ?? 1;
  const materialMultiplier =
    pricingData.material[
      part.selections.material as keyof typeof pricingData.material
    ] ?? 1;
  const finishMultiplier =
    pricingData.surfaceFinish[
      part.selections.surfaceFinish as keyof typeof pricingData.surfaceFinish
    ] ?? 1;
  const coatingMultiplier =
    pricingData.coating[
      part.selections.coating as keyof typeof pricingData.coating
    ] ?? 1;
  const leadTimeMultiplier =
    leadTimeMultipliers[part.selections.leadTime] ?? 1;

  return (
    basePrice *
    processMultiplier *
    materialMultiplier *
    finishMultiplier *
    coatingMultiplier *
    leadTimeMultiplier *
    (part.selections.quantity || 0)
  );
}

export function isPartConfigured(p: Part) {
  return (
    !!p.selections.process &&
    !!p.selections.material &&
    !!p.selections.surfaceFinish &&
    !!p.selections.coating
  );
}

export function subtotalFromParts(parts: Part[]) {
  return parts
    .filter(isPartConfigured)
    .reduce((sum, p) => sum + calculatePartPrice(p), 0);
}