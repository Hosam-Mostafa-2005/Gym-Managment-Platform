import { useState } from "react";
import { Check } from "lucide-react";
import type { WorkoutSetLog } from "../types/workout-session.types";

interface SetRowProps {
  set: WorkoutSetLog;
}

export default function SetRow({ set }: SetRowProps) {
  const [weight, setWeight] = useState<number | string>(set.weight ?? "");
  const [reps, setReps] = useState<number | string>(set.actualReps ?? "");

  const isCompleted = set.completed;

  return (
    <div
      className={`grid grid-cols-4 gap-4 px-4 py-3 items-center rounded-xl border transition-colors ${
        isCompleted
          ? "bg-[#5BE584]/5 border-[#5BE584]/20"
          : "bg-[#090B0F]/50 border-white/5 hover:border-white/10"
      }`}
    >
      <div
        className={`font-semibold ${
          isCompleted ? "text-[#5BE584]" : "text-white"
        }`}
      >
        {set.setNumber}
      </div>

      <div className="text-[#9CA3AF] text-sm font-medium">{set.targetReps}</div>

      <div>
        <input
          type="number"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          placeholder="0"
          disabled={isCompleted}
          className="w-full bg-[#090B0F] border border-white/10 rounded-lg py-2.5 px-3 text-center text-white focus:outline-none focus:border-[#5BE584] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        />
      </div>

      <div className="flex gap-2 items-center">
        <input
          type="number"
          value={reps}
          onChange={(e) => setReps(e.target.value)}
          placeholder="0"
          disabled={isCompleted}
          className="w-full bg-[#090B0F] border border-white/10 rounded-lg py-2.5 px-3 text-center text-white focus:outline-none focus:border-[#5BE584] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        />
        <button
          disabled={isCompleted}
          className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all flex-shrink-0 cursor-pointer ${
            isCompleted
              ? "bg-[#5BE584] text-black opacity-50 cursor-not-allowed"
              : "bg-white/5 text-[#9CA3AF] hover:bg-[#5BE584] hover:text-black border border-white/5 hover:border-[#5BE584]"
          }`}
        >
          <Check size={18} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
