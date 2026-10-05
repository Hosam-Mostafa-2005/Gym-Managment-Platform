// src/features/landing/components/showcase/ProductShowcase.tsx
import React, { useState } from "react";
import { ProductTabs } from "./ProductTabs";
import { ProductPreview } from "./ProductPreview";

export const ProductShowcase = () => {
  const [activeTab, setActiveTab] = useState("coach-dashboard");

  const tabs = [
    { id: "coach-dashboard", label: "Dashboard" },
    { id: "members-management", label: "Members" },
    { id: "workout-builder", label: "Workouts" },
    { id: "member-insights", label: "Insights" },
    { id: "body-measurements", label: "Metrics" },
  ];

  return (
    <section className="bg-[#090B0F] py-32 px-6">
      <div className="mx-auto max-w-[1200px] flex flex-col items-center gap-12">
        <div className="text-center flex flex-col items-center gap-4">
          <span className="text-[10px] font-bold text-[#5BE584] uppercase tracking-widest border border-[#5BE584]/20 bg-[#5BE584]/10 px-3 py-1 rounded-full">
            Interactive Preview
          </span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white">
            Explore the Architecture.
          </h2>
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
