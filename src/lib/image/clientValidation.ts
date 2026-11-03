import { ImageMetadata } from "@/types/editor";
import { PassportSpec } from "@/lib/constants/countries";

export const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
];

export const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

export function validateImageFile(file: File): FileValidationResult {
  if (!file) {
    return { valid: false, error: "No file selected." };
  }

  // Check file type (handle empty mime for some HEIC or edge browser formats)
  const fileExt = file.name.split(".").pop()?.toLowerCase();
  const validExtensions = ["jpg", "jpeg", "png", "webp", "heic", "heif"];

  const hasValidType =
    ALLOWED_MIME_TYPES.includes(file.type.toLowerCase()) ||
    (fileExt && validExtensions.includes(fileExt));

  if (!hasValidType) {
    return {
      valid: false,
      error: `Unsupported file format. Please upload a JPEG, PNG, WebP, or HEIC image.`,
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `File is too large (${sizeMb} MB). Maximum supported size is 20 MB.`,
    };
  }

  return { valid: true };
}

export function loadImageDimensions(src: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      resolve({ width: img.naturalWidth || img.width, height: img.naturalHeight || img.height });
    };
    img.onerror = () => {
      reject(new Error("Failed to load image dimensions."));
    };
    img.src = src;
  });
}

export function assessImageDpi(
  imgWidth: number,
  imgHeight: number,
  targetSpec: PassportSpec
): { assessment: "excellent" | "good" | "warning"; message: string } {
  const minRequiredWidth = targetSpec.widthPx300Dpi;
  const minRequiredHeight = targetSpec.heightPx300Dpi;

  if (imgWidth >= minRequiredWidth * 1.5 && imgHeight >= minRequiredHeight * 1.5) {
    return {
      assessment: "excellent",
      message: `Excellent resolution (${imgWidth} × ${imgHeight} px). High density 300 DPI print quality guaranteed.`,
    };
  } else if (imgWidth >= minRequiredWidth && imgHeight >= minRequiredHeight) {
    return {
      assessment: "good",
      message: `Sufficient resolution (${imgWidth} × ${imgHeight} px) for compliant 300 DPI output.`,
    };
  } else {
    return {
      assessment: "warning",
      message: `Resolution (${imgWidth} × ${imgHeight} px) is lower than recommended (${minRequiredWidth} × ${minRequiredHeight} px). The printed photo may appear soft.`,
    };
  }
}

// Preset samples for rapid testing
export const DEMO_SAMPLE_PHOTOS = [
  {
    id: "man",
    label: "Adult Male (Selfie)",
    url: "/samples/sample-man.jpg",
    name: "sample-man-portrait.jpg",
    width: 800,
    height: 1200,
    sizeBytes: 850 * 1024,
  },
  {
    id: "woman",
    label: "Adult Female (Portrait)",
    url: "/samples/sample-woman.jpg",
    name: "sample-woman-portrait.jpg",
    width: 800,
    height: 1200,
    sizeBytes: 920 * 1024,
  },
  {
    id: "kid",
    label: "Child (Passport)",
    url: "/samples/sample-child.jpg",
    name: "sample-child-portrait.jpg",
    width: 800,
    height: 1200,
    sizeBytes: 740 * 1024,
  },
  {
    id: "hijab",
    label: "Woman wearing Hijab",
    url: "/samples/sample-hijab.jpg",
    name: "sample-hijab-portrait.jpg",
    width: 800,
    height: 1200,
    sizeBytes: 880 * 1024,
  },
];

