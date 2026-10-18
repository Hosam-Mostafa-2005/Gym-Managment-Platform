// src/features/landing/components/showcase/ProductShowcase.tsx
import React, { useState } from "react";
import { ProductTabs } from "./ProductTabs";
import { ProductPreview } from "./ProductPreview";

export const ProductShowcase = () => {
  const [activeTab, setActiveTab] = useState("coach-dashboard");

  const tabs = [
    { id: "coach-dashboard", label: "Dashboard" },
    { id: "members-management", label: "Members" },
    { id: "workout-builder", label: "Workout Builder" },
    { id: "member-insights", label: "Sessions & Insights" },
    { id: "body-measurements", label: "Body Metrics" },
  ];

  return (
    <section
      id="showcase"
      className="relative overflow-hidden border-b border-[#2A3039] bg-[linear-gradient(180deg,#090B0F_0%,#0C1017_50%,#090B0F_100%)] py-16 sm:py-24 px-4 sm:px-6 lg:px-8"
    >
      {/* Ambient spotlight behind preview window */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-10 left-1/2 -translate-x-1/2 h-[340px] w-[720px] rounded-full bg-[#5BE584]/[0.06] blur-[130px]"
      />

      <div className="relative z-10 mx-auto max-w-[1200px] flex flex-col items-center gap-8 sm:gap-10">
        <div className="text-center flex flex-col items-center gap-3">
          <span className="text-[11px] font-semibold text-[#5BE584] uppercase tracking-wider border border-[#5BE584]/30 bg-[#5BE584]/10 px-3 py-1 rounded-full">
            Interactive Workspace Preview
          </span>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-[-0.02em] text-[#F8FAFC]">
            Inspect the Real Product Modules.
          </h2>
          <p className="max-w-xl text-sm sm:text-base text-[#94A3B8]">
            Switch between core STREN views to see how coaches and members
            interact with workouts, assignments, sessions, and body metrics.
          </p>
        </div>

        <ProductTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          tabs={tabs}
        />

        <ProductPreview activeTab={activeTab} />
      </div>
    </section>
  );
};

