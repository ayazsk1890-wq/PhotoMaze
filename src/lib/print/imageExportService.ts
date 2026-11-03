/**
 * High-Resolution Raster Image Export Service (Phase 8 & Phase 9)
 *
 * Renders print sheets as full-bleed, high-DPI raster images (JPEG & PNG):
 * - Calculates exact pixel dimensions from millimeter specifications and target DPI
 * - Embeds authentic physical resolution metadata (JFIF APP0 for JPEG, pHYs chunk for PNG)
 * - Draws photos at true sub-pixel resolution with crisp image smoothing
 * - Renders cutting guides and boundaries
 * - Provides memory-efficient Blob streaming and cross-platform mobile/desktop downloads
 */

import { PrintLayoutSolution, CuttingGuideStyle } from "@/types/print";
import { mmToPixels } from "./photoDimensionConverter";
import { injectJpegDpi, injectPngDpi } from "../export/dpiMetadata";
import { downloadBlob } from "../export/downloadHelper";

export interface ImageSheetExportOptions {
  solution: PrintLayoutSolution;
  photoImage: HTMLImageElement;
  pageIndex: number;
  dpi: number;
  format: "jpeg" | "png";
  cuttingGuides: CuttingGuideStyle;
  quality?: number; // 0.8 to 1.0 (default 0.96)
}

export interface RenderedSheetImageResult {
  blob: Blob;
  bytes: Uint8Array;
  widthPx: number;
  heightPx: number;
  dpi: number;
  format: "jpeg" | "png";
  sizeBytes: number;
}

/**
 * Renders a single page of the print sheet onto an offscreen canvas at full target DPI.
 */
export function renderPrintSheetToCanvas(options: ImageSheetExportOptions): HTMLCanvasElement {
  const { solution, photoImage, pageIndex, dpi, cuttingGuides } = options;
  const page = solution.pages[pageIndex];

  const canvasWidth = mmToPixels(solution.paperWidthMm, dpi);
  const canvasHeight = mmToPixels(solution.paperHeightMm, dpi);

  const canvas = document.createElement("canvas");
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  // 1. Fill clean white paper background
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  if (!page) return canvas;

  // 2. Render each photo slot
  for (const slot of page.slots) {
    const x = mmToPixels(slot.xMm, dpi);
    const y = mmToPixels(slot.yMm, dpi);
    const w = mmToPixels(slot.widthMm, dpi);
    const h = mmToPixels(slot.heightMm, dpi);

    ctx.drawImage(photoImage, x, y, w, h);

    // Render cutting guides at high resolution
    drawRasterCuttingGuides(ctx, x, y, w, h, cuttingGuides, dpi);
  }

  return canvas;
}

/**
 * Draws cutting guides scaled to target DPI.
 */
function drawRasterCuttingGuides(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  style: CuttingGuideStyle,
  dpi: number
): void {
  if (style === "none") return;

  ctx.save();
  ctx.strokeStyle = "rgba(100, 116, 139, 0.75)";
  const lineWidth = Math.max(1, Math.round(dpi / 300));
  ctx.lineWidth = lineWidth;

  if (style === "solid") {
    ctx.setLineDash([]);
    ctx.strokeRect(x, y, w, h);
  } else if (style === "full-dashed") {
    const dash = [Math.round(dpi / 75), Math.round(dpi / 75)];
    ctx.setLineDash(dash);
    ctx.strokeRect(x, y, w, h);
  } else if (style === "corners") {
    const tickLen = mmToPixels(2.5, dpi);
    ctx.setLineDash([]);

    // Top-Left
    ctx.beginPath();
    ctx.moveTo(x - tickLen, y);
    ctx.lineTo(x, y);
    ctx.lineTo(x, y - tickLen);
    ctx.stroke();

    // Top-Right
    ctx.beginPath();
    ctx.moveTo(x + w + tickLen, y);
    ctx.lineTo(x + w, y);
    ctx.lineTo(x + w, y - tickLen);
    ctx.stroke();

    // Bottom-Left
    ctx.beginPath();
    ctx.moveTo(x - tickLen, y + h);
    ctx.lineTo(x, y + h);
    ctx.lineTo(x, y + h + tickLen);
    ctx.stroke();

    // Bottom-Right
    ctx.beginPath();
    ctx.moveTo(x + w + tickLen, y + h);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x + w, y + h + tickLen);
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Converts a canvas to an authentic DPI-tagged Uint8Array and Blob.
 */
export async function exportPrintSheetPageImage(
  options: ImageSheetExportOptions
): Promise<RenderedSheetImageResult> {
  const canvas = renderPrintSheetToCanvas(options);
  const mimeType = options.format === "png" ? "image/png" : "image/jpeg";
  const quality = options.quality ?? 0.96;

  const rawBytes = await new Promise<Uint8Array>((resolve, reject) => {
    canvas.toBlob(
      async (blob) => {
        if (!blob) {
          reject(new Error("Sheet canvas.toBlob failed"));
          return;
        }
        try {
          const buf = await blob.arrayBuffer();
          resolve(new Uint8Array(buf));
        } catch (err) {
          reject(err);
        }
      },
      mimeType,
      quality
    );
  });

  // Inject authentic DPI metadata
  const taggedBytes =
    options.format === "png"
      ? injectPngDpi(rawBytes, options.dpi)
      : injectJpegDpi(rawBytes, options.dpi);

  const finalBlob = new Blob([taggedBytes as unknown as BlobPart], { type: mimeType });

  return {
    blob: finalBlob,
    bytes: taggedBytes,
    widthPx: canvas.width,
    heightPx: canvas.height,
    dpi: options.dpi,
    format: options.format,
    sizeBytes: taggedBytes.byteLength,
  };
}

/**
 * Exports a print sheet page as a downloadable image file (JPEG or PNG) with embedded DPI metadata.
 * Uses memory-safe Blob downloading and handles mobile/desktop differences.
 */
export async function downloadPrintSheetImage(
  options: ImageSheetExportOptions,
  filename: string
): Promise<RenderedSheetImageResult> {
  const result = await exportPrintSheetPageImage(options);
  await downloadBlob(result.blob, filename);
  return result;
}
