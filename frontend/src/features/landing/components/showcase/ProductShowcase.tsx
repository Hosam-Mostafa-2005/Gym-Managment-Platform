// src/features/landing/components/showcase/ProductShowcase.tsx
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { ProductTabs } from "./ProductTabs";
import { ProductPreview } from "./ProductPreview";
import { Sparkles } from "lucide-react";

export const ProductShowcase: React.FC = () => {
  const { t } = useTranslation(["landing"]);
  const [activeTab, setActiveTab] = useState("coach-dashboard");

  const tabs = [
    { id: "coach-dashboard", label: t("showcase.tabs.coachDashboard") },
    { id: "workout-builder", label: t("showcase.tabs.workoutBuilder") },
    { id: "active-session", label: t("showcase.tabs.activeSession") },
    { id: "body-measurements", label: t("showcase.tabs.bodyMeasurements") },
  ];

  return (
    <section
      id="preview"
      className="relative overflow-hidden border-b border-[#2A3039] bg-[linear-gradient(180deg,#090B0F_0%,#0C1017_50%,#090B0F_100%)] py-16 sm:py-24 px-4 sm:px-6 lg:px-8"
    >
      {/* Ambient spotlight behind preview window */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-10 left-1/2 -translate-x-1/2 h-[340px] w-[720px] rounded-full bg-[#5BE584]/[0.06] blur-[130px]"
      />

      <div className="relative z-10 mx-auto max-w-[1240px] flex flex-col items-center gap-8 sm:gap-10">
        <div className="text-center flex flex-col items-center gap-3 max-w-3xl">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#5BE584] uppercase tracking-wider border border-[#5BE584]/30 bg-[#5BE584]/10 px-3 py-1 rounded-full">
            <Sparkles className="h-3.5 w-3.5" />
            {t("showcase.badge")}
          </span>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-[-0.03em] text-[#F8FAFC]">
            {t("showcase.headline")}
          </h2>
          <p className="max-w-xl text-sm sm:text-base text-[#A7B0BC] leading-relaxed">
            {t("showcase.description")}
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

export default ProductShowcase;
