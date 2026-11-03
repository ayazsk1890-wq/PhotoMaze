import React from "react";
import { UploadCloud, Sliders, Download, ArrowRight } from "lucide-react";
import Link from "next/link";

export function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      title: "Upload your photograph",
      description:
        "Take a smartphone photo against any wall or upload an existing portrait. Our validator ensures adequate pixel resolution for 300 DPI output.",
      icon: UploadCloud,
    },
    {
      number: "02",
      title: "Customize and process with AI",
      description:
        "Choose your target country standard, customize background colors, add professional business attire, and adjust lighting with sub-pixel precision.",
      icon: Sliders,
    },
    {
      number: "03",
      title: "Download your finished photograph",
      description:
        "Receive your 300 DPI government-compliant digital portrait or multi-copy printable sheets ready for instant printing at home or pharmacy kiosks.",
      icon: Download,
    },
  ];

  return (
    <section id="how-it-works" className="py-20 sm:py-28 bg-[#0B0D12] border-t border-[#292F3A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#8B7CFF] mb-2 block">
            Simple 3-Step Process
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#F5F7FA]">
            How PhotoMaze Works
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#9CA3AF]">
            Generate professional biometric passport and ID photographs from your browser in under two minutes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="rounded-2xl bg-[#11141B] border border-[#292F3A] p-7 flex flex-col justify-between relative group hover:border-[#3B4352] transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-xl bg-[#171B24] border border-[#292F3A] flex items-center justify-center text-[#8B7CFF]">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-2xl font-mono font-bold text-[#697386]">
                      {step.number}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-semibold text-[#F5F7FA] mb-2">
                    {step.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#9CA3AF] leading-relaxed">
                    {step.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#292F3A] flex items-center text-xs font-medium text-[#8B7CFF]">
                  <span>Step {index + 1} of 3</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/editor"
            prefetch={false}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-white bg-[#8B7CFF] hover:bg-[#7665F5] transition-colors shadow-lg shadow-[#8B7CFF]/20"
          >
            <span>Start Creating Now</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
