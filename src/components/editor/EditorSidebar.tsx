"use client";

import React, { useState } from "react";
import { useEditor } from "@/lib/context/EditorContext";
import {
  OFFICIAL_COUNTRY_SPECS,
  PassportSpec,
  CustomDimensionOptions,
} from "@/lib/constants/countries";
import { exportCroppedCanvas } from "@/lib/image/canvasRenderer";
import { COMPLIANT_BACKGROUND_COLORS, SidebarTab } from "@/types/editor";
import { PERSONA_LIST, AI_PERSONAS } from "@/lib/constants/personas";
import {
  Sliders,
  Globe2,
  ShieldCheck,
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  Sun,
  Contrast,
  Palette,
  Download,
  Upload,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Trash2,
  MoveHorizontal,
  MoveVertical,
  Scissors,
  Sparkles,
  Columns,
  Check,
  Pipette,
  Wand2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Search,
  ScanFace,
  Settings2,
  Shirt,
  Printer,
} from "lucide-react";
import { OutfitSelector } from "@/components/editor/OutfitSelector";
import { PortraitEnhancerPanel } from "@/components/editor/PortraitEnhancerPanel";
import { GuidedStudioModal } from "@/components/studio/GuidedStudioModal";

export function EditorSidebar() {
  const {
    imageSrc,
    originalImageSrc,
    transparentCutoutUrl,
    backgroundColor,
    imageMetadata,
    adjustments,
    selectedSpec,
    activeSidebarTab,
    bgRemovalState,
    faceDetectionState,
    biometricEvaluation,
    customDimensions,
    showBeforeAfter,
    canUndo,
    outfitState,
    enhancementState,
    isPrintModalOpen,
    setIsPrintModalOpen,
    updateAdjustments,
    resetAdjustments,
    undoAdjustments,
    setSelectedSpec,
    setActiveSidebarTab,
    setBackgroundColor,
    triggerBackgroundRemoval,
    restoreOriginalBackground,
    setShowBeforeAfter,
    replaceImage,
    deleteImage,
    triggerBiometricAutoCrop,
    runFaceDetection,
    applyCustomDimensions,
    activePersona,
    setActivePersona,
    autoPilotState,
    runAiAutoPilot,
    applyStudioResult,
  } = useEditor();

  const [isStudioModalOpen, setIsStudioModalOpen] = useState(false);

  const [customColorHex, setCustomColorHex] = useState("#FFFFFF");
  const [countrySearch, setCountrySearch] = useState("");
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customFormState, setCustomFormState] = useState<CustomDimensionOptions>(customDimensions);

  // Filter country specs by search query
  const filteredSpecs = OFFICIAL_COUNTRY_SPECS.filter(
    (s) =>
      s.country.toLowerCase().includes(countrySearch.toLowerCase()) ||
      s.documentType.toLowerCase().includes(countrySearch.toLowerCase()) ||
      s.countryCode.toLowerCase().includes(countrySearch.toLowerCase())
  );

  const handleDownloadCrop = () => {
    const srcToExport = transparentCutoutUrl || imageSrc;
    if (!srcToExport) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const cropHeight = 440;
      const cropWidth = Math.round(cropHeight * (selectedSpec.widthMm / selectedSpec.heightMm));
      const dataUrl = exportCroppedCanvas(
        img,
        adjustments,
        selectedSpec,
        cropWidth,
        cropHeight,
        transparentCutoutUrl ? backgroundColor : "#FFFFFF",
        enhancementState?.settings
      );

      const isTransparent = transparentCutoutUrl && backgroundColor.toLowerCase() === "transparent";
      const ext = isTransparent ? "png" : "jpg";
      const link = document.createElement("a");
      link.download = `${selectedSpec.country.toLowerCase().replace(/\s+/g, "-")}-${selectedSpec.documentType.toLowerCase()}-300dpi.${ext}`;
      link.href = dataUrl;
      link.click();
    };
    img.src = srcToExport;
  };

  const handleApplyCustom = (e: React.FormEvent) => {
    e.preventDefault();
    applyCustomDimensions(customFormState);
    setShowCustomForm(false);
  };

  return (
    <aside className="w-full lg:w-96 bg-white border-l border-slate-200 flex flex-col h-full shadow-lg z-20">
      {/* 1-Click AI Auto-Pilot Toolbar */}
      <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
            <span>AI Auto-Pilot Profile:</span>
          </span>
          <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-full">
            1-Click Magic
          </span>
        </div>

        {/* Persona Quick Picker */}
        <div className="grid grid-cols-4 gap-1.5 mb-2.5">
          {PERSONA_LIST.map((p) => {
            const isSelected = activePersona === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setActivePersona(p.id)}
                className={`py-1 px-1 rounded-xl text-center border transition-all text-xs cursor-pointer ${
                  isSelected
                    ? "border-blue-600 bg-white text-blue-700 font-bold shadow-xs ring-1 ring-blue-500/20"
                    : "border-slate-200 bg-white/70 text-slate-600 hover:bg-white"
                }`}
                title={p.label}
              >
                <span className="text-base block">{p.icon}</span>
                <span className="text-[10px] block truncate font-medium">{p.shortLabel}</span>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setIsStudioModalOpen(true)}
            className="w-full py-2 px-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>AI Studio Wizard</span>
          </button>

          <button
            type="button"
            onClick={() => runAiAutoPilot(activePersona)}
            disabled={autoPilotState.isRunning}
            className="w-full py-2 px-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-60"
          >
            {autoPilotState.isRunning ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Running...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Run 1-Click AI Auto-Pilot</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Sidebar Navigation Tabs */}
      <div className="flex border-b border-slate-200 bg-slate-50/80 p-1">
        <button
          type="button"
          onClick={() => setActiveSidebarTab("crop")}
          className={`flex-1 py-2 px-1 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all ${
            activeSidebarTab === "crop"
              ? "bg-white text-blue-700 shadow-xs border border-slate-200"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Globe2 className="w-3.5 h-3.5" />
          <span>Crop & Specs</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSidebarTab("compliance")}
          className={`flex-1 py-2 px-1 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all relative ${
            activeSidebarTab === "compliance"
              ? "bg-white text-blue-700 shadow-xs border border-slate-200"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Audit</span>
          {biometricEvaluation && (
            <span
              className={`w-2 h-2 rounded-full absolute top-1.5 right-1.5 ${
                biometricEvaluation.isFullyCompliant ? "bg-emerald-500" : "bg-amber-500 animate-pulse"
              }`}
            />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveSidebarTab("background")}
          className={`flex-1 py-2 px-1 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all relative ${
            activeSidebarTab === "background"
              ? "bg-white text-blue-700 shadow-xs border border-slate-200"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Scissors className="w-3.5 h-3.5" />
          <span>Background</span>
          {transparentCutoutUrl && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 absolute top-1.5 right-1.5" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveSidebarTab("adjust")}
          className={`flex-1 py-2 px-1 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all relative ${
            activeSidebarTab === "adjust"
              ? "bg-white text-blue-700 shadow-xs border border-slate-200"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Enhance</span>
          {enhancementState.settings.enabled && (
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 absolute top-1.5 right-1.5" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveSidebarTab("outfit")}
          className={`flex-1 py-2 px-1 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all relative ${
            activeSidebarTab === "outfit"
              ? "bg-white text-violet-700 shadow-xs border border-slate-200"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Shirt className="w-3.5 h-3.5" />
          <span>Outfit</span>
          {outfitState.outputImageUrl && (
            <span className="w-1.5 h-1.5 rounded-full bg-violet-500 absolute top-1.5 right-1.5" />
          )}
        </button>
      </div>

      {/* Tab Contents (Scrollable) */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* 1. CROP & COUNTRY SPECS TAB */}
        {activeSidebarTab === "crop" && (
          <div className="space-y-5">
            {/* 1-Click Biometric Auto-Crop Card */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 rounded-2xl p-4 text-white shadow-md shadow-blue-500/20">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-lg bg-white/20 text-white">
                  <Wand2 className="w-4 h-4 text-amber-300" />
                </div>
                <div>
                  <h4 className="text-sm font-bold">Biometric Auto-Crop</h4>
                  <span className="text-[10px] text-blue-100">ICAO Doc 9303 & ISO/IEC 19794-5</span>
                </div>
              </div>
              <p className="text-xs text-blue-100 mb-3 leading-relaxed">
                Automatically detects face landmarks, centers eyes on the biometric eye plane, scales head height to the legal {Math.round(selectedSpec.headMinPercentage * 100)}–{Math.round(selectedSpec.headMaxPercentage * 100)}% bracket, and levels tilt.
              </p>
              <button
                type="button"
                onClick={triggerBiometricAutoCrop}
                className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-blue-50 text-blue-700 font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2 active:scale-98"
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Auto-Crop to {selectedSpec.country} Spec</span>
              </button>
            </div>

            {/* Country Document Selector */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Select Country & Document
                </label>
                <span className="text-[11px] font-mono text-slate-400">
                  {OFFICIAL_COUNTRY_SPECS.length} Official Presets
                </span>
              </div>

              {/* Search input */}
              <div className="relative mb-2">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={countrySearch}
                  onChange={(e) => setCountrySearch(e.target.value)}
                  placeholder="Search countries (e.g. India, USA, UK, UAE...)"
                  className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Country dropdown */}
              <select
                value={selectedSpec.id}
                onChange={(e) => {
                  const found = OFFICIAL_COUNTRY_SPECS.find((s) => s.id === e.target.value);
                  if (found) setSelectedSpec(found);
                }}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
              >
                {filteredSpecs.map((spec) => (
                  <option key={spec.id} value={spec.id}>
                    {spec.country} — {spec.documentType} ({spec.widthMm} × {spec.heightMm} mm)
                  </option>
                ))}
              </select>
            </div>

            {/* Official Specification Metadata Card */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs space-y-2.5">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <div>
                  <span className="font-bold text-slate-900 text-sm block">
                    {selectedSpec.country}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {selectedSpec.documentType} Specification
                  </span>
                </div>
                <span className="font-mono font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-[11px]">
                  {selectedSpec.aspectRatio}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                <div>
                  <span className="text-slate-500 block">Physical Size</span>
                  <span className="font-bold text-slate-800">
                    {selectedSpec.widthMm} × {selectedSpec.heightMm} mm
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Exact Pixels @ 300 DPI</span>
                  <span className="font-mono font-bold text-slate-800">
                    {selectedSpec.widthPx300Dpi} × {selectedSpec.heightPx300Dpi} px
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Head Coverage</span>
                  <span className="font-bold text-blue-700">
                    {Math.round(selectedSpec.headMinPercentage * 100)}% – {Math.round(selectedSpec.headMaxPercentage * 100)}% of height
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Required BG</span>
                  <span className="font-bold text-slate-800 capitalize">
                    {selectedSpec.backgroundColor.replace("-", " ")}
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200/80 leading-relaxed">
                {selectedSpec.guidelineNotes}
              </p>

              <div className="flex items-center justify-between pt-1 border-t border-slate-200 text-[10px] text-slate-400">
                <span>Verified: {selectedSpec.verifiedDate}</span>
                {selectedSpec.officialSource.startsWith("http") && (
                  <a
                    href={selectedSpec.officialSource}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <span>Official Agency Source</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>

            {/* Custom Dimensions Accordion */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <button
                type="button"
                onClick={() => setShowCustomForm(!showCustomForm)}
                className="w-full p-3 bg-slate-50 hover:bg-slate-100 flex items-center justify-between text-xs font-bold text-slate-700 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Settings2 className="w-4 h-4 text-blue-600" />
                  <span>Custom Width, Height & DPI</span>
                </div>
                {showCustomForm ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showCustomForm && (
                <form onSubmit={handleApplyCustom} className="p-4 space-y-3 bg-white text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                        Width
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="1"
                        value={customFormState.width}
                        onChange={(e) =>
                          setCustomFormState((prev) => ({ ...prev, width: Number(e.target.value) }))
                        }
                        className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-800"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                        Height
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="1"
                        value={customFormState.height}
                        onChange={(e) =>
                          setCustomFormState((prev) => ({ ...prev, height: Number(e.target.value) }))
                        }
                        className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-800"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                        Unit
                      </label>
                      <select
                        value={customFormState.unit}
                        onChange={(e) =>
                          setCustomFormState((prev) => ({ ...prev, unit: e.target.value as any }))
                        }
                        className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-800"
                      >
                        <option value="mm">Millimeters (mm)</option>
                        <option value="cm">Centimeters (cm)</option>
                        <option value="inch">Inches (in)</option>
                        <option value="pixel">Pixels (px)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                        Print DPI
                      </label>
                      <select
                        value={customFormState.dpi}
                        onChange={(e) =>
                          setCustomFormState((prev) => ({ ...prev, dpi: Number(e.target.value) as any }))
                        }
                        className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-800"
                      >
                        <option value={300}>300 DPI (Standard)</option>
                        <option value={600}>600 DPI (Ultra HD)</option>
                        <option value={150}>150 DPI (Web/Draft)</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors"
                  >
                    Apply Custom Specification
                  </button>
                </form>
              )}
            </div>

            {/* Manual Positioning & Crop Sliders */}
            <div className="space-y-4 pt-2 border-t border-slate-200">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                Manual Positioning & Sizing
              </span>

              {/* Zoom Slider */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span>Zoom Scale</span>
                  </span>
                  <span className="font-mono font-bold text-slate-900">
                    {Math.round(adjustments.zoom * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="3.0"
                  step="0.05"
                  value={adjustments.zoom}
                  onChange={(e) => updateAdjustments({ zoom: Number(e.target.value) })}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              {/* Horizontal Pan X */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600 flex items-center gap-1">
                    <MoveHorizontal className="w-3.5 h-3.5 text-slate-500" />
                    <span>Horizontal Center (Pan X)</span>
                  </span>
                  <span className="font-mono font-bold text-slate-900">{adjustments.panX}px</span>
                </div>
                <input
                  type="range"
                  min="-200"
                  max="200"
                  value={adjustments.panX}
                  onChange={(e) => updateAdjustments({ panX: Number(e.target.value) })}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              {/* Vertical Pan Y */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600 flex items-center gap-1">
                    <MoveVertical className="w-3.5 h-3.5 text-slate-500" />
                    <span>Vertical Position (Pan Y)</span>
                  </span>
                  <span className="font-mono font-bold text-slate-900">{adjustments.panY}px</span>
                </div>
                <input
                  type="range"
                  min="-200"
                  max="200"
                  value={adjustments.panY}
                  onChange={(e) => updateAdjustments({ panY: Number(e.target.value) })}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              {/* Fine Rotation */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600 flex items-center gap-1">
                    <RotateCw className="w-3.5 h-3.5 text-slate-500" />
                    <span>Deskew Tilt Rotation</span>
                  </span>
                  <span className="font-mono font-bold text-slate-900">{adjustments.rotation}°</span>
                </div>
                <input
                  type="range"
                  min="-45"
                  max="45"
                  step="0.5"
                  value={adjustments.rotation}
                  onChange={(e) => updateAdjustments({ rotation: Number(e.target.value) })}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              {/* Quick Rotation & Flip Buttons */}
              <div className="grid grid-cols-4 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => updateAdjustments({ rotation: (adjustments.rotation - 90) % 360 })}
                  className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1"
                  title="Rotate 90° Left"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>-90°</span>
                </button>
                <button
                  type="button"
                  onClick={() => updateAdjustments({ rotation: (adjustments.rotation + 90) % 360 })}
                  className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1"
                  title="Rotate 90° Right"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>+90°</span>
                </button>
                <button
                  type="button"
                  onClick={() => updateAdjustments({ flipHorizontal: !adjustments.flipHorizontal })}
                  className={`p-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1 ${
                    adjustments.flipHorizontal ? "bg-blue-50 border-blue-400 text-blue-700" : "border-slate-200 text-slate-700"
                  }`}
                  title="Flip Horizontal"
                >
                  <FlipHorizontal className="w-3.5 h-3.5" />
                  <span>Flip H</span>
                </button>
                <button
                  type="button"
                  onClick={() => updateAdjustments({ flipVertical: !adjustments.flipVertical })}
                  className={`p-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1 ${
                    adjustments.flipVertical ? "bg-blue-50 border-blue-400 text-blue-700" : "border-slate-200 text-slate-700"
                  }`}
                  title="Flip Vertical"
                >
                  <FlipVertical className="w-3.5 h-3.5" />
                  <span>Flip V</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 2. BIOMETRIC COMPLIANCE AUDIT TAB */}
        {activeSidebarTab === "compliance" && (
          <div className="space-y-5">
            {/* Overall Score Banner */}
            {biometricEvaluation ? (
              <div
                className={`rounded-2xl p-4 border text-xs shadow-xs ${
                  biometricEvaluation.isFullyCompliant
                    ? "bg-emerald-50/80 border-emerald-300 text-emerald-950"
                    : "bg-amber-50/80 border-amber-300 text-amber-950"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {biometricEvaluation.isFullyCompliant ? (
                      <div className="p-1.5 rounded-lg bg-emerald-600 text-white">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                    ) : (
                      <div className="p-1.5 rounded-lg bg-amber-600 text-white">
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-sm">
                        {biometricEvaluation.isFullyCompliant
                          ? "100% Biometric Compliant"
                          : "Compliance Attention Needed"}
                      </h4>
                      <span className="text-[10px] opacity-80">
                        {selectedSpec.country} {selectedSpec.documentType} Standards
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-black font-mono">
                      {biometricEvaluation.score}
                    </span>
                    <span className="text-[10px] block opacity-75">/ 100 PTS</span>
                  </div>
                </div>

                <p className="text-[11px] leading-relaxed opacity-90">
                  {biometricEvaluation.isFullyCompliant
                    ? "Your photo meets all ICAO Doc 9303 and national agency requirements for head height, eye level alignment, and resolution."
                    : "Review the items flagged below. Click 'Auto-Crop to Spec' to automatically align facial coordinates."}
                </p>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 text-center">
                Upload a portrait to run biometric compliance checks.
              </div>
            )}

            {/* Itemized Checks */}
            {biometricEvaluation && (
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                  Detailed Biometric Audit Checks
                </span>

                {biometricEvaluation.checks.map((check) => (
                  <div
                    key={check.id}
                    className="p-3 rounded-xl border bg-white shadow-2xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {check.status === "pass" && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        )}
                        {check.status === "warning" && (
                          <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                        )}
                        {check.status === "fail" && (
                          <XCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                        )}
                        <span className="font-bold text-slate-800 text-xs">{check.title}</span>
                      </div>
                      <span
                        className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                          check.status === "pass"
                            ? "bg-emerald-100 text-emerald-800"
                            : check.status === "warning"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {check.status}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-700 pl-6">{check.message}</p>
                    {check.details && (
                      <p className="text-[10px] text-slate-400 pl-6">{check.details}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Quick Auto-Fix Action */}
            <div className="pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={triggerBiometricAutoCrop}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                <Wand2 className="w-4 h-4" />
                <span>Auto-Align All Facial Parameters</span>
              </button>
            </div>
          </div>
        )}

        {/* 3. BACKGROUND TAB (PHASE 4) */}
        {activeSidebarTab === "background" && (
          <div className="space-y-6">
            <div className="bg-gradient-to-b from-blue-50/70 to-indigo-50/40 rounded-2xl p-4 border border-blue-200 shadow-xs">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-lg bg-blue-600 text-white shadow-xs">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">AI Background Removal</h4>
                  <span className="text-[10px] text-slate-500">RMBG-1.4 Sub-Pixel Hair Matting</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                Automatically isolates your portrait from background clutter, room shadows, and patterns with sub-pixel edge fidelity.
              </p>

              {transparentCutoutUrl ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between bg-emerald-100/80 text-emerald-800 px-3 py-1.5 rounded-xl text-xs font-semibold">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Cutout Active (Hair Preserved)
                    </span>
                    <span className="text-[10px] font-mono opacity-80">Local AI</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowBeforeAfter(!showBeforeAfter)}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                        showBeforeAfter
                          ? "bg-violet-600 text-white border-violet-600"
                          : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <Columns className="w-3.5 h-3.5" />
                      <span>{showBeforeAfter ? "Close Split" : "Before/After"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={restoreOriginalBackground}
                      className="py-2 px-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                      title="Restore original selfie background"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Original BG</span>
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={triggerBackgroundRemoval}
                  disabled={bgRemovalState.isProcessing}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white font-bold text-xs shadow-md shadow-blue-500/25 active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                  <span>
                    {bgRemovalState.isProcessing ? "Processing AI Cutout..." : "Isolate Background with AI"}
                  </span>
                </button>
              )}
            </div>

            {/* Background Color Swatches */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Select Replacement Color
                </span>
                <span className="text-[11px] text-blue-600 font-semibold capitalize">
                  {COMPLIANT_BACKGROUND_COLORS.find((c) => c.hex === backgroundColor)?.name || "Custom"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {COMPLIANT_BACKGROUND_COLORS.map((color) => {
                  const isSelected = backgroundColor.toLowerCase() === color.hex.toLowerCase();
                  return (
                    <button
                      key={color.id}
                      type="button"
                      onClick={() => setBackgroundColor(color.hex)}
                      className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                        isSelected
                          ? "border-blue-600 bg-blue-50/50 shadow-xs ring-1 ring-blue-600"
                          : "border-slate-200 bg-white hover:bg-slate-50"
                      }`}
                    >
                      <div
                        className="w-6 h-6 rounded-lg border border-slate-300 flex-shrink-0 relative overflow-hidden"
                        style={
                          color.hex === "transparent"
                            ? {
                                backgroundImage:
                                  "linear-gradient(45deg, #cbd5e1 25%, transparent 25%), linear-gradient(-45deg, #cbd5e1 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #cbd5e1 75%), linear-gradient(-45deg, transparent 75%, #cbd5e1 75%)",
                                backgroundSize: "8px 8px",
                              }
                            : { backgroundColor: color.hex }
                        }
                      >
                        {isSelected && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                            <Check className="w-3.5 h-3.5 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="overflow-hidden">
                        <span className="block text-xs font-bold text-slate-800 truncate">
                          {color.name}
                        </span>
                        <span className="block text-[10px] text-slate-400 font-mono">
                          {color.hex.toUpperCase()}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Color Picker */}
            <div className="pt-2 border-t border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
                Custom Palette Color
              </span>
              <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <input
                  type="color"
                  value={customColorHex}
                  onChange={(e) => {
                    setCustomColorHex(e.target.value);
                    setBackgroundColor(e.target.value);
                  }}
                  className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent p-0"
                />
                <input
                  type="text"
                  value={customColorHex}
                  onChange={(e) => {
                    setCustomColorHex(e.target.value);
                    if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
                      setBackgroundColor(e.target.value);
                    }
                  }}
                  placeholder="#FFFFFF"
                  className="w-28 uppercase font-mono text-xs font-bold p-1.5 bg-white border border-slate-300 rounded-lg text-slate-800"
                />
                <button
                  type="button"
                  onClick={() => setBackgroundColor(customColorHex)}
                  className="text-xs font-semibold text-blue-600 hover:underline ml-auto"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 4. AI PORTRAIT ENHANCEMENT TAB (PHASE 7) */}
        {activeSidebarTab === "adjust" && (
          <PortraitEnhancerPanel />
        )}

        {/* 5. OUTFIT REPLACEMENT TAB (PHASE 6) */}
        {activeSidebarTab === "outfit" && (
          <OutfitSelector />
        )}
      </div>

      {/* Sidebar Footer Actions */}
      <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-2.5">
        {/* Phase 8 Print Sheet Generator Trigger */}
        <button
          type="button"
          onClick={() => setIsPrintModalOpen(true)}
          disabled={!imageSrc}
          className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
        >
          <Printer className="w-4 h-4" />
          <span>Print Sheet Generator (A4, 4×6, PDF)</span>
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={replaceImage}
            className="py-2.5 px-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Replace Photo</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadCrop}
            disabled={!imageSrc}
            className="py-2.5 px-3 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Save 300 DPI</span>
          </button>
        </div>

        {imageSrc && (
          <button
            type="button"
            onClick={deleteImage}
            className="w-full py-2 px-3 rounded-xl text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Photo</span>
          </button>
        )}
      </div>

      {/* AI Passport Photo Studio Guided Setup Modal */}
      <GuidedStudioModal
        isOpen={isStudioModalOpen}
        onClose={() => setIsStudioModalOpen(false)}
        photoUrl={originalImageSrc || imageSrc || "/samples/sample-man.jpg"}
        onAcceptAndContinue={(studioRes) => {
          applyStudioResult(studioRes);
          setIsStudioModalOpen(false);
        }}
      />
    </aside>
  );
}
