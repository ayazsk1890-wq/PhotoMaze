"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { EditorProvider, useEditor } from "@/lib/context/EditorContext";
import { useAuth } from "@/lib/context/AuthContext";
import { EditorCanvas } from "@/components/editor/EditorCanvas";
import { EditorSidebar } from "@/components/editor/EditorSidebar";
import { DEMO_SAMPLE_PHOTOS } from "@/lib/image/clientValidation";
import {
  ArrowLeft,
  Camera,
  Download,
  RotateCcw,
  Upload,
  Trash2,
  Printer,
  FolderOpen,
  Bookmark,
  Check,
  User,
  Shield,
} from "lucide-react";
import nextDynamic from "next/dynamic";
import { EditorOutputPanel } from "@/components/editor/EditorOutputPanel";

const PrintSheetModal = nextDynamic(
  () => import("@/components/print/PrintSheetModal").then((mod) => mod.PrintSheetModal),
  { ssr: false }
);
const SinglePhotoExportModal = nextDynamic(
  () => import("@/components/export/SinglePhotoExportModal").then((mod) => mod.SinglePhotoExportModal),
  { ssr: false }
);
const ProjectsModal = nextDynamic(
  () => import("@/components/projects/ProjectsModal").then((mod) => mod.ProjectsModal),
  { ssr: false }
);
const AuthModal = nextDynamic(
  () => import("@/components/auth/AuthModal").then((mod) => mod.AuthModal),
  { ssr: false }
);
import { saveProject } from "@/lib/projects/projectService";

function EditorWorkspace() {
  const [isSingleExportOpen, setIsSingleExportOpen] = useState(false);
  const [isProjectsModalOpen, setIsProjectsModalOpen] = useState(false);
  const [isSavingProject, setIsSavingProject] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  const { user, openAuthModal, isSupabaseConfigured } = useAuth();

  const {
    selectedSpec,
    imageSrc,
    originalImageSrc,
    transparentCutoutUrl,
    backgroundColor,
    adjustments,
    enhancementState,
    loadSamplePhoto,
    replaceImage,
    deleteImage,
    resetAdjustments,
    isPrintModalOpen,
    setIsPrintModalOpen,
  } = useEditor();

  const handleSaveProject = async () => {
    const srcToSave = originalImageSrc || imageSrc;
    if (!srcToSave) return;

    const activeUserId = user?.id || "guest_user";

    setIsSavingProject(true);
    setSaveSuccessMessage(null);

    try {
      await saveProject(activeUserId, {
        title: `${selectedSpec.country} ${selectedSpec.documentType}`,
        country: selectedSpec.country,
        documentType: selectedSpec.documentType,
        widthMm: selectedSpec.widthMm,
        heightMm: selectedSpec.heightMm,
        backgroundColor: transparentCutoutUrl ? backgroundColor : "#FFFFFF",
        originalImageSrc: srcToSave,
        cutoutImageSrc: transparentCutoutUrl || null,
        adjustments,
        enhancementSettings: enhancementState?.settings || null,
      });

      setSaveSuccessMessage(user ? "Project saved!" : "Project saved locally!");
      setTimeout(() => setSaveSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error("Save project error:", err);
      alert(err.message || "Failed to save project.");
    } finally {
      setIsSavingProject(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0D12] text-[#F5F7FA] flex flex-col selection:bg-[#8B7CFF] selection:text-white">
      {/* Top Studio Header */}
      <header className="h-16 bg-[#11141B] border-b border-[#292F3A] px-4 sm:px-6 flex items-center justify-between text-[#F5F7FA] z-30 flex-shrink-0">
        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-semibold text-[#9CA3AF] hover:text-[#F5F7FA] bg-[#171B24] hover:bg-[#1C2230] border border-[#292F3A] px-3 py-1.5 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Home</span>
          </Link>

          <div className="h-5 w-px bg-[#292F3A] hidden sm:block" />

          <div className="flex items-center gap-2.5">
            <div className="relative w-8 h-8 rounded-lg overflow-hidden shadow-md border border-[#292F3A] bg-[#171B24]">
              <Image
                src="/logo.svg"
                alt="PhotoMaze"
                width={32}
                height={32}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="font-bold text-sm sm:text-base leading-tight text-[#F5F7FA]">
                {selectedSpec.country} {selectedSpec.documentType} Studio
              </h1>
              <span className="text-[11px] text-[#697386] font-mono hidden sm:inline-block">
                {selectedSpec.widthMm} × {selectedSpec.heightMm} mm ({selectedSpec.widthPx300Dpi} ×{" "}
                {selectedSpec.heightPx300Dpi} px @ 300 DPI)
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls, Projects & User Profile */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Quick Header Edit Actions */}
          {imageSrc && (
            <div className="hidden xl:flex items-center gap-1 bg-[#171B24] p-1 rounded-xl border border-[#292F3A]">
              <button
                type="button"
                onClick={replaceImage}
                className="px-2.5 py-1 rounded-lg text-xs font-medium text-[#9CA3AF] hover:text-[#F5F7FA] hover:bg-[#1C2230] transition-colors flex items-center gap-1"
                title="Replace with new photo"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Replace</span>
              </button>
              <button
                type="button"
                onClick={resetAdjustments}
                className="px-2.5 py-1 rounded-lg text-xs font-medium text-[#9CA3AF] hover:text-[#F5F7FA] hover:bg-[#1C2230] transition-colors flex items-center gap-1"
                title="Reset adjustments"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
              <button
                type="button"
                onClick={deleteImage}
                className="px-2.5 py-1 rounded-lg text-xs font-medium text-[#F87171] hover:text-[#F87171]/80 hover:bg-[#F87171]/10 transition-colors flex items-center gap-1"
                title="Delete photo"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          )}

          {/* Test Portrait Switcher */}
          <div className="hidden 2xl:flex items-center gap-1.5 bg-[#171B24] px-2.5 py-1 rounded-xl border border-[#292F3A] text-xs">
            <span className="text-[#697386]">Sample:</span>
            {DEMO_SAMPLE_PHOTOS.map((sample) => (
              <button
                key={sample.id}
                type="button"
                onClick={() => loadSamplePhoto(sample.id)}
                className="px-2 py-0.5 rounded text-[11px] font-medium text-[#9CA3AF] hover:text-[#F5F7FA] hover:bg-[#1C2230] transition-colors"
              >
                {sample.id === "man"
                  ? "Male"
                  : sample.id === "woman"
                  ? "Female"
                  : sample.id === "hijab"
                  ? "Hijab"
                  : "Child"}
              </button>
            ))}
          </div>

          {/* Project History & Save Actions */}
          <button
            type="button"
            onClick={() => setIsProjectsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold text-[#9CA3AF] hover:text-[#F5F7FA] bg-[#171B24] hover:bg-[#1C2230] border border-[#292F3A] shadow-sm active:scale-95 transition-all"
            title="Open saved projects history"
          >
            <FolderOpen className="w-4 h-4 text-amber-400" />
            <span className="hidden md:inline">Projects</span>
          </button>

          {imageSrc && (
            <button
              type="button"
              onClick={handleSaveProject}
              disabled={isSavingProject}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all border ${
                saveSuccessMessage
                  ? "bg-[#34D399]/20 border-[#34D399] text-[#34D399]"
                  : "bg-[#171B24] hover:bg-[#1C2230] border-[#292F3A] text-[#9CA3AF] hover:text-[#F5F7FA]"
              }`}
              title="Save current project to account"
            >
              {saveSuccessMessage ? (
                <>
                  <Check className="w-4 h-4 text-[#34D399]" />
                  <span className="hidden sm:inline">Saved!</span>
                </>
              ) : isSavingProject ? (
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Bookmark className="w-4 h-4 text-[#8B7CFF]" />
                  <span className="hidden sm:inline">Save</span>
                </>
              )}
            </button>
          )}

          {/* Print Sheet & Export Buttons (Mobile / Tablet Header Fallback) */}
          {imageSrc && (
            <div className="flex xl:hidden items-center gap-1.5">
              <button
                type="button"
                onClick={() => setIsPrintModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold text-[#F5F7FA] bg-[#171B24] hover:bg-[#1C2230] border border-[#292F3A] shadow-sm active:scale-95 transition-all"
                title="Generate Multi-Photo Print Sheet (A4, 4x6, PDF)"
              >
                <Printer className="w-4 h-4 text-[#8B7CFF]" />
                <span className="hidden sm:inline">Print Sheet</span>
                <span className="sm:hidden">Print</span>
              </button>

              <button
                type="button"
                onClick={() => setIsSingleExportOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#8B7CFF] hover:bg-[#7665F5] shadow-md shadow-[#8B7CFF]/20 active:scale-95 transition-all"
                title="Export High-Res JPEG, Portal-Ready File, PNG Cutout, or PDF"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export</span>
              </button>
            </div>
          )}

          {/* User Account Button */}
          <div className="h-5 w-px bg-[#292F3A]" />
          {user ? (
            <button
              type="button"
              onClick={() => openAuthModal("profile")}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-[#171B24] hover:bg-[#1C2230] border border-[#292F3A] text-xs text-[#F5F7FA] transition-all"
              title={`Signed in as ${user.email}`}
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#8B7CFF] to-violet-600 flex items-center justify-center font-bold text-[11px] text-white">
                {user.fullName ? user.fullName[0].toUpperCase() : user.email[0].toUpperCase()}
              </div>
              <span className="hidden lg:inline text-[#9CA3AF] font-medium truncate max-w-[100px]">
                {user.fullName || user.email.split("@")[0]}
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => openAuthModal("login")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#8B7CFF]/20 hover:bg-[#8B7CFF]/30 border border-[#8B7CFF]/40 text-xs font-semibold text-[#8B7CFF] hover:text-[#7665F5] transition-all"
            >
              <User className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Studio Viewport (3-Panel Desktop Architecture) */}
      <div className="flex-1 flex flex-col xl:flex-row overflow-hidden relative bg-[#0B0D12]">
        {/* Left Control Sidebar */}
        <div className="w-full xl:w-80 order-2 xl:order-1 h-auto xl:h-full overflow-hidden flex-shrink-0 border-r border-[#292F3A]">
          <EditorSidebar />
        </div>

        {/* Center Canvas */}
        <main className="flex-1 order-1 xl:order-2 h-[55vh] sm:h-[60vh] xl:h-full overflow-hidden relative bg-[#0B0D12]">
          <EditorCanvas />
        </main>

        {/* Right Output & Standards Panel (Desktop) */}
        <div className="hidden xl:flex order-3 h-full flex-shrink-0">
          <EditorOutputPanel
            onOpenSingleExport={() => setIsSingleExportOpen(true)}
            onOpenPrintSheet={() => setIsPrintModalOpen(true)}
            onOpenProjects={() => setIsProjectsModalOpen(true)}
            onSaveProject={handleSaveProject}
            isSavingProject={isSavingProject}
            saveSuccessMessage={saveSuccessMessage}
          />
        </div>
      </div>

      {/* Phase 9 Single Photo Export Modal */}
      <SinglePhotoExportModal
        isOpen={isSingleExportOpen}
        onClose={() => setIsSingleExportOpen(false)}
      />

      {/* Phase 8 Custom Print Sheet & Bulk Printing Modal */}
      <PrintSheetModal isOpen={isPrintModalOpen} onClose={() => setIsPrintModalOpen(false)} />

      {/* Phase 10 Project History Modal */}
      <ProjectsModal
        isOpen={isProjectsModalOpen}
        onClose={() => setIsProjectsModalOpen(false)}
        onSaveCurrentPrompt={handleSaveProject}
      />

      {/* Phase 10 Authentication Modal */}
      <AuthModal />
    </div>
  );
}

export const dynamic = "force-dynamic";

export default function EditorPage() {
  return (
    <EditorProvider>
      <EditorWorkspace />
    </EditorProvider>
  );
}
