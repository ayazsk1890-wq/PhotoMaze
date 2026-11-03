/**
 * Smart Print Layout Calculation Engine (Phase 8)
 *
 * Computes optimal grid layouts, handles pagination across multiple sheets,
 * automatically selects space-efficient orientations, calculates exact physical
 * millimeter coordinates, and enforces margin & spacing constraints.
 */

import {
  PrintSheetOptions,
  PrintLayoutSolution,
  PageLayoutResult,
  PlacedPhotoSlot,
  PrintMarginConfig,
} from "@/types/print";
import { getPaperSizeById, buildCustomPaperSize } from "./paperSizeRegistry";

export const MAX_REASONABLE_COPIES = 1000; // Protection against extreme resource exhaustion

/**
 * Calculates a single candidate orientation layout.
 */
function evaluateSingleOrientationLayout(
  paperWidthMm: number,
  paperHeightMm: number,
  photoWidthMm: number,
  photoHeightMm: number,
  margins: PrintMarginConfig,
  spacingMm: number,
  copies: number,
  alignment: "center" | "top-left",
  orientationName: "portrait" | "landscape"
): PrintLayoutSolution {
  const availWidth = paperWidthMm - (margins.leftMm + margins.rightMm);
  const availHeight = paperHeightMm - (margins.topMm + margins.bottomMm);

  if (availWidth <= 0 || availHeight <= 0 || photoWidthMm <= 0 || photoHeightMm <= 0) {
    return {
      paperWidthMm,
      paperHeightMm,
      resolvedOrientation: orientationName,
      paperName: `${Math.round(paperWidthMm)}×${Math.round(paperHeightMm)} mm`,
      columns: 0,
      rows: 0,
      capacityPerPage: 0,
      totalCopies: copies,
      totalPages: 0,
      gridWidthMm: 0,
      gridHeightMm: 0,
      offsetXmm: 0,
      offsetYmm: 0,
      margins,
      spacingMm,
      packingEfficiencyPercent: 0,
      pages: [],
      isValid: false,
      validationError: "Printable area too small for margins or photo size.",
    };
  }

  // Calculate maximum columns and rows that fit
  // Each subsequent photo adds (photoDim + spacing).
  // Total width for C columns = C * photoWidth + (C - 1) * spacing
  // Rearranging: C * (photoWidth + spacing) - spacing <= availWidth
  // => C * (photoWidth + spacing) <= availWidth + spacing
  const cols = Math.max(0, Math.floor((availWidth + spacingMm) / (photoWidthMm + spacingMm)));
  const rows = Math.max(0, Math.floor((availHeight + spacingMm) / (photoHeightMm + spacingMm)));
  const capacityPerPage = cols * rows;

  if (capacityPerPage <= 0) {
    return {
      paperWidthMm,
      paperHeightMm,
      resolvedOrientation: orientationName,
      paperName: `${Math.round(paperWidthMm)}×${Math.round(paperHeightMm)} mm`,
      columns: 0,
      rows: 0,
      capacityPerPage: 0,
      totalCopies: copies,
      totalPages: 0,
      gridWidthMm: 0,
      gridHeightMm: 0,
      offsetXmm: 0,
      offsetYmm: 0,
      margins,
      spacingMm,
      packingEfficiencyPercent: 0,
      pages: [],
      isValid: false,
      validationError: `Photo does not fit in available space (${availWidth.toFixed(1)} × ${availHeight.toFixed(1)} mm).`,
    };
  }

  // Calculate actual grid dimensions
  const gridWidthMm = cols * photoWidthMm + (cols - 1) * spacingMm;
  const gridHeightMm = rows * photoHeightMm + (rows - 1) * spacingMm;

  // Offsets based on alignment
  let offsetXmm = margins.leftMm;
  let offsetYmm = margins.topMm;

  if (alignment === "center") {
    offsetXmm += Math.max(0, (availWidth - gridWidthMm) / 2);
    offsetYmm += Math.max(0, (availHeight - gridHeightMm) / 2);
  }

  // Calculate total pages needed for exact copies requested
  const totalPages = Math.ceil(copies / capacityPerPage);

  // Generate page slots
  const pages: PageLayoutResult[] = [];
  let remainingCopies = copies;
  let overallPhotoNumber = 1;

  for (let pageIdx = 0; pageIdx < totalPages; pageIdx++) {
    const slots: PlacedPhotoSlot[] = [];
    const countOnThisPage = Math.min(capacityPerPage, remainingCopies);

    let slotIdx = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (slotIdx >= countOnThisPage) break;

        const xMm = offsetXmm + c * (photoWidthMm + spacingMm);
        const yMm = offsetYmm + r * (photoHeightMm + spacingMm);

        slots.push({
          pageIndex: pageIdx,
          slotIndex: slotIdx,
          photoNumber: overallPhotoNumber++,
          row: r,
          col: c,
          xMm,
          yMm,
          widthMm: photoWidthMm,
          heightMm: photoHeightMm,
        });

        slotIdx++;
      }
      if (slotIdx >= countOnThisPage) break;
    }

    pages.push({
      pageIndex: pageIdx,
      slots,
      photosOnThisPage: countOnThisPage,
    });

    remainingCopies -= countOnThisPage;
  }

  // Space efficiency = (photo area * photos placed) / total paper area
  const singlePhotoArea = photoWidthMm * photoHeightMm;
  const totalPaperArea = paperWidthMm * paperHeightMm * totalPages;
  const packingEfficiencyPercent = Math.min(
    100,
    Math.round(((singlePhotoArea * copies) / totalPaperArea) * 100)
  );

  return {
    paperWidthMm,
    paperHeightMm,
    resolvedOrientation: orientationName,
    paperName: `${Math.round(paperWidthMm)}×${Math.round(paperHeightMm)} mm`,
    columns: cols,
    rows,
    capacityPerPage,
    totalCopies: copies,
    totalPages,
    gridWidthMm,
    gridHeightMm,
    offsetXmm,
    offsetYmm,
    margins,
    spacingMm,
    packingEfficiencyPercent,
    pages,
    isValid: true,
  };
}

/**
 * Main Layout Solver:
 * Accepts user options, resolves paper dimensions, compares portrait and landscape
 * when orientation is "auto", and returns the optimal multi-page layout solution.
 */
export function calculatePrintLayout(options: PrintSheetOptions): PrintLayoutSolution {
  // Validate copy count
  const validCopies = Math.max(1, Math.min(MAX_REASONABLE_COPIES, Math.round(options.copies || 1)));

  // Resolve base paper dimensions
  let baseWidthMm: number;
  let baseHeightMm: number;
  let paperName: string;

  if (options.paperSizeId === "custom" && options.customPaperWidthMm && options.customPaperHeightMm) {
    const custom = buildCustomPaperSize(options.customPaperWidthMm, options.customPaperHeightMm, "mm");
    baseWidthMm = custom.widthMm;
    baseHeightMm = custom.heightMm;
    paperName = custom.name;
  } else {
    const standard = getPaperSizeById(options.paperSizeId);
    baseWidthMm = standard.widthMm;
    baseHeightMm = standard.heightMm;
    paperName = standard.name;
  }

  // Canonicalize paper dimensions so width <= height (portrait standard)
  const canonicalShort = Math.min(baseWidthMm, baseHeightMm);
  const canonicalLong = Math.max(baseWidthMm, baseHeightMm);

  // If orientation is explicitly requested:
  if (options.orientation === "portrait") {
    const solution = evaluateSingleOrientationLayout(
      canonicalShort,
      canonicalLong,
      options.photoWidthMm,
      options.photoHeightMm,
      options.margins,
      options.spacingMm,
      validCopies,
      options.alignment,
      "portrait"
    );
    solution.paperName = `${paperName} (Portrait)`;
    return solution;
  }

  if (options.orientation === "landscape") {
    const solution = evaluateSingleOrientationLayout(
      canonicalLong,
      canonicalShort,
      options.photoWidthMm,
      options.photoHeightMm,
      options.margins,
      options.spacingMm,
      validCopies,
      options.alignment,
      "landscape"
    );
    solution.paperName = `${paperName} (Landscape)`;
    return solution;
  }

  // Auto Orientation Optimization:
  // Compare Portrait vs Landscape and select the layout with:
  // 1. Fewer total pages
  // 2. Higher capacity per page
  // 3. Higher packing efficiency
  const portraitSol = evaluateSingleOrientationLayout(
    canonicalShort,
    canonicalLong,
    options.photoWidthMm,
    options.photoHeightMm,
    options.margins,
    options.spacingMm,
    validCopies,
    options.alignment,
    "portrait"
  );

  const landscapeSol = evaluateSingleOrientationLayout(
    canonicalLong,
    canonicalShort,
    options.photoWidthMm,
    options.photoHeightMm,
    options.margins,
    options.spacingMm,
    validCopies,
    options.alignment,
    "landscape"
  );

  // If one orientation is invalid, pick the valid one
  if (!portraitSol.isValid && landscapeSol.isValid) {
    landscapeSol.paperName = `${paperName} (Landscape - Auto)`;
    return landscapeSol;
  }
  if (portraitSol.isValid && !landscapeSol.isValid) {
    portraitSol.paperName = `${paperName} (Portrait - Auto)`;
    return portraitSol;
  }
  if (!portraitSol.isValid && !landscapeSol.isValid) {
    return portraitSol; // Both fail
  }

  // Comparison logic:
  // Rule A: Minimum total pages (saves paper)
  if (portraitSol.totalPages < landscapeSol.totalPages) {
    portraitSol.paperName = `${paperName} (Portrait - Optimal)`;
    return portraitSol;
  }
  if (landscapeSol.totalPages < portraitSol.totalPages) {
    landscapeSol.paperName = `${paperName} (Landscape - Optimal)`;
    return landscapeSol;
  }

  // Rule B: Higher capacity per page (tighter packing)
  if (portraitSol.capacityPerPage > landscapeSol.capacityPerPage) {
    portraitSol.paperName = `${paperName} (Portrait - Optimal)`;
    return portraitSol;
  }
  if (landscapeSol.capacityPerPage > portraitSol.capacityPerPage) {
    landscapeSol.paperName = `${paperName} (Landscape - Optimal)`;
    return landscapeSol;
  }

  // Rule C: Higher packing efficiency
  if (landscapeSol.packingEfficiencyPercent > portraitSol.packingEfficiencyPercent) {
    landscapeSol.paperName = `${paperName} (Landscape - Optimal)`;
    return landscapeSol;
  }

  // Default to Portrait
  portraitSol.paperName = `${paperName} (Portrait - Optimal)`;
  return portraitSol;
}

