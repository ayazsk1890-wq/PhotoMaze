"use client";

import React, { useState } from "react";
import { Search, Globe2, ArrowRight, ShieldCheck, Check } from "lucide-react";
import { POPULAR_PASSPORT_SPECS } from "@/lib/constants/countries";

export function SupportedCountriesSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("all");

  // Extended country list for rich browsing
  const countryDatabase = [
    ...POPULAR_PASSPORT_SPECS,
    {
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
    },
    {
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
    },
    {
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
    },
    {
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
      aspectRatio: "2:3",
      region: "middle-east",
    },
  ];

  const filteredCountries = countryDatabase.filter((c) => {
    const matchesSearch =
      c.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.countryCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.documentType.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <section id="countries" className="py-16 sm:py-24 bg-slate-50/60 border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-violet-600 bg-violet-50 px-3 py-1 rounded-full border border-violet-200">
            Global Standards Database
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Supported Country Photo Dimensions
          </h2>
          <p className="mt-3 text-base sm:text-lg text-slate-600">
            Pre-configured with official government and embassy rules for passports, visas, driving licenses, and citizen IDs worldwide.
          </p>

          {/* Search Box */}
          <div className="mt-8 relative max-w-lg mx-auto">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search country (e.g. USA, UK, India, Schengen, Canada)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-2xl pl-12 pr-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        {/* Countries Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredCountries.map((item) => (
            <div
              key={item.country + item.documentType}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-blue-400 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-extrabold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700">
                    {item.countryCode}
                  </span>
                  <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                    {item.documentType}
                  </span>
                </div>

                <h3 className="font-bold text-base text-slate-900 mb-1">
                  {item.country}
                </h3>

                <div className="space-y-1 text-xs text-slate-500 mt-2">
                  <div className="flex justify-between">
                    <span>Physical Size:</span>
                    <span className="font-semibold text-slate-800">
                      {item.widthMm} × {item.heightMm} mm
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pixel Dimensions:</span>
                    <span className="font-semibold text-slate-800">
                      {item.widthPx300Dpi} × {item.heightPx300Dpi} px
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Background:</span>
                    <span className="font-semibold text-slate-800 capitalize">
                      {item.backgroundColor.replace("-", " ")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Head Height:</span>
                    <span className="font-semibold text-slate-800">
                      {Math.round(item.headMinPercentage * 100)}% - {Math.round(item.headMaxPercentage * 100)}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100">
                <a
                  href="#upload-card"
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-xs font-semibold transition-colors"
                >
                  <span>Select {item.country}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>

        {filteredCountries.length === 0 && (
          <div className="text-center py-12">
            <Globe2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 font-medium">No countries match your search.</p>
            <button
              onClick={() => setSearchQuery("")}
              className="mt-2 text-xs font-bold text-blue-600 hover:underline"
            >
              Reset search
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

