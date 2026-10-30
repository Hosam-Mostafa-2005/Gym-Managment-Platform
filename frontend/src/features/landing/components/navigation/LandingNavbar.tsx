// src/features/landing/components/navigation/LandingNavbar.tsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Menu, X, ArrowRight, UserCheck } from "lucide-react";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";

export interface LandingNavbarProps {
  activeSection?: string;
}

export const LandingNavbar: React.FC<LandingNavbarProps> = ({
  activeSection,
}) => {
  const { t } = useTranslation(["landing", "common"]);
  const { data: user } = useCurrentUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const userRole = user?.role?.toUpperCase();
  const dashboardPath =
    userRole === "TRAINER" || userRole === "ADMIN"
      ? "/coach-dashboard"
      : "/dashboard";

  const navAnchors = [
    {
      id: "platform",
      label: t("navbar.anchors.platform", { ns: "landing" }),
      href: "#platform",
    },
    {
      id: "coaches",
      label: t("navbar.anchors.coaches", { ns: "landing" }),
      href: "#coaches",
    },
    {
      id: "members",
      label: t("navbar.anchors.members", { ns: "landing" }),
      href: "#members",
    },
    {
      id: "how-it-works",
      label: t("navbar.anchors.howItWorks", { ns: "landing" }),
      href: "#how-it-works",
    },
    {
      id: "features",
      label: t("navbar.anchors.features", { ns: "landing" }),
      href: "#features",
    },
    {
      id: "preview",
      label: t("navbar.anchors.preview", { ns: "landing" }),
      href: "#preview",
    },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const main = document.querySelector("main.overflow-y-auto");
      const scrollY =
        main && main.scrollTop > 0
          ? main.scrollTop
          : window.scrollY || document.documentElement.scrollTop || 0;
      setScrolled(scrollY > 20);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    const main = document.querySelector("main.overflow-y-auto");
    if (main) {
      main.addEventListener("scroll", handleScroll, { passive: true });
    }

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (main) {
        main.removeEventListener("scroll", handleScroll);
      }
    };
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
      const targetId = href.slice(1);
      const target = document.getElementById(targetId);
      if (target) {
        const prefersReducedMotion = window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        ).matches;
        target.scrollIntoView({
          behavior: prefersReducedMotion ? "auto" : "smooth",
          block: "start",
        });
        setMobileMenuOpen(false);
      }
    }
  };

  const handleLogoClick = (e: React.MouseEvent) => {
    const pathname = window.location.pathname;
    const isLanding =
      pathname === "/" || pathname === "/landing" || pathname === "/home";

    if (isLanding) {
      e.preventDefault();
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      const behavior = prefersReducedMotion ? "auto" : "smooth";

      window.scrollTo({ top: 0, behavior });
      const main = document.querySelector("main.overflow-y-auto");
      if (main) {
        main.scrollTo({ top: 0, behavior });
      }
    }
  };

  return (
    <header
      className={`hidden md:block relative z-10 w-full transition-all duration-200 ${
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

      <div className="mx-auto flex h-16 sm:h-20 max-w-[1280px] items-center justify-center px-4 sm:px-6 lg:px-8">
        {/* Desktop Navigation Links */}
        <nav
          aria-label={t("navbar.mobile.platformNavigation", { ns: "landing" })}
          className="hidden lg:flex items-center gap-7 me-6"
        >
          {navAnchors.map((link) => {
            const isActive = activeSection === link.id;
            return (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => scrollToAnchor(e, link.href)}
                className={`relative text-xs font-semibold uppercase tracking-wider transition-all duration-200 focus-visible:outline-none ${
                  isActive
                    ? "text-[#5BE584] drop-shadow-[0_0_8px_rgba(91,229,132,0.4)]"
                    : "text-[#94A3B8] hover:text-[#5BE584]"
                }`}
              >
                {link.label}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute -bottom-1.5 inset-x-0 h-0.5 rounded-full bg-[#5BE584] shadow-[0_0_6px_rgba(91,229,132,0.8)]"
                  />
                )}
              </a>
            );
          })}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden sm:flex items-center gap-3">
          {user ? (
            <Link
              to={dashboardPath}
              className="inline-flex h-10 items-center gap-2 rounded-[12px] bg-[#5BE584] px-4 text-xs font-bold text-[#090B0F] shadow-[0_0_20px_rgba(91,229,132,0.25)] transition-all duration-200 hover:bg-[#4ade80] hover:scale-[1.02]"
            >
              <UserCheck className="h-4 w-4" />
              <span>
                {t("navbar.actions.openWorkspace", { ns: "landing" })}
              </span>
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="inline-flex h-10 items-center justify-center rounded-[12px] border border-[#2A3039] bg-[#13171D] px-4 text-xs font-semibold text-[#F8FAFC] transition-all duration-200 hover:border-[#38414D] hover:bg-[#1B2028]"
              >
                {t("navbar.actions.signIn", { ns: "landing" })}
              </Link>
              <Link
                to="/register"
                className="inline-flex h-10 items-center gap-1.5 rounded-[12px] bg-[#5BE584] px-4 text-xs font-bold text-[#090B0F] shadow-[0_0_20px_rgba(91,229,132,0.25)] transition-all duration-200 hover:bg-[#4ade80] hover:scale-[1.02]"
              >
                <span>{t("navbar.actions.getStarted", { ns: "landing" })}</span>
                <ArrowRight className="h-3.5 w-3.5 stroke-[2.5] rtl:rotate-180" />
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger Toggle & Compact Controls */}
        <div className="flex sm:hidden items-center gap-2">
          {user ? (
            <Link
              to={dashboardPath}
              className="inline-flex h-9 items-center gap-1.5 rounded-[10px] bg-[#5BE584] px-3 text-xs font-bold text-[#090B0F]"
            >
              <span>{t("navbar.actions.workspace", { ns: "landing" })}</span>
            </Link>
          ) : null}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={t("navbar.mobile.toggleMenu", { ns: "landing" })}
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
              {t("navbar.mobile.platformNavigation", { ns: "landing" })}
            </span>
            {navAnchors.map((link) => {
              const isActive = activeSection === link.id;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => scrollToAnchor(e, link.href)}
                  className={`flex items-center justify-between rounded-[12px] px-3 py-3 text-sm font-semibold transition-colors border ${
                    isActive
                      ? "bg-[#5BE584]/10 text-[#5BE584] border-[#5BE584]/30"
                      : "text-[#F8FAFC] hover:bg-[#1B2028] border-transparent hover:border-[#2A3039]"
                  }`}
                >
                  <span>{link.label}</span>
                  <ArrowRight
                    size={14}
                    className={`${
                      isActive ? "text-[#5BE584]" : "text-[#94A3B8]"
                    } rtl:rotate-180`}
                  />
                </a>
              );
            })}
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
                  {t("navbar.actions.openWorkspaceRole", {
                    ns: "landing",
                    role:
                      userRole === "TRAINER"
                        ? t("navbar.actions.roles.coach", { ns: "landing" })
                        : t("navbar.actions.roles.member", { ns: "landing" }),
                  })}
                </span>
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-[14px] bg-[#5BE584] text-sm font-bold text-[#090B0F] shadow-[0_0_20px_rgba(91,229,132,0.3)]"
                >
                  <span>
                    {t("navbar.actions.getStartedWithStren", { ns: "landing" })}
                  </span>
                  <ArrowRight size={16} className="rtl:rotate-180" />
                </Link>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex h-12 w-full items-center justify-center rounded-[14px] border border-[#2A3039] bg-[#13171D] text-sm font-semibold text-[#F8FAFC]"
                >
                  {t("navbar.actions.signInToAccount", { ns: "landing" })}
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
