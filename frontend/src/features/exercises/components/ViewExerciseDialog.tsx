import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useExercise } from "../hooks/useExercises";
import {
  Dumbbell,
  Target,
  Layers,
  Flame,
  Lightbulb,
  PlayCircle,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ViewExerciseDialogProps {
  exerciseId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Local helper to keep cards DRY and consistent
interface InfoCardProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  className?: string;
}

const InfoCard = ({ icon, title, children, className }: InfoCardProps) => (
  <div
    className={cn(
      "flex flex-col justify-between rounded-2xl border border-border bg-card/40 p-5 transition-all duration-200 hover:border-primary/40 hover:bg-card hover:shadow-sm",
      className,
    )}
  >
    <div>
      <div className="mb-3 flex items-center gap-2 text-primary">
        {icon}
        <h3 className="font-semibold tracking-tight text-foreground">
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

  // 1. Polished Skeleton Loading State
  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90vh] w-[95vw] max-w-5xl overflow-hidden rounded-3xl border border-border p-8">
          <div className="animate-pulse space-y-6">
            <div className="space-y-3 border-b border-border pb-6">
              <div className="h-8 w-1/3 rounded-lg bg-muted"></div>
              <div className="h-4 w-3/4 rounded bg-muted"></div>
              <div className="h-4 w-1/2 rounded bg-muted"></div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-28 rounded-2xl bg-muted/60"></div>
              ))}
            </div>
            <div className="h-40 rounded-2xl bg-muted/60"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!exercise) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] w-[95vw] max-w-none sm:max-w-4xl md:max-w-5xl lg:max-w-6xl overflow-y-auto rounded-3xl border border-border p-6 shadow-2xl sm:p-8">
        <DialogHeader className="space-y-3 border-b border-border/80 pb-6 text-left">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <DialogTitle className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              {exercise.name}
            </DialogTitle>

            {/* CTA moved to top right for immediate visibility, falls back to bottom on mobile */}
            {exercise.videoUrl && (
              <Button variant="default" className="w-full shrink-0 sm:w-auto">
                <a
                  href={exercise.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 font-medium"
                >
                  <PlayCircle className="h-4 w-4" />
                  <span>Watch Tutorial</span>
                  <ExternalLink className="ml-1 h-3 w-3 opacity-70" />
                </a>
              </Button>
            )}
          </div>

          {exercise.description && (
            <DialogDescription className="max-w-3xl text-base leading-relaxed text-muted-foreground">
              {exercise.description}
            </DialogDescription>
          )}
        </DialogHeader>

        {/* 2. Responsive Quick-Stats Grid */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <InfoCard icon={<Dumbbell className="h-5 w-5" />} title="Equipment">
            <div className="flex flex-wrap gap-1.5">
              {exercise.equipment?.length ? (
                exercise.equipment.map((item) => (
                  <Badge key={item} variant="secondary" className="font-normal">
                    {item}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">
                  Bodyweight
                </span>
              )}
            </div>
          </InfoCard>

          <InfoCard
            icon={<Flame className="h-5 w-5 text-orange-500" />}
            title="Difficulty"
          >
            <Badge
              variant={
                exercise.difficulty?.toLowerCase() === "hard"
                  ? "destructive"
                  : "outline"
              }
              className="capitalize font-medium"
            >
              {exercise.difficulty || "N/A"}
            </Badge>
          </InfoCard>

          <InfoCard
            icon={<Target className="h-5 w-5 text-emerald-500" />}
            title="Primary"
          >
            <div className="flex flex-wrap gap-1.5">
              {exercise.primaryMuscles?.map((muscle) => (
                <Badge
                  key={muscle}
                  variant="default"
                  className="bg-primary/10 text-primary hover:bg-primary/20 border-0 font-medium"
                >
                  {muscle}
                </Badge>
              ))}
            </div>
          </InfoCard>

          <InfoCard
            icon={<Layers className="h-5 w-5 text-blue-500" />}
            title="Secondary"
          >
            <div className="flex flex-wrap gap-1.5">
              {exercise.secondaryMuscles?.length ? (
                exercise.secondaryMuscles.map((muscle) => (
                  <Badge
                    key={muscle}
                    variant="outline"
                    className="text-muted-foreground font-normal"
                  >
                    {muscle}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">None</span>
              )}
            </div>
          </InfoCard>
        </div>

        {/* 3. Instructions Section with custom step numbering */}
        {exercise.instructions?.length > 0 && (
          <div className="mt-6 rounded-2xl border border-border bg-card/40 p-6 transition-all hover:border-primary/30 hover:bg-card">
            <h3 className="mb-4 text-lg font-semibold tracking-tight">
              Instructions
            </h3>
            <ol className="space-y-3 pl-1">
              {exercise.instructions.map((step, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 text-sm leading-relaxed text-muted-foreground sm:text-base"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {index + 1}
                  </span>
                  <span className="pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* 4. Tips Section with highlighted styling */}
        <div className="mt-6 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6 transition-all hover:border-amber-500/30 dark:bg-amber-500/10">
          <div className="mb-3 flex items-center gap-2 text-amber-600 dark:text-amber-400">
            <Lightbulb className="h-5 w-5 shrink-0 text-amber-500" />
            <h3 className="text-lg font-semibold tracking-tight text-foreground">
              Pro Tips
            </h3>
          </div>

          {exercise.tips?.length ? (
            <ul className="space-y-2 pl-2">
              {exercise.tips.map((tip, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2.5 text-sm leading-relaxed text-muted-foreground sm:text-base"
                >
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm italic text-muted-foreground">
              No specific tips listed for this exercise — focus on controlled
              form and steady breathing!
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewExerciseDialog;
