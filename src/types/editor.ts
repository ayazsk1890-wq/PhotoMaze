import { PassportSpec } from "../lib/constants/countries";
import type { FaceDetectionResult } from "../lib/ai/faceDetector";

export interface ImageAdjustments {
  zoom: number; // 0.5 to 3.0 (default 1.0)
  panX: number; // in pixels relative to center
  panY: number; // in pixels relative to center
  rotation: number; // -180 to 180 degrees (default 0)
  flipHorizontal: boolean;
  flipVertical: boolean;
  brightness: number; // -50 to +50 (default 0)
  contrast: number; // -50 to +50 (default 0)
  saturation: number; // -50 to +50 (default 0)
}

export interface ImageMetadata {
  name: string;
  sizeBytes: number;
  width: number;
  height: number;
  type: string;
  dpiAssessment: "excellent" | "good" | "warning";
  warningMessage?: string;
}

export interface UploadProgressState {
  isUploading: boolean;
  progressPercent: number;
  stageMessage: string;
}

export interface BackgroundRemovalState {
  isProcessing: boolean;
  progressPercent: number;
  stageMessage: string;
  error: string | null;
  providerUsed: string | null;
}

export interface FaceDetectionState {
  isDetecting: boolean;
  hasRun: boolean;
  result: FaceDetectionResult | null;
  error: string | null;
}

export type SidebarTab = "crop" | "background" | "compliance" | "adjust" | "outfit";

export interface OutfitReplacementState {
  isProcessing: boolean;
  progressPercent: number;
  stageMessage: string;
  error: string | null;
  outputImageUrl: string | null;
  selectedOutfitId: string | null;
  /** true = showing AI outfit result, false = showing original image */
  previewMode: boolean;
  requiresApiKey: boolean;
}

export type AiPersonaType = "male" | "female" | "child" | "hijab";

export interface AiAutoPilotProgress {
  stage: "detecting" | "matting" | "cropping" | "enhancing" | "auditing" | "complete" | "error";
  progressPercent: number;
  message: string;
}

export interface AiAutoPilotResult {
  success: boolean;
  persona: AiPersonaType;
  croppedDataUrl: string;
  cutoutDataUrl?: string;
  complianceScore: number;
  printSheet4x6DataUrl?: string;
  error?: string;
}

export type EnhancementPreset = "natural" | "studio" | "brighten" | "subtle" | "custom";

export interface PortraitEnhancementSettings {
  enabled: boolean;
  skinSmoothing: number; // 0 to 100
  blemishReduction: number; // 0 to 100
  lightingCorrection: number; // 0 to 100 (highlights/shadows balance)
  brightness: number; // -50 to +50
  contrast: number; // -50 to +50
  sharpness: number; // 0 to 100 (unsharp mask)
  noiseReduction: number; // 0 to 100
  colorCorrection: number; // -50 (cooler/blue) to +50 (warmer/golden)
  superResolution: boolean; // 300 DPI high-frequency detail boost
  preset: EnhancementPreset;
}

export interface PortraitEnhancementState {
  settings: PortraitEnhancementSettings;
  isProcessing: boolean;
  enhancedDataUrl: string | null;
  compareMode: boolean;
}

export const DEFAULT_ENHANCEMENT_SETTINGS: PortraitEnhancementSettings = {
  enabled: false,
  skinSmoothing: 35,
  blemishReduction: 30,
  lightingCorrection: 25,
  brightness: 5,
  contrast: 5,
  sharpness: 35,
  noiseReduction: 20,
  colorCorrection: 0,
  superResolution: true,
  preset: "natural",
};

export const ENHANCEMENT_PRESETS: Record<EnhancementPreset, Partial<PortraitEnhancementSettings>> = {
  natural: {
    skinSmoothing: 25,
    blemishReduction: 25,
    lightingCorrection: 20,
    brightness: 4,
    contrast: 4,
    sharpness: 30,
    noiseReduction: 20,
    colorCorrection: 0,
    superResolution: true,
  },
  studio: {
    skinSmoothing: 45,
    blemishReduction: 40,
    lightingCorrection: 35,
    brightness: 8,
    contrast: 10,
    sharpness: 45,
    noiseReduction: 25,
    colorCorrection: 2,
    superResolution: true,
  },
  brighten: {
    skinSmoothing: 30,
    blemishReduction: 25,
    lightingCorrection: 45,
    brightness: 15,
    contrast: 8,
    sharpness: 35,
    noiseReduction: 30,
    colorCorrection: -2,
    superResolution: true,
  },
  subtle: {
    skinSmoothing: 15,
    blemishReduction: 15,
    lightingCorrection: 10,
    brightness: 2,
    contrast: 2,
    sharpness: 20,
    noiseReduction: 15,
    colorCorrection: 0,
    superResolution: true,
  },
  custom: {},
};

export const COMPLIANT_BACKGROUND_COLORS = [
  { id: "white", name: "Pure White", hex: "#FFFFFF", description: "US, India, China, Japan, Schengen standard" },
  { id: "light-gray", name: "Light Gray", hex: "#E5E7EB", description: "UK, EU Schengen, Singapore standard" },
  { id: "light-blue", name: "Light Blue", hex: "#B9D7EA", description: "France, Malaysia, Kuwait visa" },
  { id: "blue", name: "Royal Blue", hex: "#1D4ED8", description: "Malaysia, UAE, official passport" },
  { id: "red", name: "Crimson Red", hex: "#C4151C", description: "Indonesia, Vietnam, China special ID" },
  { id: "transparent", name: "Transparent (PNG)", hex: "transparent", description: "Lossless cutout with transparent alpha" },
];

export const DEFAULT_ADJUSTMENTS: ImageAdjustments = {
  zoom: 1.0,
  panX: 0,
  panY: 0,
  rotation: 0,
  flipHorizontal: false,
  flipVertical: false,
  brightness: 0,
  contrast: 0,
  saturation: 0,
};
