/**
 * Supabase Storage Service for Project Image Assets (Phase 10)
 */

import { SupabaseClient } from "@supabase/supabase-js";

const BUCKET_NAME = "passport-projects";

/**
 * Converts a base64 Data URL or remote URL to a binary Blob.
 */
export async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  if (dataUrl.startsWith("http://") || dataUrl.startsWith("https://")) {
    const res = await fetch(dataUrl);
    return res.blob();
  }

  const commaIdx = dataUrl.indexOf(",");
  const header = commaIdx >= 0 ? dataUrl.slice(0, commaIdx) : "";
  const base64 = commaIdx >= 0 ? dataUrl.slice(commaIdx + 1) : dataUrl;
  const mimeMatch = header.match(/data:([^;]+)/);
  const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";

  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return new Blob([bytes], { type: mimeType });
}

/**
 * Uploads an image asset to the user's private storage folder:
 * Path: `{userId}/{projectId}/{assetName}`
 */
export async function uploadProjectAsset(
  supabase: SupabaseClient,
  userId: string,
  projectId: string,
  assetName: string,
  imageSrc: string
): Promise<string> {
  const blob = await dataUrlToBlob(imageSrc);
  const ext = blob.type === "image/png" ? "png" : "jpg";
  const filePath = `${userId}/${projectId}/${assetName}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, blob, {
      contentType: blob.type,
      upsert: true,
    });

  if (uploadError) {
    throw new Error(`Failed to upload project asset: ${uploadError.message}`);
  }

  // Generate a signed URL valid for 7 days (604,800 seconds)
  const { data: signedData, error: signError } = await supabase.storage
    .from(BUCKET_NAME)
    .createSignedUrl(filePath, 604800);

  if (signError || !signedData?.signedUrl) {
    // Fallback to getPublicUrl if bucket is made public
    const { data: publicData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);
    return publicData.publicUrl;
  }

  return signedData.signedUrl;
}

/**
 * Deletes all image assets stored for a project.
 */
export async function deleteProjectAssets(
  supabase: SupabaseClient,
  userId: string,
  projectId: string
): Promise<void> {
  try {
    const prefix = `${userId}/${projectId}`;
    const { data: fileList } = await supabase.storage.from(BUCKET_NAME).list(prefix);

    if (fileList && fileList.length > 0) {
      const filesToDelete = fileList.map((f) => `${prefix}/${f.name}`);
      await supabase.storage.from(BUCKET_NAME).remove(filesToDelete);
    }
  } catch (err) {
    console.warn("Storage asset cleanup error (non-fatal):", err);
  }
}

