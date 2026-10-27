// src/features/overview/pages/OverviewPage.tsx
import React from "react";
import LandingPage from "@/features/landing/pages/LandingPage";

/**
 * Public Overview Root
 *
 * Renders the complete 11-section STREN landing page for public visitors.
 * Authenticated role-based redirection is managed upstream in HomePage.tsx.
 */
export default function OverviewPage() {
  return <LandingPage />;
}
