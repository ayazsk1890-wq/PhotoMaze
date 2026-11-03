/**
 * Spectacles Guidance & Removal Advisor
 *
 * Provides official passport authority compliance advice regarding eyewear
 * (ICAO Doc 9303, US State Dept, MEA India) and safety warnings for
 * generative AI spectacles removal.
 */

import { SpectaclesPreference, SpectaclesAction, StudioWorkflowMode } from "@/types/studio";

export interface SpectaclesAdvisory {
  hasSpectacles: boolean;
  officialCompliant: boolean;
  recommendation: "keep" | "remove" | "retake" | "none";
  headline: string;
  warningNotice: string;
  allowAiRemoval: boolean;
  badgeType: "success" | "warning" | "danger" | "info";
}

export const AI_SPECTACLES_REMOVAL_WARNING =
  "⚠️ AI spectacles removal reconstructs pixels around the eyes and nose bridge. It is NOT guaranteed to be a 100% biometric identity match. For official government passports or visa applications, passport authorities (such as MEA India, US Department of State, or UK HMPO) routinely reject AI-reconstructed eyes. If your eyes are obscured, glare is present, or lenses are tinted, we strongly recommend taking a new photograph without glasses.";

export function evaluateSpectaclesAdvisory(
  preference: SpectaclesPreference,
  mode: StudioWorkflowMode
): SpectaclesAdvisory {
  switch (preference) {
    case "none":
      return {
        hasSpectacles: false,
        officialCompliant: true,
        recommendation: "none",
        headline: "No Eyewear",
        warningNotice: "Optimal for passport compliance. Both eyes are unobscured.",
        allowAiRemoval: false,
        badgeType: "success",
      };

    case "clear":
      return {
        hasSpectacles: true,
        officialCompliant: mode === "official",
        recommendation: "keep",
        headline: "Clear Prescription Glasses",
        warningNotice:
          mode === "official"
            ? "Prescription glasses are accepted by many authorities if the frames do not obscure the eyes and there is no flash reflection on the lenses. However, taking a photo without glasses guarantees highest acceptance."
            : AI_SPECTACLES_REMOVAL_WARNING,
        allowAiRemoval: mode === "appearance",
        badgeType: "warning",
      };

    case "tinted":
      return {
        hasSpectacles: true,
        officialCompliant: false,
        recommendation: "retake",
        headline: "Tinted or Dark Glasses Detected",
        warningNotice:
          "Tinted glasses and sunglasses are STRICTLY PROHIBITED in official passport photos under ICAO Doc 9303 regulations. You must take a new photo without sunglasses or tinted lenses for government documents.",
        allowAiRemoval: mode === "appearance",
        badgeType: "danger",
      };

    case "unsure":
    default:
      return {
        hasSpectacles: true,
        officialCompliant: false,
        recommendation: "keep",
        headline: "Eyewear Verification Needed",
        warningNotice:
          "If you are wearing glasses with thick frames or glare, government passport offices may reject the photo. When in doubt, a photo taken without glasses is always recommended.",
        allowAiRemoval: mode === "appearance",
        badgeType: "info",
      };
  }
}
