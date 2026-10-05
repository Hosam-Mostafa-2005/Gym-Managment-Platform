// src/features/landing/components/features/FeatureEcosystem.tsx
import React from "react";
import { featureGroups } from "../../data/feature-groups";
import { FeatureGroup } from "./FeatureGroup";

export const FeatureEcosystem = () => {
  return (
    <section className="bg-[#090B0F] py-32 px-6">
      <div className="mx-auto max-w-[1200px]">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-white mb-4">
            Complete Feature Ecosystem
          </h2>
          <p className="text-sm text-gray-400">
            A structured breakdown of our mission-critical modules available
            today.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
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
