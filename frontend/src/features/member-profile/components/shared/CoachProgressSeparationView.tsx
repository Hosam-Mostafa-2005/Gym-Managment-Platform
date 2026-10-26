import React from "react";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Dumbbell,
  Scale,
  Lock,
  History,
  Activity,
  Award,
} from "lucide-react";
import type {
  CurrentCoachProgress,
  HistoricalProgress,
} from "../../types/member-profile.types";

interface CoachProgressSeparationViewProps {
  currentCoachProgress?: CurrentCoachProgress | null;
  historicalProgress?: HistoricalProgress | null;
  coachStartedAt?: string | null;
}

export const CoachProgressSeparationView: React.FC<
  CoachProgressSeparationViewProps
> = ({ currentCoachProgress, historicalProgress, coachStartedAt }) => {
  const currentStats = currentCoachProgress?.stats;
  const weightComparison = currentCoachProgress?.weightComparison;
  const currentSessions = currentCoachProgress?.sessions || [];
  const currentMeasurements = currentCoachProgress?.measurements || [];

  const isHistoryShared = historicalProgress?.isShared;
  const historicalStats = historicalProgress?.stats;
  const historicalSessions = historicalProgress?.sessions || [];
  const historicalMeasurements = historicalProgress?.measurements || [];

  const initialWeight =
    weightComparison?.preCoachWeight ?? weightComparison?.initialWeight ?? null;
  const latestWeight =
    weightComparison?.currentWeight ?? weightComparison?.latestWeight ?? null;
  const deltaWeight =
    weightComparison?.weightChange ?? weightComparison?.deltaWeight ?? null;

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "N/A";
    try {
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(new Date(dateStr));
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* SECTION 1: Current Coaching Progress */}
      <div className="flex flex-col gap-4 rounded-xl border border-[#1E2329] bg-[#0D1014] p-5">
        <div className="flex items-center justify-between border-b border-[#1E2329] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#23422e] bg-[#16291d] text-[#5BE584]">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Progress With Current Coach
              </h2>
              <p className="text-xs text-gray-400">
                Metrics and sessions recorded since coaching relationship began (
                {formatDate(coachStartedAt)})
              </p>
            </div>
          </div>
          <span className="inline-flex items-center rounded-full bg-[#16291d] border border-[#23422e] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#5BE584]">
            Current Coaching
          </span>
        </div>

        {/* Current Coach KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Completed Sessions */}
          <div className="flex flex-col rounded-lg border border-[#1E2329] bg-[#101418] p-4">
            <div className="flex items-center justify-between text-gray-400 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider">
                Sessions Completed
              </span>
              <Activity className="h-4 w-4 text-[#5BE584]" />
            </div>
            <span className="text-2xl font-bold font-mono text-white">
              {currentStats?.completedSessions ?? 0}
            </span>
            <span className="text-[11px] text-gray-500 mt-1">
              Out of {currentStats?.totalSessions ?? 0} total started
            </span>
          </div>

          {/* Volume Lifted */}
          <div className="flex flex-col rounded-lg border border-[#1E2329] bg-[#101418] p-4">
            <div className="flex items-center justify-between text-gray-400 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider">
                Volume Lifted
              </span>
              <Dumbbell className="h-4 w-4 text-[#5BE584]" />
            </div>
            <span className="text-2xl font-bold font-mono text-white">
              {(currentStats?.totalVolume ?? 0).toLocaleString()} kg
            </span>
            <span className="text-[11px] text-gray-500 mt-1">
              Under current coach
            </span>
          </div>

          {/* Weight Delta Under Coach */}
          <div className="flex flex-col rounded-lg border border-[#1E2329] bg-[#101418] p-4 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between text-gray-400 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider">
                Weight Trend Under Coach
              </span>
              <Scale className="h-4 w-4 text-[#5BE584]" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-white">
                {latestWeight !== null ? `${latestWeight} kg` : "--"}
              </span>
              {deltaWeight !== null && deltaWeight !== undefined && (
                <span
                  className={`inline-flex items-center gap-0.5 text-xs font-bold font-mono ${
                    deltaWeight > 0
                      ? "text-blue-400"
                      : deltaWeight < 0
                      ? "text-[#5BE584]"
                      : "text-gray-400"
                  }`}
                >
                  {deltaWeight > 0 ? (
                    <TrendingUp className="h-3.5 w-3.5" />
                  ) : deltaWeight < 0 ? (
                    <TrendingDown className="h-3.5 w-3.5" />
                  ) : (
                    <Minus className="h-3.5 w-3.5" />
                  )}
                  {deltaWeight > 0 ? "+" : ""}
                  {deltaWeight} kg
                </span>
              )}
            </div>
            <span className="text-[11px] text-gray-500 mt-1">
              {initialWeight !== null
                ? `Initial baseline: ${initialWeight} kg`
                : "Awaiting baseline weight"}
            </span>
          </div>
        </div>

        {/* Current Coach Sessions & Measurements Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-2">
          {/* Sessions List */}
          <div className="flex flex-col rounded-lg border border-[#1E2329] bg-[#101418] p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-gray-200">
                Workouts Under Current Coach ({currentSessions.length})
              </span>
              <span className="text-[10px] text-[#5BE584] font-semibold uppercase">
                Active
              </span>
            </div>
            {currentSessions.length > 0 ? (
              <div className="space-y-2">
                {currentSessions.slice(0, 5).map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-[#1E2329] bg-[#0D1014] text-xs"
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="font-semibold text-gray-200">
                        {s.workout?.title || "Workout Session"}
                      </span>
                      <span className="text-[10px] text-gray-500">
                        {formatDate(s.startedAt)}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-[#5BE584] bg-[#16291d] px-2 py-0.5 rounded border border-[#23422e]">
                      {s.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500 italic py-4 text-center">
                No workouts completed yet under this coach.
              </p>
            )}
          </div>

          {/* Measurements List */}
          <div className="flex flex-col rounded-lg border border-[#1E2329] bg-[#101418] p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-gray-200">
                Measurements Under Current Coach ({currentMeasurements.length})
              </span>
              <span className="text-[10px] text-[#5BE584] font-semibold uppercase">
                Active
              </span>
            </div>
            {currentMeasurements.length > 0 ? (
              <div className="space-y-2">
                {currentMeasurements.slice(0, 5).map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-[#1E2329] bg-[#0D1014] text-xs"
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="font-semibold text-gray-200 font-mono">
                        {m.weight ? `${m.weight} kg` : "No weight recorded"}
                        {m.bodyFat ? ` • ${m.bodyFat}% BF` : ""}
                      </span>
                      <span className="text-[10px] text-gray-500">
                        {formatDate(m.measuredAt)}
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-400">
                      Coached Period
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500 italic py-4 text-center">
                No body measurements logged yet under this coach.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 2: Historical / Pre-Coach Progress */}
      <div className="flex flex-col gap-4 rounded-xl border border-[#1E2329] bg-[#0D1014] p-5">
        <div className="flex items-center justify-between border-b border-[#1E2329] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-800 text-gray-300">
              <History className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Pre-Coach Historical Progress
              </h2>
              <p className="text-xs text-gray-400">
                Historical records prior to the start of this coaching relationship
              </p>
            </div>
          </div>

          {isHistoryShared ? (
            <span className="inline-flex items-center rounded-full bg-zinc-800 border border-zinc-700 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-300">
              Historical Reference
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-zinc-800/80 border border-zinc-700 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
              <Lock className="h-3 w-3" />
              Private
            </span>
          )}
        </div>

        {isHistoryShared ? (
          <>
            {/* Informative Guidance */}
            <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-3 text-xs text-blue-300/90 leading-relaxed">
              These records represent the member's training activity prior to your coaching engagement. They provide reference baseline strength and volume, and are not counted toward your coaching metrics.
            </div>

            {/* Historical KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col rounded-lg border border-[#1E2329] bg-[#101418] p-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                  Pre-Coach Completed Sessions
                </span>
                <span className="text-2xl font-bold font-mono text-gray-300">
                  {historicalStats?.completedSessions ?? 0}
                </span>
                <span className="text-[10px] text-gray-500 mt-1">
                  Completed before {formatDate(coachStartedAt)}
                </span>
              </div>

              <div className="flex flex-col rounded-lg border border-[#1E2329] bg-[#101418] p-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                  Pre-Coach Volume
                </span>
                <span className="text-2xl font-bold font-mono text-gray-300">
                  {(historicalStats?.totalVolume ?? 0).toLocaleString()} kg
                </span>
                <span className="text-[10px] text-gray-500 mt-1">
                  Baseline training volume
                </span>
              </div>
            </div>

            {/* Historical Lists */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-2">
              {/* Historical Sessions */}
              <div className="flex flex-col rounded-lg border border-[#1E2329] bg-[#101418] p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-gray-300">
                    Pre-Coach Workouts ({historicalSessions.length})
                  </span>
                  <span className="text-[10px] text-gray-500 uppercase">
                    Historical
                  </span>
                </div>
                {historicalSessions.length > 0 ? (
                  <div className="space-y-2">
                    {historicalSessions.slice(0, 5).map((s) => (
                      <div
                        key={s.id}
                        className="flex items-center justify-between p-2.5 rounded-lg border border-[#1E2329] bg-[#0D1014] text-xs"
                      >
                        <div className="flex flex-col gap-0.5">
                          <span className="font-semibold text-gray-300">
                            {s.workout?.title || "Workout Session"}
                          </span>
                          <span className="text-[10px] text-gray-500">
                            {formatDate(s.startedAt)}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-gray-400 bg-zinc-800/80 px-2 py-0.5 rounded border border-zinc-700">
                          Pre-Coach
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 italic py-4 text-center">
                    No pre-coach workouts found.
                  </p>
                )}
              </div>

              {/* Historical Measurements */}
              <div className="flex flex-col rounded-lg border border-[#1E2329] bg-[#101418] p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-gray-300">
                    Pre-Coach Measurements ({historicalMeasurements.length})
                  </span>
                  <span className="text-[10px] text-gray-500 uppercase">
                    Historical
                  </span>
                </div>
                {historicalMeasurements.length > 0 ? (
                  <div className="space-y-2">
                    {historicalMeasurements.slice(0, 5).map((m) => (
                      <div
                        key={m.id}
                        className="flex items-center justify-between p-2.5 rounded-lg border border-[#1E2329] bg-[#0D1014] text-xs"
                      >
                        <div className="flex flex-col gap-0.5">
                          <span className="font-semibold text-gray-300 font-mono">
                            {m.weight ? `${m.weight} kg` : "No weight recorded"}
                            {m.bodyFat ? ` • ${m.bodyFat}% BF` : ""}
                          </span>
                          <span className="text-[10px] text-gray-500">
                            {formatDate(m.measuredAt)}
                          </span>
                        </div>
                        <span className="text-[10px] text-gray-500">
                          Pre-Coach
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 italic py-4 text-center">
                    No pre-coach measurements found.
                  </p>
                )}
              </div>
            </div>
          </>
        ) : (
          /* Privacy Shield State */
          <div className="flex flex-col items-center justify-center p-8 text-center rounded-xl border border-dashed border-[#1E2329] bg-[#101418]">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-zinc-700 bg-zinc-800 text-gray-400 mb-3">
              <Lock className="h-6 w-6" />
            </div>
            <h4 className="text-sm font-bold text-gray-200">
              Historical Records Kept Private
            </h4>
            <p className="mt-1 text-xs text-gray-400 max-w-md leading-relaxed">
              This member has opted not to share workout and measurement logs recorded before this coaching relationship. To ensure privacy, earlier records are strictly isolated.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
