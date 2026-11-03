"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, Globe2, ArrowRight } from "lucide-react";
import { POPULAR_PASSPORT_SPECS } from "@/lib/constants/countries";

export function SupportedCountriesSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("all");

  const countryDatabase = [
    ...POPULAR_PASSPORT_SPECS,
    {
      id: "de-passport",
      country: "Germany",
      countryCode: "DE",
      documentType: "Passport" as const,
      widthMm: 35,
      heightMm: 45,
      widthPx300Dpi: 413,
      heightPx300Dpi: 531,
      backgroundColor: "light-gray" as const,
      headMinPercentage: 0.7,
      headMaxPercentage: 0.8,
      aspectRatio: "35:45",
      region: "europe",
      notes: "Biometric passport standard. Light gray background.",
    },
    {
      id: "fr-passport",
      country: "France",
      countryCode: "FR",
      documentType: "Passport" as const,
      widthMm: 35,
      heightMm: 45,
      widthPx300Dpi: 413,
      heightPx300Dpi: 531,
      backgroundColor: "light-blue" as const,
      headMinPercentage: 0.7,
      headMaxPercentage: 0.8,
      aspectRatio: "35:45",
      region: "europe",
      notes: "Light blue or light gray background. No white background.",
    },
    {
      id: "sg-passport",
      country: "Singapore",
      countryCode: "SG",
      documentType: "Passport" as const,
      widthMm: 35,
      heightMm: 45,
      widthPx300Dpi: 413,
      heightPx300Dpi: 531,
      backgroundColor: "white" as const,
      headMinPercentage: 0.7,
      headMaxPercentage: 0.8,
      aspectRatio: "35:45",
      region: "asia",
      notes: "ICAO standard. Pure white background.",
    },
    {
      id: "ae-visa",
      country: "United Arab Emirates",
      countryCode: "AE",
      documentType: "Visa" as const,
      widthMm: 40,
      heightMm: 60,
      widthPx300Dpi: 472,
      heightPx300Dpi: 709,
      backgroundColor: "white" as const,
      headMinPercentage: 0.7,
      headMaxPercentage: 0.8,
      aspectRatio: "40:60",
      region: "asia",
      notes: "UAE Entry Permit & Residence Visa. Pure white background.",
    },
  ];

  const filteredCountries = countryDatabase.filter((spec) => {
    const matchesSearch =
      spec.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
      spec.documentType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      spec.countryCode.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRegion =
      selectedRegion === "all" ||
      ("region" in spec && (spec as any).region === selectedRegion);

    return matchesSearch && matchesRegion;
  });

  return (
    <section id="countries" className="py-20 sm:py-28 bg-[#0B0D12] border-t border-[#292F3A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#8B7CFF] mb-2 block">
            Global Standards Database
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#F5F7FA]">
            Supported Country Specifications
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#9CA3AF]">
            Search by country name, document type, or dimensions. Pre-configured with official millimeter and 300 DPI resolutions.
          </p>
        </div>

        {/* Search Bar & Region Filter */}
        <div className="max-w-2xl mx-auto mb-10 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#697386] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search country (e.g. India, United States, Canada, UK)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#171B24] border border-[#292F3A] rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-[#F5F7FA] placeholder-[#697386] focus:outline-none focus:border-[#8B7CFF] transition-colors"
            />
          </div>

          <div className="flex gap-1.5 p-1 rounded-xl bg-[#171B24] border border-[#292F3A] overflow-x-auto">
            {["all", "americas", "asia", "europe"].map((region) => (
              <button
                key={region}
                type="button"
                onClick={() => setSelectedRegion(region)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize whitespace-nowrap transition-colors ${
                  selectedRegion === region
                    ? "bg-[#8B7CFF] text-white shadow-sm"
                    : "text-[#9CA3AF] hover:text-[#F5F7FA]"
                }`}
              >
                {region === "all" ? "All Regions" : region}
              </button>
            ))}
          </div>
        </div>

        {/* Country Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredCountries.map((spec) => (
            <div
              key={spec.id}
              className="rounded-2xl bg-[#11141B] border border-[#292F3A] p-5 hover:border-[#3B4352] transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-sm text-[#F5F7FA]">{spec.country}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-[#171B24] text-[#8B7CFF] border border-[#292F3A]">
                    {spec.countryCode}
                  </span>
                </div>

                <div className="text-xs text-[#9CA3AF] mb-4">
                  {spec.documentType} Standard
                </div>

                <div className="space-y-1.5 text-xs mb-5">
                  <div className="flex justify-between py-1 border-b border-[#292F3A]/60">
                    <span className="text-[#697386]">Dimensions</span>
                    <span className="font-mono text-[#F5F7FA]">
                      {spec.widthMm} × {spec.heightMm} mm
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#292F3A]/60">
                    <span className="text-[#697386]">300 DPI Size</span>
                    <span className="font-mono text-[#F5F7FA]">
                      {spec.widthPx300Dpi} × {spec.heightPx300Dpi} px
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-[#697386]">Background</span>
                    <span className="capitalize text-[#34D399]">
                      {spec.backgroundColor.replace("-", " ")}
                    </span>
                  </div>
                </div>
              </div>

              <Link
                href="/editor"
                prefetch={false}
                onClick={() => {
                  try {
                    sessionStorage.setItem("ppm_selected_spec_id", spec.id);
                  } catch {}
                }}
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#171B24] hover:bg-[#1C2230] border border-[#292F3A] text-xs font-semibold text-[#F5F7FA] transition-colors"
              >
                <span>Use this spec</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#8B7CFF]" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
