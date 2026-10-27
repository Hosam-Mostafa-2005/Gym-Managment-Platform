// src/features/legal/components/LegalNavbar.tsx
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Dumbbell, ArrowLeft, Menu, X, Shield, FileText } from "lucide-react";

export const LegalNavbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isPrivacy = location.pathname.includes("privacy");
  const isTerms = location.pathname.includes("terms");

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#2A3039]/80 bg-[#090B0F]/90 backdrop-blur-md">
      {/* Top Hairline Accent */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#5BE584]/25 to-transparent"
      />

      <div className="mx-auto flex h-16 sm:h-20 max-w-[1280px] items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand & Back Button */}
        <div className="flex items-center gap-4 sm:gap-6">
          <Link
            to="/"
            className="group flex items-center gap-2 rounded-lg border border-[#2A3039] bg-[#13171D] px-3 py-1.5 text-xs font-semibold text-[#94A3B8] transition hover:border-[#5BE584]/40 hover:text-[#F8FAFC]"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition group-hover:-translate-x-0.5 text-[#5BE584]" />
            <span className="hidden sm:inline">Back to STREN</span>
            <span className="sm:hidden">Back</span>
          </Link>

          <Link to="/" className="group flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#5BE584] text-[#090B0F] shadow-[0_0_16px_rgba(91,229,132,0.3)] transition group-hover:scale-105">
              <Dumbbell className="h-4.5 w-4.5 stroke-[2.5]" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-extrabold tracking-tight text-[#F8FAFC]">
                STREN
              </span>
              <span className="text-[9px] font-semibold text-[#5BE584] uppercase tracking-widest leading-none">
                Legal Center
              </span>
            </div>
          </Link>
        </div>

        {/* Desktop Document Switcher */}
        <nav
          aria-label="Legal navigation"
          className="hidden md:flex items-center gap-1 rounded-xl border border-[#2A3039] bg-[#101418] p-1 shadow-inner"
        >
          <Link
            to="/privacy-policy"
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition ${
              isPrivacy
                ? "bg-[#5BE584] text-[#090B0F] shadow-sm"
                : "text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-white/[0.04]"
            }`}
          >
            <Shield className="h-3.5 w-3.5" />
            <span>Privacy Policy</span>
          </Link>

          <Link
            to="/terms-of-service"
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition ${
              isTerms
                ? "bg-[#5BE584] text-[#090B0F] shadow-sm"
                : "text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-white/[0.04]"
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Terms of Service</span>
          </Link>
        </nav>

        {/* Action CTAs */}
        <div className="hidden sm:flex items-center gap-3">
          <Link
            to="/login"
            className="text-xs font-semibold text-[#94A3B8] hover:text-[#F8FAFC] transition px-3 py-2"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="inline-flex items-center justify-center rounded-xl bg-[#5BE584] px-4 py-2 text-xs font-bold text-[#090B0F] shadow-[0_0_15px_rgba(91,229,132,0.25)] transition hover:bg-[#4dd475] active:scale-[0.98]"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle legal menu"
          className="md:hidden flex h-9 w-9 items-center justify-center rounded-lg border border-[#2A3039] bg-[#13171D] text-[#94A3B8] hover:text-[#F8FAFC]"
        >
          {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#2A3039] bg-[#090B0F] px-4 py-4 space-y-3">
          <div className="flex flex-col gap-1.5">
            <Link
              to="/privacy-policy"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-xs font-semibold ${
                isPrivacy
                  ? "bg-[#5BE584] text-[#090B0F]"
                  : "text-[#94A3B8] hover:bg-white/[0.04] hover:text-white"
              }`}
            >
              <Shield className="h-4 w-4" />
              <span>Privacy Policy</span>
            </Link>

            <Link
              to="/terms-of-service"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-xs font-semibold ${
                isTerms
                  ? "bg-[#5BE584] text-[#090B0F]"
                  : "text-[#94A3B8] hover:bg-white/[0.04] hover:text-white"
              }`}
            >
              <FileText className="h-4 w-4" />
              <span>Terms of Service</span>
            </Link>
          </div>

          <div className="pt-3 border-t border-[#1E2329] flex flex-col gap-2">
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center rounded-lg border border-[#2A3039] bg-[#13171D] py-2 text-xs font-semibold text-[#F8FAFC]"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center rounded-lg bg-[#5BE584] py-2 text-xs font-bold text-[#090B0F]"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
