// src/features/body-measurements/components/form/BasicMeasurementsFields.tsx
import React from "react";

export const BasicMeasurementsFields: React.FC<{
  formData: any;
  handleChange: any;
}> = ({ formData, handleChange }) => (
  <div className="grid grid-cols-2 gap-4">
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-gray-300">Weight (kg) *</label>
      <input
        type="number"
        step="0.1"
        min="0"
        name="weight"
        value={formData.weight}
        onChange={handleChange}
        required
        className="h-9 w-full rounded-md border border-[#1E2329] bg-[#090B0F] px-3 text-xs text-gray-200 focus:border-[#5BE584] focus:outline-none"
      />
    </div>
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-gray-300">Height (cm) *</label>
      <input
        type="number"
        step="0.1"
        min="0"
        name="height"
        value={formData.height}
        onChange={handleChange}
        required
        className="h-9 w-full rounded-md border border-[#1E2329] bg-[#090B0F] px-3 text-xs text-gray-200 focus:border-[#5BE584] focus:outline-none"
      />
    </div>
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-gray-300">Body Fat (%)</label>
      <input
        type="number"
        step="0.1"
        min="0"
        max="100"
        name="bodyFat"
        value={formData.bodyFat}
        onChange={handleChange}
        className="h-9 w-full rounded-md border border-[#1E2329] bg-[#090B0F] px-3 text-xs text-gray-200 focus:border-[#5BE584] focus:outline-none"
      />
    </div>
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-gray-300">Measured At</label>
      <input
        type="datetime-local"
        name="measuredAt"
        value={formData.measuredAt}
        onChange={handleChange}
        className="h-9 w-full rounded-md border border-[#1E2329] bg-[#090B0F] px-3 text-xs text-gray-200 focus:border-[#5BE584] focus:outline-none"
        style={{ colorScheme: "dark" }}
      />
    </div>
  </div>
);
