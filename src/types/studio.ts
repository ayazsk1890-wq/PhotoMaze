/**
 * PhotoMaze — AI Passport Photo Studio Data Models & Types
 *
 * Provides type definitions for the guided setup wizard, facial identity
 * preservation engine, clothing presentation choices, and post-generation review.
 */

export type StudioWorkflowMode = "official" | "appearance";

export type PersonCategory = "adult" | "child";

export type ClothingPresentationPreference =
  | "original"
  | "formal-masculine"
  | "formal-feminine"
  | "formal-neutral";

export type HeadCoveringPreference =
  | "none"
  | "hijab"
  | "turban"
  | "other"
  | "preserve";

export type SpectaclesPreference =
  | "none"
  | "clear"
  | "tinted"
  | "unsure";

export type SpectaclesAction =
  | "keep"
  | "remove"
  | "retake";

export type BackgroundSelectionColor =
  | "white"
  | "off-white"
  | "light-grey"
  | "light-blue"
  | "custom";

export type ClothingChangeSelection =
  | "keep"
  | "generate-formal"
  | "specific-style";

export interface AttireStyleOption {
  id: string;
  name: string;
  category: "suit" | "blazer" | "shirt" | "traditional";
  genderPresentation: "masculine" | "feminine" | "neutral";
  description: string;
  previewThumbnail: string; // Base64 SVG or static URL
  dominantColor: string;
}

export interface StudioSetupSelections {
  mode: StudioWorkflowMode;
  category: PersonCategory;
  clothingPresentation: ClothingPresentationPreference;
  clothingChange: ClothingChangeSelection;
  selectedAttireId?: string;
  headCovering: HeadCoveringPreference;
  spectacles: SpectaclesPreference;
  spectaclesAction: SpectaclesAction;
  backgroundColor: BackgroundSelectionColor;
  customHexColor?: string;
}

export type StudioProgressStage =
  | "idle"
  | "analyzing-face"
  | "isolating-background"
  | "modeling-attire"
  | "compositing-face"
  | "biometric-cropping"
  | "compliance-audit"
  | "complete"
  | "error";

export interface StudioProgressState {
  stage: StudioProgressStage;
  percent: number;
  message: string;
  detail?: string;
}

import type { EyewearAnalysisResult } from "@/lib/ai/eyewearDetector";

export interface StudioComplianceReport {
  score: number; // 0-100
  passed: boolean;
  dimensionsMm: string; // e.g. "35 x 45 mm"
  dimensionsPx: string; // e.g. "413 x 531 px @ 300 DPI"
  headCoverageRatio: number; // e.g. 0.74 (74%)
  eyeLineRatio: number; // e.g. 0.58 (58% from bottom)
  faceCentered: boolean;
  backgroundCompliant: boolean;
  sunglassesBlocking?: boolean;
  eyewearCompliant?: boolean;
  warnings: string[];
}

export interface StudioResult {
  originalPhotoUrl: string;
  processedPhotoUrl: string;
  transparentSubjectUrl: string;
  faceProtectionMaskUrl?: string;
  segmentationMaskUrl?: string;
  alphaMatteUrl?: string;
  eyewearAnalysis?: EyewearAnalysisResult;
  mode: StudioWorkflowMode;
  selections: StudioSetupSelections;
  compliance: StudioComplianceReport;
  timestamp: number;
}
