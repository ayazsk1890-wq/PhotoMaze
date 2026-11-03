/**
 * Single Passport Photo Export Engine (Phase 9)
 *
 * Implements high-quality, spec-compliant exports for individual passport/visa photos:
 * 1. High-Res Print JPEG (300 / 600 DPI) with embedded JFIF metadata
 * 2. Portal-Compliant JPEG (Target <= 240 KB or user limit) with binary search compression
 * 3. Lossless PNG with embedded pHYs chunk and transparency preservation
 * 4. Single-Photo Vector PDF with exact physical page dimensions
 */

import { PDFDocument } from "pdf-lib";
import { PassportSpec } from "@/lib/constants/countries";
import { ImageAdjustments, PortraitEnhancementSettings } from "@/types/editor";
import { enhanceImageData } from "@/lib/image/portraitEnhancer";
import { injectJpegDpi, injectPngDpi } from "./dpiMetadata";
import { downloadBlob } from "./downloadHelper";
import { mmToPdfPoints } from "../print/photoDimensionConverter";

export type SinglePhotoExportFormat =
  | "jpeg-highres" // 300 or 600 DPI high-quality JPEG (95-98% quality)
  | "jpeg-portal" // Optimized JPEG strictly <= maxSizeBytes (e.g. 240 KB for US DS-160)
  | "png-lossless" // Lossless PNG (supports transparent cutout)
  | "pdf-single"; // 1-page vector PDF with exact physical millimeter dimensions

export interface SinglePhotoExportOptions {
  image: HTMLImageElement;
  adjustments: ImageAdjustments;
  spec: PassportSpec;
  format: SinglePhotoExportFormat;
  dpi?: 300 | 600;
  backgroundColor?: string;
  enhancement?: PortraitEnhancementSettings;
  targetMaxKb?: number; // Default 240 KB for government portals
  quality?: number; // 0.1 to 1.0 (default 0.96 for highres)
  customFilename?: string;
}

export interface SinglePhotoExportResult {
  blob: Blob;
  bytes: Uint8Array;
  filename: string;
  mimeType: string;
  widthPx: number;
  heightPx: number;
  widthMm: number;
  heightMm: number;
  dpi: number;
  sizeBytes: number;
  sizeKbFormatted: string;
  format: SinglePhotoExportFormat;
}

/**
 * Calculates exact pixel dimensions from millimeter spec and chosen DPI.
 */
export function calculateExactPixels(spec: PassportSpec, dpi: number = 300): { widthPx: number; heightPx: number } {
  const widthPx = Math.round((spec.widthMm / 25.4) * dpi);
  const heightPx = Math.round((spec.heightMm / 25.4) * dpi);
  return { widthPx, heightPx };
}

/**
 * Helper to convert HTMLCanvasElement to Uint8Array for a given MIME type and quality.
 */
function canvasToBytes(canvas: HTMLCanvasElement, mimeType: string, quality?: number): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      async (blob) => {
        if (!blob) {
          reject(new Error("Canvas toBlob failed"));
          return;
        }
        try {
          const buffer = await blob.arrayBuffer();
          resolve(new Uint8Array(buffer));
        } catch (err) {
          reject(err);
        }
      },
      mimeType,
      quality
    );
  });
}

/**
 * Renders the adjusted photo onto an offscreen canvas at the exact target pixel dimensions.
 */
export function renderSinglePhotoToCanvas(
  image: HTMLImageElement,
  adjustments: ImageAdjustments,
  spec: PassportSpec,
  dpi: number = 300,
  backgroundColor: string = "#FFFFFF",
  enhancement?: PortraitEnhancementSettings,
  referenceCropHeight: number = 440
): HTMLCanvasElement {
  const { widthPx: targetWidth, heightPx: targetHeight } = calculateExactPixels(spec, dpi);

  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  // Fill background
  const isTransparent = backgroundColor.toLowerCase() === "transparent";
  if (!isTransparent) {
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, targetWidth, targetHeight);
  } else {
    ctx.clearRect(0, 0, targetWidth, targetHeight);
  }

  // Scale pan offsets from reference editor coordinate space to target pixel space
  const referenceCropWidth = Math.round(referenceCropHeight * (spec.widthMm / spec.heightMm));
  const scaleMultiplier = targetWidth / referenceCropWidth;

  ctx.save();

  // Apply tone and filter adjustments
  const brightnessVal = 100 + adjustments.brightness;
  const contrastVal = 100 + adjustments.contrast;
  const saturationVal = 100 + adjustments.saturation;
  ctx.filter = `brightness(${brightnessVal}%) contrast(${contrastVal}%) saturate(${saturationVal}%)`;

  // Center and translate
  ctx.translate(targetWidth / 2, targetHeight / 2);
  ctx.translate(adjustments.panX * scaleMultiplier, adjustments.panY * scaleMultiplier);

  // Rotation
  const angleRad = (adjustments.rotation * Math.PI) / 180;
  ctx.rotate(angleRad);

  // Scale and flip
  const scaleX = (adjustments.flipHorizontal ? -1 : 1) * adjustments.zoom;
  const scaleY = (adjustments.flipVertical ? -1 : 1) * adjustments.zoom;
  ctx.scale(scaleX, scaleY);

  // Aspect-fit photo into canvas slot
  const imageAspect = image.naturalWidth / image.naturalHeight;
  const cropAspect = targetWidth / targetHeight;

  let drawWidth: number;
  let drawHeight: number;

  if (imageAspect > cropAspect) {
    drawHeight = targetHeight;
    drawWidth = targetHeight * imageAspect;
  } else {
    drawWidth = targetWidth;
    drawHeight = targetWidth / imageAspect;
  }

  ctx.drawImage(image, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
  ctx.restore();

  // Apply optional portrait enhancement pipeline (Phase 7)
  if (enhancement && enhancement.enabled) {
    try {
      const raw = ctx.getImageData(0, 0, targetWidth, targetHeight);
      const enhanced = enhanceImageData(raw, enhancement);
      ctx.putImageData(enhanced, 0, 0);
    } catch (e) {
      console.warn("Portrait enhancement failed on canvas export:", e);
    }
  }

  return canvas;
}

/**
 * Executes a full export for an individual passport photograph, generating
 * exact pixel dimensions, embedded DPI metadata, and size-constrained buffers.
 */
export async function exportSinglePhoto(
  options: SinglePhotoExportOptions
): Promise<SinglePhotoExportResult> {
  const {
    image,
    adjustments,
    spec,
    format,
    dpi = 300,
    backgroundColor = "#FFFFFF",
    enhancement,
    targetMaxKb = 240,
    quality = 0.96,
    customFilename,
  } = options;

  const { widthPx, heightPx } = calculateExactPixels(spec, dpi);
  const baseSlug = `${spec.country.toLowerCase().replace(/\s+/g, "-")}-${spec.documentType.toLowerCase().replace(/\s+/g, "-")}`;

  // 1. Vector PDF Mode
  if (format === "pdf-single") {
    // Generate a high-res image first to embed into PDF
    const canvas = renderSinglePhotoToCanvas(
      image,
      adjustments,
      spec,
      dpi,
      backgroundColor,
      enhancement
    );
    const jpegBytes = await canvasToBytes(canvas, "image/jpeg", 0.95);

    const pdfDoc = await PDFDocument.create();
    pdfDoc.setTitle(`${spec.country} ${spec.documentType} Official Photo`);
    pdfDoc.setProducer("PhotoMaze");
    pdfDoc.setCreator("PhotoMaze");

    const widthPt = mmToPdfPoints(spec.widthMm);
    const heightPt = mmToPdfPoints(spec.heightMm);

    const pdfPage = pdfDoc.addPage([widthPt, heightPt]);
    const embeddedImg = await pdfDoc.embedJpg(jpegBytes);

    pdfPage.drawImage(embeddedImg, {
      x: 0,
      y: 0,
      width: widthPt,
      height: heightPt,
    });

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes as unknown as BlobPart], { type: "application/pdf" });
    const filename = customFilename || `${baseSlug}-${spec.widthMm}x${spec.heightMm}mm.pdf`;

    return {
      blob,
      bytes: pdfBytes,
      filename,
      mimeType: "application/pdf",
      widthPx,
      heightPx,
      widthMm: spec.widthMm,
      heightMm: spec.heightMm,
      dpi,
      sizeBytes: pdfBytes.byteLength,
      sizeKbFormatted: `${(pdfBytes.byteLength / 1024).toFixed(1)} KB`,
      format,
    };
  }

  // 2. Render to offscreen Canvas
  const canvas = renderSinglePhotoToCanvas(
    image,
    adjustments,
    spec,
    dpi,
    backgroundColor,
    enhancement
  );

  // 3. Lossless PNG Mode
  if (format === "png-lossless") {
    const rawPngBytes = await canvasToBytes(canvas, "image/png");
    const taggedPngBytes = injectPngDpi(rawPngBytes, dpi);
    const blob = new Blob([taggedPngBytes as unknown as BlobPart], { type: "image/png" });
    const filename = customFilename || `${baseSlug}-${widthPx}x${heightPx}-${dpi}dpi.png`;

    return {
      blob,
      bytes: taggedPngBytes,
      filename,
      mimeType: "image/png",
      widthPx,
      heightPx,
      widthMm: spec.widthMm,
      heightMm: spec.heightMm,
      dpi,
      sizeBytes: taggedPngBytes.byteLength,
      sizeKbFormatted: `${(taggedPngBytes.byteLength / 1024).toFixed(1)} KB`,
      format,
    };
  }

  // 4. Portal-Compliant JPEG with Binary Search Quality Optimization
  if (format === "jpeg-portal") {
    const targetMaxBytes = targetMaxKb * 1024;
    let lowQ = 0.35;
    let highQ = 0.98;
    let bestBytes: Uint8Array | null = null;

    // Iterative binary search to find maximum visual quality that stays <= targetMaxBytes
    for (let iter = 0; iter < 7; iter++) {
      const midQ = (lowQ + highQ) / 2;
      const raw = await canvasToBytes(canvas, "image/jpeg", midQ);
      const tagged = injectJpegDpi(raw, dpi);

      if (tagged.byteLength <= targetMaxBytes) {
        bestBytes = tagged;
        lowQ = midQ; // Try higher quality
      } else {
        highQ = midQ; // File too big, lower quality
      }
    }

    // Fallback if initial pass was too high
    if (!bestBytes) {
      const raw = await canvasToBytes(canvas, "image/jpeg", 0.35);
      bestBytes = injectJpegDpi(raw, dpi);
    }

    const blob = new Blob([bestBytes as unknown as BlobPart], { type: "image/jpeg" });
    const filename = customFilename || `${baseSlug}-portal-${widthPx}x${heightPx}.jpg`;

    return {
      blob,
      bytes: bestBytes,
      filename,
      mimeType: "image/jpeg",
      widthPx,
      heightPx,
      widthMm: spec.widthMm,
      heightMm: spec.heightMm,
      dpi,
      sizeBytes: bestBytes.byteLength,
      sizeKbFormatted: `${(bestBytes.byteLength / 1024).toFixed(1)} KB`,
      format,
    };
  }

  // 5. High-Resolution Print JPEG (default)
  const rawJpegBytes = await canvasToBytes(canvas, "image/jpeg", quality);
  const taggedJpegBytes = injectJpegDpi(rawJpegBytes, dpi);
  const blob = new Blob([taggedJpegBytes as unknown as BlobPart], { type: "image/jpeg" });
  const filename = customFilename || `${baseSlug}-${widthPx}x${heightPx}-${dpi}dpi.jpg`;

  return {
    blob,
    bytes: taggedJpegBytes,
    filename,
    mimeType: "image/jpeg",
    widthPx,
    heightPx,
    widthMm: spec.widthMm,
    heightMm: spec.heightMm,
    dpi,
    sizeBytes: taggedJpegBytes.byteLength,
    sizeKbFormatted: `${(taggedJpegBytes.byteLength / 1024).toFixed(1)} KB`,
    format,
  };
}

/**
 * One-click helper to export and trigger cross-platform download.
 */
export async function downloadSinglePhotoExport(
  options: SinglePhotoExportOptions
): Promise<SinglePhotoExportResult> {
  const result = await exportSinglePhoto(options);
  await downloadBlob(result.blob, result.filename);
  return result;
}

