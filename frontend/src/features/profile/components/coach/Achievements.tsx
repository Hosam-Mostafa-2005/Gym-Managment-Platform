// src/features/profile/components/coach/Achievements.tsx
import React from "react";
import { Award, CheckCircle2, Lock } from "lucide-react";
import { ProfileSection } from "../shared/ProfileSection";
import type { CoachAchievement } from "../../types/profile.types";

interface AchievementsProps {
  achievements: CoachAchievement[];
}

export const Achievements: React.FC<AchievementsProps> = ({
  achievements = [],
}) => {
  return (
    <ProfileSection title="Achievements & Accreditations" icon={Award}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {achievements?.map((ach, idx) => {
          const isEarned = Boolean(ach.earned);
          return (
            <div
              key={idx}
              className={`flex flex-col justify-between p-4 rounded-lg border transition-colors ${isEarned ? "border-[#23422e] bg-[#101b14]" : "border-[#1e2329] bg-[#13171d]/60 opacity-75"}`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <span className="text-xs font-semibold text-gray-200 line-clamp-1">
                  {ach.title}
                </span>
                <span
                  className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider shrink-0 ${isEarned ? "bg-[#16291d] text-[#5BE584] border border-[#23422e]" : "bg-gray-800 text-gray-400 border border-gray-700"}`}
                >
                  {isEarned ? (
                    <CheckCircle2 className="h-2.5 w-2.5" />
                  ) : (
                    <Lock className="h-2.5 w-2.5" />
                  )}
                  {isEarned ? "Earned" : "Locked"}
                </span>
              </div>
              <p className="text-[11px] text-gray-400 leading-relaxed line-clamp-3">
                {ach.description}
              </p>
            </div>
          );
        })}
      </div>
    </ProfileSection>
  );
};
