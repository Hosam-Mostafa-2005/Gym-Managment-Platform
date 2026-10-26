// src/features/dashboard/member/components/WelcomeQuickStats.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { Dumbbell, Calendar, Scale, TrendingUp, TrendingDown, ArrowRight } from "lucide-react";
import type { MemberDashboardOverview } from "../../types/dashboard.types";

interface WelcomeQuickStatsProps {
  overview: MemberDashboardOverview;
}

export const WelcomeQuickStats: React.FC<WelcomeQuickStatsProps> = ({ overview }) => {
  const navigate = useNavigate();

  const completedWorkouts = overview.completedSessions ?? 0;
  const consistency = overview.consistency30Days || {
    activeDays: 0,
    totalDays: 30,
    percentage: 0,
  };
  const latestMeasurement = overview.latestMeasurement;
  const totalVolume = overview.totalVolumeLifted ?? 0;

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* 1. Workouts Completed */}
      <div className="relative overflow-hidden rounded-xl border border-[#1E2329] bg-[#101418] p-5 shadow-sm transition hover:border-[#2A313C]">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
            Workouts Completed
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#5BE584]/10 text-[#5BE584]">
            <Dumbbell className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold text-white tracking-tight">
            {completedWorkouts}
          </div>
          <p className="mt-1 text-xs text-gray-400">
            <span className="text-[#5BE584] font-medium">{overview.workoutsThisMonth ?? 0}</span> sessions this month
          </p>
        </div>
      </div>

      {/* 2. 30-Day Training Consistency */}
      <div className="relative overflow-hidden rounded-xl border border-[#1E2329] bg-[#101418] p-5 shadow-sm transition hover:border-[#2A313C]">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
            30-Day Consistency
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
            <Calendar className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold text-white tracking-tight">
            {consistency.percentage}%
          </div>
          <p className="mt-1 text-xs text-gray-400">
            <span className="text-blue-400 font-medium">{consistency.activeDays}</span> active days out of 30
          </p>
        </div>
      </div>

      {/* 3. Latest Body Weight */}
      <div className="relative overflow-hidden rounded-xl border border-[#1E2329] bg-[#101418] p-5 shadow-sm transition hover:border-[#2A313C]">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
            Latest Body Weight
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
            <Scale className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-3">
          {latestMeasurement ? (
            <>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white tracking-tight">
                  {latestMeasurement.weight} {latestMeasurement.unit}
                </span>
                {latestMeasurement.diffFromPrevious !== null && (
                  <span
                    className={`inline-flex items-center text-xs font-medium ${
                      latestMeasurement.diffFromPrevious <= 0
                        ? "text-emerald-400"
                        : "text-amber-400"
                    }`}
                  >
                    {latestMeasurement.diffFromPrevious <= 0 ? (
                      <TrendingDown className="mr-0.5 h-3.5 w-3.5" />
                    ) : (
                      <TrendingUp className="mr-0.5 h-3.5 w-3.5" />
                    )}
                    {Math.abs(latestMeasurement.diffFromPrevious)} kg
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-gray-400">
                Recorded on {new Date(latestMeasurement.measuredAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </>
          ) : (
            <div className="flex flex-col gap-1">
              <span className="text-sm text-gray-400">No weight recorded</span>
              <button
                type="button"
                onClick={() => navigate("/measurements")}
                className="inline-flex items-center text-xs font-semibold text-[#5BE584] hover:underline"
              >
                Log measurement <ArrowRight className="ml-1 h-3 w-3" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 4. Total Volume Lifted */}
      <div className="relative overflow-hidden rounded-xl border border-[#1E2329] bg-[#101418] p-5 shadow-sm transition hover:border-[#2A313C]">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
            Total Volume Lifted
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
            <TrendingUp className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold text-white tracking-tight">
            {totalVolume >= 1000 ? `${(totalVolume / 1000).toFixed(1)}k` : totalVolume} kg
          </div>
          <p className="mt-1 text-xs text-gray-400">
            Across {overview.totalSetsCompleted ?? 0} completed sets
          </p>
        </div>
      </div>
    </section>
  );
};
