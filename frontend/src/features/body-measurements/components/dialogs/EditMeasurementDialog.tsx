// src/features/body-measurements/components/dialogs/EditMeasurementDialog.tsx
import React from "react";
import { MeasurementForm } from "../form/MeasurementForm";
import type { MeasurementFormPayload } from "../form/MeasurementForm";
import { useUpdateMeasurement } from "../../hooks/use-update-measurement";
import type { BodyMeasurement } from "../../types/body-measurements.types";

export const EditMeasurementDialog: React.FC<{
  measurement: BodyMeasurement | null;
  onClose: () => void;
  memberId: string;
}> = ({ measurement, onClose, memberId }) => {
  const { mutate, isPending } = useUpdateMeasurement(memberId);

  if (!measurement) return null;

  const handleSubmit = (payload: MeasurementFormPayload) => {
    mutate(
      { id: measurement.id, data: payload },
      {
        onSuccess: () => onClose(),
      },
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-xl max-h-[85vh] overflow-y-auto rounded-xl border border-[#1E2329] bg-[#0D1117] p-6 shadow-2xl">
        <h2 className="text-lg font-bold text-gray-100 mb-1">
          Edit Body Measurement
        </h2>
        <p className="text-xs text-gray-400 mb-6">
          Update the details for this historical measurement.
        </p>
        <MeasurementForm
          initialValues={measurement}
          onSubmit={handleSubmit}
          isSubmitting={isPending}
          onCancel={onClose}
        />
      </div>
    </div>
  );
};
