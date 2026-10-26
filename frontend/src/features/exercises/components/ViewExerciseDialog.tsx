import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Dumbbell,
  ExternalLink,
  Lightbulb,
  PlayCircle,
  Sparkles,
  Target,
} from "lucide-react";
import type { Exercise } from "../types/exercise.types";
import ExerciseImage from "./ExerciseImage";

interface ViewExerciseDialogProps {
  exercise: Exercise | null;
  onClose: () => void;
}

export default function ViewExerciseDialog({
  exercise,
  onClose,
}: ViewExerciseDialogProps) {
  if (!exercise) return null;

  const exerciseId = exercise.id || exercise._id || "";

  return (
    <Dialog open={!!exercise} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[88vh] overflow-y-auto border-[#1E2329] bg-[#101418] text-[#F3F4F6] p-6 sm:p-7">
        <DialogHeader className="pb-4 border-b border-[#1E2329]">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <DialogTitle className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                  {exercise.name}
                </DialogTitle>
                <Badge
                  variant="secondary"
                  className="capitalize border border-[#5BE584]/30 bg-[#5BE584]/10 text-[#5BE584]"
                >
                  {exercise.difficulty}
                </Badge>
                {exercise.isCustom && (
                  <span className="inline-flex items-center gap-1 rounded-md border border-[#5BE584]/35 bg-[#5BE584]/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#5BE584]">
                    <Sparkles className="h-2.5 w-2.5" />
                    Custom
                  </span>
                )}
              </div>
              <DialogDescription className="text-sm leading-relaxed text-[#9CA3AF]">
                {exercise.description || "No description provided."}
              </DialogDescription>
            </div>

            {exerciseId && (
              <Link
                to={`/workout-library/exercises/${exerciseId}`}
                onClick={onClose}
                className="inline-flex items-center gap-1.5 shrink-0 rounded-xl border border-[#262D36] bg-[#141920] px-3 py-1.5 text-xs font-semibold text-[#F3F4F6] hover:border-[#5BE584]/50 hover:text-[#5BE584] transition-colors self-start"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Full Page
              </Link>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Top Grid: Metadata on Left, Framed Exercise Image on Right */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center rounded-2xl border border-[#1E2329] bg-[#0D1014] p-4 sm:p-5">
            <div className="md:col-span-7 space-y-4">
              {/* Primary & Secondary Muscles */}
              <div className="space-y-2">
                <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#9CA3AF]">
                  <Target className="h-3.5 w-3.5 text-[#5BE584]" />
                  Target Muscle Groups
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {exercise.primaryMuscles?.map((m) => (
                    <span
                      key={`prim-${m}`}
                      className="inline-flex items-center rounded-lg border border-[#5BE584]/35 bg-[#5BE584]/15 px-2.5 py-1 text-xs font-semibold text-[#5BE584]"
                    >
                      {m} (Primary)
                    </span>
                  ))}
                  {exercise.secondaryMuscles?.map((m) => (
                    <span
                      key={`sec-${m}`}
                      className="inline-flex items-center rounded-lg border border-[#1E2329] bg-[#13181E] px-2.5 py-1 text-xs font-medium text-[#9CA3AF]"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </div>

              {/* Equipment */}
              <div className="space-y-2">
                <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#9CA3AF]">
                  <Dumbbell className="h-3.5 w-3.5 text-[#9CA3AF]" />
                  Equipment Required
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {exercise.equipment?.length ? (
                    exercise.equipment.map((eq) => (
                      <span
                        key={eq}
                        className="inline-flex items-center rounded-lg border border-[#262D36] bg-[#141920] px-2.5 py-1 text-xs font-medium text-white"
                      >
                        {eq}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-[#6B7280]">None specified</span>
                  )}
                </div>
              </div>

              {/* External Video Link if available */}
              {exercise.videoUrl && (
                <div className="pt-1">
                  <a
                    href={exercise.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-[#5BE584]/30 bg-[#5BE584]/10 px-3.5 py-2 text-xs font-semibold text-[#5BE584] hover:bg-[#5BE584]/20 transition-colors"
                  >
                    <PlayCircle className="h-4 w-4" />
                    Watch Video Demonstration
                  </a>
                </div>
              )}
            </div>

            {/* Framed Image on Right */}
            <div className="md:col-span-5 flex justify-center">
              <ExerciseImage
                src={exercise.imageUrl}
                alt={exercise.name}
                size="custom"
                fit="contain"
                priority
                className="h-48 w-full rounded-xl border-[#2A313A]"
              />
            </div>
          </div>

          {/* Step-by-Step Instructions */}
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 text-sm font-bold text-white">
              <CheckCircle2 className="h-4 w-4 text-[#5BE584]" />
              Step-by-Step Execution
            </h4>
            <ol className="space-y-2.5">
              {exercise.instructions?.map((inst, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 rounded-xl border border-[#1E2329] bg-[#0D1014] p-3 text-xs sm:text-sm leading-relaxed text-[#E5E7EB]"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-[#5BE584]/30 bg-[#5BE584]/10 font-mono text-xs font-bold text-[#5BE584]">
                    {index + 1}
                  </span>
                  <span className="pt-0.5">{inst}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Pro Tips */}
          {exercise.tips && exercise.tips.length > 0 && (
            <div className="space-y-2.5 rounded-2xl border border-amber-500/25 bg-amber-500/5 p-4">
              <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
                <Lightbulb className="h-4 w-4" />
                Coaching Cues & Form Tips
              </h4>
              <ul className="space-y-1.5 text-xs sm:text-sm text-[#E5E7EB]">
                {exercise.tips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
