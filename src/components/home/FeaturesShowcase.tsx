import React from "react";
import {
  Scissors,
  ScanFace,
  Shirt,
  Sparkles,
  Grid,
  FileDown,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

export function FeaturesShowcase() {
  const features = [
    {
      icon: Scissors,
      title: "1-Click AI Background Removal",
      badge: "AI Powered",
      description:
        "Sub-pixel alpha matting cleanly isolates fine hair, ear contours, and shoulder edges. Instantly replaces background with compliant pure white, light gray, blue, or red.",
      points: ["Clean fine hair isolation", "Shadow & artifact elimination", "Complies with strict embassy rules"],
      color: "from-blue-600 to-cyan-500",
      accent: "bg-blue-50 text-blue-700 border-blue-200",
    },
    {
      icon: ScanFace,
      title: "ICAO Biometric Auto-Crop",
      badge: "Standardized",
      description:
        "Built-in face detection aligns eye height to 55%-65% of the frame and locks head height to exactly 70%-80% according to ICAO Document 9303 standards.",
      points: ["Automatic eye-level leveling", "Chin-to-crown ratio enforcement", "Prevents online portal rejection"],
      color: "from-indigo-600 to-blue-500",
      accent: "bg-indigo-50 text-indigo-700 border-indigo-200",
    },
    {
      icon: Shirt,
      title: "AI Suit & Formal Clothing Changer",
      badge: "Cutout.pro Feature",
      description:
        "No need to change into formal clothes before taking your selfie. Choose from dozens of modern business suits, collared shirts, and blazers tailored for men, women, and children.",
      points: ["Men's & Women's formal suits", "Children's collared attire", "Natural neck & collar fitting"],
      color: "from-violet-600 to-indigo-500",
      accent: "bg-violet-50 text-violet-700 border-violet-200",
    },
    {
      icon: Sparkles,
      title: "300 DPI Ultra-HD Enhancement",
      badge: "Print Ready",
      description:
        "Low-light smartphone selfies are automatically upscaled to 300 DPI with smart noise suppression and tone balancing without modifying biometric facial anatomy.",
      points: ["Lossless 300 DPI output", "Shadow reduction on face", "Natural skin tone preservation"],
      color: "from-purple-600 to-pink-500",
      accent: "bg-purple-50 text-purple-700 border-purple-200",
    },
    {
      icon: Grid,
      title: "Custom Photo Sheet Printing Engine",
      badge: "Core Feature",
      description:
        "Print multiple passport copies on standard photo paper (4×6\", 5×7\", 6×8\", A4, Letter). Pack 4, 6, 8, or 12 photos on one sheet with scissors cut guides.",
      points: ["Standard 4×6\" photo card size", "Adjustable spacing & margins", "Print at Walgreens, CVS, or home"],
      color: "from-emerald-600 to-teal-500",
      accent: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    {
      icon: FileDown,
      title: "Dual Export: Web JPEG & Print PDF",
      badge: "Versatile",
      description:
        "Download digital photos optimized under 240 KB for online passport submissions, plus vector-crisp PDF documents calibrated for exact millimeter printing.",
      points: ["Portal-ready JPEG (<240 KB)", "Lossless PNG with transparency", "High-res PDF with exact mm scale"],
      color: "from-amber-500 to-orange-500",
      accent: "bg-amber-50 text-amber-700 border-amber-200",
    },
  ];

  return (
    <section id="features" className="py-16 sm:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            Professional AI Capabilities
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Engineered for 100% Official Compliance
          </h2>
          <p className="mt-3 text-base sm:text-lg text-slate-600">
            Everything you need to create, verify, enhance, and print biometric identification photos.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-sm hover:shadow-lg hover:border-blue-300 transition-all duration-200 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${feature.color} flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <span
                      className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${feature.accent}`}
                    >
                      {feature.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed mb-5">
                    {feature.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-2">
                  {feature.points.map((point) => (
                    <div key={point} className="flex items-center gap-2 text-xs font-medium text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

