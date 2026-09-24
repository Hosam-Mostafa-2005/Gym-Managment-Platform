import React from "react";

export const CircumferenceFields: React.FC<{
  circumferences: any;
  handleCircumferenceChange: any;
}> = ({ circumferences, handleCircumferenceChange }) => {
  const fields = [
    { key: "chest", label: "Chest" },
    { key: "shoulders", label: "Shoulders" },
    { key: "neck", label: "Neck" },
    { key: "leftArm", label: "Left Arm" },
    { key: "rightArm", label: "Right Arm" },
    { key: "waist", label: "Waist" },
    { key: "hips", label: "Hips" },
    { key: "leftThigh", label: "Left Thigh" },
    { key: "rightThigh", label: "Right Thigh" },
    { key: "leftCalf", label: "Left Calf" },
    { key: "rightCalf", label: "Right Calf" },
  ];

  return (
    <div className="mt-4 border-t border-[#1E2329] pt-4">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
        Circumferences (cm)
      </h3>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {fields.map((f) => (
          <div key={f.key} className="flex flex-col gap-1.5">
            <label className="text-[10px] font-medium text-gray-400">
              {f.label}
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              name={f.key}
              value={circumferences[f.key] || ""}
              onChange={handleCircumferenceChange}
              className="h-8 w-full rounded-md border border-[#1E2329] bg-[#090B0F] px-2 text-xs text-gray-200 focus:border-[#5BE584] focus:outline-none"
            />
          </div>
        ))}
      </div>
    </div>
  );
};
