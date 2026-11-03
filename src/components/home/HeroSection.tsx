import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sliders,
  Scissors,
  Printer,
  Maximize2,
  ScanFace,
  Layers,
} from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative pt-12 pb-16 sm:pt-16 sm:pb-24 overflow-hidden bg-[#0B0D12]">
      {/* Subtle background ambient radial light */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] pointer-events-none -z-10 opacity-40">
        <div className="absolute top-8 left-1/3 w-80 h-80 bg-[#8B7CFF]/15 rounded-full blur-[120px]" />
        <div className="absolute top-16 right-1/3 w-96 h-96 bg-[#34D399]/10 rounded-full blur-[140px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Hero Header */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#171B24] border border-[#292F3A] text-xs font-medium text-[#9CA3AF] mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#34D399]" />
            <span>PhotoMaze Studio · 100% Free Biometric Photography</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#F5F7FA] leading-[1.12]">
            Your perfect photo.{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8B7CFF] via-[#A78BFA] to-[#C4B5FD]">
              Powered by AI.
            </span>
          </h1>

          <p className="mt-5 text-base sm:text-lg lg:text-xl text-[#9CA3AF] max-w-2xl leading-relaxed">
            Create professional passport photos and studio portraits in minutes. Change backgrounds, refine clothing and prepare print-ready photographs.
          </p>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto">
            <Link
              href="/editor"
              prefetch={false}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold text-white bg-[#8B7CFF] hover:bg-[#7665F5] shadow-lg shadow-[#8B7CFF]/20 active:scale-[0.98] transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Create your photo</span>
              <ArrowRight className="w-4 h-4 -ml-0.5" />
            </Link>

            <a
              href="#features"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold text-[#F5F7FA] bg-[#171B24] hover:bg-[#1C2230] border border-[#292F3A] transition-colors"
            >
              <span>Explore features</span>
            </a>
          </div>

          {/* Trust Value Strip */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs font-medium text-[#697386]">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#34D399]" />
              <span className="text-[#9CA3AF]">Zero Paid APIs</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#34D399]" />
              <span className="text-[#9CA3AF]">300 DPI Print Density</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#34D399]" />
              <span className="text-[#9CA3AF]">100% In-Browser Privacy</span>
            </div>
          </div>
        </div>

        {/* Visual UI Preview of the PhotoMaze Editing Experience */}
        <div className="max-w-5xl mx-auto rounded-2xl bg-[#11141B] border border-[#292F3A] shadow-2xl shadow-black/80 overflow-hidden">
          {/* Top Window Bar */}
          <div className="h-10 bg-[#171B24] border-b border-[#292F3A] px-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#292F3A]" />
              <div className="w-3 h-3 rounded-full bg-[#292F3A]" />
              <div className="w-3 h-3 rounded-full bg-[#292F3A]" />
              <span className="ml-2 text-xs font-mono text-[#697386] hidden sm:inline">
                PhotoMaze Studio · 35×45mm @ 300 DPI
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#9CA3AF]">
              <span className="px-2 py-0.5 rounded bg-[#1C2230] text-[#34D399] font-medium border border-[#292F3A]">
                ICAO 9303 Pass
              </span>
            </div>
          </div>

          {/* 3-Panel Mockup Viewport */}
          <div className="grid grid-cols-1 md:grid-cols-12 min-h-[380px] bg-[#0B0D12]">
            {/* Left Mock Controls */}
            <div className="hidden md:flex md:col-span-3 border-r border-[#292F3A] bg-[#11141B] p-4 flex-col gap-3">
              <span className="text-[11px] uppercase font-semibold tracking-wider text-[#697386]">
                Editing Pipeline
              </span>
              <div className="p-2.5 rounded-lg bg-[#171B24] border border-[#8B7CFF]/40 flex items-center gap-2.5">
                <Scissors className="w-4 h-4 text-[#8B7CFF]" />
                <div className="text-left">
                  <div className="text-xs font-medium text-[#F5F7FA]">AI Background</div>
                  <div className="text-[10px] text-[#34D399]">Pure White Applied</div>
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-[#171B24] border border-[#292F3A] flex items-center gap-2.5">
                <ScanFace className="w-4 h-4 text-[#8B7CFF]" />
                <div className="text-left">
                  <div className="text-xs font-medium text-[#F5F7FA]">Biometric Framing</div>
                  <div className="text-[10px] text-[#9CA3AF]">74% Head Coverage</div>
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-[#171B24] border border-[#292F3A] flex items-center gap-2.5">
                <Sliders className="w-4 h-4 text-[#8B7CFF]" />
                <div className="text-left">
                  <div className="text-xs font-medium text-[#F5F7FA]">Studio Lighting</div>
                  <div className="text-[10px] text-[#9CA3AF]">Natural Balanced</div>
                </div>
              </div>
            </div>

            {/* Center Canvas Preview */}
            <div className="col-span-12 md:col-span-6 p-6 flex flex-col items-center justify-center relative bg-[#0B0D12]">
              <div className="relative w-52 sm:w-60 aspect-[35/45] rounded-xl overflow-hidden border-2 border-[#292F3A] shadow-2xl bg-white flex items-center justify-center">
                <Image
                  src="/samples/sample-man-whitebg.jpg"
                  alt="AI Passport Photo Output"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 240px, 260px"
                  priority
                />
                {/* Subtle Biometric Overlay Guide Line */}
                <div className="absolute inset-x-0 top-[28%] border-t border-dashed border-[#8B7CFF]/60 pointer-events-none" />
                <div className="absolute inset-x-0 bottom-[18%] border-b border-dashed border-[#8B7CFF]/60 pointer-events-none" />
                <div className="absolute inset-y-0 left-1/2 border-l border-dashed border-[#8B7CFF]/40 pointer-events-none" />
              </div>

              <div className="mt-4 flex items-center gap-2 text-xs text-[#9CA3AF]">
                <span className="w-2 h-2 rounded-full bg-[#34D399]" />
                <span>Original face preserved · Sub-pixel edges</span>
              </div>
            </div>

            {/* Right Mock Output Specs */}
            <div className="hidden md:flex md:col-span-3 border-l border-[#292F3A] bg-[#11141B] p-4 flex-col justify-between">
              <div>
                <span className="text-[11px] uppercase font-semibold tracking-wider text-[#697386]">
                  Print Specification
                </span>
                <div className="mt-3 space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-[#292F3A]">
                    <span className="text-[#9CA3AF]">Standard</span>
                    <span className="text-[#F5F7FA] font-medium">India Passport</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#292F3A]">
                    <span className="text-[#9CA3AF]">Physical</span>
                    <span className="text-[#F5F7FA] font-medium">35 × 45 mm</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#292F3A]">
                    <span className="text-[#9CA3AF]">Resolution</span>
                    <span className="text-[#F5F7FA] font-medium">413 × 531 px</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#292F3A]">
                    <span className="text-[#9CA3AF]">DPI</span>
                    <span className="text-[#34D399] font-medium">300 DPI</span>
                  </div>
                </div>
              </div>

              <Link
                href="/editor"
                prefetch={false}
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-[#8B7CFF] hover:bg-[#7665F5] text-xs font-semibold text-white transition-colors"
              >
                <span>Open in Studio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
