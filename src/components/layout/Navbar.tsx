"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Sparkles, Menu, X, ArrowRight, User } from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, openAuthModal } = useAuth();

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "AI Photo Studio", href: "/editor" },
    { name: "Features", href: "/#features" },
    { name: "How It Works", href: "/#how-it-works" },
    { name: "About", href: "/#about" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-[#0B0D12]/90 backdrop-blur-md border-b border-[#292F3A] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-9 h-9 rounded-xl overflow-hidden bg-[#171B24] border border-[#292F3A] shadow-md group-hover:border-[#8B7CFF]/50 transition-colors">
              <Image
                src="/logo.svg"
                alt="PhotoMaze Logo"
                width={36}
                height={36}
                className="w-full h-full object-cover"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base sm:text-lg tracking-tight text-[#F5F7FA] flex items-center gap-2">
                Photo<span className="text-[#8B7CFF]">Maze</span>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[#34D399]/15 text-[#34D399] border border-[#34D399]/30 tracking-wider">
                  100% Free
                </span>
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                prefetch={false}
                className="px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium text-[#9CA3AF] hover:text-[#F5F7FA] hover:bg-[#171B24] transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Right Controls: Auth & Primary Action */}
          <div className="hidden sm:flex items-center gap-3">
            {user ? (
              <button
                type="button"
                onClick={() => openAuthModal("profile")}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#171B24] hover:bg-[#1C2230] border border-[#292F3A] text-xs text-[#F5F7FA] transition-colors"
                title={`Signed in as ${user.email}`}
              >
                <div className="w-5 h-5 rounded-full bg-[#8B7CFF] text-white flex items-center justify-center font-bold text-[10px]">
                  {user.fullName ? user.fullName[0].toUpperCase() : user.email[0].toUpperCase()}
                </div>
                <span className="max-w-[120px] truncate text-[#9CA3AF] font-medium">
                  {user.fullName || user.email.split("@")[0]}
                </span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => openAuthModal("login")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#171B24] hover:bg-[#1C2230] border border-[#292F3A] text-xs font-medium text-[#9CA3AF] hover:text-[#F5F7FA] transition-colors"
              >
                <User className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}

            <Link
              href="/editor"
              prefetch={false}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-[#8B7CFF] hover:bg-[#7665F5] shadow-sm shadow-[#8B7CFF]/20 active:scale-[0.98] transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Create Photo</span>
              <ArrowRight className="w-3.5 h-3.5 -ml-0.5" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              href="/editor"
              prefetch={false}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-[#8B7CFF] hover:bg-[#7665F5] rounded-lg transition-colors"
            >
              Create
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              type="button"
              className="p-2 rounded-lg text-[#9CA3AF] hover:text-[#F5F7FA] hover:bg-[#171B24] border border-transparent hover:border-[#292F3A] transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#292F3A] bg-[#0B0D12] px-4 pt-3 pb-6 shadow-2xl">
          <div className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                prefetch={false}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-sm font-medium text-[#9CA3AF] hover:text-[#F5F7FA] hover:bg-[#171B24] transition-colors"
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-3 mt-2 border-t border-[#292F3A] flex flex-col gap-2">
              {user ? (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuthModal("profile");
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-[#171B24] text-xs text-[#F5F7FA]"
                >
                  <span className="truncate">{user.email}</span>
                  <span className="text-[#8B7CFF]">Account</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuthModal("login");
                  }}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#171B24] text-xs font-medium text-[#9CA3AF] hover:text-[#F5F7FA]"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
              )}
              <Link
                href="/editor"
                prefetch={false}
                onClick={() => setMobileMenuOpen(false)}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#8B7CFF] hover:bg-[#7665F5] transition-colors shadow-md shadow-[#8B7CFF]/20"
              >
                <Sparkles className="w-4 h-4" />
                <span>Launch Photo Studio</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
