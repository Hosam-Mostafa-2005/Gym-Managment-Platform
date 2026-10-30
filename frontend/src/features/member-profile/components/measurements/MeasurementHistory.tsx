// src/features/member-profile/components/measurements/MeasurementHistory.tsx

import React from "react";
import { useTranslation } from "react-i18next";
import type { MemberMeasurement } from "../../types/member-profile.types";

interface MeasurementHistoryProps {
  measurements: MemberMeasurement[];
}

export const MeasurementHistory: React.FC<MeasurementHistoryProps> = ({
  measurements,
}) => {
  const { t, i18n } = useTranslation("profile");
  const currentLang = i18n.language.startsWith("ar") ? "ar" : "en";

  const formatDate = (dateStr: string) => {
    try {
      return new Intl.DateTimeFormat(
        currentLang === "ar" ? "ar-EG" : "en-US",
        {
          month: "short",
          day: "numeric",
          year: "numeric",
        }
      ).format(new Date(dateStr));
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-gray-100">
        {t("member.measurementHistory.title")}
      </h2>
      <div className="rounded-xl border border-[#1E2329] bg-[#0D1117] overflow-hidden">
        {measurements.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500">
            {t("member.measurementHistory.empty")}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[540px] text-left rtl:text-right text-sm text-gray-300">
              <thead className="border-b border-[#1E2329] bg-[#090B0F] text-xs uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-6 py-4 font-medium">
                    {t("member.measurementHistory.colDate")}
                  </th>
                  <th className="px-6 py-4 font-medium">
                    {t("member.measurementHistory.colWeight")}
                  </th>
                  <th className="px-6 py-4 font-medium">
                    {t("member.measurementHistory.colHeight")}
                  </th>
                  <th className="px-6 py-4 font-medium">
                    {t("member.measurementHistory.colBodyFat")}
                  </th>
                  <th className="px-6 py-4 font-medium">
                    {t("member.measurementHistory.colNotes")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E2329]">
                {measurements.map((m) => (
                  <tr
                    key={m.id}
                    className="transition-colors hover:bg-[#1E2329]/30"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      {formatDate(m.measuredAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-100">
                      {m.weight ?? t("member.measurementHistory.unspecified")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {m.height ?? t("member.measurementHistory.unspecified")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {m.bodyFat ?? t("member.measurementHistory.unspecified")}
                    </td>
                    <td className="px-6 py-4 text-gray-400 max-w-xs truncate">
                      {m.notes ?? t("member.measurementHistory.unspecified")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
