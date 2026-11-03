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
    <aside className="w-full bg-[#11141B] flex flex-col h-full z-20 text-[#F5F7FA]">
      {/* 1-Click AI Auto-Pilot Toolbar */}
      <div className="p-3 bg-[#171B24] border-b border-[#292F3A]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#F5F7FA] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#8B7CFF] animate-pulse" />
            <span>AI Auto-Pilot Profile:</span>
          </span>
          <span className="text-[10px] bg-[#1C2230] text-[#8B7CFF] font-bold px-2 py-0.5 rounded-full border border-[#292F3A]">
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
                    ? "border-[#8B7CFF] bg-[#1C2230] text-[#8B7CFF] font-bold shadow-xs ring-1 ring-[#8B7CFF]/30"
                    : "border-[#292F3A] bg-[#11141B] text-[#9CA3AF] hover:text-[#F5F7FA] hover:bg-[#1C2230]"
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
            className="w-full py-2 px-2 rounded-xl bg-[#8B7CFF] hover:bg-[#7665F5] text-white font-bold text-xs shadow-md shadow-[#8B7CFF]/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>AI Studio Wizard</span>
          </button>

          <button
            type="button"
            onClick={() => runAiAutoPilot(activePersona)}
            disabled={autoPilotState.isRunning}
            className="w-full py-2 px-2 rounded-xl border border-[#292F3A] bg-[#1C2230] hover:bg-[#292F3A] text-[#F5F7FA] font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-60"
          >
            {autoPilotState.isRunning ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Running...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-3.5 h-3.5 text-[#8B7CFF]" />
                <span>Run 1-Click AI Auto-Pilot</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Sidebar Navigation Tabs */}
      <div className="flex border-b border-[#292F3A] bg-[#171B24] p-1">
        <button
          type="button"
          onClick={() => setActiveSidebarTab("crop")}
          className={`flex-1 py-2 px-1 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all ${
            activeSidebarTab === "crop"
              ? "bg-[#1C2230] text-[#8B7CFF] shadow-xs border border-[#292F3A]"
              : "text-[#9CA3AF] hover:text-[#F5F7FA]"
          }`}
        >
          <Globe2 className="w-3.5 h-3.5" />
          <span>Crop</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSidebarTab("compliance")}
          className={`flex-1 py-2 px-1 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all relative ${
            activeSidebarTab === "compliance"
              ? "bg-[#1C2230] text-[#8B7CFF] shadow-xs border border-[#292F3A]"
              : "text-[#9CA3AF] hover:text-[#F5F7FA]"
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Audit</span>
          {biometricEvaluation && (
            <span
              className={`w-2 h-2 rounded-full absolute top-1.5 right-1.5 ${
                biometricEvaluation.isFullyCompliant ? "bg-[#34D399]" : "bg-amber-500 animate-pulse"
              }`}
            />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveSidebarTab("background")}
          className={`flex-1 py-2 px-1 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all relative ${
            activeSidebarTab === "background"
              ? "bg-[#1C2230] text-[#8B7CFF] shadow-xs border border-[#292F3A]"
              : "text-[#9CA3AF] hover:text-[#F5F7FA]"
          }`}
        >
          <Scissors className="w-3.5 h-3.5" />
          <span>Background</span>
          {transparentCutoutUrl && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#34D399] absolute top-1.5 right-1.5" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveSidebarTab("adjust")}
          className={`flex-1 py-2 px-1 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all relative ${
            activeSidebarTab === "adjust"
              ? "bg-[#1C2230] text-[#8B7CFF] shadow-xs border border-[#292F3A]"
              : "text-[#9CA3AF] hover:text-[#F5F7FA]"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Enhance</span>
          {enhancementState.settings.enabled && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#8B7CFF] absolute top-1.5 right-1.5" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveSidebarTab("outfit")}
          className={`flex-1 py-2 px-1 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all relative ${
            activeSidebarTab === "outfit"
              ? "bg-[#1C2230] text-[#8B7CFF] shadow-xs border border-[#292F3A]"
              : "text-[#9CA3AF] hover:text-[#F5F7FA]"
          }`}
        >
          <Shirt className="w-3.5 h-3.5" />
          <span>Outfit</span>
          {outfitState.outputImageUrl && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#8B7CFF] absolute top-1.5 right-1.5" />
          )}
        </button>
      </div>

      {/* Tab Contents (Scrollable) */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* 1. CROP & COUNTRY SPECS TAB */}
        {activeSidebarTab === "crop" && (
          <div className="space-y-5">
            {/* 1-Click Biometric Auto-Crop Card */}
            <div className="bg-[#171B24] rounded-2xl p-4 text-[#F5F7FA] border border-[#292F3A] shadow-md">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-lg bg-[#1C2230] text-[#8B7CFF] border border-[#292F3A]">
                  <Wand2 className="w-4 h-4 text-amber-300" />
                </div>
                <div>
                  <h4 className="text-sm font-bold">Biometric Auto-Crop</h4>
                  <span className="text-[10px] text-[#9CA3AF]">ICAO Doc 9303 & ISO/IEC 19794-5</span>
                </div>
              </div>
              <p className="text-xs text-[#9CA3AF] mb-3 leading-relaxed">
                Automatically detects face landmarks, centers eyes on the biometric eye plane, scales head height to the legal {Math.round(selectedSpec.headMinPercentage * 100)}–{Math.round(selectedSpec.headMaxPercentage * 100)}% bracket, and levels tilt.
              </p>
              <button
                type="button"
                onClick={triggerBiometricAutoCrop}
                className="w-full py-2.5 px-4 rounded-xl bg-[#8B7CFF] hover:bg-[#7665F5] text-white font-bold text-xs shadow-md shadow-[#8B7CFF]/20 transition-all flex items-center justify-center gap-2 active:scale-98"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Auto-Crop to {selectedSpec.country} Spec</span>
              </button>
            </div>

            {/* Country Document Selector */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#9CA3AF]">
                  Select Country & Document
                </label>
                <span className="text-[11px] font-mono text-[#697386]">
                  {OFFICIAL_COUNTRY_SPECS.length} Presets
                </span>
              </div>

              {/* Search input */}
              <div className="relative mb-2">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#697386]" />
                <input
                  type="text"
                  value={countrySearch}
                  onChange={(e) => setCountrySearch(e.target.value)}
                  placeholder="Search countries (e.g. India, USA, UK, UAE...)"
                  className="w-full pl-8 pr-3 py-2 bg-[#1C2230] border border-[#292F3A] rounded-xl text-xs text-[#F5F7FA] placeholder-[#697386] focus:outline-none focus:border-[#8B7CFF]"
                />
              </div>

              {/* Country dropdown */}
              <select
                value={selectedSpec.id}
                onChange={(e) => {
                  const found = OFFICIAL_COUNTRY_SPECS.find((s) => s.id === e.target.value);
                  if (found) setSelectedSpec(found);
                }}
                className="w-full p-2.5 bg-[#1C2230] border border-[#292F3A] rounded-xl text-xs font-bold text-[#F5F7FA] focus:outline-none focus:border-[#8B7CFF]"
              >
                {filteredSpecs.map((spec) => (
                  <option key={spec.id} value={spec.id} className="bg-[#171B24] text-[#F5F7FA]">
                    {spec.country} — {spec.documentType} ({spec.widthMm} × {spec.heightMm} mm)
                  </option>
                ))}
              </select>
            </div>

            {/* Official Specification Metadata Card */}
            <div className="bg-[#171B24] rounded-2xl p-4 border border-[#292F3A] text-xs space-y-2.5">
              <div className="flex justify-between items-center pb-2 border-b border-[#292F3A]">
                <div>
                  <span className="font-bold text-[#F5F7FA] text-sm block">
                    {selectedSpec.country}
                  </span>
                  <span className="text-[10px] text-[#9CA3AF] font-medium">
                    {selectedSpec.documentType} Specification
                  </span>
                </div>
                <span className="font-mono font-bold bg-[#1C2230] text-[#8B7CFF] border border-[#292F3A] px-2 py-0.5 rounded text-[11px]">
                  {selectedSpec.aspectRatio}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                <div>
                  <span className="text-[#697386] block">Physical Size</span>
                  <span className="font-bold text-[#F5F7FA]">
                    {selectedSpec.widthMm} × {selectedSpec.heightMm} mm
                  </span>
                </div>
                <div>
                  <span className="text-[#697386] block">Exact Pixels @ 300 DPI</span>
                  <span className="font-mono font-bold text-[#F5F7FA]">
                    {selectedSpec.widthPx300Dpi} × {selectedSpec.heightPx300Dpi} px
                  </span>
                </div>
                <div>
                  <span className="text-[#697386] block">Head Coverage</span>
                  <span className="font-bold text-[#8B7CFF]">
                    {Math.round(selectedSpec.headMinPercentage * 100)}% – {Math.round(selectedSpec.headMaxPercentage * 100)}%
                  </span>
                </div>
                <div>
                  <span className="text-[#697386] block">Required BG</span>
                  <span className="font-bold text-[#F5F7FA] capitalize">
                    {selectedSpec.backgroundColor.replace("-", " ")}
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-[#9CA3AF] bg-[#1C2230] p-2.5 rounded-xl border border-[#292F3A] leading-relaxed">
                {selectedSpec.guidelineNotes}
              </p>

              <div className="flex items-center justify-between pt-1 border-t border-[#292F3A] text-[10px] text-[#697386]">
                <span>Verified: {selectedSpec.verifiedDate}</span>
                {selectedSpec.officialSource.startsWith("http") && (
                  <a
                    href={selectedSpec.officialSource}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#8B7CFF] hover:underline flex items-center gap-1 font-semibold"
                  >
                    <span>Official Source</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>

            {/* Custom Dimensions Accordion */}
            <div className="border border-[#292F3A] rounded-2xl overflow-hidden bg-[#171B24]">
              <button
                type="button"
                onClick={() => setShowCustomForm(!showCustomForm)}
                className="w-full p-3 bg-[#171B24] hover:bg-[#1C2230] flex items-center justify-between text-xs font-bold text-[#F5F7FA] transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Settings2 className="w-4 h-4 text-[#8B7CFF]" />
                  <span>Custom Width, Height & DPI</span>
                </div>
                {showCustomForm ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showCustomForm && (
                <form onSubmit={handleApplyCustom} className="p-4 space-y-3 bg-[#171B24] border-t border-[#292F3A] text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-[#9CA3AF] uppercase block mb-1">
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
                        className="w-full p-2 bg-[#1C2230] border border-[#292F3A] rounded-lg text-xs font-bold text-[#F5F7FA]"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-[#9CA3AF] uppercase block mb-1">
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
                        className="w-full p-2 bg-[#1C2230] border border-[#292F3A] rounded-lg text-xs font-bold text-[#F5F7FA]"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-[#9CA3AF] uppercase block mb-1">
                        Unit
                      </label>
                      <select
                        value={customFormState.unit}
                        onChange={(e) =>
                          setCustomFormState((prev) => ({ ...prev, unit: e.target.value as any }))
                        }
                        className="w-full p-2 bg-[#1C2230] border border-[#292F3A] rounded-lg text-xs font-bold text-[#F5F7FA]"
                      >
                        <option value="mm" className="bg-[#171B24]">Millimeters (mm)</option>
                        <option value="cm" className="bg-[#171B24]">Centimeters (cm)</option>
                        <option value="inch" className="bg-[#171B24]">Inches (in)</option>
                        <option value="pixel" className="bg-[#171B24]">Pixels (px)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-[#9CA3AF] uppercase block mb-1">
                        Print DPI
                      </label>
                      <select
                        value={customFormState.dpi}
                        onChange={(e) =>
                          setCustomFormState((prev) => ({ ...prev, dpi: Number(e.target.value) as any }))
                        }
                        className="w-full p-2 bg-[#1C2230] border border-[#292F3A] rounded-lg text-xs font-bold text-[#F5F7FA]"
                      >
                        <option value={300} className="bg-[#171B24]">300 DPI (Standard)</option>
                        <option value={600} className="bg-[#171B24]">600 DPI (Ultra HD)</option>
                        <option value={150} className="bg-[#171B24]">150 DPI (Web/Draft)</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-[#8B7CFF] hover:bg-[#7665F5] text-white font-bold rounded-xl text-xs transition-colors"
                  >
                    Apply Custom Specification
                  </button>
                </form>
              )}
            </div>

            {/* Manual Positioning & Crop Sliders */}
            <div className="space-y-4 pt-2 border-t border-[#292F3A]">
              <span className="text-xs font-bold uppercase tracking-wider text-[#9CA3AF] block">
                Manual Positioning & Sizing
              </span>

              {/* Zoom Slider */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#9CA3AF] flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-[#8B7CFF]" />
                    <span>Zoom Scale</span>
                  </span>
                  <span className="font-mono font-bold text-[#F5F7FA]">
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
                  className="w-full accent-[#8B7CFF] cursor-pointer"
                />
              </div>

              {/* Horizontal Pan X */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#9CA3AF] flex items-center gap-1">
                    <MoveHorizontal className="w-3.5 h-3.5 text-[#697386]" />
                    <span>Horizontal Center (Pan X)</span>
                  </span>
                  <span className="font-mono font-bold text-[#F5F7FA]">{adjustments.panX}px</span>
                </div>
                <input
                  type="range"
                  min="-200"
                  max="200"
                  value={adjustments.panX}
                  onChange={(e) => updateAdjustments({ panX: Number(e.target.value) })}
                  className="w-full accent-[#8B7CFF] cursor-pointer"
                />
              </div>

              {/* Vertical Pan Y */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#9CA3AF] flex items-center gap-1">
                    <MoveVertical className="w-3.5 h-3.5 text-[#697386]" />
                    <span>Vertical Position (Pan Y)</span>
                  </span>
                  <span className="font-mono font-bold text-[#F5F7FA]">{adjustments.panY}px</span>
                </div>
                <input
                  type="range"
                  min="-200"
                  max="200"
                  value={adjustments.panY}
                  onChange={(e) => updateAdjustments({ panY: Number(e.target.value) })}
                  className="w-full accent-[#8B7CFF] cursor-pointer"
                />
              </div>

              {/* Fine Rotation */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#9CA3AF] flex items-center gap-1">
                    <RotateCw className="w-3.5 h-3.5 text-[#697386]" />
                    <span>Deskew Tilt Rotation</span>
                  </span>
                  <span className="font-mono font-bold text-[#F5F7FA]">{adjustments.rotation}°</span>
                </div>
                <input
                  type="range"
                  min="-45"
                  max="45"
                  step="0.5"
                  value={adjustments.rotation}
                  onChange={(e) => updateAdjustments({ rotation: Number(e.target.value) })}
                  className="w-full accent-[#8B7CFF] cursor-pointer"
                />
              </div>

              {/* Quick Rotation & Flip Buttons */}
              <div className="grid grid-cols-4 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => updateAdjustments({ rotation: (adjustments.rotation - 90) % 360 })}
                  className="p-2 rounded-xl border border-[#292F3A] bg-[#1C2230] hover:bg-[#292F3A] text-[#F5F7FA] text-xs font-semibold flex items-center justify-center gap-1"
                  title="Rotate 90° Left"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>-90°</span>
                </button>
                <button
                  type="button"
                  onClick={() => updateAdjustments({ rotation: (adjustments.rotation + 90) % 360 })}
                  className="p-2 rounded-xl border border-[#292F3A] bg-[#1C2230] hover:bg-[#292F3A] text-[#F5F7FA] text-xs font-semibold flex items-center justify-center gap-1"
                  title="Rotate 90° Right"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>+90°</span>
                </button>
                <button
                  type="button"
                  onClick={() => updateAdjustments({ flipHorizontal: !adjustments.flipHorizontal })}
                  className={`p-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1 ${
                    adjustments.flipHorizontal ? "bg-[#8B7CFF]/20 border-[#8B7CFF] text-[#8B7CFF]" : "border-[#292F3A] bg-[#1C2230] text-[#F5F7FA]"
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
                    adjustments.flipVertical ? "bg-[#8B7CFF]/20 border-[#8B7CFF] text-[#8B7CFF]" : "border-[#292F3A] bg-[#1C2230] text-[#F5F7FA]"
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
                    ? "bg-[#34D399]/15 border-[#34D399]/40 text-[#F5F7FA]"
                    : "bg-amber-500/15 border-amber-500/40 text-[#F5F7FA]"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {biometricEvaluation.isFullyCompliant ? (
                      <div className="p-1.5 rounded-lg bg-[#34D399] text-black">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                    ) : (
                      <div className="p-1.5 rounded-lg bg-amber-500 text-black">
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-sm">
                        {biometricEvaluation.isFullyCompliant
                          ? "100% Biometric Compliant"
                          : "Compliance Attention Needed"}
                      </h4>
                      <span className="text-[10px] text-[#9CA3AF]">
                        {selectedSpec.country} {selectedSpec.documentType} Standards
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-black font-mono text-[#F5F7FA]">
                      {biometricEvaluation.score}
                    </span>
                    <span className="text-[10px] block text-[#9CA3AF]">/ 100 PTS</span>
                  </div>
                </div>

                <p className="text-[11px] leading-relaxed text-[#9CA3AF]">
                  {biometricEvaluation.isFullyCompliant
                    ? "Your photo meets all ICAO Doc 9303 and national agency requirements for head height, eye level alignment, and resolution."
                    : "Review the items flagged below. Click 'Auto-Crop to Spec' to automatically align facial coordinates."}
                </p>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-[#171B24] border border-[#292F3A] text-xs text-[#697386] text-center">
                Upload a portrait to run biometric compliance checks.
              </div>
            )}

            {/* Itemized Checks */}
            {biometricEvaluation && (
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#9CA3AF] block">
                  Detailed Biometric Audit Checks
                </span>

                {biometricEvaluation.checks.map((check) => (
                  <div
                    key={check.id}
                    className="p-3 rounded-xl border border-[#292F3A] bg-[#171B24] space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {check.status === "pass" && (
                          <CheckCircle2 className="w-4 h-4 text-[#34D399] flex-shrink-0" />
                        )}
                        {check.status === "warning" && (
                          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                        )}
                        {check.status === "fail" && (
                          <XCircle className="w-4 h-4 text-[#F87171] flex-shrink-0" />
                        )}
                        <span className="font-bold text-[#F5F7FA] text-xs">{check.title}</span>
                      </div>
                      <span
                        className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                          check.status === "pass"
                            ? "bg-[#34D399]/20 text-[#34D399]"
                            : check.status === "warning"
                            ? "bg-amber-400/20 text-amber-300"
                            : "bg-[#F87171]/20 text-[#F87171]"
                        }`}
                      >
                        {check.status}
                      </span>
                    </div>

                    <p className="text-[11px] text-[#9CA3AF] pl-6">{check.message}</p>
                    {check.details && (
                      <p className="text-[10px] text-[#697386] pl-6">{check.details}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Quick Auto-Fix Action */}
            <div className="pt-2 border-t border-[#292F3A]">
              <button
                type="button"
                onClick={triggerBiometricAutoCrop}
                className="w-full py-2.5 px-4 rounded-xl bg-[#8B7CFF] hover:bg-[#7665F5] text-white font-bold text-xs shadow-md shadow-[#8B7CFF]/20 transition-colors flex items-center justify-center gap-2"
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
            <div className="bg-[#171B24] rounded-2xl p-4 border border-[#292F3A] shadow-xs">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-lg bg-[#1C2230] text-[#8B7CFF] border border-[#292F3A]">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#F5F7FA]">AI Background Removal</h4>
                  <span className="text-[10px] text-[#697386]">RMBG-1.4 Sub-Pixel Hair Matting</span>
                </div>
              </div>

              <p className="text-xs text-[#9CA3AF] mb-4 leading-relaxed">
                Automatically isolates your portrait from background clutter, room shadows, and patterns with sub-pixel edge fidelity.
              </p>

              {transparentCutoutUrl ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between bg-[#34D399]/15 border border-[#34D399]/30 text-[#34D399] px-3 py-1.5 rounded-xl text-xs font-semibold">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-[#34D399]" />
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
                          ? "bg-[#8B7CFF] text-white border-[#8B7CFF]"
                          : "bg-[#1C2230] border-[#292F3A] text-[#F5F7FA] hover:bg-[#292F3A]"
                      }`}
                    >
                      <Columns className="w-3.5 h-3.5" />
                      <span>{showBeforeAfter ? "Close Split" : "Before/After"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={restoreOriginalBackground}
                      className="py-2 px-3 rounded-xl border border-[#292F3A] bg-[#1C2230] hover:bg-[#292F3A] text-[#F5F7FA] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
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
                  className="w-full py-3 px-4 rounded-xl bg-[#8B7CFF] hover:bg-[#7665F5] text-white font-bold text-xs shadow-md shadow-[#8B7CFF]/20 active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
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
                <span className="text-xs font-bold uppercase tracking-wider text-[#9CA3AF]">
                  Select Replacement Color
                </span>
                <span className="text-[11px] text-[#8B7CFF] font-semibold capitalize">
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
                          ? "border-[#8B7CFF] bg-[#1C2230] shadow-xs ring-1 ring-[#8B7CFF]"
                          : "border-[#292F3A] bg-[#171B24] hover:bg-[#1C2230]"
                      }`}
                    >
                      <div
                        className="w-6 h-6 rounded-lg border border-[#292F3A] flex-shrink-0 relative overflow-hidden"
                        style={
                          color.hex === "transparent"
                            ? {
                                backgroundImage:
                                  "linear-gradient(45deg, #292F3A 25%, transparent 25%), linear-gradient(-45deg, #292F3A 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #292F3A 75%), linear-gradient(-45deg, transparent 75%, #292F3A 75%)",
                                backgroundSize: "8px 8px",
                              }
                            : { backgroundColor: color.hex }
                        }
                      >
                        {isSelected && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                            <Check className="w-3.5 h-3.5 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="overflow-hidden">
                        <span className="block text-xs font-bold text-[#F5F7FA] truncate">
                          {color.name}
                        </span>
                        <span className="block text-[10px] text-[#697386] font-mono">
                          {color.hex.toUpperCase()}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Color Picker */}
            <div className="pt-2 border-t border-[#292F3A]">
              <span className="text-xs font-bold uppercase tracking-wider text-[#9CA3AF] block mb-2">
                Custom Palette Color
              </span>
              <div className="flex items-center gap-3 bg-[#171B24] p-2.5 rounded-xl border border-[#292F3A]">
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
                  className="w-28 uppercase font-mono text-xs font-bold p-1.5 bg-[#1C2230] border border-[#292F3A] rounded-lg text-[#F5F7FA]"
                />
                <button
                  type="button"
                  onClick={() => setBackgroundColor(customColorHex)}
                  className="text-xs font-semibold text-[#8B7CFF] hover:underline ml-auto"
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
      <div className="p-4 bg-[#11141B] border-t border-[#292F3A] space-y-2.5">
        {/* Phase 8 Print Sheet Generator Trigger */}
        <button
          type="button"
          onClick={() => setIsPrintModalOpen(true)}
          disabled={!imageSrc}
          className="w-full py-2.5 px-4 rounded-xl bg-[#171B24] hover:bg-[#1C2230] border border-[#292F3A] text-[#F5F7FA] text-xs font-bold transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
        >
          <Printer className="w-4 h-4 text-[#8B7CFF]" />
          <span>Print Sheet Generator (A4, 4×6, PDF)</span>
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={replaceImage}
            className="py-2.5 px-3 rounded-xl border border-[#292F3A] bg-[#171B24] hover:bg-[#1C2230] text-[#F5F7FA] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Replace Photo</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadCrop}
            disabled={!imageSrc}
            className="py-2.5 px-3 rounded-xl bg-[#8B7CFF] hover:bg-[#7665F5] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-md shadow-[#8B7CFF]/20 disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Save 300 DPI</span>
          </button>
        </div>

        {imageSrc && (
          <button
            type="button"
            onClick={deleteImage}
            className="w-full py-2 px-3 rounded-xl text-[#F87171] hover:bg-[#F87171]/10 border border-transparent hover:border-[#F87171]/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Photo</span>
          </button>
        )}
      </div>

      {/* AI Passport Photo Studio Guided Setup Modal */}
      {isStudioModalOpen && (
        <GuidedStudioModal
          isOpen={isStudioModalOpen}
          onClose={() => setIsStudioModalOpen(false)}
          photoUrl={originalImageSrc || imageSrc || "/samples/sample-man.jpg"}
          onAcceptAndContinue={(studioRes) => {
            applyStudioResult(studioRes);
            setIsStudioModalOpen(false);
          }}
        />
      )}
    </aside>
  );
}
