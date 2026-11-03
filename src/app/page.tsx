import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { HeroSection } from "@/components/home/HeroSection";
import { BeforeAfterShowcase } from "@/components/home/BeforeAfterShowcase";
import { HowItWorksSection } from "@/components/home/HowItWorksSection";
import { FeaturesShowcase } from "@/components/home/FeaturesShowcase";
import { SupportedCountriesSection } from "@/components/home/SupportedCountriesSection";
import { PricingSection } from "@/components/home/PricingSection";
import { FAQSection } from "@/components/home/FAQSection";
import { Footer } from "@/components/layout/Footer";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* 1. Sticky Navigation Bar */}
      <Navbar />

      {/* Main Content Sections */}
      <main className="flex-1">
        {/* 2. Hero Section with Interactive Upload Interface */}
        <HeroSection />

        {/* 3. Interactive Before-and-After Showcase */}
        <BeforeAfterShowcase />

        {/* 4. How It Works 4-Step Guide */}
        <HowItWorksSection />

        {/* 5. Comprehensive Feature Breakdown */}
        <FeaturesShowcase />

        {/* 6. Supported Country Specifications & Search */}
        <SupportedCountriesSection />

        {/* 7. Transparent Pricing & Guarantees */}
        <PricingSection />

        {/* 8. Frequently Asked Questions Accordion */}
        <FAQSection />
      </main>

      {/* 9. Site Footer */}
      <Footer />
    </div>
  );
}
