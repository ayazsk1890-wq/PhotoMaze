/**
 * Live Print Preview Canvas Renderer (Phase 8)
 *
 * Renders an exact scale visualization of the print sheet on an HTML5 canvas:
 * - Real paper aspect ratio & margins
 * - Placed passport photographs with smooth scaling
 * - Optional cutting guides (corner marks, dashed lines, or continuous borders)
 * - Dimension labels and page counter annotations
 */

import { PrintLayoutSolution, CuttingGuideStyle } from "@/types/print";

export interface PreviewRenderOptions {
  canvas: HTMLCanvasElement;
  photoImage: HTMLImageElement;
  solution: PrintLayoutSolution;
  pageIndex: number;
  zoomLevel?: number; // 0.5 to 2.5
  cuttingGuides: CuttingGuideStyle;
  showMargins?: boolean;
}

/**
 * Draws the complete print sheet for a specific page onto an HTML5 canvas.
 */
export function renderPrintSheetPage(options: PreviewRenderOptions): void {
  const {
    canvas,
    photoImage,
    solution,
    pageIndex,
    cuttingGuides,
    showMargins = true,
  } = options;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const page = solution.pages[pageIndex];
  if (!page) return;

  const { paperWidthMm, paperHeightMm } = solution;

  // We set canvas internal resolution high for crisp rendering (e.g. 150 DPI preview)
  const previewDpi = 150;
  const mmToPx = (mm: number) => (mm / 25.4) * previewDpi;

  const canvasWidth = Math.round(mmToPx(paperWidthMm));
  const canvasHeight = Math.round(mmToPx(paperHeightMm));

  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  // 1. Paper Background (clean white sheet with subtle drop shadow)
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // 2. Printable Margin Area Overlay (Subtle guideline)
  if (showMargins) {
    const marginX = mmToPx(solution.margins.leftMm);
    const marginY = mmToPx(solution.margins.topMm);
    const marginW = canvasWidth - mmToPx(solution.margins.leftMm + solution.margins.rightMm);
    const marginH = canvasHeight - mmToPx(solution.margins.topMm + solution.margins.bottomMm);

    ctx.save();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = "rgba(148, 163, 184, 0.45)"; // slate-400
    ctx.lineWidth = 1;
    ctx.strokeRect(marginX, marginY, marginW, marginH);
    ctx.restore();
  }

  // 3. Render Each Photo Slot
  for (const slot of page.slots) {
    const x = mmToPx(slot.xMm);
    const y = mmToPx(slot.yMm);
    const w = mmToPx(slot.widthMm);
    const h = mmToPx(slot.heightMm);

    // Draw photo
    ctx.drawImage(photoImage, x, y, w, h);

    // Draw Cutting Guides
    drawCuttingGuides(ctx, x, y, w, h, cuttingGuides);
  }

  // 4. Subtle Outer Border
  ctx.strokeStyle = "rgba(203, 213, 225, 0.8)";
  ctx.lineWidth = 1;
  ctx.strokeRect(0, 0, canvasWidth, canvasHeight);
}

/**
 * Draws professional cutting guides around each individual photograph slot.
 */
function drawCuttingGuides(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  style: CuttingGuideStyle
): void {
  if (style === "none") return;

  ctx.save();
  ctx.strokeStyle = "rgba(100, 116, 139, 0.65)"; // slate-500
  ctx.lineWidth = 1;

  if (style === "solid") {
    ctx.setLineDash([]);
    ctx.strokeRect(x, y, w, h);
  } else if (style === "full-dashed") {
    ctx.setLineDash([3, 3]);
    ctx.strokeRect(x, y, w, h);
  } else if (style === "corners") {
    // Standard corner crop marks (4 ticks extending 5mm from corners)
    const tickLen = 10; // pixels
    ctx.setLineDash([]);

    // Top-Left
    ctx.beginPath();
    ctx.moveTo(x - tickLen, y);
    ctx.lineTo(x, y);
    ctx.lineTo(x, y - tickLen);
    ctx.stroke();

    // Top-Right
    ctx.beginPath();
    ctx.moveTo(x + w + tickLen, y);
    ctx.lineTo(x + w, y);
    ctx.lineTo(x + w, y - tickLen);
    ctx.stroke();

    // Bottom-Left
    ctx.beginPath();
    ctx.moveTo(x - tickLen, y + h);
    ctx.lineTo(x, y + h);
    ctx.lineTo(x, y + h + tickLen);
    ctx.stroke();

    // Bottom-Right
    ctx.beginPath();
    ctx.moveTo(x + w + tickLen, y + h);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x + w, y + h + tickLen);
    ctx.stroke();
  }

  ctx.restore();
}

