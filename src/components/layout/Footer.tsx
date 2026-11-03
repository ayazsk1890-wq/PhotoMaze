import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, Heart, Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-md">
                <Image
                  src="/logo.svg"
                  alt="PhotoMaze Logo"
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="font-bold text-xl tracking-tight text-white flex items-center gap-1.5">
                Photo<span className="text-blue-400">Maze</span>
                <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  100% Free
                </span>
              </span>
            </Link>

            <p className="mt-4 text-sm text-slate-400 max-w-sm leading-relaxed">
              PhotoMaze is a 100% free biometric passport, visa, and ID photo creation studio. Built on client-side AI with zero paywalls, zero ads, and zero registration required.
            </p>

            <div className="mt-6 flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Compliant with ICAO Doc 9303 & ISO/IEC 19794-5 standards</span>
            </div>
          </div>

          {/* Column 1: AI Tools */}
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-white mb-4">
              AI Tools
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <a href="#features" className="hover:text-white transition-colors">
                  AI Background Removal
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-white transition-colors">
                  Biometric Auto-Cropping
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-white transition-colors">
                  AI Formal Suit Changer
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-white transition-colors">
                  300 DPI Photo Enhancer
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-white transition-colors">
                  Custom Print Sheet Maker
                </a>
              </li>
            </ul>
          </div>

          {/* Column 2: Popular Standards */}
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-white mb-4">
              Popular Sizes
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <a href="#countries" className="hover:text-white transition-colors">
                  US Passport (2×2 inches)
                </a>
              </li>
              <li>
                <a href="#countries" className="hover:text-white transition-colors">
                  UK Passport (35×45 mm)
                </a>
              </li>
              <li>
                <a href="#countries" className="hover:text-white transition-colors">
                  India Passport / OCI
                </a>
              </li>
              <li>
                <a href="#countries" className="hover:text-white transition-colors">
                  Schengen / EU Visa
                </a>
              </li>
              <li>
                <a href="#countries" className="hover:text-white transition-colors">
                  Canada Passport (50×70 mm)
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Quick Links */}
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-white mb-4">
              Resources
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <a href="#how-it-works" className="hover:text-white transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#free-guarantee" className="hover:text-white transition-colors">
                  100% Free Guarantee
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-white transition-colors">
                  Frequently Asked Questions
                </a>
              </li>
              <li>
                <Link href="/api/health" className="hover:text-white transition-colors" target="_blank">
                  System API Health
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            &copy; {new Date().getFullYear()} PhotoMaze. Free & open biometric photo maker. Built for citizens & travelers worldwide.
          </p>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-300 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-300 cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-300 cursor-pointer">Security Posture</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

