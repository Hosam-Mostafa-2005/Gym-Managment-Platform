import React from "react";
import { Dumbbell, CheckCircle2, TrendingUp } from "lucide-react";
import type { WorkoutExerciseLog } from "../types/workout-session.types";

interface ExerciseProgressProps {
  exerciseLogs: WorkoutExerciseLog[];
}

export const ExerciseProgress: React.FC<ExerciseProgressProps> = ({
  exerciseLogs,
}) => {
  const totalExercises = exerciseLogs.length;
  const completedExercises = exerciseLogs.filter((e) => e.completed).length;

  let totalSets = 0;
  let completedSets = 0;
  let currentVolume = 0;

  for (const ex of exerciseLogs) {
    const setsByNum = new Map<number, boolean[]>();
    for (const s of ex.sets) {
      if (!setsByNum.has(s.setNumber)) {
        setsByNum.set(s.setNumber, []);
      }
      setsByNum.get(s.setNumber)!.push(s.completed);
      if (s.completed) {
        currentVolume += (s.weight || 0) * (s.actualReps || 0);
      }
    }

    const uniqueSetCount = setsByNum.size;
    totalSets += Math.max(uniqueSetCount, ex.targetSets || 0);

    for (const stageStates of setsByNum.values()) {
      if (stageStates.length > 0 && stageStates.every((c) => c === true)) {
        completedSets += 1;
      }
    }
  }

  const exercisePercentage =
    totalExercises > 0
      ? Math.round((completedExercises / totalExercises) * 100)
      : 0;

  const setPercentage =
    totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;

  return (
    <div className="rounded-2xl border border-[#1E2329] bg-[#101418] p-4 lg:p-5 backdrop-blur-sm">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
        {/* Movements Progress */}
        <div className="flex flex-col">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF] flex items-center gap-1.5">
            <CheckCircle2 className="h-3 w-3 text-[#5BE584]" />
            Movements Done
          </span>
          <span className="text-lg font-bold text-white font-mono mt-0.5">
            {completedExercises} <span className="text-xs text-[#9CA3AF] font-normal">/ {totalExercises}</span>
          </span>
        </div>

        {/* Sets Completed */}
        <div className="flex flex-col">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF] flex items-center gap-1.5">
            <Dumbbell className="h-3 w-3 text-[#5BE584]" />
            Sets Logged
          </span>
          <span className="text-lg font-bold text-white font-mono mt-0.5">
            {completedSets} <span className="text-xs text-[#9CA3AF] font-normal">/ {totalSets}</span>
          </span>
        </div>

        {/* Total Volume */}
        <div className="flex flex-col">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF] flex items-center gap-1.5">
            <TrendingUp className="h-3 w-3 text-[#5BE584]" />
            Volume Lifted
          </span>
          <span className="text-lg font-bold text-white font-mono mt-0.5">
            {currentVolume.toLocaleString()} <span className="text-xs text-[#9CA3AF] font-normal">kg</span>
          </span>
        </div>

        {/* Session Completion */}
        <div className="flex flex-col">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
            Session Progress
          </span>
          <span className="text-lg font-bold text-[#5BE584] font-mono mt-0.5">
            {setPercentage}%
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-[#1E2329] rounded-full h-2 overflow-hidden">
        <div
          className="bg-gradient-to-r from-[#5BE584] to-[#4ade80] h-full transition-all duration-500 ease-out rounded-full"
          style={{ width: `${setPercentage}%` }}
        />
      </div>
    </div>
  );
};

export default ExerciseProgress;
