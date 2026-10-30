// src/features/member-profile/components/gamification/MemberGamificationSection.tsx

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Trophy,
  Flame,
  Target,
  Sparkles,
  Award,
} from "lucide-react";
import { useMemberGamification } from "@/features/gamification/hooks/useGamification";
import { EncourageMemberDialog } from "@/features/gamification/components/EncourageMemberDialog";

interface MemberGamificationSectionProps {
  memberId: string;
  memberName: string;
}

export const MemberGamificationSection: React.FC<MemberGamificationSectionProps> = ({
  memberId,
  memberName,
}) => {
  const { t } = useTranslation(["achievements"]);
  const [isEncourageOpen, setIsEncourageOpen] = useState(false);
  const { data, isLoading } = useMemberGamification(memberId);

  if (isLoading) {
    return (
      <div className="rounded-xl border border-[#1E2329] bg-[#101418] p-6 animate-pulse">
        <div className="h-6 w-48 rounded bg-[#161B22] mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 rounded-lg bg-[#161B22]" />
          ))}
        </div>
      </div>
    );
  }

  if (!data?.gamification) {
    return null;
  }

  const { streak, weeklyGoal, summary, achievements } = data.gamification;
  const earnedBadges = achievements.filter((a) => a.isEarned);

  return (
    <div className="rounded-xl border border-[#1E2329] bg-[#101418] p-6">
      {/* Section Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[#1E2329] pb-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-yellow-500/30 bg-yellow-500/15 text-yellow-400">
            <Trophy className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              {t("memberSection.title")}
            </h3>
            <p className="text-xs text-gray-400">
              {t("memberSection.subtitle", { name: memberName })}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsEncourageOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-2 text-xs font-bold text-yellow-400 transition-colors hover:bg-yellow-500/20"
        >
          <Sparkles className="h-4 w-4" />
          {t("memberSection.encourageBtn")}
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        {/* Streak */}
        <div className="rounded-xl border border-[#1E2329] bg-[#090B0F] p-4">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span className="flex items-center gap-1.5 font-medium text-orange-400">
              <Flame className="h-4 w-4" /> {t("memberSection.currentStreak")}
            </span>
            <span className="text-[11px] text-gray-500">
              {t("memberSection.bestDays", { count: streak.longestStreak })}
            </span>
          </div>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-2xl font-black text-white">{streak.currentStreak}</span>
            <span className="text-xs text-gray-400">
              {streak.currentStreak === 1 ? t("kpi.streak.day") : t("kpi.streak.days")}
            </span>
          </div>
        </div>

        {/* Weekly Goal */}
        <div className="rounded-xl border border-[#1E2329] bg-[#090B0F] p-4">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span className="flex items-center gap-1.5 font-medium text-[#5BE584]">
              <Target className="h-4 w-4" /> {t("memberSection.thisWeek")}
            </span>
            <span className="text-[11px] font-bold text-[#5BE584]">{weeklyGoal.percent}%</span>
          </div>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-2xl font-black text-white">{weeklyGoal.completedThisWeek}</span>
            <span className="text-xs text-gray-400">
              {t("memberSection.workoutsCount", { count: weeklyGoal.targetWorkouts })}
            </span>
          </div>
        </div>

        {/* Badges Earned */}
        <div className="rounded-xl border border-[#1E2329] bg-[#090B0F] p-4">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span className="flex items-center gap-1.5 font-medium text-purple-400">
              <Award className="h-4 w-4" /> {t("memberSection.badgesEarned")}
            </span>
            <span className="text-[11px] text-gray-400">
              {summary.totalPoints} {t("kpi.points.badge")}
            </span>
          </div>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-2xl font-black text-white">{summary.totalEarned}</span>
            <span className="text-xs text-gray-400">/ {summary.totalAvailable}</span>
          </div>
        </div>
      </div>

      {/* Earned Badges Mini Showcase */}
      {earnedBadges.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2.5">
            {t("memberSection.recentUnlockedBadges")}
          </h4>
          <div className="flex flex-wrap gap-2">
            {earnedBadges.slice(0, 6).map((badge) => {
              const displayName = t(`items.${badge.code}.title` as any, {
                defaultValue: badge.name || badge.title || "Achievement",
              });

              return (
                <div
                  key={badge.id}
                  className="flex items-center gap-2 rounded-lg border border-[#1E2329] bg-[#090B0F] px-3 py-1.5"
                >
                  <Award className="h-3.5 w-3.5 text-[#5BE584]" />
                  <span className="text-xs font-semibold text-gray-200">{displayName}</span>
                  <span className="rounded bg-[#161B22] px-1.5 py-0.5 text-[9px] font-bold text-[#5BE584]">
                    +{badge.points}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Encourage Modal */}
      <EncourageMemberDialog
        memberId={memberId}
        memberName={memberName}
        isOpen={isEncourageOpen}
        onClose={() => setIsEncourageOpen(false)}
      />
    </div>
  );
};
