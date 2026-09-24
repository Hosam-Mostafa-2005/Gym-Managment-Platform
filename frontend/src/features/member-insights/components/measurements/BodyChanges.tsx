// src/features/member-insights/components/measurements/BodyChanges.tsx

import React from "react";
import type { BodyInsights } from "../../types/member-insights.types";

interface BodyChangesProps {
  insights: BodyInsights;
}

export const BodyChanges: React.FC<BodyChangesProps> = ({ insights }) => {
  const renderDelta = (val: number, unit: string) => {
    const isPositive = val > 0;
    const sign = isPositive ? "+" : "";
    return (
      <div className="flex flex-col gap-1 rounded-lg border border-[#1E2329] bg-[#090B0F] p-4">
        <span className="text-[10px] font-semibold tracking-wider text-gray-500 uppercase">
          {unit}
        </span>
        <span className="font-mono text-lg font-bold text-gray-200">
          {sign}
          {val}{" "}
          <span className="text-xs font-normal text-gray-500">
            {unit === "Weight" ? "kg" : unit === "Body Fat" ? "%" : "cm"}
          </span>
        </span>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-[#1E2329] bg-[#0D1014] p-6">
      <div className="mb-2">
        <h3 className="text-sm font-semibold text-gray-100">Body Changes</h3>
        <p className="text-xs text-gray-500">
          Change since previous measurement (Deltas)
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
        {renderDelta(insights.weight, "Weight")}
        {renderDelta(insights.bodyFat, "Body Fat")}
        {renderDelta(insights.chest, "Chest")}
        {renderDelta(insights.waist, "Waist")}
        {renderDelta(insights.hips, "Hips")}
        {renderDelta(insights.shoulders, "Shoulders")}
        {renderDelta(insights.neck, "Neck")}
        {renderDelta(insights.arms, "Arms")}
        {renderDelta(insights.thighs, "Thighs")}
        {renderDelta(insights.calves, "Calves")}
      </div>
    </div>
  );
};
