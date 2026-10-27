// src/features/legal/components/LegalFooter.tsx
import React from "react";
import { Link } from "react-router-dom";
import { Dumbbell, ShieldCheck, HeartPulse } from "lucide-react";

export const LegalFooter: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative border-t border-[#2A3039] bg-[#07090D] text-[#94A3B8] overflow-hidden mt-20">
      {/* Specular Hairline */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#5BE584]/30 to-transparent"
      />

      <div className="mx-auto max-w-[1280px] px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand Info */}
          <div className="lg:col-span-2 flex flex-col gap-3">
            <Link to="/" className="group flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#5BE584] text-[#090B0F] shadow-[0_0_16px_rgba(91,229,132,0.25)] transition group-hover:scale-105">
                <Dumbbell className="h-4.5 w-4.5" />
              </div>
              <span className="text-lg font-extrabold tracking-tight text-[#F8FAFC]">
                STREN
              </span>
            </Link>

            <p className="max-w-md text-xs sm:text-sm text-[#A7B0BC] leading-relaxed">
              STREN is an advanced strength coaching and gym management software platform
              unifying exercise prescriptions, live session tracking, previous lift benchmarks,
              and coach-athlete collaboration.
            </p>

            <div className="mt-2 flex items-center gap-3 text-xs text-[#94A3B8]">
              <span className="inline-flex items-center gap-1.5 text-emerald-400">
                <ShieldCheck className="h-3.5 w-3.5" />
                Data Protected & Encrypted
              </span>
              <span className="text-[#38414D]">·</span>
              <span className="inline-flex items-center gap-1.5 text-blue-400">
                <HeartPulse className="h-3.5 w-3.5" />
                Health Disclaimer Active
              </span>
            </div>
          </div>

          {/* Legal Navigation */}
          <div className="flex flex-col gap-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#F8FAFC]">
              Legal & Trust
            </h4>
            <ul className="flex flex-col gap-2 text-xs sm:text-sm">
              <li>
                <Link
                  to="/privacy-policy"
                  className="transition hover:text-[#5BE584]"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms-of-service"
                  className="transition hover:text-[#5BE584]"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <a
                  href="#deletion-procedure"
                  className="transition hover:text-[#5BE584]"
                >
                  Data Deletion Requests
                </a>
              </li>
              <li>
                <a
                  href="#medical-disclaimer"
                  className="transition hover:text-[#5BE584]"
                >
                  Health & Medical Disclaimer
                </a>
              </li>
            </ul>
          </div>

          {/* Quick Access */}
          <div className="flex flex-col gap-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#F8FAFC]">
              Platform Access
            </h4>
            <ul className="flex flex-col gap-2 text-xs sm:text-sm">
              <li>
                <Link to="/" className="transition hover:text-[#5BE584]">
                  Platform Home
                </Link>
              </li>
              <li>
                <Link to="/login" className="transition hover:text-[#5BE584]">
                  Sign In
                </Link>
              </li>
              <li>
                <Link to="/register" className="transition hover:text-[#5BE584]">
                  Create Account
                </Link>
              </li>
              <li>
                <Link
                  to="/coach-dashboard"
                  className="transition hover:text-[#5BE584]"
                >
                  Coaching Workspace
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Hairline & Disclaimers */}
        <div className="mt-10 pt-6 border-t border-[#1F2630] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#94A3B8]">
          <p>© {currentYear} STREN. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <span>Serverless Infrastructure on Neon & Render</span>
            <span className="text-[#38414D]">·</span>
            <span>Frontend on Vercel Edge</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
