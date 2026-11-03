import { AiPersonaType, EnhancementPreset, PortraitEnhancementSettings } from "@/types/editor";

export interface PersonaDefinition {
  id: AiPersonaType;
  label: string;
  shortLabel: string;
  icon: string;
  badge: string;
  tagline: string;
  description: string;
  sampleUrl: string;
  sampleWhiteBgUrl: string;
  sampleSuitUrl: string;
  headCoverageMin: number; // e.g. 0.70 (70%)
  headCoverageMax: number; // e.g. 0.80 (80%)
  enhancementPreset: EnhancementPreset;
  enhancementOverrides: Partial<PortraitEnhancementSettings>;
  complianceNotes: string;
  officialGuidance: string;
}

export const AI_PERSONAS: Record<AiPersonaType, PersonaDefinition> = {
  male: {
    id: "male",
    label: "Adult Male",
    shortLabel: "Male",
    icon: "👨",
    badge: "Standard Adult",
    tagline: "Crisp facial centering with neutral studio exposure",
    description: "Optimized for adult male portraits with chin-to-crown biometric centering, collar detection, and neutral pure white studio background.",
    sampleUrl: "/samples/sample-man.jpg",
    sampleWhiteBgUrl: "/samples/sample-man-whitebg.jpg",
    sampleSuitUrl: "/samples/sample-man-suit.jpg",
    headCoverageMin: 0.70,
    headCoverageMax: 0.80,
    enhancementPreset: "studio",
    enhancementOverrides: {
      skinSmoothing: 25,
      blemishReduction: 25,
      lightingCorrection: 25,
      brightness: 5,
      contrast: 8,
      sharpness: 35,
    },
    complianceNotes: "Front-facing pose, eyes level, neutral expression with mouth closed. Ears and hairline clearly visible.",
    officialGuidance: "Complies with Indian Passport PSK/POPSK rules and ICAO Doc 9303 standards.",
  },
  female: {
    id: "female",
    label: "Adult Female",
    shortLabel: "Female",
    icon: "👩",
    badge: "Portrait Studio",
    tagline: "Fine hair strand matting & soft balanced lighting",
    description: "Precision boundary matting preserving loose hair strands and flyaways, soft shadow neutralization under chin/eyes, and subtle skin tone smoothing.",
    sampleUrl: "/samples/sample-woman.jpg",
    sampleWhiteBgUrl: "/samples/sample-woman-whitebg.jpg",
    sampleSuitUrl: "/samples/sample-woman-suit.jpg",
    headCoverageMin: 0.70,
    headCoverageMax: 0.80,
    enhancementPreset: "natural",
    enhancementOverrides: {
      skinSmoothing: 35,
      blemishReduction: 35,
      lightingCorrection: 30,
      brightness: 6,
      contrast: 6,
      sharpness: 30,
    },
    complianceNotes: "Front-facing portrait, eyes wide open and level, subtle makeup allowed, ears uncovered where practical.",
    officialGuidance: "Preserves natural facial features and authentic biometric landmarks according to passport guidelines.",
  },
  child: {
    id: "child",
    label: "Child / Infant",
    shortLabel: "Child",
    icon: "🧒",
    badge: "Infant & Child",
    tagline: "Lenient head ratio with gentle edge smoothing",
    description: "Specialized for toddlers, infants, and minors. Adapts to wider head tolerance ratios (50–75%) with background artifact removal.",
    sampleUrl: "/samples/sample-child.jpg",
    sampleWhiteBgUrl: "/samples/sample-child-whitebg.jpg",
    sampleSuitUrl: "/samples/sample-child-suit.jpg",
    headCoverageMin: 0.55,
    headCoverageMax: 0.75,
    enhancementPreset: "subtle",
    enhancementOverrides: {
      skinSmoothing: 15,
      blemishReduction: 10,
      lightingCorrection: 20,
      brightness: 6,
      contrast: 4,
      sharpness: 20,
      noiseReduction: 30,
    },
    complianceNotes: "Babies under 1 year can have relaxed head tolerance. No adult hands, toys, pacifiers, or supporting pillows visible in the frame.",
    officialGuidance: "Complies with international passport provisions for infants and children under 5 years.",
  },
  hijab: {
    id: "hijab",
    label: "Woman wearing Hijab",
    shortLabel: "Hijab / Scarf",
    icon: "🧕",
    badge: "Religious Headwear Compliant",
    tagline: "Preserves hijab folds with full facial oval compliance",
    description: "Engineered specifically for women wearing a hijab or religious head covering. AI extracts the background cleanly around the fabric folds while strictly preserving the full facial oval from chin to forehead.",
    sampleUrl: "/samples/sample-hijab.jpg",
    sampleWhiteBgUrl: "/samples/sample-hijab.jpg",
    sampleSuitUrl: "/samples/sample-hijab.jpg",
    headCoverageMin: 0.70,
    headCoverageMax: 0.80,
    enhancementPreset: "brighten",
    enhancementOverrides: {
      skinSmoothing: 30,
      blemishReduction: 25,
      lightingCorrection: 45, // Eliminates shadows cast by hijab onto face
      brightness: 8,
      contrast: 6,
      sharpness: 30,
    },
    complianceNotes: "Under Indian Passport, US, UK, and Schengen rules, religious headwear is 100% permitted. The full facial oval from chin to top of forehead, including both jawline edges, must remain unobstructed. No shadows cast by headwear onto face.",
    officialGuidance: "100% compliant with ICAO Doc 9303 Section 3.9 (Religious Head Coverings) and Indian Passport Seva Kendra regulations.",
  },
};

export const PERSONA_LIST: PersonaDefinition[] = [
  AI_PERSONAS.male,
  AI_PERSONAS.female,
  AI_PERSONAS.child,
  AI_PERSONAS.hijab,
];

export function getPersonaDefinition(persona: AiPersonaType): PersonaDefinition {
  return AI_PERSONAS[persona] || AI_PERSONAS.male;
}
