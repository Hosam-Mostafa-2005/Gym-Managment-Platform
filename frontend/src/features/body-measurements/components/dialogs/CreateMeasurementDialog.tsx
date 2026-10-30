// src/features/body-measurements/components/dialogs/CreateMeasurementDialog.tsx
import React from "react";
import { useTranslation } from "react-i18next";
import { MeasurementForm } from "../form/MeasurementForm";
import type { MeasurementFormPayload } from "../form/MeasurementForm";
import { useCreateMeasurement } from "../../hooks/use-create-measurement";

export const CreateMeasurementDialog: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  memberId: string;
  trainerId?: string;
}> = ({ isOpen, onClose, memberId, trainerId }) => {
  const { mutate, isPending } = useCreateMeasurement();
  const { t } = useTranslation("bodyMeasurements");

  if (!isOpen) return null;

  const handleSubmit = (payload: MeasurementFormPayload) => {
    const data: any = {
      ...payload,
      member: memberId,
    };

    if (trainerId && trainerId.trim() !== "") {
      data.trainer = trainerId;
    }

    mutate(data, {
      onSuccess: () => onClose(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-xl max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-xl border border-[#1E2329] bg-[#0D1117] p-4 sm:p-6 shadow-2xl text-left rtl:text-right">
        <h2 className="text-lg font-bold text-gray-100 mb-1">
          {t("dialogs.create.title")}
        </h2>
        <p className="text-xs text-gray-400 mb-6">
          {t("dialogs.create.description")}
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
