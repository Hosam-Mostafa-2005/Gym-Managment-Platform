// src/features/body-measurements/components/shared/MeasurementsHeader.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus } from "lucide-react";

interface MeasurementsHeaderProps {
  memberId: string;
  onAddMeasurement: () => void;
}

export const MeasurementsHeader: React.FC<MeasurementsHeaderProps> = ({
  memberId,
  onAddMeasurement,
}) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-[#1E2329] pb-6">
      <div className="flex flex-col gap-2">
        <button
          onClick={() => navigate(`/members/${memberId}`)}
          className="inline-flex w-fit items-center gap-2 text-xs font-medium text-gray-400 transition-colors hover:text-[#5BE584]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Member
        </button>
        <h1 className="text-xl font-bold tracking-tight text-gray-100">
          Body Measurements
        </h1>
        <p className="text-xs text-gray-500">
          Track and manage body measurements over time.
        </p>
      </div>
      <button
        onClick={onAddMeasurement}
        className="inline-flex items-center gap-2 rounded-md bg-[#5BE584] px-4 py-2 text-xs font-semibold text-[#090B0F] transition-colors hover:bg-[#4ade80]"
      >
        <Plus className="h-4 w-4" />
        Add Measurement
      </button>
    </div>
  );
};
