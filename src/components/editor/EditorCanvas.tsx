"use client";

import React, { useRef, useState } from "react";
import { useEditor } from "@/lib/context/EditorContext";
import {
  Eye,
  EyeOff,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Move,
  UploadCloud,
  FileImage,
  Sparkles,
  Columns,
  Layers,
  AlertCircle,
  RefreshCw,
  Wand2,
  CheckCircle2,
  AlertTriangle,
  ScanFace,
  Shirt,
  Printer,
} from "lucide-react";

export function EditorCanvas() {
  const {
    imageSrc,
    originalImageSrc,
    transparentCutoutUrl,
    backgroundColor,
    adjustments,
    selectedSpec,
    showGuidelines,
    showBeforeAfter,
    showFaceLandmarks,
    faceDetectionState,
    biometricEvaluation,
    outfitState,
    enhancementState,
    enhancedImageUrl,
    updateAdjustments,
    setShowGuidelines,
    setShowBeforeAfter,
    setShowFaceLandmarks,
    resetAdjustments,
    replaceImage,
    uploadFile,
    triggerBiometricAutoCrop,
    setActiveSidebarTab,
    toggleEnhancementCompare,
    setIsPrintModalOpen,
  } = useEditor();

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isDropzoneDragging, setIsDropzoneDragging] = useState(false);
  const [splitSlider, setSplitSlider] = useState(50); // 0 to 100%

  // Calculate crop box aspect ratio based on selected country spec
  const aspectRatio = selectedSpec.widthMm / selectedSpec.heightMm;

  // Maximum dimensions for display crop box
  const cropBoxHeight = 440;
  const cropBoxWidth = Math.round(cropBoxHeight * aspectRatio);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - adjustments.panX,
      y: e.clientY - adjustments.panY,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const newPanX = Math.round(e.clientX - dragStart.x);
    const newPanY = Math.round(e.clientY - dragStart.y);
    updateAdjustments({ panX: newPanX, panY: newPanY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.08 : -0.08;
    const newZoom = Math.min(Math.max(0.5, Number((adjustments.zoom + delta).toFixed(2))), 3.0);
    updateAdjustments({ zoom: newZoom });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - adjustments.panX,
        y: e.touches[0].clientY - adjustments.panY,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    const newPanX = Math.round(e.touches[0].clientX - dragStart.x);
    const newPanY = Math.round(e.touches[0].clientY - dragStart.y);
    updateAdjustments({ panX: newPanX, panY: newPanY });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleDropzoneDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDropzoneDragging(true);
  };

  const handleDropzoneDragLeave = () => {
    setIsDropzoneDragging(false);
  };

  const handleDropzoneDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDropzoneDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      uploadFile(files[0]);
    }
  };

  const baseImage =
    outfitState.outputImageUrl && outfitState.previewMode
      ? outfitState.outputImageUrl
      : transparentCutoutUrl || imageSrc;

  // When enhancement is active and compareMode is false, display the enhanced portrait
  const displayImageSrc =
    enhancementState.settings.enabled && !enhancementState.compareMode && enhancedImageUrl && !enhancementState.isProcessing
      ? enhancedImageUrl
      : baseImage;

  const activeDisplaySrc: string | undefined = displayImageSrc ?? undefined;

  const canvasBgStyle =
    transparentCutoutUrl && backgroundColor === "transparent"
      ? {
          backgroundImage:
            "linear-gradient(45deg, #cbd5e1 25%, transparent 25%), linear-gradient(-45deg, #cbd5e1 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #cbd5e1 75%), linear-gradient(-45deg, transparent 75%, #cbd5e1 75%)",
          backgroundSize: "16px 16px",
          backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0px",
          backgroundColor: "#f8fafc",
        }
      : {
          backgroundColor: transparentCutoutUrl ? backgroundColor : "#ffffff",
        };

  // Guideline calculations from spec
  const eyeLineTopPct = Math.round((1 - (selectedSpec.eyeMinHeightPercentage || 0.58)) * 100);
  const crownLineTopPct = Math.max(10, Math.round((1 - selectedSpec.headMaxPercentage) * 100));
  const chinLineTopPct = 76;

  const primaryFace = faceDetectionState.result?.primaryFace;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onWheel={imageSrc ? handleWheel : undefined}
      onDragOver={handleDropzoneDragOver}
      onDragLeave={handleDropzoneDragLeave}
      onDrop={handleDropzoneDrop}
      className="relative w-full h-full min-h-[500px] flex items-center justify-center bg-slate-950 select-none overflow-hidden"
    >
      {/* Background checkered pattern */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(#94a3b8 1px, transparent 1px), radial-gradient(#94a3b8 1px, #020617 1px)",
          backgroundSize: "24px 24px",
          backgroundPosition: "0 0, 12px 12px",
        }}
      />

      {/* Main Viewport Container */}
      {displayImageSrc ? (
        <div
          style={{
            width: `${cropBoxWidth}px`,
            height: `${cropBoxHeight}px`,
            ...canvasBgStyle,
          }}
          className="relative rounded-2xl shadow-2xl overflow-hidden border-2 border-slate-700/80 ring-1 ring-white/10 transition-shadow duration-300"
        >
          {/* Before-and-After Split Slider Mode */}
          {showBeforeAfter && originalImageSrc && transparentCutoutUrl ? (
            <div className="relative w-full h-full overflow-hidden">
              {/* After (Cutout with colored background) */}
              <div
                className="w-full h-full flex items-center justify-center"
                style={canvasBgStyle}
              >
                <img
                  src={transparentCutoutUrl}
                  alt="AI Cutout"
                  draggable={false}
                  style={{
                    transform: `translate(${adjustments.panX}px, ${adjustments.panY}px) rotate(${adjustments.rotation}deg) scale(${
                      adjustments.flipHorizontal ? -adjustments.zoom : adjustments.zoom
                    }, ${adjustments.flipVertical ? -adjustments.zoom : adjustments.zoom})`,
                    filter: `brightness(${100 + adjustments.brightness}%) contrast(${
                      100 + adjustments.contrast
                    }%) saturate(${100 + adjustments.saturation}%)`,
                    maxWidth: "none",
                    maxHeight: "none",
                  }}
                  className="pointer-events-none object-cover"
                />
              </div>

              {/* Before (Original photo clipped by split slider) */}
              <div
                className="absolute inset-0 overflow-hidden pointer-events-none"
                style={{ width: `${splitSlider}%`, backgroundColor: "#ffffff" }}
              >
                <div className="w-full h-full flex items-center justify-center">
                  <img
                    src={originalImageSrc}
                    alt="Original Photo"
                    draggable={false}
                    style={{
                      transform: `translate(${adjustments.panX}px, ${adjustments.panY}px) rotate(${adjustments.rotation}deg) scale(${
                        adjustments.flipHorizontal ? -adjustments.zoom : adjustments.zoom
                      }, ${adjustments.flipVertical ? -adjustments.zoom : adjustments.zoom})`,
                      filter: `brightness(${100 + adjustments.brightness}%) contrast(${
                        100 + adjustments.contrast
                      }%) saturate(${100 + adjustments.saturation}%)`,
                      maxWidth: "none",
                      maxHeight: "none",
                    }}
                    className="object-cover"
                  />
                </div>
                <div className="absolute top-2 left-2 bg-slate-900/80 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                  Original
                </div>
              </div>

              {/* Split Slider Line & Control */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-white shadow-md pointer-events-none z-20"
                style={{ left: `${splitSlider}%` }}
              >
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-white border border-blue-600 shadow-md flex items-center justify-center text-[10px] text-blue-600 font-bold">
                  ↔
                </div>
              </div>

              <input
                type="range"
                min="0"
                max="100"
                value={splitSlider}
                onChange={(e) => setSplitSlider(Number(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
                aria-label="Before after split slider"
              />

              <div className="absolute top-2 right-2 bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded pointer-events-none z-10">
                AI Cutout
              </div>
            </div>
          ) : (
            /* Standard Interactive View */
            <div
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
              className={`w-full h-full flex items-center justify-center ${
                isDragging ? "cursor-grabbing" : "cursor-grab"
              }`}
            >
              <img
                ref={imageRef}
                src={activeDisplaySrc}
                alt="Passport Photo Viewport"
                draggable={false}
                style={{
                  transform: `translate(${adjustments.panX}px, ${adjustments.panY}px) rotate(${adjustments.rotation}deg) scale(${
                    adjustments.flipHorizontal ? -adjustments.zoom : adjustments.zoom
                  }, ${adjustments.flipVertical ? -adjustments.zoom : adjustments.zoom})`,
                  filter: `brightness(${100 + adjustments.brightness}%) contrast(${
                    100 + adjustments.contrast
                  }%) saturate(${100 + adjustments.saturation}%)`,
                  transition: isDragging ? "none" : "filter 0.15s ease",
                  maxWidth: "none",
                  maxHeight: "none",
                }}
                className="pointer-events-none object-cover"
              />
            </div>
          )}

          {/* Biometric ICAO Guidelines Overlay */}
          {showGuidelines && (
            <div className="absolute inset-0 pointer-events-none z-10">
              {/* Midline Vertical Guide */}
              <div className="absolute top-0 bottom-0 left-1/2 w-px border-l border-dashed border-emerald-400/80 -translate-x-1/2" />

              {/* Crown of Head Guide */}
              <div
                className="absolute left-0 right-0 border-b border-dashed border-emerald-400/80 flex justify-between px-2"
                style={{ top: `${crownLineTopPct}%` }}
              >
                <span className="text-[9px] font-semibold text-emerald-900 bg-emerald-300/90 px-1 py-0.2 rounded shadow-xs">
                  Crown Limit ({Math.round(selectedSpec.headMaxPercentage * 100)}%)
                </span>
              </div>

              {/* Eye Plane Guide */}
              <div
                className="absolute left-0 right-0 border-b-2 border-cyan-400/90 flex justify-between px-2 shadow-xs"
                style={{ top: `${eyeLineTopPct}%` }}
              >
                <span className="text-[9px] font-bold text-cyan-950 bg-cyan-300/95 px-1.5 py-0.5 rounded shadow-xs flex items-center gap-1">
                  <span>Eye Level</span>
                  <span className="text-[8px] font-normal opacity-80">({100 - eyeLineTopPct}%)</span>
                </span>
              </div>

              {/* Bottom of Chin Guide */}
              <div
                className="absolute left-0 right-0 border-b border-dashed border-emerald-400/80 flex justify-between px-2"
                style={{ top: `${chinLineTopPct}%` }}
              >
                <span className="text-[9px] font-semibold text-emerald-900 bg-emerald-300/90 px-1 py-0.2 rounded shadow-xs">
                  Chin Base
                </span>
              </div>

              {/* Biometric Facial Target Oval Guide */}
              <div
                className="absolute left-1/2 -translate-x-1/2 rounded-[50%] border-2 border-dashed border-emerald-400/50 pointer-events-none"
                style={{
                  top: `${crownLineTopPct}%`,
                  height: `${chinLineTopPct - crownLineTopPct}%`,
                  width: `${(chinLineTopPct - crownLineTopPct) * 0.72}%`,
                }}
              />
            </div>
          )}

          {/* Corner alignment markers */}
          <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-white pointer-events-none" />
          <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-white pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-white pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-white pointer-events-none" />
        </div>
      ) : (
        /* Empty Dropzone State */
        <div
          onClick={replaceImage}
          className={`max-w-md w-full mx-4 rounded-3xl border-2 border-dashed p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 ${
            isDropzoneDragging
              ? "border-blue-500 bg-blue-950/40 scale-102"
              : "border-slate-700 bg-slate-900/60 hover:border-slate-500 hover:bg-slate-900"
          }`}
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-blue-600/30">
            <UploadCloud className="w-8 h-8 animate-bounce" />
          </div>
          <h3 className="text-white text-lg font-bold mb-1">Upload Photo to Begin</h3>
          <p className="text-slate-400 text-xs sm:text-sm max-w-xs mx-auto mb-5">
            Drag & drop your portrait here, or click to browse.
          </p>
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors shadow-md">
            <FileImage className="w-4 h-4" />
            <span>Select Image File</span>
          </div>
        </div>
      )}

      {/* Floating Canvas Top Overlay */}
      {displayImageSrc && (
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-20">
          <div className="pointer-events-auto flex items-center gap-2">
            <div className="bg-slate-800/90 backdrop-blur-md text-white border border-slate-700 px-3 py-1.5 rounded-xl shadow-lg text-xs font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>
                {selectedSpec.country} {selectedSpec.documentType} ({selectedSpec.widthMm}×{selectedSpec.heightMm} mm)
              </span>
            </div>

            {/* Biometric Compliance Badge */}
            {biometricEvaluation && (
              <button
                type="button"
                onClick={() => setActiveSidebarTab("compliance")}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold backdrop-blur-md shadow-md border flex items-center gap-1.5 transition-all ${
                  biometricEvaluation.isFullyCompliant
                    ? "bg-emerald-950/80 border-emerald-700/80 text-emerald-200 hover:bg-emerald-900"
                    : "bg-amber-950/80 border-amber-700/80 text-amber-200 hover:bg-amber-900"
                }`}
                title="View Biometric Compliance Report"
              >
                {biometricEvaluation.isFullyCompliant ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                )}
                <span>{biometricEvaluation.score}% ICAO Compliant</span>
              </button>
            )}
          </div>

          <div className="pointer-events-auto flex items-center gap-2">
            {/* Quick 1-Click Biometric Auto-Crop Button */}
            <button
              type="button"
              onClick={triggerBiometricAutoCrop}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg border border-blue-400/40 flex items-center gap-1.5 transition-all active:scale-95"
              title="Automatically center face and crop to official country specifications"
            >
              <Wand2 className="w-3.5 h-3.5 text-amber-300" />
              <span>Auto-Crop to Spec</span>
            </button>

            {/* Before-and-After Toggle Button */}
            {transparentCutoutUrl && (
              <button
                type="button"
                onClick={() => setShowBeforeAfter(!showBeforeAfter)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold backdrop-blur-md shadow-lg border transition-all flex items-center gap-1.5 ${
                  showBeforeAfter
                    ? "bg-violet-600 text-white border-violet-500"
                    : "bg-slate-800/90 hover:bg-slate-800 text-slate-300 border-slate-700"
                }`}
                title="Toggle Before/After Comparison Slider"
              >
                <Columns className="w-3.5 h-3.5" />
                <span>{showBeforeAfter ? "Close Split" : "Before/After"}</span>
              </button>
            )}

            {/* Outfit Preview Badge (when outfit applied) */}
            {outfitState.outputImageUrl && (
              <button
                type="button"
                onClick={() => setActiveSidebarTab("outfit")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold backdrop-blur-md shadow-lg border transition-all flex items-center gap-1.5 ${
                  outfitState.previewMode
                    ? "bg-violet-600 text-white border-violet-500"
                    : "bg-slate-800/90 hover:bg-slate-800 text-slate-300 border-slate-700"
                }`}
                title="AI Outfit is applied — click to manage"
              >
                <Shirt className="w-3.5 h-3.5" />
                <span>{outfitState.previewMode ? "Outfit On" : "Show Outfit"}</span>
              </button>
            )}

            {/* AI Portrait Enhancement Badge / Compare Button (Phase 7) */}
            {enhancementState.settings.enabled && (
              <button
                type="button"
                onClick={() => toggleEnhancementCompare()}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold backdrop-blur-md shadow-lg border transition-all flex items-center gap-1.5 ${
                  enhancementState.compareMode
                    ? "bg-amber-400 text-slate-950 border-amber-300 font-bold"
                    : "bg-blue-600 text-white border-blue-500"
                }`}
                title={
                  enhancementState.compareMode
                    ? "Comparing: showing Original photo (click to show Enhanced)"
                    : "Enhanced portrait is active (click to compare with Original)"
                }
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{enhancementState.compareMode ? "Original" : "Enhanced"}</span>
              </button>
            )}

            {/* ICAO Guidelines Toggle */}
            <button
              type="button"
              onClick={() => setShowGuidelines(!showGuidelines)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold backdrop-blur-md shadow-lg border transition-all flex items-center gap-1.5 ${
                showGuidelines
                  ? "bg-emerald-600/90 hover:bg-emerald-600 text-white border-emerald-500"
                  : "bg-slate-800/90 hover:bg-slate-800 text-slate-300 border-slate-700"
              }`}
            >
              {showGuidelines ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span>ICAO Guides</span>
            </button>

            {/* Print Sheet Generator Button */}
            <button
              type="button"
              onClick={() => setIsPrintModalOpen(true)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800/90 hover:bg-slate-800 text-blue-400 hover:text-blue-300 border border-slate-700 backdrop-blur-md shadow-lg transition-all flex items-center gap-1.5"
              title="Open Bulk Print Sheet Generator"
            >
              <Printer className="w-3.5 h-3.5 text-blue-400" />
              <span>Print Sheet</span>
            </button>
          </div>
        </div>
      )}

      {/* Floating Canvas Bottom Overlay: Zoom & Reset */}
      {displayImageSrc && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-slate-800/95 backdrop-blur-md text-white border border-slate-700 px-3 py-2 rounded-2xl shadow-xl z-20">
          <button
            type="button"
            onClick={() => updateAdjustments({ zoom: Math.max(0.5, Number((adjustments.zoom - 0.1).toFixed(1))) })}
            className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          <span className="text-xs font-bold text-slate-200 min-w-[45px] text-center">
            {Math.round(adjustments.zoom * 100)}%
          </span>

          <button
            type="button"
            onClick={() => updateAdjustments({ zoom: Math.min(3.0, Number((adjustments.zoom + 0.1).toFixed(1))) })}
            className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <div className="w-px h-4 bg-slate-700 mx-1" />

          <button
            type="button"
            onClick={resetAdjustments}
            className="px-2.5 py-1 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-700 flex items-center gap-1 transition-colors"
            title="Reset Adjustments"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        </div>
      )}
    </div>
  );
}
