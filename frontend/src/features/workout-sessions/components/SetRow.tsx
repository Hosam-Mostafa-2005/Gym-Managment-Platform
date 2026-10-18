import { useState } from "react";
import { Check } from "lucide-react";
import type { WorkoutSetLog } from "../types/workout-session.types";
import { useUpdateWorkoutSet } from "../hooks/useUpdateWorkoutSet";

interface SetRowProps {
  set: WorkoutSetLog;
}

export default function SetRow({ set }: SetRowProps) {
  const [weight, setWeight] = useState(set.weight);
  const [reps, setReps] = useState(set.actualReps);

  const isCompleted = set.completed;
  const { mutate: updateSet, isPending } = useUpdateWorkoutSet();

  const handleComplete = () => {
    updateSet({
      id: set.id,
      payload: {
        weight,
        actualReps: reps,
      },
    });
  };

  return (
    <div
      className={`grid grid-cols-12 gap-2 sm:gap-4 px-3 sm:px-4 py-3 items-center rounded-xl border transition-colors ${
        isCompleted
          ? "bg-[#5BE584]/5 border-[#5BE584]/20"
          : "bg-[#090B0F]/50 border-white/5 hover:border-white/10"
      }`}
    >
      <div
        className={`col-span-2 font-semibold ${
          isCompleted ? "text-[#5BE584]" : "text-white"
        }`}
      >
        {set.setNumber}
      </div>

      <div className="col-span-2 text-[#9CA3AF] text-sm font-medium">
        {set.targetReps}
      </div>

      <div className="col-span-3">
        <input
          type="number"
          value={weight}
          onChange={(e) => setWeight(Number(e.target.value))}
          placeholder="0"
          disabled={isCompleted}
          className="w-full min-w-0 bg-[#090B0F] border border-white/10 rounded-[12px] py-2 px-2 sm:px-3 text-center text-sm text-white focus:outline-none focus:border-[#5BE584] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        />
      </div>

      <div className="col-span-5 flex gap-2 items-center">
        <input
          type="number"
          value={reps}
          onChange={(e) => setReps(Number(e.target.value))}
          placeholder="0"
          disabled={isCompleted}
          className="w-full min-w-0 bg-[#090B0F] border border-white/10 rounded-[12px] py-2 px-2 sm:px-3 text-center text-sm text-white focus:outline-none focus:border-[#5BE584] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        />
        <button
          onClick={handleComplete}
          disabled={isCompleted || isPending}
          aria-label={`Complete set ${set.setNumber}`}
          className={`w-10 h-10 flex items-center justify-center rounded-[12px] transition-all shrink-0 cursor-pointer ${
            isCompleted
              ? "bg-[#5BE584] text-black opacity-50 cursor-not-allowed"
              : "bg-white/5 text-[#9CA3AF] hover:bg-[#5BE584] hover:text-black border border-white/5 hover:border-[#5BE584]"
          }`}
        >
          {isPending ? (
            <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <Check size={18} strokeWidth={2.5} />
          )}
        </button>
      </div>
    </div>
  );
}
