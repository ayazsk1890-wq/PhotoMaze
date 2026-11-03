"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import {
  PassportSpec,
  OFFICIAL_COUNTRY_SPECS,
  buildCustomPassportSpec,
  CustomDimensionOptions,
} from "@/lib/constants/countries";
import {
  ImageAdjustments,
  DEFAULT_ADJUSTMENTS,
  ImageMetadata,
  UploadProgressState,
  BackgroundRemovalState,
  FaceDetectionState,
  OutfitReplacementState,
  PortraitEnhancementSettings,
  PortraitEnhancementState,
  DEFAULT_ENHANCEMENT_SETTINGS,
  ENHANCEMENT_PRESETS,
  EnhancementPreset,
  SidebarTab,
  AiPersonaType,
} from "@/types/editor";
import { runFullAiAutoPilot, AutoPilotExecutionResult } from "@/lib/ai/aiAutoPilotService";
import { OutfitTemplate, getOutfitById } from "@/lib/constants/outfits";
import { validateImageFile, assessImageDpi, DEMO_SAMPLE_PHOTOS } from "@/lib/image/clientValidation";
import { removeBackgroundBrowser } from "@/lib/adapters/background/clientRmbg";
import { enhanceImageElement } from "@/lib/image/portraitEnhancer";
import {
  detectFacesInImage,
  FaceDetectionResult,
  DetectedFace,
} from "@/lib/ai/faceDetector";
import {
  computeBiometricAutoCrop,
  evaluateBiometricCompliance,
  BiometricEvaluation,
} from "@/lib/ai/biometricCropper";
import { StudioResult } from "@/types/studio";

interface EditorContextType {
  imageSrc: string | null;
  originalImageSrc: string | null;
  transparentCutoutUrl: string | null;
  backgroundColor: string;
  imageMetadata: ImageMetadata | null;
  adjustments: ImageAdjustments;
  selectedSpec: PassportSpec;
  showGuidelines: boolean;
  showBeforeAfter: boolean;
  showFaceLandmarks: boolean;
  activeSidebarTab: SidebarTab;
  uploadState: UploadProgressState;
  bgRemovalState: BackgroundRemovalState;
  faceDetectionState: FaceDetectionState;
  biometricEvaluation: BiometricEvaluation | null;
  customDimensions: CustomDimensionOptions;
  history: ImageAdjustments[];
  canUndo: boolean;
  outfitState: OutfitReplacementState;
  enhancementState: PortraitEnhancementState;
  enhancedImageUrl: string | null;
  uploadFile: (file: File) => Promise<boolean>;
  replaceImage: () => void;
  deleteImage: () => void;
  loadSamplePhoto: (sampleId: string) => void;
  updateAdjustments: (adjustments: Partial<ImageAdjustments>) => void;
  resetAdjustments: () => void;
  undoAdjustments: () => void;
  setSelectedSpec: (spec: PassportSpec) => void;
  setShowGuidelines: (show: boolean) => void;
  setShowBeforeAfter: (show: boolean) => void;
  setShowFaceLandmarks: (show: boolean) => void;
  setActiveSidebarTab: (tab: SidebarTab) => void;
  setBackgroundColor: (color: string) => void;
  triggerBackgroundRemoval: () => Promise<boolean>;
  restoreOriginalBackground: () => void;
  runFaceDetection: () => Promise<FaceDetectionResult | null>;
  triggerBiometricAutoCrop: () => void;
  setCustomDimensions: (opts: CustomDimensionOptions) => void;
  applyCustomDimensions: (opts: CustomDimensionOptions) => void;
  triggerOutfitReplacement: (outfit: OutfitTemplate) => Promise<boolean>;
  restoreOriginalOutfit: () => void;
  setOutfitPreviewMode: (preview: boolean) => void;
  updateEnhancementSettings: (settings: Partial<PortraitEnhancementSettings>) => void;
  applyEnhancementPreset: (preset: EnhancementPreset) => void;
  toggleEnhancement: (enable?: boolean) => void;
  toggleEnhancementCompare: (compare?: boolean) => void;
  resetEnhancement: () => void;
  isPrintModalOpen: boolean;
  setIsPrintModalOpen: (open: boolean) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  activePersona: AiPersonaType;
  setActivePersona: (persona: AiPersonaType) => void;
  autoPilotState: {
    isRunning: boolean;
    progressPercent: number;
    stageMessage: string;
    lastResult: AutoPilotExecutionResult | null;
  };
  runAiAutoPilot: (persona?: AiPersonaType) => Promise<boolean>;
  restoreProject: (project: {
    country: string;
    documentType: string;
    widthMm: number;
    heightMm: number;
    backgroundColor: string;
    originalImageUrl: string;
    cutoutImageUrl?: string | null;
    adjustments: ImageAdjustments;
    enhancementSettings?: PortraitEnhancementSettings | null;
  }) => void;
  applyStudioResult: (result: StudioResult) => void;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export function EditorProvider({ children }: { children: React.ReactNode }) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [originalImageSrc, setOriginalImageSrc] = useState<string | null>(null);
  const [transparentCutoutUrl, setTransparentCutoutUrl] = useState<string | null>(null);
  const [backgroundColor, setBackgroundColor] = useState<string>("#FFFFFF");
  const [imageMetadata, setImageMetadata] = useState<ImageMetadata | null>(null);
  const [selectedSpec, setSelectedSpec] = useState<PassportSpec>(OFFICIAL_COUNTRY_SPECS[0]);
  const [adjustments, setAdjustments] = useState<ImageAdjustments>(DEFAULT_ADJUSTMENTS);
  const [showGuidelines, setShowGuidelines] = useState<boolean>(true);
  const [showBeforeAfter, setShowBeforeAfter] = useState<boolean>(false);
  const [showFaceLandmarks, setShowFaceLandmarks] = useState<boolean>(true);
  const [activeSidebarTab, setActiveSidebarTab] = useState<SidebarTab>("crop");
  const [history, setHistory] = useState<ImageAdjustments[]>([]);

  const [uploadState, setUploadState] = useState<UploadProgressState>({
    isUploading: false,
    progressPercent: 0,
    stageMessage: "",
  });

  const [bgRemovalState, setBgRemovalState] = useState<BackgroundRemovalState>({
    isProcessing: false,
    progressPercent: 0,
    stageMessage: "",
    error: null,
    providerUsed: null,
  });

  const [faceDetectionState, setFaceDetectionState] = useState<FaceDetectionState>({
    isDetecting: false,
    hasRun: false,
    result: null,
    error: null,
  });

  const [customDimensions, setCustomDimensions] = useState<CustomDimensionOptions>({
    width: 35,
    height: 45,
    unit: "mm",
    dpi: 300,
    backgroundColor: "white",
  });

  const [biometricEvaluation, setBiometricEvaluation] = useState<BiometricEvaluation | null>(null);

  const [outfitState, setOutfitState] = useState<OutfitReplacementState>({
    isProcessing: false,
    progressPercent: 0,
    stageMessage: "",
    error: null,
    outputImageUrl: null,
    selectedOutfitId: null,
    previewMode: false,
    requiresApiKey: false,
  });

  const [enhancementState, setEnhancementState] = useState<PortraitEnhancementState>({
    settings: DEFAULT_ENHANCEMENT_SETTINGS,
    isProcessing: false,
    enhancedDataUrl: null,
    compareMode: false,
  });

  const [activePersona, setActivePersona] = useState<AiPersonaType>("male");
  const [autoPilotState, setAutoPilotState] = useState<{
    isRunning: boolean;
    progressPercent: number;
    stageMessage: string;
    lastResult: AutoPilotExecutionResult | null;
  }>({
    isRunning: false,
    progressPercent: 0,
    stageMessage: "",
    lastResult: null,
  });

  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize from sessionStorage or default sample portrait
  useEffect(() => {
    try {
      const storedSrc = sessionStorage.getItem("ppm_uploaded_image_src");
      const storedOrig = sessionStorage.getItem("ppm_original_image_src");
      const storedCutout = sessionStorage.getItem("ppm_transparent_cutout_url");
      const storedColor = sessionStorage.getItem("ppm_background_color");
      const storedMeta = sessionStorage.getItem("ppm_uploaded_image_meta");
      const storedSpecId = sessionStorage.getItem("ppm_selected_spec_id");
      const storedPersona = sessionStorage.getItem("ppm_selected_persona") as AiPersonaType | null;

      if (storedPersona) {
        setActivePersona(storedPersona);
      }

      if (storedSpecId) {
        const found = OFFICIAL_COUNTRY_SPECS.find((s) => s.id === storedSpecId);
        if (found) setSelectedSpec(found);
      }

      if (storedColor) {
        setBackgroundColor(storedColor);
      }

      if (storedCutout) {
        setTransparentCutoutUrl(storedCutout);
      }

      if (storedSrc) {
        setImageSrc(storedSrc);
        setOriginalImageSrc(storedOrig || storedSrc);
        if (storedMeta) {
          try {
            setImageMetadata(JSON.parse(storedMeta));
          } catch {
            // fallback handled below
          }
        }
        if (!storedMeta) {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => {
            const width = img.naturalWidth || img.width;
            const height = img.naturalHeight || img.height;
            const targetSpec = storedSpecId
              ? OFFICIAL_COUNTRY_SPECS.find((s) => s.id === storedSpecId) || OFFICIAL_COUNTRY_SPECS[0]
              : OFFICIAL_COUNTRY_SPECS[0];
            const { assessment, message } = assessImageDpi(width, height, targetSpec);
            setImageMetadata({
              name: "Uploaded Portrait",
              sizeBytes: 0,
              width,
              height,
              type: "image/jpeg",
              dpiAssessment: assessment,
              warningMessage: message,
            });
          };
          img.src = storedSrc;
        }
      } else {
        const defaultSample = DEMO_SAMPLE_PHOTOS[0];
        setImageSrc(defaultSample.url);
        setOriginalImageSrc(defaultSample.url);
        const { assessment, message } = assessImageDpi(
          defaultSample.width,
          defaultSample.height,
          selectedSpec
        );
        setImageMetadata({
          name: defaultSample.name,
          sizeBytes: defaultSample.sizeBytes,
          width: defaultSample.width,
          height: defaultSample.height,
          type: "image/jpeg",
          dpiAssessment: assessment,
          warningMessage: message,
        });
      }
    } catch {
      // Storage unavailable
    }
  }, []);

  // Whenever image changes, run face detection automatically
  useEffect(() => {
    if (imageSrc) {
      runFaceDetection();
    }
  }, [imageSrc]);

  // Whenever adjustments, spec, or face changes, re-evaluate biometric compliance
  useEffect(() => {
    if (imageMetadata) {
      const primaryFace = faceDetectionState.result?.primaryFace || null;
      const cropDisplayHeight = 440;
      const cropDisplayWidth = Math.round(cropDisplayHeight * (selectedSpec.widthMm / selectedSpec.heightMm));
      const evaluation = evaluateBiometricCompliance(
        primaryFace,
        selectedSpec,
        adjustments,
        imageMetadata.width,
        imageMetadata.height,
        cropDisplayWidth,
        cropDisplayHeight
      );
      setBiometricEvaluation(evaluation);
    }
  }, [adjustments, selectedSpec, faceDetectionState.result, imageMetadata]);

  // Whenever image, cutout, or enhancement settings change, run browser-based portrait enhancement (Phase 7)
  useEffect(() => {
    const activeSource = transparentCutoutUrl || imageSrc;
    if (!activeSource || !enhancementState.settings.enabled) {
      if (enhancementState.enhancedDataUrl) {
        setEnhancementState((prev) => ({ ...prev, enhancedDataUrl: null, isProcessing: false }));
      }
      return;
    }

    let isMounted = true;
    setEnhancementState((prev) => ({ ...prev, isProcessing: true }));

    const timer = setTimeout(async () => {
      try {
        const enhanced = await enhanceImageElement(activeSource, enhancementState.settings);
        if (isMounted) {
          setEnhancementState((prev) => ({
            ...prev,
            enhancedDataUrl: enhanced,
            isProcessing: false,
          }));
        }
      } catch (err) {
        console.warn("Portrait enhancement error:", err);
        if (isMounted) {
          setEnhancementState((prev) => ({ ...prev, isProcessing: false }));
        }
      }
    }, 120);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [imageSrc, transparentCutoutUrl, enhancementState.settings]);

  /**
   * Runs face & landmark detection on the current image
   */
  const runFaceDetection = async (): Promise<FaceDetectionResult | null> => {
    if (!imageSrc) return null;

    setFaceDetectionState((prev) => ({
      ...prev,
      isDetecting: true,
      error: null,
    }));

    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Failed to load image for face detection"));
        img.src = imageSrc;
      });

      const result = await detectFacesInImage(img);

      setFaceDetectionState({
        isDetecting: false,
        hasRun: true,
        result,
        error: null,
      });

      return result;
    } catch (err) {
      console.warn("Face detection error:", err);
      setFaceDetectionState({
        isDetecting: false,
        hasRun: true,
        result: null,
        error: err instanceof Error ? err.message : "Face detection failed",
      });
      return null;
    }
  };

  /**
   * Triggers automatic biometric passport cropping according to official country spec
   */
  const triggerBiometricAutoCrop = () => {
    const face = faceDetectionState.result?.primaryFace;
    if (!face || !imageMetadata) {
      alert("No face detected. Please ensure your photo contains a clear, front-facing face.");
      return;
    }

    const cropDisplayHeight = 440;
    const cropDisplayWidth = Math.round(cropDisplayHeight * (selectedSpec.widthMm / selectedSpec.heightMm));

    const optimal = computeBiometricAutoCrop(
      face,
      selectedSpec,
      imageMetadata.width,
      imageMetadata.height,
      cropDisplayWidth,
      cropDisplayHeight
    );

    setAdjustments(optimal.adjustments);
  };

  const uploadFile = async (file: File): Promise<boolean> => {
    const validation = validateImageFile(file);
    if (!validation.valid) {
      alert(validation.error);
      return false;
    }

    setUploadState({
      isUploading: true,
      progressPercent: 15,
      stageMessage: "Validating file format and size...",
    });

    try {
      await new Promise((r) => setTimeout(r, 120));
      setUploadState((prev) => ({
        ...prev,
        progressPercent: 45,
        stageMessage: "Reading image into browser memory...",
      }));

      const reader = new FileReader();
      const dataUrl = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsDataURL(file);
      });

      setUploadState((prev) => ({
        ...prev,
        progressPercent: 75,
        stageMessage: "Extracting resolution and assessing DPI...",
      }));

      const img = new Image();
      img.src = dataUrl;
      await new Promise<void>((resolve) => {
        img.onload = () => resolve();
      });

      const { assessment, message } = assessImageDpi(img.naturalWidth, img.naturalHeight, selectedSpec);
      const metadata: ImageMetadata = {
        name: file.name,
        sizeBytes: file.size,
        width: img.naturalWidth,
        height: img.naturalHeight,
        type: file.type,
        dpiAssessment: assessment,
        warningMessage: message,
      };

      setUploadState((prev) => ({
        ...prev,
        progressPercent: 100,
        stageMessage: "Image ready for biometric cropping!",
      }));

      setImageSrc(dataUrl);
      setOriginalImageSrc(dataUrl);
      setTransparentCutoutUrl(null);
      setImageMetadata(metadata);
      setAdjustments(DEFAULT_ADJUSTMENTS);
      setHistory([]);

      try {
        if (dataUrl.length < 2_000_000) {
          sessionStorage.setItem("ppm_uploaded_image_src", dataUrl);
          sessionStorage.setItem("ppm_original_image_src", dataUrl);
        }
        sessionStorage.removeItem("ppm_transparent_cutout_url");
        sessionStorage.setItem("ppm_uploaded_image_meta", JSON.stringify(metadata));
      } catch {
        // Safe fallback for quota limits
      }

      setUploadState({ isUploading: false, progressPercent: 0, stageMessage: "" });
      return true;
    } catch (err) {
      console.error("Upload error:", err);
      alert("Failed to process the uploaded photo. Please try another image.");
      setUploadState({ isUploading: false, progressPercent: 0, stageMessage: "" });
      return false;
    }
  };

  /**
   * 1-Click AI Auto-Pilot: Persona-guided end-to-end passport creation
   */
  const runAiAutoPilot = async (personaOverride?: AiPersonaType): Promise<boolean> => {
    const personaToUse = personaOverride || activePersona;
    const currentSrc = originalImageSrc || imageSrc;
    if (!currentSrc) {
      alert("Please upload a photo first.");
      return false;
    }

    setAutoPilotState({
      isRunning: true,
      progressPercent: 10,
      stageMessage: "Starting AI Auto-Pilot pipeline...",
      lastResult: null,
    });

    try {
      const result = await runFullAiAutoPilot(
        currentSrc,
        personaToUse,
        selectedSpec,
        (progress) => {
          setAutoPilotState((prev) => ({
            ...prev,
            progressPercent: progress.progressPercent,
            stageMessage: progress.message,
          }));
        }
      );

      if (result.success) {
        setTransparentCutoutUrl(result.cutoutDataUrl);
        setBackgroundColor("#FFFFFF");
        setAdjustments(result.adjustments);
        setEnhancementState({
          settings: result.enhancementSettings,
          isProcessing: false,
          enhancedDataUrl: null,
          compareMode: false,
        });
        setBiometricEvaluation(result.biometricEvaluation);
        setFaceDetectionState({
          isDetecting: false,
          hasRun: true,
          result: result.faceResult,
          error: null,
        });

        setAutoPilotState({
          isRunning: false,
          progressPercent: 100,
          stageMessage: "100% Compliant Passport Photo Generated!",
          lastResult: result,
        });

        try {
          sessionStorage.setItem("ppm_transparent_cutout_url", result.cutoutDataUrl);
          sessionStorage.setItem("ppm_background_color", "#FFFFFF");
        } catch {
          // Ignore
        }

        return true;
      }
      return false;
    } catch (err: any) {
      console.error("AI Auto-Pilot execution error:", err);
      setAutoPilotState({
        isRunning: false,
        progressPercent: 0,
        stageMessage: err?.message || "AI Auto-Pilot failed. Please retry.",
        lastResult: null,
      });
      return false;
    }
  };

  /**
   * Triggers real AI background removal with hair edge preservation.
   */
  const triggerBackgroundRemoval = async (): Promise<boolean> => {
    if (!originalImageSrc) {
      alert("Please upload a photo first.");
      return false;
    }

    setBgRemovalState({
      isProcessing: true,
      progressPercent: 10,
      stageMessage: "Initiating AI segmentation...",
      error: null,
      providerUsed: "RMBG-1.4 (WebGPU/WASM)",
    });

    try {
      const cutoutDataUrl = await removeBackgroundBrowser(
        originalImageSrc,
        (stage, percent) => {
          setBgRemovalState((prev) => ({
            ...prev,
            progressPercent: percent,
            stageMessage: stage,
          }));
        }
      );

      setTransparentCutoutUrl(cutoutDataUrl);
      try {
        sessionStorage.setItem("ppm_transparent_cutout_url", cutoutDataUrl);
      } catch {
        // Ignore
      }

      // Re-apply enhancement to the new transparent cutout if enhancement is enabled
      if (enhancementState.settings.enabled) {
        enhanceImageElement(cutoutDataUrl, enhancementState.settings)
          .then((enhanced) => {
            setEnhancementState((prev) => ({
              ...prev,
              enhancedDataUrl: enhanced,
              isProcessing: false,
            }));
          })
          .catch(() => {});
      } else {
        setEnhancementState((prev) => ({ ...prev, enhancedDataUrl: null }));
      }

      setBgRemovalState({
        isProcessing: false,
        progressPercent: 100,
        stageMessage: "Background successfully isolated!",
        error: null,
        providerUsed: "RMBG-1.4 (Local)",
      });

      setActiveSidebarTab("background");
      return true;
    } catch (err) {
      console.error("AI background removal failure:", err);
      setBgRemovalState({
        isProcessing: false,
        progressPercent: 0,
        stageMessage: "",
        error: err instanceof Error ? err.message : "Failed to isolate background. Please retry.",
        providerUsed: null,
      });
      return false;
    }
  };

  const restoreOriginalBackground = () => {
    setTransparentCutoutUrl(null);
    try {
      sessionStorage.removeItem("ppm_transparent_cutout_url");
    } catch {
      // Ignore
    }
    const baseSrc = originalImageSrc || imageSrc;
    if (baseSrc && enhancementState.settings.enabled) {
      enhanceImageElement(baseSrc, enhancementState.settings)
        .then((enhanced) => {
          setEnhancementState((prev) => ({ ...prev, enhancedDataUrl: enhanced }));
        })
        .catch(() => {});
    } else {
      setEnhancementState((prev) => ({ ...prev, enhancedDataUrl: null }));
    }
  };

  const handleSetBackgroundColor = (color: string) => {
    setBackgroundColor(color);
    try {
      sessionStorage.setItem("ppm_background_color", color);
    } catch {
      // Ignore
    }
  };

  const replaceImage = () => {
    fileInputRef.current?.click();
  };

  const deleteImage = () => {
    if (confirm("Are you sure you want to delete this photo and clear all edits?")) {
      setImageSrc(null);
      setOriginalImageSrc(null);
      setTransparentCutoutUrl(null);
      setEnhancementState((prev) => ({ ...prev, enhancedDataUrl: null, isProcessing: false }));
      setOutfitState((prev) => ({ ...prev, outputImageUrl: null, previewMode: false }));
      setImageMetadata(null);
      setAdjustments(DEFAULT_ADJUSTMENTS);
      setHistory([]);
      try {
        sessionStorage.removeItem("ppm_uploaded_image_src");
        sessionStorage.removeItem("ppm_original_image_src");
        sessionStorage.removeItem("ppm_transparent_cutout_url");
        sessionStorage.removeItem("ppm_uploaded_image_meta");
      } catch {
        // Ignore
      }
    }
  };

  const loadSamplePhoto = (sampleId: string) => {
    const sample = DEMO_SAMPLE_PHOTOS.find((s) => s.id === sampleId) || DEMO_SAMPLE_PHOTOS[0];
    const { assessment, message } = assessImageDpi(sample.width, sample.height, selectedSpec);
    const meta: ImageMetadata = {
      name: sample.name,
      sizeBytes: sample.sizeBytes,
      width: sample.width,
      height: sample.height,
      type: "image/jpeg",
      dpiAssessment: assessment,
      warningMessage: message,
    };

    setImageSrc(sample.url);
    setOriginalImageSrc(sample.url);
    setTransparentCutoutUrl(null);
    setEnhancementState((prev) => ({ ...prev, enhancedDataUrl: null, isProcessing: false }));
    setOutfitState((prev) => ({ ...prev, outputImageUrl: null, previewMode: false }));
    setImageMetadata(meta);
    setAdjustments(DEFAULT_ADJUSTMENTS);
    setHistory([]);
  };

  const updateAdjustments = (newAdj: Partial<ImageAdjustments>) => {
    setAdjustments((prev) => {
      setHistory((h) => [...h.slice(-15), prev]);
      return { ...prev, ...newAdj };
    });
  };

  const resetAdjustments = () => {
    setAdjustments(DEFAULT_ADJUSTMENTS);
    setHistory([]);
  };

  const undoAdjustments = () => {
    if (history.length === 0) return;
    const last = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    setAdjustments(last);
  };

  const handleSetSelectedSpec = (spec: PassportSpec) => {
    setSelectedSpec(spec);
    try {
      sessionStorage.setItem("ppm_selected_spec_id", spec.id);
    } catch {
      // Ignore
    }
  };

  const applyCustomDimensions = (opts: CustomDimensionOptions) => {
    setCustomDimensions(opts);
    const customSpec = buildCustomPassportSpec(opts);
    setSelectedSpec(customSpec);
  };

  /**
   * Calls the /api/ai/outfit-replace endpoint with the current person image
   * and selected garment URL, then stores the AI output image URL.
   */
  const triggerOutfitReplacement = async (outfit: OutfitTemplate): Promise<boolean> => {
    if (!originalImageSrc) {
      alert("Please upload a photo first before applying an outfit.");
      return false;
    }

    setOutfitState({
      isProcessing: true,
      progressPercent: 5,
      stageMessage: "Preparing image for AI outfit replacement…",
      error: null,
      outputImageUrl: null,
      selectedOutfitId: outfit.id,
      previewMode: false,
      requiresApiKey: false,
    });

    try {
      // Convert originalImageSrc (data URL) → Blob → File for FormData
      const response = await fetch(originalImageSrc);
      const blob = await response.blob();
      const file = new File([blob], "person.jpg", { type: blob.type || "image/jpeg" });

      const formData = new FormData();
      formData.append("personImage", file);
      formData.append("garmentUrl", outfit.garmentImageUrl);
      formData.append("outfitId", outfit.id);
      formData.append("garmentDesc", outfit.description);

      setOutfitState((prev) => ({ ...prev, progressPercent: 15, stageMessage: "Connecting to Replicate AI…" }));

      const apiResponse = await fetch("/api/ai/outfit-replace", {
        method: "POST",
        body: formData,
      });

      const data = await apiResponse.json();

      if (!apiResponse.ok || !data.success) {
        setOutfitState((prev) => ({
          ...prev,
          isProcessing: false,
          progressPercent: 0,
          stageMessage: "",
          error: data.message || "Outfit replacement failed",
          requiresApiKey: data.requiresApiKey || false,
        }));
        return false;
      }

      setOutfitState({
        isProcessing: false,
        progressPercent: 100,
        stageMessage: "Outfit applied successfully!",
        error: null,
        outputImageUrl: data.outputImageUrl,
        selectedOutfitId: outfit.id,
        previewMode: true,
        requiresApiKey: false,
      });

      return true;
    } catch (err) {
      console.error("Outfit replacement error:", err);
      setOutfitState((prev) => ({
        ...prev,
        isProcessing: false,
        progressPercent: 0,
        stageMessage: "",
        error: err instanceof Error ? err.message : "Outfit replacement failed. Please retry.",
        requiresApiKey: false,
      }));
      return false;
    }
  };

  /** Clear the AI outfit result and return to the original image */
  const restoreOriginalOutfit = () => {
    setOutfitState((prev) => ({
      ...prev,
      outputImageUrl: null,
      selectedOutfitId: null,
      previewMode: false,
      error: null,
      progressPercent: 0,
      stageMessage: "",
    }));
  };

  /** Toggle before/after for outfit preview */
  const setOutfitPreviewMode = (preview: boolean) => {
    setOutfitState((prev) => ({ ...prev, previewMode: preview }));
  };

  /** Update portrait enhancement settings (Phase 7) */
  const updateEnhancementSettings = (newSettings: Partial<PortraitEnhancementSettings>) => {
    setEnhancementState((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        ...newSettings,
        preset: newSettings.preset ?? "custom",
      },
    }));
  };

  /** Apply a 1-click curated enhancement preset profile */
  const applyEnhancementPreset = (preset: EnhancementPreset) => {
    const presetOverrides = ENHANCEMENT_PRESETS[preset] || {};
    setEnhancementState((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        ...presetOverrides,
        enabled: true,
        preset,
      },
    }));
  };

  /** Enable or disable portrait enhancement */
  const toggleEnhancement = (enable?: boolean) => {
    setEnhancementState((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        enabled: enable !== undefined ? enable : !prev.settings.enabled,
      },
    }));
  };

  /** Toggle before/after comparison mode for enhancement */
  const toggleEnhancementCompare = (compare?: boolean) => {
    setEnhancementState((prev) => ({
      ...prev,
      compareMode: compare !== undefined ? compare : !prev.compareMode,
    }));
  };

  /** Reset enhancement sliders and disable */
  const resetEnhancement = () => {
    setEnhancementState({
      settings: DEFAULT_ENHANCEMENT_SETTINGS,
      isProcessing: false,
      enhancedDataUrl: null,
      compareMode: false,
    });
  };

  /** Restore a saved project into active editor state (Phase 10) */
  const restoreProject = (project: {
    country: string;
    documentType: string;
    widthMm: number;
    heightMm: number;
    backgroundColor: string;
    originalImageUrl: string;
    cutoutImageUrl?: string | null;
    adjustments: ImageAdjustments;
    enhancementSettings?: PortraitEnhancementSettings | null;
  }) => {
    const spec = OFFICIAL_COUNTRY_SPECS.find(
      (c) => c.country === project.country && c.documentType === project.documentType
    );
    if (spec) {
      setSelectedSpec(spec);
    } else {
      setSelectedSpec({
        id: "restored-spec",
        country: project.country,
        countryCode: project.country.substring(0, 2).toUpperCase(),
        documentType: project.documentType as any,
        widthMm: project.widthMm,
        heightMm: project.heightMm,
        widthPx300Dpi: Math.round((project.widthMm / 25.4) * 300),
        heightPx300Dpi: Math.round((project.heightMm / 25.4) * 300),
        backgroundColor: "white",
        headMinPercentage: 0.50,
        headMaxPercentage: 0.69,
        aspectRatio: `${project.widthMm}:${project.heightMm}`,
        officialSource: "Restored from saved project",
        verifiedDate: new Date().toISOString().substring(0, 7),
        guidelineNotes: "Restored from saved project",
      });
    }

    setImageSrc(project.originalImageUrl);
    setOriginalImageSrc(project.originalImageUrl);
    setTransparentCutoutUrl(project.cutoutImageUrl || null);
    setBackgroundColor(project.backgroundColor || "#FFFFFF");
    if (project.adjustments) {
      setAdjustments(project.adjustments);
    }
    setHistory([]);
  };

  /** Apply generated studio result into active editor state */
  const applyStudioResult = (studioResult: StudioResult) => {
    setImageSrc(studioResult.processedPhotoUrl);
    setOriginalImageSrc(studioResult.originalPhotoUrl);
    setTransparentCutoutUrl(studioResult.transparentSubjectUrl);

    let bgHex = "#FFFFFF";
    if (studioResult.selections.backgroundColor === "off-white") bgHex = "#F8FAFC";
    else if (studioResult.selections.backgroundColor === "light-grey") bgHex = "#E2E8F0";
    else if (studioResult.selections.backgroundColor === "light-blue") bgHex = "#E0F2FE";
    else if (
      studioResult.selections.backgroundColor === "custom" &&
      studioResult.selections.customHexColor
    ) {
      bgHex = studioResult.selections.customHexColor;
    }
    setBackgroundColor(bgHex);
    setAdjustments(DEFAULT_ADJUSTMENTS);

    try {
      sessionStorage.setItem("ppm_uploaded_image_src", studioResult.processedPhotoUrl);
      sessionStorage.setItem("ppm_original_image_src", studioResult.originalPhotoUrl);
      sessionStorage.setItem("ppm_transparent_cutout_url", studioResult.transparentSubjectUrl);
      sessionStorage.setItem("ppm_background_color", bgHex);
      sessionStorage.setItem("ppm_studio_mode", studioResult.mode);
    } catch {
      // Ignore
    }
  };

  return (
    <EditorContext.Provider
      value={{
        imageSrc,
        originalImageSrc,
        transparentCutoutUrl,
        backgroundColor,
        imageMetadata,
        adjustments,
        selectedSpec,
        showGuidelines,
        showBeforeAfter,
        showFaceLandmarks,
        activeSidebarTab,
        uploadState,
        bgRemovalState,
        faceDetectionState,
        biometricEvaluation,
        customDimensions,
        history,
        canUndo: history.length > 0,
        outfitState,
        enhancementState,
        enhancedImageUrl: enhancementState.enhancedDataUrl,
        uploadFile,
        replaceImage,
        deleteImage,
        loadSamplePhoto,
        updateAdjustments,
        resetAdjustments,
        undoAdjustments,
        setSelectedSpec: handleSetSelectedSpec,
        setShowGuidelines,
        setShowBeforeAfter,
        setShowFaceLandmarks,
        setActiveSidebarTab,
        setBackgroundColor: handleSetBackgroundColor,
        triggerBackgroundRemoval,
        restoreOriginalBackground,
        runFaceDetection,
        triggerBiometricAutoCrop,
        setCustomDimensions,
        applyCustomDimensions,
        triggerOutfitReplacement,
        restoreOriginalOutfit,
        setOutfitPreviewMode,
        updateEnhancementSettings,
        applyEnhancementPreset,
        toggleEnhancement,
        toggleEnhancementCompare,
        resetEnhancement,
        isPrintModalOpen,
        setIsPrintModalOpen,
        fileInputRef,
        activePersona,
        setActivePersona,
        autoPilotState,
        runAiAutoPilot,
        restoreProject,
        applyStudioResult,
      }}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/heic,image/heif"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            uploadFile(file);
            e.target.value = "";
          }
        }}
        className="hidden"
      />
      {children}
    </EditorContext.Provider>
  );
}

export function useEditor() {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error("useEditor must be used within an EditorProvider");
  }
  return context;
}
