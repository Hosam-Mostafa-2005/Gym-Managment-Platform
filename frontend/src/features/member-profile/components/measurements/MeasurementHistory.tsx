// src/features/member-profile/components/measurements/MeasurementHistory.tsx

import React from "react";
import type { MemberMeasurement } from "../../types/member-profile.types";

interface MeasurementHistoryProps {
  measurements: MemberMeasurement[];
}

export const MeasurementHistory: React.FC<MeasurementHistoryProps> = ({
  measurements,
}) => {
  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(dateStr));
  };

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-gray-100">
        Measurement History
      </h2>
      <div className="rounded-xl border border-[#1E2329] bg-[#0D1117] overflow-hidden">
        {measurements.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500">
            No measurement history available.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="border-b border-[#1E2329] bg-[#090B0F] text-xs uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Weight (kg)</th>
                  <th className="px-6 py-4 font-medium">Height (cm)</th>
                  <th className="px-6 py-4 font-medium">Body Fat (%)</th>
                  <th className="px-6 py-4 font-medium">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E2329]">
                {measurements.map((m) => (
                  <tr
                    key={m.id}
                    className="transition-colors hover:bg-[#1E2329]/30"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      {formatDate(m.measuredAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-100">
                      {m.weight ?? "—"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {m.height ?? "—"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {m.bodyFat ?? "—"}
                    </td>
                    <td className="px-6 py-4 text-gray-400 max-w-xs truncate">
                      {m.notes ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
