"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/context/AuthContext";
import { useEditor } from "@/lib/context/EditorContext";
import { PassportProject } from "@/types/project";
import { listUserProjects, deleteProject } from "@/lib/projects/projectService";
import { OFFICIAL_COUNTRY_SPECS } from "@/lib/constants/countries";
import {
  FolderOpen,
  X,
  Trash2,
  ExternalLink,
  Plus,
  Clock,
  Sparkles,
  Search,
  AlertCircle,
  Check,
  Shield,
  Layers,
} from "lucide-react";

interface ProjectsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveCurrentPrompt?: () => void;
}

export function ProjectsModal({ isOpen, onClose, onSaveCurrentPrompt }: ProjectsModalProps) {
  const { user, openAuthModal } = useAuth();
  const { restoreProject, imageSrc } = useEditor();

  const [projects, setProjects] = useState<PassportProject[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const activeUserId = user?.id || "guest_user";

  // Load user projects
  const refreshProjects = async () => {
    setIsLoading(true);
    try {
      const list = await listUserProjects(activeUserId);
      setProjects(list);
    } catch (err) {
      console.error("Failed to load user projects:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      refreshProjects();
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  // Reopen a project into active editor session
  const handleReopenProject = (project: PassportProject) => {
    restoreProject(project);
    setStatusMessage(`Project "${project.title}" reopened!`);
    setTimeout(() => {
      onClose();
    }, 400);
  };

  // Delete project
  const handleDelete = async (projectId: string) => {
    setIsDeleting(true);
    try {
      const res = await deleteProject(activeUserId, projectId);
      if (res.success) {
        setProjects((prev) => prev.filter((p) => p.id !== projectId));
        setDeleteConfirmId(null);
      } else {
        alert(res.error || "Failed to delete project.");
      }
    } catch (err: any) {
      alert(err.message || "Delete failed.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter projects by search query
  const filteredProjects = projects.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.documentType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B0D12]/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#11141B] border border-[#292F3A] rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh] text-[#F5F7FA]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#292F3A] flex items-center justify-between bg-[#11141B]/95 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1C2230] text-[#8B7CFF] border border-[#292F3A] flex items-center justify-center shadow-lg shadow-[#8B7CFF]/15">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#F5F7FA] flex items-center gap-2">
                Project History
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#8B7CFF]/15 text-[#8B7CFF] border border-[#8B7CFF]/30 font-mono">
                  {projects.length} {projects.length === 1 ? "project" : "projects"}
                </span>
              </h2>
              <p className="text-xs text-[#9CA3AF]">
                {user ? `Account: ${user.email}` : "Guest Mode · Saved privately on this browser"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-[#9CA3AF] hover:text-[#F5F7FA] hover:bg-[#1C2230] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {!user && (
            <div className="p-3 bg-[#171B24] border border-[#292F3A] rounded-xl text-xs text-[#9CA3AF] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#8B7CFF] shrink-0" />
                <span>
                  <strong className="text-[#F5F7FA]">Guest Mode:</strong> All your projects are saved locally on this browser. Free forever without an account.
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  openAuthModal("login");
                }}
                className="text-[11px] font-bold text-[#8B7CFF] hover:text-[#7665F5] underline shrink-0 text-left sm:text-right"
              >
                Optional: Sign In for Cloud Sync
              </button>
            </div>
          )}

          {/* User & Guest Projects View */}
          <div className="space-y-4">
            {/* Search & Actions Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-[#697386] absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search saved projects…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#1C2230] border border-[#292F3A] rounded-xl py-2 pl-9 pr-3 text-xs text-[#F5F7FA] placeholder-[#697386] focus:outline-none focus:border-[#8B7CFF]"
                />
              </div>

              {imageSrc && onSaveCurrentPrompt && (
                <button
                  type="button"
                  onClick={() => {
                    onSaveCurrentPrompt();
                    setTimeout(refreshProjects, 500);
                  }}
                  className="w-full sm:w-auto py-2 px-4 rounded-xl font-bold text-xs text-white bg-[#8B7CFF] hover:bg-[#7665F5] transition-colors flex items-center justify-center gap-1.5 shadow-sm shadow-[#8B7CFF]/20"
                >
                  <Plus className="w-4 h-4" />
                  <span>Save Current Studio Photo as Project</span>
                </button>
              )}
            </div>

            {/* Status Banner */}
            {statusMessage && (
              <div className="p-3 bg-[#34D399]/15 border border-[#34D399]/30 rounded-xl text-[#34D399] text-xs flex items-center gap-2">
                <Check className="w-4 h-4 flex-shrink-0" />
                <span>{statusMessage}</span>
              </div>
            )}

            {/* Projects Grid */}
            {isLoading ? (
              <div className="py-16 text-center text-[#697386] text-xs flex flex-col items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-[#8B7CFF] border-t-transparent rounded-full animate-spin" />
                <span>Loading your projects…</span>
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="py-16 text-center text-[#697386] text-xs space-y-2">
                <Layers className="w-8 h-8 mx-auto text-[#292F3A] mb-1" />
                <p className="font-semibold text-[#9CA3AF]">No saved projects found</p>
                <p className="text-[11px] text-[#697386]">
                  {searchQuery ? "Try searching for a different term." : "Save your active passport photo from the editor top bar."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProjects.map((p) => {
                  const isDeletingThis = deleteConfirmId === p.id;
                  return (
                    <div
                      key={p.id}
                      className="p-4 rounded-2xl bg-[#171B24] border border-[#292F3A] hover:border-[#8B7CFF]/40 transition-all flex flex-col justify-between space-y-3 group"
                    >
                      {/* Top: Thumbnail & Spec Badge */}
                      <div className="flex items-start gap-3">
                        <div className="w-16 h-20 rounded-lg overflow-hidden bg-[#0B0D12] border border-[#292F3A] flex-shrink-0 flex items-center justify-center">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={p.thumbnailUrl || p.originalImageUrl}
                            alt={p.title}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-xs text-[#F5F7FA] truncate" title={p.title}>
                            {p.title}
                          </h4>
                          <p className="text-[11px] text-[#9CA3AF] mt-0.5">
                            {p.country} • {p.documentType}
                          </p>
                          <span className="inline-block mt-1 font-mono text-[10px] text-[#8B7CFF] bg-[#8B7CFF]/15 px-1.5 py-0.5 rounded border border-[#8B7CFF]/30">
                            {p.widthMm} × {p.heightMm} mm
                          </span>
                          <div className="flex items-center gap-1 text-[10px] text-[#697386] mt-1.5">
                            <Clock className="w-3 h-3" />
                            <span>{new Date(p.updatedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      {/* Bottom Action Buttons */}
                      <div className="pt-2 border-t border-[#292F3A] flex items-center justify-between gap-2">
                        {isDeletingThis ? (
                          <div className="flex items-center gap-2 w-full">
                            <button
                              type="button"
                              disabled={isDeleting}
                              onClick={() => handleDelete(p.id)}
                              className="flex-1 py-1.5 rounded-lg bg-[#F87171] hover:bg-[#ef4444] text-white font-bold text-[11px] transition-colors"
                            >
                              {isDeleting ? "Deleting…" : "Confirm Delete"}
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmId(null)}
                              className="py-1.5 px-2.5 rounded-lg bg-[#1C2230] text-[#9CA3AF] text-[11px] hover:text-[#F5F7FA]"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => handleReopenProject(p)}
                              className="flex-1 py-1.5 px-3 rounded-xl bg-[#8B7CFF]/15 hover:bg-[#8B7CFF]/25 border border-[#8B7CFF]/30 text-[#8B7CFF] font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span>Reopen</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setDeleteConfirmId(p.id)}
                              className="p-1.5 rounded-xl text-[#697386] hover:text-[#F87171] hover:bg-[#F87171]/10 transition-colors"
                              title="Delete Project"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
