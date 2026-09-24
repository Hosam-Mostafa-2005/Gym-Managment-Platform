// src/features/body-measurements/components/history/MeasurementRow.tsx
import React from "react";
import { Pencil, Trash2 } from "lucide-react";
import type { BodyMeasurement } from "../../types/body-measurements.types";

interface MeasurementRowProps {
  measurement: BodyMeasurement;
  onEdit: (m: BodyMeasurement) => void;
  onDelete: (m: BodyMeasurement) => void;
}

export const MeasurementRow: React.FC<MeasurementRowProps> = ({
  measurement,
  onEdit,
  onDelete,
}) => {
  const formatDate = (dateStr: string) =>
    new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(dateStr));
  const formatNumber = (num?: number | null) =>
    num !== undefined && num !== null ? Number(num.toFixed(1)) : "—";

  return (
    <tr className="border-b border-[#1E2329] transition-colors hover:bg-[#1E2329]/30">
      <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-300">
        {formatDate(measurement.measuredAt)}
      </td>
      <td className="whitespace-nowrap px-4 py-3 text-xs font-mono text-gray-200">
        {formatNumber(measurement.weight)}
      </td>
      <td className="whitespace-nowrap px-4 py-3 text-xs font-mono text-gray-200">
        {formatNumber(measurement.height)}
      </td>
      <td className="whitespace-nowrap px-4 py-3 text-xs font-mono text-gray-200">
        {formatNumber(measurement.bodyFat)}
      </td>
      <td className="whitespace-nowrap px-4 py-3 text-xs font-mono text-gray-200">
        {formatNumber(measurement.circumferences?.chest)}
      </td>
      <td className="whitespace-nowrap px-4 py-3 text-xs font-mono text-gray-200">
        {formatNumber(measurement.circumferences?.waist)}
      </td>
      <td className="px-4 py-3 text-xs text-gray-400 max-w-[200px] truncate">
        {measurement.notes || "—"}
      </td>
      <td className="whitespace-nowrap px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => onEdit(measurement)}
            aria-label="Edit Measurement"
            className="rounded p-1.5 text-gray-500 hover:bg-[#1E2329] hover:text-[#5BE584] transition-colors"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onDelete(measurement)}
            aria-label="Delete Measurement"
            className="rounded p-1.5 text-gray-500 hover:bg-red-500/10 hover:text-red-400 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
};
