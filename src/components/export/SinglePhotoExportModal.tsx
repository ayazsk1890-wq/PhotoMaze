"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useEditor } from "@/lib/context/EditorContext";
import {
  SinglePhotoExportFormat,
  calculateExactPixels,
  exportSinglePhoto,
  SinglePhotoExportResult,
} from "@/lib/export/singlePhotoExport";
import { downloadBlob, isMobileDevice } from "@/lib/export/downloadHelper";
import {
  Download,
  X,
  FileCheck2,
  FileText,
  Image as ImageIcon,
  ShieldCheck,
  Sparkles,
  Layers,
  Share2,
  Check,
  AlertCircle,
  HelpCircle,
} from "lucide-react";

interface SinglePhotoExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SinglePhotoExportModal({ isOpen, onClose }: SinglePhotoExportModalProps) {
  const {
    imageSrc,
    transparentCutoutUrl,
    backgroundColor,
    adjustments,
    selectedSpec,
    enhancementState,
    enhancedImageUrl,
  } = useEditor();

  // ── Export Configuration State ────────────────────────────────────────────
  const [format, setFormat] = useState<SinglePhotoExportFormat>("jpeg-portal");
  const [dpi, setDpi] = useState<300 | 600>(300);
  const [targetMaxKb, setTargetMaxKb] = useState<number>(240);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportSuccess, setExportSuccess] = useState<boolean>(false);

  // Cached generated preview/export result
  const [exportResult, setExportResult] = useState<SinglePhotoExportResult | null>(null);
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);

  // Pixel calculations
  const { widthPx, heightPx } = useMemo(
    () => calculateExactPixels(selectedSpec, dpi),
    [selectedSpec, dpi]
  );

  // ── Generate Image Preview & Metadata Reactively ──────────────────────────
  useEffect(() => {
    if (!isOpen) return;

    const srcToUse = enhancedImageUrl || transparentCutoutUrl || imageSrc;
    if (!srcToUse) return;

    let isMounted = true;
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = async () => {
      if (!isMounted) return;
      try {
        const result = await exportSinglePhoto({
          image: img,
          adjustments,
          spec: selectedSpec,
          format,
          dpi,
          backgroundColor: transparentCutoutUrl ? backgroundColor : "#FFFFFF",
          enhancement: enhancementState?.settings,
          targetMaxKb,
          quality: 0.96,
        });

        if (isMounted) {
          setExportResult(result);
          // For preview, create an object URL from blob
          const url = URL.createObjectURL(result.blob);
          setPreviewDataUrl(url);
        }
      } catch (err) {
        console.error("Single photo export generation error:", err);
      }
    };

    img.src = srcToUse;

    return () => {
      isMounted = false;
      if (previewDataUrl) {
        URL.revokeObjectURL(previewDataUrl);
      }
    };
  }, [
    isOpen,
    imageSrc,
    transparentCutoutUrl,
    backgroundColor,
    adjustments,
    selectedSpec,
    enhancementState?.settings,
    enhancedImageUrl,
    format,
    dpi,
    targetMaxKb,
  ]);

  if (!isOpen) return null;

  // ── Download Trigger Handler ──────────────────────────────────────────────
  const handleDownload = async () => {
    if (!exportResult) return;
    setIsExporting(true);
    try {
      await downloadBlob(exportResult.blob, exportResult.filename, { preferShareOnMobile: true });
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 2500);
    } catch (err) {
      console.error("Export download failed:", err);
      alert("Failed to download file. Please check device permissions.");
    } finally {
      setIsExporting(false);
    }
  };

  const isPortalMode = format === "jpeg-portal";
  const isPdfMode = format === "pdf-single";
  const isPngMode = format === "png-lossless";
  const isHighResJpeg = format === "jpeg-highres";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Export Passport Photograph
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
                  Phase 9
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {selectedSpec.country} {selectedSpec.documentType} • {selectedSpec.widthMm} ×{" "}
                {selectedSpec.heightMm} mm ({(selectedSpec.widthMm / 25.4).toFixed(2)} ×{" "}
                {(selectedSpec.heightMm / 25.4).toFixed(2)} in)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close export modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Format & Specifications Options */}
          <div className="lg:col-span-7 space-y-5">
            {/* 1. Format Presets */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5 block">
                Select Output Format & Use-Case
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Format 1: Portal JPEG */}
                <button
                  type="button"
                  onClick={() => setFormat("jpeg-portal")}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    isPortalMode
                      ? "bg-blue-600/15 border-blue-500 text-white shadow-md shadow-blue-500/10"
                      : "bg-slate-800/40 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:border-slate-600"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-sm flex items-center gap-1.5">
                      <FileCheck2 className="w-4 h-4 text-emerald-400" />
                      Portal-Ready JPEG
                    </span>
                    {isPortalMode && <Check className="w-4 h-4 text-blue-400" />}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    US DS-160, Indian OCI & visa portals. Strict ≤ 240 KB target with 300 DPI metadata.
                  </p>
                </button>

                {/* Format 2: Print JPEG */}
                <button
                  type="button"
                  onClick={() => setFormat("jpeg-highres")}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    isHighResJpeg
                      ? "bg-blue-600/15 border-blue-500 text-white shadow-md shadow-blue-500/10"
                      : "bg-slate-800/40 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:border-slate-600"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-sm flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-blue-400" />
                      High-Res Print JPEG
                    </span>
                    {isHighResJpeg && <Check className="w-4 h-4 text-blue-400" />}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    Maximum photographic fidelity (96% quality). Ideal for kiosks, labs and home prints.
                  </p>
                </button>

                {/* Format 3: Lossless PNG */}
                <button
                  type="button"
                  onClick={() => setFormat("png-lossless")}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    isPngMode
                      ? "bg-blue-600/15 border-blue-500 text-white shadow-md shadow-blue-500/10"
                      : "bg-slate-800/40 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:border-slate-600"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-sm flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-violet-400" />
                      Lossless Cutout PNG
                    </span>
                    {isPngMode && <Check className="w-4 h-4 text-blue-400" />}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    Lossless compression with transparency support and embedded pHYs resolution tag.
                  </p>
                </button>

                {/* Format 4: Vector PDF */}
                <button
                  type="button"
                  onClick={() => setFormat("pdf-single")}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    isPdfMode
                      ? "bg-blue-600/15 border-blue-500 text-white shadow-md shadow-blue-500/10"
                      : "bg-slate-800/40 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:border-slate-600"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-sm flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-amber-400" />
                      Single-Photo PDF
                    </span>
                    {isPdfMode && <Check className="w-4 h-4 text-blue-400" />}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    Exact physical millimeter page dimensions (72 pt/in). Zero printer scaling distortion.
                  </p>
                </button>
              </div>
            </div>

            {/* 2. Target File Size Limit (Only in Portal JPEG Mode) */}
            {isPortalMode && (
              <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    Government Portal File Size Ceiling:
                  </label>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    ≤ {targetMaxKb} KB
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: "100 KB", value: 100, desc: "India Online" },
                    { label: "200 KB", value: 200, desc: "India OCI" },
                    { label: "240 KB", value: 240, desc: "US DS-160" },
                    { label: "500 KB", value: 500, desc: "Schengen/UK" },
                  ].map((preset) => (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => setTargetMaxKb(preset.value)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border text-center transition-all ${
                        targetMaxKb === preset.value
                          ? "bg-emerald-600/20 border-emerald-500 text-emerald-300"
                          : "bg-slate-800 border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700"
                      }`}
                    >
                      <div>{preset.label}</div>
                      <div className="text-[9px] text-slate-400 font-normal">{preset.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 3. DPI Resolution Selector */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 block">
                Output Print Resolution (DPI Density)
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDpi(300)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    dpi === 300
                      ? "bg-blue-600/15 border-blue-500 text-white"
                      : "bg-slate-800/40 border-slate-700/60 text-slate-400 hover:bg-slate-800"
                  }`}
                >
                  <div className="font-bold text-sm text-white">300 DPI (Standard)</div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {Math.round((selectedSpec.widthMm / 25.4) * 300)} ×{" "}
                    {Math.round((selectedSpec.heightMm / 25.4) * 300)} px
                  </div>
                  <div className="text-[10px] text-blue-400 mt-1">Official passport studio standard</div>
                </button>

                <button
                  type="button"
                  onClick={() => setDpi(600)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    dpi === 600
                      ? "bg-blue-600/15 border-blue-500 text-white"
                      : "bg-slate-800/40 border-slate-700/60 text-slate-400 hover:bg-slate-800"
                  }`}
                >
                  <div className="font-bold text-sm text-white">600 DPI (Ultra-Sharp)</div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {Math.round((selectedSpec.widthMm / 25.4) * 600)} ×{" "}
                    {Math.round((selectedSpec.heightMm / 25.4) * 600)} px
                  </div>
                  <div className="text-[10px] text-violet-400 mt-1">Maximum fine-art print density</div>
                </button>
              </div>
            </div>

            {/* 4. Technical Compliance Audit Info */}
            <div className="bg-slate-800/30 border border-slate-800 rounded-xl p-3.5 space-y-2 text-xs">
              <div className="font-semibold text-slate-300 flex items-center gap-1.5 mb-1">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                ICAO Doc 9303 & ISO/IEC 19794-5 Compliance Checklist:
              </div>
              <ul className="space-y-1.5 text-slate-400">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>
                    Exact Aspect Ratio: <strong>{(selectedSpec.widthMm / selectedSpec.heightMm).toFixed(3)}</strong>{" "}
                    ({selectedSpec.widthMm} × {selectedSpec.heightMm} mm)
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>
                    Embedded Metadata: <strong>{dpi} DPI JFIF/pHYs density tags</strong> injected
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>
                    Background:{" "}
                    <strong>
                      {transparentCutoutUrl && backgroundColor.toLowerCase() === "transparent"
                        ? "Transparent Alpha Cutout"
                        : `${backgroundColor.toUpperCase()} (Solid)`}
                    </strong>
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column: Live Output Preview & File Inspection */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-4 bg-slate-950/60 p-4 sm:p-5 rounded-2xl border border-slate-800/80">
            {/* Live Crop Preview Box */}
            <div className="flex flex-col items-center justify-center">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Output Preview
              </span>
              <div
                className="relative rounded-lg shadow-xl overflow-hidden border-2 border-slate-700/80 max-h-[260px] flex items-center justify-center bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:12px_12px]"
                style={{
                  aspectRatio: `${selectedSpec.widthMm} / ${selectedSpec.heightMm}`,
                  width: selectedSpec.widthMm > selectedSpec.heightMm ? "220px" : "auto",
                  height: selectedSpec.widthMm > selectedSpec.heightMm ? "auto" : "220px",
                }}
              >
                {previewDataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={previewDataUrl}
                    alt="Export preview"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="p-4 text-center text-xs text-slate-500">Generating preview…</div>
                )}
              </div>
            </div>

            {/* File Inspection Details */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-400">
                <span>Pixel Dimensions:</span>
                <span className="font-mono font-bold text-white">
                  {widthPx} × {heightPx} px
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Physical Size:</span>
                <span className="font-mono text-white">
                  {selectedSpec.widthMm} × {selectedSpec.heightMm} mm ({(selectedSpec.widthMm / 25.4).toFixed(2)} ×{" "}
                  {(selectedSpec.heightMm / 25.4).toFixed(2)} in)
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Resolution / Density:</span>
                <span className="font-mono text-emerald-400 font-semibold">{dpi} DPI</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Output File Size:</span>
                <span className="font-mono font-bold text-blue-400">
                  {exportResult ? exportResult.sizeKbFormatted : "Calculating…"}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Filename:</span>
                <span className="font-mono text-[10px] text-slate-300 truncate max-w-[160px]" title={exportResult?.filename}>
                  {exportResult?.filename || "photo.jpg"}
                </span>
              </div>
            </div>

            {/* Download Button */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleDownload}
                disabled={isExporting || !exportResult}
                className="w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 shadow-lg shadow-blue-500/25 active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isExporting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>Preparing Download…</span>
                  </>
                ) : exportSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span>Downloaded Successfully!</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>
                      Download {isPdfMode ? "PDF" : isPngMode ? "PNG" : "JPEG"} (
                      {exportResult ? exportResult.sizeKbFormatted : `${dpi} DPI`})
                    </span>
                  </>
                )}
              </button>

              <p className="text-[11px] text-center text-slate-500">
                Supports desktop downloads and iOS/Android native mobile saving.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
