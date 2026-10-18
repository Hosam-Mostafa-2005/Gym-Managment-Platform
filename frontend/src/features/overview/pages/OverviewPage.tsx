import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Dumbbell, Loader2, Menu, X } from "lucide-react";

import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import OverviewHero from "../components/OverviewHero";
import OverviewFeatures from "../components/OverviewFeatures";
import OverviewCTA from "../components/OverviewCTA";

const NAV_LINKS = [
  { label: "Capabilities", href: "#capabilities" },
  { label: "Role Workflows", href: "#workflows" },
];

export default function OverviewPage() {
  const { data: user, isLoading } = useCurrentUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Prevent flashing the public overview if auth is still resolving
  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-[#090B0F]">
        <Loader2 className="h-7 w-7 animate-spin text-[#5BE584]" />
      </div>
    );
  }

  // Redirect authenticated users to the Authenticated Landing Page (/home)
  if (user) {
    return <Navigate to="/home" replace />;
  }

  return (
    <div className="min-h-screen w-full bg-[#090B0F] text-[#F8FAFC] selection:bg-[#5BE584] selection:text-[#090B0F] overflow-x-hidden">
      {/* Responsive Public Top Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-[#2A3039]/80 bg-[#090B0F]/90 backdrop-blur-md relative after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-gradient-to-r after:from-transparent after:via-[#5BE584]/25 after:to-transparent">
        <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand Logo */}
          <Link to="/" className="group flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-[#5BE584] text-[#090B0F] shadow-[0_0_20px_rgba(91,229,132,0.28)] transition-shadow duration-300 group-hover:shadow-[0_0_28px_rgba(91,229,132,0.45)]">
              <Dumbbell className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold tracking-tight text-[#F8FAFC]">
              STREN
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-7">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-[#94A3B8] transition-colors hover:text-[#F8FAFC]"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop Auth Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/login"
              className="inline-flex h-10 items-center justify-center rounded-[14px] border border-[#2A3039] bg-[#13171D] px-4 text-sm font-semibold text-[#F8FAFC] transition-all duration-200 hover:border-[#38414D] hover:bg-[#1B2028]"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="inline-flex h-10 items-center justify-center rounded-[14px] bg-[#5BE584] px-4 text-sm font-semibold text-[#090B0F] shadow-[0_0_20px_rgba(91,229,132,0.22)] transition-all duration-200 hover:bg-[#49D472] hover:shadow-[0_0_28px_rgba(91,229,132,0.38)]"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
            className="flex md:hidden h-10 w-10 items-center justify-center rounded-[12px] border border-[#2A3039] bg-[#13171D] text-[#F8FAFC] hover:bg-[#1B2028]"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="border-t border-[#2A3039] bg-[#13171D] px-4 py-4 md:hidden space-y-4">
            <nav className="flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-[12px] px-3 py-2.5 text-sm font-medium text-[#94A3B8] hover:bg-[#1B2028] hover:text-[#F8FAFC]"
                >
                  {link.label}
                </a>
              ))}
            </nav>
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#2A3039]">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="inline-flex h-10 items-center justify-center rounded-[14px] border border-[#2A3039] bg-[#090B0F] px-4 text-sm font-semibold text-[#F8FAFC]"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="inline-flex h-10 items-center justify-center rounded-[14px] bg-[#5BE584] px-4 text-sm font-semibold text-[#090B0F]"
              >
                Get Started
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Main Public Landing Sections */}
      <main className="flex flex-col">
        <OverviewHero />
        <OverviewFeatures />
        <OverviewCTA />
      </main>

      {/* Footer */}
      <footer className="border-t border-[#2A3039] bg-[#090B0F] py-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-[1280px] flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-[10px] bg-[#5BE584] text-[#090B0F]">
              <Dumbbell className="h-4 w-4" />
            </div>
            <span className="text-sm font-bold text-[#F8FAFC]">STREN</span>
            <span className="text-xs text-[#94A3B8]">
              — Gym & Performance Management Platform
            </span>
          </div>

          <div className="flex items-center gap-6 text-xs text-[#94A3B8]">
            <Link to="/login" className="hover:text-[#F8FAFC] transition-colors">
              Sign In
            </Link>
            <Link
              to="/register"
              className="hover:text-[#F8FAFC] transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

