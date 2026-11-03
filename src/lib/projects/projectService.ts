/**
 * Project History & Secure Asset Storage Service (Phase 10)
 *
 * Provides:
 * - Save, reopen, update, and delete passport photo projects
 * - Secure image storage (Supabase Storage bucket 'passport-projects' with user isolation)
 * - Strict access control & account isolation (User B cannot read/write/delete User A's projects)
 * - Transparent offline/demo mode fallback when Supabase is not configured
 */

import { PassportProject, SaveProjectPayload } from "@/types/project";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "../supabase/client";
import { uploadProjectAsset, deleteProjectAssets } from "../supabase/storage";

const LOCAL_PROJECTS_KEY = "ppm_user_projects";

export const GUEST_USER_ID = "guest_user";

// ─── Local Multi-Account Store Helper ────────────────────────────────────────

function getAllStoredProjects(): PassportProject[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_PROJECTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveAllStoredProjects(projects: PassportProject[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(LOCAL_PROJECTS_KEY, JSON.stringify(projects));
}

// ─── Public Project API ──────────────────────────────────────────────────────

/**
 * Saves or updates a passport photo project.
 * Enforces account ownership: project is tied to `userId`.
 */
export async function saveProject(
  userId: string,
  payload: SaveProjectPayload
): Promise<PassportProject> {
  const activeUserId = userId || GUEST_USER_ID;
  const isGuest = activeUserId === GUEST_USER_ID || activeUserId === "guest";

  const now = new Date().toISOString();
  const projectId = payload.id || "proj_" + Math.random().toString(36).substring(2, 11);

  // 1. Live Supabase Storage & PostgreSQL Database (authenticated non-guest)
  if (!isGuest && isSupabaseConfigured()) {
    const supabase = getSupabaseBrowserClient()!;

    // Upload image assets to user's private storage bucket folder: {userId}/{projectId}/*
    const originalImageUrl = await uploadProjectAsset(
      supabase,
      userId,
      projectId,
      "original",
      payload.originalImageSrc
    );

    let cutoutImageUrl: string | null = null;
    if (payload.cutoutImageSrc) {
      cutoutImageUrl = await uploadProjectAsset(
        supabase,
        userId,
        projectId,
        "cutout",
        payload.cutoutImageSrc
      );
    }

    const projectRecord = {
      id: projectId,
      user_id: userId,
      title: payload.title.trim() || `${payload.country} ${payload.documentType} Project`,
      country: payload.country,
      document_type: payload.documentType,
      width_mm: payload.widthMm,
      height_mm: payload.heightMm,
      background_color: payload.backgroundColor,
      original_image_url: originalImageUrl,
      cutout_image_url: cutoutImageUrl,
      thumbnail_url: payload.thumbnailDataUrl || originalImageUrl,
      adjustments: payload.adjustments,
      enhancement_settings: payload.enhancementSettings || null,
      updated_at: now,
    };

    const { data, error } = await supabase
      .from("projects")
      .upsert(projectRecord)
      .select()
      .single();

    if (error) {
      throw new Error(`Database error saving project: ${error.message}`);
    }

    return {
      id: data.id,
      userId: data.user_id,
      title: data.title,
      country: data.country,
      documentType: data.document_type,
      widthMm: Number(data.width_mm),
      heightMm: Number(data.height_mm),
      backgroundColor: data.background_color,
      originalImageUrl: data.original_image_url,
      cutoutImageUrl: data.cutout_image_url,
      thumbnailUrl: data.thumbnail_url,
      adjustments: data.adjustments,
      enhancementSettings: data.enhancement_settings,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  // 2. Demo / Local Multi-Account Store
  const allProjects = getAllStoredProjects();
  const existingIndex = allProjects.findIndex((p) => p.id === projectId);

  if (existingIndex >= 0) {
    // Strict Access Control Check
    if (allProjects[existingIndex].userId !== activeUserId) {
      throw new Error("403 Forbidden: You do not have permission to modify another user's project.");
    }
  }

  const project: PassportProject = {
    id: projectId,
    userId: activeUserId,
    title: payload.title.trim() || `${payload.country} ${payload.documentType} Project`,
    country: payload.country,
    documentType: payload.documentType,
    widthMm: payload.widthMm,
    heightMm: payload.heightMm,
    backgroundColor: payload.backgroundColor,
    originalImageUrl: payload.originalImageSrc,
    cutoutImageUrl: payload.cutoutImageSrc || null,
    thumbnailUrl: payload.thumbnailDataUrl || payload.originalImageSrc,
    adjustments: payload.adjustments,
    enhancementSettings: payload.enhancementSettings || null,
    createdAt: existingIndex >= 0 ? allProjects[existingIndex].createdAt : now,
    updatedAt: now,
  };

  if (existingIndex >= 0) {
    allProjects[existingIndex] = project;
  } else {
    allProjects.unshift(project);
  }

  saveAllStoredProjects(allProjects);
  return project;
}

/**
 * Lists all projects belonging strictly to the specified user.
 * Guarantees account isolation: never returns projects of other users.
 */
export async function listUserProjects(userId: string): Promise<PassportProject[]> {
  const activeUserId = userId || GUEST_USER_ID;
  const isGuest = activeUserId === GUEST_USER_ID || activeUserId === "guest";

  // 1. Live Supabase PostgreSQL (authenticated non-guest)
  if (!isGuest && isSupabaseConfigured()) {
    const supabase = getSupabaseBrowserClient()!;
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("user_id", activeUserId)
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Error fetching user projects:", error);
      return [];
    }

    return (data || []).map((row) => ({
      id: row.id,
      userId: row.user_id,
      title: row.title,
      country: row.country,
      documentType: row.document_type,
      widthMm: Number(row.width_mm),
      heightMm: Number(row.height_mm),
      backgroundColor: row.background_color,
      originalImageUrl: row.original_image_url,
      cutoutImageUrl: row.cutout_image_url,
      thumbnailUrl: row.thumbnail_url,
      adjustments: row.adjustments,
      enhancementSettings: row.enhancement_settings,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  }

  // 2. Demo / Local Store: Filter strictly by activeUserId
  const allProjects = getAllStoredProjects();
  return allProjects
    .filter((p) => p.userId === activeUserId)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

/**
 * Retrieves a single project by ID with strict access control.
 * Throws 403 Forbidden if the project belongs to a different user.
 */
export async function getProjectById(
  userId: string,
  projectId: string
): Promise<PassportProject | null> {
  const activeUserId = userId || GUEST_USER_ID;
  const isGuest = activeUserId === GUEST_USER_ID || activeUserId === "guest";
  if (!projectId) return null;

  // 1. Live Supabase PostgreSQL (authenticated non-guest)
  if (!isGuest && isSupabaseConfigured()) {
    const supabase = getSupabaseBrowserClient()!;
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .eq("user_id", activeUserId) // Enforce user ownership in query (matched by RLS)
      .maybeSingle();

    if (error || !data) return null;

    return {
      id: data.id,
      userId: data.user_id,
      title: data.title,
      country: data.country,
      documentType: data.document_type,
      widthMm: Number(data.width_mm),
      heightMm: Number(data.height_mm),
      backgroundColor: data.background_color,
      originalImageUrl: data.original_image_url,
      cutoutImageUrl: data.cutout_image_url,
      thumbnailUrl: data.thumbnail_url,
      adjustments: data.adjustments,
      enhancementSettings: data.enhancement_settings,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  // 2. Demo Store
  const all = getAllStoredProjects();
  const found = all.find((p) => p.id === projectId);

  if (!found) return null;

  // Strict Account Isolation
  if (found.userId !== activeUserId) {
    throw new Error("403 Forbidden: Access denied. This project belongs to another account.");
  }

  return found;
}

/**
 * Deletes a project by ID with strict access control.
 * Throws 403 Forbidden if a user attempts to delete another user's project.
 */
export async function deleteProject(
  userId: string,
  projectId: string
): Promise<{ success: boolean; error?: string }> {
  const activeUserId = userId || GUEST_USER_ID;
  const isGuest = activeUserId === GUEST_USER_ID || activeUserId === "guest";
  if (!projectId) {
    return { success: false, error: "Project ID required to delete." };
  }

  // 1. Live Supabase PostgreSQL & Storage (authenticated non-guest)
  if (!isGuest && isSupabaseConfigured()) {
    const supabase = getSupabaseBrowserClient()!;

    // Clean up storage assets first
    await deleteProjectAssets(supabase, activeUserId, projectId);

    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", projectId)
      .eq("user_id", activeUserId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  }

  // 2. Demo Store
  const all = getAllStoredProjects();
  const existing = all.find((p) => p.id === projectId);

  if (!existing) {
    return { success: false, error: "Project not found" };
  }

  // Strict Account Isolation Check
  if (existing.userId !== activeUserId) {
    throw new Error("403 Forbidden: Access denied. Cannot delete another user's project.");
  }

  const filtered = all.filter((p) => p.id !== projectId);
  saveAllStoredProjects(filtered);
  return { success: true };
}

