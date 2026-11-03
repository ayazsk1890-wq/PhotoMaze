/**
 * Paper Size Registry & Conversion Utilities (Phase 8)
 *
 * Provides official physical dimensions for ISO A-series,
 * standard photo papers, and US document formats.
 */

import { PaperSizeDefinition, MeasurementUnit } from "@/types/print";

export const STANDARD_PAPER_SIZES: PaperSizeDefinition[] = [
  // ── Standard Office Formats ────────────────────────────────────────────────
  {
    id: "a4",
    name: "A4",
    widthMm: 210,
    heightMm: 297,
    category: "standard",
    description: "210 × 297 mm · Standard international document paper",
  },
  {
    id: "a5",
    name: "A5",
    widthMm: 148,
    heightMm: 210,
    category: "standard",
    description: "148 × 210 mm · Half A4 size, ideal for compact photo sheets",
  },
  {
    id: "a3",
    name: "A3",
    widthMm: 297,
    heightMm: 420,
    category: "standard",
    description: "297 × 420 mm · Double A4 size for high-volume commercial printing",
  },

  // ── Dedicated Photo Papers ────────────────────────────────────────────────
  {
    id: "4x6",
    name: "4 × 6 inches (10 × 15 cm)",
    widthMm: 101.6,
    heightMm: 152.4,
    category: "photo",
    description: "101.6 × 152.4 mm · Most popular home photo paper worldwide",
  },
  {
    id: "5x7",
    name: "5 × 7 inches (13 × 18 cm)",
    widthMm: 127.0,
    heightMm: 177.8,
    category: "photo",
    description: "127 × 177.8 mm · Medium portrait format photo paper",
  },
  {
    id: "6x8",
    name: "6 × 8 inches (15 × 20 cm)",
    widthMm: 152.4,
    heightMm: 203.2,
    category: "photo",
    description: "152.4 × 203.2 mm · Large studio print photo card",
  },

  // ── North American Formats ────────────────────────────────────────────────
  {
    id: "letter",
    name: "US Letter",
    widthMm: 215.9,
    heightMm: 279.4,
    category: "us",
    description: "8.5 × 11 in (215.9 × 279.4 mm) · Standard US office paper",
  },
  {
    id: "legal",
    name: "US Legal",
    widthMm: 215.9,
    heightMm: 355.6,
    category: "us",
    description: "8.5 × 14 in (215.9 × 355.6 mm) · Extended US legal format",
  },

  // ── Custom Format Marker ──────────────────────────────────────────────────
  {
    id: "custom",
    name: "Custom Dimensions",
    widthMm: 210,
    heightMm: 297,
    category: "custom",
    description: "Specify bespoke paper width & height",
  },
];

/**
 * Retrieves a paper size definition by ID. Defaults to A4 if not found.
 */
export function getPaperSizeById(id: string): PaperSizeDefinition {
  const found = STANDARD_PAPER_SIZES.find((p) => p.id === id);
  return found || STANDARD_PAPER_SIZES[0];
}

/**
 * Builds a custom PaperSizeDefinition given dimensions and unit.
 */
export function buildCustomPaperSize(
  width: number,
  height: number,
  unit: MeasurementUnit = "mm"
): PaperSizeDefinition {
  const widthMm = convertUnitToMm(width, unit);
  const heightMm = convertUnitToMm(height, unit);

  return {
    id: "custom",
    name: `Custom (${round2(width)} × ${round2(height)} ${unit})`,
    widthMm,
    heightMm,
    category: "custom",
    description: `${round2(widthMm)} × ${round2(heightMm)} mm bespoke paper sheet`,
  };
}

/**
 * Converts any measurement unit (mm, cm, in) to exact millimeters.
 */
export function convertUnitToMm(value: number, unit: MeasurementUnit): number {
  switch (unit) {
    case "mm":
      return value;
    case "cm":
      return value * 10;
    case "in":
      return value * 25.4;
  }
}

/**
 * Converts millimeters to specified measurement unit.
 */
export function convertMmToUnit(mm: number, unit: MeasurementUnit): number {
  switch (unit) {
    case "mm":
      return mm;
    case "cm":
      return mm / 10;
    case "in":
      return mm / 25.4;
  }
}

function round2(val: number): number {
  return Math.round(val * 100) / 100;
}

