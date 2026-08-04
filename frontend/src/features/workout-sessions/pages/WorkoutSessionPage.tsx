import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";

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
      <section className="min-h-[70vh] flex flex-col items-center justify-center">
        <span className="w-8 h-8 border-2 border-[#5BE584] border-t-transparent rounded-full animate-spin"></span>
      </section>
    );
  }

  if (isError || !session) {
    return (
      <section className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-white">
        <div className="bg-[#11151B] border border-white/5 rounded-2xl p-8 text-center max-w-md w-full shadow-lg">
          <p className="text-[#9CA3AF] mb-6 font-medium">
            Failed to load session details or session not found.
          </p>
          <Button
            onClick={() => refetch()}
            className="bg-[#5BE584] text-black hover:bg-[#5BE584]/90 rounded-xl px-6 py-6 font-medium w-full flex items-center justify-center gap-2"
          >
            <RefreshCw size={18} />
            Try Again
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-5xl space-y-8 p-6 md:p-10 pb-12 text-white bg-[#090B0F] min-h-screen">
      <div className="flex items-center gap-4 mb-2">
        <Button
          variant="outline"
          size="icon"
          onClick={handleBack}
          className="bg-[#11151B] border-white/10 text-white hover:bg-white/10 hover:text-white rounded-xl h-12 w-12 flex-shrink-0 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Workout Session
          </h1>
          <p className="text-sm text-[#9CA3AF] mt-1">
            Review completed workout details and performance.
          </p>
        </div>
      </div>
      <WorkoutHeader session={session} />
      <SessionStatistics
        duration={session.duration}
        totalVolume={session.totalVolume}
        exercisesCompleted={session.exercisesCompleted}
        setsCompleted={session.setsCompleted}
      />
      <ExerciseTimeline exercises={exerciseLogs} />
      <SessionNotes notes={undefined} />{" "}
    </section>
  );
}
