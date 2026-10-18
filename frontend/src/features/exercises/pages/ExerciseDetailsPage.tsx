import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Dumbbell,
  ExternalLink,
  Flame,
  Layers,
  Lightbulb,
  Loader2,
  Pencil,
  PlayCircle,
  Target,
} from "lucide-react";
import { useExercise } from "../hooks/useExercises";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { ROLES } from "@/constants/roles";
import { Button } from "@/components/ui/button";

const ExerciseDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: user } = useCurrentUser();
  const canManage = user?.role === ROLES.ADMIN || user?.role === ROLES.TRAINER;

  const { data: exercise, isLoading, isError } = useExercise(id, !!id);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-[#94A3B8]">
        <Loader2 className="h-8 w-8 animate-spin text-[#5BE584]" />
        <p className="mt-4 text-sm font-medium">Loading exercise details...</p>
      </div>
    );
  }

  if (isError || !exercise) {
    return (
      <div className="mx-auto max-w-3xl py-16 text-center space-y-4">
        <h2 className="text-xl font-semibold text-[#F8FAFC]">
          Exercise not found
        </h2>
        <p className="text-sm text-[#94A3B8]">
          The requested exercise could not be loaded or no longer exists.
        </p>
        <Button
          variant="outline"
          onClick={() => navigate("/workout-library/exercises")}
        >
          Back to Exercise Library
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-16">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#2A3039] pb-6">
        <div className="space-y-1.5">
          <button
            type="button"
            onClick={() => navigate("/workout-library/exercises")}
            className="inline-flex items-center gap-2 text-xs font-medium text-[#94A3B8] hover:text-[#F8FAFC] transition-colors mb-1"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Exercises
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F8FAFC]">
            {exercise.name}
          </h1>
          {exercise.description && (
            <p className="text-sm leading-relaxed text-[#94A3B8] max-w-3xl">
              {exercise.description}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {exercise.videoUrl && (
            <a
              href={exercise.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-[14px] bg-[#5BE584]/10 border border-[#5BE584]/25 px-4 py-2.5 text-sm font-semibold text-[#5BE584] transition-colors hover:bg-[#5BE584]/20"
            >
              <PlayCircle className="h-4 w-4" />
              <span>Watch Tutorial</span>
              <ExternalLink className="h-3.5 w-3.5 opacity-70" />
            </a>
          )}

          {canManage && (
            <Button
              onClick={() =>
                navigate(`/workout-library/exercises/${exercise.id}/edit`)
              }
            >
              <Pencil className="mr-2 h-4 w-4" />
              Edit Exercise
            </Button>
          )}
        </div>
      </div>

      {/* Quick-Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-[20px] border border-[#2A3039] bg-[#13171D] p-5">
          <div className="mb-3 flex items-center gap-2 text-[#5BE584]">
            <Dumbbell className="h-4 w-4" />
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#94A3B8]">
              Equipment
            </h3>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {exercise.equipment?.length ? (
              exercise.equipment.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center rounded-md bg-[#090B0F] border border-[#2A3039] px-2.5 py-1 text-xs text-[#F8FAFC]"
                >
                  {item}
                </span>
              ))
            ) : (
              <span className="text-xs text-[#94A3B8]">Bodyweight</span>
            )}
          </div>
        </div>

        <div className="rounded-[20px] border border-[#2A3039] bg-[#13171D] p-5">
          <div className="mb-3 flex items-center gap-2 text-[#F59E0B]">
            <Flame className="h-4 w-4" />
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#94A3B8]">
              Difficulty
            </h3>
          </div>
          <span className="inline-flex items-center rounded-md bg-[#090B0F] border border-[#2A3039] px-2.5 py-1 text-xs font-medium text-[#F8FAFC] capitalize">
            {exercise.difficulty || "Beginner"}
          </span>
        </div>

        <div className="rounded-[20px] border border-[#2A3039] bg-[#13171D] p-5">
          <div className="mb-3 flex items-center gap-2 text-[#5BE584]">
            <Target className="h-4 w-4" />
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#94A3B8]">
              Primary Muscles
            </h3>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {exercise.primaryMuscles?.length ? (
              exercise.primaryMuscles.map((muscle) => (
                <span
                  key={muscle}
                  className="inline-flex items-center rounded-md bg-[#5BE584]/10 border border-[#5BE584]/25 px-2.5 py-1 text-xs font-medium text-[#5BE584]"
                >
                  {muscle}
                </span>
              ))
            ) : (
              <span className="text-xs text-[#94A3B8]">—</span>
            )}
          </div>
        </div>

        <div className="rounded-[20px] border border-[#2A3039] bg-[#13171D] p-5">
          <div className="mb-3 flex items-center gap-2 text-[#94A3B8]">
            <Layers className="h-4 w-4" />
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#94A3B8]">
              Secondary Muscles
            </h3>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {exercise.secondaryMuscles?.length ? (
              exercise.secondaryMuscles.map((muscle) => (
                <span
                  key={muscle}
                  className="inline-flex items-center rounded-md bg-[#090B0F] border border-[#2A3039] px-2.5 py-1 text-xs text-[#94A3B8]"
                >
                  {muscle}
                </span>
              ))
            ) : (
              <span className="text-xs text-[#94A3B8]">None</span>
            )}
          </div>
        </div>
      </div>

      {/* Instructions */}
      {exercise.instructions?.length > 0 && (
        <div className="rounded-[20px] border border-[#2A3039] bg-[#13171D] p-6">
          <h3 className="mb-4 text-xs font-bold tracking-widest text-[#94A3B8] uppercase">
            Execution Instructions
          </h3>
          <ol className="space-y-3">
            {exercise.instructions.map((step, index) => (
              <li
                key={index}
                className="flex items-start gap-3 text-sm leading-relaxed text-[#F8FAFC]"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#090B0F] border border-[#2A3039] font-mono text-xs text-[#5BE584]">
                  {(index + 1).toString().padStart(2, "0")}
                </span>
                <span className="pt-0.5">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Tips */}
      <div className="rounded-[20px] border border-[#2A3039] bg-[#13171D] p-6">
        <div className="mb-4 flex items-center gap-2 text-[#F59E0B]">
          <Lightbulb className="h-4 w-4 shrink-0" />
          <h3 className="text-xs font-bold tracking-widest text-[#94A3B8] uppercase">
            Coaching Tips
          </h3>
        </div>

        {exercise.tips?.length ? (
          <ul className="space-y-2.5">
            {exercise.tips.map((tip, index) => (
              <li
                key={index}
                className="flex items-start gap-2.5 text-sm leading-relaxed text-[#F8FAFC]"
              >
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#F59E0B]" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-[#94A3B8]">
            Focus on controlled eccentric tempo and full range of motion.
          </p>
        )}
      </div>
    </div>
  );
};

export default ExerciseDetailsPage;
