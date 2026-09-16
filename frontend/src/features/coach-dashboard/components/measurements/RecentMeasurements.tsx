// src/features/coach-dashboard/components/measurements/RecentMeasurements.tsx
import React from "react";
import { Link } from "react-router-dom";
import { Ruler, Calendar, CheckCircle2, User } from "lucide-react";
import type { RecentMeasurement } from "@/features/coach-dashboard/types/coach-dashboard.types";

interface RecentMeasurementsProps {
  measurements?: RecentMeasurement[];
}

export const RecentMeasurements: React.FC<RecentMeasurementsProps> = ({
  measurements = [],
}) => {
  const hasMeasurements = measurements && measurements.length > 0;

  const formatDate = (dateValue: string | Date | null) => {
    if (!dateValue) return "No record";
    try {
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(new Date(dateValue));
    } catch {
      return "Invalid date";
    }
  };

  return (
    <div className="flex flex-col rounded-lg border border-[#1e2329] bg-[#0d1014] overflow-hidden">
      {/* Section Header */}
      <div className="flex items-center justify-between border-b border-[#1e2329] px-5 py-4">
        <div className="flex items-center gap-2.5">
          <Ruler className="h-4 w-4 text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-100">
            Recent Measurements
          </h2>
        </div>
        {hasMeasurements && (
          <span className="inline-flex rounded-full bg-[#16291d] px-2.5 py-0.5 text-[10px] font-bold text-[#5BE584] uppercase tracking-wider border border-[#23422e]">
            {measurements.length} Recorded
          </span>
        )}
      </div>

      {/* Measurements List / Table */}
      {hasMeasurements ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="border-b border-[#1e2329] bg-[#13171d]/50 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
              <tr>
                <th scope="col" className="px-5 py-3 font-medium">
                  Member
                </th>
                <th scope="col" className="px-5 py-3 font-medium">
                  Weight
                </th>
                <th scope="col" className="px-5 py-3 font-medium">
                  Body Fat
                </th>
                <th scope="col" className="px-5 py-3 font-medium text-right">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2329]">
              {measurements.map((item, index) => {
                const memberId = item.member?.id;
                const memberName = item.member?.name || "Unknown Member";

                const weightDisplay =
                  item.weight !== null && item.weight !== undefined
                    ? `${item.weight} kg`
                    : "—";
                const bodyFatDisplay =
                  item.bodyFat !== null && item.bodyFat !== undefined
                    ? `${item.bodyFat}%`
                    : "—";

                return (
                  <tr
                    key={index}
                    className="transition-colors hover:bg-white/[0.02]"
                  >
                    {/* Member Column */}
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      {memberId ? (
                        <Link
                          to={`/members/${memberId}`}
                          className="font-semibold text-gray-200 hover:text-[#5BE584] transition-colors flex items-center gap-2"
                        >
                          <User className="h-3.5 w-3.5 text-gray-500" />
                          <span>{memberName}</span>
                        </Link>
                      ) : (
                        <span className="font-semibold text-gray-500">
                          {memberName}
                        </span>
                      )}
                    </td>

                    {/* Weight Column */}
                    <td className="px-5 py-3.5 whitespace-nowrap font-mono text-gray-300">
                      {weightDisplay}
                    </td>

                    {/* Body Fat Column */}
                    <td className="px-5 py-3.5 whitespace-nowrap font-mono text-gray-300">
                      {bodyFatDisplay}
                    </td>

                    {/* Date Column */}
                    <td className="px-5 py-3.5 whitespace-nowrap text-right text-gray-400">
                      <div className="flex items-center justify-end gap-1.5">
                        <Calendar className="h-3 w-3 text-gray-500" />
                        <span>{formatDate(item.measuredAt)}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#16291d] border border-[#23422e] mb-3">
            <CheckCircle2 className="h-5 w-5 text-[#5BE584]" />
          </div>
          <p className="text-sm font-semibold text-gray-200">
            No recent measurements
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            New body measurements will appear here when recorded.
          </p>
        </div>
      )}
    </div>
  );
};
