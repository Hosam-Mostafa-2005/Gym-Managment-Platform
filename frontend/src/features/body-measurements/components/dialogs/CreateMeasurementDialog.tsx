// src/features/body-measurements/components/dialogs/CreateMeasurementDialog.tsx
import React from "react";
import { MeasurementForm } from "../form/MeasurementForm";
import type { MeasurementFormPayload } from "../form/MeasurementForm";
import { useCreateMeasurement } from "../../hooks/use-create-measurement";

export const CreateMeasurementDialog: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  memberId: string;
  trainerId: string;
}> = ({ isOpen, onClose, memberId, trainerId }) => {
  const { mutate, isPending } = useCreateMeasurement();

  if (!isOpen) return null;

  const handleSubmit = (payload: MeasurementFormPayload) => {
    mutate(
      { ...payload, member: memberId, trainer: trainerId },
      {
        onSuccess: () => onClose(),
      },
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-xl max-h-[85vh] overflow-y-auto rounded-xl border border-[#1E2329] bg-[#0D1117] p-6 shadow-2xl">
        <h2 className="text-lg font-bold text-gray-100 mb-1">
          Add Body Measurement
        </h2>
        <p className="text-xs text-gray-400 mb-6">
          Record a new body measurement for this member.
        </p>
        <MeasurementForm
          onSubmit={handleSubmit}
          isSubmitting={isPending}
          onCancel={onClose}
        />
      </div>
    </div>
  );
};
