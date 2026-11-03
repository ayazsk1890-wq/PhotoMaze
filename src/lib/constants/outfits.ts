/**
 * Outfit Templates for AI Virtual Try-On (Phase 6)
 * Garment images sourced from Unsplash (free to use, non-commercial CDN URLs).
 * These URLs are passed as the `garment_image` input to IDM-VTON on Replicate.
 */

export type OutfitCategory =
  | "mens-formal"
  | "womens-formal"
  | "childrens-formal"
  | "business-suit"
  | "formal-shirt"
  | "blazer"
  | "professional";

export type OutfitGender = "male" | "female" | "unisex" | "children";

export interface OutfitTemplate {
  id: string;
  name: string;
  category: OutfitCategory;
  gender: OutfitGender;
  description: string;
  /** Full-resolution garment image URL fed to the AI model */
  garmentImageUrl: string;
  /** Smaller thumbnail shown in the UI card */
  previewThumbnail: string;
  /** Human-readable colour / style tags */
  tags: string[];
  /** Whether this outfit is available (false = coming soon) */
  available: boolean;
}

// ──────────────────────────────────────────────────────────────────────────────
// NOTE ON GARMENT IMAGE URLS
// IDM-VTON works best with clean garment-only photos (front-facing, flat lay or
// mannequin shots) against a plain/white background.
// The Unsplash URLs below are representative high-quality garment images that
// work well with virtual try-on models. Always use direct image file URLs
// (ending in .jpg / .png), not Unsplash page URLs.
// ──────────────────────────────────────────────────────────────────────────────

export const OUTFIT_TEMPLATES: OutfitTemplate[] = [
  // ── Men's Formal ────────────────────────────────────────────────────────────
  {
    id: "mens-navy-suit",
    name: "Navy Business Suit",
    category: "business-suit",
    gender: "male",
    description: "Classic navy two-piece suit — timeless professional look",
    garmentImageUrl:
      "https://images.unsplash.com/photo-1594938298603-c8148f4994d9?w=800&q=80&fm=jpg",
    previewThumbnail:
      "https://images.unsplash.com/photo-1594938298603-c8148f4994d9?w=300&q=75&fm=jpg",
    tags: ["navy", "classic", "suit", "formal"],
    available: true,
  },
  {
    id: "mens-charcoal-suit",
    name: "Charcoal Grey Suit",
    category: "business-suit",
    gender: "male",
    description: "Sharp charcoal grey suit — ideal for passport & visa photos",
    garmentImageUrl:
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80&fm=jpg",
    previewThumbnail:
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=300&q=75&fm=jpg",
    tags: ["charcoal", "grey", "suit", "formal"],
    available: true,
  },
  {
    id: "mens-black-suit",
    name: "Black Formal Suit",
    category: "business-suit",
    gender: "male",
    description: "Elegant black suit — classic, versatile and universally accepted",
    garmentImageUrl:
      "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=800&q=80&fm=jpg",
    previewThumbnail:
      "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=300&q=75&fm=jpg",
    tags: ["black", "suit", "formal", "classic"],
    available: true,
  },
  {
    id: "mens-white-shirt",
    name: "White Dress Shirt",
    category: "formal-shirt",
    gender: "male",
    description: "Crisp white dress shirt — clean and professional",
    garmentImageUrl:
      "https://images.unsplash.com/photo-1598522325074-042db73aa4e6?w=800&q=80&fm=jpg",
    previewThumbnail:
      "https://images.unsplash.com/photo-1598522325074-042db73aa4e6?w=300&q=75&fm=jpg",
    tags: ["white", "shirt", "formal", "clean"],
    available: true,
  },
  {
    id: "mens-blue-shirt",
    name: "Light Blue Dress Shirt",
    category: "formal-shirt",
    gender: "male",
    description: "Classic light blue business shirt — popular for US/EU passport photos",
    garmentImageUrl:
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80&fm=jpg",
    previewThumbnail:
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=300&q=75&fm=jpg",
    tags: ["blue", "shirt", "formal", "business"],
    available: true,
  },
  {
    id: "mens-navy-blazer",
    name: "Navy Blazer",
    category: "blazer",
    gender: "male",
    description: "Versatile navy blazer — smart casual to business formal",
    garmentImageUrl:
      "https://images.unsplash.com/photo-1598808503491-6b6cae04e85f?w=800&q=80&fm=jpg",
    previewThumbnail:
      "https://images.unsplash.com/photo-1598808503491-6b6cae04e85f?w=300&q=75&fm=jpg",
    tags: ["navy", "blazer", "versatile"],
    available: true,
  },
  {
    id: "mens-grey-blazer",
    name: "Grey Blazer",
    category: "blazer",
    gender: "male",
    description: "Modern grey blazer — contemporary business professional",
    garmentImageUrl:
      "https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=800&q=80&fm=jpg",
    previewThumbnail:
      "https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=300&q=75&fm=jpg",
    tags: ["grey", "blazer", "modern"],
    available: true,
  },

  // ── Men's Formal (traditional) ───────────────────────────────────────────
  {
    id: "mens-formal-kurta",
    name: "White Formal Kurta",
    category: "mens-formal",
    gender: "male",
    description: "Traditional white formal kurta — accepted for Indian government ID photos",
    garmentImageUrl:
      "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=800&q=80&fm=jpg",
    previewThumbnail:
      "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=300&q=75&fm=jpg",
    tags: ["kurta", "white", "traditional", "formal"],
    available: true,
  },

  // ── Women's Formal ──────────────────────────────────────────────────────────
  {
    id: "womens-black-blazer",
    name: "Black Women's Blazer",
    category: "blazer",
    gender: "female",
    description: "Polished black blazer — authoritative and professional",
    garmentImageUrl:
      "https://images.unsplash.com/photo-1548142813-c348350df52b?w=800&q=80&fm=jpg",
    previewThumbnail:
      "https://images.unsplash.com/photo-1548142813-c348350df52b?w=300&q=75&fm=jpg",
    tags: ["black", "blazer", "women", "formal"],
    available: true,
  },
  {
    id: "womens-navy-blazer",
    name: "Navy Women's Blazer",
    category: "blazer",
    gender: "female",
    description: "Classic navy blazer for women — professional and elegant",
    garmentImageUrl:
      "https://images.unsplash.com/photo-1614093302611-8efc4cbf3b4e?w=800&q=80&fm=jpg",
    previewThumbnail:
      "https://images.unsplash.com/photo-1614093302611-8efc4cbf3b4e?w=300&q=75&fm=jpg",
    tags: ["navy", "blazer", "women", "classic"],
    available: true,
  },
  {
    id: "womens-white-blouse",
    name: "White Professional Blouse",
    category: "formal-shirt",
    gender: "female",
    description: "Crisp white blouse — clean and universally professional",
    garmentImageUrl:
      "https://images.unsplash.com/photo-1585914924626-15adac1e6402?w=800&q=80&fm=jpg",
    previewThumbnail:
      "https://images.unsplash.com/photo-1585914924626-15adac1e6402?w=300&q=75&fm=jpg",
    tags: ["white", "blouse", "women", "professional"],
    available: true,
  },
  {
    id: "womens-formal-dress",
    name: "Navy Formal Dress",
    category: "womens-formal",
    gender: "female",
    description: "Elegant navy formal dress — sophisticated for passport and visa photos",
    garmentImageUrl:
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80&fm=jpg",
    previewThumbnail:
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=300&q=75&fm=jpg",
    tags: ["navy", "dress", "women", "elegant"],
    available: true,
  },
  {
    id: "womens-grey-suit",
    name: "Grey Women's Suit",
    category: "business-suit",
    gender: "female",
    description: "Tailored grey pantsuit — powerful executive look",
    garmentImageUrl:
      "https://images.unsplash.com/photo-1631557805929-80e10d32b1c3?w=800&q=80&fm=jpg",
    previewThumbnail:
      "https://images.unsplash.com/photo-1631557805929-80e10d32b1c3?w=300&q=75&fm=jpg",
    tags: ["grey", "suit", "women", "executive"],
    available: true,
  },
  {
    id: "womens-black-formal",
    name: "Black Formal Outfit",
    category: "professional",
    gender: "female",
    description: "Timeless black formal — universally accepted professional appearance",
    garmentImageUrl:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80&fm=jpg",
    previewThumbnail:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&q=75&fm=jpg",
    tags: ["black", "formal", "women", "timeless"],
    available: true,
  },

  // ── Children's Formal ───────────────────────────────────────────────────────
  {
    id: "children-white-shirt",
    name: "Children's White Shirt",
    category: "childrens-formal",
    gender: "children",
    description: "Smart white shirt for children — neat for child passport photos",
    garmentImageUrl:
      "https://images.unsplash.com/photo-1574201635302-388dd92a4c3f?w=800&q=80&fm=jpg",
    previewThumbnail:
      "https://images.unsplash.com/photo-1574201635302-388dd92a4c3f?w=300&q=75&fm=jpg",
    tags: ["white", "children", "shirt", "neat"],
    available: true,
  },
  {
    id: "children-formal-dress",
    name: "Children's Formal Dress",
    category: "childrens-formal",
    gender: "children",
    description: "Formal dress for young girls — tidy for passport and ID photos",
    garmentImageUrl:
      "https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=800&q=80&fm=jpg",
    previewThumbnail:
      "https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=300&q=75&fm=jpg",
    tags: ["dress", "children", "formal", "girls"],
    available: true,
  },
  {
    id: "children-navy-blazer",
    name: "Children's Navy Blazer",
    category: "childrens-formal",
    gender: "children",
    description: "Smart navy blazer for children — school or formal occasion",
    garmentImageUrl:
      "https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=800&q=80&fm=jpg",
    previewThumbnail:
      "https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=300&q=75&fm=jpg",
    tags: ["navy", "children", "blazer", "school"],
    available: true,
  },

  // ── Professional / Unisex ───────────────────────────────────────────────────
  {
    id: "mens-pinstripe-suit",
    name: "Pinstripe Business Suit",
    category: "business-suit",
    gender: "male",
    description: "Classic pinstripe suit — distinguished executive presence",
    garmentImageUrl:
      "https://images.unsplash.com/photo-1541346183200-e8e117d945b4?w=800&q=80&fm=jpg",
    previewThumbnail:
      "https://images.unsplash.com/photo-1541346183200-e8e117d945b4?w=300&q=75&fm=jpg",
    tags: ["pinstripe", "suit", "executive", "formal"],
    available: true,
  },
  {
    id: "unisex-white-formal",
    name: "White Formal Shirt (Unisex)",
    category: "professional",
    gender: "unisex",
    description: "Classic white formal shirt suitable for any gender presentation",
    garmentImageUrl:
      "https://images.unsplash.com/photo-1603251578711-3290ca1a0187?w=800&q=80&fm=jpg",
    previewThumbnail:
      "https://images.unsplash.com/photo-1603251578711-3290ca1a0187?w=300&q=75&fm=jpg",
    tags: ["white", "unisex", "formal", "versatile"],
    available: true,
  },
  {
    id: "unisex-black-turtleneck",
    name: "Black Turtleneck (Unisex)",
    category: "professional",
    gender: "unisex",
    description: "Modern black turtleneck — contemporary professional aesthetic",
    garmentImageUrl:
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80&fm=jpg",
    previewThumbnail:
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=300&q=75&fm=jpg",
    tags: ["black", "turtleneck", "unisex", "modern"],
    available: true,
  },
  {
    id: "unisex-navy-shirt",
    name: "Navy Casual Formal (Unisex)",
    category: "professional",
    gender: "unisex",
    description: "Navy formal shirt with a contemporary cut for all genders",
    garmentImageUrl:
      "https://images.unsplash.com/photo-1588117305388-c2631a279f82?w=800&q=80&fm=jpg",
    previewThumbnail:
      "https://images.unsplash.com/photo-1588117305388-c2631a279f82?w=300&q=75&fm=jpg",
    tags: ["navy", "shirt", "unisex", "formal"],
    available: true,
  },
];

/** Convenience: grouped by category for rendering UI tabs */
export function getOutfitsByCategory(category: OutfitCategory | "all"): OutfitTemplate[] {
  if (category === "all") return OUTFIT_TEMPLATES;
  return OUTFIT_TEMPLATES.filter((o) => o.category === category);
}

/** Convenience: get a single outfit by ID */
export function getOutfitById(id: string): OutfitTemplate | undefined {
  return OUTFIT_TEMPLATES.find((o) => o.id === id);
}

export const OUTFIT_CATEGORY_LABELS: Record<OutfitCategory | "all", string> = {
  all: "All Outfits",
  "mens-formal": "Men's Formal",
  "womens-formal": "Women's Formal",
  "childrens-formal": "Children's",
  "business-suit": "Business Suits",
  "formal-shirt": "Formal Shirts",
  blazer: "Blazers",
  professional: "Professional",
};

