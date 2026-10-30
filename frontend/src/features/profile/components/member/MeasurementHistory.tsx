// src/features/profile/components/member/MeasurementHistory.tsx
import React from "react";
import { Ruler, Calendar } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ProfileSection } from "../shared/ProfileSection";
import type { MemberMeasurement } from "../../types/profile.types";

interface MeasurementHistoryProps {
  measurements: MemberMeasurement[];
}

export const MeasurementHistory: React.FC<MeasurementHistoryProps> = ({
  measurements = [],
}) => {
  const { t, i18n } = useTranslation(["profile"]);

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "—";
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

  return (
    <ProfileSection
      title={t("member.measurementHistory.title")}
      subtitle={t("member.measurementHistory.subtitle")}
      icon={Ruler}
    >
      {measurements?.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px] text-start text-xs text-gray-300">
            <thead className="border-b border-[#1e2329] bg-[#13171d]/50 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium text-start">
                  {t("member.measurementHistory.recordedDate")}
                </th>
                <th scope="col" className="px-4 py-3 font-medium text-start">
                  {t("member.measurementHistory.weight")}
                </th>
                <th scope="col" className="px-4 py-3 font-medium text-start">
                  {t("member.measurementHistory.bodyFat")}
                </th>
                <th scope="col" className="px-4 py-3 font-medium text-start">
                  {t("member.measurementHistory.height")}
                </th>
                <th scope="col" className="px-4 py-3 font-medium text-end">
                  {t("member.measurementHistory.notes")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2329]">
              {measurements.map((item, idx) => (
                <tr
                  key={item.id || idx}
                  className="transition-colors hover:bg-white/[0.02]"
                >
                  <td className="px-4 py-3 whitespace-nowrap text-gray-400">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3 w-3 text-gray-500" />
                      <span>
                        {formatDate(item.measuredAt || item.createdAt)}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap font-mono text-gray-200">
                    {item.weight !== null && item.weight !== undefined
                      ? `${item.weight} ${t("member.overview.kg")}`
                      : "—"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap font-mono text-gray-200">
                    {item.bodyFat !== null && item.bodyFat !== undefined
                      ? `${item.bodyFat}%`
                      : "—"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap font-mono text-gray-200">
                    {item.height !== null && item.height !== undefined
                      ? `${item.height} ${t("member.overview.cm")}`
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-end text-gray-400 truncate max-w-[200px]">
                    {item.notes || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="py-8 text-center text-xs text-gray-500">
          {t("member.measurementHistory.empty")}
        </div>
      )}
    </ProfileSection>
  );
};

export default MeasurementHistory;
