import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Loader2,
  AlertCircle,
  ArrowLeft,
  Dumbbell,
  Plus,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import WorkoutHeader from "../components/WorkoutHeader";
import ExerciseCard from "../components/ExerciseCard";
import FinishWorkoutDialog from "../components/FinishWorkoutDialog";
import WorkoutTimer from "../components/WorkoutTimer";
import RestTimer from "../components/RestTimer";
import ExerciseProgress from "../components/ExerciseProgress";
import ExerciseNavigator from "../components/ExerciseNavigator";
import AddSessionExerciseDialog from "../components/AddSessionExerciseDialog";
import { useCurrentWorkoutSession } from "../hooks/useCurrentWorkoutSession";
import { usePreviousPerformance } from "../hooks/usePreviousPerformance";
import type { WorkoutExerciseLog } from "../types/workout-session.types";

export default function ActiveWorkoutPage() {
  const { t } = useTranslation(["workoutSessions", "common"]);
  const { data, isLoading } = useCurrentWorkoutSession();

  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [isAllView, setIsAllView] = useState(false);
  const [restSeconds, setRestSeconds] = useState(60);
  const [isRestTimerOpen, setIsRestTimerOpen] = useState(false);
  const [isAddExerciseOpen, setIsAddExerciseOpen] = useState(false);
  const [showCompletedSection, setShowCompletedSection] = useState(true);

  // Previous performance query
  const sessionId = data?.session?.id;
  const { data: previousPerformance } = usePreviousPerformance(sessionId);

  // Compute live session statistics
  const session = data?.session;
  const exerciseLogs = data?.exerciseLogs || [];

  // Helper to determine whether an exercise is completed
  const isLogCompleted = (log: WorkoutExerciseLog) =>
    Boolean(
      log.completed ||
        (log.sets && log.sets.length > 0 && log.sets.every((s) => s.completed)),
    );

  // Partition exercises: active/in-progress first, completed at the bottom
  const inProgressExercises = useMemo(
    () => exerciseLogs.filter((log) => !isLogCompleted(log)),
    [exerciseLogs],
  );

  const completedExercises = useMemo(
    () => exerciseLogs.filter((log) => isLogCompleted(log)),
    [exerciseLogs],
  );

  if (isLoading) {
    return (
      <div className="relative min-h-screen w-full bg-[#0D1014] text-[#F3F4F6] font-sans selection:bg-[#5BE584]/30">
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(30,35,41,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(30,35,41,0.2)_1px,transparent_1px)] bg-[size:32px_32px]" />
        </div>
        <div className="relative z-10 mx-auto max-w-4xl px-6 lg:px-12 py-32 flex flex-col items-center justify-center text-[#6B7280]">
          <Loader2 className="h-8 w-8 animate-spin text-[#5BE584]" />
          <p className="mt-4 text-sm font-medium">
            {t("activeWorkout.loadingSession", "Loading active session...")}
          </p>
        </div>
      </div>
    );
  }

  if (!data || !session) {
    return (
      <div className="relative min-h-screen w-full bg-[#0D1014] text-[#F3F4F6] font-sans selection:bg-[#5BE584]/30">
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(30,35,41,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(30,35,41,0.2)_1px,transparent_1px)] bg-[size:32px_32px]" />
        </div>
        <div className="relative z-10 mx-auto max-w-4xl px-6 lg:px-12 py-32">
          <div className="rounded-xl border border-red-900/50 bg-red-950/20 p-12 text-center backdrop-blur-sm max-w-md mx-auto">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-950/50 text-red-400 border border-red-900/50 mx-auto mb-4">
              <AlertCircle className="h-6 w-6" />
            </div>
            <h2 className="text-base font-semibold text-white">
              {t("activeWorkout.noActiveTitle", "No Active Workout")}
            </h2>
            <p className="mt-2 text-xs text-[#9CA3AF] max-w-xs mx-auto leading-relaxed">
              {t(
                "activeWorkout.noActiveDesc",
                "There is no active workout session currently running. Start a workout from your library or coach assignment.",
              )}
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/workout-builder"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#5BE584] px-4 py-2.5 text-xs font-semibold text-[#090B0F] transition-all hover:bg-[#49D472]"
              >
                <Dumbbell className="h-3.5 w-3.5" />
                {t("activeWorkout.browseWorkouts", "Browse Workouts")}
              </Link>
              <Link
                to="/sessions"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#1E2329] bg-[#101418] px-4 py-2.5 text-xs font-semibold text-[#9CA3AF] transition-all hover:text-white hover:border-[#2A313A]"
              >
                <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" />
                {t("activeWorkout.returnToSessions", "Return to Sessions")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const totalExercises = exerciseLogs.length;
  const exercisesDone = completedExercises.length;
  let totalSets = 0;
  let setsDone = 0;
  let totalVolume = 0;

  for (const ex of exerciseLogs) {
    const setsByNum = new Map<number, boolean[]>();
    for (const s of ex.sets) {
      if (!setsByNum.has(s.setNumber)) {
        setsByNum.set(s.setNumber, []);
      }
      setsByNum.get(s.setNumber)!.push(s.completed);
      if (s.completed) {
        totalVolume += (s.weight || 0) * (s.actualReps || 0);
      }
    }

    const uniqueSetCount = setsByNum.size;
    totalSets += Math.max(uniqueSetCount, ex.targetSets || 0);

    for (const stageStates of setsByNum.values()) {
      if (stageStates.length > 0 && stageStates.every((c) => c === true)) {
        setsDone += 1;
      }
    }
  }

  const handleSetCompleted = (targetRest = 60) => {
    setRestSeconds(targetRest);
    setIsRestTimerOpen(true);
  };

  const currentLog = exerciseLogs[currentExerciseIndex] || exerciseLogs[0];

  return (
    <div className="relative min-h-screen w-full bg-[#0D1014] text-[#F3F4F6] font-sans selection:bg-[#5BE584]/30 pb-40 sm:pb-48">
      {/* Background Atmosphere */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(30,35,41,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(30,35,41,0.2)_1px,transparent_1px)] bg-[size:32px_32px]" />
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-[radial-gradient(circle_at_center,_rgba(91,229,132,0.03)_0%,_rgba(13,16,20,0)_70%)] blur-3xl" />
      </div>

      {/* Sticky Header Bar */}
      <header className="sticky top-0 z-30 border-b border-[#1E2329] bg-[#0D1014]/90 backdrop-blur-md px-3 sm:px-8 py-2.5 sm:py-4">
        <div className="mx-auto max-w-5xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4">
          <div className="flex items-center gap-3">
            <Link
              to="/sessions"
              className="rounded-xl border border-[#1E2329] bg-[#101418] p-2 text-[#9CA3AF] hover:text-white hover:border-[#2A313A] transition-colors"
              title={t("activeWorkout.returnToSessions", "Return to Sessions")}
            >
              <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
            </Link>

            <div>
              <div className="flex items-center gap-2 text-[11px] font-medium tracking-wide text-[#6B7280] uppercase">
                <span>{t("activeWorkout.breadcrumbLive", "Live Training")}</span>
                <span>/</span>
                <span className="text-[#5BE584] font-semibold">
                  {t("activeWorkout.breadcrumbActive", "Active Session")}
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                {session.workout?.title ||
                  session.assignment?.workout?.title ||
                  t("overview.workoutSessionDefault", "Workout Session")}
              </h1>
            </div>
          </div>

          <div className="flex items-center justify-between w-full sm:w-auto sm:justify-start gap-2 sm:gap-3">
            {/* Add Exercise CTA in Header */}
            <button
              type="button"
              onClick={() => setIsAddExerciseOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#1E2329] bg-[#101418] px-3 py-2 text-xs font-semibold text-[#5BE584] hover:bg-[#16291D] hover:border-[#5BE584]/40 transition-colors"
            >
              <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
              <span>{t("activeWorkout.addExercise", "Add Exercise")}</span>
            </button>

            {/* Live Elapsed Timer */}
            <WorkoutTimer startedAt={session.startedAt} />

            {/* Finish Workout CTA */}
            <FinishWorkoutDialog
              sessionId={session.id}
              stats={{
                duration: session.duration,
                volume: totalVolume,
                exercisesDone,
                totalExercises,
                setsDone,
                totalSets,
              }}
            />
          </div>
        </div>
      </header>

      {/* Main Training Space */}
      <div className="relative z-10 mx-auto max-w-5xl px-3 sm:px-8 py-3.5 sm:py-6 space-y-4 sm:space-y-6 animate-in fade-in duration-300">
        {/* Workout & Client/Trainer Summary Card */}
        <WorkoutHeader session={session} />

        {/* Global Progress Bar */}
        <ExerciseProgress exerciseLogs={exerciseLogs} />

        {/* Movement Switcher */}
        {exerciseLogs.length > 1 && (
          <ExerciseNavigator
            exerciseLogs={exerciseLogs}
            currentIndex={currentExerciseIndex}
            onSelectIndex={setCurrentExerciseIndex}
            isAllView={isAllView}
            onToggleAllView={() => setIsAllView(!isAllView)}
            onAddExercise={() => setIsAddExerciseOpen(true)}
          />
        )}

        {/* Movement Cards Container */}
        <section className="space-y-6">
          {isAllView ? (
            // =========================================================================
            // SHOW ALL VIEW: In-Progress movements first, Completed movements at bottom
            // =========================================================================
            <div className="space-y-6">
              {/* Active / In-Progress Exercises */}
              <div className="space-y-6">
                {inProgressExercises.map((exercise: WorkoutExerciseLog) => {
                  const prev =
                    previousPerformance?.[exercise.exercise?.id || ""];
                  return (
                    <ExerciseCard
                      key={exercise.id}
                      exercise={exercise}
                      sessionId={sessionId}
                      previousPerformance={prev}
                      onSetCompleted={handleSetCompleted}
                      isFocused={false}
                      showConnector={false}
                    />
                  );
                })}
              </div>

              {/* All Completed Celebration Notice */}
              {inProgressExercises.length === 0 &&
                completedExercises.length > 0 && (
                  <div className="rounded-2xl border border-[#23422E] bg-[#121B15] p-6 text-center space-y-2">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#16291D] border border-[#23422E] text-[#5BE584]">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <h3 className="text-sm font-bold text-white">
                      {t(
                        "activeWorkout.allCompletedTitle",
                        "All Scheduled Exercises Completed!",
                      )}
                    </h3>
                    <p className="text-xs text-[#9CA3AF] max-w-md mx-auto">
                      {t(
                        "activeWorkout.allCompletedDesc",
                        "Great work! You can add extra exercises if you want additional volume, or finish your workout session.",
                      )}
                    </p>
                  </div>
                )}

              {/* Action: Add Exercise Card */}
              <button
                type="button"
                onClick={() => setIsAddExerciseOpen(true)}
                className="w-full rounded-2xl border-2 border-dashed border-[#1E2329] bg-[#101418]/60 p-5 text-center transition-all hover:border-[#5BE584]/50 hover:bg-[#12171E] group"
              >
                <div className="flex items-center justify-center gap-2 text-xs font-semibold text-[#9CA3AF] group-hover:text-[#5BE584]">
                  <Plus className="h-4 w-4 stroke-[2.5]" />
                  <span>
                    {t(
                      "activeWorkout.addAnotherExercise",
                      "Add Another Exercise to This Workout",
                    )}
                  </span>
                </div>
              </button>

              {/* Completed Exercises Section (Sorted to Bottom) */}
              {completedExercises.length > 0 && (
                <div className="space-y-4 pt-4 border-t border-[#1E2329]/80">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#16291D] border border-[#23422E] text-[#5BE584]">
                        <CheckCircle2 className="h-3.5 w-3.5 stroke-[2.5]" />
                      </div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-[#9CA3AF]">
                        {t("activeWorkout.completedMovements", {
                          count: completedExercises.length,
                          defaultValue: `Completed Movements (${completedExercises.length})`,
                        })}
                      </h3>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setShowCompletedSection(!showCompletedSection)
                      }
                      className="inline-flex items-center gap-1 text-xs text-[#9CA3AF] hover:text-white transition-colors"
                    >
                      <span>
                        {showCompletedSection
                          ? t("activeWorkout.hide", "Hide")
                          : t("activeWorkout.show", "Show")}
                      </span>
                      {showCompletedSection ? (
                        <ChevronUp className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>

                  {showCompletedSection && (
                    <div className="space-y-5 opacity-90 transition-opacity">
                      {completedExercises.map((exercise: WorkoutExerciseLog) => {
                        const prev =
                          previousPerformance?.[exercise.exercise?.id || ""];
                        return (
                          <ExerciseCard
                            key={exercise.id}
                            exercise={exercise}
                            sessionId={sessionId}
                            previousPerformance={prev}
                            onSetCompleted={handleSetCompleted}
                            isFocused={false}
                            showConnector={false}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            // =========================================================================
            // FOCUS MODE (Single Movement Focused View)
            // =========================================================================
            <div className="space-y-6">
              {currentLog && (
                <ExerciseCard
                  exercise={currentLog}
                  sessionId={sessionId}
                  previousPerformance={
                    previousPerformance?.[currentLog.exercise?.id || ""]
                  }
                  onSetCompleted={handleSetCompleted}
                  isFocused={true}
                />
              )}

              {/* Add Exercise prompt */}
              <button
                type="button"
                onClick={() => setIsAddExerciseOpen(true)}
                className="w-full rounded-2xl border border-dashed border-[#1E2329] bg-[#101418]/60 p-4 text-center transition-all hover:border-[#5BE584]/50 hover:bg-[#12171E] group"
              >
                <div className="flex items-center justify-center gap-2 text-xs font-semibold text-[#9CA3AF] group-hover:text-[#5BE584]">
                  <Plus className="h-4 w-4 stroke-[2.5]" />
                  <span>
                    {t(
                      "activeWorkout.addAnotherExercise",
                      "Add Another Exercise to Workout",
                    )}
                  </span>
                </div>
              </button>
            </div>
          )}
        </section>
      </div>

      {/* Rest Countdown Floating Timer */}
      <RestTimer
        initialSeconds={restSeconds}
        isOpen={isRestTimerOpen}
        onClose={() => setIsRestTimerOpen(false)}
      />

      {/* Add Session Exercise Modal Dialog */}
      <AddSessionExerciseDialog
        isOpen={isAddExerciseOpen}
        onClose={() => setIsAddExerciseOpen(false)}
        sessionId={session.id}
      />
    </div>
  );
}
