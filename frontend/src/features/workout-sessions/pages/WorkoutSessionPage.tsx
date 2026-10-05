import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, RefreshCw, Loader2, AlertCircle } from "lucide-react";

import { useWorkoutSession } from "../hooks/useWorkoutSession";

import WorkoutHeader from "../components/WorkoutHeader";
import SessionStatistics from "../components/SessionStatistics";
import ExerciseTimeline from "../components/ExerciseTimeline";
import SessionNotes from "../components/SessionNotes";

export default function WorkoutSessionPage() {
  const navigate = useNavigate();

  const { sessionId } = useParams<{
    sessionId: string;
  }>();

  const { data, isLoading, isError, refetch } = useWorkoutSession(sessionId!);

  const session = data?.session;
  const exerciseLogs = data?.exerciseLogs ?? [];

  const handleBack = () => {
    navigate("/sessions");
  };

  if (isLoading) {
    return (
      <div className="relative min-h-screen w-full bg-[#0D1014] text-[#F3F4F6] font-sans selection:bg-[#5BE584]/30">
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(30,35,41,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(30,35,41,0.2)_1px,transparent_1px)] bg-[size:32px_32px]" />
        </div>
        <div className="relative z-10 mx-auto max-w-5xl px-6 lg:px-12 py-32 flex flex-col items-center justify-center text-[#6B7280]">
          <Loader2 className="h-8 w-8 animate-spin text-[#5BE584]" />
          <p className="mt-4 text-sm font-medium">Loading session details...</p>
        </div>
      </div>
    );
  }

  if (isError || !session) {
    return (
      <div className="relative min-h-screen w-full bg-[#0D1014] text-[#F3F4F6] font-sans selection:bg-[#5BE584]/30">
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(30,35,41,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(30,35,41,0.2)_1px,transparent_1px)] bg-[size:32px_32px]" />
        </div>
        <div className="relative z-10 mx-auto max-w-5xl px-6 lg:px-12 py-32">
          <div className="rounded-xl border border-red-900/50 bg-red-950/20 p-12 text-center backdrop-blur-sm max-w-md mx-auto">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-950/50 text-red-400 border border-red-900/50 mx-auto mb-4">
              <AlertCircle className="h-6 w-6" />
            </div>
            <h2 className="text-base font-semibold text-white">
              Session Not Found
            </h2>
            <p className="mt-2 text-xs text-[#9CA3AF] max-w-xs mx-auto leading-relaxed">
              Failed to load session details or session not found.
            </p>
            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                onClick={handleBack}
                className="inline-flex items-center justify-center gap-2 rounded-md border border-[#1E2329] bg-[#101418] px-4 py-2 text-xs font-medium text-[#9CA3AF] transition-colors hover:border-[#6B7280] hover:text-white"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to Sessions
              </button>
              <button
                onClick={() => refetch()}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-[#5BE584] px-4 py-2 text-xs font-semibold text-[#090B0F] transition-all hover:bg-[#4ade80]"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Try Again
              </button>
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
        <div className="mx-auto max-w-5xl flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-[11px] font-medium tracking-wide text-[#6B7280] uppercase">
              <span
                className="hover:text-[#9CA3AF] cursor-pointer transition-colors"
                onClick={handleBack}
              >
                Sessions
              </span>
              <span>/</span>
              <span className="text-[#F3F4F6]">Session Details</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-white mt-1">
              Workout Session
            </h1>
            <p className="text-sm text-[#9CA3AF]">
              Review completed workout details and performance.
            </p>
          </div>

          <button
            onClick={handleBack}
            className="group flex items-center justify-center gap-2 rounded-md border border-[#1E2329] bg-[#101418] px-4 py-2 text-sm font-medium text-[#9CA3AF] transition-colors hover:border-[#6B7280] hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Sessions
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 mx-auto max-w-5xl px-6 lg:px-12 py-10 pb-32 space-y-10 animate-in fade-in duration-300">
        <WorkoutHeader session={session} />

        <div className="h-px w-full bg-gradient-to-r from-[#1E2329] to-transparent" />

        <SessionStatistics
          duration={session.duration}
          totalVolume={session.totalVolume}
          exercisesCompleted={session.exercisesCompleted}
          setsCompleted={session.setsCompleted}
        />

        <div className="h-px w-full bg-gradient-to-r from-[#1E2329] to-transparent" />

        <ExerciseTimeline exercises={exerciseLogs} />

        {session.notes && (
          <>
            <div className="h-px w-full bg-gradient-to-r from-[#1E2329] to-transparent" />
            <SessionNotes notes={session.notes} />
          </>
        )}
      </main>
    </div>
  );
}
