// src/features/member-profile/components/overview/LatestMeasurement.tsx

import React from "react";
import { Scale, Ruler, Percent } from "lucide-react";
import type { MemberMeasurement } from "../../types/member-profile.types";

interface LatestMeasurementProps {
  measurement: MemberMeasurement | null;
}

export const LatestMeasurement: React.FC<LatestMeasurementProps> = ({
  measurement,
}) => {
  if (!measurement) {
    return (
      <div className="flex h-full min-h-[220px] flex-col items-center justify-center rounded-xl border border-[#1E2329] bg-[#0D1117] p-6 text-center">
        <Scale className="mb-3 h-8 w-8 text-gray-500" />
        <h3 className="mb-1 text-sm font-medium text-gray-300">
          No measurements
        </h3>
        <p className="text-xs text-gray-500">
          No physical measurements recorded yet.
        </p>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(dateStr));
  };

  return (
    <div className="flex h-full flex-col rounded-xl border border-[#1E2329] bg-[#0D1117] p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-medium uppercase tracking-wider text-gray-400">
          Latest Body Stats
        </h3>
        <span className="text-xs text-gray-500">
          {formatDate(measurement.measuredAt)}
        </span>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4 rounded-lg border border-[#1E2329] bg-[#090B0F] p-4">
          <Scale className="h-5 w-5 text-gray-400" />
          <div>
            <p className="text-xs text-gray-500">Weight</p>
            <p className="font-semibold text-gray-100">
              {measurement.weight ?? "—"}{" "}
              <span className="text-xs font-normal text-gray-500">kg</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-lg border border-[#1E2329] bg-[#090B0F] p-4">
          <Ruler className="h-5 w-5 text-gray-400" />
          <div>
            <p className="text-xs text-gray-500">Height</p>
            <p className="font-semibold text-gray-100">
              {measurement.height ?? "—"}{" "}
              <span className="text-xs font-normal text-gray-500">cm</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-lg border border-[#1E2329] bg-[#090B0F] p-4">
          <Percent className="h-5 w-5 text-gray-400" />
          <div>
            <p className="text-xs text-gray-500">Body Fat</p>
            <p className="font-semibold text-gray-100">
              {measurement.bodyFat ?? "—"}{" "}
              <span className="text-xs font-normal text-gray-500">%</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
