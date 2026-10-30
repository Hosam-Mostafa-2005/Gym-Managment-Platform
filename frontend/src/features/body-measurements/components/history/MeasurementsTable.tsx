// src/features/body-measurements/components/history/MeasurementsTable.tsx
import React from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation("bodyMeasurements");

  if (measurements.length === 0) {
    return <MeasurementsEmpty />;
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-gray-100">
        {t("history.title")}
      </h2>
      <div className="rounded-xl border border-[#1E2329] bg-[#0D1117] overflow-hidden overflow-x-auto">
        <table className="w-full min-w-[700px] text-left rtl:text-right text-sm">
          <thead className="bg-[#090B0F] text-[10px] font-semibold uppercase tracking-wider text-gray-500 border-b border-[#1E2329]">
            <tr>
              <th className="px-4 py-3">{t("history.colDate")}</th>
              <th className="px-4 py-3">{t("history.colWeight")}</th>
              <th className="px-4 py-3">{t("history.colHeight")}</th>
              <th className="px-4 py-3">{t("history.colBodyFat")}</th>
              <th className="px-4 py-3">{t("history.colChest")}</th>
              <th className="px-4 py-3">{t("history.colWaist")}</th>
              <th className="px-4 py-3">{t("history.colNotes")}</th>
              <th className="px-4 py-3 text-right rtl:text-left">{t("history.colActions")}</th>
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
