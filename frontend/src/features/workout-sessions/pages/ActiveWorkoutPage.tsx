import { useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, AlertCircle, ArrowLeft, Dumbbell, Sparkles } from "lucide-react";
import WorkoutHeader from "../components/WorkoutHeader";
import ExerciseCard from "../components/ExerciseCard";
import FinishWorkoutDialog from "../components/FinishWorkoutDialog";
import WorkoutTimer from "../components/WorkoutTimer";
import RestTimer from "../components/RestTimer";
import ExerciseProgress from "../components/ExerciseProgress";
import ExerciseNavigator from "../components/ExerciseNavigator";
import { useCurrentWorkoutSession } from "../hooks/useCurrentWorkoutSession";
import { usePreviousPerformance } from "../hooks/usePreviousPerformance";
import type { WorkoutExerciseLog } from "../types/workout-session.types";

export default function ActiveWorkoutPage() {
  const { data, isLoading } = useCurrentWorkoutSession();

  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [isAllView, setIsAllView] = useState(false);
  const [restSeconds, setRestSeconds] = useState(60);
  const [isRestTimerOpen, setIsRestTimerOpen] = useState(false);

  // Previous performance query
  const sessionId = data?.session?.id;
  const { data: previousPerformance } = usePreviousPerformance(sessionId);

  if (isLoading) {
    return (
      <div className="relative min-h-screen w-full bg-[#0D1014] text-[#F3F4F6] font-sans selection:bg-[#5BE584]/30">
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(30,35,41,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(30,35,41,0.2)_1px,transparent_1px)] bg-[size:32px_32px]" />
        </div>
        <div className="relative z-10 mx-auto max-w-4xl px-6 lg:px-12 py-32 flex flex-col items-center justify-center text-[#6B7280]">
          <Loader2 className="h-8 w-8 animate-spin text-[#5BE584]" />
          <p className="mt-4 text-sm font-medium">Loading active session...</p>
        </div>
      </div>
    );
  }

  if (!data || !data.session) {
    return (
      <div className="relative min-h-screen w-full bg-[#0D1014] text-[#F3F4F6] font-sans selection:bg-[#5BE584]/30">
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(30,35,41,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(30,35,41,0.2)_1px,transparent_1px)] bg-[size:32px_32px]" />
        </div>
        <div className="relative z-10 mx-auto max-w-4xl px-6 lg:px-12 py-32">
          <div className="rounded-xl border border-red-900/50 bg-red-950/20 p-12 text-center backdrop-blur-sm max-w-md mx-auto">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-950/50 text-red-400 border border-red-900/50 mx-auto mb-4">
              <AlertCircle className="h-6 w-6" />
            </div>
            <h2 className="text-base font-semibold text-white">
              No Active Workout
            </h2>
            <p className="mt-2 text-xs text-[#9CA3AF] max-w-xs mx-auto leading-relaxed">
              There is no active workout session currently running. Start a workout from your library or coach assignment.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/workout-builder"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#5BE584] px-4 py-2.5 text-xs font-semibold text-[#090B0F] transition-all hover:bg-[#49D472]"
              >
                <Dumbbell className="h-3.5 w-3.5" />
                Browse Workouts
              </Link>
              <Link
                to="/sessions"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#1E2329] bg-[#101418] px-4 py-2.5 text-xs font-semibold text-[#9CA3AF] transition-all hover:text-white hover:border-[#2A313A]"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Return to Sessions
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const session = data.session;
  const exerciseLogs = data.exerciseLogs || [];

  // Compute live session statistics
  const totalExercises = exerciseLogs.length;
  const exercisesDone = exerciseLogs.filter((e) => e.completed).length;
  let totalSets = 0;
  let setsDone = 0;
  let totalVolume = 0;

  for (const ex of exerciseLogs) {
    totalSets += ex.targetSets || ex.sets.length;
    for (const s of ex.sets) {
      if (s.completed) {
        setsDone += 1;
        totalVolume += (s.weight || 0) * (s.actualReps || 0);
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
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(30,35,41,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(30,35,41,0.2)_1px,transparent_1px)] bg-[size:32px_32px]" />
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-[radial-gradient(circle_at_center,_rgba(91,229,132,0.03)_0%,_rgba(13,16,20,0)_70%)] blur-3xl" />
      </div>

      {/* Sticky Header Bar */}
      <header className="sticky top-0 z-30 border-b border-[#1E2329] bg-[#0D1014]/90 backdrop-blur-md px-4 sm:px-8 py-4">
        <div className="mx-auto max-w-5xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              to="/sessions"
              className="rounded-xl border border-[#1E2329] bg-[#101418] p-2 text-[#9CA3AF] hover:text-white hover:border-[#2A313A] transition-colors"
              title="Return to Sessions"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>

            <div>
              <div className="flex items-center gap-2 text-[11px] font-medium tracking-wide text-[#6B7280] uppercase">
                <span>Live Training</span>
                <span>/</span>
                <span className="text-[#5BE584] font-semibold">Active Session</span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                {session.workout?.title || session.assignment?.workout?.title || "Workout Session"}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
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
      <main className="relative z-10 mx-auto max-w-5xl px-4 sm:px-8 py-6 space-y-6 animate-in fade-in duration-300">
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
          />
        )}

        {/* Movement Cards Container */}
        <section className="space-y-6">
          {isAllView ? (
            // Show All Mode
            exerciseLogs.map((exercise: WorkoutExerciseLog, idx: number) => {
              const prev = previousPerformance?.[exercise.exercise?.id || ""];
              return (
                <ExerciseCard
                  key={exercise.id}
                  exercise={exercise}
                  previousPerformance={prev}
                  onSetCompleted={handleSetCompleted}
                  isFocused={idx === currentExerciseIndex}
                  showConnector={idx < exerciseLogs.length - 1}
                />
              );
            })
          ) : (
            // Focus Mode (Current Movement)
            currentLog && (
              <ExerciseCard
                exercise={currentLog}
                previousPerformance={
                  previousPerformance?.[currentLog.exercise?.id || ""]
                }
                onSetCompleted={handleSetCompleted}
                isFocused={true}
              />
            )
          )}
        </section>
      </main>

      {/* Rest Countdown Floating Timer */}
      <RestTimer
        initialSeconds={restSeconds}
        isOpen={isRestTimerOpen}
        onClose={() => setIsRestTimerOpen(false)}
      />
    </div>
  );
}
