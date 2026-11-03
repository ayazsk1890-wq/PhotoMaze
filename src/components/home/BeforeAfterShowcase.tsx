"use client";

import React, { useState } from "react";
import { Check, Sparkles, Scissors, Shirt, Grid } from "lucide-react";
import Image from "next/image";

export function BeforeAfterShowcase() {
  const [activeTab, setActiveTab] = useState<"background" | "suit" | "hijab">("background");
  const [sliderPosition, setSliderPosition] = useState(50);

  const showcaseCases = {
    background: {
      title: "AI Background Isolation & Pure White",
      description:
        "Strips away distracting domestic backgrounds, wall shadows, and uneven ambient lighting, replacing them with a compliant solid white background.",
      beforeImg: "/samples/sample-man.jpg",
      afterImg: "/samples/sample-man-whitebg.jpg",
      beforeLabel: "Original Upload",
      afterLabel: "Pure White Cutout",
      specs: ["100% Solid White", "Shadow-Free", "Hair Edge Matting"],
    },
    suit: {
      title: "Formal Business Attire Replacement",
      description:
        "Transforms everyday casual clothing into official navy or charcoal formal suits with realistic neck and collar alignment.",
      beforeImg: "/samples/sample-man-whitebg.jpg",
      afterImg: "/samples/sample-man-suit.jpg",
      beforeLabel: "Casual Clothing",
      afterLabel: "Business Attire",
      specs: ["Navy Blue Suit", "Natural Collar Fit", "Embassy Approved"],
    },
    hijab: {
      title: "Religious Headwear Compliance (ICAO 9303)",
      description:
        "Ensures complete facial oval visibility from chin to forehead with zero shadow cast, fulfilling international travel document rules.",
      beforeImg: "/samples/sample-hijab.jpg",
      afterImg: "/samples/sample-hijab.jpg",
      beforeLabel: "Uploaded Portrait",
      afterLabel: "Biometric Oval Framed",
      specs: ["ICAO Doc 9303", "Facial Oval Clear", "Forehead to Chin Uncovered"],
    },
  };

  const currentCase = showcaseCases[activeTab];

  return (
    <section id="before-after" className="py-20 sm:py-28 bg-[#0B0D12] border-t border-[#292F3A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#8B7CFF] mb-2 block">
            Visual Quality Preview
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#F5F7FA]">
            Sub-Pixel Transformation
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#9CA3AF]">
            Drag the slider to inspect edge retention and background isolation quality.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center justify-center gap-2 mb-10">
          <div className="inline-flex p-1 rounded-xl bg-[#171B24] border border-[#292F3A]">
            <button
              type="button"
              onClick={() => setActiveTab("background")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === "background"
                  ? "bg-[#8B7CFF] text-white shadow-sm"
                  : "text-[#9CA3AF] hover:text-[#F5F7FA]"
              }`}
            >
              <Scissors className="w-3.5 h-3.5" />
              <span>Background</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("suit")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === "suit"
                  ? "bg-[#8B7CFF] text-white shadow-sm"
                  : "text-[#9CA3AF] hover:text-[#F5F7FA]"
              }`}
            >
              <Shirt className="w-3.5 h-3.5" />
              <span>Formal Suit</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("hijab")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === "hijab"
                  ? "bg-[#8B7CFF] text-white shadow-sm"
                  : "text-[#9CA3AF] hover:text-[#F5F7FA]"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Headwear (ICAO)</span>
            </button>
          </div>
        </div>

        {/* Comparison Showcase Container */}
        <div className="max-w-4xl mx-auto rounded-2xl bg-[#11141B] border border-[#292F3A] p-6 sm:p-8 shadow-xl shadow-black/60">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Split Slider Preview */}
            <div className="lg:col-span-7 flex justify-center">
              <div
                className="relative w-64 sm:w-72 aspect-[35/45] rounded-xl overflow-hidden border border-[#292F3A] shadow-2xl select-none cursor-ew-resize bg-black"
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
                  setSliderPosition(Math.round((x / rect.width) * 100));
                }}
                onTouchMove={(e) => {
                  if (e.touches.length > 0) {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = Math.max(0, Math.min(e.touches[0].clientX - rect.left, rect.width));
                    setSliderPosition(Math.round((x / rect.width) * 100));
                  }
                }}
              >
                {/* Background Image (After) */}
                <Image
                  src={currentCase.afterImg}
                  alt={currentCase.afterLabel}
                  fill
                  className="object-cover"
                  sizes="300px"
                  priority
                />

                {/* Clipped Foreground Image (Before) */}
                <div
                  className="absolute inset-y-0 left-0 overflow-hidden"
                  style={{ width: `${sliderPosition}%` }}
                >
                  <div className="relative w-64 sm:w-72 aspect-[35/45] h-full">
                    <Image
                      src={currentCase.beforeImg}
                      alt={currentCase.beforeLabel}
                      fill
                      className="object-cover"
                      sizes="300px"
                      priority
                    />
                  </div>
                </div>

                {/* Divider Line */}
                <div
                  className="absolute inset-y-0 w-0.5 bg-white shadow-lg pointer-events-none"
                  style={{ left: `${sliderPosition}%` }}
                >
                  <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-white text-slate-900 flex items-center justify-center text-[10px] font-bold shadow-md">
                    ⇄
                  </div>
                </div>

                {/* Floating Badges */}
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-sm text-[10px] text-white font-medium pointer-events-none">
                  {currentCase.beforeLabel}
                </div>
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-[#8B7CFF]/80 backdrop-blur-sm text-[10px] text-white font-medium pointer-events-none">
                  {currentCase.afterLabel}
                </div>
              </div>
            </div>

            {/* Case Details */}
            <div className="lg:col-span-5 flex flex-col justify-center">
              <h3 className="text-lg font-bold text-[#F5F7FA] mb-2">
                {currentCase.title}
              </h3>
              <p className="text-xs sm:text-sm text-[#9CA3AF] leading-relaxed mb-6">
                {currentCase.description}
              </p>

              <div className="space-y-2 mb-6">
                {currentCase.specs.map((spec) => (
                  <div key={spec} className="flex items-center gap-2 text-xs text-[#F5F7FA]">
                    <div className="w-4 h-4 rounded-full bg-[#171B24] border border-[#292F3A] flex items-center justify-center text-[#34D399]">
                      <Check className="w-2.5 h-2.5" />
                    </div>
                    <span>{spec}</span>
                  </div>
                ))}
              </div>

              <div className="p-3 rounded-xl bg-[#171B24] border border-[#292F3A] text-xs text-[#9CA3AF]">
                <span className="font-semibold text-[#F5F7FA]">Hint: </span>
                Click and drag across the image preview to compare before and after results.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
