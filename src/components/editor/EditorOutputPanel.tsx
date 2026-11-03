"use client";

import React, { useState } from "react";
import { useEditor } from "@/lib/context/EditorContext";
import { useAuth } from "@/lib/context/AuthContext";
import {
  Download,
  Printer,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FolderOpen,
  Bookmark,
  Check,
  ExternalLink,
  Layers,
  Sparkles,
} from "lucide-react";
import { exportCroppedCanvas } from "@/lib/image/canvasRenderer";

interface EditorOutputPanelProps {
  onOpenSingleExport: () => void;
  onOpenPrintSheet: () => void;
  onOpenProjects: () => void;
  onSaveProject: () => void;
  isSavingProject: boolean;
  saveSuccessMessage: string | null;
}

export function EditorOutputPanel({
  onOpenSingleExport,
  onOpenPrintSheet,
  onOpenProjects,
  onSaveProject,
  isSavingProject,
  saveSuccessMessage,
}: EditorOutputPanelProps) {
  const {
    imageSrc,
    originalImageSrc,
    transparentCutoutUrl,
    backgroundColor,
    selectedSpec,
    adjustments,
    biometricEvaluation,
    faceDetectionState,
    enhancementState,
    activePersona,
  } = useEditor();

  const handleQuickDownload = () => {
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
      link.download = `photomaze-${selectedSpec.country.toLowerCase().replace(/\s+/g, "-")}-${selectedSpec.documentType.toLowerCase()}-300dpi.${ext}`;
      link.href = dataUrl;
      link.click();
    };
    img.src = srcToExport;
  };

  const isCompliant = biometricEvaluation?.isFullyCompliant;
  const score = biometricEvaluation?.score ?? (imageSrc ? 90 : 0);

  return (
    <aside className="w-full xl:w-72 bg-[#11141B] border-l border-[#292F3A] flex flex-col justify-between p-4 flex-shrink-0 overflow-y-auto">
      <div>
        {/* Panel Title */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#292F3A]">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#9CA3AF]">
            Output & Standards
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#171B24] text-[#34D399] border border-[#292F3A]">
            300 DPI
          </span>
        </div>

        {/* Selected Document Specification Card */}
        <div className="rounded-xl bg-[#171B24] border border-[#292F3A] p-3.5 mb-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#F5F7FA]">
              {selectedSpec.country}
            </span>
            <span className="text-[10px] text-[#8B7CFF] font-medium bg-[#1C2230] px-1.5 py-0.5 rounded border border-[#292F3A]">
              {selectedSpec.documentType}
            </span>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between py-1 border-b border-[#292F3A]/60">
              <span className="text-[#697386]">Physical Size</span>
              <span className="font-mono text-[#F5F7FA]">
                {selectedSpec.widthMm} × {selectedSpec.heightMm} mm
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#292F3A]/60">
              <span className="text-[#697386]">Pixel Density</span>
              <span className="font-mono text-[#F5F7FA]">
                {selectedSpec.widthPx300Dpi} × {selectedSpec.heightPx300Dpi} px
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#292F3A]/60">
              <span className="text-[#697386]">Aspect Ratio</span>
              <span className="font-mono text-[#F5F7FA]">{selectedSpec.aspectRatio}</span>
            </div>
            <div className="flex justify-between py-1 items-center">
              <span className="text-[#697386]">Background</span>
              <div className="flex items-center gap-1.5">
                <span
                  className="w-3 h-3 rounded-full border border-[#292F3A]"
                  style={{ backgroundColor: transparentCutoutUrl ? backgroundColor : "#FFFFFF" }}
                />
                <span className="capitalize text-xs text-[#9CA3AF]">
                  {transparentCutoutUrl ? backgroundColor : "White"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Biometric Compliance Meter */}
        <div className="rounded-xl bg-[#171B24] border border-[#292F3A] p-3.5 mb-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#F5F7FA] flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#34D399]" />
              <span>Biometric Audit</span>
            </span>
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                isCompliant
                  ? "bg-[#34D399]/20 text-[#34D399] border border-[#34D399]/30"
                  : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
              }`}
            >
              {score}/100 {isCompliant ? "Passed" : "Advisory"}
            </span>
          </div>

          {/* Compliance checks */}
          <div className="space-y-1.5 text-[11px] mt-3">
            {biometricEvaluation?.checks ? (
              biometricEvaluation.checks.map((c) => (
                <div key={c.id} className="flex items-center justify-between">
                  <span className="text-[#9CA3AF] truncate max-w-[150px]">{c.title}</span>
                  <span
                    className={`font-medium ${
                      c.status === "pass"
                        ? "text-[#34D399]"
                        : c.status === "warning"
                        ? "text-amber-400"
                        : "text-[#F87171]"
                    }`}
                  >
                    {c.status.toUpperCase()}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-[#697386] text-center py-2 text-xs">
                Upload photo to run ICAO biometric scan
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Primary Export & Download Actions */}
      <div className="space-y-2 pt-3 border-t border-[#292F3A]">
        {imageSrc ? (
          <>
            <button
              type="button"
              onClick={handleQuickDownload}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-[#8B7CFF] hover:bg-[#7665F5] transition-colors shadow-md shadow-[#8B7CFF]/20 active:scale-[0.98]"
            >
              <Download className="w-4 h-4" />
              <span>Download 300 DPI Photo</span>
            </button>

            <button
              type="button"
              onClick={onOpenPrintSheet}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-[#F5F7FA] bg-[#171B24] hover:bg-[#1C2230] border border-[#292F3A] transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-[#8B7CFF]" />
              <span>Print Sheet (4×6 / A4)</span>
            </button>

            <button
              type="button"
              onClick={onOpenSingleExport}
              className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#9CA3AF] hover:text-[#F5F7FA] hover:bg-[#171B24] transition-colors"
            >
              <span>More Export Formats & PDF</span>
            </button>
          </>
        ) : (
          <div className="text-center py-3 text-xs text-[#697386]">
            Upload or choose a sample to export
          </div>
        )}

        {/* Project History & Save */}
        <div className="flex items-center gap-2 pt-2 border-t border-[#292F3A]/60">
          <button
            type="button"
            onClick={onOpenProjects}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#171B24] hover:bg-[#1C2230] border border-[#292F3A] text-xs text-[#9CA3AF] hover:text-[#F5F7FA] transition-colors"
          >
            <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>Projects</span>
          </button>

          {imageSrc && (
            <button
              type="button"
              onClick={onSaveProject}
              disabled={isSavingProject}
              className={`flex-1 inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs transition-colors ${
                saveSuccessMessage
                  ? "bg-[#34D399]/20 border-[#34D399] text-[#34D399]"
                  : "bg-[#171B24] hover:bg-[#1C2230] border-[#292F3A] text-[#9CA3AF] hover:text-[#F5F7FA]"
              }`}
            >
              {saveSuccessMessage ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#34D399]" />
                  <span>Saved!</span>
                </>
              ) : isSavingProject ? (
                <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Bookmark className="w-3.5 h-3.5 text-[#8B7CFF]" />
                  <span>Save</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
