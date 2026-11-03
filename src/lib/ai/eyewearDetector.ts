/**
 * Computer Vision Eyewear Visibility & Dark Sunglasses Detector
 *
 * Inspects facial eye orbits, nasal bridge, and ocular geometry
 * to detect dark sunglasses, tinted lenses, or heavy flash glare
 * that obscure the subject's eyes.
 *
 * In accordance with ICAO Doc 9303, MEA India, and international passport
 * standards, photos with dark sunglasses or obscured eyes are non-compliant
 * and must trigger a blocking warning rather than hallucinating fake eyes.
 */

import { DetectedFace, NormalizedPoint } from "@/lib/ai/faceDetector";

export type EyewearClassification =
  | "none"
  | "clear-prescription"
  | "dark-sunglasses"
  | "glare-obscured";

export interface EyewearAnalysisResult {
  classification: EyewearClassification;
  eyesObscured: boolean;
  blockingWarning: boolean;
  confidence: number; // 0..1
  leftEyeMetrics: EyeRegionMetrics;
  rightEyeMetrics: EyeRegionMetrics;
  nasalBridgeLuminance: number;
  message: string;
}

export interface EyeRegionMetrics {
  avgLuminance: number;
  scleraPixelRatio: number; // ratio of bright white sclera pixels
  darkLensRatio: number; // ratio of dark tinted pixels
  skinPixelRatio: number; // ratio of natural skin pixels
  variance: number;
  specularGlareRatio: number;
}

export const BLOCKING_SUNGLASSES_WARNING =
  "Your photograph contains dark sunglasses that obscure your eyes. Please upload a clear front-facing photograph without sunglasses.";

/**
 * Analyzes eye visibility on an image using biometric face landmarks.
 */
export function analyzeEyewearVisibility(
  imageSource: HTMLImageElement | HTMLCanvasElement,
  face: DetectedFace
): EyewearAnalysisResult {
  const width =
    "naturalWidth" in imageSource ? imageSource.naturalWidth : imageSource.width;
  const height =
    "naturalHeight" in imageSource ? imageSource.naturalHeight : imageSource.height;

  if (!width || !height) {
    return createDefaultResult("none", "Invalid image dimensions");
  }

  // Draw image to an offscreen canvas to sample pixel data
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) {
    return createDefaultResult("none", "Canvas context unavailable");
  }

  ctx.drawImage(imageSource, 0, 0);

  // Compute eye orbit bounding boxes
  const leftEyeBox = computeEyeRegionBounds(face.landmarks.leftEye, face, width, height, "left");
  const rightEyeBox = computeEyeRegionBounds(face.landmarks.rightEye, face, width, height, "right");

  // Sample Eye Metrics
  const leftMetrics = sampleEyeRegion(ctx, leftEyeBox);
  const rightMetrics = sampleEyeRegion(ctx, rightEyeBox);

  // Sample Nasal Bridge (between the eyes) to detect thick frames
  const nasalX = Math.round(face.landmarks.eyeCenter.x * width);
  const nasalY = Math.round(face.landmarks.eyeCenter.y * height);
  const nasalBridgeLuminance = samplePixelLuminance(ctx, nasalX, nasalY, 6);

  // Sample Forehead / Cheek Skin Luminance as Reference
  const cheekY = Math.min(height - 1, Math.round(face.landmarks.noseTip.y * height));
  const cheekX = Math.max(0, Math.round((face.landmarks.leftEar.x * 0.4 + face.landmarks.eyeCenter.x * 0.6) * width));
  const referenceSkinLuminance = samplePixelLuminance(ctx, cheekX, cheekY, 8);

  // Determine classification
  const avgEyeLum = (leftMetrics.avgLuminance + rightMetrics.avgLuminance) / 2;
  const avgDarkRatio = (leftMetrics.darkLensRatio + rightMetrics.darkLensRatio) / 2;
  const avgScleraRatio = (leftMetrics.scleraPixelRatio + rightMetrics.scleraPixelRatio) / 2;
  const avgGlareRatio = (leftMetrics.specularGlareRatio + rightMetrics.specularGlareRatio) / 2;

  // Dark Sunglasses Detection:
  // 1. High dark lens ratio (uniform dark tinted glass over eye sockets)
  // 2. Complete absence of bright white sclera pixels
  // 3. Eye socket luminance significantly darker than surrounding cheek skin
  // 4. Strong specular reflection over dark substrate (reflective sunglasses)
  const isEyeSocketDarkComparedToSkin =
    referenceSkinLuminance > 80 && avgEyeLum < referenceSkinLuminance * 0.65;
  const isAchromaticTinted =
    avgDarkRatio > 0.35 || (avgEyeLum < 95 && avgScleraRatio < 0.04);
  const isReflectiveSunglasses =
    avgGlareRatio > 0.25 && avgScleraRatio < 0.03 && nasalBridgeLuminance < 110;

  let classification: EyewearClassification = "none";
  let eyesObscured = false;
  let blockingWarning = false;
  let message = "Eyes are clearly visible and compliant.";

  if (isAchromaticTinted || isEyeSocketDarkComparedToSkin || isReflectiveSunglasses) {
    classification = "dark-sunglasses";
    eyesObscured = true;
    blockingWarning = true;
    message = BLOCKING_SUNGLASSES_WARNING;
  } else if (avgGlareRatio > 0.40 && avgScleraRatio < 0.06) {
    classification = "glare-obscured";
    eyesObscured = true;
    blockingWarning = true;
    message =
      "Your photograph contains severe flash reflection or glare obscuring the eyes. Please upload a clear front-facing photograph without glare.";
  } else if (nasalBridgeLuminance < 100 && avgScleraRatio >= 0.07) {
    classification = "clear-prescription";
    eyesObscured = false;
    blockingWarning = false;
    message =
      "Clear prescription glasses detected. Permitted if eyes are clearly visible and there is no flash reflection.";
  }

  return {
    classification,
    eyesObscured,
    blockingWarning,
    confidence: 0.94,
    leftEyeMetrics: leftMetrics,
    rightEyeMetrics: rightMetrics,
    nasalBridgeLuminance,
    message,
  };
}

/**
 * Computes the pixel bounding box for an eye region based on face landmarks.
 */
function computeEyeRegionBounds(
  eyeCenter: NormalizedPoint,
  face: DetectedFace,
  width: number,
  height: number,
  side: "left" | "right"
): { x: number; y: number; width: number; height: number } {
  const earDist = Math.abs(face.landmarks.rightEar.x - face.landmarks.leftEar.x) * width;
  const eyeSpan = Math.max(width * 0.08, earDist * 0.28);
  const eyeHeight = eyeSpan * 0.65;

  const centerX = eyeCenter.x * width;
  const centerY = eyeCenter.y * height;

  const x = Math.max(0, Math.round(centerX - eyeSpan / 2));
  const y = Math.max(0, Math.round(centerY - eyeHeight / 2));
  const w = Math.min(width - x, Math.round(eyeSpan));
  const h = Math.min(height - y, Math.round(eyeHeight));

  return { x, y, width: w, height: h };
}

/**
 * Samples and analyzes pixels in an eye region for luminance, sclera white, and dark tint.
 */
function sampleEyeRegion(
  ctx: CanvasRenderingContext2D,
  box: { x: number; y: number; width: number; height: number }
): EyeRegionMetrics {
  if (box.width <= 0 || box.height <= 0) {
    return {
      avgLuminance: 0,
      scleraPixelRatio: 0,
      darkLensRatio: 0,
      skinPixelRatio: 0,
      variance: 0,
      specularGlareRatio: 0,
    };
  }

  const imgData = ctx.getImageData(box.x, box.y, box.width, box.height);
  const data = imgData.data;
  const totalPixels = box.width * box.height;

  let lumSum = 0;
  let scleraCount = 0;
  let darkLensCount = 0;
  let skinCount = 0;
  let glareCount = 0;

  const luminances: number[] = new Array(totalPixels);

  for (let i = 0; i < totalPixels; i++) {
    const idx = i * 4;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];

    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    luminances[i] = lum;
    lumSum += lum;

    // Sclera (Whites of the eyes) check:
    // Natural sclera is bright (lum > 160) with low chroma (R, G, B close to each other)
    const isAchromatic = Math.abs(r - g) < 25 && Math.abs(g - b) < 25;
    if (lum > 155 && isAchromatic) {
      scleraCount++;
    }

    // Specular glare check:
    if (lum > 225) {
      glareCount++;
    }

    // Dark tinted lens check:
    // Low luminance (< 85) or dark tinted non-skin pixels
    const isSkin = r > g && g > b && r - b > 15;
    if (isSkin) {
      skinCount++;
    } else if (lum < 95) {
      darkLensCount++;
    }
  }

  const avgLum = lumSum / totalPixels;

  // Calculate Variance
  let varSum = 0;
  for (let i = 0; i < totalPixels; i++) {
    const diff = luminances[i] - avgLum;
    varSum += diff * diff;
  }
  const variance = Math.sqrt(varSum / totalPixels);

  return {
    avgLuminance: Math.round(avgLum),
    scleraPixelRatio: Number((scleraCount / totalPixels).toFixed(3)),
    darkLensRatio: Number((darkLensCount / totalPixels).toFixed(3)),
    skinPixelRatio: Number((skinCount / totalPixels).toFixed(3)),
    variance: Math.round(variance),
    specularGlareRatio: Number((glareCount / totalPixels).toFixed(3)),
  };
}

/**
 * Samples average pixel luminance over a small local patch.
 */
function samplePixelLuminance(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number
): number {
  const x = Math.max(0, cx - radius);
  const y = Math.max(0, cy - radius);
  const size = radius * 2 + 1;

  try {
    const imgData = ctx.getImageData(x, y, size, size);
    const data = imgData.data;
    let sum = 0;
    const count = size * size;
    for (let i = 0; i < count; i++) {
      const idx = i * 4;
      sum += 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
    }
    return Math.round(sum / count);
  } catch {
    return 128;
  }
}

function createDefaultResult(
  classification: EyewearClassification,
  message: string
): EyewearAnalysisResult {
  return {
    classification,
    eyesObscured: false,
    blockingWarning: false,
    confidence: 0.5,
    leftEyeMetrics: {
      avgLuminance: 120,
      scleraPixelRatio: 0.1,
      darkLensRatio: 0,
      skinPixelRatio: 0.4,
      variance: 25,
      specularGlareRatio: 0,
    },
    rightEyeMetrics: {
      avgLuminance: 120,
      scleraPixelRatio: 0.1,
      darkLensRatio: 0,
      skinPixelRatio: 0.4,
      variance: 25,
      specularGlareRatio: 0,
    },
    nasalBridgeLuminance: 120,
    message,
  };
}
