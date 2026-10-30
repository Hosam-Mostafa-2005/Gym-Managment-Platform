// src/features/landing/components/navigation/FloatingSectionNav.tsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { ArrowUp } from "lucide-react";

export interface FloatingSectionNavProps {
  activeSection?: string;
  onSectionChange?: (sectionId: string) => void;
}

const LANDING_SECTIONS = [
  "hero",
  "platform",
  "coaches",
  "members",
  "how-it-works",
  "features",
  "perspectives",
  "preview",
  "cta",
] as const;

export const smoothScrollToTop = () => {
  const prefersReduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const behavior = prefersReduced ? "auto" : "smooth";

  window.scrollTo({ top: 0, behavior });
  const main = document.querySelector("main.overflow-y-auto");
  if (main) {
    main.scrollTo({ top: 0, behavior });
  }
};

export const scrollToLandingSection = (sectionId: string) => {
  const target = document.getElementById(sectionId);
  if (!target) return;

  const prefersReduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const behavior = prefersReduced ? "auto" : "smooth";

  target.scrollIntoView({
    behavior,
    block: "start",
  });
};

export const FloatingSectionNav: React.FC<FloatingSectionNavProps> = ({
  activeSection: controlledActiveSection,
  onSectionChange,
}) => {
  const { t } = useTranslation(["landing"]);
  const [internalActiveSection, setInternalActiveSection] =
    useState<string>("hero");
  const [isAtTop, setIsAtTop] = useState<boolean>(true);
  const [sidebarRightOffset, setSidebarRightOffset] = useState<number>(0);

  const activeSection = controlledActiveSection ?? internalActiveSection;

  // Section label resolution dictionary
  const sectionLabels: Record<string, string> = useMemo(
    () => ({
      hero: t("navbar.anchors.platform", "Platform"),
      platform: t("navbar.anchors.platform", "Platform"),
      coaches: t("navbar.anchors.coaches", "For Coaches"),
      members: t("navbar.anchors.members", "For Members"),
      "how-it-works": t("navbar.anchors.howItWorks", "How It Works"),
      features: t("navbar.anchors.features", "Features"),
      perspectives: t("dualPerspective.badge", "Coaching Loop"),
      preview: t("navbar.anchors.preview", "Live Preview"),
      cta: t("navbar.actions.getStarted", "Get Started"),
    }),
    [t],
  );

  // 1. Scroll Position & Top Detection
  useEffect(() => {
    const checkScrollTop = () => {
      const main = document.querySelector("main.overflow-y-auto");
      const scrollY =
        main && main.scrollTop > 0
          ? main.scrollTop
          : window.scrollY || document.documentElement.scrollTop || 0;

      setIsAtTop(scrollY < 120);
    };

    checkScrollTop();
    window.addEventListener("scroll", checkScrollTop, { passive: true });

    const main = document.querySelector("main.overflow-y-auto");
    if (main) {
      main.addEventListener("scroll", checkScrollTop, { passive: true });
    }

    return () => {
      window.removeEventListener("scroll", checkScrollTop);
      if (main) {
        main.removeEventListener("scroll", checkScrollTop);
      }
    };
  }, []);

  // 2. Active Section Detection using IntersectionObserver
  useEffect(() => {
    const main = document.querySelector("main.overflow-y-auto");
    const root =
      main && main.scrollHeight > main.clientHeight ? main : null;

    const observerCallback: IntersectionObserverCallback = (entries) => {
      // Find the most visible intersecting section
      const visibleEntries = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

      if (visibleEntries.length > 0) {
        const topSectionId = visibleEntries[0].target.id;
        setInternalActiveSection(topSectionId);
        onSectionChange?.(topSectionId);
      }
    };

    const observer = new IntersectionObserver(observerCallback, {
      root,
      rootMargin: "-15% 0px -40% 0px",
      threshold: [0.1, 0.25, 0.5, 0.75],
    });

    LANDING_SECTIONS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => {
      observer.disconnect();
    };
  }, [onSectionChange]);

  // 3. Authenticated Sidebar Detection & Dynamic Right-Offset (Supports RTL)
  useEffect(() => {
    const calculateSidebarOffset = () => {
      const isRtl = document.documentElement.dir === "rtl";
      const aside = document.querySelector("aside");

      if (isRtl && aside && window.innerWidth >= 1024) {
        const asideRect = aside.getBoundingClientRect();
        // In RTL, aside sits on the right of the viewport
        const occupiedWidth = Math.max(0, window.innerWidth - asideRect.left);
        setSidebarRightOffset(occupiedWidth);
      } else {
        setSidebarRightOffset(0);
      }
    };

    calculateSidebarOffset();
    window.addEventListener("resize", calculateSidebarOffset, { passive: true });

    const aside = document.querySelector("aside");
    let mutationObserver: MutationObserver | null = null;
    if (aside) {
      mutationObserver = new MutationObserver(calculateSidebarOffset);
      mutationObserver.observe(aside, {
        attributes: true,
        attributeFilter: ["class", "style"],
      });
      aside.addEventListener("mouseenter", calculateSidebarOffset);
      aside.addEventListener("mouseleave", calculateSidebarOffset);
      aside.addEventListener("transitionend", calculateSidebarOffset);
    }

    return () => {
      window.removeEventListener("resize", calculateSidebarOffset);
      mutationObserver?.disconnect();
      if (aside) {
        aside.removeEventListener("mouseenter", calculateSidebarOffset);
        aside.removeEventListener("mouseleave", calculateSidebarOffset);
        aside.removeEventListener("transitionend", calculateSidebarOffset);
      }
    };
  }, []);

  const handleBackToTop = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      smoothScrollToTop();
    },
    [],
  );

  const handleSectionClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      if (activeSection && activeSection !== "hero") {
        scrollToLandingSection(activeSection);
      } else {
        smoothScrollToTop();
      }
    },
    [activeSection],
  );

  // When at the very top, remain completely unobtrusive / hidden
  const isHidden = isAtTop || activeSection === "hero";
  const currentLabel = sectionLabels[activeSection] || sectionLabels.platform;

  return (
    <aside
      aria-label={t("navbar.floating.currentSection", "Current Section")}
      className={`fixed z-40 transition-all duration-300 ease-out select-none ${
        isHidden
          ? "opacity-0 pointer-events-none translate-y-3"
          : "opacity-100 pointer-events-auto translate-y-0"
      }`}
      style={{
        bottom: "1.5rem",
        right:
          sidebarRightOffset > 0
            ? `${sidebarRightOffset + 20}px`
            : "1.25rem",
      }}
    >
      <div className="flex items-center gap-2.5 rounded-full border border-[#2A3039] bg-[#13171D]/90 px-3.5 py-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.65),0_0_20px_rgba(91,229,132,0.12)] backdrop-blur-md transition-all duration-200 hover:border-[#5BE584]/50 group">
        {/* Active glowing beacon */}
        <span
          aria-hidden="true"
          className="h-2 w-2 shrink-0 rounded-full bg-[#5BE584] shadow-[0_0_8px_rgba(91,229,132,0.85)] animate-pulse"
        />

        {/* Section title click-target */}
        <button
          type="button"
          onClick={handleSectionClick}
          title={currentLabel}
          className="text-xs font-bold tracking-wide text-[#F8FAFC] transition-colors group-hover:text-[#5BE584] truncate max-w-[110px] sm:max-w-[160px] text-start focus-visible:outline-none focus-visible:underline"
        >
          {currentLabel}
        </button>

        {/* Vertical divider */}
        <span
          aria-hidden="true"
          className="h-3.5 w-px bg-[#2A3039]"
        />

        {/* Upward back-to-top button */}
        <button
          type="button"
          onClick={handleBackToTop}
          aria-label={t("navbar.floating.backToTop", "Scroll to top")}
          title={t("navbar.floating.backToTop", "Scroll to top")}
          className="flex h-6 w-6 items-center justify-center rounded-full bg-[#5BE584]/15 text-[#5BE584] transition-all duration-200 hover:bg-[#5BE584] hover:text-[#090B0F] hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5BE584]"
        >
          <ArrowUp className="h-3.5 w-3.5 stroke-[2.5]" />
        </button>
      </div>
    </aside>
  );
};

export default FloatingSectionNav;
