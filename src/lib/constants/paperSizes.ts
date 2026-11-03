export interface PaperSizeSpec {
  id: string;
  name: string;
  widthMm: number;
  heightMm: number;
  widthInches: number;
  heightInches: number;
  widthPx300Dpi: number;
  heightPx300Dpi: number;
}

export const STANDARD_PAPER_SIZES: PaperSizeSpec[] = [
  {
    id: "4x6",
    name: "4 × 6 inches (Standard Photo / 10×15 cm)",
    widthMm: 101.6,
    heightMm: 152.4,
    widthInches: 4,
    heightInches: 6,
    widthPx300Dpi: 1200,
    heightPx300Dpi: 1800,
  },
  {
    id: "5x7",
    name: "5 × 7 inches (13×18 cm)",
    widthMm: 127.0,
    heightMm: 177.8,
    widthInches: 5,
    heightInches: 7,
    widthPx300Dpi: 1500,
    heightPx300Dpi: 2100,
  },
  {
    id: "6x8",
    name: "6 × 8 inches (15×20 cm)",
    widthMm: 152.4,
    heightMm: 203.2,
    widthInches: 6,
    heightInches: 8,
    widthPx300Dpi: 1800,
    heightPx300Dpi: 2400,
  },
  {
    id: "a4",
    name: "A4 (210 × 297 mm)",
    widthMm: 210,
    heightMm: 297,
    widthInches: 8.27,
    heightInches: 11.69,
    widthPx300Dpi: 2480,
    heightPx300Dpi: 3508,
  },
  {
    id: "a5",
    name: "A5 (148 × 210 mm)",
    widthMm: 148,
    heightMm: 210,
    widthInches: 5.83,
    heightInches: 8.27,
    widthPx300Dpi: 1748,
    heightPx300Dpi: 2480,
  },
  {
    id: "letter",
    name: "US Letter (8.5 × 11 inches)",
    widthMm: 215.9,
    heightMm: 279.4,
    widthInches: 8.5,
    heightInches: 11.0,
    widthPx300Dpi: 2550,
    heightPx300Dpi: 3300,
  },
];

