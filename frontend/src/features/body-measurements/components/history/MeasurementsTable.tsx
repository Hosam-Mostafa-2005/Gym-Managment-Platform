// src/features/body-measurements/components/history/MeasurementsTable.tsx
import React from "react";
import type { BodyMeasurement } from "../../types/body-measurements.types";
import { MeasurementRow } from "./MeasurementRow";
import { MeasurementsEmpty } from "../states/MeasurementsEmpty";

interface MeasurementsTableProps {
  measurements: BodyMeasurement[];
  onEdit: (m: BodyMeasurement) => void;
  onDelete: (m: BodyMeasurement) => void;
}

export const MeasurementsTable: React.FC<MeasurementsTableProps> = ({
  measurements,
  onEdit,
  onDelete,
}) => {
  if (measurements.length === 0) {
    return <MeasurementsEmpty />;
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-gray-100">
        Measurement History
      </h2>
      <div className="rounded-xl border border-[#1E2329] bg-[#0D1117] overflow-hidden overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#090B0F] text-[10px] font-semibold uppercase tracking-wider text-gray-500 border-b border-[#1E2329]">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Weight (kg)</th>
              <th className="px-4 py-3">Height (cm)</th>
              <th className="px-4 py-3">Body Fat (%)</th>
              <th className="px-4 py-3">Chest (cm)</th>
              <th className="px-4 py-3">Waist (cm)</th>
              <th className="px-4 py-3">Notes</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {measurements.map((m) => (
              <MeasurementRow
                key={m.id}
                measurement={m}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
