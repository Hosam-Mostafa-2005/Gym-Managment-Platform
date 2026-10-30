// src/features/body-measurements/components/overview/LatestMeasurement.tsx
import React from "react";
import { Calendar, Ruler } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { BodyMeasurement } from "../../types/body-measurements.types";
import { MeasurementStatCard } from "../shared/MeasurementStatCard";

interface LatestMeasurementProps {
  measurement: BodyMeasurement | null;
}

export const LatestMeasurement: React.FC<LatestMeasurementProps> = ({
  measurement,
}) => {
  const { t, i18n } = useTranslation("bodyMeasurements");

  const formatDate = (dateStr: string) => {
    try {
      const locale = i18n.language === "ar" ? "ar-EG" : "en-US";
      return new Intl.DateTimeFormat(locale, {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(new Date(dateStr));
    } catch {
      return dateStr;
    }
  };

  const formatNumber = (num?: number | null) =>
    num !== undefined && num !== null ? Number(num.toFixed(1)) : "—";

  if (!measurement) {
    return (
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-gray-100">
          {t("overview.title")}
        </h2>
        <div className="flex min-h-[160px] flex-col items-center justify-center rounded-xl border border-[#1E2329] bg-[#0D1117] p-6 text-center">
          <Ruler className="mb-3 h-8 w-8 text-gray-500" />
          <h3 className="mb-1 text-sm font-medium text-gray-300">
            {t("overview.noMeasurementsTitle")}
          </h3>
          <p className="text-xs text-gray-500">
            {t("overview.noMeasurementsDescription")}
          </p>
        </div>
      </div>
    );
  }

  const c = measurement.circumferences || {};

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-gray-100">
        {t("overview.title")}
      </h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <MeasurementStatCard
          label={t("overview.weight")}
          value={formatNumber(measurement.weight)}
          unit={t("overview.unitKg")}
        />
        <MeasurementStatCard
          label={t("overview.height")}
          value={formatNumber(measurement.height)}
          unit={t("overview.unitCm")}
        />
        <MeasurementStatCard
          label={t("overview.bodyFat")}
          value={formatNumber(measurement.bodyFat)}
          unit={t("overview.unitPercent")}
        />
        <MeasurementStatCard
          label={t("overview.measuredAt")}
          value={formatDate(measurement.measuredAt)}
          icon={<Calendar />}
        />
      </div>

      {(Object.keys(c).length > 0 || measurement.notes) && (
        <div className="rounded-xl border border-[#1E2329] bg-[#0D1117] p-5">
          {Object.keys(c).length > 0 && (
            <div className="mb-4">
              <h4 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                {t("overview.circumferencesTitle", { unit: t("overview.unitCm") })}
              </h4>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                {Object.entries(c).map(
                  ([key, val]) =>
                    val !== undefined &&
                    val !== null && (
                      <div
                        key={key}
                        className="flex justify-between border-b border-[#1E2329] pb-1"
                      >
                        <span className="text-xs text-gray-400 capitalize">
                          {t(`circumferences.${key}` as any, {
                            defaultValue: key.replace(/([A-Z])/g, " $1"),
                          })}
                        </span>
                        <span className="font-mono text-xs font-medium text-gray-200">
                          {val}
                        </span>
                      </div>
                    ),
                )}
              </div>
            </div>
          )}
          {measurement.notes && (
            <div className="mt-4 border-t border-[#1E2329] pt-4">
              <h4 className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                {t("overview.notesTitle")}
              </h4>
              <p className="text-xs text-gray-300">{measurement.notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
