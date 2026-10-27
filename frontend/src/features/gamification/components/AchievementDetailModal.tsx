// src/features/gamification/components/AchievementDetailModal.tsx

import React from "react";
import {
  X,
  Trophy,
  Flame,
  Dumbbell,
  Target,
  Zap,
  Scale,
  Apple,
  Award,
  CheckCircle,
  Lock,
  Calendar,
} from "lucide-react";
import type { AchievementWithStatus } from "../types/gamification.types";
import { calculateAchievementProgress } from "../utils/achievement-progress";

interface AchievementDetailModalProps {
  achievement: AchievementWithStatus | null;
  onClose: () => void;
}

const getBadgeIcon = (iconName: string) => {
  switch (iconName?.toLowerCase()) {
    case "flame":
    case "fire":
      return <Flame className="h-10 w-10" />;
    case "trophy":
      return <Trophy className="h-10 w-10" />;
    case "dumbbell":
      return <Dumbbell className="h-10 w-10" />;
    case "target":
      return <Target className="h-10 w-10" />;
    case "zap":
    case "lightning":
      return <Zap className="h-10 w-10" />;
    case "scale":
      return <Scale className="h-10 w-10" />;
    case "apple":
    case "nutrition":
      return <Apple className="h-10 w-10" />;
    default:
      return <Award className="h-10 w-10" />;
  }
};

export const AchievementDetailModal: React.FC<AchievementDetailModalProps> = ({
  achievement,
  onClose,
}) => {
  if (!achievement) return null;

  const {
    description,
    tier,
    points,
    category,
    badgeIcon,
    isEarned,
    earnedAt,
  } = achievement;

  const displayName = achievement.name || achievement.title || "Achievement";
  const { current, target, percent } = calculateAchievementProgress(achievement);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div
        className="relative w-full max-w-md rounded-2xl border border-[#2A313A] bg-[#101418] p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-[#1E2329] hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Badge Icon Banner */}
        <div className="flex flex-col items-center text-center mt-2">
          <div
            className={`flex h-20 w-20 items-center justify-center rounded-2xl border ${
              isEarned
                ? "border-[#5BE584]/40 bg-[#5BE584]/15 text-[#5BE584] shadow-[0_0_30px_rgba(91,229,132,0.25)]"
                : "border-[#1E2329] bg-[#161B22] text-gray-500"
            }`}
          >
            {getBadgeIcon(badgeIcon)}
          </div>

          <div className="mt-4 flex items-center gap-2">
            <span className="rounded-full border border-gray-700 bg-gray-800/80 px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase text-gray-300">
              {tier} TIER
            </span>
            <span className="rounded-full border border-green-500/30 bg-green-500/15 px-2.5 py-0.5 text-[10px] font-bold text-[#5BE584]">
              +{points} XP
            </span>
            <span className="rounded-full border border-gray-700 bg-gray-800/80 px-2.5 py-0.5 text-[10px] font-bold text-gray-400">
              {category}
            </span>
          </div>

          <h3 className="mt-3 text-xl font-bold text-white flex items-center gap-2">
            {displayName}
            {isEarned && <CheckCircle className="h-5 w-5 text-[#5BE584]" />}
          </h3>

          <p className="mt-2 text-sm text-gray-300 leading-relaxed max-w-sm">
            {description}
          </p>
        </div>

        {/* Progress or Completion Details */}
        <div className="mt-6 rounded-xl border border-[#1E2329] bg-[#090B0F] p-4">
          {isEarned ? (
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400 flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-[#5BE584]" /> Status
              </span>
              <span className="font-semibold text-[#5BE584]">
                Unlocked & Completed
              </span>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-gray-400 flex items-center gap-1.5">
                  <Lock className="h-4 w-4 text-gray-500" /> Goal Requirement
                </span>
                <span className="font-semibold text-gray-200">
                  {current} / {target} ({percent}%)
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-[#161B22] overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#5BE584] transition-all duration-500"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          )}

          {earnedAt && (
            <div className="mt-3 pt-3 border-t border-[#1E2329] flex items-center justify-between text-xs">
              <span className="text-gray-400 flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-gray-400" /> Unlocked Date
              </span>
              <span className="font-medium text-gray-200">
                {new Date(earnedAt).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="mt-6">
          <button
            onClick={onClose}
            className="w-full rounded-xl bg-[#1E2329] py-2.5 text-xs font-semibold text-gray-200 transition-colors hover:bg-[#2A313A] hover:text-white"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
