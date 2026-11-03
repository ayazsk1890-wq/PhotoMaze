"use client";

import React from "react";
import { Check, Sparkles, ShieldCheck, HeartHandshake, Lock, Printer, ArrowRight } from "lucide-react";

export function PricingSection() {
  const freePillars = [
    {
      title: "100% Free Forever",
      description: "No subscription, no paid credits, no paywalls, and no hidden fees. All passport photo features are completely free to use.",
      icon: HeartHandshake,
      color: "from-blue-600 to-indigo-600",
    },
    {
      title: "Private & On-Device",
      description: "Background removal and face biometric detection run directly inside your browser. Your private photos never leave your device without your consent.",
      icon: Lock,
      color: "from-indigo-600 to-violet-600",
    },
    {
      title: "No Watermarks or Limits",
      description: "Export high-resolution 300 DPI JPEGs, PNG cutouts, and multi-page vector PDFs with zero watermarks and zero download restrictions.",
      icon: Sparkles,
      color: "from-violet-600 to-fuchsia-600",
    },
    {
      title: "Bulk Printing Sheets",
      description: "Generate A4, 4×6, 5×7, Letter, and custom printable sheets with cutting guides for easy printing at home or any local print shop.",
      icon: Printer,
      color: "from-emerald-600 to-teal-600",
    },
  ];

  const features = [
    "Indian 35×45 mm & 51×51 mm official passport presets",
    "100+ Global country passport & visa specifications",
    "On-device AI background removal (pure white & solid colors)",
    "Biometric face auto-centering & eye-plane alignment",
    "Portrait enhancement (lighting, clarity, retouching)",
    "Government portal size optimization (<240 KB for online portals)",
    "A4, 4×6, 5×7, 6×8, Letter, Legal multi-page print sheets",
    "Vector PDF with millimeter-accurate PostScript dimensions",
    "Guest mode & local project saving with zero sign-up required",
  ];

  return (
    <section id="free-guarantee" className="py-16 sm:py-24 bg-gradient-to-b from-slate-50 to-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold tracking-wide uppercase mb-4">
            <HeartHandshake className="w-4 h-4 text-emerald-600" />
            <span>Our Free-First Commitment</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
            PhotoMaze is <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600">100% Free</span> to Use
          </h2>

          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
            Professional passport and visa photos shouldn't cost a fortune. PhotoMaze provides high-precision biometric editing, background removal, and printable sheets completely free of charge.
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {freePillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.title}
                className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow relative"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${pillar.color} flex items-center justify-center text-white mb-4 shadow-md`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg text-slate-900 mb-2">{pillar.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{pillar.description}</p>
              </div>
            );
          })}
        </div>

        {/* Feature Checklist Card */}
        <div className="bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center relative z-10">
            <div className="lg:col-span-1 space-y-4">
              <span className="text-xs font-extrabold uppercase px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Everything Included Free
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                No Paywalls. No Subscriptions. Just Great Photos.
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Take a selfie, let PhotoMaze auto-align and remove the background, and print your photos right from your desktop or phone.
              </p>
              <div className="pt-2">
                <a
                  href="#upload-card"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-slate-950 bg-white hover:bg-slate-100 shadow-md active:scale-95 transition-all"
                >
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span>Create Your Free Photo</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>

            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {features.map((feat) => (
                <div key={feat} className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-sm">
                  <div className="p-1 rounded-md bg-emerald-500/20 text-emerald-400 shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs sm:text-sm text-slate-200 font-medium">{feat}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Disclaimer Note */}
        <div className="mt-8 text-center text-xs text-slate-500 max-w-2xl mx-auto">
          <p>
            * PhotoMaze provides automated photo formatting and dimension guidance. Always confirm your specific application centre&apos;s physical photograph submission requirements before applying.
          </p>
        </div>
      </div>
    </section>
  );
}
