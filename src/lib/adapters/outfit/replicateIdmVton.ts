/**
 * Replicate IDM-VTON Virtual Try-On Adapter (Phase 6)
 *
 * Model: cuuupid/idm-vton — state-of-the-art garment try-on
 * Cost:  ~$0.003 per prediction (as of 2024)
 * Docs:  https://replicate.com/cuuupid/idm-vton
 *
 * IMPORTANT: Set REPLICATE_API_TOKEN in .env.local before using.
 * This file is server-side only (called from the API route).
 */

const REPLICATE_API_BASE = "https://api.replicate.com/v1";

// IDM-VTON model identifier on Replicate
// Using the latest version hash from Replicate's model page
const IDM_VTON_MODEL = "cuuupid/idm-vton";
const IDM_VTON_VERSION = "c871bb9b046607b680449ecbae55fd8c6d945e0a1948644bf2361b3d021d3ff4";

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;
const POLL_INTERVAL_MS = 3000;
const MAX_POLL_DURATION_MS = 120_000; // 2 minutes

export interface IdmVtonInput {
  /** Base64 data URL of the person image (e.g., "data:image/jpeg;base64,...") */
  humanImageBase64: string;
  /** Publicly accessible URL of the garment image */
  garmentImageUrl: string;
  /** Optional description of the garment for better results */
  garmentDescription?: string;
}

export interface IdmVtonResult {
  success: true;
  outputImageUrl: string;
  predictionId: string;
  provider: "replicate-idm-vton";
  costEstimateUsd: number;
}

export interface IdmVtonError {
  success: false;
  requiresApiKey: boolean;
  error: string;
  provider: "replicate-idm-vton";
}

export type IdmVtonResponse = IdmVtonResult | IdmVtonError;

// ─── Progress callback ───────────────────────────────────────────────────────

export type ProgressCallback = (percent: number, message: string) => void;

// ─── Internal helpers ────────────────────────────────────────────────────────

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface ReplicatePrediction {
  id: string;
  status: "starting" | "processing" | "succeeded" | "failed" | "canceled";
  output: string[] | null;
  error: string | null;
  urls: { get: string; cancel: string };
}

async function createPrediction(
  apiToken: string,
  personImageBase64: string,
  garmentImageUrl: string,
  garmentDescription: string
): Promise<ReplicatePrediction> {
  const response = await fetch(`${REPLICATE_API_BASE}/predictions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiToken}`,
    },
    body: JSON.stringify({
      version: IDM_VTON_VERSION,
      input: {
        human_img: personImageBase64,
        garm_img: garmentImageUrl,
        garment_des: garmentDescription || "formal outfit",
        is_checked: true,
        is_checked_crop: false,
        denoise_steps: 30,
        seed: 42,
        category: "upper_body",
      },
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Replicate API error ${response.status}: ${body}`);
  }

  return response.json() as Promise<ReplicatePrediction>;
}

async function pollPrediction(
  apiToken: string,
  predictionId: string,
  onProgress?: ProgressCallback
): Promise<ReplicatePrediction> {
  const deadline = Date.now() + MAX_POLL_DURATION_MS;
  let pollCount = 0;

  while (Date.now() < deadline) {
    await sleep(POLL_INTERVAL_MS);
    pollCount++;

    const response = await fetch(`${REPLICATE_API_BASE}/predictions/${predictionId}`, {
      headers: { Authorization: `Bearer ${apiToken}` },
    });

    if (!response.ok) {
      throw new Error(`Poll error ${response.status}: ${await response.text()}`);
    }

    const prediction = (await response.json()) as ReplicatePrediction;

    if (prediction.status === "succeeded") {
      onProgress?.(95, "Processing complete — finalising output");
      return prediction;
    }

    if (prediction.status === "failed" || prediction.status === "canceled") {
      throw new Error(`Prediction ${prediction.status}: ${prediction.error || "Unknown error"}`);
    }

    // Progress estimation (starting → processing → succeeded)
    const elapsed = Date.now() - (deadline - MAX_POLL_DURATION_MS);
    const rawPercent = Math.min(90, 20 + (elapsed / MAX_POLL_DURATION_MS) * 70);
    const stageMsg =
      prediction.status === "starting"
        ? "Queued — waiting for GPU"
        : `Generating outfit (step ${pollCount})…`;
    onProgress?.(rawPercent, stageMsg);
  }

  throw new Error("Outfit generation timed out after 2 minutes");
}

// ─── Main exported function ──────────────────────────────────────────────────

/**
 * Replaces the outfit in a person image using Replicate's IDM-VTON model.
 *
 * @param input         Person image (base64) + garment URL + description
 * @param apiToken      Replicate API token — MUST be provided by the caller (from env)
 * @param onProgress    Optional progress callback (percent 0-100, message)
 * @returns             Output image URL from Replicate CDN, or error details
 */
export async function replaceOutfitViaReplicate(
  input: IdmVtonInput,
  apiToken: string,
  onProgress?: ProgressCallback
): Promise<IdmVtonResponse> {
  if (!apiToken) {
    return {
      success: false,
      requiresApiKey: true,
      error: "REPLICATE_API_TOKEN is not configured. Add it to .env.local to enable AI outfit replacement.",
      provider: "replicate-idm-vton",
    };
  }

  onProgress?.(5, "Connecting to Replicate AI…");

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      onProgress?.(10, `Creating outfit prediction (attempt ${attempt}/${MAX_RETRIES})…`);

      const prediction = await createPrediction(
        apiToken,
        input.humanImageBase64,
        input.garmentImageUrl,
        input.garmentDescription || "formal outfit"
      );

      onProgress?.(20, "Prediction queued — running AI model…");

      const result = await pollPrediction(apiToken, prediction.id, onProgress);

      const outputUrl =
        Array.isArray(result.output) && result.output.length > 0
          ? result.output[result.output.length - 1]
          : null;

      if (!outputUrl) {
        throw new Error("No output image returned from model");
      }

      onProgress?.(100, "Outfit applied successfully!");

      return {
        success: true,
        outputImageUrl: outputUrl,
        predictionId: prediction.id,
        provider: "replicate-idm-vton",
        costEstimateUsd: 0.003,
      };
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      const isRetryable =
        lastError.message.includes("5") || // 5xx status
        lastError.message.includes("timeout") ||
        lastError.message.includes("Queued");

      if (attempt < MAX_RETRIES && isRetryable) {
        onProgress?.(15, `Retrying (${attempt}/${MAX_RETRIES})…`);
        await sleep(RETRY_DELAY_MS * attempt);
        continue;
      }
      break;
    }
  }

  return {
    success: false,
    requiresApiKey: false,
    error: lastError?.message || "Outfit replacement failed",
    provider: "replicate-idm-vton",
  };
}

