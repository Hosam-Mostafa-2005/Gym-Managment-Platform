import { Link } from "react-router-dom";
import { Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import WorkoutHeader from "../components/WorkoutHeader";
import ExerciseCard from "../components/ExerciseCard";
import FinishWorkoutDialog from "../components/FinishWorkoutDialog";
import SetRow from "../components/SetRow";
import { useCurrentWorkoutSession } from "../hooks/useCurrentWorkoutSession";
import type { WorkoutExerciseLog } from "../types/workout-session.types";

export default function ActiveWorkoutPage() {
  const { data, isLoading } = useCurrentWorkoutSession();

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
              There is no active workout session currently running.
            </p>
            <div className="mt-6">
              <Link
                to="/workouts"
                className="inline-flex items-center justify-center gap-2 rounded-md bg-[#5BE584] px-4 py-2 text-xs font-semibold text-[#090B0F] transition-all hover:bg-[#4ade80]"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Return to Workouts
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full bg-[#0D1014] text-[#F3F4F6] font-sans selection:bg-[#5BE584]/30">
      {/* Background Atmosphere */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(30,35,41,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(30,35,41,0.2)_1px,transparent_1px)] bg-[size:32px_32px]" />
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-[radial-gradient(circle_at_center,_rgba(91,229,132,0.02)_0%,_rgba(13,16,20,0)_70%)] blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-[#1E2329] bg-[#0D1014]/90 backdrop-blur-md pt-8 pb-6 px-6 lg:px-12">
        <div className="mx-auto max-w-4xl flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-[11px] font-medium tracking-wide text-[#6B7280] uppercase">
              <span className="text-[#F3F4F6]">Sessions</span>
              <span>/</span>
              <span className="text-[#5BE584] font-semibold">
                Active Workout
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-white mt-1">
              Live Session
            </h1>
            <p className="text-sm text-[#9CA3AF]">
              Track your sets, weights, and reps in real-time.
            </p>
          </div>

          <FinishWorkoutDialog sessionId={data.session.id} />
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 mx-auto max-w-4xl px-6 lg:px-12 py-10 pb-32 space-y-10 animate-in fade-in duration-300">
        <WorkoutHeader session={data.session} />

        <div className="h-px w-full bg-gradient-to-r from-[#1E2329] to-transparent" />

        <section className="space-y-6">
          <div className="mb-4">
            <h2 className="text-[11px] font-bold tracking-widest text-[#6B7280] uppercase">
              Exercise Log
            </h2>
          </div>

          {data.exerciseLogs.map((exercise: WorkoutExerciseLog) => (
            <ExerciseCard key={exercise.id} exercise={exercise}>
              {exercise.sets.map((set) => (
                <SetRow key={set.id} set={set} />
              ))}
            </ExerciseCard>
          ))}
        </section>
      </main>
    </div>
  );
}
