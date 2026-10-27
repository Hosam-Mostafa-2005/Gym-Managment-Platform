import { Link, useParams } from "react-router-dom";
import {
  Trophy,
  ArrowLeft,
  Calendar,
  Clock,
  Activity,
  Dumbbell,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  FileText,
  Loader2,
  AlertCircle,
  Layers,
} from "lucide-react";
import { useWorkoutSession } from "../hooks/useWorkoutSession";
import { usePreviousPerformance } from "../hooks/usePreviousPerformance";
import ExerciseImage from "@/features/exercises/components/ExerciseImage";

export default function SessionSummaryPage() {
  const { sessionId } = useParams<{ sessionId: string }>();

  const { data, isLoading, isError } = useWorkoutSession(sessionId || "");
  const { data: previousPerformance } = usePreviousPerformance(sessionId || "");

  if (isLoading) {
    return (
      <div className="relative min-h-screen w-full bg-[#0D1014] text-[#F3F4F6] font-sans selection:bg-[#5BE584]/30">
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(30,35,41,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(30,35,41,0.2)_1px,transparent_1px)] bg-[size:32px_32px]" />
        </div>
        <div className="relative z-10 mx-auto max-w-4xl px-6 py-32 flex flex-col items-center justify-center text-[#6B7280]">
          <Loader2 className="h-8 w-8 animate-spin text-[#5BE584]" />
          <p className="mt-4 text-sm font-medium">Loading session summary...</p>
        </div>
      </div>
    );
  }

  if (isError || !data || !data.session) {
    return (
      <div className="relative min-h-screen w-full bg-[#0D1014] text-[#F3F4F6] font-sans selection:bg-[#5BE584]/30">
        <div className="relative z-10 mx-auto max-w-4xl px-6 py-32">
          <div className="rounded-2xl border border-red-900/50 bg-red-950/20 p-12 text-center backdrop-blur-sm max-w-md mx-auto">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-950/50 text-red-400 border border-red-900/50 mx-auto mb-4">
              <AlertCircle className="h-6 w-6" />
            </div>
            <h2 className="text-base font-semibold text-white">
              Session Not Found
            </h2>
            <p className="mt-2 text-xs text-[#9CA3AF] max-w-xs mx-auto leading-relaxed">
              We couldn't retrieve the details for this completed workout session.
            </p>
            <div className="mt-6">
              <Link
                to="/sessions"
                className="inline-flex items-center gap-2 rounded-xl bg-[#5BE584] px-4 py-2.5 text-xs font-semibold text-[#090B0F] transition-all hover:bg-[#49D472]"
              >
                <ArrowLeft size={14} /> Return to Sessions
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { session, exerciseLogs } = data;

  const workoutTitle =
    session.workout?.title ||
    session.assignment?.workout?.title ||
    "Completed Workout Session";

  const completionDate = session.endedAt
    ? new Date(session.endedAt).toLocaleDateString(undefined, {
        weekday: "long",
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : new Date(session.startedAt).toLocaleDateString();

  const completionTime = session.endedAt
    ? new Date(session.endedAt).toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return (
    <div className="relative min-h-screen w-full bg-[#0D1014] text-[#F3F4F6] font-sans selection:bg-[#5BE584]/30 pb-32">
      {/* Background Atmosphere */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(30,35,41,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(30,35,41,0.2)_1px,transparent_1px)] bg-[size:32px_32px]" />
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-[radial-gradient(circle_at_center,_rgba(91,229,132,0.06)_0%,_rgba(13,16,20,0)_70%)] blur-3xl" />
      </div>

      {/* Header Bar */}
      <header className="relative z-10 border-b border-[#1E2329] bg-[#0D1014]/90 backdrop-blur-md px-6 lg:px-12 py-6">
        <div className="mx-auto max-w-4xl flex items-center justify-between">
          <Link
            to="/sessions"
            className="flex items-center gap-2 text-xs font-semibold text-[#9CA3AF] hover:text-white transition-colors"
          >
            <ArrowLeft size={16} />
            <span>All Sessions</span>
          </Link>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border bg-[#5BE584]/10 border-[#5BE584]/20 text-[#5BE584]">
            <CheckCircle2 size={13} />
            <span>Workout Completed</span>
          </span>
        </div>
      </header>

      {/* Main Content Space */}
      <main className="relative z-10 mx-auto max-w-4xl px-4 sm:px-8 py-10 space-y-8 animate-in fade-in duration-300">
        {/* Hero Celebration Banner */}
        <section className="relative overflow-hidden rounded-3xl border border-[#1E2329] bg-gradient-to-b from-[#12171F] to-[#0D1117] p-8 md:p-10 shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#5BE584] uppercase tracking-wider">
                <Sparkles size={14} />
                <span>Session Summary</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                {workoutTitle}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-xs text-[#9CA3AF] font-medium">
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} className="text-[#6B7280]" />
                  {completionDate} {completionTime && `at ${completionTime}`}
                </span>
                <span className="text-[#1E2329]">•</span>
                <span className="flex items-center gap-1.5">
                  <Clock size={14} className="text-[#6B7280]" />
                  {session.duration ?? 0} Minutes
                </span>
              </div>
            </div>

            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-[#5BE584]/10 border border-[#5BE584]/20 text-[#5BE584] shadow-[0_0_30px_rgba(91,229,132,0.15)] self-start md:self-auto">
              <Trophy size={36} />
            </div>
          </div>
        </section>

        {/* High-Level Telemetry Cards */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-[#1E2329] bg-[#101418] p-5">
            <div className="flex items-center gap-2 text-[#9CA3AF] text-xs font-semibold uppercase tracking-wider mb-2">
              <Activity size={15} className="text-[#5BE584]" /> Total Volume
            </div>
            <p className="text-2xl font-bold text-white font-mono">
              {(session.totalVolume || 0).toLocaleString()} <span className="text-sm font-normal text-[#9CA3AF]">kg</span>
            </p>
          </div>

          <div className="rounded-2xl border border-[#1E2329] bg-[#101418] p-5">
            <div className="flex items-center gap-2 text-[#9CA3AF] text-xs font-semibold uppercase tracking-wider mb-2">
              <Clock size={15} className="text-[#5BE584]" /> Duration
            </div>
            <p className="text-2xl font-bold text-white font-mono">
              {session.duration || 0} <span className="text-sm font-normal text-[#9CA3AF]">mins</span>
            </p>
          </div>

          <div className="rounded-2xl border border-[#1E2329] bg-[#101418] p-5">
            <div className="flex items-center gap-2 text-[#9CA3AF] text-xs font-semibold uppercase tracking-wider mb-2">
              <Dumbbell size={15} className="text-[#5BE584]" /> Movements
            </div>
            <p className="text-2xl font-bold text-white font-mono">
              {session.exercisesCompleted || exerciseLogs.filter((e) => e.completed).length} / {exerciseLogs.length}
            </p>
          </div>

          <div className="rounded-2xl border border-[#1E2329] bg-[#101418] p-5">
            <div className="flex items-center gap-2 text-[#9CA3AF] text-xs font-semibold uppercase tracking-wider mb-2">
              <Layers size={15} className="text-[#5BE584]" /> Sets Logged
            </div>
            <p className="text-2xl font-bold text-white font-mono">
              {session.setsCompleted || 0}
            </p>
          </div>
        </section>

        {/* Reflection Notes if recorded */}
        {session.notes && (
          <section className="rounded-2xl border border-[#1E2329] bg-[#101418] p-6 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#9CA3AF]">
              <FileText size={15} className="text-[#5BE584]" />
              Workout Reflection & Personal Notes
            </div>
            <p className="text-sm text-gray-200 leading-relaxed italic bg-[#090B0F] p-4 rounded-xl border border-white/5">
              "{session.notes}"
            </p>
          </section>
        )}

        {/* Detailed Exercise Breakdown & Historical Comparison */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white tracking-tight">
              Performance Breakdown & Historical Comparison
            </h2>
          </div>

          <div className="space-y-6">
            {exerciseLogs.map((log) => {
              const prev = previousPerformance?.[log.exercise?.id || ""];

              // Calculate current exercise telemetry
              const completedSets = (log.sets || []).filter((s) => s.completed);
              const currentVolume = completedSets.reduce(
                (sum, s) => sum + (s.weight || 0) * (s.actualReps || 0),
                0,
              );
              const currentMaxWeight = completedSets.reduce(
                (max, s) => Math.max(max, s.weight || 0),
                0,
              );

              // Calculate comparison
              let comparisonBadge: React.ReactNode = null;
              if (prev && prev.totalVolume !== undefined) {
                const volDiff = currentVolume - prev.totalVolume;
                const weightDiff = currentMaxWeight - (prev.maxWeight || 0);

                if (volDiff > 0 || weightDiff > 0) {
                  const pct =
                    prev.totalVolume > 0
                      ? Math.round((volDiff / prev.totalVolume) * 100)
                      : 0;
                  comparisonBadge = (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                      <TrendingUp size={13} />
                      {volDiff > 0 && `+${volDiff.toLocaleString()} kg volume`}
                      {pct > 0 && ` (+${pct}%)`}
                      {volDiff === 0 && weightDiff > 0 && `+${weightDiff} kg top weight`}
                    </span>
                  );
                } else if (volDiff < 0) {
                  comparisonBadge = (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-zinc-500/10 border border-zinc-500/20 text-zinc-400">
                      <TrendingDown size={13} />
                      {Math.abs(volDiff).toLocaleString()} kg volume variance
                    </span>
                  );
                } else {
                  comparisonBadge = (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-zinc-500/10 border border-zinc-500/20 text-zinc-400">
                      <Minus size={13} /> Performance Maintained
                    </span>
                  );
                }
              } else {
                comparisonBadge = (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#5BE584]/10 border border-[#5BE584]/20 text-[#5BE584]">
                    <Sparkles size={13} /> First Session Logged
                  </span>
                );
              }

              return (
                <div
                  key={log.id}
                  className="rounded-2xl border border-[#1E2329] bg-[#101418] overflow-hidden shadow-sm"
                >
                  {/* Movement Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 border-b border-[#1E2329] bg-[#141920]">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                          {log.exerciseName}
                        </h3>
                        {comparisonBadge}
                      </div>
                      <p className="text-xs text-[#9CA3AF]">
                        Target: {log.targetSets} Sets × {log.targetReps}
                      </p>
                    </div>

                    <ExerciseImage
                      src={log.exercise?.imageUrl}
                      alt={log.exerciseName}
                      size="lg"
                      fit="contain"
                    />
                  </div>

                  {/* Sets Comparison Table */}
                  <div className="p-5 space-y-4">
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[500px] text-left text-xs">
                        <thead>
                          <tr className="border-b border-[#1E2329] text-[11px] uppercase tracking-wider text-[#6B7280]">
                            <th className="pb-3 font-semibold">Set</th>
                            <th className="pb-3 font-semibold">Target</th>
                            <th className="pb-3 font-semibold">Actual Logged</th>
                            <th className="pb-3 font-semibold">Previous Performance</th>
                            <th className="pb-3 font-semibold text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1E2329]/50 font-mono">
                          {log.sets.map((set) => {
                            const prevSet = prev?.sets?.find(
                              (s) => s.setNumber === set.setNumber,
                            );

                            return (
                              <tr key={set.id} className="hover:bg-white/[0.01]">
                                <td className="py-3 text-white font-semibold">
                                  #{set.setNumber}
                                </td>
                                <td className="py-3 text-[#9CA3AF]">
                                  {set.targetReps || log.targetReps} reps
                                </td>
                                <td className="py-3">
                                  {set.completed ? (
                                    <span className="text-[#5BE584] font-semibold">
                                      {set.weight} kg × {set.actualReps} reps
                                    </span>
                                  ) : (
                                    <span className="text-[#6B7280]">
                                      {set.weight ? `${set.weight} kg × ` : ""}Skipped / Uncompleted
                                    </span>
                                  )}
                                </td>
                                <td className="py-3 text-[#9CA3AF]">
                                  {prevSet ? (
                                    <span>
                                      {prevSet.weight} kg × {prevSet.actualReps} reps
                                    </span>
                                  ) : (
                                    <span className="text-[#6B7280] italic font-sans text-[11px]">
                                      —
                                    </span>
                                  )}
                                </td>
                                <td className="py-3 text-right">
                                  {set.completed ? (
                                    <span className="inline-flex items-center gap-1 text-[11px] font-sans font-medium text-emerald-400">
                                      <CheckCircle2 size={13} /> Completed
                                    </span>
                                  ) : (
                                    <span className="text-[11px] font-sans text-[#6B7280]">
                                      Pending
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Historical summary footnote */}
                    {prev && (
                      <div className="pt-3 border-t border-[#1E2329] flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#9CA3AF]">
                        <span>
                          Previous workout on {prev.sessionDate ? new Date(prev.sessionDate).toLocaleDateString() : "earlier session"}:
                        </span>
                        <span className="font-mono text-white">
                          Total Volume: {prev.totalVolume?.toLocaleString() || 0} kg • Max Weight: {prev.maxWeight || 0} kg
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Navigation CTAs */}
        <section className="pt-6 border-t border-[#1E2329] flex flex-wrap items-center justify-between gap-4">
          <Link
            to="/dashboard"
            className="rounded-xl border border-[#1E2329] bg-[#101418] px-5 py-2.5 text-xs font-semibold text-[#9CA3AF] hover:text-white hover:border-[#2A313A] transition-colors"
          >
            Return to Dashboard
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to="/sessions"
              className="rounded-xl border border-[#1E2329] bg-[#101418] px-5 py-2.5 text-xs font-semibold text-white hover:border-[#2A313A] transition-colors"
            >
              View Workout History
            </Link>
            <Link
              to="/workout-builder"
              className="rounded-xl bg-[#5BE584] px-5 py-2.5 text-xs font-semibold text-[#090B0F] hover:bg-[#49D472] transition-colors shadow-[0_0_20px_rgba(91,229,132,0.2)]"
            >
              Start Another Workout
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
