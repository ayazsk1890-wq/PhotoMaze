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
      <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 rounded-2xl p-4 text-white shadow-md shadow-violet-500/20">
        <div className="flex items-center gap-2 mb-1">
          <div className="p-1.5 rounded-lg bg-white/20">
            <Shirt className="w-4 h-4 text-yellow-300" />
          </div>
          <div>
            <h4 className="text-sm font-bold">Formal Outfit Templates</h4>
            <span className="text-[10px] text-violet-200">100% Free Formal Wear Presets</span>
          </div>
        </div>
        <p className="text-xs text-violet-100 leading-relaxed">
          Select a formal outfit below and let AI seamlessly apply it to your portrait — preserving
          your face, skin tone and body proportions.
        </p>
      </div>

      {/* ── Technical Limitation / Free Cloud Notice ───────────────── */}
      {outfitState.requiresApiKey && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 space-y-2">
          <div className="flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="text-sm font-semibold text-amber-800">API Key Required (Optional Cloud GPU)</span>
          </div>
          <p className="text-xs text-amber-700 leading-relaxed">
            Neural virtual try-on models require dedicated GPU compute clusters and cannot run on-device inside the browser. PhotoMaze is 100% free and charges no fees.
          </p>
          <p className="text-xs text-amber-800 font-medium">
            <strong>Genuinely Free Alternative:</strong> Official passport agencies strongly recommend photographing yourself directly wearing a dark shirt or blazer for the most natural, authentic result.
          </p>
          <div className="text-[11px] text-amber-700 pt-1 border-t border-amber-200/60">
            To optionally test cloud virtual try-on, configure a free Replicate token in <code className="bg-amber-100 px-1 rounded font-mono">.env.local</code>:
            <div className="bg-amber-100/80 rounded-md p-1.5 font-mono text-[10px] text-amber-900 mt-1 break-all">
              REPLICATE_API_TOKEN=r8_your_free_token
            </div>
          </div>
        </div>
      )}

      {/* ── Error Banner ────────────────────────────────────────────── */}
      {outfitState.error && !outfitState.requiresApiKey && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-red-700">Outfit replacement failed</p>
            <p className="text-xs text-red-600 mt-0.5 leading-relaxed">{outfitState.error}</p>
          </div>
        </div>
      )}

      {/* ── Processing Progress Modal ───────────────────────────────── */}
      {outfitState.isProcessing && (
        <div className="bg-violet-50 border border-violet-200 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 text-violet-600 animate-spin" />
            <span className="text-sm font-semibold text-violet-800">Generating outfit…</span>
          </div>
          <div className="w-full bg-violet-100 rounded-full h-2 overflow-hidden">
            <div
              className="h-2 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all duration-700"
              style={{ width: `${outfitState.progressPercent}%` }}
            />
          </div>
          <p className="text-xs text-violet-700">{outfitState.stageMessage}</p>
          <p className="text-[10px] text-violet-500">
            IDM-VTON typically takes 30–90 seconds on Replicate GPU. Please wait…
          </p>
        </div>
      )}

      {/* ── Success: Before / After Toggle ─────────────────────────── */}
      {hasOutfit && !outfitState.isProcessing && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="text-sm font-semibold text-emerald-800">Outfit Applied!</span>
            <span className="ml-auto text-[10px] text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
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
                  ? "bg-slate-700 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <EyeOff className="w-3 h-3" />
              Original
            </button>
            <button
              onClick={() => setOutfitPreviewMode(true)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1 ${
                outfitState.previewMode
                  ? "bg-violet-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <Eye className="w-3 h-3" />
              With Outfit
            </button>
          </div>

          <button
            onClick={handleRestore}
            className="w-full py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all flex items-center justify-center gap-1.5"
          >
            <RefreshCw className="w-3 h-3" />
            Restore Original Clothing
          </button>
        </div>
      )}

      {/* ── No image warning ────────────────────────────────────────── */}
      {!originalImageSrc && (
        <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-4 text-center">
          <Shirt className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-500 font-medium">Upload a photo first</p>
          <p className="text-xs text-slate-400 mt-1">
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
                        ? "bg-violet-600 text-white shadow-sm"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
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
            <div className="text-center py-6 text-slate-400 text-sm">
              No outfits in this category yet.
            </div>
          )}

          {/* ── Apply / Action Buttons ───────────────────────────── */}
          <div className="space-y-2 pt-1">
            <button
              onClick={handleApply}
              disabled={!selectedOutfit || outfitState.isProcessing || !originalImageSrc}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-violet-500/30 active:scale-[0.98]"
            >
              {outfitState.isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating… {outfitState.progressPercent > 0 ? `${Math.round(outfitState.progressPercent)}%` : ""}
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                  {selectedOutfit ? `Apply "${selectedOutfit.name}"` : "Select an Outfit Above"}
                </>
              )}
            </button>

            <p className="text-center text-[10px] text-slate-400">
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
          ? "border-violet-500 shadow-md shadow-violet-500/20 ring-2 ring-violet-400/40"
          : "border-slate-200 hover:border-violet-300 hover:shadow-sm"
      }`}
    >
      {/* Thumbnail */}
      <div className="aspect-[3/4] bg-slate-100 relative overflow-hidden">
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
            <Shirt className="w-10 h-10 text-slate-300" />
          </div>
        )}

        {/* Applied indicator */}
        {isApplied && (
          <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
            <CheckCircle2 className="w-3.5 h-3.5 text-white" />
          </div>
        )}

        {/* Selected overlay */}
        {isSelected && (
          <div className="absolute inset-0 bg-violet-600/10 pointer-events-none" />
        )}

        {/* Gender badge */}
        <div className="absolute bottom-1.5 left-1.5">
          <span className="text-[9px] font-bold bg-black/60 text-white px-1.5 py-0.5 rounded-md capitalize">
            {outfit.gender}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-2">
        <p className="text-xs font-semibold text-slate-800 leading-tight truncate">{outfit.name}</p>
        <p className="text-[10px] text-slate-500 mt-0.5 leading-tight line-clamp-2">{outfit.description}</p>
      </div>
    </button>
  );
}

