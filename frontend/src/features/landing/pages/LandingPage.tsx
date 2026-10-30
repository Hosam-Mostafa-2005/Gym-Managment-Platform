// src/features/landing/pages/LandingPage.tsx
import React, { useState, useEffect } from "react";
import { LandingNavbar } from "../components/navigation/LandingNavbar";
import { FloatingSectionNav } from "../components/navigation/FloatingSectionNav";
import { HeroSection } from "../components/hero/HeroSection";
import { PlatformOverview } from "../components/overview/PlatformOverview";
import { CoachExperienceSection } from "../components/coaches/CoachExperienceSection";
import { MemberExperienceSection } from "../components/members/MemberExperienceSection";
import { HowItWorksSection } from "../components/how-it-works/HowItWorksSection";
import { FeaturesInContext } from "../components/features/FeaturesInContext";
import { DualPerspectiveSection } from "../components/comparison/DualPerspectiveSection";
import { ProductShowcase } from "../components/showcase/ProductShowcase";
import { FinalCTA } from "../components/cta/FinalCTA";
import { LandingFooter } from "../components/footer/LandingFooter";

/**
 * STREN Public & Platform Landing Page
 *
 * Fully redesigned, production-grade landing experience comprising 11 narrative sections:
 * - Section A: LandingNavbar (Sticky, responsive, role-aware, accessible drawer, active highlight)
 * - Section B: HeroSection (Editorial messaging, dual CTAs, live badge, HeroProductPreview)
 * - Section C: PlatformOverview (The Closed Coaching Loop architecture)
 * - Section D: CoachExperienceSection (Programming engine, roster management, targets)
 * - Section E: MemberExperienceSection (Live session logging, previous benchmarks, swap)
 * - Section F: HowItWorksSection (6-stage training lifecycle timeline)
 * - Section G: FeaturesInContext (Asymmetric bento grid of verified capabilities)
 * - Section H: DualPerspectiveSection (Side-by-side Coach vs Member perspectives)
 * - Section I: ProductShowcase (Interactive authentic UI preview with 4 tabs)
 * - Section J: FinalCTA (High-impact closing call to action)
 * - Section K: LandingFooter (Semantic links, valid routes, branding)
 * - Floating Section Nav: Intelligent right-aligned section indicator with back-to-top button
 */
export default function LandingPage() {
  const [activeSection, setActiveSection] = useState<string>("hero");

  useEffect(() => {
    window.scrollTo(0, 0);
    const main = document.querySelector("main.overflow-y-auto");
    if (main) {
      main.scrollTo(0, 0);
    }
  }, []);

  return (
    <div className="relative min-h-screen w-full bg-[#090B0F] text-[#F3F4F6] selection:bg-[#5BE584] selection:text-[#090B0F] font-sans overflow-x-hidden">
      {/* Top container specular highlight hairline */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 z-50 h-px bg-gradient-to-r from-transparent via-[#5BE584]/45 to-transparent"
      />

      {/* Section A: Navigation */}
      <LandingNavbar activeSection={activeSection} />

      {/* Main Narrative Flow */}
      <main className="relative z-10 flex w-full flex-col">
        {/* Section B: Hero */}
        <HeroSection />

        {/* Section C: Product Overview / The Big Idea */}
        <PlatformOverview />

        {/* Section D: The Coach Experience */}
        <CoachExperienceSection />

        {/* Section E: The Member Experience */}
        <MemberExperienceSection />

        {/* Section F: How It Works */}
        <HowItWorksSection />

        {/* Section G: Features in Context */}
        <FeaturesInContext />

        {/* Section H: Designed for Both Sides */}
        <DualPerspectiveSection />

        {/* Section I: Real Product Preview */}
        <ProductShowcase />

        {/* Section J: Final Call to Action */}
        <FinalCTA />
      </main>

      {/* Floating Section & Scroll Navigation Pill */}
      <FloatingSectionNav
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />

      {/* Section K: Semantic Footer */}
      <LandingFooter />
    </div>
  );
}
