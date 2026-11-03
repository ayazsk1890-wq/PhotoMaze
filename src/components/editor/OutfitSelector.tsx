"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useEditor } from "@/lib/context/EditorContext";
import {
  OUTFIT_TEMPLATES,
  OUTFIT_CATEGORY_LABELS,
  OutfitTemplate,
  OutfitCategory,
} from "@/lib/constants/outfits";
import {
  Shirt,
  Sparkles,
  RefreshCw,
  ToggleLeft,
  ToggleRight,
  KeyRound,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Eye,
  EyeOff,
  DollarSign,
} from "lucide-react";

type CategoryFilter = OutfitCategory | "all";

const CATEGORY_TABS: CategoryFilter[] = [
  "all",
  "business-suit",
  "blazer",
  "formal-shirt",
  "mens-formal",
  "womens-formal",
  "childrens-formal",
  "professional",
];

export function OutfitSelector() {
  const {
    originalImageSrc,
    outfitState,
    triggerOutfitReplacement,
    restoreOriginalOutfit,
    setOutfitPreviewMode,
    setActiveSidebarTab,
  } = useEditor();

  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("all");
  const [selectedOutfit, setSelectedOutfit] = useState<OutfitTemplate | null>(null);

  // Filter outfits by category
  const filteredOutfits =
    activeCategory === "all"
      ? OUTFIT_TEMPLATES
      : OUTFIT_TEMPLATES.filter((o) => o.category === activeCategory);

  const handleSelectOutfit = (outfit: OutfitTemplate) => {
    setSelectedOutfit(outfit);
  };

  const handleApply = async () => {
    if (!selectedOutfit) return;
    await triggerOutfitReplacement(selectedOutfit);
  };

  const handleRestore = () => {
    restoreOriginalOutfit();
    setSelectedOutfit(null);
  };

  // Scroll category tabs
  const [tabScrollPos, setTabScrollPos] = useState(0);

  const hasOutfit = Boolean(outfitState.outputImageUrl);

  return (
    <div className="space-y-4">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="bg-[#171B24] border border-[#292F3A] rounded-2xl p-4 text-[#F5F7FA] shadow-md">
        <div className="flex items-center gap-2 mb-1">
          <div className="p-1.5 rounded-lg bg-[#1C2230] text-[#8B7CFF] border border-[#292F3A]">
            <Shirt className="w-4 h-4 text-amber-300" />
          </div>
          <div>
            <h4 className="text-sm font-bold">Formal Outfit Templates</h4>
            <span className="text-[10px] text-[#9CA3AF]">100% Free Formal Wear Presets</span>
          </div>
        </div>
        <p className="text-xs text-[#9CA3AF] leading-relaxed">
          Select a formal outfit below and let AI seamlessly apply it to your portrait — preserving
          your face, skin tone and body proportions.
        </p>
      </div>

      {/* ── Technical Limitation / Free Cloud Notice ───────────────── */}
      {outfitState.requiresApiKey && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 space-y-2 text-[#F5F7FA]">
          <div className="flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-sm font-semibold text-amber-300">API Key Required (Optional Cloud GPU)</span>
          </div>
          <p className="text-xs text-[#9CA3AF] leading-relaxed">
            Neural virtual try-on models require dedicated GPU compute clusters and cannot run on-device inside the browser. PhotoMaze is 100% free and charges no fees.
          </p>
          <p className="text-xs text-amber-300 font-medium">
            <strong>Genuinely Free Alternative:</strong> Official passport agencies strongly recommend photographing yourself directly wearing a dark shirt or blazer for the most natural, authentic result.
          </p>
          <div className="text-[11px] text-[#9CA3AF] pt-1 border-t border-[#292F3A]">
            To optionally test cloud virtual try-on, configure a free Replicate token in <code className="bg-[#1C2230] px-1 rounded font-mono text-[#8B7CFF]">.env.local</code>:
            <div className="bg-[#1C2230] border border-[#292F3A] rounded-md p-1.5 font-mono text-[10px] text-[#8B7CFF] mt-1 break-all">
              REPLICATE_API_TOKEN=r8_your_free_token
            </div>
          </div>
        </div>
      )}

      {/* ── Error Banner ────────────────────────────────────────────── */}
      {outfitState.error && !outfitState.requiresApiKey && (
        <div className="bg-[#F87171]/10 border border-[#F87171]/30 rounded-xl p-3 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-[#F87171] shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-[#F87171]">Outfit replacement failed</p>
            <p className="text-xs text-[#9CA3AF] mt-0.5 leading-relaxed">{outfitState.error}</p>
          </div>
        </div>
      )}

      {/* ── Processing Progress Modal ───────────────────────────────── */}
      {outfitState.isProcessing && (
        <div className="bg-[#171B24] border border-[#8B7CFF]/30 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 text-[#8B7CFF] animate-spin" />
            <span className="text-sm font-semibold text-[#F5F7FA]">Generating outfit…</span>
          </div>
          <div className="w-full bg-[#1C2230] rounded-full h-2 overflow-hidden border border-[#292F3A]">
            <div
              className="h-2 bg-[#8B7CFF] rounded-full transition-all duration-700"
              style={{ width: `${outfitState.progressPercent}%` }}
            />
          </div>
          <p className="text-xs text-[#9CA3AF]">{outfitState.stageMessage}</p>
          <p className="text-[10px] text-[#697386]">
            IDM-VTON typically takes 30–90 seconds on Replicate GPU. Please wait…
          </p>
        </div>
      )}

      {/* ── Success: Before / After Toggle ─────────────────────────── */}
      {hasOutfit && !outfitState.isProcessing && (
        <div className="bg-[#171B24] border border-[#34D399]/40 rounded-xl p-3 space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#34D399]" />
            <span className="text-sm font-semibold text-[#34D399]">Outfit Applied!</span>
            <span className="ml-auto text-[10px] text-[#34D399] bg-[#34D399]/15 px-2 py-0.5 rounded-full flex items-center gap-1 border border-[#34D399]/30">
              <DollarSign className="w-3 h-3" />
              ~$0.003 used
            </span>
          </div>

          {/* Before / After toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setOutfitPreviewMode(false)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1 ${
                !outfitState.previewMode
                  ? "bg-[#1C2230] text-[#F5F7FA] border border-[#292F3A]"
                  : "bg-[#11141B] text-[#9CA3AF] hover:text-[#F5F7FA]"
              }`}
            >
              <EyeOff className="w-3 h-3" />
              Original
            </button>
            <button
              onClick={() => setOutfitPreviewMode(true)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1 ${
                outfitState.previewMode
                  ? "bg-[#8B7CFF] text-white"
                  : "bg-[#11141B] text-[#9CA3AF] hover:text-[#F5F7FA]"
              }`}
            >
              <Eye className="w-3 h-3" />
              With Outfit
            </button>
          </div>

          <button
            onClick={handleRestore}
            className="w-full py-2 rounded-xl bg-[#1C2230] border border-[#292F3A] text-xs font-semibold text-[#F5F7FA] hover:bg-[#292F3A] transition-all flex items-center justify-center gap-1.5"
          >
            <RefreshCw className="w-3 h-3" />
            Restore Original Clothing
          </button>
        </div>
      )}

      {/* ── No image warning ────────────────────────────────────────── */}
      {!originalImageSrc && (
        <div className="bg-[#171B24] border border-dashed border-[#292F3A] rounded-xl p-4 text-center">
          <Shirt className="w-8 h-8 text-[#697386] mx-auto mb-2" />
          <p className="text-sm text-[#9CA3AF] font-medium">Upload a photo first</p>
          <p className="text-xs text-[#697386] mt-1">
            A portrait photo is needed to apply outfit replacement.
          </p>
        </div>
      )}

      {originalImageSrc && (
        <>
          {/* ── Category Filter Tabs ─────────────────────────────── */}
          <div className="relative">
            <div className="overflow-x-auto scrollbar-hide">
              <div className="flex gap-1.5 pb-1" style={{ minWidth: "max-content" }}>
                {CATEGORY_TABS.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                      activeCategory === cat
                        ? "bg-[#8B7CFF] text-white shadow-sm"
                        : "bg-[#1C2230] border border-[#292F3A] text-[#9CA3AF] hover:text-[#F5F7FA]"
                    }`}
                  >
                    {OUTFIT_CATEGORY_LABELS[cat]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── Outfit Grid ──────────────────────────────────────── */}
          <div className="grid grid-cols-2 gap-2.5">
            {filteredOutfits.map((outfit) => (
              <OutfitCard
                key={outfit.id}
                outfit={outfit}
                isSelected={selectedOutfit?.id === outfit.id}
                isApplied={outfitState.outputImageUrl !== null && outfitState.selectedOutfitId === outfit.id}
                onSelect={handleSelectOutfit}
              />
            ))}
          </div>

          {filteredOutfits.length === 0 && (
            <div className="text-center py-6 text-[#697386] text-sm">
              No outfits in this category yet.
            </div>
          )}

          {/* ── Apply / Action Buttons ───────────────────────────── */}
          <div className="space-y-2 pt-1">
            <button
              onClick={handleApply}
              disabled={!selectedOutfit || outfitState.isProcessing || !originalImageSrc}
              className="w-full py-3 px-4 rounded-xl bg-[#8B7CFF] hover:bg-[#7665F5] text-white font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-[#8B7CFF]/20 active:scale-[0.98]"
            >
              {outfitState.isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating… {outfitState.progressPercent > 0 ? `${Math.round(outfitState.progressPercent)}%` : ""}
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  {selectedOutfit ? `Apply "${selectedOutfit.name}"` : "Select an Outfit Above"}
                </>
              )}
            </button>

            <p className="text-center text-[10px] text-[#697386]">
              Powered by Replicate IDM-VTON · ~\$0.003/image · Original image preserved
            </p>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Outfit Card Sub-component ───────────────────────────────────────────────

interface OutfitCardProps {
  outfit: OutfitTemplate;
  isSelected: boolean;
  isApplied: boolean;
  onSelect: (outfit: OutfitTemplate) => void;
}

function OutfitCard({ outfit, isSelected, isApplied, onSelect }: OutfitCardProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <button
      type="button"
      onClick={() => onSelect(outfit)}
      className={`relative rounded-xl overflow-hidden border-2 transition-all group text-left ${
        isSelected
          ? "border-[#8B7CFF] shadow-md shadow-[#8B7CFF]/20 ring-2 ring-[#8B7CFF]/40 bg-[#171B24]"
          : "border-[#292F3A] bg-[#171B24] hover:border-[#8B7CFF]/50 hover:shadow-sm"
      }`}
    >
      {/* Thumbnail */}
      <div className="aspect-[3/4] bg-[#1C2230] relative overflow-hidden">
        {!imgError ? (
          <img
            src={outfit.previewThumbnail}
            alt={outfit.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Shirt className="w-10 h-10 text-[#697386]" />
          </div>
        )}

        {/* Applied indicator */}
        {isApplied && (
          <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[#34D399] flex items-center justify-center">
            <CheckCircle2 className="w-3.5 h-3.5 text-black" />
          </div>
        )}

        {/* Selected overlay */}
        {isSelected && (
          <div className="absolute inset-0 bg-[#8B7CFF]/10 pointer-events-none" />
        )}

        {/* Gender badge */}
        <div className="absolute bottom-1.5 left-1.5">
          <span className="text-[9px] font-bold bg-black/70 text-white px-1.5 py-0.5 rounded-md capitalize">
            {outfit.gender}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-2 bg-[#171B24]">
        <p className="text-xs font-semibold text-[#F5F7FA] leading-tight truncate">{outfit.name}</p>
        <p className="text-[10px] text-[#9CA3AF] mt-0.5 leading-tight line-clamp-2">{outfit.description}</p>
      </div>
    </button>
  );
}

