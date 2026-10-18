// src/features/landing/pages/LandingPage.tsx

import React, { useEffect } from "react";

// 1. Hero
import { HeroSection } from "../components/hero/HeroSection";

// 2. Platform Overview
import { PlatformOverview } from "../components/overview/PlatformOverview";

// 3. The Problem
import { ProblemSection } from "../components/problem/ProblemSection";

// 4. The Connected Platform
import { ConnectedPlatform } from "../components/ecosystem/ConnectedPlatform";

// 5 & 6. Coach & Member Journeys (Encapsulated in Timeline)
import { JourneyTimeline } from "../components/journeys/JourneyTimeline";

// 7. Product Showcase
import { ProductShowcase } from "../components/showcase/ProductShowcase";

// 8. Notification Story
import { NotificationStory } from "../components/notifications/NotificationStory";

// 9. Feature Ecosystem
import { FeatureEcosystem } from "../components/features/FeatureEcosystem";

// 10. Product Roadmap
import { ProductRoadmap } from "../components/roadmap/ProductRoadmap";

// 11. Final CTA
import { FinalCTA } from "../components/cta/FinalCTA";

/**
 * Main Landing Page Composition
 *
 * Orchestrates the narrative flow of the gym management platform.
 * Relies on the existing global public layout for Navbar and Footer.
 */
export default function LandingPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="relative m-0 min-h-screen w-full rounded-[20px] border border-[#2A3039] bg-[#090B0F] p-0 text-[#F8FAFC] shadow-[0_20px_60px_rgba(0,0,0,0.45)] selection:bg-[#5BE584] selection:text-[#090B0F] font-sans overflow-x-hidden">
      {/* Top container specular hairline */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-20 h-px bg-gradient-to-r from-transparent via-[#5BE584]/45 to-transparent"
      />
      <main className="relative z-10 flex w-full flex-col">
        <HeroSection />
        <PlatformOverview />
        <ProblemSection />
        <ConnectedPlatform />
        <JourneyTimeline />
        <ProductShowcase />
        <NotificationStory />
        <FeatureEcosystem />
        <ProductRoadmap />
        <FinalCTA />
      </main>
    </div>
  );
}

