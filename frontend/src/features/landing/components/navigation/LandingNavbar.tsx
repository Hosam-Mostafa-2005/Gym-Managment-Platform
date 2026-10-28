// src/features/landing/components/navigation/LandingNavbar.tsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Dumbbell, Menu, X, ArrowRight, UserCheck } from "lucide-react";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";

const NAV_ANCHORS = [
  { label: "Platform", href: "#platform" },
  { label: "For Coaches", href: "#coaches" },
  { label: "For Members", href: "#members" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Features", href: "#features" },
  { label: "Live Preview", href: "#preview" },
];

export const LandingNavbar: React.FC = () => {
  const { data: user } = useCurrentUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const userRole = user?.role?.toUpperCase();
  const dashboardPath =
    userRole === "TRAINER" || userRole === "ADMIN"
      ? "/coach-dashboard"
      : "/dashboard";

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock background scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") setMobileMenuOpen(false);
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = "";
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [mobileMenuOpen]);

  const scrollToAnchor = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        setMobileMenuOpen(false);
      }
    }
  };

  return (
    <header
      className={`relative z-10 w-full transition-all duration-200 ${
        scrolled
          ? "border-b border-[#2A3039] bg-[#090B0F]/95 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.6)]"
          : "border-b border-[#2A3039]/60 bg-[#090B0F]/80 backdrop-blur-sm"
      }`}
    >
      {/* Top Hairline Ambient Illumination */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#5BE584]/20 to-transparent"
      />

      <div className="mx-auto flex h-16 sm:h-20 max-w-[1280px] items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Mark */}
        <Link to="/" className="group flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#5BE584] text-[#090B0F] shadow-[0_0_20px_rgba(91,229,132,0.3)] transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_0_28px_rgba(91,229,132,0.5)]">
            <Dumbbell className="h-5 w-5 stroke-[2.5]" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-extrabold tracking-tight text-[#F8FAFC]">
              STREN
            </span>
            <span className="text-[10px] font-semibold text-[#5BE584] uppercase tracking-widest leading-none">
              Coaching Platform
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav
          aria-label="Primary navigation"
          className="hidden lg:flex items-center gap-7"
        >
          {NAV_ANCHORS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => scrollToAnchor(e, link.href)}
              className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8] transition-colors hover:text-[#5BE584] focus-visible:outline-none focus-visible:text-[#5BE584]"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden sm:flex items-center gap-3">
          {user ? (
            <Link
              to={dashboardPath}
              className="inline-flex h-10 items-center gap-2 rounded-[12px] bg-[#5BE584] px-4 text-xs font-bold text-[#090B0F] shadow-[0_0_20px_rgba(91,229,132,0.25)] transition-all duration-200 hover:bg-[#4ade80] hover:scale-[1.02]"
            >
              <UserCheck className="h-4 w-4" />
              <span>Open Workspace</span>
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="inline-flex h-10 items-center justify-center rounded-[12px] border border-[#2A3039] bg-[#13171D] px-4 text-xs font-semibold text-[#F8FAFC] transition-all duration-200 hover:border-[#38414D] hover:bg-[#1B2028]"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="inline-flex h-10 items-center gap-1.5 rounded-[12px] bg-[#5BE584] px-4 text-xs font-bold text-[#090B0F] shadow-[0_0_20px_rgba(91,229,132,0.25)] transition-all duration-200 hover:bg-[#4ade80] hover:scale-[1.02]"
              >
                <span>Get Started</span>
                <ArrowRight className="h-3.5 w-3.5 stroke-[2.5]" />
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex sm:hidden items-center gap-2">
          {user ? (
            <Link
              to={dashboardPath}
              className="inline-flex h-9 items-center gap-1.5 rounded-[10px] bg-[#5BE584] px-3 text-xs font-bold text-[#090B0F]"
            >
              <span>Workspace</span>
            </Link>
          ) : null}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
            className="flex h-10 w-10 items-center justify-center rounded-[12px] border border-[#2A3039] bg-[#13171D] text-[#F8FAFC] hover:bg-[#1B2028] transition-colors"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-x-0 top-16 bottom-0 z-40 bg-black/80 backdrop-blur-md lg:hidden flex flex-col justify-between p-6 overflow-y-auto">
          <nav className="flex flex-col gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#5BE584] mb-2 px-3">
              Platform Navigation
            </span>
            {NAV_ANCHORS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => scrollToAnchor(e, link.href)}
                className="flex items-center justify-between rounded-[12px] px-3 py-3 text-sm font-semibold text-[#F8FAFC] hover:bg-[#1B2028] transition-colors border border-transparent hover:border-[#2A3039]"
              >
                <span>{link.label}</span>
                <ArrowRight size={14} className="text-[#94A3B8]" />
              </a>
            ))}
          </nav>

          <div className="flex flex-col gap-3 pt-6 border-t border-[#2A3039]">
            {user ? (
              <Link
                to={dashboardPath}
                onClick={() => setMobileMenuOpen(false)}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-[14px] bg-[#5BE584] text-sm font-bold text-[#090B0F]"
              >
                <UserCheck size={16} />
                <span>
                  Open Workspace ({userRole === "TRAINER" ? "Coach" : "Member"})
                </span>
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-[14px] bg-[#5BE584] text-sm font-bold text-[#090B0F] shadow-[0_0_20px_rgba(91,229,132,0.3)]"
                >
                  <span>Get Started with STREN</span>
                  <ArrowRight size={16} />
                </Link>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex h-12 w-full items-center justify-center rounded-[14px] border border-[#2A3039] bg-[#13171D] text-sm font-semibold text-[#F8FAFC]"
                >
                  Sign In to Account
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default LandingNavbar;
