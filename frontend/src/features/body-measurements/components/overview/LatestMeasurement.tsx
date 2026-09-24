// src/features/body-measurements/components/overview/LatestMeasurement.tsx
import React from "react";
import { Calendar, Ruler } from "lucide-react";
import type { BodyMeasurement } from "../../types/body-measurements.types";
import { MeasurementStatCard } from "../shared/MeasurementStatCard";

interface LatestMeasurementProps {
  measurement: BodyMeasurement | null;
}

export const LatestMeasurement: React.FC<LatestMeasurementProps> = ({
  measurement,
}) => {
  if (!measurement) {
    return (
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-gray-100">
          Latest Measurement
        </h2>
        <div className="flex min-h-[160px] flex-col items-center justify-center rounded-xl border border-[#1E2329] bg-[#0D1117] p-6 text-center">
          <Ruler className="mb-3 h-8 w-8 text-gray-500" />
          <h3 className="mb-1 text-sm font-medium text-gray-300">
            No measurements recorded yet.
          </h3>
          <p className="text-xs text-gray-500">
            Add a measurement to start tracking this member's progress.
          </p>
        </div>
      </div>
    );
  }

  const formatNumber = (num?: number | null) =>
    num !== undefined && num !== null ? Number(num.toFixed(1)) : "—";
  const formatDate = (dateStr: string) =>
    new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(dateStr));
  const c = measurement.circumferences || {};

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-gray-100">
        Latest Measurement
      </h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <MeasurementStatCard
          label="Weight"
          value={formatNumber(measurement.weight)}
          unit="kg"
        />
        <MeasurementStatCard
          label="Height"
          value={formatNumber(measurement.height)}
          unit="cm"
        />
        <MeasurementStatCard
          label="Body Fat"
          value={formatNumber(measurement.bodyFat)}
          unit="%"
        />
        <MeasurementStatCard
          label="Measured At"
          value={formatDate(measurement.measuredAt)}
          icon={<Calendar />}
        />
      </div>

      {(Object.keys(c).length > 0 || measurement.notes) && (
        <div className="rounded-xl border border-[#1E2329] bg-[#0D1117] p-5">
          {Object.keys(c).length > 0 && (
            <div className="mb-4">
              <h4 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                Body Circumferences (cm)
              </h4>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                {Object.entries(c).map(
                  ([key, val]) =>
                    val !== undefined &&
                    val !== null && (
                      <div
                        key={key}
                        className="flex justify-between border-b border-[#1E2329] pb-1"
                      >
                        <span className="text-xs text-gray-400 capitalize">
                          {key.replace(/([A-Z])/g, " $1")}
                        </span>
                        <span className="font-mono text-xs font-medium text-gray-200">
                          {val}
                        </span>
                      </div>
                    ),
                )}
              </div>
            </div>
          )}
          {measurement.notes && (
            <div className="mt-4 border-t border-[#1E2329] pt-4">
              <h4 className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                Notes
              </h4>
              <p className="text-xs text-gray-300">{measurement.notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
