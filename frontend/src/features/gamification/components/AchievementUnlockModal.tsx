// src/features/gamification/components/AchievementUnlockModal.tsx
import React, { useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
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
  CalendarCheck,
  Utensils,
  RotateCcw,
  PieChart,
  TrendingUp,
  Sparkles,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import type {
  AchievementWithStatus,
  AchievementTier,
} from "../types/gamification.types";
import CelebrationCanvas from "./CelebrationCanvas";

export interface AchievementUnlockModalProps {
  achievement: AchievementWithStatus | null;
  isOpen: boolean;
  onDismiss: () => void;
  queueIndex?: number;
  queueTotal?: number;
}

const getBadgeIcon = (iconName?: string, className = "h-12 w-12 sm:h-14 sm:w-14") => {
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
    case "calendar-check":
      return <CalendarCheck className={className} />;
    case "utensils":
      return <Utensils className={className} />;
    case "rotate-ccw":
      return <RotateCcw className={className} />;
    case "pie-chart":
      return <PieChart className={className} />;
    case "trending-up":
      return <TrendingUp className={className} />;
    default:
      return <Award className={className} />;
  }
};

interface TierTheme {
  border: string;
  badgeBg: string;
  badgeText: string;
  glow: string;
  pillBorder: string;
  pillBg: string;
  pillText: string;
  radialGradient: string;
}

const TIER_THEMES: Record<AchievementTier, TierTheme> = {
  BRONZE: {
    border: "border-amber-600/40",
    badgeBg: "bg-gradient-to-br from-amber-950/70 via-[#16120D] to-[#0E1217]",
    badgeText: "text-amber-400",
    glow: "shadow-[0_0_50px_rgba(217,119,6,0.28)]",
    pillBorder: "border-amber-600/50",
    pillBg: "bg-amber-950/60",
    pillText: "text-amber-400",
    radialGradient: "rgba(217,119,6,0.12)",
  },
  SILVER: {
    border: "border-slate-400/40",
    badgeBg: "bg-gradient-to-br from-slate-900/80 via-[#13171D] to-[#0E1217]",
    badgeText: "text-slate-200",
    glow: "shadow-[0_0_50px_rgba(203,213,225,0.22)]",
    pillBorder: "border-slate-400/50",
    pillBg: "bg-slate-800/70",
    pillText: "text-slate-200",
    radialGradient: "rgba(203,213,225,0.10)",
  },
  GOLD: {
    border: "border-yellow-500/50",
    badgeBg: "bg-gradient-to-br from-yellow-950/80 via-[#19150B] to-[#0E1217]",
    badgeText: "text-yellow-400",
    glow: "shadow-[0_0_60px_rgba(234,179,8,0.32)]",
    pillBorder: "border-yellow-500/50",
    pillBg: "bg-yellow-950/60",
    pillText: "text-yellow-300",
    radialGradient: "rgba(234,179,8,0.14)",
  },
  PLATINUM: {
    border: "border-cyan-500/50",
    badgeBg: "bg-gradient-to-br from-cyan-950/80 via-[#0B171A] to-[#0E1217]",
    badgeText: "text-cyan-300",
    glow: "shadow-[0_0_60px_rgba(34,211,238,0.30)]",
    pillBorder: "border-cyan-500/50",
    pillBg: "bg-cyan-950/60",
    pillText: "text-cyan-300",
    radialGradient: "rgba(34,211,238,0.13)",
  },
  DIAMOND: {
    border: "border-purple-500/50",
    badgeBg: "bg-gradient-to-br from-purple-950/80 via-[#150B1B] to-[#0E1217]",
    badgeText: "text-purple-300",
    glow: "shadow-[0_0_65px_rgba(168,85,247,0.32)]",
    pillBorder: "border-purple-500/50",
    pillBg: "bg-purple-950/60",
    pillText: "text-purple-300",
    radialGradient: "rgba(168,85,247,0.14)",
  },
};

export const AchievementUnlockModal: React.FC<AchievementUnlockModalProps> = ({
  achievement,
  isOpen,
  onDismiss,
  queueIndex = 1,
  queueTotal = 1,
}) => {
  const { t, i18n } = useTranslation(["achievements", "common"]);
  const isRtl = i18n.language === "ar";

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onDismiss();
      }
    },
    [onDismiss],
  );

  useEffect(() => {
    if (!isOpen) return;
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleKeyDown]);

  if (!isOpen || !achievement) return null;

  const tier: AchievementTier = achievement.tier || "GOLD";
  const theme = TIER_THEMES[tier] || TIER_THEMES.GOLD;
  const displayName = t(`items.${achievement.code}.title` as any, {
    defaultValue: achievement.title || achievement.name || "Milestone",
  });
  const displayDescription = t(`items.${achievement.code}.description` as any, {
    defaultValue: achievement.description,
  });
  const tierLabel = t(`badge.tiers.${tier}` as any, { defaultValue: tier });
  const points = Number(achievement.points) || 0;
  const hasMultiple = queueTotal > 1;
  const isLast = queueIndex >= queueTotal;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t("celebration.ariaTitle", "Achievement Unlocked")}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      {/* Particle Confetti Celebration */}
      <CelebrationCanvas tier={tier} />

      {/* Main Modal Card */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative z-[102] w-full max-w-md rounded-3xl border ${theme.border} bg-[#0E1217]/95 p-6 sm:p-8 text-center shadow-[0_20px_70px_rgba(0,0,0,0.85)] backdrop-blur-xl overflow-hidden animate-in zoom-in-95 duration-200`}
        style={{
          backgroundImage: `radial-gradient(circle at 50% 20%, ${theme.radialGradient} 0%, transparent 70%)`,
        }}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onDismiss}
          aria-label={t("celebration.close", "Dismiss")}
          className="absolute right-4 top-4 rtl:right-auto rtl:left-4 rounded-xl p-2 text-[#9CA3AF] transition-colors hover:bg-white/5 hover:text-white focus:outline-none focus:ring-2 focus:ring-[#5BE584]"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Top Celebration Tag */}
        <div className="flex flex-col items-center justify-center gap-1.5 mt-1">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[11px] font-mono tracking-wider uppercase font-bold border border-[#5BE584]/35 bg-[#16291D]/90 text-[#5BE584] shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-[#5BE584]" />
            <span>
              {t("celebration.headerTag", "ACHIEVEMENT UNLOCKED")}
            </span>
            {hasMultiple && (
              <span className="ms-1 px-1.5 py-0.2 rounded-md bg-[#5BE584]/20 text-[#5BE584] text-[10px]">
                {queueIndex}/{queueTotal}
              </span>
            )}
          </div>
        </div>

        {/* Central Achievement Badge Icon Display */}
        <div className="my-6 relative flex flex-col items-center justify-center">
          {/* Animated Radial Pulse Rings */}
          <div
            className={`absolute h-32 w-32 rounded-3xl ${theme.glow} opacity-60 blur-md pointer-events-none`}
            aria-hidden="true"
          />

          <div
            className={`relative flex h-24 w-24 sm:h-28 sm:w-28 items-center justify-center rounded-3xl border-2 ${theme.border} ${theme.badgeBg} ${theme.badgeText} ${theme.glow} transition-transform duration-300 hover:scale-105`}
          >
            {getBadgeIcon(achievement.badgeIcon)}
          </div>

          {/* Tier Label */}
          <div className="mt-3">
            <span
              className={`rounded-full border px-3 py-0.5 text-[10px] font-extrabold tracking-widest uppercase ${theme.pillBorder} ${theme.pillBg} ${theme.pillText}`}
            >
              {tierLabel} {t("celebration.tierSuffix", "TIER")}
            </span>
          </div>
        </div>

        {/* Achievement Title & Description */}
        <div className="space-y-2 px-2">
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white capitalize">
            {displayName}
          </h2>
          <p className="text-xs sm:text-sm text-[#9CA3AF] max-w-xs mx-auto leading-relaxed">
            {displayDescription}
          </p>
        </div>

        {/* Reward Pill (if points exist) */}
        {points > 0 && (
          <div className="mt-4 flex items-center justify-center">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-yellow-500/35 bg-yellow-500/10 text-yellow-400 font-mono text-xs font-bold shadow-sm">
              <Zap className="h-3.5 w-3.5 fill-current" />
              <span>
                +{points}{" "}
                {t("celebration.pointsLabel", "POINTS")}
              </span>
            </div>
          </div>
        )}

        {/* Sporty Congratulatory Subtext */}
        <div className="mt-5 pt-4 border-t border-[#1E2329]/70 space-y-1">
          <p className="text-xs font-semibold text-white/90">
            {t(
              "celebration.congratsLine1",
              "You're building something great!",
            )}
          </p>
          <p className="text-[11px] text-[#6B7280]">
            {t(
              "celebration.congratsLine2",
              "Every session counts. Keep pushing your limits.",
            )}
          </p>
        </div>

        {/* Action / Dismiss Button */}
        <div className="mt-6 flex flex-col gap-2">
          <button
            type="button"
            onClick={onDismiss}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#5BE584] py-3.5 px-6 text-xs sm:text-sm font-bold text-[#090B0F] shadow-[0_0_25px_rgba(91,229,132,0.32)] hover:bg-[#49D472] active:scale-[0.98] transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#5BE584]"
          >
            {hasMultiple && !isLast ? (
              <>
                <span>
                  {t(
                    "celebration.nextButton",
                    "Next Achievement",
                  )}
                </span>
                <ChevronRight className="h-4 w-4 rtl:rotate-180" />
              </>
            ) : (
              <>
                <ShieldCheck className="h-4 w-4 stroke-[2.5]" />
                <span>
                  {t(
                    "celebration.continueButton",
                    "Awesome, Keep Going!",
                  )}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default AchievementUnlockModal;
