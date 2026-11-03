import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { HeroSection } from "@/components/home/HeroSection";
import { UploadDropzoneCard } from "@/components/home/UploadDropzoneCard";
import { FeaturesShowcase } from "@/components/home/FeaturesShowcase";
import { HowItWorksSection } from "@/components/home/HowItWorksSection";
import { BeforeAfterShowcase } from "@/components/home/BeforeAfterShowcase";
import { SupportedCountriesSection } from "@/components/home/SupportedCountriesSection";
import { PricingSection } from "@/components/home/PricingSection";
import { FAQSection } from "@/components/home/FAQSection";
import { Footer } from "@/components/layout/Footer";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0B0D12] text-[#F5F7FA] flex flex-col selection:bg-[#8B7CFF]/30 selection:text-white">
      {/* 1. Sticky Navigation Bar */}
      <Navbar />

      {/* Main Content Sections */}
      <main className="flex-1">
        {/* 2. Hero Section */}
        <HeroSection />

        {/* 3. Interactive Upload & Persona Studio Dropzone */}
        <section className="py-8 pb-16 bg-[#0B0D12]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <UploadDropzoneCard />
          </div>
        </section>

        {/* 4. Core Features & Biometric Standards */}
        <FeaturesShowcase />

        {/* 5. 3-Step Guided Workflow */}
        <HowItWorksSection />

        {/* 6. Interactive Before & After Split Showcase */}
        <BeforeAfterShowcase />

        {/* 7. Searchable Country Standards Database */}
        <SupportedCountriesSection />

        {/* 8. 100% Free Guarantee Section */}
        <PricingSection />

        {/* 9. Frequently Asked Questions Accordion */}
        <FAQSection />
      </main>

      {/* 10. Site Footer */}
      <Footer />
    </div>
  );
}
