import React from "react";
import {
  Scissors,
  ScanFace,
  Shirt,
  Sparkles,
  ShieldCheck,
  Printer,
  FileCheck,
  CheckCircle2,
} from "lucide-react";

export function FeaturesShowcase() {
  const benefits = [
    {
      icon: Scissors,
      title: "AI-Powered Photo Editing",
      description:
        "Sub-pixel neural matting isolates subject hair and contours. Instantly separates foreground from complex backgrounds with zero manual tracing.",
      tags: ["Local Segmentation", "Hair Edge Matting"],
    },
    {
      icon: ScanFace,
      title: "Passport-Ready Dimensions",
      description:
        "Calculated against 100+ government standards. Automatically verifies 70-80% chin-to-crown coverage and horizontal facial midline alignment.",
      tags: ["Indian 35×45mm", "US 2×2 Inch", "Schengen 35×45mm"],
    },
    {
      icon: Shirt,
      title: "Studio Portrait Transformation",
      description:
        "Convert casual selfies into professional studio portraits. Apply formal dark business suits and subtle, calibrated portrait lighting retouching.",
      tags: ["Men's & Women's Suits", "Lighting Calibration"],
    },
    {
      icon: Sparkles,
      title: "Background Customization",
      description:
        "Choose official embassy colors: pure white, light gray, royal blue, or crimson red. Export transparent cutouts for graphic design workflows.",
      tags: ["Official White", "Light Gray", "Transparent PNG"],
    },
    {
      icon: ShieldCheck,
      title: "Privacy-Conscious Processing",
      description:
        "Your photographs never leave your device. Computer vision and neural inference run client-side using WebGPU and WebAssembly.",
      tags: ["Zero Cloud Uploads", "Zero Tracking", "100% Private"],
    },
    {
      icon: Printer,
      title: "Print-Ready Downloads",
      description:
        "Download single 300 DPI high-density JPEGs or generate multi-photo 4×6 and A4 printable sheets complete with corner cutting guidelines.",
      tags: ["300 DPI Export", "4×6 Print Sheets", "Printable PDF"],
    },
  ];

  return (
    <section id="features" className="py-20 sm:py-28 bg-[#0B0D12] border-t border-[#292F3A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#8B7CFF] mb-2 block">
            Capabilities & Standards
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#F5F7FA]">
            Built for Official Biometric Compliance
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#9CA3AF]">
            Everything required to generate government-accepted passport and visa photographs without costly photography studios.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="rounded-2xl bg-[#11141B] border border-[#292F3A] p-6 hover:border-[#3B4352] transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-[#171B24] border border-[#292F3A] flex items-center justify-center text-[#8B7CFF] mb-5">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-semibold text-[#F5F7FA] mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#9CA3AF] leading-relaxed mb-6">
                    {item.description}
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-4 border-t border-[#292F3A]">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-md bg-[#171B24] text-[11px] font-medium text-[#9CA3AF] border border-[#292F3A]"
                    >
                      {tag}
                    </span>
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
