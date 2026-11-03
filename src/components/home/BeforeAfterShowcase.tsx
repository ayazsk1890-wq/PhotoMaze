"use client";

import React, { useState } from "react";
import { Check, Sparkles, ArrowRight, Scissors, Shirt, Grid, ShieldAlert } from "lucide-react";

export function BeforeAfterShowcase() {
  const [activeTab, setActiveTab] = useState<"background" | "suit" | "print">("background");
  const [sliderPosition, setSliderPosition] = useState(50);

  const showcaseCases = {
    background: {
      title: "AI Background Removal & White Backdrop",
      badge: "Compliance Essential",
      description:
        "Strip away messy domestic backgrounds, harsh wall shadows, and imperfect lighting. Replaced with 100% compliant pure white or off-white backdrop.",
      beforeImg: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
      afterImg: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
      beforeLabel: "Original Selfie (Messy Room)",
      afterLabel: "Biometric Studio White (300 DPI)",
      specs: ["100% Solid White", "Shadow-Free", "Clean Hair Strands Matting"],
    },
    suit: {
      title: "AI Formal Suit & Clothing Replacement",
      badge: "Dress Code Ready",
      description:
        "Took your photo wearing a casual t-shirt or pajamas? Switch to professional formal attire for men, women, and children with realistic collar alignment.",
      beforeImg: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80",
      afterImg: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80",
      beforeLabel: "Casual Everyday Clothing",
      afterLabel: "Professional Business Attire",
      specs: ["Male / Female / Kids Suits", "Natural Neck Fit", "No Wrinkles"],
    },
    print: {
      title: "Multi-Copy Photo Sheet for 4×6\" Printing",
      badge: "Save 90% Cost",
      description:
        "Instead of paying $15 at a pharmacy for two photos, generate a 4×6\" sheet with 6 copies and print it at Walgreens, CVS, Boots or any local kiosk for pennies.",
      beforeImg: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80",
      afterImg: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80",
      beforeLabel: "Single Passport Photo",
      afterLabel: "4×6\" Sheet (6 Grid Copies)",
      specs: ["Standard 4×6, 5×7, A4", "Scissors Cut Guides", "Lossless 300 DPI"],
    },
  };

  const currentCase = showcaseCases[activeTab];

  return (
    <section id="before-after" className="py-16 sm:py-24 bg-slate-50/70 border-y border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            Real Results Preview
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            See the AI Transformation in Action
          </h2>
          <p className="mt-3 text-base sm:text-lg text-slate-600">
            From an everyday smartphone selfie to an embassy-ready biometric photograph in seconds.
          </p>

          {/* Tab Selector */}
          <div className="mt-8 inline-flex p-1 rounded-2xl bg-slate-200/80 border border-slate-300/60 max-w-md w-full">
            <button
              type="button"
              onClick={() => setActiveTab("background")}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-all ${
                activeTab === "background"
                  ? "bg-white text-blue-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Scissors className="w-4 h-4" />
              <span>Background</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("suit")}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-all ${
                activeTab === "suit"
                  ? "bg-white text-blue-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Shirt className="w-4 h-4" />
              <span>Suit Swap</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("print")}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-all ${
                activeTab === "print"
                  ? "bg-white text-blue-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Grid className="w-4 h-4" />
              <span>Print Sheet</span>
            </button>
          </div>
        </div>

        {/* Comparison Showcase Container */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-6 sm:p-10">
          {/* Left Column: Interactive Split Comparison Card */}
          <div className="lg:col-span-7 flex flex-col items-center">
            <div className="relative w-full max-w-md aspect-4/5 rounded-2xl overflow-hidden border-2 border-slate-200 shadow-md select-none bg-slate-100">
              {/* After Image (Full background) */}
              <img
                src={currentCase.afterImg}
                alt={currentCase.afterLabel}
                className="absolute inset-0 w-full h-full object-cover"
              />

              {/* Before Image (Clipped by slider position) */}
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${sliderPosition}%` }}
              >
                <img
                  src={currentCase.beforeImg}
                  alt={currentCase.beforeLabel}
                  className="absolute inset-0 w-full h-full object-cover max-w-none"
                  style={{ width: "100%", height: "100%" }}
                />
                <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-semibold px-2.5 py-1 rounded-md shadow-sm">
                  {currentCase.beforeLabel}
                </div>
              </div>

              {/* After label on top right */}
              <div className="absolute top-4 right-4 bg-blue-600/90 backdrop-blur-xs text-white text-[11px] font-semibold px-2.5 py-1 rounded-md shadow-sm">
                {currentCase.afterLabel}
              </div>

              {/* Divider Line & Handle */}
              <div
                className="absolute top-0 bottom-0 w-1 bg-white shadow-lg pointer-events-none"
                style={{ left: `${sliderPosition}%` }}
              >
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white border-2 border-blue-600 shadow-lg flex items-center justify-center">
                  <div className="flex gap-0.5">
                    <div className="w-0.5 h-3 bg-blue-600 rounded"></div>
                    <div className="w-0.5 h-3 bg-blue-600 rounded"></div>
                  </div>
                </div>
              </div>

              {/* Invisible interactive range input overlay */}
              <input
                type="range"
                min="0"
                max="100"
                value={sliderPosition}
                onChange={(e) => setSliderPosition(Number(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
                aria-label="Before and after slider"
              />
            </div>
            <p className="mt-3 text-xs text-slate-500 font-medium text-center">
              ↔ Drag the slider horizontally to compare before and after
            </p>
          </div>

          {/* Right Column: Key Details & Benefits */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-violet-100 text-violet-800 w-fit mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              {currentCase.badge}
            </div>

            <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
              {currentCase.title}
            </h3>

            <p className="mt-3 text-slate-600 text-sm sm:text-base leading-relaxed">
              {currentCase.description}
            </p>

            <div className="mt-6 space-y-2.5">
              {currentCase.specs.map((spec) => (
                <div key={spec} className="flex items-center gap-2.5 text-sm font-medium text-slate-800">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                  <span>{spec}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-4">
              <a
                href="#upload-card"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-sm shadow-md shadow-blue-500/20 transition-all"
              >
                <span>Try With Your Photo</span>
                <ArrowRight className="w-4 h-4" />
              </a>
              <span className="text-xs text-slate-500">Free preview • No signup needed</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

