// src/features/landing/components/footer/LandingFooter.tsx
import React from "react";
import { Link } from "react-router-dom";
import { Dumbbell } from "lucide-react";

export const LandingFooter: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <footer className="relative border-t border-[#2A3039] bg-[#07090D] text-[#94A3B8] overflow-hidden">
      {/* Top subtle highlight hairline */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#5BE584]/30 to-transparent"
      />

      <div className="mx-auto max-w-[1280px] px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand & Mission Column */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <Link to="/" className="group flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-[#5BE584] text-[#090B0F] shadow-[0_0_20px_rgba(91,229,132,0.28)] transition-all group-hover:scale-105">
                <Dumbbell className="h-5 w-5" />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-[#F8FAFC]">
                STREN
              </span>
            </Link>

            <p className="max-w-sm text-xs sm:text-sm text-[#A7B0BC] leading-relaxed">
              A high-performance strength coaching platform connecting exercise prescriptions,
              live session tracking, previous lift benchmarks, and coach oversight in one unified system.
            </p>

            <div className="flex items-center gap-2 mt-2">
              <span className="flex h-2 w-2 rounded-full bg-[#22C55E]" />
              <span className="text-xs text-[#94A3B8]">
                STREN Platform · All services operational
              </span>
            </div>
          </div>

          {/* Column 1: Platform Exploration */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#F8FAFC]">
              Platform
            </h4>
            <ul className="flex flex-col gap-2.5 text-xs sm:text-sm">
              <li>
                <a
                  href="#platform"
                  onClick={(e) => handleAnchorClick(e, "#platform")}
                  className="transition-colors hover:text-[#5BE584]"
                >
                  Overview & Loop
                </a>
              </li>
              <li>
                <a
                  href="#coaches"
                  onClick={(e) => handleAnchorClick(e, "#coaches")}
                  className="transition-colors hover:text-[#5BE584]"
                >
                  For Coaches
                </a>
              </li>
              <li>
                <a
                  href="#members"
                  onClick={(e) => handleAnchorClick(e, "#members")}
                  className="transition-colors hover:text-[#5BE584]"
                >
                  For Members
                </a>
              </li>
              <li>
                <a
                  href="#how-it-works"
                  onClick={(e) => handleAnchorClick(e, "#how-it-works")}
                  className="transition-colors hover:text-[#5BE584]"
                >
                  How It Works
                </a>
              </li>
              <li>
                <a
                  href="#features"
                  onClick={(e) => handleAnchorClick(e, "#features")}
                  className="transition-colors hover:text-[#5BE584]"
                >
                  Capabilities
                </a>
              </li>
              <li>
                <a
                  href="#preview"
                  onClick={(e) => handleAnchorClick(e, "#preview")}
                  className="transition-colors hover:text-[#5BE584]"
                >
                  Live Preview
                </a>
              </li>
            </ul>
          </div>

          {/* Column 2: Role Workflows */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#F8FAFC]">
              Workspaces
            </h4>
            <ul className="flex flex-col gap-2.5 text-xs sm:text-sm">
              <li>
                <Link
                  to="/coach-dashboard"
                  className="transition-colors hover:text-[#5BE584]"
                >
                  Coach Dashboard
                </Link>
              </li>
              <li>
                <Link
                  to="/workout-builder/all"
                  className="transition-colors hover:text-[#5BE584]"
                >
                  Workout Builder
                </Link>
              </li>
              <li>
                <Link
                  to="/assignments/all"
                  className="transition-colors hover:text-[#5BE584]"
                >
                  Assignments
                </Link>
              </li>
              <li>
                <Link
                  to="/members/all"
                  className="transition-colors hover:text-[#5BE584]"
                >
                  Member Roster
                </Link>
              </li>
              <li>
                <Link
                  to="/dashboard"
                  className="transition-colors hover:text-[#5BE584]"
                >
                  Member Dashboard
                </Link>
              </li>
              <li>
                <Link
                  to="/sessions"
                  className="transition-colors hover:text-[#5BE584]"
                >
                  Active Sessions
                </Link>
              </li>
              <li>
                <Link
                  to="/measurements"
                  className="transition-colors hover:text-[#5BE584]"
                >
                  Body Measurements
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Resources & Account */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#F8FAFC]">
              Access & Database
            </h4>
            <ul className="flex flex-col gap-2.5 text-xs sm:text-sm">
              <li>
                <Link
                  to="/workout-library/exercises"
                  className="transition-colors hover:text-[#5BE584]"
                >
                  Exercise Taxonomy
                </Link>
              </li>
              <li>
                <Link
                  to="/workout-library/workouts"
                  className="transition-colors hover:text-[#5BE584]"
                >
                  Public Workouts
                </Link>
              </li>
              <li>
                <Link
                  to="/notifications"
                  className="transition-colors hover:text-[#5BE584]"
                >
                  Live Notifications
                </Link>
              </li>
              <li>
                <Link
                  to="/login"
                  className="transition-colors hover:text-[#5BE584]"
                >
                  Sign In
                </Link>
              </li>
              <li>
                <Link
                  to="/register"
                  className="transition-colors hover:text-[#5BE584]"
                >
                  Create Account
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy-policy"
                  className="transition-colors hover:text-[#5BE584]"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms-of-service"
                  className="transition-colors hover:text-[#5BE584]"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-[#1F2630] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#94A3B8]">
          <p>© {currentYear} STREN. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <Link
              to="/privacy-policy"
              className="transition-colors hover:text-[#5BE584]"
            >
              Privacy Policy
            </Link>
            <span className="text-[#38414D]">·</span>
            <Link
              to="/terms-of-service"
              className="transition-colors hover:text-[#5BE584]"
            >
              Terms of Service
            </Link>
            <span className="text-[#38414D]">·</span>
            <span>Built for Coaches and Athletes</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
