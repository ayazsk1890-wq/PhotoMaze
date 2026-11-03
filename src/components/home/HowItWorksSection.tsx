import React from "react";
import { UploadCloud, Globe2, Sparkles, Printer, ArrowRight } from "lucide-react";

export function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      title: "Upload Any Portrait",
      description:
        "Take a quick selfie against any wall or upload an existing photo from your phone or desktop. No studio lighting needed.",
      icon: UploadCloud,
      color: "from-blue-500 to-blue-600",
      accentBg: "bg-blue-50 text-blue-600 border-blue-200",
    },
    {
      number: "02",
      title: "Select Country & Doc",
      description:
        "Choose from 100+ countries (USA, UK, India, Schengen, Canada, etc.). The system loads official biometric dimensions instantly.",
      icon: Globe2,
      color: "from-indigo-500 to-indigo-600",
      accentBg: "bg-indigo-50 text-indigo-600 border-indigo-200",
    },
    {
      number: "03",
      title: "AI Enhances & Aligns",
      description:
        "Our AI strips the background, levels the eye plane, centers your face, and optionally changes your casual clothes into a formal suit.",
      icon: Sparkles,
      color: "from-violet-500 to-violet-600",
      accentBg: "bg-violet-50 text-violet-600 border-violet-200",
    },
    {
      number: "04",
      title: "Download & Print",
      description:
        "Get a web-ready digital photo under 240 KB for online portals, plus a ready-to-print 4×6\" sheet with multiple copies.",
      icon: Printer,
      color: "from-emerald-500 to-emerald-600",
      accentBg: "bg-emerald-50 text-emerald-600 border-emerald-200",
    },
  ];

  return (
    <section id="how-it-works" className="py-16 sm:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
            Simple 4-Step Process
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            How to Create Your Biometric Photo
          </h2>
          <p className="mt-3 text-base sm:text-lg text-slate-600">
            No graphic design skills required. Get embassy-accepted passport photos from your sofa in under a minute.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="relative bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm hover:shadow-md hover:border-blue-400 transition-all duration-200 group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${step.color} flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-2xl font-black text-slate-200 group-hover:text-blue-500 transition-colors">
                      {step.number}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center text-xs font-semibold text-slate-400 group-hover:text-blue-600 transition-colors">
                  <span>Step {idx + 1} of 4</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA Box */}
        <div className="mt-14 max-w-3xl mx-auto bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 rounded-2xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h4 className="text-xl font-bold">Ready to try it for yourself?</h4>
            <p className="text-blue-100 text-sm mt-1">
              Upload your photo and preview the results free of charge.
            </p>
          </div>
          <a
            href="#upload-card"
            className="px-6 py-3 rounded-xl bg-white text-blue-700 font-bold text-sm shadow-md hover:bg-blue-50 active:scale-95 transition-all flex-shrink-0"
          >
            Create My Photo Now
          </a>
        </div>
      </div>
    </section>
  );
}

