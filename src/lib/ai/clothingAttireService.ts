/**
 * Local Client-Side Clothing & Attire Service
 *
 * Provides 100% free, local, client-side formal attire options for
 * Studio Appearance Mode.
 *
 * Attires are rendered onto a dedicated garment layer and aligned
 * precisely with the subject's neck and shoulder geometry from
 * MediaPipe landmarks, then placed UNDER the protected authentic face layer.
 */

import { AttireStyleOption, ClothingPresentationPreference, PersonCategory } from "@/types/studio";
import { DetectedFace } from "@/lib/ai/faceDetector";

export const STUDIO_ATTIRE_STYLES: AttireStyleOption[] = [
  // ── Masculine / Neutral Formal ──────────────────────────────────────────────
  {
    id: "mens-navy-suit",
    name: "Classic Navy Business Suit",
    category: "suit",
    genderPresentation: "masculine",
    description: "Tailored dark navy suit jacket, crisp white collared shirt and silk tie.",
    previewThumbnail:
      "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='%231e293b'/><path d='M20 100 L35 45 L50 70 L65 45 L80 100 Z' fill='%231e3a8a'/><path d='M40 50 L50 68 L60 50 Z' fill='%23ffffff'/><path d='M48 60 L50 85 L52 60 Z' fill='%23991b1b'/></svg>",
    dominantColor: "#1e3a8a",
  },
  {
    id: "mens-charcoal-suit",
    name: "Charcoal Grey Tailored Suit",
    category: "suit",
    genderPresentation: "masculine",
    description: "Sleek charcoal two-piece suit with light grey textured fabric.",
    previewThumbnail:
      "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='%2318181b'/><path d='M20 100 L35 45 L50 70 L65 45 L80 100 Z' fill='%233f3f46'/><path d='M40 50 L50 68 L60 50 Z' fill='%23ffffff'/><path d='M48 60 L50 85 L52 60 Z' fill='%231e40af'/></svg>",
    dominantColor: "#3f3f46",
  },
  {
    id: "mens-black-suit",
    name: "Executive Black Suit",
    category: "suit",
    genderPresentation: "masculine",
    description: "Formal black suit jacket with modern narrow notch lapel.",
    previewThumbnail:
      "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='%230f172a'/><path d='M20 100 L35 45 L50 70 L65 45 L80 100 Z' fill='%2309090b'/><path d='M40 50 L50 68 L60 50 Z' fill='%23ffffff'/><path d='M48 60 L50 85 L52 60 Z' fill='%230284c7'/></svg>",
    dominantColor: "#09090b",
  },

  // ── Feminine Formal ────────────────────────────────────────────────────────
  {
    id: "womens-navy-blazer",
    name: "Navy Professional Blazer",
    category: "blazer",
    genderPresentation: "feminine",
    description: "Structured navy business blazer over a soft white round-neck blouse.",
    previewThumbnail:
      "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='%231e293b'/><path d='M15 100 L30 40 L50 65 L70 40 L85 100 Z' fill='%231e3a8a'/><path d='M35 48 L50 64 L65 48 Z' fill='%23f8fafc'/></svg>",
    dominantColor: "#1e3a8a",
  },
  {
    id: "womens-black-blazer",
    name: "Black Tailored Blazer",
    category: "blazer",
    genderPresentation: "feminine",
    description: "Classic black blazer with high neckline suitable for professional portfolios.",
    previewThumbnail:
      "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='%230f172a'/><path d='M15 100 L30 40 L50 65 L70 40 L85 100 Z' fill='%2318181b'/><path d='M35 48 L50 64 L65 48 Z' fill='%23ffffff'/></svg>",
    dominantColor: "#18181b",
  },

  // ── Neutral / Collared Shirts ──────────────────────────────────────────────
  {
    id: "white-collared-shirt",
    name: "Crisp White Collared Shirt",
    category: "shirt",
    genderPresentation: "neutral",
    description: "Clean pressed white formal collared shirt with buttoned collar.",
    previewThumbnail:
      "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='%23334155'/><path d='M15 100 L30 42 L50 60 L70 42 L85 100 Z' fill='%23ffffff'/><path d='M42 45 L50 58 L58 45 Z' fill='%23e2e8f0'/></svg>",
    dominantColor: "#ffffff",
  },
  {
    id: "blue-oxford-shirt",
    name: "Light Blue Oxford Shirt",
    category: "shirt",
    genderPresentation: "neutral",
    description: "Subtle light blue business casual collared dress shirt.",
    previewThumbnail:
      "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='%23334155'/><path d='M15 100 L30 42 L50 60 L70 42 L85 100 Z' fill='%23bae6fd'/><path d='M42 45 L50 58 L58 45 Z' fill='%23ffffff'/></svg>",
    dominantColor: "#bae6fd",
  },

  // ── Child Attire ───────────────────────────────────────────────────────────
  {
    id: "child-smart-shirt",
    name: "Children's Smart Collared Shirt",
    category: "shirt",
    genderPresentation: "neutral",
    description: "Neat solid light-coloured shirt with clean collar, tailored for children.",
    previewThumbnail:
      "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='%23475569'/><path d='M20 100 L35 48 L50 62 L65 48 L80 100 Z' fill='%23f1f5f9'/><path d='M44 50 L50 60 L56 50 Z' fill='%230284c7'/></svg>",
    dominantColor: "#f1f5f9",
  },
];

/**
 * Filter attire styles by presentation preference and category
 */
export function getAttireOptions(
  category: PersonCategory,
  presentation: ClothingPresentationPreference
): AttireStyleOption[] {
  if (category === "child") {
    return STUDIO_ATTIRE_STYLES.filter(
      (a) => a.id === "child-smart-shirt" || a.category === "shirt"
    );
  }

  if (presentation === "formal-feminine") {
    return STUDIO_ATTIRE_STYLES.filter(
      (a) => a.genderPresentation === "feminine" || a.genderPresentation === "neutral"
    );
  }

  if (presentation === "formal-masculine") {
    return STUDIO_ATTIRE_STYLES.filter(
      (a) => a.genderPresentation === "masculine" || a.genderPresentation === "neutral"
    );
  }

  // neutral or all
  return STUDIO_ATTIRE_STYLES.filter((a) => a.id !== "child-smart-shirt");
}

/**
 * Renders the chosen formal attire onto the canvas strictly below the neck line.
 */
export function renderLocalAttire(
  canvas: HTMLCanvasElement,
  face: DetectedFace,
  attireId: string
): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const attire = STUDIO_ATTIRE_STYLES.find((a) => a.id === attireId) || STUDIO_ATTIRE_STYLES[0];
  const width = canvas.width;
  const height = canvas.height;

  const chinY = face.landmarks.chinBottom.y * height;
  const neckCenter = face.landmarks.eyeCenter.x * width;
  const earDistance = Math.abs(face.landmarks.rightEar.x - face.landmarks.leftEar.x) * width;
  const shoulderSpan = Math.max(earDistance * 2.4, width * 0.85);

  const collarTopY = chinY + 10;
  const collarBottomY = chinY + Math.max(45, (height - chinY) * 0.28);

  ctx.save();

  // 1. Draw Jacket / Garment Base (Shoulder to bottom)
  ctx.fillStyle = attire.dominantColor;
  ctx.beginPath();
  ctx.moveTo(neckCenter - shoulderSpan / 2, height);
  ctx.lineTo(neckCenter - shoulderSpan / 2, collarTopY + 30);
  ctx.quadraticCurveTo(
    neckCenter - earDistance * 0.7,
    collarTopY,
    neckCenter - earDistance * 0.35,
    collarTopY + 10
  );
  ctx.lineTo(neckCenter, collarBottomY);
  ctx.lineTo(neckCenter + earDistance * 0.35, collarTopY + 10);
  ctx.quadraticCurveTo(
    neckCenter + earDistance * 0.7,
    collarTopY,
    neckCenter + shoulderSpan / 2,
    collarTopY + 30
  );
  ctx.lineTo(neckCenter + shoulderSpan / 2, height);
  ctx.closePath();
  ctx.fill();

  // 2. Inner Shirt (White / Light)
  const isShirtOnly = attire.category === "shirt";
  ctx.fillStyle = isShirtOnly ? attire.dominantColor : "#f8fafc";
  ctx.beginPath();
  ctx.moveTo(neckCenter - earDistance * 0.35, collarTopY + 10);
  ctx.lineTo(neckCenter, collarBottomY);
  ctx.lineTo(neckCenter + earDistance * 0.35, collarTopY + 10);
  ctx.closePath();
  ctx.fill();

  // 3. Lapels or Tie for Suit
  if (attire.category === "suit") {
    // Silk Tie
    ctx.fillStyle = attire.id === "mens-navy-suit" ? "#991b1b" : "#1e40af";
    ctx.beginPath();
    ctx.moveTo(neckCenter - 8, collarTopY + 20);
    ctx.lineTo(neckCenter + 8, collarTopY + 20);
    ctx.lineTo(neckCenter + 12, height);
    ctx.lineTo(neckCenter - 12, height);
    ctx.closePath();
    ctx.fill();

    // Lapel shadows
    ctx.strokeStyle = "rgba(0,0,0,0.35)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(neckCenter - earDistance * 0.45, collarTopY + 15);
    ctx.lineTo(neckCenter - 14, collarBottomY + 35);
    ctx.moveTo(neckCenter + earDistance * 0.45, collarTopY + 15);
    ctx.lineTo(neckCenter + 14, collarBottomY + 35);
    ctx.stroke();
  }

  // 4. Subtle fabric shading / gradient
  const grad = ctx.createLinearGradient(0, collarTopY, 0, height);
  grad.addColorStop(0, "rgba(255, 255, 255, 0.08)");
  grad.addColorStop(0.5, "rgba(0, 0, 0, 0)");
  grad.addColorStop(1, "rgba(0, 0, 0, 0.25)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, collarTopY, width, height - collarTopY);

  ctx.restore();
}
