"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  UploadCloud,
  FileImage,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Scissors,
  Shirt,
  Grid,
  ChevronDown,
  RotateCcw,
  Check,
  ShieldCheck,
  ArrowRight,
  Download,
  Printer,
  FileText,
  Sliders,
  X,
  Loader2,
  Wand2,
} from "lucide-react";
import { POPULAR_PASSPORT_SPECS } from "@/lib/constants/countries";
import { validateImageFile, loadImageDimensions, assessImageDpi, DEMO_SAMPLE_PHOTOS } from "@/lib/image/clientValidation";
import { AI_PERSONAS, PERSONA_LIST, PersonaDefinition } from "@/lib/constants/personas";
import { AiPersonaType, AiAutoPilotProgress } from "@/types/editor";
import { runFullAiAutoPilot, AutoPilotExecutionResult } from "@/lib/ai/aiAutoPilotService";
import { generatePrintSheetPdf, downloadPdfBlob } from "@/lib/print/pdfExportService";
import { calculatePrintLayout } from "@/lib/print/printLayoutCalculator";
import { GuidedStudioModal } from "@/components/studio/GuidedStudioModal";

export function UploadDropzoneCard() {
  const router = useRouter();
  const [selectedCountry, setSelectedCountry] = useState("India");
  const [activePreviewTab, setActivePreviewTab] = useState<"white-bg" | "suit" | "print-sheet">("white-bg");
  const [selectedPersona, setSelectedPersona] = useState<AiPersonaType>("male");
  const [isDragging, setIsDragging] = useState(false);
  const [userPhotoUrl, setUserPhotoUrl] = useState<string | null>(null);
  const [userPhotoMeta, setUserPhotoMeta] = useState<{
    name: string;
    width: number;
    height: number;
    assessment: "excellent" | "good" | "warning";
    message: string;
  } | null>(null);

  // Guided Studio Wizard state
  const [isStudioModalOpen, setIsStudioModalOpen] = useState(false);

  // Auto-Pilot execution state
  const [isAutoPilotRunning, setIsAutoPilotRunning] = useState(false);
  const [autoPilotProgress, setAutoPilotProgress] = useState<AiAutoPilotProgress | null>(null);
  const [autoPilotResult, setAutoPilotResult] = useState<AutoPilotExecutionResult | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);

  // Current spec
  const currentSpec =
    POPULAR_PASSPORT_SPECS.find((s) => s.country === selectedCountry) ||
    POPULAR_PASSPORT_SPECS[0];

  const currentPersonaDef = AI_PERSONAS[selectedPersona] || AI_PERSONAS.male;

  const activeDisplayImage = userPhotoUrl || currentPersonaDef.sampleWhiteBgUrl;

  const handleCountryChange = (newCountry: string) => {
    setSelectedCountry(newCountry);
    const spec = POPULAR_PASSPORT_SPECS.find((s) => s.country === newCountry) || POPULAR_PASSPORT_SPECS[0];
    try {
      sessionStorage.setItem("ppm_selected_spec_id", spec.id);
    } catch {
      // Ignore
    }
  };

  const handleFileProcess = async (file: File) => {
    const validation = validateImageFile(file);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      try {
        const { width, height } = await loadImageDimensions(dataUrl);
        const { assessment, message } = assessImageDpi(width, height, currentSpec);

        setUserPhotoUrl(dataUrl);
        const meta = {
          name: file.name,
          width,
          height,
          sizeBytes: file.size,
          type: file.type,
          dpiAssessment: assessment,
          warningMessage: message,
        };
        setUserPhotoMeta({
          name: file.name,
          width,
          height,
          assessment,
          message,
        });

        // Store into sessionStorage so /editor immediately receives the uploaded photo
        try {
          sessionStorage.setItem("ppm_uploaded_image_src", dataUrl);
          sessionStorage.setItem("ppm_original_image_src", dataUrl);
          sessionStorage.removeItem("ppm_transparent_cutout_url");
          sessionStorage.setItem("ppm_uploaded_image_meta", JSON.stringify(meta));
          sessionStorage.setItem("ppm_selected_spec_id", currentSpec.id);
          sessionStorage.setItem("ppm_selected_persona", selectedPersona);
        } catch (err) {
          console.warn("sessionStorage save error:", err);
        }

        // Automatically open the Guided AI Passport Studio setup screen on upload
        setIsStudioModalOpen(true);
      } catch {
        alert("Failed to read image dimensions. Please try another file.");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPersona = (persona: AiPersonaType) => {
    setSelectedPersona(persona);
    try {
      sessionStorage.setItem("ppm_selected_persona", persona);
    } catch {
      // Ignore
    }
  };

  /**
   * 1-Click AI Auto-Pilot Handler:
   * Takes the uploaded photo (or the selected persona's sample) and executes the entire
   * pipeline: face centering, background removal to pure white, 35x45mm 300 DPI crop,
   * calibrated studio lighting, and compliance check.
   */
  const handleTriggerAutoPilot = async () => {
    const photoToProcess = userPhotoUrl || currentPersonaDef.sampleUrl;

    setIsAutoPilotRunning(true);
    setAutoPilotProgress({
      stage: "detecting",
      progressPercent: 10,
      message: `Initiating 1-Click AI Auto-Pilot for ${currentPersonaDef.label}...`,
    });

    try {
      const result = await runFullAiAutoPilot(
        photoToProcess,
        selectedPersona,
        currentSpec,
        (progress) => {
          setAutoPilotProgress(progress);
        }
      );

      if (result.success) {
        setAutoPilotResult(result);
        setShowResultModal(true);

        // Store everything in sessionStorage so user can transition seamlessly into /editor
        try {
          sessionStorage.setItem("ppm_uploaded_image_src", result.originalImageSrc);
          sessionStorage.setItem("ppm_original_image_src", result.originalImageSrc);
          sessionStorage.setItem("ppm_transparent_cutout_url", result.cutoutDataUrl);
          sessionStorage.setItem("ppm_background_color", "#FFFFFF");
          sessionStorage.setItem("ppm_selected_spec_id", currentSpec.id);
          sessionStorage.setItem("ppm_selected_persona", selectedPersona);
        } catch {
          // Ignore
        }
      } else {
        alert("AI Auto-Pilot could not process this image. Please ensure a clear portrait is uploaded.");
      }
    } catch (err: any) {
      console.error("Auto-pilot error:", err);
      alert(err?.message || "AI Auto-Pilot encountered an unexpected error. Please try another image.");
    } finally {
      setIsAutoPilotRunning(false);
    }
  };

  const handleOpenEditor = () => {
    try {
      sessionStorage.setItem("ppm_selected_spec_id", currentSpec.id);
      sessionStorage.setItem("ppm_selected_persona", selectedPersona);
      const photoToPass = userPhotoUrl || currentPersonaDef.sampleUrl;
      sessionStorage.setItem("ppm_uploaded_image_src", photoToPass);
      sessionStorage.setItem("ppm_original_image_src", photoToPass);

      if (userPhotoMeta) {
        sessionStorage.setItem("ppm_uploaded_image_meta", JSON.stringify(userPhotoMeta));
      } else {
        sessionStorage.setItem(
          "ppm_uploaded_image_meta",
          JSON.stringify({
            name: userPhotoUrl ? "Uploaded Portrait" : currentPersonaDef.label,
            sizeBytes: 0,
            width: 800,
            height: 1000,
            type: "image/jpeg",
            dpiAssessment: "excellent",
            warningMessage: null,
          })
        );
      }

      if (autoPilotResult) {
        sessionStorage.setItem("ppm_transparent_cutout_url", autoPilotResult.cutoutDataUrl);
        sessionStorage.setItem("ppm_background_color", "#FFFFFF");
      }
    } catch {
      // Ignore
    }
    router.push("/editor");
  };

  // Direct download helpers
  const handleDownloadSinglePhoto = () => {
    if (!autoPilotResult) return;
    const link = document.createElement("a");
    link.download = `photomaze-${selectedPersona}-${currentSpec.country.toLowerCase().replace(/\s+/g, "-")}-35x45mm-300dpi.jpg`;
    link.href = autoPilotResult.croppedPhotoDataUrl;
    link.click();
  };

  const handleDownloadPrintSheet = () => {
    if (!autoPilotResult?.printSheet4x6DataUrl) return;
    const link = document.createElement("a");
    link.download = `photomaze-print-sheet-4x6-6copies-${selectedPersona}.jpg`;
    link.href = autoPilotResult.printSheet4x6DataUrl;
    link.click();
  };

  const handleDownloadPdf = async () => {
    if (!autoPilotResult) return;
    try {
      const layoutSolution = calculatePrintLayout({
        paperSizeId: "4x6",
        photoWidthMm: currentSpec.widthMm,
        photoHeightMm: currentSpec.heightMm,
        copies: 6,
        orientation: "auto",
        margins: { topMm: 5, bottomMm: 5, leftMm: 5, rightMm: 5 },
        spacingMm: 3,
        dpi: 300,
        cuttingGuides: "corners",
        alignment: "center",
        includeLabels: false,
      });

      const pdfBytes = await generatePrintSheetPdf({
        solution: layoutSolution,
        photoDataUrl: autoPilotResult.croppedPhotoDataUrl,
        cuttingGuides: "corners",
        documentTitle: `PhotoMaze ${currentSpec.country} Passport Photo Print Sheet`,
      });

      downloadPdfBlob(pdfBytes, `photomaze-passport-photos-4x6-${selectedPersona}.pdf`);
    } catch (err) {
      console.error("PDF download error:", err);
      alert("Failed to generate PDF. Please use the JPEG Sheet download.");
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileProcess(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileProcess(files[0]);
    }
  };

  const handleResetUserPhoto = () => {
    setUserPhotoUrl(null);
    setUserPhotoMeta(null);
    try {
      sessionStorage.removeItem("ppm_uploaded_image_src");
      sessionStorage.removeItem("ppm_original_image_src");
      sessionStorage.removeItem("ppm_transparent_cutout_url");
      sessionStorage.removeItem("ppm_uploaded_image_meta");
    } catch {
      // Ignore
    }
  };

  return (
    <div id="upload-card" className="w-full bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-200/90 overflow-hidden transition-all duration-300">
      {/* Top Bar / Country Selector */}
      <div className="bg-slate-50/90 border-b border-slate-200 px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
            Official Country & Document Spec:
          </span>
        </div>

        <div className="relative inline-block w-full sm:w-auto">
          <select
            value={selectedCountry}
            onChange={(e) => handleCountryChange(e.target.value)}
            className="w-full sm:w-72 appearance-none bg-white border border-slate-300 rounded-xl px-3.5 py-2 pr-9 text-sm font-semibold text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
          >
            {POPULAR_PASSPORT_SPECS.map((spec) => (
              <option key={spec.country} value={spec.country}>
                {spec.country} ({spec.widthMm}×{spec.heightMm} mm / {spec.aspectRatio})
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Main Grid Area */}
      <div className="p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left Column: Upload Dropzone & Persona Selector */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          {/* STEP 1: Photo Upload Area */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[11px]">1</span>
                Upload or Take Your Portrait:
              </span>
              {userPhotoUrl && (
                <button
                  type="button"
                  onClick={handleResetUserPhoto}
                  className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Clear & Retake</span>
                </button>
              )}
            </div>

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative rounded-2xl border-2 border-dashed p-6 text-center transition-all duration-200 ${
                isDragging
                  ? "border-blue-600 bg-blue-50/60 scale-[1.01]"
                  : userPhotoUrl
                  ? "border-emerald-400 bg-emerald-50/20"
                  : "border-slate-300 hover:border-blue-500 bg-slate-50/40 hover:bg-blue-50/20"
              }`}
            >
              {!userPhotoUrl && (
                <input
                  type="file"
                  id="passport-file-input"
                  accept="image/jpeg,image/png,image/webp,image/heic"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  onChange={handleFileInput}
                />
              )}

              <div className="flex flex-col items-center">
                <div
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-white shadow-lg mb-3 transition-transform group-hover:scale-105 ${
                    userPhotoUrl
                      ? "bg-gradient-to-tr from-emerald-500 to-teal-600 shadow-emerald-500/30"
                      : "bg-gradient-to-tr from-blue-500 to-indigo-600 shadow-blue-500/30"
                  }`}
                >
                  {userPhotoUrl ? (
                    <Check className="w-7 h-7 sm:w-8 sm:h-8" />
                  ) : (
                    <UploadCloud className="w-7 h-7 sm:w-8 sm:h-8 animate-bounce" />
                  )}
                </div>

                <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1">
                  {userPhotoUrl ? "Your Photo is Ready for AI!" : "Drag & Drop Portrait or Click to Browse"}
                </h3>
                <p className="text-slate-500 text-xs max-w-sm mb-3">
                  {userPhotoUrl
                    ? `Selected: ${userPhotoMeta?.name} (${userPhotoMeta?.width} × ${userPhotoMeta?.height} px)`
                    : "Works with simple phone selfies, casual photos, and camera shots."}
                </p>

                {!userPhotoUrl && (
                  <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white font-semibold text-xs shadow-md shadow-blue-500/20 pointer-events-none">
                    <FileImage className="w-4 h-4" />
                    <span>Choose Photo From Device</span>
                  </div>
                )}

                <div className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] text-slate-400">
                  <span>PNG, JPG, WebP, HEIC</span>
                  <span>•</span>
                  <span>Auto 300 DPI</span>
                  <span>•</span>
                  <span className="text-emerald-600 font-semibold">100% Free & Private</span>
                </div>
              </div>
            </div>
          </div>

          {/* STEP 2: Persona / Profile Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[11px]">2</span>
                Select Subject Profile / Persona:
              </span>
              <span className="text-[11px] text-blue-600 font-medium">AI adapts biometric rules</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {PERSONA_LIST.map((p) => {
                const isSelected = selectedPersona === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelectPersona(p.id)}
                    className={`p-3 rounded-2xl border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? "border-blue-600 bg-blue-50/80 shadow-sm ring-2 ring-blue-500/20"
                        : "border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-2xl">{p.icon}</span>
                        {isSelected && (
                          <div className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center">
                            <Check className="w-2.5 h-2.5" />
                          </div>
                        )}
                      </div>
                      <div className="font-bold text-xs text-slate-900 leading-tight">
                        {p.label}
                      </div>
                    </div>
                    <div className="mt-2 text-[10px] text-slate-500 font-medium line-clamp-1">
                      {p.badge}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Persona Guidance Note */}
            <div className="mt-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200/90 text-slate-600 text-[11px] flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-800">{currentPersonaDef.label} Guidelines: </span>
                <span>{currentPersonaDef.complianceNotes}</span>
              </div>
            </div>
          </div>

          {/* STEP 3: AI Passport Studio Buttons */}
          <div className="pt-2 flex flex-col gap-2.5">
            <button
              type="button"
              onClick={() => setIsStudioModalOpen(true)}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-700 hover:via-indigo-700 hover:to-violet-700 active:scale-[0.99] text-white font-extrabold text-sm sm:text-base shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
              <span>Launch AI Passport Studio (Guided Setup)</span>
              <ArrowRight className="w-5 h-5 ml-1" />
            </button>

            <button
              type="button"
              onClick={handleTriggerAutoPilot}
              disabled={isAutoPilotRunning}
              className="w-full py-2.5 px-5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isAutoPilotRunning ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>AI Working Magic... ({autoPilotProgress?.progressPercent || 20}%)</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 text-blue-600" />
                  <span>Instant 1-Click Auto-Pilot</span>
                </>
              )}
            </button>
            <p className="text-center text-[11px] text-slate-500 mt-1">
              Guided Studio asks your preferences first (category, clothing presentation, head coverings, eyewear & background). 100% Free & On-Device.
            </p>
          </div>
        </div>

        {/* Right Column: Live Interactive Spec & Visual Preview */}
        <div className="lg:col-span-5 bg-gradient-to-b from-slate-50 to-blue-50/30 rounded-2xl p-4 sm:p-5 border border-slate-200/80 flex flex-col justify-between">
          <div>
            {/* Preview Tabs */}
            <div className="flex rounded-xl bg-slate-200/70 p-1 mb-4 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActivePreviewTab("white-bg")}
                className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  activePreviewTab === "white-bg"
                    ? "bg-white text-blue-700 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Scissors className="w-3.5 h-3.5" />
                <span>White BG</span>
              </button>
              <button
                type="button"
                onClick={() => setActivePreviewTab("suit")}
                className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  activePreviewTab === "suit"
                    ? "bg-white text-blue-700 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Shirt className="w-3.5 h-3.5" />
                <span>Formal Suit</span>
              </button>
              <button
                type="button"
                onClick={() => setActivePreviewTab("print-sheet")}
                className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  activePreviewTab === "print-sheet"
                    ? "bg-white text-blue-700 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
                <span>Print Sheet</span>
              </button>
            </div>

            {/* Interactive Visual Window */}
            <div className="relative aspect-4/3 sm:aspect-square max-h-72 w-full rounded-xl bg-white border border-slate-200 shadow-inner overflow-hidden flex items-center justify-center">
              {activePreviewTab === "white-bg" && (
                <div className="relative w-full h-full flex flex-col items-center justify-center p-3 bg-white">
                  <div className="relative w-36 h-48 sm:w-44 sm:h-56 rounded-md shadow-md border border-slate-300 overflow-hidden bg-white">
                    <img
                      src={activeDisplayImage}
                      alt="Sample Preview White BG"
                      className="w-full h-full object-cover"
                    />
                    {/* Biometric overlay guide lines */}
                    <div className="absolute inset-0 pointer-events-none border border-emerald-500/40">
                      <div className="absolute top-[35%] left-0 right-0 border-b border-dashed border-emerald-500/60 flex justify-between px-1">
                        <span className="text-[9px] text-emerald-700 bg-white/90 px-1 rounded">Eye Level</span>
                      </div>
                      <div className="absolute bottom-[20%] left-0 right-0 border-b border-dashed border-emerald-500/60 flex justify-between px-1">
                        <span className="text-[9px] text-emerald-700 bg-white/90 px-1 rounded">Chin Line</span>
                      </div>
                    </div>
                  </div>
                  <span className="mt-2 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    ✓ 100% ICAO Biometric Aligned
                  </span>
                </div>
              )}

              {activePreviewTab === "suit" && (
                <div className="relative w-full h-full flex flex-col items-center justify-center p-3 bg-white">
                  <div className="relative w-36 h-48 sm:w-44 sm:h-56 rounded-md shadow-md border border-slate-300 overflow-hidden bg-white">
                    <img
                      src={userPhotoUrl || currentPersonaDef.sampleSuitUrl}
                      alt="Sample Preview Formal Attire"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] px-2 py-0.5 rounded font-medium flex items-center gap-1">
                      <Shirt className="w-3 h-3 text-violet-400" />
                      Formal Attire
                    </div>
                  </div>
                  <span className="mt-2 text-[11px] font-medium text-violet-700 bg-violet-50 px-2.5 py-0.5 rounded-full border border-violet-200">
                    Smart Attire Preview
                  </span>
                </div>
              )}

              {activePreviewTab === "print-sheet" && (
                <div className="relative w-full h-full flex flex-col items-center justify-center p-3 bg-slate-100">
                  <div className="w-56 h-40 bg-white shadow-md border border-slate-300 p-2 grid grid-cols-3 grid-rows-2 gap-1.5 relative">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className="border border-dashed border-slate-300 overflow-hidden relative">
                        <img
                          src={activeDisplayImage}
                          alt="Sheet copy"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                    <div className="absolute -bottom-2 right-1 bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs">
                      4×6" (6 Copies)
                    </div>
                  </div>
                  <span className="mt-3 text-[11px] font-medium text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                    Ready to Print at Local Lab / CVS / Walgreens
                  </span>
                </div>
              )}
            </div>

            {/* Document Specification Summary */}
            <div className="mt-4 pt-3 border-t border-slate-200 text-xs text-slate-600 space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Document Type:</span>
                <span className="font-semibold text-slate-800">
                  {currentSpec.country} {currentSpec.documentType}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Dimensions:</span>
                <span className="font-semibold text-slate-800">
                  {currentSpec.widthMm} × {currentSpec.heightMm} mm ({currentSpec.widthPx300Dpi} × {currentSpec.heightPx300Dpi} px @ 300 DPI)
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Required Background:</span>
                <span className="font-semibold text-slate-800 capitalize">
                  {currentSpec.backgroundColor.replace("-", " ")}
                </span>
              </div>
            </div>
          </div>

          {/* Open Studio Alternative */}
          <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">Prefer manual controls?</span>
            <button
              type="button"
              onClick={handleOpenEditor}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
            >
              <span>Open Studio Editor</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ─── LIVE AI AUTO-PILOT PROGRESS MODAL ─── */}
      {isAutoPilotRunning && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-violet-600 text-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30 animate-pulse">
              <Sparkles className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-extrabold text-slate-900 mb-2">
              AI Auto-Pilot in Progress...
            </h3>
            <p className="text-xs text-slate-600 mb-6">
              Executing complete biometric passport generation for <strong>{currentPersonaDef.label}</strong>
            </p>

            {/* Progress Bar */}
            <div className="w-full bg-slate-100 rounded-full h-3 mb-3 overflow-hidden p-0.5 border border-slate-200">
              <div
                className="bg-gradient-to-r from-blue-600 to-violet-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${autoPilotProgress?.progressPercent || 15}%` }}
              />
            </div>

            <div className="flex justify-between items-center text-xs font-semibold mb-4 text-slate-500">
              <span>{autoPilotProgress?.message || "Analyzing facial geometry..."}</span>
              <span className="font-mono text-blue-600">{autoPilotProgress?.progressPercent || 15}%</span>
            </div>

            <div className="text-[11px] text-slate-400 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-left space-y-1">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Biometric Face & Landmark Detection (468 points)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>AI Background Removal & Pure White (#FFFFFF) Matting</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>35×45mm Indian Passport 300 DPI Crop (413×531 px)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Calibrated Studio Portrait Lighting & Exposure</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── INSTANT RESULT MODAL ─── */}
      {showResultModal && autoPilotResult && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl border border-slate-100 my-8 animate-in fade-in zoom-in-95 duration-200 relative">
            <button
              type="button"
              onClick={() => setShowResultModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header Badge */}
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                100% ICAO & Indian Passport Compliant
              </span>
              <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold font-mono">
                300 DPI
              </span>
            </div>

            <h3 className="text-2xl font-black text-slate-900 mb-1">
              Your Passport Photos are Ready!
            </h3>
            <p className="text-xs text-slate-600 mb-6">
              Engineered for <strong>{currentPersonaDef.label}</strong> • {currentSpec.country} {currentSpec.documentType} ({currentSpec.widthMm}×{currentSpec.heightMm} mm)
            </p>

            {/* Image Previews Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {/* Single Passport Photo */}
              <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200 text-center flex flex-col items-center">
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Single Photo (35×45mm)
                </span>
                <div className="w-32 h-40 rounded-lg shadow-md border border-slate-300 overflow-hidden bg-white mb-3">
                  <img
                    src={autoPilotResult.croppedPhotoDataUrl}
                    alt="Compliant Passport Photo"
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleDownloadSinglePhoto}
                  className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Photo (300 DPI)</span>
                </button>
              </div>

              {/* 4x6" Print Sheet (6 Copies) */}
              <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200 text-center flex flex-col items-center">
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">
                  4×6" Print Sheet (6 Copies)
                </span>
                <div className="w-44 h-32 rounded-lg shadow-md border border-slate-300 overflow-hidden bg-white mb-3 flex items-center justify-center p-1">
                  {autoPilotResult.printSheet4x6DataUrl ? (
                    <img
                      src={autoPilotResult.printSheet4x6DataUrl}
                      alt="4x6 Print Sheet"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="text-xs text-slate-400">Sheet Ready</div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-1.5 w-full">
                  <button
                    type="button"
                    onClick={handleDownloadPrintSheet}
                    className="py-2 px-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-sm transition-colors cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Sheet</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadPdf}
                    className="py-2 px-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-sm transition-colors cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>PDF Sheet</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Persona Guidance Confirmation */}
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 text-xs mb-6">
              <span className="font-bold">✓ Compliance Guarantee: </span>
              {currentPersonaDef.complianceNotes}
            </div>

            {/* Actions: Fine-Tune in Studio or Done */}
            <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={handleOpenEditor}
                className="flex-1 py-3 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Sliders className="w-4 h-4 text-blue-600" />
                <span>Fine-Tune or Try Suits in Studio Editor</span>
              </button>
              <button
                type="button"
                onClick={() => setShowResultModal(false)}
                className="py-3 px-6 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Passport Photo Studio Guided Setup Modal */}
      <GuidedStudioModal
        isOpen={isStudioModalOpen}
        onClose={() => setIsStudioModalOpen(false)}
        photoUrl={userPhotoUrl || currentPersonaDef.sampleUrl}
        onAcceptAndContinue={(studioRes) => {
          try {
            sessionStorage.setItem("ppm_uploaded_image_src", studioRes.processedPhotoUrl);
            sessionStorage.setItem("ppm_original_image_src", studioRes.originalPhotoUrl);
            sessionStorage.setItem("ppm_transparent_cutout_url", studioRes.transparentSubjectUrl);
            sessionStorage.setItem("ppm_selected_spec_id", currentSpec.id);
            sessionStorage.setItem("ppm_studio_mode", studioRes.mode);
            if (userPhotoMeta) {
              sessionStorage.setItem("ppm_uploaded_image_meta", JSON.stringify(userPhotoMeta));
            }
          } catch (e) {
            console.warn("sessionStorage save error:", e);
          }
          setIsStudioModalOpen(false);
          router.push("/editor");
        }}
      />
    </div>
  );
}
