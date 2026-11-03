/**
 * Core interface definitions for modular AI provider adapters.
 * Implementations can be swapped dynamically via environment variables without altering the core editor.
 */

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FaceDetectionResult {
  box: BoundingBox;
  confidence: number;
  landmarks?: {
    leftEye: { x: number; y: number };
    rightEye: { x: number; y: number };
    noseTip: { x: number; y: number };
    mouthCenter: { x: number; y: number };
  };
  rollAngle?: number;
  yawAngle?: number;
}

export interface BackgroundRemovalOptions {
  returnAlphaMaskOnly?: boolean;
  format?: "png" | "webp";
  cropMargins?: boolean;
}

export interface BackgroundRemovalAdapter {
  name: string;
  removeBackground(imageBuffer: Buffer, options?: BackgroundRemovalOptions): Promise<Buffer>;
}

export interface FaceDetectionAdapter {
  name: string;
  detectFace(imageBuffer: Buffer): Promise<FaceDetectionResult[]>;
}

export interface OutfitReplacementOptions {
  gender: "men" | "women" | "kids";
  outfitId: string;
  colorScheme?: string;
}

export interface OutfitReplacementAdapter {
  name: string;
  replaceOutfit(
    imageBuffer: Buffer,
    faceBox: BoundingBox,
    options: OutfitReplacementOptions
  ): Promise<Buffer>;
}

export interface ImageEnhancementOptions {
  denoise?: boolean;
  upscaleDpi?: boolean;
  targetDpi?: number;
  sharpen?: boolean;
}

export interface ImageEnhancementAdapter {
  name: string;
  enhance(imageBuffer: Buffer, options?: ImageEnhancementOptions): Promise<Buffer>;
}

