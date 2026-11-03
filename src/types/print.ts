/**
 * Print Sheet Generator & Bulk Printing Types (Phase 8)
 */

export type MeasurementUnit = "mm" | "cm" | "in";

export type PaperOrientation = "auto" | "portrait" | "landscape";

export type GridAlignment = "center" | "top-left";

export type CuttingGuideStyle = "none" | "corners" | "full-dashed" | "solid";

export interface PaperSizeDefinition {
  id: string;
  name: string;
  widthMm: number;
  heightMm: number;
  category: "standard" | "photo" | "us" | "custom";
  description: string;
}

export interface PrintMarginConfig {
  topMm: number;
  bottomMm: number;
  leftMm: number;
  rightMm: number;
}

export interface PrintSheetOptions {
  // Photo dimensions
  photoWidthMm: number;
  photoHeightMm: number;
  photoName?: string;

  // Bulk quantity
  copies: number;

  // Paper selection
  paperSizeId: string;
  customPaperWidthMm?: number;
  customPaperHeightMm?: number;
  orientation: PaperOrientation;

  // Spacing & Margins
  margins: PrintMarginConfig;
  spacingMm: number;

  // Rendering & Output
  dpi: 150 | 300 | 600;
  cuttingGuides: CuttingGuideStyle;
  alignment: GridAlignment;
  includeLabels: boolean;
}

export interface PlacedPhotoSlot {
  pageIndex: number;
  slotIndex: number;
  photoNumber: number; // 1-indexed overall photo copy
  row: number;
  col: number;
  xMm: number;
  yMm: number;
  widthMm: number;
  heightMm: number;
}

export interface PageLayoutResult {
  pageIndex: number;
  slots: PlacedPhotoSlot[];
  photosOnThisPage: number;
}

export interface PrintLayoutSolution {
  // Paper specs used
  paperWidthMm: number;
  paperHeightMm: number;
  resolvedOrientation: "portrait" | "landscape";
  paperName: string;

  // Grid math
  columns: number;
  rows: number;
  capacityPerPage: number;
  totalCopies: number;
  totalPages: number;

  // Dimensions & Offsets
  gridWidthMm: number;
  gridHeightMm: number;
  offsetXmm: number;
  offsetYmm: number;
  margins: PrintMarginConfig;
  spacingMm: number;

  // Efficiency telemetry
  packingEfficiencyPercent: number; // space utilized by photos
  pages: PageLayoutResult[];

  // Warnings / Validation
  isValid: boolean;
  validationError?: string;
}

