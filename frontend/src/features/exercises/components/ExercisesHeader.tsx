import { Dumbbell, Plus, Sparkles } from "lucide-react";

interface ExercisesHeaderProps {
  onAddExercise: () => void;
  totalExercises?: number;
  customCount?: number;
}

export default function ExercisesHeader({
  onAddExercise,
  totalExercises,
  customCount = 0,
}: ExercisesHeaderProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#1E2329] bg-gradient-to-br from-[#12171F] via-[#101418] to-[#0B0E12] p-6 sm:p-7 shadow-xl">
      {/* Subtle ambient glow */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[#5BE584]/10 blur-3xl" />

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#5BE584]/25 bg-[#5BE584]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#5BE584]">
            <Dumbbell className="h-3.5 w-3.5" />
            <span>STREN Movement Atlas</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Exercise Library
            </h1>

            {typeof totalExercises === "number" && (
              <span className="inline-flex items-center rounded-lg border border-[#262D36] bg-[#141920] px-2.5 py-1 text-xs font-mono font-bold text-[#5BE584]">
                {totalExercises} Movements
              </span>
            )}

            {customCount > 0 && (
              <span className="inline-flex items-center gap-1 rounded-lg border border-[#5BE584]/30 bg-[#5BE584]/10 px-2.5 py-1 text-xs font-semibold text-[#5BE584]">
                <Sparkles className="h-3 w-3" />
                {customCount} Custom
              </span>
            )}
          </div>

          <p className="max-w-2xl text-xs sm:text-sm leading-relaxed text-[#9CA3AF]">
            Explore verified biomechanical demonstrations, target muscle
            classifications, equipment requirements, and execution cues across
            the entire training catalog.
          </p>
        </div>

        <button
          type="button"
          onClick={onAddExercise}
          className="inline-flex items-center justify-center gap-2 self-start sm:self-center shrink-0 rounded-xl bg-[#5BE584] px-5 py-3 text-xs sm:text-sm font-bold text-[#090B0F] shadow-[0_0_24px_rgba(91,229,132,0.22)] transition-all hover:bg-[#49D472] hover:shadow-[0_0_30px_rgba(91,229,132,0.35)] active:scale-[0.99]"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          <span>New Exercise</span>
        </button>
      </div>
    </div>
  );
}
