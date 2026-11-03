/**
 * Replicate CodeFormer / GFPGAN Portrait Enhancement Adapter (Phase 7 Optional)
 *
 * Model: sczhou/codeformer — robust face restoration & enhancement
 * Cost: ~$0.005 per prediction
 * Docs: https://replicate.com/sczhou/codeformer
 *
 * NOTE: The default engine runs 100% locally in the browser with zero cost.
 * This adapter is available if the user explicitly configures cloud AI enhancement.
 */

export interface CodeFormerInput {
  imageBase64: string;
  fidelity: number; // 0 to 1 (0.7 preserves original facial identity strictly)
  upscale: number; // 1 or 2
  faceUpsample: boolean;
  backgroundEnhance: boolean;
}

export interface CodeFormerResult {
  success: true;
  outputImageUrl: string;
  predictionId: string;
  provider: "replicate-codeformer";
  costEstimateUsd: number;
}

export interface CodeFormerError {
  success: false;
  requiresApiKey: boolean;
  error: string;
  provider: "replicate-codeformer";
}

export type CodeFormerResponse = CodeFormerResult | CodeFormerError;

export async function enhanceViaCodeFormer(
  input: CodeFormerInput,
  apiToken: string
): Promise<CodeFormerResponse> {
  if (!apiToken) {
    return {
      success: false,
      requiresApiKey: true,
      error: "REPLICATE_API_TOKEN is not configured. Using client-side zero-cost enhancement engine.",
      provider: "replicate-codeformer",
    };
  }

  try {
    const response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiToken}`,
      },
      body: JSON.stringify({
        version: "7de2ea26c616d5bf2245ad0d5e24f0ff9a6204578a5c876db53142edd9d2cd56",
        input: {
          image: input.imageBase64,
          codeformer_fidelity: input.fidelity ?? 0.7,
          upscale: input.upscale ?? 2,
          face_upsample: input.faceUpsample ?? true,
          background_enhance: input.backgroundEnhance ?? false,
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return {
        success: false,
        requiresApiKey: response.status === 401 || response.status === 402,
        error: `CodeFormer error ${response.status}: ${errText}`,
        provider: "replicate-codeformer",
      };
    }

    const prediction = await response.json();

    return {
      success: true,
      outputImageUrl: prediction.output,
      predictionId: prediction.id,
      provider: "replicate-codeformer",
      costEstimateUsd: 0.005,
    };
  } catch (err) {
    return {
      success: false,
      requiresApiKey: false,
      error: err instanceof Error ? err.message : "Cloud enhancement request failed",
      provider: "replicate-codeformer",
    };
  }
}

