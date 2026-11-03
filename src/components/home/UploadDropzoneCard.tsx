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
import dynamic from "next/dynamic";
import { POPULAR_PASSPORT_SPECS } from "@/lib/constants/countries";
import { validateImageFile, loadImageDimensions, assessImageDpi, DEMO_SAMPLE_PHOTOS } from "@/lib/image/clientValidation";
import { AI_PERSONAS, PERSONA_LIST, PersonaDefinition } from "@/lib/constants/personas";
import { AiPersonaType, AiAutoPilotProgress } from "@/types/editor";
import type { AutoPilotExecutionResult } from "@/lib/ai/aiAutoPilotService";

const GuidedStudioModal = dynamic(
  () => import("@/components/studio/GuidedStudioModal").then((mod) => mod.GuidedStudioModal),
  { ssr: false }
);

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

  const handleTriggerAutoPilot = async () => {
    const photoToProcess = userPhotoUrl || currentPersonaDef.sampleUrl;

    setIsAutoPilotRunning(true);
    setAutoPilotProgress({
      stage: "detecting",
      progressPercent: 10,
      message: `Initiating 1-Click AI Auto-Pilot for ${currentPersonaDef.label}...`,
    });

    try {
      const { runFullAiAutoPilot } = await import("@/lib/ai/aiAutoPilotService");
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
      const [{ calculatePrintLayout }, { generatePrintSheetPdf, downloadPdfBlob }] = await Promise.all([
        import("@/lib/print/printLayoutCalculator"),
        import("@/lib/print/pdfExportService"),
      ]);

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

  return (
    <div id="studio-upload" className="w-full rounded-2xl bg-[#11141B] border border-[#292F3A] p-5 sm:p-7 shadow-2xl shadow-black/60">
      {/* Step 1: Persona / Person Category Selection */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-semibold uppercase tracking-wider text-[#9CA3AF]">
            1. Select Profile Category
          </label>
          <span className="text-xs text-[#697386]">Customized framing & attire</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {PERSONA_LIST.map((p) => {
            const isSelected = selectedPersona === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSelectPersona(p.id)}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  isSelected
                    ? "bg-[#171B24] border-[#8B7CFF] shadow-sm shadow-[#8B7CFF]/20"
                    : "bg-[#171B24]/60 border-[#292F3A] hover:border-[#3B4352] text-[#9CA3AF] hover:text-[#F5F7FA]"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xl">{p.icon}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#8B7CFF]" />}
                </div>
                <div>
                  <div className={`text-xs font-semibold ${isSelected ? "text-[#F5F7FA]" : "text-[#9CA3AF]"}`}>
                    {p.label}
                  </div>
                  <div className="text-[10px] text-[#697386] truncate">{p.shortLabel}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 2: Country Standard Selection */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-[#9CA3AF]">
            2. Official Country Standard
          </label>
          <span className="text-xs text-[#34D399]">
            {currentSpec.widthMm} × {currentSpec.heightMm} mm ({currentSpec.widthPx300Dpi} × {currentSpec.heightPx300Dpi} px @ 300 DPI)
          </span>
        </div>

        <div className="relative">
          <select
            value={selectedCountry}
            onChange={(e) => handleCountryChange(e.target.value)}
            className="w-full bg-[#1C2230] border border-[#292F3A] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[#F5F7FA] focus:outline-none focus:border-[#8B7CFF] appearance-none cursor-pointer transition-colors"
          >
            {POPULAR_PASSPORT_SPECS.map((spec) => (
              <option key={spec.id} value={spec.country} className="bg-[#1C2230] text-[#F5F7FA]">
                {spec.country} — {spec.documentType} ({spec.widthMm}×{spec.heightMm}mm)
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-[#9CA3AF] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Step 3: Professional Upload Dropzone */}
      <div className="mb-6">
        <label className="block text-xs font-semibold uppercase tracking-wider text-[#9CA3AF] mb-2">
          3. Upload Photograph
        </label>

        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition-all ${
            isDragging
              ? "border-[#8B7CFF] bg-[#171B24]"
              : userPhotoUrl
              ? "border-[#34D399]/40 bg-[#171B24]/40"
              : "border-[#292F3A] hover:border-[#3B4352] bg-[#0B0D12]"
          }`}
        >
          {userPhotoUrl ? (
            /* Uploaded Preview State */
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="relative w-16 h-20 rounded-lg overflow-hidden border border-[#292F3A] flex-shrink-0 bg-black">
                  <img src={userPhotoUrl} alt="Uploaded portrait" className="w-full h-full object-cover" />
                </div>
                <div className="text-left">
                  <div className="text-xs sm:text-sm font-semibold text-[#F5F7FA] truncate max-w-[220px]">
                    {userPhotoMeta?.name || "Uploaded Photo"}
                  </div>
                  <div className="text-[11px] text-[#34D399] flex items-center gap-1 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>
                      {userPhotoMeta?.width} × {userPhotoMeta?.height} px · 300 DPI Ready
                    </span>
                  </div>
                  <div className="text-[10px] text-[#697386] mt-0.5">Ready for AI processing & biometric framing</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-[#1C2230] hover:bg-[#292F3A] text-xs font-medium text-[#F5F7FA] border border-[#292F3A] transition-colors">
                  <span>Replace</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/heic"
                    onChange={(e) => e.target.files?.[0] && handleFileProcess(e.target.files[0])}
                    className="hidden"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setUserPhotoUrl(null);
                    setUserPhotoMeta(null);
                  }}
                  className="p-1.5 rounded-lg text-[#9CA3AF] hover:text-[#F87171] hover:bg-[#1C2230] transition-colors"
                  title="Remove uploaded photo"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* Empty Dropzone State */
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-xl bg-[#171B24] border border-[#292F3A] flex items-center justify-center text-[#8B7CFF] mb-3 shadow-inner">
                <UploadCloud className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-semibold text-[#F5F7FA] mb-1">
                Drag and drop your photo here
              </h3>
              <p className="text-xs text-[#9CA3AF] mb-4">
                or browse files directly from your computer or phone
              </p>

              <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1C2230] hover:bg-[#292F3A] border border-[#292F3A] text-xs font-semibold text-[#F5F7FA] transition-colors shadow-sm">
                <FileImage className="w-3.5 h-3.5 text-[#8B7CFF]" />
                <span>Browse Files</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/heic"
                  onChange={(e) => e.target.files?.[0] && handleFileProcess(e.target.files[0])}
                  className="hidden"
                />
              </label>

              <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-[11px] text-[#697386]">
                <span>Supported: JPEG, PNG, WebP, HEIC</span>
                <span>•</span>
                <span>Max File Size: 20 MB</span>
                <span>•</span>
                <span>100% In-Browser Privacy</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons: 1-Click AI AutoPilot & Guided Wizard */}
      <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
        <button
          type="button"
          onClick={handleTriggerAutoPilot}
          disabled={isAutoPilotRunning}
          className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-semibold text-white bg-[#8B7CFF] hover:bg-[#7665F5] disabled:opacity-50 transition-all shadow-md shadow-[#8B7CFF]/20 active:scale-[0.99]"
        >
          {isAutoPilotRunning ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Processing with AI...</span>
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4" />
              <span>1-Click AI Auto-Pilot</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => setIsStudioModalOpen(true)}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-semibold text-[#F5F7FA] bg-[#171B24] hover:bg-[#1C2230] border border-[#292F3A] transition-colors"
        >
          <Sliders className="w-4 h-4 text-[#8B7CFF]" />
          <span>Launch AI Passport Studio</span>
        </button>

        <button
          type="button"
          onClick={handleOpenEditor}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl text-xs sm:text-sm font-medium text-[#9CA3AF] hover:text-[#F5F7FA] hover:bg-[#171B24] border border-transparent hover:border-[#292F3A] transition-colors"
        >
          <span>Open Direct Studio</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Auto-Pilot Running Progress Modal */}
      {isAutoPilotRunning && autoPilotProgress && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#11141B] border border-[#292F3A] p-6 text-center shadow-2xl">
            <div className="w-12 h-12 rounded-xl bg-[#171B24] border border-[#8B7CFF]/40 text-[#8B7CFF] flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <h3 className="text-base font-bold text-[#F5F7FA] mb-1">
              Executing AI Auto-Pilot
            </h3>
            <p className="text-xs text-[#9CA3AF] mb-5">
              {autoPilotProgress.message}
            </p>

            <div className="w-full bg-[#1C2230] rounded-full h-2 mb-3 overflow-hidden border border-[#292F3A]">
              <div
                className="bg-[#8B7CFF] h-full transition-all duration-300 rounded-full"
                style={{ width: `${autoPilotProgress.progressPercent}%` }}
              />
            </div>
            <span className="text-[11px] font-mono text-[#697386]">
              {autoPilotProgress.progressPercent}% Completed
            </span>
          </div>
        </div>
      )}

      {/* Instant Auto-Pilot Result Modal */}
      {showResultModal && autoPilotResult && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl bg-[#11141B] border border-[#292F3A] p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-[#292F3A] mb-5">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#34D399]" />
                <h3 className="text-base font-bold text-[#F5F7FA]">
                  AI Photo Studio Result
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowResultModal(false)}
                className="p-1 rounded-lg text-[#9CA3AF] hover:text-[#F5F7FA] hover:bg-[#1C2230]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Photo Comparison Display */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
              <div className="text-center">
                <div className="w-36 h-44 rounded-xl overflow-hidden border border-[#292F3A] bg-black mx-auto mb-1.5 relative">
                  <img
                    src={autoPilotResult.originalImageSrc}
                    alt="Original"
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-[11px] text-[#697386]">Original Portrait</span>
              </div>

              <div className="text-center">
                <div className="w-36 h-44 rounded-xl overflow-hidden border-2 border-[#8B7CFF] bg-white mx-auto mb-1.5 relative shadow-lg shadow-[#8B7CFF]/15">
                  <img
                    src={autoPilotResult.croppedPhotoDataUrl}
                    alt="AI Processed Result"
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-[11px] font-medium text-[#34D399]">
                  35×45mm @ 300 DPI Pass
                </span>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="p-3 rounded-xl bg-[#171B24] border border-[#292F3A] grid grid-cols-3 gap-2 text-center text-xs mb-6">
              <div>
                <div className="text-[#697386] text-[10px]">Compliance</div>
                <div className="font-bold text-[#34D399] mt-0.5">
                  {autoPilotResult.complianceScore}/100
                </div>
              </div>
              <div>
                <div className="text-[#697386] text-[10px]">Head Coverage</div>
                <div className="font-bold text-[#F5F7FA] mt-0.5">
                  {autoPilotResult.biometricEvaluation
                    ? Math.round(autoPilotResult.biometricEvaluation.detectedHeadRatio * 100)
                    : 72}
                  %
                </div>
              </div>
              <div>
                <div className="text-[#697386] text-[10px]">Resolution</div>
                <div className="font-bold text-[#F5F7FA] mt-0.5">300 DPI</div>
              </div>
            </div>

            {/* Download Buttons */}
            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                onClick={handleDownloadSinglePhoto}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#8B7CFF] hover:bg-[#7665F5] text-xs sm:text-sm font-semibold text-white transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download Single Photo (300 DPI JPEG)</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadPrintSheet}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#171B24] hover:bg-[#1C2230] border border-[#292F3A] text-xs sm:text-sm font-semibold text-[#F5F7FA] transition-colors"
              >
                <Printer className="w-4 h-4 text-[#8B7CFF]" />
                <span>Download 4×6 Print Sheet (6 Copies)</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadPdf}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-transparent hover:bg-[#171B24] text-xs font-medium text-[#9CA3AF] hover:text-[#F5F7FA] transition-colors"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Download Print-Ready PDF</span>
              </button>

              <button
                type="button"
                onClick={handleOpenEditor}
                className="mt-2 text-center text-xs text-[#8B7CFF] hover:underline"
              >
                Continue fine-tuning in full studio →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Passport Photo Studio Guided Setup Modal */}
      {isStudioModalOpen && (
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
      )}
    </div>
  );
}
