import { ImageAdjustments, PortraitEnhancementSettings } from "@/types/editor";
import { PassportSpec } from "@/lib/constants/countries";
import { enhanceImageData } from "@/lib/image/portraitEnhancer";

export interface RenderCanvasOptions {
  image: HTMLImageElement;
  adjustments: ImageAdjustments;
  spec: PassportSpec;
  cropDisplayWidth: number;
  cropDisplayHeight: number;
  backgroundColor?: string;
  enhancement?: PortraitEnhancementSettings;
}

/**
 * High-resolution canvas renderer that applies user transforms,
 * compositing the chosen background color, applying portrait enhancement if active,
 * and exporting a 300 DPI passport crop.
 */
export function exportCroppedCanvas(
  image: HTMLImageElement,
  adjustments: ImageAdjustments,
  spec: PassportSpec,
  cropDisplayWidth: number,
  cropDisplayHeight: number,
  backgroundColor: string = "#FFFFFF",
  enhancement?: PortraitEnhancementSettings
): string {
  const targetWidth = spec.widthPx300Dpi;
  const targetHeight = spec.heightPx300Dpi;

  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  // Fill background if not transparent
  const isTransparent = backgroundColor.toLowerCase() === "transparent";
  if (!isTransparent) {
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, targetWidth, targetHeight);
  } else {
    ctx.clearRect(0, 0, targetWidth, targetHeight);
  }

  const scaleMultiplier = targetWidth / cropDisplayWidth;

  ctx.save();

  // Apply filters
  const brightnessVal = 100 + adjustments.brightness;
  const contrastVal = 100 + adjustments.contrast;
  const saturationVal = 100 + adjustments.saturation;
  ctx.filter = `brightness(${brightnessVal}%) contrast(${contrastVal}%) saturate(${saturationVal}%)`;

  ctx.translate(targetWidth / 2, targetHeight / 2);
  ctx.translate(adjustments.panX * scaleMultiplier, adjustments.panY * scaleMultiplier);

  const angleRad = (adjustments.rotation * Math.PI) / 180;
  ctx.rotate(angleRad);

  const scaleX = (adjustments.flipHorizontal ? -1 : 1) * adjustments.zoom;
  const scaleY = (adjustments.flipVertical ? -1 : 1) * adjustments.zoom;
  ctx.scale(scaleX, scaleY);

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
      console.warn("Canvas enhancement export warning:", e);
    }
  }

  return isTransparent
    ? canvas.toDataURL("image/png")
    : canvas.toDataURL("image/jpeg", 0.95);
}
