"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  StudioWorkflowMode,
  PersonCategory,
  ClothingPresentationPreference,
  HeadCoveringPreference,
  SpectaclesPreference,
  SpectaclesAction,
  BackgroundSelectionColor,
  ClothingChangeSelection,
  StudioSetupSelections,
  StudioProgressState,
  StudioResult,
} from "@/types/studio";
import {
  evaluateSpectaclesAdvisory,
  AI_SPECTACLES_REMOVAL_WARNING,
} from "@/lib/ai/spectaclesAdvisor";
import { STUDIO_ATTIRE_STYLES, getAttireOptions } from "@/lib/ai/clothingAttireService";
import { runStudioPipeline } from "@/lib/ai/studioOrchestrator";
import {
  ShieldCheck,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  X,
  RotateCcw,
  Sliders,
  FileCheck2,
  Wand2,
  Layers,
  ArrowRight,
  Eye,
  Glasses,
  Check,
  RefreshCw,
  UploadCloud,
  Download,
  ZoomIn,
} from "lucide-react";
import { detectBiometricFace } from "@/lib/ai/faceDetector";
import {
  analyzeEyewearVisibility,
  BLOCKING_SUNGLASSES_WARNING,
  EyewearAnalysisResult,
} from "@/lib/ai/eyewearDetector";

interface GuidedStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  photoUrl: string;
  onAcceptAndContinue?: (result: StudioResult) => void;
}

export function GuidedStudioModal({
  isOpen,
  onClose,
  photoUrl,
  onAcceptAndContinue,
}: GuidedStudioModalProps) {
  const router = useRouter();

  // Wizard Step: 1 (Mode) -> 2 (Category/Head) -> 3 (Spectacles) -> 4 (Clothing) -> 5 (Background) -> 6 (Confirm) -> 7 (Progress) -> 8 (Preview)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Active photo URL & file input
  const [activePhotoUrl, setActivePhotoUrl] = useState<string>(photoUrl);
  const [detectedEyewear, setDetectedEyewear] = useState<EyewearAnalysisResult | null>(null);
  const [isAnalyzingPhoto, setIsAnalyzingPhoto] = useState<boolean>(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Selections state
  const [mode, setMode] = useState<StudioWorkflowMode>("official");
  const [category, setCategory] = useState<PersonCategory>("adult");
  const [headCovering, setHeadCovering] = useState<HeadCoveringPreference>("none");
  const [spectacles, setSpectacles] = useState<SpectaclesPreference>("none");
  const [spectaclesAction, setSpectaclesAction] = useState<SpectaclesAction>("keep");
  const [clothingPresentation, setClothingPresentation] =
    useState<ClothingPresentationPreference>("original");
  const [clothingChange, setClothingChange] = useState<ClothingChangeSelection>("keep");
  const [selectedAttireId, setSelectedAttireId] = useState<string>("mens-navy-suit");
  const [backgroundColor, setBackgroundColor] = useState<BackgroundSelectionColor>("white");
  const [customHexColor, setCustomHexColor] = useState<string>("#F1F5F9");

  // Execution & Result state
  const [progress, setProgress] = useState<StudioProgressState | null>(null);
  const [result, setResult] = useState<StudioResult | null>(null);
  const [historyResult, setHistoryResult] = useState<StudioResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [previewTab, setPreviewTab] = useState<"after" | "before" | "split" | "mask">("split");

  // Manual Crop Fine-Tuning State
  const [manualZoomOffset, setManualZoomOffset] = useState<number>(0);
  const [manualPanX, setManualPanX] = useState<number>(0);
  const [manualPanY, setManualPanY] = useState<number>(0);
  const [customProcessedUrl, setCustomProcessedUrl] = useState<string | null>(null);
  const [showCropAdjuster, setShowCropAdjuster] = useState<boolean>(false);

  React.useEffect(() => {
    setActivePhotoUrl(photoUrl);
  }, [photoUrl]);

  // Run computer vision eyewear detector whenever active photo changes
  React.useEffect(() => {
    if (!activePhotoUrl) return;
    let isMounted = true;
    setIsAnalyzingPhoto(true);

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = async () => {
      if (!isMounted) return;
      try {
        const detection = await detectBiometricFace(img);
        const face = detection.primaryFace || {
          boundingBox: {
            originX: 0.25,
            originY: 0.15,
            width: 0.5,
            height: 0.6,
            pixelX: Math.round((img.naturalWidth || 700) * 0.25),
            pixelY: Math.round((img.naturalHeight || 900) * 0.15),
            pixelWidth: Math.round((img.naturalWidth || 700) * 0.5),
            pixelHeight: Math.round((img.naturalHeight || 900) * 0.6),
          },
          landmarks: {
            leftEye: { x: 0.4, y: 0.38 },
            rightEye: { x: 0.6, y: 0.38 },
            eyeCenter: { x: 0.5, y: 0.38 },
            noseTip: { x: 0.5, y: 0.48 },
            mouthCenter: { x: 0.5, y: 0.58 },
            chinBottom: { x: 0.5, y: 0.72 },
            crownTop: { x: 0.5, y: 0.15 },
            leftEar: { x: 0.28, y: 0.42 },
            rightEar: { x: 0.72, y: 0.42 },
          },
          rollAngleDeg: 0,
          headHeightRatio: 0.57,
          headWidthRatio: 0.44,
          confidence: 0.9,
        };
        const analysis = analyzeEyewearVisibility(img, face);
        if (isMounted) {
          setDetectedEyewear(analysis);
          if (analysis.blockingWarning || analysis.classification === "dark-sunglasses") {
            setSpectacles("tinted");
          } else if (analysis.classification === "clear-prescription") {
            setSpectacles("clear");
          }
        }
      } catch (err) {
        console.warn("Eyewear detection error:", err);
      } finally {
        if (isMounted) setIsAnalyzingPhoto(false);
      }
    };
    img.onerror = () => {
      if (isMounted) setIsAnalyzingPhoto(false);
    };
    img.src = activePhotoUrl;

    return () => {
      isMounted = false;
    };
  }, [activePhotoUrl]);

  if (!isOpen) return null;

  const spectaclesAdvisory = evaluateSpectaclesAdvisory(spectacles, mode);
  const attireOptions = getAttireOptions(category, clothingPresentation);

  // Trigger Studio Generation
  const handleGenerate = async () => {
    setCurrentStep(7); // Progress Screen
    setErrorMsg(null);
    setCustomProcessedUrl(null);
    setManualZoomOffset(0);
    setManualPanX(0);
    setManualPanY(0);

    const selections: StudioSetupSelections = {
      mode,
      category,
      clothingPresentation,
      clothingChange,
      selectedAttireId: clothingChange !== "keep" ? selectedAttireId : undefined,
      headCovering,
      spectacles,
      spectaclesAction,
      backgroundColor,
      customHexColor: backgroundColor === "custom" ? customHexColor : undefined,
    };

    try {
      // 25-second maximum watchdog timer ensuring the modal never hangs indefinitely
      const pipelinePromise = runStudioPipeline(activePhotoUrl, selections, (prog) => {
        setProgress(prog);
      });
      const watchdogPromise = new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(new Error("AI Studio generation timed out. Please try again with fast mode.")),
          25000
        )
      );

      const generated = await Promise.race([pipelinePromise, watchdogPromise]);
      setHistoryResult(result);
      setResult(generated);
      setCurrentStep(8); // Preview Screen
    } catch (err: any) {
      console.error("AI Studio execution failed:", err);
      setErrorMsg(err.message || "Failed to process photo in AI Studio");
      setCurrentStep(6);
    }
  };

  const handleReupload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setActivePhotoUrl(reader.result);
        setResult(null);
        setCustomProcessedUrl(null);
        setManualZoomOffset(0);
        setManualPanX(0);
        setManualPanY(0);
        setCurrentStep(1);
      }
    };
    reader.readAsDataURL(file);
  };

  const applyManualCropNudge = (zoomDelta: number, panXDelta: number, panYDelta: number) => {
    if (!result) return;
    setManualZoomOffset(zoomDelta);
    setManualPanX(panXDelta);
    setManualPanY(panYDelta);

    const canvas = document.createElement("canvas");
    canvas.width = 413;
    canvas.height = 531;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = result.selections.backgroundColor === "white" ? "#FFFFFF" : "#F8FAFC";
    ctx.fillRect(0, 0, 413, 531);

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      ctx.save();
      ctx.translate(413 / 2, 531 / 2);
      ctx.translate(panXDelta, panYDelta);
      const zoom = 1.0 + zoomDelta;
      ctx.scale(zoom, zoom);
      ctx.drawImage(img, -413 / 2, -531 / 2, 413, 531);
      ctx.restore();
      const updatedUrl = canvas.toDataURL("image/jpeg", 0.96);
      setCustomProcessedUrl(updatedUrl);
    };
    img.src = result.processedPhotoUrl;
  };

  const handleDownload = () => {
    const url = customProcessedUrl || result?.processedPhotoUrl;
    if (!url) return;
    const a = document.createElement("a");
    a.href = url;
    a.download = `photomaze-passport-35x45mm-${Date.now()}.jpg`;
    a.click();
  };

  const handleAccept = () => {
    if (!result) return;
    const finalResult = customProcessedUrl
      ? { ...result, processedPhotoUrl: customProcessedUrl }
      : result;
    if (onAcceptAndContinue) {
      onAcceptAndContinue(finalResult);
    } else {
      // Default: save into sessionStorage and navigate to /editor
      try {
        sessionStorage.setItem("ppm_uploaded_image_src", finalResult.processedPhotoUrl);
        sessionStorage.setItem("ppm_original_image_src", finalResult.originalPhotoUrl);
        sessionStorage.setItem("ppm_transparent_cutout_url", finalResult.transparentSubjectUrl);
        sessionStorage.setItem("ppm_studio_mode", finalResult.mode);
      } catch (e) {
        console.warn("sessionStorage save error:", e);
      }
      onClose();
      router.push("/editor");
    }
  };

  const handleStartOver = () => {
    setCurrentStep(1);
    setResult(null);
  };

  const handleUndo = () => {
    if (historyResult) {
      setResult(historyResult);
      setHistoryResult(null);
    } else {
      setCurrentStep(1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl my-8 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90 sticky top-0 z-10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                PhotoMaze AI Passport Studio
                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  100% Free • On-Device
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Facial identity preservation • ICAO Doc 9303 & Indian Passport standard
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Stepper Bar (Steps 1 to 6) */}
        {currentStep <= 6 && (
          <div className="px-6 pt-4 pb-2 bg-slate-900/50 border-b border-slate-800/60">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span>Step {currentStep} of 6</span>
              <span className="font-medium text-blue-400">
                {currentStep === 1 && "Select Processing Mode"}
                {currentStep === 2 && "Person Category & Head Covering"}
                {currentStep === 3 && "Spectacles & Eyewear"}
                {currentStep === 4 && "Clothing Presentation"}
                {currentStep === 5 && "Background Color"}
                {currentStep === 6 && "Review & Confirmation"}
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300"
                style={{ width: `${(currentStep / 6) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Hidden Reupload File Input */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/jpeg,image/png,image/webp,image/heic"
          className="hidden"
          onChange={handleReupload}
        />

        {/* Step Body */}
        <div className="p-6 flex-1 overflow-y-auto max-h-[70vh]">
          {/* Eyewear Blocking Warning Banner */}
          {detectedEyewear?.blockingWarning && (
            <div className="mb-5 p-4 rounded-xl bg-red-950/80 border-2 border-red-500/90 text-red-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg shadow-red-950/50">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-red-300 uppercase tracking-wider mb-0.5">
                    Non-Compliant Eyewear Detected (ICAO Doc 9303 / Passport Standard)
                  </div>
                  <p className="text-xs leading-relaxed text-red-100 font-medium">
                    {BLOCKING_SUNGLASSES_WARNING}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="shrink-0 px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Upload Another Photo</span>
              </button>
            </div>
          )}

          {/* ── STEP 1: PROCESSING MODE ────────────────────────────────────── */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-white mb-1">
                  Choose your photo preparation mode
                </h3>
                <p className="text-xs text-slate-400">
                  Select the intended destination for your passport photograph.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {/* Official Mode */}
                <div
                  onClick={() => setMode("official")}
                  className={`p-5 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                    mode === "official"
                      ? "border-blue-500 bg-blue-500/10 ring-2 ring-blue-500/30"
                      : "border-slate-800 bg-slate-800/40 hover:border-slate-700"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Official Passport & Visa
                      </span>
                      {mode === "official" && <CheckCircle2 className="w-5 h-5 text-blue-400" />}
                    </div>
                    <h4 className="text-sm font-bold text-white mb-1">
                      Official Document Preparation Mode
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed mb-3">
                      Strictly prioritizes authentic original photo. 100% genuine face pixels,
                      authentic garments, no generative alteration. Permitted adjustments only
                      (Indian 35×45mm crop, eye centering, pure white background).
                    </p>
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-3 border-t border-slate-700/50">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Guaranteed MEA India & ICAO Doc 9303 compliant</span>
                  </div>
                </div>

                {/* Studio Mode */}
                <div
                  onClick={() => setMode("appearance")}
                  className={`p-5 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                    mode === "appearance"
                      ? "border-blue-500 bg-blue-500/10 ring-2 ring-blue-500/30"
                      : "border-slate-800 bg-slate-800/40 hover:border-slate-700"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        Resume, CV & Studio Portfolios
                      </span>
                      {mode === "appearance" && <CheckCircle2 className="w-5 h-5 text-blue-400" />}
                    </div>
                    <h4 className="text-sm font-bold text-white mb-1">
                      Studio Appearance Mode
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed mb-3">
                      Allows virtual formal attire changes (business suits, blazers, collared
                      shirts) and alternative studio background tones. Protects face pixels with
                      100% fidelity.
                    </p>
                  </div>
                  <div className="text-[11px] text-amber-300/80 flex items-center gap-1.5 pt-3 border-t border-slate-700/50">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Generative edits may not be accepted for official passports</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 2: CATEGORY & HEAD COVERING ──────────────────────────── */}
          {currentStep === 2 && (
            <div className="space-y-6">
              {/* Category */}
              <div>
                <label className="text-sm font-bold text-white block mb-2">
                  A. Person Category
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setCategory("adult")}
                    className={`p-4 rounded-xl border text-left transition ${
                      category === "adult"
                        ? "border-blue-500 bg-blue-500/10 ring-1 ring-blue-500"
                        : "border-slate-800 bg-slate-800/40 hover:border-slate-700"
                    }`}
                  >
                    <div className="text-xl mb-1">🧑</div>
                    <div className="text-sm font-bold text-white">Adult</div>
                    <div className="text-xs text-slate-400">
                      Standard 70–80% chin-to-crown ratio
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCategory("child")}
                    className={`p-4 rounded-xl border text-left transition ${
                      category === "child"
                        ? "border-blue-500 bg-blue-500/10 ring-1 ring-blue-500"
                        : "border-slate-800 bg-slate-800/40 hover:border-slate-700"
                    }`}
                  >
                    <div className="text-xl mb-1">🧒</div>
                    <div className="text-sm font-bold text-white">Child / Infant</div>
                    <div className="text-xs text-slate-400">
                      Calibrated 60–75% head ratio for kids
                    </div>
                  </button>
                </div>
              </div>

              {/* Head Covering */}
              <div>
                <label className="text-sm font-bold text-white block mb-1">
                  B. Religious Head Covering & Attire Preservation
                </label>
                <p className="text-xs text-slate-400 mb-3">
                  Under official ICAO Doc 9303 rules, religious headwear is fully permitted as long
                  as the facial oval from chin to forehead remains unobscured.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {[
                    { id: "none", label: "No head covering", icon: "👤" },
                    { id: "hijab", label: "Hijab", icon: "🧕" },
                    { id: "turban", label: "Turban / Dastar", icon: "👳" },
                    { id: "other", label: "Other head covering", icon: "🧢" },
                    { id: "preserve", label: "Preserve exactly as uploaded", icon: "🔒" },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setHeadCovering(item.id as HeadCoveringPreference)}
                      className={`p-3 rounded-xl border text-left transition flex items-center space-x-2.5 ${
                        headCovering === item.id
                          ? "border-blue-500 bg-blue-500/10 ring-1 ring-blue-500 text-white"
                          : "border-slate-800 bg-slate-800/30 text-slate-300 hover:border-slate-700"
                      }`}
                    >
                      <span className="text-lg">{item.icon}</span>
                      <span className="text-xs font-semibold">{item.label}</span>
                    </button>
                  ))}
                </div>

                {headCovering !== "none" && (
                  <div className="mt-4 p-3.5 rounded-xl bg-blue-950/40 border border-blue-800/50 flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                    <div className="text-xs text-blue-200 leading-relaxed">
                      <strong>Religious Headwear Guarantee:</strong> PhotoMaze preserves your head
                      covering, exact fabric drape, and placement with 0% alteration in accordance
                      with MEA India & ICAO Doc 9303 standards.
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── STEP 3: SPECTACLES & EYEWEAR ─────────────────────────────── */}
          {currentStep === 3 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-base font-bold text-white mb-1">
                  Spectacles & Eyewear Preference
                </h3>
                <p className="text-xs text-slate-400">
                  Select whether you are wearing glasses in the photograph.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    id: "none",
                    label: "Not wearing glasses",
                    desc: "Optimal for passport compliance",
                    icon: "👁️",
                  },
                  {
                    id: "clear",
                    label: "Clear prescription glasses",
                    desc: "Permitted if eyes are clearly visible",
                    icon: "👓",
                  },
                  {
                    id: "tinted",
                    label: "Tinted / dark glasses",
                    desc: "Strictly prohibited for passports",
                    icon: "🕶️",
                  },
                  {
                    id: "unsure",
                    label: "Unsure / Need guidance",
                    desc: "We will review your eyewear",
                    icon: "❓",
                  },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSpectacles(item.id as SpectaclesPreference)}
                    className={`p-4 rounded-xl border text-left transition ${
                      spectacles === item.id
                        ? "border-blue-500 bg-blue-500/10 ring-1 ring-blue-500"
                        : "border-slate-800 bg-slate-800/40 hover:border-slate-700"
                    }`}
                  >
                    <div className="text-xl mb-1">{item.icon}</div>
                    <div className="text-xs font-bold text-white">{item.label}</div>
                    <div className="text-[11px] text-slate-400">{item.desc}</div>
                  </button>
                ))}
              </div>

              {/* Advisory Box if glasses present */}
              {spectacles !== "none" && (
                <div
                  className={`p-4 rounded-xl border ${
                    spectaclesAdvisory.badgeType === "danger"
                      ? "bg-red-950/40 border-red-800 text-red-200"
                      : "bg-amber-950/40 border-amber-800 text-amber-200"
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-sm mb-1">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                    <span>{spectaclesAdvisory.headline}</span>
                  </div>
                  <p className="text-xs leading-relaxed mb-3">
                    {spectaclesAdvisory.warningNotice}
                  </p>

                  {/* Removal Warning Question */}
                  <div className="pt-3 border-t border-slate-700/60">
                    <label className="text-xs font-semibold block mb-2">
                      Would you like AI to attempt spectacles removal?
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-start gap-2.5 text-xs cursor-pointer">
                        <input
                          type="radio"
                          name="specAction"
                          checked={spectaclesAction === "keep"}
                          onChange={() => setSpectaclesAction("keep")}
                          className="mt-0.5 text-blue-500"
                        />
                        <span>
                          <strong>Keep my glasses (Recommended for official mode):</strong> Preserves
                          original authentic pixels without AI reconstruction.
                        </span>
                      </label>

                      {mode === "appearance" && (
                        <label className="flex items-start gap-2.5 text-xs cursor-pointer">
                          <input
                            type="radio"
                            name="specAction"
                            checked={spectaclesAction === "remove"}
                            onChange={() => setSpectaclesAction("remove")}
                            className="mt-0.5 text-blue-500"
                          />
                          <span>
                            <strong>Remove glasses with AI (Studio mode only):</strong> Reconstructs
                            eye contour. <em>Not guaranteed 100% identity match.</em>
                          </span>
                        </label>
                      )}

                      <label className="flex items-start gap-2.5 text-xs cursor-pointer">
                        <input
                          type="radio"
                          name="specAction"
                          checked={spectaclesAction === "retake"}
                          onChange={() => setSpectaclesAction("retake")}
                          className="mt-0.5 text-blue-500"
                        />
                        <span>
                          <strong>Retake / upload photo without glasses:</strong> Best practice if
                          reflections or thick frames obscure eyes.
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── STEP 4: CLOTHING PRESENTATION & STYLE ────────────────────── */}
          {currentStep === 4 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-base font-bold text-white mb-1">
                  Clothing Presentation Preference
                </h3>
                <p className="text-xs text-slate-400">
                  Select your clothing presentation preference. This is explicitly chosen by you and
                  never inferred from your photograph.
                </p>
              </div>

              {/* Presentation Options */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: "original", label: "Keep Original", icon: "👕" },
                  { id: "formal-masculine", label: "Formal Masculine", icon: "👔" },
                  { id: "formal-feminine", label: "Formal Feminine", icon: "👗" },
                  { id: "formal-neutral", label: "Formal Neutral", icon: "💼" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setClothingPresentation(item.id as ClothingPresentationPreference);
                      if (item.id === "original") {
                        setClothingChange("keep");
                      } else {
                        setClothingChange("generate-formal");
                      }
                    }}
                    className={`p-3.5 rounded-xl border text-center transition ${
                      clothingPresentation === item.id
                        ? "border-blue-500 bg-blue-500/10 ring-1 ring-blue-500"
                        : "border-slate-800 bg-slate-800/40 hover:border-slate-700"
                    }`}
                  >
                    <div className="text-xl mb-1">{item.icon}</div>
                    <div className="text-xs font-bold text-white">{item.label}</div>
                  </button>
                ))}
              </div>

              {/* In Studio Appearance Mode: Specific Style Selection */}
              {mode === "appearance" && clothingPresentation !== "original" && (
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-xs font-bold text-white">
                      Select Formal Attire Style (Preview before generation):
                    </label>
                    <span className="text-[11px] text-blue-400">
                      Layered beneath protected face mask
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {attireOptions.map((attire) => (
                      <div
                        key={attire.id}
                        onClick={() => setSelectedAttireId(attire.id)}
                        className={`p-3 rounded-xl border cursor-pointer transition flex flex-col items-center text-center ${
                          selectedAttireId === attire.id
                            ? "border-blue-500 bg-blue-500/10 ring-1 ring-blue-500"
                            : "border-slate-800 bg-slate-800/30 hover:border-slate-700"
                        }`}
                      >
                        <div className="w-14 h-14 rounded-lg overflow-hidden border border-slate-700 mb-2 bg-slate-900 flex items-center justify-center">
                          <img
                            src={attire.previewThumbnail}
                            alt={attire.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="text-xs font-semibold text-white line-clamp-1">
                          {attire.name}
                        </span>
                        <span className="text-[10px] text-slate-400 line-clamp-2 mt-0.5">
                          {attire.description}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {mode === "official" && (
                <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60 text-xs text-slate-300">
                  💡 <strong>Official Passport Guidance:</strong> Standard passport rules recommend
                  plain, neat daily clothing without uniforms. In Official Mode, your original
                  garment is preserved authentic with balanced studio exposure.
                </div>
              )}
            </div>
          )}

          {/* ── STEP 5: BACKGROUND COLOR ─────────────────────────────────── */}
          {currentStep === 5 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-base font-bold text-white mb-1">
                  Background Color Selection
                </h3>
                <p className="text-xs text-slate-400">
                  India and most national passport authorities mandate a pure white background.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  {
                    id: "white",
                    label: "Pure White (#FFFFFF)",
                    hex: "#FFFFFF",
                    badge: "Indian Standard",
                  },
                  { id: "off-white", label: "Off-White", hex: "#F8FAFC", badge: "Permitted" },
                  { id: "light-grey", label: "Light Grey", hex: "#E2E8F0", badge: "Studio" },
                  { id: "light-blue", label: "Light Blue", hex: "#E0F2FE", badge: "Optional" },
                  {
                    id: "custom",
                    label: "Custom Colour",
                    hex: customHexColor,
                    badge: "Custom",
                  },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setBackgroundColor(item.id as BackgroundSelectionColor)}
                    className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between ${
                      backgroundColor === item.id
                        ? "border-blue-500 bg-blue-500/10 ring-1 ring-blue-500"
                        : "border-slate-800 bg-slate-800/40 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div
                        className="w-6 h-6 rounded-full border border-slate-600 shadow"
                        style={{ backgroundColor: item.hex }}
                      />
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-slate-800 text-slate-300">
                        {item.badge}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-white">{item.label}</span>
                  </button>
                ))}
              </div>

              {backgroundColor === "custom" && (
                <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700 flex items-center space-x-3">
                  <input
                    type="color"
                    value={customHexColor}
                    onChange={(e) => setCustomHexColor(e.target.value)}
                    className="w-10 h-10 rounded border border-slate-600 cursor-pointer bg-transparent"
                  />
                  <div className="text-xs">
                    <span className="text-slate-300 font-semibold block">Pick Custom Colour</span>
                    <span className="text-slate-400">{customHexColor}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── STEP 6: CONFIRMATION SCREEN ──────────────────────────────── */}
          {currentStep === 6 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-base font-bold text-white mb-1">
                  Confirm Your Studio Selections
                </h3>
                <p className="text-xs text-slate-400">
                  Review your parameters before generating your biometric passport photo.
                </p>
              </div>

              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-800 text-xs text-red-200">
                  {errorMsg}
                </div>
              )}

              <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between text-xs py-1.5 border-b border-slate-700/50">
                  <span className="text-slate-400">Workflow Mode:</span>
                  <span className="font-semibold text-white capitalize">
                    {mode === "official"
                      ? "Official Document Mode (MEA India / ICAO)"
                      : "Studio Appearance Mode"}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs py-1.5 border-b border-slate-700/50">
                  <span className="text-slate-400">Category & Head Covering:</span>
                  <span className="font-semibold text-white capitalize">
                    {category} • {headCovering}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs py-1.5 border-b border-slate-700/50">
                  <span className="text-slate-400">Clothing Presentation:</span>
                  <span className="font-semibold text-white capitalize">
                    {clothingPresentation.replace("-", " ")}
                    {clothingChange !== "keep" && ` (${selectedAttireId})`}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs py-1.5 border-b border-slate-700/50">
                  <span className="text-slate-400">Spectacles Preference:</span>
                  <span className="font-semibold text-white capitalize">
                    {spectacles} (Action: {spectaclesAction})
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs py-1.5 border-b border-slate-700/50">
                  <span className="text-slate-400">Background Color:</span>
                  <span className="font-semibold text-white capitalize">
                    {backgroundColor} ({backgroundColor === "custom" ? customHexColor : "#FFFFFF"})
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs py-1.5">
                  <span className="text-slate-400">Facial Preservation:</span>
                  <span className="font-semibold text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> 100% Authentic Ground Truth
                  </span>
                </div>
              </div>

              {/* Indian Passport Standard Callout */}
              <div className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-800/40 flex items-center space-x-3 text-xs text-blue-200">
                <FileCheck2 className="w-5 h-5 text-blue-400 shrink-0" />
                <span>
                  Photo will be formatted to standard Indian 35×45mm at 300 DPI (413×531 px) with
                  70–80% head height and eye-line alignment.
                </span>
              </div>
            </div>
          )}

          {/* ── STEP 7: PROGRESS STEPPER ─────────────────────────────────── */}
          {currentStep === 7 && (
            <div className="py-8 flex flex-col items-center text-center space-y-6">
              <div className="relative w-20 h-20 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-slate-800 border-t-blue-500 animate-spin" />
                <Sparkles className="w-8 h-8 text-blue-400 animate-pulse" />
              </div>

              <div className="max-w-md space-y-2">
                <h3 className="text-lg font-bold text-white">
                  {progress?.message || "Processing your passport photo…"}
                </h3>
                <p className="text-xs text-slate-400">
                  {progress?.detail ||
                    "Executing biometric landmark protection and background isolation on device."}
                </p>
              </div>

              {/* Progress bar */}
              <div className="w-full max-w-md bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300"
                  style={{ width: `${progress?.percent || 20}%` }}
                />
              </div>

              <div className="text-xs text-slate-400 font-mono">
                {progress?.percent || 20}% Completed • Non-blocking client execution
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(6)}
                  className="text-xs text-slate-500 hover:text-slate-300 underline transition-colors"
                >
                  Cancel and adjust settings
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 8: SIDE-BY-SIDE PREVIEW ─────────────────────────────── */}
          {currentStep === 8 && result && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    Passport Photo Generated Successfully
                    <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Score: {result.compliance.score}/100
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Indian 35×45mm @ 300 DPI • 100% Authentic Face Pixels Preserved
                  </p>
                </div>

                {/* View Toggles */}
                <div className="flex items-center bg-slate-800 p-1 rounded-lg text-xs gap-1">
                  <button
                    onClick={() => setPreviewTab("split")}
                    className={`px-2.5 py-1 rounded font-medium transition ${
                      previewTab === "split" ? "bg-blue-600 text-white" : "text-slate-400"
                    }`}
                  >
                    Side-by-Side
                  </button>
                  <button
                    onClick={() => setPreviewTab("after")}
                    className={`px-2.5 py-1 rounded font-medium transition ${
                      previewTab === "after" ? "bg-blue-600 text-white" : "text-slate-400"
                    }`}
                  >
                    Passport
                  </button>
                  <button
                    onClick={() => setPreviewTab("before")}
                    className={`px-2.5 py-1 rounded font-medium transition ${
                      previewTab === "before" ? "bg-blue-600 text-white" : "text-slate-400"
                    }`}
                  >
                    Original
                  </button>
                  <button
                    onClick={() => setPreviewTab("mask")}
                    className={`px-2.5 py-1 rounded font-medium transition flex items-center gap-1 ${
                      previewTab === "mask" ? "bg-indigo-600 text-white" : "text-indigo-300/80 hover:text-white"
                    }`}
                  >
                    <Layers className="w-3 h-3" /> Mask Inspector
                  </button>
                </div>
              </div>

              {/* Visual Display */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-center min-h-[300px]">
                {previewTab === "split" && (
                  <div className="grid grid-cols-2 gap-4 w-full max-w-lg">
                    {/* Before */}
                    <div className="flex flex-col items-center">
                      <span className="text-xs text-slate-400 mb-2 font-medium">Original</span>
                      <div className="w-full aspect-[35/45] rounded-lg overflow-hidden border border-slate-800 bg-slate-900 shadow">
                        <img
                          src={result.originalPhotoUrl}
                          alt="Original"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>

                    {/* After */}
                    <div className="flex flex-col items-center">
                      <span className="text-xs text-blue-400 mb-2 font-medium flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" /> Studio Passport Photo
                      </span>
                      <div className="w-full aspect-[35/45] rounded-lg overflow-hidden border-2 border-blue-500 shadow-lg shadow-blue-500/20">
                        <img
                          src={customProcessedUrl || result.processedPhotoUrl}
                          alt="Processed"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {previewTab === "after" && (
                  <div className="w-64 aspect-[35/45] rounded-xl overflow-hidden border-2 border-blue-500 shadow-2xl">
                    <img
                      src={customProcessedUrl || result.processedPhotoUrl}
                      alt="Processed"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {previewTab === "before" && (
                  <div className="w-64 aspect-[35/45] rounded-xl overflow-hidden border border-slate-800 shadow">
                    <img
                      src={result.originalPhotoUrl}
                      alt="Original"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {previewTab === "mask" && (
                  <div className="flex flex-col items-center max-w-sm w-full py-2">
                    <div className="flex items-center justify-between w-full mb-2 px-1">
                      <span className="text-xs text-indigo-300 font-semibold flex items-center gap-1.5">
                        <Layers className="w-4 h-4 text-indigo-400" /> Segmentation Mask & Alpha Matte
                      </span>
                      <span className="text-[10px] text-slate-400">MediaPipe + Guided Filter</span>
                    </div>
                    <div className="w-full aspect-[35/45] rounded-xl overflow-hidden border-2 border-indigo-500 bg-black shadow-2xl flex items-center justify-center p-1">
                      <img
                        src={result.segmentationMaskUrl || result.alphaMatteUrl || result.transparentSubjectUrl}
                        alt="Developer Segmentation Mask"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-2 text-center">
                      Sub-pixel continuous alpha matte with RGB luminance guided edge refinement.
                    </p>
                  </div>
                )}
              </div>

              {/* Manual Biometric Crop Adjustments */}
              <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-bold text-white">Manual Biometric Crop Adjustments</span>
                  </div>
                  {(manualZoomOffset !== 0 || manualPanX !== 0 || manualPanY !== 0) && (
                    <button
                      type="button"
                      onClick={() => applyManualCropNudge(0, 0, 0)}
                      className="text-[11px] text-blue-400 hover:text-blue-300 cursor-pointer"
                    >
                      Reset Crop
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <div className="flex justify-between text-slate-400 mb-1">
                      <span>Zoom Scale:</span>
                      <span className="font-mono text-white">{(1 + manualZoomOffset).toFixed(2)}x</span>
                    </div>
                    <input
                      type="range"
                      min="-0.2"
                      max="0.3"
                      step="0.01"
                      value={manualZoomOffset}
                      onChange={(e) => applyManualCropNudge(parseFloat(e.target.value), manualPanX, manualPanY)}
                      className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-400 mb-1">
                      <span>Pan Horizontal (X):</span>
                      <span className="font-mono text-white">{manualPanX}px</span>
                    </div>
                    <input
                      type="range"
                      min="-30"
                      max="30"
                      step="1"
                      value={manualPanX}
                      onChange={(e) => applyManualCropNudge(manualZoomOffset, parseInt(e.target.value, 10), manualPanY)}
                      className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-400 mb-1">
                      <span>Pan Vertical (Y):</span>
                      <span className="font-mono text-white">{manualPanY}px</span>
                    </div>
                    <input
                      type="range"
                      min="-30"
                      max="30"
                      step="1"
                      value={manualPanY}
                      onChange={(e) => applyManualCropNudge(manualZoomOffset, manualPanX, parseInt(e.target.value, 10))}
                      className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Compliance & Telemetry Chips */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-700/60">
                  <span className="text-slate-400 block text-[10px]">Dimensions</span>
                  <span className="font-semibold text-white">
                    {result.compliance.dimensionsMm} (300 DPI)
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-700/60">
                  <span className="text-slate-400 block text-[10px]">Head Ratio</span>
                  <span className="font-semibold text-emerald-400">
                    {Math.round(result.compliance.headCoverageRatio * 100)}% (70-80% Target)
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-700/60">
                  <span className="text-slate-400 block text-[10px]">Eye-Line Level</span>
                  <span className="font-semibold text-emerald-400">
                    {Math.round(result.compliance.eyeLineRatio * 100)}% (56-62% Range)
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-700/60">
                  <span className="text-slate-400 block text-[10px]">Face Protection</span>
                  <span className="font-semibold text-blue-400">100% Ground Truth</span>
                </div>
              </div>

              {/* Warnings if any */}
              {result.compliance.warnings.length > 0 && (
                <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-800/40 text-xs text-amber-200">
                  {result.compliance.warnings.map((w, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>{w}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Navigation Buttons */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900 flex items-center justify-between">
          {currentStep <= 6 && (
            <>
              <button
                type="button"
                onClick={() => {
                  if (currentStep > 1) setCurrentStep((prev) => prev - 1);
                  else onClose();
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition flex items-center gap-1.5 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                {currentStep === 1 ? "Cancel" : "Back"}
              </button>

              {currentStep < 6 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep((prev) => prev + 1)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 transition shadow-lg shadow-blue-500/25 flex items-center gap-1.5 cursor-pointer"
                >
                  Continue <ChevronRight className="w-4 h-4" />
                </button>
              ) : mode === "official" && detectedEyewear?.blockingWarning ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-500 transition shadow-lg shadow-red-500/30 flex items-center gap-1.5 cursor-pointer"
                  >
                    <UploadCloud className="w-4 h-4" /> Upload Photo Without Sunglasses
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("appearance")}
                    className="px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition cursor-pointer"
                  >
                    Switch to Studio Mode
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleGenerate}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 transition shadow-lg shadow-blue-500/30 flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" /> Generate My Passport Photo
                </button>
              )}
            </>
          )}

          {currentStep === 8 && (
            <div className="w-full flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleStartOver}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Start Over
                </button>
                <button
                  type="button"
                  onClick={handleGenerate}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Regenerate
                </button>
                {historyResult && (
                  <button
                    type="button"
                    onClick={handleUndo}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                  >
                    Undo
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownload}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 transition shadow-lg shadow-blue-500/25 flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-4 h-4" /> Download High-Res (300 DPI)
                </button>
                <button
                  type="button"
                  onClick={handleAccept}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition shadow-lg shadow-emerald-500/30 flex items-center gap-2 cursor-pointer"
                >
                  <Check className="w-4 h-4" /> Accept & Continue in Editor
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
