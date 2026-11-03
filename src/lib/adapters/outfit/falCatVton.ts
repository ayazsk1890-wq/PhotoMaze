/**
 * Fal.ai CatVTON Adapter — STUB (Phase 6)
 *
 * Future adapter for outfit replacement via fal.ai's CatVTON model.
 * CatVTON is a lightweight, high-quality virtual try-on model.
 *
 * Pricing reference: ~$0.001-0.003 per image (fal.ai queue pricing)
 * Model page: https://fal.ai/models/fal-ai/cat-vton
 */

export interface FalCatVtonInput {
  humanImageBase64: string;
  garmentImageUrl: string;
  garmentDescription?: string;
}

export interface FalCatVtonResult {
  success: true;
  outputImageUrl: string;
  provider: "fal-catvton";
}

export interface FalCatVtonError {
  success: false;
  requiresApiKey: boolean;
  error: string;
  provider: "fal-catvton";
}

export type FalCatVtonResponse = FalCatVtonResult | FalCatVtonError;

/**
 * Fal.ai CatVTON outfit replacement — NOT YET IMPLEMENTED.
 * Returns a "coming soon" error to preserve the modular adapter interface.
 */
export async function replaceOutfitViaFalCatVton(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _input: FalCatVtonInput,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _apiKey: string
): Promise<FalCatVtonResponse> {
  return {
    success: false,
    requiresApiKey: true,
    error:
      "Fal.ai CatVTON outfit replacement is not yet implemented. " +
      "Use Replicate IDM-VTON instead (REPLICATE_API_TOKEN).",
    provider: "fal-catvton",
  };
}

