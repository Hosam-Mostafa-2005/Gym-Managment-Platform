// src/features/body-measurements/components/form/MeasurementNotes.tsx
import React from "react";

export const MeasurementNotes: React.FC<{ value: string; onChange: any }> = ({
  value,
  onChange,
}) => (
  <div className="mt-4 flex flex-col gap-1.5 border-t border-[#1E2329] pt-4">
    <label className="text-xs font-medium text-gray-300">Notes</label>
    <textarea
      name="notes"
      value={value}
      onChange={onChange}
      rows={3}
      className="w-full resize-y rounded-md border border-[#1E2329] bg-[#090B0F] p-3 text-xs text-gray-200 focus:border-[#5BE584] focus:outline-none"
      placeholder="Add any additional observations..."
    />
  </div>
);
