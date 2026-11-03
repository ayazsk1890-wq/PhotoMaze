"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "Will these photos be accepted by official passport offices and embassies?",
      answer:
        "Yes, absolutely. Our system is rigorously programmed to adhere to ICAO Document 9303 and ISO/IEC 19794-5 biometric international standards. We enforce exact millimeter dimensions, correct chin-to-crown head ratios (typically 70%-80%), centered eye levels, and compliant solid backdrops (pure white or off-white depending on the country). We back this with a 100% acceptance guarantee.",
    },
    {
      question: "How should I take my selfie for the best results?",
      answer:
        "Stand about 4 to 6 feet away from the camera in a room with even, balanced lighting. Keep a neutral facial expression (closed mouth, natural eyes looking directly at the camera lens). Remove eyeglasses to prevent glare or frame shadow, and ensure hair does not cover your eyes, eyebrows, or face contours.",
    },
    {
      question: "How do I print the 4×6\" photo sheet at a local pharmacy or photo kiosk?",
      answer:
        "When you download the 4×6\" (10×15 cm) print sheet, save it to your phone or USB drive. Take it to any photo kiosk (such as Walgreens, CVS, Walmart, Boots, or a local photo studio) and print it as a standard 4×6\" photographic print (usually costs $0.35 or ₹5-₹10). Then use scissors to cut along the dotted guide lines to obtain 6 perfectly sized passport photos.",
    },
    {
      question: "What file formats and image resolutions will I receive?",
      answer:
        "You receive both a single digital photo (high-resolution PNG and compressed JPEG under 240 KB calibrated for online visa portal uploads like the US CEAC or Indian Passport Seva portal) and a print-ready vector PDF / 300 DPI image sheet for physical printing.",
    },
    {
      question: "How does the AI formal suit changer work?",
      answer:
        "If you took your photo in casual home clothes, our AI clothing replacement tool detects your neck and collar boundaries, removes the casual clothing, and seamlessly fits high-resolution formal suits, collared dress shirts, or blazers for men, women, and children.",
    },
    {
      question: "Is PhotoMaze really 100% free to use?",
      answer:
        "Yes, absolutely. PhotoMaze is completely free. You can edit unlimited photos, remove backgrounds, crop to official dimensions, generate printable sheets, and download high-resolution 300 DPI files with zero watermarks, zero subscriptions, and zero sign-up required.",
    },
  ];

  return (
    <section id="faq" className="py-16 sm:py-24 bg-slate-50/70 border-t border-slate-200/80">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            Got Questions?
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="mt-3 text-base sm:text-lg text-slate-600">
            Everything you need to know about taking, generating, and printing passport photos.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={faq.question}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden transition-all duration-200"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 font-bold text-slate-900 hover:text-blue-600 transition-colors"
                >
                  <span className="text-base sm:text-lg">{faq.question}</span>
                  <div
                    className={`w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180 bg-blue-50 text-blue-600" : "text-slate-500"
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-6 sm:px-6 text-sm sm:text-base text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

