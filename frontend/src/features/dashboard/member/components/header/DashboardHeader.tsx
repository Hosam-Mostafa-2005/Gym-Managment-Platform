// src/features/dashboard/member/components/header/DashboardHeader.tsx
import React, { useState } from "react";
import { Activity, Dumbbell, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCurrentWorkoutSession } from "@/features/workout-sessions/hooks/useCurrentWorkoutSession";
import StartWorkoutDialog from "@/features/workout-sessions/components/StartWorkoutDialog";

export const DashboardHeader: React.FC = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: currentSessionData } = useCurrentWorkoutSession();

  const hasActiveSession = Boolean(
    currentSessionData?.session &&
      currentSessionData.session.status === "IN_PROGRESS",
  );

  return (
    <>
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#1E2329]/50">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-[#5BE584]" />
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Dashboard
            </h1>
          </div>
          <p className="text-sm text-gray-400">
            Track your training, progress, and performance telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {hasActiveSession ? (
            <button
              type="button"
              onClick={() => navigate("/sessions/active")}
              className="inline-flex items-center gap-2 rounded-xl bg-[#5BE584] px-4 py-2 text-xs font-bold text-[#090B0F] transition-all hover:bg-[#4ade80] shadow-md shadow-[#5BE584]/10"
            >
              <Activity className="h-3.5 w-3.5 animate-pulse" />
              <span>Resume Active Workout</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-[#5BE584] px-4 py-2 text-xs font-bold text-[#090B0F] transition-all hover:bg-[#4ade80] shadow-md shadow-[#5BE584]/10"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>Start Workout</span>
            </button>
          )}
        </div>
      </header>

      {/* Start Workout Selection Modal */}
      <StartWorkoutDialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};
