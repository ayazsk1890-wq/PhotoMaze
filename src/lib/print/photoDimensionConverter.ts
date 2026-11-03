/**
 * Photo Dimension Converter & Unit Math (Phase 8)
 *
 * Converts between physical measurement units (mm, cm, in),
 * PDF PostScript points (72 pt/in), and raster pixels at arbitrary DPI.
 */

import { MeasurementUnit } from "@/types/print";

export const MM_PER_INCH = 25.4;
export const POINTS_PER_INCH = 72; // PostScript point standard for PDF

/**
 * Converts millimeters to raster pixel count at specified DPI.
 */
export function mmToPixels(mm: number, dpi: number): number {
  return Math.round((mm / MM_PER_INCH) * dpi);
}

/**
 * Converts raster pixels at specified DPI to millimeters.
 */
export function pixelsToMm(px: number, dpi: number): number {
  return (px / dpi) * MM_PER_INCH;
}

/**
 * Converts millimeters to PDF points (72 pt/inch).
 * 1 mm = 72 / 25.4 = ~2.83464567 points
 */
export function mmToPdfPoints(mm: number): number {
  return (mm / MM_PER_INCH) * POINTS_PER_INCH;
}

/**
 * Converts PDF points to millimeters.
 */
export function pdfPointsToMm(pt: number): number {
  return (pt / POINTS_PER_INCH) * MM_PER_INCH;
}

/**
 * Calculates standard printer-safe hardware margins.
 * Most consumer desktop printers require at least 3.0 to 5.0 mm non-printable margin
 * at paper edges unless borderless photo printing mode is selected.
 */
export function getPrinterSafeMinimumMarginMm(): number {
  return 3.0; // 3 mm safe margin
}

/**
 * Validates whether the photograph dimensions physically fit inside the paper sheet.
 */
export function validatePhotoFitsPaper(
  photoWidthMm: number,
  photoHeightMm: number,
  paperWidthMm: number,
  paperHeightMm: number,
  marginMm: number = 3.0
): { fits: boolean; reason?: string } {
  if (photoWidthMm <= 0 || photoHeightMm <= 0) {
    return { fits: false, reason: "Photo dimensions must be greater than zero." };
  }

  const availWidth = paperWidthMm - marginMm * 2;
  const availHeight = paperHeightMm - marginMm * 2;

  if (photoWidthMm > availWidth || photoHeightMm > availHeight) {
    // Check if rotating 90 degrees fits
    if (photoHeightMm <= availWidth && photoWidthMm <= availHeight) {
      return { fits: true };
    }
    return {
      fits: false,
      reason: `Photo size (${photoWidthMm}×${photoHeightMm} mm) exceeds available printable paper area (${availWidth}×${availHeight} mm).`,
    };
  }

  return { fits: true };
}

