import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, HeartHandshake } from "lucide-react";

export function Footer() {
  return (
    <footer id="about" className="bg-[#0B0D12] text-[#9CA3AF] pt-16 pb-12 border-t border-[#292F3A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-[#292F3A]">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-8 h-8 rounded-xl overflow-hidden bg-[#171B24] border border-[#292F3A]">
                <Image
                  src="/logo.svg"
                  alt="PhotoMaze Logo"
                  width={32}
                  height={32}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="font-bold text-lg tracking-tight text-[#F5F7FA] flex items-center gap-1.5">
                Photo<span className="text-[#8B7CFF]">Maze</span>
                <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-[#171B24] text-[#9CA3AF] border border-[#292F3A] tracking-wider">
                  Free
                </span>
              </span>
            </Link>

            <p className="mt-4 text-xs sm:text-sm text-[#9CA3AF] max-w-sm leading-relaxed">
              PhotoMaze is a free biometric passport, visa, and ID photo creation studio. Engineered with client-side AI, WebGPU acceleration, and strict privacy by design.
            </p>

            <div className="mt-5 flex items-center gap-2 text-xs text-[#697386]">
              <ShieldCheck className="w-4 h-4 text-[#34D399]" />
              <span>Complies with ICAO Doc 9303 & ISO/IEC 19794-5 standards</span>
            </div>
          </div>

          {/* AI Tools */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#F5F7FA] mb-4">
              AI Tools
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link href="/editor" className="hover:text-[#F5F7FA] transition-colors">
                  AI Background Isolation
                </Link>
              </li>
              <li>
                <Link href="/editor" className="hover:text-[#F5F7FA] transition-colors">
                  Biometric Auto-Cropping
                </Link>
              </li>
              <li>
                <Link href="/editor" className="hover:text-[#F5F7FA] transition-colors">
                  Formal Suit & Attire
                </Link>
              </li>
              <li>
                <Link href="/editor" className="hover:text-[#F5F7FA] transition-colors">
                  300 DPI Photo Enhancer
                </Link>
              </li>
              <li>
                <Link href="/editor" className="hover:text-[#F5F7FA] transition-colors">
                  Print Sheet Formatter
                </Link>
              </li>
            </ul>
          </div>

          {/* Popular Standards */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#F5F7FA] mb-4">
              Standards
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link href="/editor" className="hover:text-[#F5F7FA] transition-colors">
                  India Passport (35×45 mm)
                </Link>
              </li>
              <li>
                <Link href="/editor" className="hover:text-[#F5F7FA] transition-colors">
                  US Passport (2×2 inches)
                </Link>
              </li>
              <li>
                <Link href="/editor" className="hover:text-[#F5F7FA] transition-colors">
                  UK / Schengen (35×45 mm)
                </Link>
              </li>
              <li>
                <Link href="/editor" className="hover:text-[#F5F7FA] transition-colors">
                  Canada Passport (50×70 mm)
                </Link>
              </li>
              <li>
                <Link href="/editor" className="hover:text-[#F5F7FA] transition-colors">
                  OCI & Global Visas
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources & System */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#F5F7FA] mb-4">
              Resources
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <a href="#how-it-works" className="hover:text-[#F5F7FA] transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#free-guarantee" className="hover:text-[#F5F7FA] transition-colors">
                  100% Free Guarantee
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-[#F5F7FA] transition-colors">
                  Frequently Asked Questions
                </a>
              </li>
              <li>
                <Link href="/api/health" target="_blank" className="hover:text-[#F5F7FA] transition-colors">
                  System Health API
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Strip */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#697386]">
          <p>
            &copy; {new Date().getFullYear()} PhotoMaze. Free & open passport photo creator.
          </p>
          <div className="flex items-center gap-6">
            <span className="hover:text-[#9CA3AF] transition-colors cursor-pointer">Privacy Conscious</span>
            <span className="hover:text-[#9CA3AF] transition-colors cursor-pointer">Terms</span>
            <span className="hover:text-[#9CA3AF] transition-colors cursor-pointer">Local Processing</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
