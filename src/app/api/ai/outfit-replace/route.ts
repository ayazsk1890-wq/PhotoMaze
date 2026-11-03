/**
 * POST /api/ai/outfit-replace
 *
 * Accepts a person photo + garment URL and returns an AI try-on result image.
 * Requires REPLICATE_API_TOKEN to be set in .env.local.
 *
 * Request body (FormData):
 *   personImage   File   — uploaded portrait (jpg/png/webp)
 *   garmentUrl    string — public URL of the garment image
 *   outfitId      string — outfit template ID (for logging/analytics)
 *   garmentDesc   string — human-readable garment description
 *
 * Success response:
 *   { success: true, outputImageUrl: string, predictionId: string, costEstimateUsd: number }
 *
 * Error responses:
 *   { success: false, requiresApiKey: true, message: string }   — no API token
 *   { success: false, requiresApiKey: false, message: string }  — AI failure
 */

import { NextRequest, NextResponse } from "next/server";
import { replaceOutfitViaReplicate } from "@/lib/adapters/outfit/replicateIdmVton";

export const runtime = "nodejs";
export const maxDuration = 120; // 2-minute timeout for the Replicate polling

const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

function errorResponse(message: string, status = 400, requiresApiKey = false) {
  return NextResponse.json({ success: false, message, requiresApiKey }, { status });
}

export async function POST(request: NextRequest) {
  // ── 1. Check API key first (fast-fail before processing any file) ──────────
  const apiToken = process.env.REPLICATE_API_TOKEN || "";
  if (!apiToken) {
    return NextResponse.json(
      {
        success: false,
        requiresApiKey: true,
        message:
          "REPLICATE_API_TOKEN is not configured. Add it to .env.local to enable AI outfit replacement. Get your free token at https://replicate.com/account/api-tokens",
      },
      { status: 402 } // 402 Payment Required — signals "needs credentials"
    );
  }

  // ── 2. Parse multipart form data ───────────────────────────────────────────
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return errorResponse("Invalid request: could not parse form data");
  }

  const personImageFile = formData.get("personImage") as File | null;
  const garmentUrl = formData.get("garmentUrl") as string | null;
  const outfitId = formData.get("outfitId") as string | null;
  const garmentDesc = formData.get("garmentDesc") as string | null;

  // ── 3. Validate inputs ─────────────────────────────────────────────────────
  if (!personImageFile || !(personImageFile instanceof File)) {
    return errorResponse("Missing required field: personImage (must be a file)");
  }

  if (!garmentUrl || !garmentUrl.startsWith("http")) {
    return errorResponse("Missing or invalid garmentUrl — must be a public HTTPS URL");
  }

  if (!ALLOWED_TYPES.includes(personImageFile.type)) {
    return errorResponse(`Unsupported image type: ${personImageFile.type}. Allowed: JPG, PNG, WEBP`);
  }

  if (personImageFile.size > MAX_IMAGE_SIZE_BYTES) {
    return errorResponse(
      `Image too large (${(personImageFile.size / 1024 / 1024).toFixed(1)} MB). Maximum is 10 MB.`
    );
  }

  // ── 4. Convert person image to base64 data URL ─────────────────────────────
  let humanImageBase64: string;
  try {
    const buffer = await personImageFile.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    humanImageBase64 = `data:${personImageFile.type};base64,${base64}`;
  } catch {
    return errorResponse("Failed to process uploaded image", 500);
  }

  // ── 5. Call Replicate IDM-VTON ─────────────────────────────────────────────
  console.log(`[outfit-replace] Starting prediction for outfit: ${outfitId || "unknown"}`);

  const result = await replaceOutfitViaReplicate(
    {
      humanImageBase64,
      garmentImageUrl: garmentUrl,
      garmentDescription: garmentDesc || "formal outfit",
    },
    apiToken
    // NOTE: progress callback not used in the API route (client polls separately)
  );

  // ── 6. Return result ───────────────────────────────────────────────────────
  if (!result.success) {
    console.error(`[outfit-replace] Prediction failed:`, result.error);
    return NextResponse.json(
      {
        success: false,
        requiresApiKey: result.requiresApiKey,
        message: result.error,
      },
      { status: result.requiresApiKey ? 402 : 500 }
    );
  }

  console.log(
    `[outfit-replace] Success — prediction ${result.predictionId}, cost ~$${result.costEstimateUsd}`
  );

  return NextResponse.json({
    success: true,
    outputImageUrl: result.outputImageUrl,
    predictionId: result.predictionId,
    costEstimateUsd: result.costEstimateUsd,
    provider: result.provider,
  });
}

