// src/features/gamification/components/BadgeCard.tsx

import React from "react";
import {
  Trophy,
  Flame,
  Dumbbell,
  Target,
  Zap,
  Scale,
  Apple,
  Award,
  Lock,
  CheckCircle,
} from "lucide-react";
import type { AchievementWithStatus, AchievementTier } from "../types/gamification.types";

interface BadgeCardProps {
  achievement: AchievementWithStatus;
  onClick: (achievement: AchievementWithStatus) => void;
}

const getTierStyles = (tier: AchievementTier) => {
  switch (tier) {
    case "BRONZE":
      return {
        badgeBg: "bg-amber-950/40 border-amber-800/50 text-amber-500",
        pillBg: "bg-amber-950/60 border-amber-700/50 text-amber-400",
        border: "border-amber-900/40 hover:border-amber-700/60",
        glow: "from-amber-600/10 to-transparent",
      };
    case "SILVER":
      return {
        badgeBg: "bg-slate-800/50 border-slate-600/50 text-slate-300",
        pillBg: "bg-slate-800/70 border-slate-500/50 text-slate-200",
        border: "border-slate-700/50 hover:border-slate-500/60",
        glow: "from-slate-400/10 to-transparent",
      };
    case "GOLD":
      return {
        badgeBg: "bg-yellow-950/40 border-yellow-700/50 text-yellow-400",
        pillBg: "bg-yellow-950/60 border-yellow-600/50 text-yellow-300",
        border: "border-yellow-800/40 hover:border-yellow-600/60",
        glow: "from-yellow-500/10 to-transparent",
      };
    case "PLATINUM":
      return {
        badgeBg: "bg-cyan-950/40 border-cyan-700/50 text-cyan-400",
        pillBg: "bg-cyan-950/60 border-cyan-600/50 text-cyan-300",
        border: "border-cyan-800/40 hover:border-cyan-600/60",
        glow: "from-cyan-400/10 to-transparent",
      };
    case "DIAMOND":
      return {
        badgeBg: "bg-purple-950/40 border-purple-700/50 text-purple-400",
        pillBg: "bg-purple-950/60 border-purple-600/50 text-purple-300",
        border: "border-purple-800/40 hover:border-purple-600/60",
        glow: "from-purple-500/15 to-transparent",
      };
    default:
      return {
        badgeBg: "bg-gray-800/50 border-gray-700 text-gray-300",
        pillBg: "bg-gray-800 border-gray-700 text-gray-300",
        border: "border-gray-800 hover:border-gray-700",
        glow: "from-gray-500/10 to-transparent",
      };
  }
};

const getBadgeIcon = (iconName: string, className = "h-6 w-6") => {
  switch (iconName?.toLowerCase()) {
    case "flame":
    case "fire":
      return <Flame className={className} />;
    case "trophy":
      return <Trophy className={className} />;
    case "dumbbell":
      return <Dumbbell className={className} />;
    case "target":
      return <Target className={className} />;
    case "zap":
    case "lightning":
      return <Zap className={className} />;
    case "scale":
      return <Scale className={className} />;
    case "apple":
    case "nutrition":
      return <Apple className={className} />;
    default:
      return <Award className={className} />;
  }
};

export const BadgeCard: React.FC<BadgeCardProps> = ({ achievement, onClick }) => {
  const {
    name,
    description,
    tier,
    points,
    isEarned,
    earnedAt,
    badgeIcon,
    currentProgress,
    criteriaTarget,
    progressPercent,
  } = achievement;

  const styles = getTierStyles(tier);

  return (
    <div
      onClick={() => onClick(achievement)}
      className={`group relative flex flex-col justify-between overflow-hidden rounded-xl border p-5 transition-all cursor-pointer ${
        isEarned
          ? `bg-[#101418] ${styles.border} shadow-sm hover:shadow-md`
          : "border-[#1E2329] bg-[#0C0F13]/70 opacity-75 hover:opacity-100 hover:border-[#2A313A]"
      }`}
    >
      {/* Glow Effect */}
      {isEarned && (
        <div
          className={`pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-gradient-to-br ${styles.glow} blur-xl`}
        />
      )}

      {/* Top Header: Badge Icon + Tier Pill */}
      <div>
        <div className="flex items-start justify-between gap-3">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-xl border ${
              isEarned
                ? styles.badgeBg
                : "border-[#1E2329] bg-[#161B22] text-gray-500"
            }`}
          >
            {isEarned ? (
              getBadgeIcon(badgeIcon, "h-6 w-6")
            ) : (
              <div className="relative">
                {getBadgeIcon(badgeIcon, "h-6 w-6 opacity-40")}
                <Lock className="absolute -bottom-1 -right-1 h-3.5 w-3.5 text-gray-500" />
              </div>
            )}
          </div>

          <div className="flex flex-col items-end gap-1">
            <span
              className={`rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase ${styles.pillBg}`}
            >
              {tier}
            </span>
            <span className="text-[11px] font-semibold text-[#5BE584]">
              +{points} pts
            </span>
          </div>
        </div>

        {/* Title and Description */}
        <div className="mt-3">
          <div className="flex items-center gap-1.5">
            <h4 className="text-sm font-bold text-gray-100 group-hover:text-white">
              {name}
            </h4>
            {isEarned && (
              <CheckCircle className="h-3.5 w-3.5 shrink-0 text-[#5BE584]" />
            )}
          </div>
          <p className="mt-1 text-xs text-gray-400 line-clamp-2 leading-relaxed">
            {description}
          </p>
        </div>
      </div>

      {/* Footer: Progress or Earned Status */}
      <div className="mt-4 pt-3 border-t border-[#1E2329]/80">
        {isEarned ? (
          <div className="flex items-center justify-between text-[11px] text-gray-400">
            <span className="font-medium text-[#5BE584]">Unlocked</span>
            <span>
              {earnedAt
                ? new Date(earnedAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "Earned"}
            </span>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between text-[11px] text-gray-400 mb-1.5">
              <span>Progress</span>
              <span className="font-semibold text-gray-300">
                {currentProgress} / {criteriaTarget}
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-[#161B22] overflow-hidden">
              <div
                className="h-full rounded-full bg-[#5BE584] transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
