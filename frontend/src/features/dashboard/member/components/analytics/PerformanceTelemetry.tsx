// src/features/dashboard/member/components/analytics/PerformanceTelemetry.tsx
import React from "react";
import { Zap, Heart, Crown, Clock, ArrowUpRight } from "lucide-react";

interface PerformanceTelemetryProps {
  trends?: any;
}

export const PerformanceTelemetry: React.FC<PerformanceTelemetryProps> = ({
  trends,
}) => {
  if (!trends || Object.keys(trends).length === 0) return null;

  const cards = [
    {
      label: "Strongest Exercise",
      value: trends.strongestExercise?.name,
      subValue: trends.strongestExercise?.val
        ? `${trends.strongestExercise.val} kg`
        : null,
      icon: Crown,
    },
    {
      label: "Favorite Workout",
      value: trends.favoriteWorkout?.name,
      subValue: trends.favoriteWorkout?.timesCompleted
        ? `${trends.favoriteWorkout.timesCompleted} completions`
        : null,
      icon: Heart,
    },
    {
      label: "Favorite Exercise",
      value: trends.favoriteExercise?.name,
      subValue: trends.favoriteExercise?.val
        ? `${trends.favoriteExercise.val} sets`
        : null,
      icon: Zap,
    },
    {
      label: "Longest Workout",
      value: trends.longestWorkout ? `${trends.longestWorkout} min` : null,
      icon: Clock,
    },
    {
      label: "Best Month",
      value: trends.bestMonth?.month,
      subValue: trends.bestMonth?.volume
        ? `${trends.bestMonth.volume.toLocaleString()} kg volume`
        : null,
      icon: ArrowUpRight,
    },
  ].filter((card) => card.value !== undefined && card.value !== null);

  if (cards.length === 0) return null;

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-[#1E2329] bg-[#0D1117] p-6">
      <h2 className="text-sm font-semibold text-white">Insights & Trends</h2>
      <div className="flex flex-col gap-3">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="flex items-center gap-4 rounded-lg border border-[#1E2329] bg-[#090B0F] p-3"
            >
              <div className="rounded-md bg-[#1E2329] p-2 text-gray-400">
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                  {card.label}
                </span>
                <span className="truncate text-sm font-bold text-gray-200">
                  {card.value}
                </span>
                {card.subValue && (
                  <span className="text-xs text-gray-500">{card.subValue}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
