import React from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0B0D12] text-[#F5F7FA] flex flex-col items-center justify-center px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[#171B24] border border-[#292F3A] flex items-center justify-center text-[#8B7CFF] mb-6 shadow-xl shadow-black/40">
        <Sparkles className="w-8 h-8" />
      </div>
      <span className="text-xs font-semibold tracking-wider uppercase text-[#8B7CFF] mb-2">404 Error</span>
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">Page Not Found</h1>
      <p className="text-sm sm:text-base text-[#9CA3AF] max-w-md mb-8">
        The studio view or resource you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#8B7CFF] hover:bg-[#7665F5] transition-colors shadow-lg shadow-[#8B7CFF]/20"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Studio Home</span>
      </Link>
    </div>
  );
}
