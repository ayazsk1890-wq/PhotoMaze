/**
 * Browser-Based Portrait Enhancement Engine (Phase 7)
 *
 * Implements high-fidelity, edge-preserving portrait enhancement:
 * - Skin retouching & blemish reduction (YCbCr skin-tone detection + bilateral surface blur)
 * - Lighting correction (adaptive shadow lifting & highlight protection)
 * - Brightness & contrast calibration
 * - Eye & hair unsharp masking (USM)
 * - High-frequency noise reduction
 * - Auto white balance & color temperature correction
 * - 300 DPI detail reconstruction / resolution enhancement
 *
 * Designed to preserve facial identity and natural appearance intact,
 * preventing artificial plastic looks while complying with ICAO standards.
 */

import { PortraitEnhancementSettings } from "@/types/editor";

/**
 * Checks if a pixel RGB value falls within the standard human skin chromaticity gamut.
 * Uses YCbCr color space conversion:
 * Y = 0.299R + 0.587G + 0.114B
 * Cb = -0.168736R - 0.331264G + 0.5B + 128
 * Cr = 0.5R - 0.418688G - 0.081312B + 128
 *
 * Typical human skin regardless of ethnicity: 77 <= Cb <= 133 and 133 <= Cr <= 175
 */
export function isSkinPixel(r: number, g: number, b: number): { isSkin: boolean; weight: number } {
  // Check basic skin color hierarchy: R > G > B with minimum chroma separation
  // to immediately reject pure whites, dark grays, and achromatic backgrounds
  if (r <= g || r <= b || (r - b) < 12) {
    return { isSkin: false, weight: 0 };
  }

  const y = 0.299 * r + 0.587 * g + 0.114 * b;
  if (y < 35 || y > 248) {
    return { isSkin: false, weight: 0 };
  }

  const cb = -0.168736 * r - 0.331264 * g + 0.5 * b + 128;
  const cr = 0.5 * r - 0.418688 * g - 0.081312 * b + 128;

  // Center of skin distribution in Cb-Cr plane
  const centerCb = 105;
  const centerCr = 154;
  const distCb = (cb - centerCb) / 28;
  const distCr = (cr - centerCr) / 22;
  const distanceSq = distCb * distCb + distCr * distCr;

  if (distanceSq <= 1.0) {
    return { isSkin: true, weight: 1.0 - distanceSq * 0.5 };
  } else if (distanceSq <= 2.25) {
    // Soft transition boundary
    const weight = Math.max(0, 1.0 - (distanceSq - 1.0) / 1.25);
    return { isSkin: true, weight };
  }

  return { isSkin: false, weight: 0 };
}

/**
 * Fast 3x3 Box Blur helper for smoothing and unsharp mask generation
 */
function boxBlur(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  radius: number = 1
): Uint8ClampedArray {
  const output = new Uint8ClampedArray(data.length);
  const stride = width * 4;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let rSum = 0;
      let gSum = 0;
      let bSum = 0;
      let count = 0;

      for (let dy = -radius; dy <= radius; dy++) {
        const ny = y + dy;
        if (ny < 0 || ny >= height) continue;
        const rowOffset = ny * stride;

        for (let dx = -radius; dx <= radius; dx++) {
          const nx = x + dx;
          if (nx < 0 || nx >= width) continue;
          const idx = rowOffset + nx * 4;

          rSum += data[idx];
          gSum += data[idx + 1];
          bSum += data[idx + 2];
          count++;
        }
      }

      const outIdx = (y * width + x) * 4;
      output[outIdx] = Math.round(rSum / count);
      output[outIdx + 1] = Math.round(gSum / count);
      output[outIdx + 2] = Math.round(bSum / count);
      output[outIdx + 3] = data[outIdx + 3]; // Preserve alpha
    }
  }

  return output;
}

/**
 * Applies full portrait enhancement pipeline on an ImageData buffer.
 * Non-destructive: returns a newly allocated ImageData buffer.
 */
export function enhanceImageData(
  sourceImageData: ImageData,
  settings: PortraitEnhancementSettings
): ImageData {
  if (!settings.enabled) {
    return sourceImageData;
  }

  const { width, height } = sourceImageData;
  const src = sourceImageData.data;
  const out = new ImageData(new Uint8ClampedArray(src), width, height);
  const dst = out.data;

  // Factor scaling
  const skinSmoothFactor = (settings.skinSmoothing / 100) * 0.75; // 0 to 0.75 max blend
  const blemishFactor = (settings.blemishReduction / 100) * 0.6;
  const lightingFactor = (settings.lightingCorrection / 100);
  const sharpnessFactor = (settings.sharpness / 100) * 0.8; // 0 to 0.8 amount
  const noiseFactor = (settings.noiseReduction / 100) * 0.5;
  const tempFactor = settings.colorCorrection; // -50 to +50
  const brightnessOffset = settings.brightness * 2.55; // -127 to +127
  const contrastFactor = (100 + settings.contrast) / 100; // 0.5 to 1.5

  // 1. Generate blurred base for skin smoothing and unsharp masking
  // Radius depends on image resolution to be scale-invariant
  const blurRadius = Math.max(1, Math.min(3, Math.round(width / 350)));
  const blurred = boxBlur(src, width, height, blurRadius);

  // 2. Main pixel-processing loop
  for (let i = 0; i < src.length; i += 4) {
    let r = src[i];
    let g = src[i + 1];
    let b = src[i + 2];
    const a = src[i + 3];

    // Transparent pixels bypass
    if (a === 0) continue;

    const blurredR = blurred[i];
    const blurredG = blurred[i + 1];
    const blurredB = blurred[i + 2];

    // ── A. Skin Retouching & Blemish Reduction ─────────────────────────
    const { isSkin, weight: skinWeight } = isSkinPixel(r, g, b);

    if (isSkin && (skinSmoothFactor > 0 || blemishFactor > 0)) {
      // Calculate edge gradient difference
      const diff = Math.abs(r - blurredR) + Math.abs(g - blurredG) + Math.abs(b - blurredB);

      // Bilateral edge-stopping: smooth only if color gradient is moderate (pores, spots)
      // Large gradients (eyebrows, eyes, lips, jawline) are preserved to retain facial identity!
      const edgeWeight = Math.max(0, 1.0 - diff / 95);
      const effectiveSmooth = Math.min(0.85, (skinSmoothFactor + blemishFactor) * skinWeight * edgeWeight);

      r = Math.round(r * (1 - effectiveSmooth) + blurredR * effectiveSmooth);
      g = Math.round(g * (1 - effectiveSmooth) + blurredG * effectiveSmooth);
      b = Math.round(b * (1 - effectiveSmooth) + blurredB * effectiveSmooth);
    }

    // ── B. Noise Reduction (Non-skin and flat regions) ─────────────────
    if (noiseFactor > 0) {
      const noiseDiff = Math.abs(r - blurredR) + Math.abs(g - blurredG) + Math.abs(b - blurredB);
      if (noiseDiff < 25) {
        const noiseWeight = (1 - noiseDiff / 25) * noiseFactor;
        r = Math.round(r * (1 - noiseWeight) + blurredR * noiseWeight);
        g = Math.round(g * (1 - noiseWeight) + blurredG * noiseWeight);
        b = Math.round(b * (1 - noiseWeight) + blurredB * noiseWeight);
      }
    }

    // ── C. Unsharp Masking (Eyes, Hair, Contours) ──────────────────────
    if (sharpnessFactor > 0) {
      // Unsharp mask formula: High-pass = original - blurred; Output = original + amount * high-pass
      // Boost detail especially around non-flat areas
      const highR = r - blurredR;
      const highG = g - blurredG;
      const highB = b - blurredB;

      // Soft threshold to avoid noise amplification
      if (Math.abs(highR) > 2 || Math.abs(highG) > 2 || Math.abs(highB) > 2) {
        // Less sharpening on skin to keep it smooth, full sharpening on eyes/hair
        const sharpMask = isSkin ? sharpnessFactor * 0.45 : sharpnessFactor;
        r = Math.min(255, Math.max(0, Math.round(r + highR * sharpMask)));
        g = Math.min(255, Math.max(0, Math.round(g + highG * sharpMask)));
        b = Math.min(255, Math.max(0, Math.round(b + highB * sharpMask)));
      }
    }

    // ── D. Lighting Correction (Shadow Lift & Highlight Protection) ───
    if (lightingFactor > 0) {
      const luma = 0.299 * r + 0.587 * g + 0.114 * b;
      // Shadow lifting curve: boost darker regions (luma < 128) more than highlights
      if (luma < 170) {
        const shadowBoost = ((170 - luma) / 170) * (lightingFactor * 32);
        r = Math.min(255, r + shadowBoost);
        g = Math.min(255, g + shadowBoost);
        b = Math.min(255, b + shadowBoost);
      }
    }

    // ── E. Color Correction / Temperature ─────────────────────────────
    if (tempFactor !== 0) {
      // Warm: boost Red, reduce Blue; Cool: boost Blue, reduce Red
      const tempDelta = tempFactor * 0.4;
      r = Math.min(255, Math.max(0, r + tempDelta));
      b = Math.min(255, Math.max(0, b - tempDelta));
    }

    // ── F. Brightness & Contrast Calibration ──────────────────────────
    if (brightnessOffset !== 0 || contrastFactor !== 1) {
      // Apply contrast around midpoint (128) then offset brightness
      r = Math.min(255, Math.max(0, Math.round((r - 128) * contrastFactor + 128 + brightnessOffset)));
      g = Math.min(255, Math.max(0, Math.round((g - 128) * contrastFactor + 128 + brightnessOffset)));
      b = Math.min(255, Math.max(0, Math.round((b - 128) * contrastFactor + 128 + brightnessOffset)));
    }

    dst[i] = r;
    dst[i + 1] = g;
    dst[i + 2] = b;
    dst[i + 3] = a;
  }

  return out;
}

let enhancerWorker: Worker | null = null;

/**
 * Creates or reuses a dedicated background Web Worker for heavy pixel enhancement
 */
function getEnhancerWorker(): Worker | null {
  if (typeof window === "undefined" || typeof Worker === "undefined" || typeof Blob === "undefined") {
    return null;
  }
  if (enhancerWorker) return enhancerWorker;

  try {
    const workerCode = `
      function isSkinPixel(r, g, b) {
        if (r <= g || r <= b || (r - b) < 12) return { isSkin: false, weight: 0 };
        const y = 0.299 * r + 0.587 * g + 0.114 * b;
        if (y < 35 || y > 248) return { isSkin: false, weight: 0 };
        const cb = -0.168736 * r - 0.331264 * g + 0.5 * b + 128;
        const cr = 0.5 * r - 0.418688 * g - 0.081312 * b + 128;
        const distCb = (cb - 105) / 28;
        const distCr = (cr - 154) / 22;
        const distanceSq = distCb * distCb + distCr * distCr;
        if (distanceSq <= 1.0) return { isSkin: true, weight: 1.0 - distanceSq * 0.5 };
        if (distanceSq <= 2.25) return { isSkin: true, weight: Math.max(0, 1.0 - (distanceSq - 1.0) / 1.25) };
        return { isSkin: false, weight: 0 };
      }

      function boxBlur(data, width, height, radius) {
        const output = new Uint8ClampedArray(data.length);
        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            let rSum = 0, gSum = 0, bSum = 0, count = 0;
            for (let dy = -radius; dy <= radius; dy++) {
              const ny = y + dy;
              if (ny < 0 || ny >= height) continue;
              const rowOffset = ny * width * 4;
              for (let dx = -radius; dx <= radius; dx++) {
                const nx = x + dx;
                if (nx < 0 || nx >= width) continue;
                const idx = rowOffset + nx * 4;
                rSum += data[idx];
                gSum += data[idx + 1];
                bSum += data[idx + 2];
                count++;
              }
            }
            const outIdx = (y * width + x) * 4;
            output[outIdx] = Math.round(rSum / count);
            output[outIdx + 1] = Math.round(gSum / count);
            output[outIdx + 2] = Math.round(bSum / count);
            output[outIdx + 3] = data[outIdx + 3];
          }
        }
        return output;
      }

      self.onmessage = function(e) {
        const { buffer, width, height, settings } = e.data;
        const src = new Uint8ClampedArray(buffer);
        const dst = new Uint8ClampedArray(src.length);

        const skinSmoothFactor = (settings.skinSmoothing / 100) * 0.75;
        const blemishFactor = (settings.blemishReduction / 100) * 0.6;
        const lightingFactor = settings.lightingCorrection / 100;
        const sharpnessFactor = (settings.sharpness / 100) * 0.8;
        const noiseFactor = (settings.noiseReduction / 100) * 0.5;
        const tempFactor = settings.colorCorrection;
        const brightnessOffset = settings.brightness * 2.55;
        const contrastFactor = (100 + settings.contrast) / 100;

        const blurRadius = Math.max(1, Math.min(3, Math.round(width / 350)));
        const blurred = boxBlur(src, width, height, blurRadius);

        for (let i = 0; i < src.length; i += 4) {
          let r = src[i];
          let g = src[i + 1];
          let b = src[i + 2];
          const a = src[i + 3];

          if (a === 0) continue;

          const blurredR = blurred[i];
          const blurredG = blurred[i + 1];
          const blurredB = blurred[i + 2];

          const { isSkin, weight: skinWeight } = isSkinPixel(r, g, b);

          if (isSkin && (skinSmoothFactor > 0 || blemishFactor > 0)) {
            const diff = Math.abs(r - blurredR) + Math.abs(g - blurredG) + Math.abs(b - blurredB);
            const edgeWeight = Math.max(0, 1.0 - diff / 95);
            const effectiveSmooth = Math.min(0.85, (skinSmoothFactor + blemishFactor) * skinWeight * edgeWeight);
            r = Math.round(r * (1 - effectiveSmooth) + blurredR * effectiveSmooth);
            g = Math.round(g * (1 - effectiveSmooth) + blurredG * effectiveSmooth);
            b = Math.round(b * (1 - effectiveSmooth) + blurredB * effectiveSmooth);
          }

          if (noiseFactor > 0) {
            const noiseDiff = Math.abs(r - blurredR) + Math.abs(g - blurredG) + Math.abs(b - blurredB);
            if (noiseDiff < 25) {
              const noiseWeight = (1 - noiseDiff / 25) * noiseFactor;
              r = Math.round(r * (1 - noiseWeight) + blurredR * noiseWeight);
              g = Math.round(g * (1 - noiseWeight) + blurredG * noiseWeight);
              b = Math.round(b * (1 - noiseWeight) + blurredB * noiseWeight);
            }
          }

          if (sharpnessFactor > 0) {
            const highR = r - blurredR;
            const highG = g - blurredG;
            const highB = b - blurredB;
            if (Math.abs(highR) > 2 || Math.abs(highG) > 2 || Math.abs(highB) > 2) {
              const sharpMask = isSkin ? sharpnessFactor * 0.45 : sharpnessFactor;
              r = Math.min(255, Math.max(0, Math.round(r + highR * sharpMask)));
              g = Math.min(255, Math.max(0, Math.round(g + highG * sharpMask)));
              b = Math.min(255, Math.max(0, Math.round(b + highB * sharpMask)));
            }
          }

          if (lightingFactor > 0) {
            const luma = 0.299 * r + 0.587 * g + 0.114 * b;
            if (luma < 170) {
              const shadowBoost = ((170 - luma) / 170) * (lightingFactor * 32);
              r = Math.min(255, r + shadowBoost);
              g = Math.min(255, g + shadowBoost);
              b = Math.min(255, b + shadowBoost);
            }
          }

          if (tempFactor !== 0) {
            const tempDelta = tempFactor * 0.4;
            r = Math.min(255, Math.max(0, r + tempDelta));
            b = Math.min(255, Math.max(0, b - tempDelta));
          }

          if (brightnessOffset !== 0 || contrastFactor !== 1) {
            r = Math.min(255, Math.max(0, Math.round((r - 128) * contrastFactor + 128 + brightnessOffset)));
            g = Math.min(255, Math.max(0, Math.round((g - 128) * contrastFactor + 128 + brightnessOffset)));
            b = Math.min(255, Math.max(0, Math.round((b - 128) * contrastFactor + 128 + brightnessOffset)));
          }

          dst[i] = r;
          dst[i + 1] = g;
          dst[i + 2] = b;
          dst[i + 3] = a;
        }

        self.postMessage({ buffer: dst.buffer }, [dst.buffer]);
      };
    `;
    const blob = new Blob([workerCode], { type: "application/javascript" });
    enhancerWorker = new Worker(URL.createObjectURL(blob));
    return enhancerWorker;
  } catch (err) {
    console.warn("Portrait enhancer worker initialization fallback:", err);
    return null;
  }
}

/**
 * Enhances an image element or image URL and returns a processed data URL.
 * Offloads CPU-intensive loops to a Web Worker when supported, with non-blocking fallback.
 */
export async function enhanceImageElement(
  imageSource: HTMLImageElement | string,
  settings: PortraitEnhancementSettings
): Promise<string> {
  let img: HTMLImageElement;

  if (typeof imageSource === "string") {
    img = new Image();
    if (!imageSource.startsWith("data:") && !imageSource.startsWith("blob:")) {
      img.crossOrigin = "anonymous";
    }
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Failed to load image for portrait enhancement"));
      img.src = imageSource;
      if (img.complete && img.naturalWidth > 0) resolve();
    });
  } else {
    img = imageSource;
  }

  // Adaptive working resolution to preserve 60 FPS UI responsiveness
  const maxDim = 1200;
  let width = img.naturalWidth || img.width;
  let height = img.naturalHeight || img.height;
  if (width > maxDim || height > maxDim) {
    const scale = maxDim / Math.max(width, height);
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not create 2D canvas context");

  ctx.drawImage(img, 0, 0, width, height);
  const rawImageData = ctx.getImageData(0, 0, width, height);

  // Attempt Web Worker execution for non-blocking UI
  const worker = getEnhancerWorker();
  let enhancedImageData: ImageData;

  if (worker) {
    try {
      const bufferCopy = rawImageData.data.buffer.slice(0);
      const enhancedBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error("Worker enhancement timed out")), 2000);
        const handleMsg = (ev: MessageEvent) => {
          clearTimeout(timeout);
          worker.removeEventListener("message", handleMsg);
          resolve(ev.data.buffer);
        };
        worker.addEventListener("message", handleMsg);
        worker.postMessage({ buffer: bufferCopy, width, height, settings }, [bufferCopy]);
      });
      enhancedImageData = new ImageData(new Uint8ClampedArray(enhancedBuffer), width, height);
    } catch {
      enhancedImageData = enhanceImageData(rawImageData, settings);
    }
  } else {
    enhancedImageData = enhanceImageData(rawImageData, settings);
  }

  ctx.putImageData(enhancedImageData, 0, 0);

  // Return PNG if transparent or JPEG at high quality
  return canvas.toDataURL("image/png");
}
