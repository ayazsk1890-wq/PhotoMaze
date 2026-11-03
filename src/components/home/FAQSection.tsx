"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "Are these photos designed for official passport and visa submissions?",
      answer:
        "Yes. PhotoMaze is calibrated to adhere to international ICAO Document 9303 biometric parameters, including 35×45mm or 2×2 inch millimeter geometry, 70% to 80% chin-to-crown head ratios, eye plane horizontal alignment, and solid white or off-white backgrounds. Final acceptance always remains subject to the discretion of the issuing government authority or consular officer.",
    },
    {
      question: "How should I capture my photograph for best results?",
      answer:
        "Stand 4 to 6 feet away in an evenly lit room without strong shadows behind your ears or neck. Keep a neutral facial expression with mouth closed and eyes looking straight into the lens. Ensure hair does not obscure your eyes, eyebrows, or face contours.",
    },
    {
      question: "What are the rules regarding spectacles and head coverings?",
      answer:
        "Most passport authorities (including the US and India) require eyeglasses to be removed to prevent glare and frame shadows. For religious head coverings (such as hijabs or turbans), the full oval of the face from chin bottom to forehead top must remain completely unobstructed without shadows.",
    },
    {
      question: "How do I print the 4×6 inch photo sheet?",
      answer:
        "Download the 4×6 inch (10×15 cm) print sheet containing 6 copies. Save it to your phone or flash drive and print it as a standard 4×6 photo print at any local pharmacy kiosk or home photo printer for pennies. Use scissors to cut along the corner guidelines.",
    },
    {
      question: "Is PhotoMaze truly 100% free with no hidden charges?",
      answer:
        "Yes, 100% free forever. There are no subscriptions, credits, watermarks, or paywalls. All AI image processing occurs locally in your web browser, which eliminates server compute expenses and allows us to offer the service without cost.",
    },
    {
      question: "Is my personal photo uploaded to external cloud servers?",
      answer:
        "No. PhotoMaze runs neural segmentation, biometric cropping, and portrait retouching locally in your browser using WebGPU and WebAssembly. Your photos stay strictly on your device.",
    },
  ];

  return (
    <section id="faq" className="py-20 sm:py-28 bg-[#0B0D12] border-t border-[#292F3A]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#8B7CFF] mb-2 block">
            Got Questions?
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#F5F7FA]">
            Frequently Asked Questions
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#9CA3AF]">
            Everything you need to know about biometric standards, printing, and privacy.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={faq.question}
                className="rounded-2xl bg-[#11141B] border border-[#292F3A] overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full flex items-center justify-between p-5 text-left transition-colors hover:bg-[#171B24]"
                >
                  <span className="text-sm sm:text-base font-semibold text-[#F5F7FA] pr-4">
                    {faq.question}
                  </span>
                  <div
                    className={`w-6 h-6 rounded-lg bg-[#171B24] border border-[#292F3A] flex items-center justify-center text-[#9CA3AF] transition-transform duration-200 flex-shrink-0 ${
                      isOpen ? "rotate-180 text-[#8B7CFF]" : ""
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-[#9CA3AF] leading-relaxed border-t border-[#292F3A]/60">
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
