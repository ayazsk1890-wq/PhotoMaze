import React from "react";
import Link from "next/link";
import { CheckCircle2, Sparkles, ArrowRight, ShieldCheck, HeartHandshake } from "lucide-react";

export function PricingSection() {
  const guarantees = [
    "100% Free Forever with Zero Paywalls",
    "No Credits, Subscriptions, or Hidden Fees",
    "No Watermarks on Downloaded Photos",
    "Full High-Resolution 300 DPI Export",
    "Unlimited Digital Photos & Printable Sheets",
    "Zero Registration or Account Required to Create",
  ];

  return (
    <section id="free-guarantee" className="py-20 sm:py-28 bg-[#0B0D12] border-t border-[#292F3A]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-[#11141B] border border-[#292F3A] p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          {/* Subtle accent glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#8B7CFF]/10 rounded-full blur-[120px] pointer-events-none" />

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#171B24] border border-[#292F3A] text-xs font-semibold text-[#34D399] mb-4">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Public Service Photography · 100% Free</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#F5F7FA]">
              No Paywalls. No Subscriptions.
            </h2>

            <p className="mt-4 text-sm sm:text-base text-[#9CA3AF] leading-relaxed">
              PhotoMaze is 100% Free forever for everyone. Commercial passport websites routinely charge $10 to $20 per photo download. PhotoMaze executes machine vision models directly in your browser, eliminating server GPU fees and keeping passport creation completely free for everyone.
            </p>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {guarantees.map((item) => (
                <div key={item} className="flex items-center gap-2.5 text-xs sm:text-sm text-[#F5F7FA]">
                  <CheckCircle2 className="w-4 h-4 text-[#34D399] flex-shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
              <Link
                href="/editor"
                prefetch={false}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold text-white bg-[#8B7CFF] hover:bg-[#7665F5] transition-colors shadow-lg shadow-[#8B7CFF]/25 active:scale-[0.98]"
              >
                <Sparkles className="w-4 h-4" />
                <span>Create Your Photo Now</span>
                <ArrowRight className="w-4 h-4 -ml-0.5" />
              </Link>

              <span className="text-xs text-[#697386]">
                Instant start · No email or credit card needed
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
