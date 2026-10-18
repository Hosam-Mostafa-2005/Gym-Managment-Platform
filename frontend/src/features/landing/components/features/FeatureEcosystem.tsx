// src/features/landing/components/features/FeatureEcosystem.tsx
import React from "react";
import { featureGroups } from "../../data/feature-groups";
import { FeatureGroup } from "./FeatureGroup";

export const FeatureEcosystem = () => {
  return (
    <section className="border-b border-[#2A3039] bg-[#090B0F] py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1200px]">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-[-0.02em] text-[#F8FAFC] mb-3">
            Complete Feature Ecosystem
          </h2>
          <p className="text-sm sm:text-base text-[#94A3B8]">
            A structured breakdown of the modules implemented in STREN today.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featureGroups.map((group, idx) => (
            <FeatureGroup
              key={idx}
              category={group.category}
              features={group.features}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
