// src/features/gamification/pages/GamificationPage.tsx

import React, { useState, useMemo } from "react";
import {
  Trophy,
  Flame,
  Award,
  Zap,
  Dumbbell,
  Scale,
  Apple,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { useMyGamification } from "../hooks/useGamification";
import { StreakCard } from "../components/StreakCard";
import { WeeklyGoalCard } from "../components/WeeklyGoalCard";
import { BadgeCard } from "../components/BadgeCard";
import { AchievementDetailModal } from "../components/AchievementDetailModal";
import type {
  AchievementCategory,
  AchievementWithStatus,
} from "../types/gamification.types";

const CATEGORIES: { label: string; value: "ALL" | AchievementCategory; icon: React.ElementType }[] = [
  { label: "All Badges", value: "ALL", icon: Award },
  { label: "Workouts", value: "WORKOUT", icon: Dumbbell },
  { label: "Consistency", value: "CONSISTENCY", icon: Flame },
  { label: "Nutrition", value: "NUTRITION", icon: Apple },
  { label: "Progress", value: "PROGRESS", icon: Scale },
];

export const GamificationPage: React.FC = () => {
  const { data, isLoading, isError, error, refetch } = useMyGamification();

  const [selectedCategory, setSelectedCategory] = useState<"ALL" | AchievementCategory>("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "UNLOCKED" | "LOCKED">("ALL");
  const [activeModalAchievement, setActiveModalAchievement] = useState<AchievementWithStatus | null>(null);

  const achievements = data?.achievements || [];
  const streak = data?.streak || {
    currentStreak: 0,
    longestStreak: 0,
    lastWorkoutDate: null,
    isActiveStreak: false,
  };
  const weeklyGoal = data?.weeklyGoal || {
    targetWorkouts: 3,
    completedThisWeek: 0,
    percent: 0,
    weekStartDate: new Date().toISOString(),
  };
  const summary = data?.summary || {
    totalPoints: 0,
    totalEarned: 0,
    totalAvailable: achievements.length,
    completionRate: 0,
  };

  const filteredAchievements = useMemo(() => {
    return achievements.filter((ach) => {
      // Category filter
      if (selectedCategory !== "ALL" && ach.category !== selectedCategory) {
        return false;
      }
      // Status filter
      if (statusFilter === "UNLOCKED" && !ach.isEarned) return false;
      if (statusFilter === "LOCKED" && ach.isEarned) return false;
      return true;
    });
  }, [achievements, selectedCategory, statusFilter]);

  if (isLoading) {
    return (
      <div className="min-h-full w-full bg-[#090B0F] p-4 md:p-6 lg:p-8">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
          <div className="h-20 w-1/3 rounded-xl bg-[#101418] animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 rounded-xl bg-[#101418] animate-pulse" />
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-44 rounded-xl bg-[#101418] animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-full w-full bg-[#090B0F] p-8 flex items-center justify-center">
        <div className="max-w-md rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-center">
          <p className="text-sm text-red-400 font-semibold mb-3">
            {error instanceof Error ? error.message : "Failed to load achievements."}
          </p>
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 rounded-xl bg-[#1E2329] px-4 py-2 text-xs font-semibold text-white hover:bg-[#2A313A]"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full w-full bg-[#090B0F] p-4 md:p-6 lg:p-8 pb-20">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        {/* Page Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-[#1E2329] pb-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
                <Trophy className="h-7 w-7 text-yellow-400" /> Achievements & Streaks
              </h1>
              <span className="rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-0.5 text-xs font-bold text-yellow-400">
                {summary.totalPoints} XP Total
              </span>
            </div>
            <p className="mt-1.5 text-xs md:text-sm text-gray-400">
              Celebrate your milestones, maintain daily consistency, and level up your training journey.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl border border-[#1E2329] bg-[#101418] px-4 py-2">
              <Sparkles className="h-4 w-4 text-[#5BE584]" />
              <span className="text-xs text-gray-400">Badges Unlocked:</span>
              <span className="text-xs font-bold text-white">
                {summary.totalEarned} / {summary.totalAvailable} ({summary.completionRate}%)
              </span>
            </div>
          </div>
        </div>

        {/* Highlight Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StreakCard streak={streak} />
          <WeeklyGoalCard weeklyGoal={weeklyGoal} />

          {/* Points Card */}
          <div className="relative overflow-hidden rounded-xl border border-[#1E2329] bg-[#101418] p-5 shadow-sm transition-all hover:border-[#2A313A]">
            <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-yellow-500/10 blur-2xl" />
            <div className="flex items-center justify-between pb-3 border-b border-[#1E2329]">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-yellow-500/30 bg-yellow-500/15 text-yellow-400">
                  <Zap className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-100">Reward Points</h3>
                  <p className="text-[11px] text-gray-400">Earned experience</p>
                </div>
              </div>
              <span className="rounded-full border border-yellow-500/30 bg-yellow-500/10 px-2 py-0.5 text-[10px] font-bold text-yellow-400">
                XP
              </span>
            </div>
            <div className="mt-4 flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold tracking-tight text-white">
                {summary.totalPoints}
              </span>
              <span className="text-xs font-semibold text-gray-400">points accumulated</span>
            </div>
            <p className="mt-1 text-xs text-gray-400">
              Earn points for every milestone, streak, and workout completed.
            </p>
          </div>

          {/* Completion Rate Card */}
          <div className="relative overflow-hidden rounded-xl border border-[#1E2329] bg-[#101418] p-5 shadow-sm transition-all hover:border-[#2A313A]">
            <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-purple-500/10 blur-2xl" />
            <div className="flex items-center justify-between pb-3 border-b border-[#1E2329]">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-purple-500/30 bg-purple-500/15 text-purple-400">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-100">Badge Progress</h3>
                  <p className="text-[11px] text-gray-400">Overall library mastery</p>
                </div>
              </div>
              <span className="rounded-full border border-purple-500/30 bg-purple-500/10 px-2 py-0.5 text-[10px] font-bold text-purple-400">
                {summary.completionRate}%
              </span>
            </div>
            <div className="mt-4 flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold tracking-tight text-white">
                {summary.totalEarned}
              </span>
              <span className="text-xs font-semibold text-gray-400">
                / {summary.totalAvailable} unlocked
              </span>
            </div>
            <div className="mt-2 h-1.5 w-full rounded-full bg-[#161B22] overflow-hidden">
              <div
                className="h-full rounded-full bg-purple-500 transition-all duration-500"
                style={{ width: `${summary.completionRate}%` }}
              />
            </div>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-[#1E2329] bg-[#101418] p-1.5">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = selectedCategory === cat.value;
              return (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-[#1E2329] text-white shadow-sm"
                      : "text-gray-400 hover:text-gray-200 hover:bg-[#161B22]"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Status Segmented Control */}
          <div className="flex items-center gap-1 rounded-xl border border-[#1E2329] bg-[#101418] p-1.5 self-start lg:self-auto">
            <button
              onClick={() => setStatusFilter("ALL")}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                statusFilter === "ALL"
                  ? "bg-[#1E2329] text-white"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter("UNLOCKED")}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                statusFilter === "UNLOCKED"
                  ? "bg-[#1E2329] text-[#5BE584]"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              Unlocked ({summary.totalEarned})
            </button>
            <button
              onClick={() => setStatusFilter("LOCKED")}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                statusFilter === "LOCKED"
                  ? "bg-[#1E2329] text-gray-200"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              Locked ({summary.totalAvailable - summary.totalEarned})
            </button>
          </div>
        </div>

        {/* Badges Grid */}
        {filteredAchievements.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#1E2329] bg-[#101418]/50 p-12 text-center">
            <Award className="h-10 w-10 text-gray-600 mb-3" />
            <h3 className="text-base font-semibold text-gray-300">No achievements found</h3>
            <p className="mt-1 text-xs text-gray-500">
              Try adjusting your category or unlock status filter.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredAchievements.map((ach) => (
              <BadgeCard
                key={ach.id}
                achievement={ach}
                onClick={setActiveModalAchievement}
              />
            ))}
          </div>
        )}
      </div>

      {/* Achievement Detail Modal */}
      <AchievementDetailModal
        achievement={activeModalAchievement}
        onClose={() => setActiveModalAchievement(null)}
      />
    </div>
  );
};

export default GamificationPage;
