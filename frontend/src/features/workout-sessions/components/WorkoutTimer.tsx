import React, { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import {
  formatTimer,
  calculateElapsedSeconds,
} from "../utils/session.utils";

interface WorkoutTimerProps {
  startedAt: string;
}

export const WorkoutTimer: React.FC<WorkoutTimerProps> = ({ startedAt }) => {
  const [elapsed, setElapsed] = useState(() =>
    calculateElapsedSeconds(startedAt),
  );

  useEffect(() => {
    // Initial sync
    setElapsed(calculateElapsedSeconds(startedAt));

    const interval = setInterval(() => {
      setElapsed(calculateElapsedSeconds(startedAt));
    }, 1000);

    return () => clearInterval(interval);
  }, [startedAt]);

  return (
    <div className="inline-flex items-center gap-2 rounded-xl border border-[#1E2329] bg-[#101418] px-3.5 py-2 backdrop-blur-sm shadow-sm">
      <div className="relative flex items-center justify-center">
        <Clock className="h-4 w-4 text-[#5BE584]" />
        <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#5BE584] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#5BE584]"></span>
        </span>
      </div>
      <div className="flex flex-col">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
          Elapsed Time
        </span>
        <span className="font-mono text-sm font-bold text-white tracking-wider">
          {formatTimer(elapsed)}
        </span>
      </div>
    </div>
  );
};

export default WorkoutTimer;
