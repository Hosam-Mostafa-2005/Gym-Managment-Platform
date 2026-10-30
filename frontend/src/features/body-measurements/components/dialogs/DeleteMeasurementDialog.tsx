// src/features/body-measurements/components/dialogs/DeleteMeasurementDialog.tsx
import React from "react";
import { useTranslation } from "react-i18next";
import { useDeleteMeasurement } from "../../hooks/use-delete-measurement";
import type { BodyMeasurement } from "../../types/body-measurements.types";

export const DeleteMeasurementDialog: React.FC<{
  measurement: BodyMeasurement | null;
  onClose: () => void;
  memberId: string;
}> = ({ measurement, onClose, memberId }) => {
  const { mutate, isPending } = useDeleteMeasurement(memberId);
  const { t } = useTranslation("bodyMeasurements");

  if (!measurement) return null;

  const handleDelete = () => {
    mutate(measurement.id, { onSuccess: () => onClose() });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-xl border border-red-500/20 bg-[#0D1117] p-6 shadow-2xl text-left rtl:text-right">
        <h2 className="text-lg font-bold text-gray-100 mb-2">
          {t("dialogs.delete.title")}
        </h2>
        <p className="text-sm text-gray-400 mb-6">
          {t("dialogs.delete.description")}
        </p>
        <div className="flex justify-end rtl:justify-start gap-3">
          <button
            onClick={onClose}
            disabled={isPending}
            className="rounded-md border border-[#1E2329] bg-[#090B0F] px-4 py-2 text-xs font-medium text-gray-300 transition-colors hover:bg-[#1E2329]"
          >
            {t("dialogs.delete.cancel")}
          </button>
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="rounded-md bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-400 transition-colors hover:bg-red-500/20 border border-red-500/20"
          >
            {isPending ? t("dialogs.delete.deleting") : t("dialogs.delete.confirm")}
          </button>
        </div>
      </div>
    </div>
  );
};
