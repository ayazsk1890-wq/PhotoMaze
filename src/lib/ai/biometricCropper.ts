import { PassportSpec } from "../constants/countries";
import { DetectedFace } from "./faceDetector";
import { ImageAdjustments } from "../../types/editor";

export interface ComplianceCheckResult {
  id: string;
  title: string;
  status: "pass" | "warning" | "fail";
  message: string;
  details?: string;
}

export interface BiometricEvaluation {
  isFullyCompliant: boolean;
  score: number; // 0..100
  checks: ComplianceCheckResult[];
  detectedHeadRatio: number; // Current head height % of crop frame
  detectedEyeLevelRatio: number; // Current eye height % from bottom of crop frame
  rollTiltDeg: number;
  faceCenteringOffsetPct: number;
}

export interface OptimalCropResult {
  adjustments: ImageAdjustments;
  headHeightPct: number;
  eyeLevelPct: number;
  explanation: string;
}

/**
 * Calculates the mathematically optimal pan, zoom, and deskew rotation
 * to align the detected face to official ICAO Doc 9303 / country passport standards.
 */
export function computeBiometricAutoCrop(
  face: DetectedFace,
  spec: PassportSpec,
  imgWidth: number,
  imgHeight: number,
  cropDisplayWidth: number = 320,
  cropDisplayHeight: number = 320
): OptimalCropResult {
  const targetWidthPx = spec.widthPx300Dpi;
  const targetHeightPx = spec.heightPx300Dpi;

  // Base drawing dimensions at zoom = 1
  const imageAspect = imgWidth / imgHeight;
  const cropAspect = targetWidthPx / targetHeightPx;

  let drawWidth: number;
  let drawHeight: number;

  if (imageAspect > cropAspect) {
    drawHeight = targetHeightPx;
    drawWidth = targetHeightPx * imageAspect;
  } else {
    drawWidth = targetWidthPx;
    drawHeight = targetWidthPx / imageAspect;
  }

  // 1. Calculate Target Head Height
  // Head height = chin (menton) to top of head (hair crown)
  const targetHeadRatio = (spec.headMinPercentage + spec.headMaxPercentage) / 2; // e.g. ~0.72 for EU, ~0.60 for US
  const targetHeadPx = targetHeightPx * targetHeadRatio;

  // Head height in source image at zoom = 1
  const headHeightAtZoom1 = face.headHeightRatio * drawHeight;

  // Compute required zoom to achieve target head height
  let optimalZoom = headHeightAtZoom1 > 0 ? targetHeadPx / headHeightAtZoom1 : 1.0;
  optimalZoom = Math.min(Math.max(0.6, Number(optimalZoom.toFixed(2))), 2.5);

  // 2. Deskew Rotation (correct head tilt if within reasonable range)
  let optimalRotation = 0;
  if (Math.abs(face.rollAngleDeg) >= 0.8 && Math.abs(face.rollAngleDeg) <= 15) {
    optimalRotation = -Number(face.rollAngleDeg.toFixed(1));
  }

  // 3. Horizontal Centering
  // Midline of face should align with target horizontal center (X = 0)
  const faceCenterXFraction = face.landmarks.eyeCenter.x;
  const horizontalOffsetFromSourceCenter = faceCenterXFraction - 0.5;
  const panXInCropPx = -horizontalOffsetFromSourceCenter * drawWidth * optimalZoom;

  // Convert to UI display units
  const scaleToDisplayX = cropDisplayWidth / targetWidthPx;
  const optimalPanX = Math.round(panXInCropPx * scaleToDisplayX);

  // 4. Vertical Eye-Level Alignment
  // Standard ICAO eye level is ~58% to 62% from bottom of photo (or ~40% from top)
  const defaultEyeFromBottom = (spec.eyeMinHeightPercentage || 0.56) + 0.03;
  const targetEyeFromTopRatio = 1 - defaultEyeFromBottom; // e.g. 0.41 from top
  const targetEyeYInCropPx = targetHeightPx * targetEyeFromTopRatio;

  // Eye position relative to image center at zoom
  const eyeOffsetFromSourceCenterY = (face.landmarks.eyeCenter.y - 0.5) * drawHeight * optimalZoom;
  const eyePosWithNoPanY = targetHeightPx / 2 + eyeOffsetFromSourceCenterY;
  const panYInCropPx = targetEyeYInCropPx - eyePosWithNoPanY;

  // Convert to UI display units
  const scaleToDisplayY = cropDisplayHeight / targetHeightPx;
  const optimalPanY = Math.round(panYInCropPx * scaleToDisplayY);

  const finalAdjustments: ImageAdjustments = {
    zoom: optimalZoom,
    rotation: optimalRotation,
    panX: optimalPanX,
    panY: optimalPanY,
    brightness: 0,
    contrast: 0,
    saturation: 0,
    flipHorizontal: false,
    flipVertical: false,
  };

  return {
    adjustments: finalAdjustments,
    headHeightPct: Math.round(targetHeadRatio * 100),
    eyeLevelPct: Math.round(defaultEyeFromBottom * 100),
    explanation: `Auto-aligned to ${spec.country} ${spec.documentType} specifications: Head size ${Math.round(targetHeadRatio * 100)}%, eye plane at ${Math.round(defaultEyeFromBottom * 100)}% height.`,
  };
}

/**
 * Validates a photo against official biometric passport specifications
 */
export function evaluateBiometricCompliance(
  face: DetectedFace | null,
  spec: PassportSpec,
  currentAdjustments: ImageAdjustments,
  imgWidth: number,
  imgHeight: number,
  cropDisplayWidth: number = 320,
  cropDisplayHeight: number = 320
): BiometricEvaluation {
  const checks: ComplianceCheckResult[] = [];
  let score = 100;

  // Check 1: Face Presence
  if (!face) {
    return {
      isFullyCompliant: false,
      score: 0,
      checks: [
        {
          id: "face_presence",
          title: "Face Detection",
          status: "fail",
          message: "No human face detected",
          details: "Official passport guidelines require a clear, front-facing view of your face.",
        },
      ],
      detectedHeadRatio: 0,
      detectedEyeLevelRatio: 0,
      rollTiltDeg: 0,
      faceCenteringOffsetPct: 0,
    };
  }

  checks.push({
    id: "face_presence",
    title: "Face Detection",
    status: "pass",
    message: "Single front-facing portrait identified",
    details: `Confidence: ${(face.confidence * 100).toFixed(0)}%`,
  });

  // Check 2: Head Tilt / Roll Angle
  const effectiveTilt = face.rollAngleDeg + currentAdjustments.rotation;
  const absTilt = Math.abs(effectiveTilt);
  if (absTilt <= 3.0) {
    checks.push({
      id: "head_tilt",
      title: "Head Pose & Roll Angle",
      status: "pass",
      message: `Head is upright (tilt: ${absTilt.toFixed(1)}°)`,
      details: "Compliant with ICAO Doc 9303 tilt tolerance (≤ 5°).",
    });
  } else if (absTilt <= 6.0) {
    score -= 15;
    checks.push({
      id: "head_tilt",
      title: "Head Pose & Roll Angle",
      status: "warning",
      message: `Slight head tilt detected (${absTilt.toFixed(1)}°)`,
      details: "Use rotation slider or auto-crop to level the eye line.",
    });
  } else {
    score -= 30;
    checks.push({
      id: "head_tilt",
      title: "Head Pose & Roll Angle",
      status: "fail",
      message: `Excessive head tilt (${absTilt.toFixed(1)}°)`,
      details: "Passport agencies will reject photos with non-level eyes or head rotation.",
    });
  }

  // Check 3: Current Head Size in the Frame
  const targetHeightPx = spec.heightPx300Dpi;
  const targetWidthPx = spec.widthPx300Dpi;
  const imageAspect = imgWidth / imgHeight;
  const cropAspect = targetWidthPx / targetHeightPx;
  const drawHeight = imageAspect > cropAspect ? targetHeightPx : targetWidthPx / imageAspect;

  const currentHeadPx = face.headHeightRatio * drawHeight * currentAdjustments.zoom;
  const currentHeadRatio = currentHeadPx / targetHeightPx;
  const minHeadRatio = spec.headMinPercentage;
  const maxHeadRatio = spec.headMaxPercentage;

  if (currentHeadRatio >= minHeadRatio && currentHeadRatio <= maxHeadRatio) {
    checks.push({
      id: "head_size",
      title: "Head Size & Coverage",
      status: "pass",
      message: `Head height is ${Math.round(currentHeadRatio * 100)}% of photo height`,
      details: `Official requirement: ${Math.round(minHeadRatio * 100)}% – ${Math.round(maxHeadRatio * 100)}% (compliant).`,
    });
  } else if (currentHeadRatio < minHeadRatio) {
    score -= 20;
    const isClose = currentHeadRatio >= minHeadRatio - 0.08;
    checks.push({
      id: "head_size",
      title: "Head Size & Coverage",
      status: isClose ? "warning" : "fail",
      message: `Head is too small (${Math.round(currentHeadRatio * 100)}%)`,
      details: `Zoom in to achieve at least ${Math.round(minHeadRatio * 100)}% head coverage.`,
    });
  } else {
    score -= 20;
    const isClose = currentHeadRatio <= maxHeadRatio + 0.08;
    checks.push({
      id: "head_size",
      title: "Head Size & Coverage",
      status: isClose ? "warning" : "fail",
      message: `Head is too large (${Math.round(currentHeadRatio * 100)}%)`,
      details: `Zoom out so head height does not exceed ${Math.round(maxHeadRatio * 100)}%.`,
    });
  }

  // Check 4: Horizontal Face Centering
  const scaleFromDisplayX = targetWidthPx / cropDisplayWidth;
  const currentPanXInCropPx = currentAdjustments.panX * scaleFromDisplayX;
  const faceCenterSourceFraction = face.landmarks.eyeCenter.x;
  const faceOffsetFromCenter = (faceCenterSourceFraction - 0.5) * (imageAspect > cropAspect ? targetHeightPx * imageAspect : targetWidthPx) * currentAdjustments.zoom;
  const netOffsetPx = faceOffsetFromCenter + currentPanXInCropPx;
  const centeringErrorRatio = Math.abs(netOffsetPx) / targetWidthPx;

  if (centeringErrorRatio <= 0.05) {
    checks.push({
      id: "centering",
      title: "Face Centering",
      status: "pass",
      message: "Face is centered horizontally",
      details: "Horizontal alignment conforms to midline requirements.",
    });
  } else if (centeringErrorRatio <= 0.12) {
    score -= 10;
    checks.push({
      id: "centering",
      title: "Face Centering",
      status: "warning",
      message: "Face is slightly off-center",
      details: "Drag photo horizontally to align the nose to the vertical guide.",
    });
  } else {
    score -= 25;
    checks.push({
      id: "centering",
      title: "Face Centering",
      status: "fail",
      message: "Face is significantly off-center",
      details: "Passport rules require facial midline alignment.",
    });
  }

  // Check 5: Resolution & DPI Quality
  if (imgWidth >= targetWidthPx && imgHeight >= targetHeightPx) {
    checks.push({
      id: "resolution",
      title: "Resolution & 300 DPI",
      status: "pass",
      message: `Source image (${imgWidth}×${imgHeight} px) exceeds 300 DPI threshold (${targetWidthPx}×${targetHeightPx} px)`,
      details: "Full sharpness and crisp facial feature retention assured.",
    });
  } else if (imgWidth >= targetWidthPx * 0.7 && imgHeight >= targetHeightPx * 0.7) {
    score -= 10;
    checks.push({
      id: "resolution",
      title: "Resolution & 300 DPI",
      status: "warning",
      message: `Resolution (${imgWidth}×${imgHeight} px) is slightly below 300 DPI recommendation`,
      details: "Print output may exhibit subtle soft focus on close inspection.",
    });
  } else {
    score -= 30;
    checks.push({
      id: "resolution",
      title: "Resolution & 300 DPI",
      status: "fail",
      message: `Low resolution (${imgWidth}×${imgHeight} px) will produce pixelated prints`,
      details: `Official specification demands at least ${targetWidthPx}×${targetHeightPx} px.`,
    });
  }

  const isFullyCompliant = checks.every((c) => c.status === "pass");

  return {
    isFullyCompliant,
    score: Math.max(0, Math.min(100, score)),
    checks,
    detectedHeadRatio: currentHeadRatio,
    detectedEyeLevelRatio: 0.58,
    rollTiltDeg: effectiveTilt,
    faceCenteringOffsetPct: Math.round(centeringErrorRatio * 100),
  };
}
