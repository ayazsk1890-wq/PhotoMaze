"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useEditor } from "@/lib/context/EditorContext";
import {
  PrintSheetOptions,
  PrintLayoutSolution,
  PaperOrientation,
  CuttingGuideStyle,
  GridAlignment,
  MeasurementUnit,
} from "@/types/print";
import { STANDARD_PAPER_SIZES, getPaperSizeById, convertUnitToMm } from "@/lib/print/paperSizeRegistry";
import { calculatePrintLayout } from "@/lib/print/printLayoutCalculator";
import { renderPrintSheetPage } from "@/lib/print/printPreviewRenderer";
import { generatePrintSheetPdf, downloadPdfBlob } from "@/lib/print/pdfExportService";
import { downloadPrintSheetImage } from "@/lib/print/imageExportService";
import { exportCroppedCanvas } from "@/lib/image/canvasRenderer";
import {
  Printer,
  FileDown,
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Sliders,
  Scissors,
  Layers,
  Sparkles,
  Info,
  RefreshCw,
  FileText,
  Image as ImageIcon,
  Check,
  AlertCircle,
  HelpCircle,
} from "lucide-react";

interface PrintSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PrintSheetModal({ isOpen, onClose }: PrintSheetModalProps) {
  const {
    imageSrc,
    transparentCutoutUrl,
    backgroundColor,
    adjustments,
    selectedSpec,
    enhancementState,
    enhancedImageUrl,
  } = useEditor();

  // ── Print Options State ───────────────────────────────────────────────────
  const [copies, setCopies] = useState<number>(6);
  const [paperSizeId, setPaperSizeId] = useState<string>("4x6");
  const [customPaperWidth, setCustomPaperWidth] = useState<number>(100);
  const [customPaperHeight, setCustomPaperHeight] = useState<number>(150);
  const [customPaperUnit, setCustomPaperUnit] = useState<MeasurementUnit>("mm");
  const [orientation, setOrientation] = useState<PaperOrientation>("auto");
  const [uniformMarginMm, setUniformMarginMm] = useState<number>(5);
  const [spacingMm, setSpacingMm] = useState<number>(2);
  const [dpi, setDpi] = useState<150 | 300 | 600>(300);
  const [cuttingGuides, setCuttingGuides] = useState<CuttingGuideStyle>("corners");
  const [alignment, setAlignment] = useState<GridAlignment>("center");

  // Preview UI State
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  const [previewZoom, setPreviewZoom] = useState<number>(1.0);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportMessage, setExportMessage] = useState<string>("");

  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  // ── Generate High-Res Cropped Source Image for Sheet ───────────────────────
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);

  useEffect(() => {
    const srcToUse = enhancedImageUrl || transparentCutoutUrl || imageSrc;
    if (!srcToUse) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const cropHeight = 440;
      const cropWidth = Math.round(cropHeight * (selectedSpec.widthMm / selectedSpec.heightMm));
      const renderedUrl = exportCroppedCanvas(
        img,
        adjustments,
        selectedSpec,
        cropWidth,
        cropHeight,
        transparentCutoutUrl ? backgroundColor : "#FFFFFF",
        enhancementState?.settings
      );
      setPhotoDataUrl(renderedUrl);
    };
    img.src = srcToUse;
  }, [
    imageSrc,
    transparentCutoutUrl,
    backgroundColor,
    adjustments,
    selectedSpec,
    enhancementState?.settings,
    enhancedImageUrl,
  ]);

  // ── Compute Print Layout Solution Reactively ──────────────────────────────
  const layoutSolution: PrintLayoutSolution = useMemo(() => {
    const customWidthMm = convertUnitToMm(customPaperWidth, customPaperUnit);
    const customHeightMm = convertUnitToMm(customPaperHeight, customPaperUnit);

    const options: PrintSheetOptions = {
      photoWidthMm: selectedSpec.widthMm,
      photoHeightMm: selectedSpec.heightMm,
      photoName: `${selectedSpec.country} ${selectedSpec.documentType}`,
      copies: Math.max(1, Math.min(1000, Number(copies) || 1)),
      paperSizeId,
      customPaperWidthMm: customWidthMm,
      customPaperHeightMm: customHeightMm,
      orientation,
      margins: {
        topMm: uniformMarginMm,
        bottomMm: uniformMarginMm,
        leftMm: uniformMarginMm,
        rightMm: uniformMarginMm,
      },
      spacingMm,
      dpi,
      cuttingGuides,
      alignment,
      includeLabels: true,
    };

    return calculatePrintLayout(options);
  }, [
    selectedSpec,
    copies,
    paperSizeId,
    customPaperWidth,
    customPaperHeight,
    customPaperUnit,
    orientation,
    uniformMarginMm,
    spacingMm,
    dpi,
    cuttingGuides,
    alignment,
  ]);

  // Ensure current page index stays within totalPages bounds
  useEffect(() => {
    if (currentPageIndex >= layoutSolution.totalPages) {
      setCurrentPageIndex(Math.max(0, layoutSolution.totalPages - 1));
    }
  }, [layoutSolution.totalPages, currentPageIndex]);

  // ── Render Preview Canvas Whenever Layout or Page Changes ─────────────────
  useEffect(() => {
    if (!isOpen || !previewCanvasRef.current || !photoDataUrl || !layoutSolution.isValid) return;

    const img = new Image();
    img.onload = () => {
      if (previewCanvasRef.current) {
        renderPrintSheetPage({
          canvas: previewCanvasRef.current,
          photoImage: img,
          solution: layoutSolution,
          pageIndex: currentPageIndex,
          cuttingGuides,
          showMargins: true,
        });
      }
    };
    img.src = photoDataUrl;
  }, [isOpen, photoDataUrl, layoutSolution, currentPageIndex, cuttingGuides]);

  if (!isOpen) return null;

  // ── Export Handlers ───────────────────────────────────────────────────────
  const handleDownloadPdf = async () => {
    if (!photoDataUrl || !layoutSolution.isValid) return;
    setIsExporting(true);
    setExportMessage("Generating print-ready vector PDF…");

    try {
      const pdfBytes = await generatePrintSheetPdf({
        solution: layoutSolution,
        photoDataUrl,
        cuttingGuides,
        dpi,
        documentTitle: `${selectedSpec.country} Passport Photo Print Sheet`,
      });

      const fileName = `${selectedSpec.country.toLowerCase().replace(/\s+/g, "-")}-passport-sheet-${copies}-copies.pdf`;
      downloadPdfBlob(pdfBytes, fileName);
    } catch (err) {
      console.error("PDF export error:", err);
      alert("Failed to generate PDF. Please try a lower DPI or fewer copies.");
    } finally {
      setIsExporting(false);
      setExportMessage("");
    }
  };

  const handleDownloadRaster = async (format: "jpeg" | "png") => {
    if (!photoDataUrl || !layoutSolution.isValid) return;
    setIsExporting(true);
    setExportMessage(`Rendering high-resolution ${format.toUpperCase()} sheet (${dpi} DPI)…`);

    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Failed to load photo for raster export"));
        img.src = photoDataUrl;
      });

      const pageNum = currentPageIndex + 1;
      const ext = format === "png" ? "png" : "jpg";
      const fileName = `${selectedSpec.country.toLowerCase().replace(/\s+/g, "-")}-sheet-p${pageNum}-${dpi}dpi.${ext}`;

      await downloadPrintSheetImage(
        {
          solution: layoutSolution,
          photoImage: img,
          pageIndex: currentPageIndex,
          dpi,
          format,
          cuttingGuides,
        },
        fileName
      );
    } catch (err) {
      console.error("Image sheet export error:", err);
      alert(`Failed to export ${format.toUpperCase()}. Try downloading as PDF instead.`);
    } finally {
      setIsExporting(false);
      setExportMessage("");
    }
  };

  const handleBrowserPrint = () => {
    if (!previewCanvasRef.current) return;
    const dataUrl = previewCanvasRef.current.toDataURL("image/png");
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Popup blocked. Please allow popups to open the print dialog.");
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${selectedSpec.country} Passport Photo Sheet</title>
          <style>
            @page { size: auto; margin: 0mm; }
            body { margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
            img { max-width: 100%; height: auto; display: block; }
          </style>
        </head>
        <body>
          <img src="${dataUrl}" onload="window.print();window.close();" />
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const copyPresets = [1, 2, 4, 6, 8, 12, 16, 24, 30, 48];

  return (
    <div className="fixed inset-0 z-50 bg-[#0B0D12]/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-fade-in">
      <div className="bg-[#11141B] rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden border border-[#292F3A] text-[#F5F7FA]">
        {/* ── Modal Header ────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#292F3A] bg-[#11141B]/95 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1C2230] text-[#8B7CFF] border border-[#292F3A] flex items-center justify-center shadow-lg shadow-[#8B7CFF]/15">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#F5F7FA] flex items-center gap-2">
                <span>Passport Photo Print Sheet Generator</span>
                <span className="text-[10px] bg-[#8B7CFF]/15 text-[#8B7CFF] border border-[#8B7CFF]/30 px-2 py-0.5 rounded-full font-bold">
                  300 DPI
                </span>
              </h3>
              <p className="text-xs text-[#9CA3AF]">
                {selectedSpec.country} {selectedSpec.documentType} ({selectedSpec.widthMm} × {selectedSpec.heightMm} mm) · Multi-Page Bulk Printing
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-[#9CA3AF] hover:text-[#F5F7FA] hover:bg-[#1C2230] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Modal Body (Split Left: Live Preview, Right: Options) ─────── */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* LEFT: Live Interactive Sheet Preview */}
          <div className="flex-1 bg-[#0B0D12] flex flex-col items-center justify-between p-4 sm:p-6 overflow-hidden relative select-none">
            {/* Top Preview Status Bar */}
            <div className="w-full flex items-center justify-between text-xs text-[#9CA3AF] mb-3 z-10">
              <div className="flex items-center gap-2">
                <span className="bg-[#171B24] border border-[#292F3A] px-2.5 py-1 rounded-xl text-[11px] font-semibold flex items-center gap-1.5 text-[#F5F7FA]">
                  <span className="w-2 h-2 rounded-full bg-[#34D399]" />
                  <span>{layoutSolution.paperName}</span>
                </span>
                <span className="text-[#9CA3AF]">
                  {layoutSolution.capacityPerPage} photos/sheet · {layoutSolution.packingEfficiencyPercent}% space used
                </span>
              </div>

              {/* Multi-Page Navigation */}
              {layoutSolution.totalPages > 1 && (
                <div className="flex items-center gap-1 bg-[#171B24] border border-[#292F3A] rounded-xl p-0.5">
                  <button
                    type="button"
                    onClick={() => setCurrentPageIndex((p) => Math.max(0, p - 1))}
                    disabled={currentPageIndex === 0}
                    className="p-1 rounded-lg hover:bg-[#1C2230] text-[#9CA3AF] hover:text-[#F5F7FA] disabled:opacity-30"
                    title="Previous Sheet"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="px-2 text-xs font-bold text-[#F5F7FA]">
                    Sheet {currentPageIndex + 1} of {layoutSolution.totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setCurrentPageIndex((p) => Math.min(layoutSolution.totalPages - 1, p + 1))}
                    disabled={currentPageIndex >= layoutSolution.totalPages - 1}
                    className="p-1 rounded-lg hover:bg-[#1C2230] text-[#9CA3AF] hover:text-[#F5F7FA] disabled:opacity-30"
                    title="Next Sheet"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Canvas Viewport with Zoom */}
            <div className="flex-1 w-full flex items-center justify-center overflow-auto p-2">
              {layoutSolution.isValid ? (
                <div
                  style={{ transform: `scale(${previewZoom})`, transformOrigin: "center center" }}
                  className="transition-transform duration-150 drop-shadow-2xl"
                >
                  <canvas
                    ref={previewCanvasRef}
                    className="max-h-[55vh] max-w-full object-contain rounded-md shadow-2xl bg-white border border-[#292F3A]"
                  />
                </div>
              ) : (
                <div className="text-center text-[#9CA3AF] p-6 bg-[#171B24] rounded-2xl border border-[#292F3A] max-w-sm">
                  <AlertCircle className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                  <p className="text-sm font-bold text-[#F5F7FA] mb-1">Layout Does Not Fit</p>
                  <p className="text-xs text-[#9CA3AF]">{layoutSolution.validationError}</p>
                </div>
              )}
            </div>

            {/* Bottom Preview Controls (Zoom + Page Count Indicator) */}
            <div className="w-full flex items-center justify-between text-xs text-[#9CA3AF] mt-3 pt-2 border-t border-[#292F3A] z-10">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-[#F5F7FA]">
                  Total Photos: {layoutSolution.totalCopies}
                </span>
                <span>•</span>
                <span>
                  On this sheet: {layoutSolution.pages[currentPageIndex]?.photosOnThisPage || 0}
                </span>
              </div>

              {/* Zoom Controls */}
              <div className="flex items-center gap-1 bg-[#171B24] border border-[#292F3A] rounded-xl px-2 py-1">
                <button
                  type="button"
                  onClick={() => setPreviewZoom((z) => Math.max(0.5, Number((z - 0.1).toFixed(1))))}
                  className="p-0.5 text-[#9CA3AF] hover:text-[#F5F7FA]"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="font-mono text-[11px] font-bold text-[#F5F7FA] px-1">
                  {Math.round(previewZoom * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => setPreviewZoom((z) => Math.min(2.0, Number((z + 0.1).toFixed(1))))}
                  className="p-0.5 text-[#9CA3AF] hover:text-[#F5F7FA]"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewZoom(1.0)}
                  className="ml-1 text-[10px] text-[#697386] hover:text-[#8B7CFF] underline"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT: Controls & Customization Sidebar */}
          <div className="w-full lg:w-96 bg-[#11141B] p-5 overflow-y-auto space-y-5 border-t lg:border-t-0 lg:border-l border-[#292F3A]">
            {/* 1. Number of Copies */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">
                  Number of Copies
                </label>
                <span className="text-xs font-mono font-bold text-[#8B7CFF] bg-[#1C2230] px-2 py-0.5 rounded-lg border border-[#292F3A]">
                  {copies} {copies === 1 ? "photo" : "photos"}
                </span>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex flex-wrap gap-1.5">
                {copyPresets.map((qty) => (
                  <button
                    key={qty}
                    type="button"
                    onClick={() => setCopies(qty)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                      copies === qty
                        ? "bg-[#8B7CFF] text-white shadow-sm shadow-[#8B7CFF]/20"
                        : "bg-[#171B24] text-[#9CA3AF] hover:text-[#F5F7FA] hover:bg-[#1C2230] border border-[#292F3A]"
                    }`}
                  >
                    {qty}
                  </button>
                ))}
              </div>

              {/* Custom Number Input */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={copies}
                  onChange={(e) => setCopies(Math.max(1, Math.min(1000, Number(e.target.value) || 1)))}
                  className="flex-1 px-3 py-1.5 bg-[#1C2230] border border-[#292F3A] rounded-xl text-xs font-medium text-[#F5F7FA] focus:outline-none focus:border-[#8B7CFF] focus:ring-1 focus:ring-[#8B7CFF]"
                  placeholder="Enter custom count (e.g. 50)"
                />
                <span className="text-xs text-[#697386]">(Max 1,000)</span>
              </div>
            </div>

            {/* 2. Paper Size Selection */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider block">
                Paper Size
              </label>
              <select
                value={paperSizeId}
                onChange={(e) => setPaperSizeId(e.target.value)}
                className="w-full px-3 py-2 bg-[#1C2230] border border-[#292F3A] rounded-xl text-xs font-medium text-[#F5F7FA] focus:outline-none focus:border-[#8B7CFF] focus:ring-1 focus:ring-[#8B7CFF]"
              >
                {STANDARD_PAPER_SIZES.map((paper) => (
                  <option key={paper.id} value={paper.id} className="bg-[#1C2230] text-[#F5F7FA]">
                    {paper.name} ({paper.widthMm} × {paper.heightMm} mm)
                  </option>
                ))}
              </select>

              {/* Custom Paper Input */}
              {paperSizeId === "custom" && (
                <div className="p-3 bg-[#171B24] border border-[#292F3A] rounded-xl space-y-2">
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <span className="text-[10px] text-[#9CA3AF] block mb-0.5">Width</span>
                      <input
                        type="number"
                        min="20"
                        max="2000"
                        value={customPaperWidth}
                        onChange={(e) => setCustomPaperWidth(Number(e.target.value))}
                        className="w-full px-2 py-1 text-xs bg-[#1C2230] border border-[#292F3A] rounded-lg text-[#F5F7FA]"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-[#9CA3AF] block mb-0.5">Height</span>
                      <input
                        type="number"
                        min="20"
                        max="2000"
                        value={customPaperHeight}
                        onChange={(e) => setCustomPaperHeight(Number(e.target.value))}
                        className="w-full px-2 py-1 text-xs bg-[#1C2230] border border-[#292F3A] rounded-lg text-[#F5F7FA]"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-[#9CA3AF] block mb-0.5">Unit</span>
                      <select
                        value={customPaperUnit}
                        onChange={(e) => setCustomPaperUnit(e.target.value as MeasurementUnit)}
                        className="w-full px-2 py-1 text-xs bg-[#1C2230] border border-[#292F3A] rounded-lg text-[#F5F7FA]"
                      >
                        <option value="mm">mm</option>
                        <option value="cm">cm</option>
                        <option value="in">inch</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Paper Orientation */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider block">
                Paper Orientation
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: "auto", label: "Auto (Best)" },
                  { id: "portrait", label: "Portrait" },
                  { id: "landscape", label: "Landscape" },
                ].map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => setOrientation(o.id as PaperOrientation)}
                    className={`py-1.5 px-2 rounded-xl text-xs font-semibold transition-all ${
                      orientation === o.id
                        ? "bg-[#8B7CFF] text-white shadow-sm shadow-[#8B7CFF]/20"
                        : "bg-[#171B24] text-[#9CA3AF] hover:text-[#F5F7FA] hover:bg-[#1C2230] border border-[#292F3A]"
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Spacing & Margins */}
            <div className="space-y-3 pt-1 border-t border-[#292F3A]">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#9CA3AF] font-medium">Photo Spacing</span>
                  <span className="font-mono font-bold text-[#F5F7FA]">{spacingMm} mm</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="15"
                  step="0.5"
                  value={spacingMm}
                  onChange={(e) => setSpacingMm(Number(e.target.value))}
                  className="w-full accent-[#8B7CFF] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#9CA3AF] font-medium">Page Margin</span>
                  <span className="font-mono font-bold text-[#F5F7FA]">{uniformMarginMm} mm</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="30"
                  step="1"
                  value={uniformMarginMm}
                  onChange={(e) => setUniformMarginMm(Number(e.target.value))}
                  className="w-full accent-[#8B7CFF] cursor-pointer"
                />
              </div>
            </div>

            {/* 5. Cutting Guides & Alignment */}
            <div className="space-y-3 pt-1 border-t border-[#292F3A]">
              <div>
                <label className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider block mb-1.5">
                  Cutting Guides
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { id: "corners", label: "Corner Ticks" },
                    { id: "full-dashed", label: "Dashed Lines" },
                    { id: "solid", label: "Solid Border" },
                    { id: "none", label: "None" },
                  ].map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setCuttingGuides(g.id as CuttingGuideStyle)}
                      className={`py-1.5 px-2 rounded-xl text-xs font-semibold text-left transition-all ${
                        cuttingGuides === g.id
                          ? "bg-[#8B7CFF] text-white shadow-sm shadow-[#8B7CFF]/20"
                          : "bg-[#171B24] text-[#9CA3AF] hover:text-[#F5F7FA] hover:bg-[#1C2230] border border-[#292F3A]"
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider block mb-1">
                    Alignment
                  </label>
                  <select
                    value={alignment}
                    onChange={(e) => setAlignment(e.target.value as GridAlignment)}
                    className="w-full px-2.5 py-1.5 bg-[#1C2230] border border-[#292F3A] rounded-xl text-xs font-medium text-[#F5F7FA]"
                  >
                    <option value="center" className="bg-[#1C2230] text-[#F5F7FA]">Centered</option>
                    <option value="top-left" className="bg-[#1C2230] text-[#F5F7FA]">Top-Left</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider block mb-1">
                    Print DPI
                  </label>
                  <select
                    value={dpi}
                    onChange={(e) => setDpi(Number(e.target.value) as 150 | 300 | 600)}
                    className="w-full px-2.5 py-1.5 bg-[#1C2230] border border-[#292F3A] rounded-xl text-xs font-medium text-[#F5F7FA]"
                  >
                    <option value={150} className="bg-[#1C2230] text-[#F5F7FA]">150 DPI (Fast)</option>
                    <option value={300} className="bg-[#1C2230] text-[#F5F7FA]">300 DPI (Standard)</option>
                    <option value={600} className="bg-[#1C2230] text-[#F5F7FA]">600 DPI (Ultra HD)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Export Status Notification */}
            {isExporting && (
              <div className="p-3 bg-[#8B7CFF]/10 border border-[#8B7CFF]/30 rounded-xl text-xs text-[#8B7CFF] animate-pulse flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>{exportMessage}</span>
              </div>
            )}

            {/* 6. Export Action Buttons */}
            <div className="space-y-2 pt-2 border-t border-[#292F3A]">
              {/* Primary PDF Download */}
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={!layoutSolution.isValid || isExporting}
                className="w-full py-3 px-4 rounded-xl bg-[#8B7CFF] hover:bg-[#7665F5] text-white font-bold text-xs shadow-lg shadow-[#8B7CFF]/20 transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
              >
                <FileDown className="w-4 h-4" />
                <span>Download Vector PDF ({layoutSolution.totalPages} {layoutSolution.totalPages === 1 ? "page" : "pages"})</span>
              </button>

              {/* Secondary Raster Options */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleDownloadRaster("jpeg")}
                  disabled={!layoutSolution.isValid || isExporting}
                  className="py-2 px-3 rounded-xl border border-[#292F3A] bg-[#171B24] hover:bg-[#1C2230] text-[#F5F7FA] font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-[#8B7CFF]" />
                  <span>JPEG Sheet</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDownloadRaster("png")}
                  disabled={!layoutSolution.isValid || isExporting}
                  className="py-2 px-3 rounded-xl border border-[#292F3A] bg-[#171B24] hover:bg-[#1C2230] text-[#F5F7FA] font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-[#8B7CFF]" />
                  <span>PNG (Lossless)</span>
                </button>
              </div>

              {/* Direct Browser Print Dialog */}
              <button
                type="button"
                onClick={handleBrowserPrint}
                disabled={!layoutSolution.isValid || isExporting}
                className="w-full py-2 px-3 rounded-xl border border-[#8B7CFF]/30 bg-[#1C2230] hover:bg-[#232B3D] text-[#8B7CFF] font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print from Browser Dialog</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

