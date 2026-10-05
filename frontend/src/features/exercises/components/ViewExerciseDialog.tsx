import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useExercise } from "../hooks/useExercises";
import {
  Dumbbell,
  Target,
  Layers,
  Flame,
  Lightbulb,
  PlayCircle,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ViewExerciseDialogProps {
  exerciseId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface InfoCardProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  className?: string;
}

const InfoCard = ({ icon, title, children, className }: InfoCardProps) => (
  <div
    className={cn(
      "flex flex-col justify-between rounded-xl border border-[#1E2329] bg-[#101418] p-5 transition-all duration-200 hover:border-[#2A313A]",
      className,
    )}
  >
    <div>
      <div className="mb-3 flex items-center gap-2 text-[#5BE584]">
        {icon}
        <h3 className="text-xs font-bold uppercase tracking-widest text-[#6B7280]">
          {title}
        </h3>
      </div>
      {children}
    </div>
  </div>
);

const ViewExerciseDialog: React.FC<ViewExerciseDialogProps> = ({
  exerciseId,
  open,
  onOpenChange,
}) => {
  const { data: exercise, isLoading } = useExercise(exerciseId, open);

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90vh] w-[95vw] max-w-5xl overflow-hidden rounded-xl border border-[#1E2329] bg-[#101418] p-8 text-[#F3F4F6] shadow-2xl">
          <div className="flex flex-col items-center justify-center py-20 text-[#6B7280]">
            <Loader2 className="h-8 w-8 animate-spin text-[#5BE584]" />
            <p className="mt-4 text-sm font-medium">
              Loading exercise details...
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!exercise) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] w-[95vw] max-w-none sm:max-w-4xl md:max-w-5xl lg:max-w-6xl overflow-y-auto rounded-xl border border-[#1E2329] bg-[#101418] p-6 shadow-2xl sm:p-8 text-[#F3F4F6] selection:bg-[#5BE584]/30">
        {/* Header */}
        <DialogHeader className="space-y-3 border-b border-[#1E2329] pb-6 text-left">
          <div className="flex items-center gap-2 text-[11px] font-medium tracking-wide text-[#6B7280] uppercase mb-1">
            <span>Exercises</span>
            <span>/</span>
            <span className="text-[#F3F4F6]">View Details</span>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <DialogTitle className="text-2xl md:text-3xl font-semibold tracking-tight text-white">
              {exercise.name}
            </DialogTitle>

            {exercise.videoUrl && (
              <a
                href={exercise.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-md bg-[#16291D] border border-[#23422E] px-4 py-2 text-sm font-semibold text-[#5BE584] transition-colors hover:bg-[#1f3827]"
              >
                <PlayCircle className="h-4 w-4" />
                <span>Watch Tutorial</span>
                <ExternalLink className="ml-1 h-3 w-3 opacity-70" />
              </a>
            )}
          </div>

          {exercise.description && (
            <DialogDescription className="max-w-3xl text-sm leading-relaxed text-[#9CA3AF]">
              {exercise.description}
            </DialogDescription>
          )}
        </DialogHeader>

        {/* Quick-Stats Grid */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <InfoCard icon={<Dumbbell className="h-4 w-4" />} title="Equipment">
            <div className="flex flex-wrap gap-1.5">
              {exercise.equipment?.length ? (
                exercise.equipment.map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center rounded bg-[#1E2329] px-2 py-0.5 text-xs text-[#D1D5DB]"
                  >
                    {item}
                  </span>
                ))
              ) : (
                <span className="text-xs text-[#9CA3AF]">Bodyweight</span>
              )}
            </div>
          </InfoCard>

          <InfoCard
            icon={<Flame className="h-4 w-4 text-orange-400" />}
            title="Difficulty"
          >
            <div>
              <span className="inline-flex items-center rounded bg-[#1E2329] px-2.5 py-0.5 text-xs font-medium text-[#F3F4F6] capitalize">
                {exercise.difficulty || "N/A"}
              </span>
            </div>
          </InfoCard>

          <InfoCard
            icon={<Target className="h-4 w-4 text-[#5BE584]" />}
            title="Primary Muscles"
          >
            <div className="flex flex-wrap gap-1.5">
              {exercise.primaryMuscles?.map((muscle) => (
                <span
                  key={muscle}
                  className="inline-flex items-center rounded bg-[#16291D] border border-[#23422E] px-2 py-0.5 text-xs text-[#5BE584] font-medium"
                >
                  {muscle}
                </span>
              ))}
            </div>
          </InfoCard>

          <InfoCard
            icon={<Layers className="h-4 w-4 text-blue-400" />}
            title="Secondary Muscles"
          >
            <div className="flex flex-wrap gap-1.5">
              {exercise.secondaryMuscles?.length ? (
                exercise.secondaryMuscles.map((muscle) => (
                  <span
                    key={muscle}
                    className="inline-flex items-center rounded bg-[#1E2329] px-2 py-0.5 text-xs text-[#9CA3AF]"
                  >
                    {muscle}
                  </span>
                ))
              ) : (
                <span className="text-xs text-[#6B7280]">None</span>
              )}
            </div>
          </InfoCard>
        </div>

        {/* Instructions Section */}
        {exercise.instructions?.length > 0 && (
          <div className="mt-8 rounded-xl border border-[#1E2329] bg-[#101418] p-6">
            <h3 className="mb-4 text-[11px] font-bold tracking-widest text-[#6B7280] uppercase">
              Instructions
            </h3>
            <ol className="space-y-3 pl-1">
              {exercise.instructions.map((step, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 text-sm leading-relaxed text-[#9CA3AF]"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-[#1E2329] font-mono text-xs text-[#5BE584]">
                    {(index + 1).toString().padStart(2, "0")}
                  </span>
                  <span className="pt-0.5 text-[#F3F4F6]">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Tips Section */}
        <div className="mt-6 rounded-xl border border-[#1E2329] bg-[#101418] p-6">
          <div className="mb-4 flex items-center gap-2 text-amber-400">
            <Lightbulb className="h-4 w-4 shrink-0 text-amber-400" />
            <h3 className="text-[11px] font-bold tracking-widest text-[#6B7280] uppercase">
              Pro Tips
            </h3>
          </div>

          {exercise.tips?.length ? (
            <ul className="space-y-2.5 pl-2">
              {exercise.tips.map((tip, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2.5 text-sm leading-relaxed text-[#9CA3AF]"
                >
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                  <span className="text-[#F3F4F6]">{tip}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs italic text-[#6B7280]">
              No specific tips listed for this exercise — focus on controlled
              form and steady breathing.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewExerciseDialog;
