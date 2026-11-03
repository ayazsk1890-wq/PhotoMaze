/**
 * Built-in Category Prompt Templates Engine
 *
 * Implements strict, ethically grounded inpainting and style generation
 * prompts for Passport Photo Studio.
 *
 * When paired with local or client-side neural inpainting, the mask is
 * strictly restricted to garments below the neck or head-covering drape,
 * preventing any generative hallucination of facial features.
 */

import {
  PersonCategory,
  ClothingPresentationPreference,
  HeadCoveringPreference,
  ClothingChangeSelection,
} from "@/types/studio";

export interface PromptTemplateDefinition {
  id: string;
  category: string;
  positivePrompt: string;
  negativePrompt: string;
  guidanceNotes: string;
}

export const OFFICIAL_STUDIO_PROMPTS: Record<string, PromptTemplateDefinition> = {
  // 1. Adult Masculine Formal
  "adult-masculine-formal": {
    id: "adult-masculine-formal",
    category: "Adult masculine formal",
    positivePrompt:
      "Professional dark formal tailored suit, crisp white collared shirt, conservative tie, clean studio lighting, symmetrical collar, high resolution fabric texture",
    negativePrompt:
      "casual clothing, t-shirt, logos, distorted shoulders, uneven collar, blur, artifacts, cleavage, low neckline, bright flashy colours, deformed lapels",
    guidanceNotes:
      "Mask restricted strictly below collarbone and neck line. Symmetrical tailored suit lapels.",
  },

  // 2. Adult Feminine Formal
  "adult-feminine-formal": {
    id: "adult-feminine-formal",
    category: "Adult feminine formal",
    positivePrompt:
      "Professional dark formal blazer, high-neck blouse or collared formal shirt, elegant neckline, clean studio lighting, high resolution fabric texture",
    negativePrompt:
      "casual wear, t-shirt, logos, low-cut neckline, revealing garments, bright distracting patterns, oversized accessories, deformed collar, blur",
    guidanceNotes:
      "Mask restricted strictly below collarbone and neck line. High-neck business formal silhouette.",
  },

  // 3. Child Formal
  "child-formal": {
    id: "child-formal",
    category: "Child",
    positivePrompt:
      "Neat, clean formal collared shirt or smart jacket, child appropriate, plain solid colour, clean neckline",
    negativePrompt:
      "cartoons, graphic prints, heavy logos, soiled fabric, oversized adult suits, loose hoodies, flashy jewellery, distorted collar",
    guidanceNotes:
      "Age-appropriate smart casual or school uniform collared shirt. Proportional child shoulder span.",
  },

  // 4. Hijab / Head Covering Formal
  "hijab-formal": {
    id: "hijab-formal",
    category: "Hijab / head covering",
    positivePrompt:
      "Respectful modest formal business attire below head covering, dark formal blazer or collared jacket meeting hijab drape naturally without altering or overlapping scarf folds",
    negativePrompt:
      "modifying head scarf, altering hijab colour, revealing hair, moving scarf folds, tight low neckline, casual graphic tee, transparent fabric, distorted chest drape",
    guidanceNotes:
      "ZERO modification to head covering. Inpainting mask is placed strictly below the lower perimeter of the headscarf drape.",
  },

  // 5. Clothing Unchanged
  "clothing-unchanged": {
    id: "clothing-unchanged",
    category: "Clothing unchanged",
    positivePrompt:
      "Retain uploaded garment, clean wrinkles, normalize studio exposure without alteration",
    negativePrompt:
      "changing clothes, adding suit, removing collar, changing garment colour, texture distortion",
    guidanceNotes:
      "Preserves original uploaded garments completely; only applies studio lighting and exposure normalization.",
  },
};

/**
 * Resolves the appropriate prompt template based on user selections
 */
export function resolvePromptTemplate(options: {
  category: PersonCategory;
  presentation: ClothingPresentationPreference;
  clothingChange: ClothingChangeSelection;
  headCovering: HeadCoveringPreference;
}): PromptTemplateDefinition {
  if (options.clothingChange === "keep" || options.presentation === "original") {
    return OFFICIAL_STUDIO_PROMPTS["clothing-unchanged"];
  }

  if (options.headCovering === "hijab" || options.headCovering === "preserve") {
    return OFFICIAL_STUDIO_PROMPTS["hijab-formal"];
  }

  if (options.category === "child") {
    return OFFICIAL_STUDIO_PROMPTS["child-formal"];
  }

  if (options.presentation === "formal-feminine") {
    return OFFICIAL_STUDIO_PROMPTS["adult-feminine-formal"];
  }

  // Default to adult masculine / neutral formal
  return OFFICIAL_STUDIO_PROMPTS["adult-masculine-formal"];
}
