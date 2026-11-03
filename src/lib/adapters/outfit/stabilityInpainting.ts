/**
 * Stability AI Inpainting Adapter — STUB (Phase 6)
 *
 * Future adapter for outfit replacement via Stability AI's Inpainting API.
 * Activate when Stability AI releases a dedicated virtual try-on endpoint.
 *
 * Pricing reference: ~$0.002-0.005 per image (Stability AI SDXL Inpainting)
 * Docs: https://platform.stability.ai/docs/api-reference#tag/Generate
 */

export interface StabilityOutfitInput {
  humanImageBase64: string;
  garmentImageUrl: string;
  garmentDescription?: string;
}

export interface StabilityOutfitResult {
  success: true;
  outputImageUrl: string;
  provider: "stability-ai-inpainting";
}

export interface StabilityOutfitError {
  success: false;
  requiresApiKey: boolean;
  error: string;
  provider: "stability-ai-inpainting";
}

export type StabilityOutfitResponse = StabilityOutfitResult | StabilityOutfitError;

/**
 * Stability AI outfit replacement — NOT YET IMPLEMENTED.
 * Returns a "coming soon" error to preserve the modular adapter interface.
 */
export async function replaceOutfitViaStability(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _input: StabilityOutfitInput,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _apiKey: string
): Promise<StabilityOutfitResponse> {
  return {
    success: false,
    requiresApiKey: true,
    error:
      "Stability AI outfit replacement is not yet implemented. " +
      "Use Replicate IDM-VTON instead (REPLICATE_API_TOKEN).",
    provider: "stability-ai-inpainting",
  };
}

