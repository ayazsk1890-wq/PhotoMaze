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
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
        {/* ── Modal Header ────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/25">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Passport Photo Print Sheet Generator</span>
                <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">
                  Phase 8
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                {selectedSpec.country} {selectedSpec.documentType} ({selectedSpec.widthMm} × {selectedSpec.heightMm} mm) · Multi-Page Bulk Printing
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Modal Body (Split Left: Live Preview, Right: Options) ─────── */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* LEFT: Live Interactive Sheet Preview */}
          <div className="flex-1 bg-slate-900 flex flex-col items-center justify-between p-4 sm:p-6 overflow-hidden relative select-none">
            {/* Top Preview Status Bar */}
            <div className="w-full flex items-center justify-between text-xs text-slate-300 mb-3 z-10">
              <div className="flex items-center gap-2">
                <span className="bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-xl text-[11px] font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>{layoutSolution.paperName}</span>
                </span>
                <span className="text-slate-400">
                  {layoutSolution.capacityPerPage} photos/sheet · {layoutSolution.packingEfficiencyPercent}% space used
                </span>
              </div>

              {/* Multi-Page Navigation */}
              {layoutSolution.totalPages > 1 && (
                <div className="flex items-center gap-1 bg-slate-800 border border-slate-700 rounded-xl p-0.5">
                  <button
                    type="button"
                    onClick={() => setCurrentPageIndex((p) => Math.max(0, p - 1))}
                    disabled={currentPageIndex === 0}
                    className="p-1 rounded-lg hover:bg-slate-700 text-slate-300 disabled:opacity-30"
                    title="Previous Sheet"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="px-2 text-xs font-bold text-white">
                    Sheet {currentPageIndex + 1} of {layoutSolution.totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setCurrentPageIndex((p) => Math.min(layoutSolution.totalPages - 1, p + 1))}
                    disabled={currentPageIndex >= layoutSolution.totalPages - 1}
                    className="p-1 rounded-lg hover:bg-slate-700 text-slate-300 disabled:opacity-30"
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
                    className="max-h-[55vh] max-w-full object-contain rounded-md shadow-2xl bg-white"
                  />
                </div>
              ) : (
                <div className="text-center text-slate-400 p-6 bg-slate-800/80 rounded-2xl border border-slate-700 max-w-sm">
                  <AlertCircle className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                  <p className="text-sm font-bold text-white mb-1">Layout Does Not Fit</p>
                  <p className="text-xs text-slate-400">{layoutSolution.validationError}</p>
                </div>
              )}
            </div>

            {/* Bottom Preview Controls (Zoom + Page Count Indicator) */}
            <div className="w-full flex items-center justify-between text-xs text-slate-400 mt-3 pt-2 border-t border-slate-800/80 z-10">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-slate-300">
                  Total Photos: {layoutSolution.totalCopies}
                </span>
                <span>•</span>
                <span>
                  On this sheet: {layoutSolution.pages[currentPageIndex]?.photosOnThisPage || 0}
                </span>
              </div>

              {/* Zoom Controls */}
              <div className="flex items-center gap-1 bg-slate-800 border border-slate-700 rounded-xl px-2 py-1">
                <button
                  type="button"
                  onClick={() => setPreviewZoom((z) => Math.max(0.5, Number((z - 0.1).toFixed(1))))}
                  className="p-0.5 hover:text-white"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="font-mono text-[11px] font-bold text-white px-1">
                  {Math.round(previewZoom * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => setPreviewZoom((z) => Math.min(2.0, Number((z + 0.1).toFixed(1))))}
                  className="p-0.5 hover:text-white"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewZoom(1.0)}
                  className="ml-1 text-[10px] text-slate-400 hover:text-white underline"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT: Controls & Customization Sidebar */}
          <div className="w-full lg:w-96 bg-white p-5 overflow-y-auto space-y-5 border-t lg:border-t-0 lg:border-l border-slate-200">
            {/* 1. Number of Copies */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Number of Copies
                </label>
                <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200">
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
                        ? "bg-blue-600 text-white shadow-xs"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
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
                  className="flex-1 px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter custom count (e.g. 50)"
                />
                <span className="text-xs text-slate-400">(Max 1,000)</span>
              </div>
            </div>

            {/* 2. Paper Size Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                Paper Size
              </label>
              <select
                value={paperSizeId}
                onChange={(e) => setPaperSizeId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {STANDARD_PAPER_SIZES.map((paper) => (
                  <option key={paper.id} value={paper.id}>
                    {paper.name} ({paper.widthMm} × {paper.heightMm} mm)
                  </option>
                ))}
              </select>

              {/* Custom Paper Input */}
              {paperSizeId === "custom" && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <span className="text-[10px] text-slate-500 block mb-0.5">Width</span>
                      <input
                        type="number"
                        min="20"
                        max="2000"
                        value={customPaperWidth}
                        onChange={(e) => setCustomPaperWidth(Number(e.target.value))}
                        className="w-full px-2 py-1 text-xs border border-slate-200 rounded-lg bg-white"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block mb-0.5">Height</span>
                      <input
                        type="number"
                        min="20"
                        max="2000"
                        value={customPaperHeight}
                        onChange={(e) => setCustomPaperHeight(Number(e.target.value))}
                        className="w-full px-2 py-1 text-xs border border-slate-200 rounded-lg bg-white"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block mb-0.5">Unit</span>
                      <select
                        value={customPaperUnit}
                        onChange={(e) => setCustomPaperUnit(e.target.value as MeasurementUnit)}
                        className="w-full px-2 py-1 text-xs border border-slate-200 rounded-lg bg-white"
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
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
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
                        ? "bg-blue-600 text-white shadow-xs"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Spacing & Margins */}
            <div className="space-y-3 pt-1 border-t border-slate-100">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-700 font-medium">Photo Spacing</span>
                  <span className="font-mono font-bold text-slate-900">{spacingMm} mm</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="15"
                  step="0.5"
                  value={spacingMm}
                  onChange={(e) => setSpacingMm(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-700 font-medium">Page Margin</span>
                  <span className="font-mono font-bold text-slate-900">{uniformMarginMm} mm</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="30"
                  step="1"
                  value={uniformMarginMm}
                  onChange={(e) => setUniformMarginMm(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>
            </div>

            {/* 5. Cutting Guides & Alignment */}
            <div className="space-y-3 pt-1 border-t border-slate-100">
              <div>
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1.5">
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
                          ? "bg-blue-600 text-white shadow-xs"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1">
                    Alignment
                  </label>
                  <select
                    value={alignment}
                    onChange={(e) => setAlignment(e.target.value as GridAlignment)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-xl text-xs font-medium bg-white"
                  >
                    <option value="center">Centered</option>
                    <option value="top-left">Top-Left</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1">
                    Print DPI
                  </label>
                  <select
                    value={dpi}
                    onChange={(e) => setDpi(Number(e.target.value) as 150 | 300 | 600)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-xl text-xs font-medium bg-white"
                  >
                    <option value={150}>150 DPI (Fast)</option>
                    <option value={300}>300 DPI (Standard)</option>
                    <option value={600}>600 DPI (Ultra HD)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Export Status Notification */}
            {isExporting && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-700 animate-pulse flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>{exportMessage}</span>
              </div>
            )}

            {/* 6. Export Action Buttons */}
            <div className="space-y-2 pt-2 border-t border-slate-200">
              {/* Primary PDF Download */}
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={!layoutSolution.isValid || isExporting}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white font-bold text-xs shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
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
                  className="py-2 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>JPEG Sheet</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDownloadRaster("png")}
                  disabled={!layoutSolution.isValid || isExporting}
                  className="py-2 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>PNG (Lossless)</span>
                </button>
              </div>

              {/* Direct Browser Print Dialog */}
              <button
                type="button"
                onClick={handleBrowserPrint}
                disabled={!layoutSolution.isValid || isExporting}
                className="w-full py-2 px-3 rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100/70 text-blue-700 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
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

