/**
 * High-Resolution Vector PDF Export Service (Phase 8)
 *
 * Uses `pdf-lib` to generate multi-page print-ready PDFs with:
 * - Exact physical millimeter dimensions
 * - Exact 72 pt/in PostScript coordinate mapping
 * - High-resolution embedded JPEG/PNG photo data
 * - Accurate vector cutting guides (crop marks, solid, or dashed lines)
 * - Zero unwanted scaling or printer distortion
 */

import { PDFDocument, rgb } from "pdf-lib";
import { PrintLayoutSolution, CuttingGuideStyle } from "@/types/print";
import { mmToPdfPoints } from "./photoDimensionConverter";
import { downloadBlob } from "../export/downloadHelper";

export interface PdfExportOptions {
  solution: PrintLayoutSolution;
  photoDataUrl: string;
  cuttingGuides: CuttingGuideStyle;
  dpi?: number;
  documentTitle?: string;
}

/**
 * Converts a data URL (data:image/jpeg;base64,... or data:image/png;base64,...)
 * into an ArrayBuffer / Uint8Array.
 */
function dataUrlToBytes(dataUrl: string): Uint8Array {
  const commaIdx = dataUrl.indexOf(",");
  const base64 = commaIdx >= 0 ? dataUrl.slice(commaIdx + 1) : dataUrl;
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Generates a multi-page, dimensionally accurate PDF document.
 * Returns a Uint8Array containing the complete PDF binary data.
 */
export async function generatePrintSheetPdf(options: PdfExportOptions): Promise<Uint8Array> {
  const { solution, photoDataUrl, cuttingGuides, documentTitle = "Passport Photo Print Sheet" } = options;

  const pdfDoc = await PDFDocument.create();
  pdfDoc.setTitle(documentTitle);
  pdfDoc.setProducer("PhotoMaze");
  pdfDoc.setCreator("PhotoMaze");

  // Determine image format (JPEG or PNG)
  const isPng = photoDataUrl.startsWith("data:image/png");
  const imageBytes = dataUrlToBytes(photoDataUrl);

  const embeddedImage = isPng
    ? await pdfDoc.embedPng(imageBytes)
    : await pdfDoc.embedJpg(imageBytes);

  const { paperWidthMm, paperHeightMm } = solution;
  const pageWidthPt = mmToPdfPoints(paperWidthMm);
  const pageHeightPt = mmToPdfPoints(paperHeightMm);

  // Render each page
  for (const pageResult of solution.pages) {
    const pdfPage = pdfDoc.addPage([pageWidthPt, pageHeightPt]);

    for (const slot of pageResult.slots) {
      // In PDF, (0,0) is bottom-left. We convert top-left (xMm, yMm) to bottom-left PDF points:
      const xPt = mmToPdfPoints(slot.xMm);
      const widthPt = mmToPdfPoints(slot.widthMm);
      const heightPt = mmToPdfPoints(slot.heightMm);
      const yPt = mmToPdfPoints(paperHeightMm - slot.yMm - slot.heightMm);

      // Draw embedded photograph
      pdfPage.drawImage(embeddedImage, {
        x: xPt,
        y: yPt,
        width: widthPt,
        height: heightPt,
      });

      // Draw vector cutting guides
      drawPdfCuttingGuides(pdfPage, xPt, yPt, widthPt, heightPt, cuttingGuides);
    }
  }

  return pdfDoc.save();
}

/**
 * Draws sharp vector cutting marks directly onto the PDF page canvas.
 */
function drawPdfCuttingGuides(
  page: any,
  x: number,
  y: number,
  w: number,
  h: number,
  style: CuttingGuideStyle
): void {
  if (style === "none") return;

  const guideColor = rgb(0.4, 0.45, 0.5); // Slate gray
  const thickness = 0.5; // Fine hairline

  if (style === "solid") {
    page.drawRectangle({
      x,
      y,
      width: w,
      height: h,
      borderColor: guideColor,
      borderWidth: thickness,
    });
  } else if (style === "full-dashed") {
    // In pdf-lib, draw dashed borders via 4 lines with dashArray
    const dash = [2, 2];
    // Bottom
    page.drawLine({ start: { x, y }, end: { x: x + w, y }, thickness, color: guideColor, dashArray: dash });
    // Top
    page.drawLine({ start: { x, y: y + h }, end: { x: x + w, y: y + h }, thickness, color: guideColor, dashArray: dash });
    // Left
    page.drawLine({ start: { x, y }, end: { x, y: y + h }, thickness, color: guideColor, dashArray: dash });
    // Right
    page.drawLine({ start: { x: x + w, y }, end: { x: x + w, y: y + h }, thickness, color: guideColor, dashArray: dash });
  } else if (style === "corners") {
    const tickLen = mmToPdfPoints(2.5); // 2.5 mm corner ticks

    // Bottom-Left
    page.drawLine({ start: { x: x - tickLen, y }, end: { x, y }, thickness, color: guideColor });
    page.drawLine({ start: { x, y: y - tickLen }, end: { x, y }, thickness, color: guideColor });

    // Bottom-Right
    page.drawLine({ start: { x: x + w, y }, end: { x: x + w + tickLen, y }, thickness, color: guideColor });
    page.drawLine({ start: { x: x + w, y: y - tickLen }, end: { x: x + w, y }, thickness, color: guideColor });

    // Top-Left
    page.drawLine({ start: { x: x - tickLen, y: y + h }, end: { x, y: y + h }, thickness, color: guideColor });
    page.drawLine({ start: { x, y: y + h }, end: { x, y: y + h + tickLen }, thickness, color: guideColor });

    // Top-Right
    page.drawLine({ start: { x: x + w, y: y + h }, end: { x: x + w + tickLen, y: y + h }, thickness, color: guideColor });
    page.drawLine({ start: { x: x + w, y: y + h }, end: { x: x + w, y: y + h + tickLen }, thickness, color: guideColor });
  }
}

/**
 * Triggers a browser download of the generated PDF file across desktop and mobile.
 */
export function downloadPdfBlob(pdfBytes: Uint8Array, filename: string): void {
  const blob = new Blob([pdfBytes as unknown as BlobPart], { type: "application/pdf" });
  downloadBlob(blob, filename);
}
