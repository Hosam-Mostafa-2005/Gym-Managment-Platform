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
  // Optional: Scroll restoration or global landing page initialization
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="relative m-0 min-h-screen w-full bg-[#090B0F] p-0 text-gray-200 selection:bg-[#5BE584]/30 selection:text-white font-sans overflow-x-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#16291d]/10 via-[#090B0F]/80 to-[#090B0F]" />
        {/* Subtle noise texture overlay for premium SaaS feel */}
        <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-[0.015] mix-blend-overlay" />
      </div>

      {/* 
        Main Storytelling Flow 
        Sections are stacked dynamically. Visual transitions (borders, background shifts) 
        are handled within the individual components to maintain encapsulation.
      */}
      <main className="relative z-10 flex w-full flex-col">
        {/* Story Part 1: What is this? */}
        <HeroSection />

        {/* Story Part 2: What modules exist? */}
        <PlatformOverview />

        {/* Story Part 3: What problem does it solve? (The Fragmentation) */}
        <ProblemSection />

        {/* Story Part 4: How does everything connect? (The Solution) */}
        <ConnectedPlatform />

        {/* Story Part 5 & 6: How do Coaches and Members experience it? */}
        <JourneyTimeline />

        {/* Story Part 7: What does the actual product look like? */}
        <ProductShowcase />

        {/* Story Part 8: How do real-time events and notifications work? */}
        <NotificationStory />

        {/* Story Part 9: What is the complete feature breakdown? */}
        <FeatureEcosystem />

        {/* Story Part 10: Where is the platform going? (Current vs Future) */}
        <ProductRoadmap />

        {/* Story Part 11: Conclusion & Action */}
        <FinalCTA />
      </main>
    </div>
  );
}
