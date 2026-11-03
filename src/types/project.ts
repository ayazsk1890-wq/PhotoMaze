/**
 * Passport Project History and Storage Types (Phase 10)
 */

import { ImageAdjustments, PortraitEnhancementSettings } from "./editor";

export interface PassportProject {
  id: string;
  userId: string;
  title: string;
  country: string;
  documentType: string;
  widthMm: number;
  heightMm: number;
  backgroundColor: string;
  originalImageUrl: string;
  cutoutImageUrl?: string | null;
  thumbnailUrl?: string | null;
  adjustments: ImageAdjustments;
  enhancementSettings?: PortraitEnhancementSettings | null;
  createdAt: string;
  updatedAt: string;
}

export interface SaveProjectPayload {
  id?: string; // Optional: updates existing if provided
  title: string;
  country: string;
  documentType: string;
  widthMm: number;
  heightMm: number;
  backgroundColor: string;
  originalImageSrc: string;
  cutoutImageSrc?: string | null;
  thumbnailDataUrl?: string | null;
  adjustments: ImageAdjustments;
  enhancementSettings?: PortraitEnhancementSettings | null;
}

