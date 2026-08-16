import React from "react";
import {
  Target,
  Calendar,
  Clock,
  ClipboardList,
  ArrowUpRight,
} from "lucide-react";
import type { NavigateFunction } from "react-router-dom";
import type { Assignment } from "@/features/assignments/types/assignment.types";

interface CurrentAssignmentCardProps {
  assignment: Assignment | null | undefined;
  navigate: NavigateFunction;
}

export const CurrentAssignmentCard = ({
  assignment,
  navigate,
}: CurrentAssignmentCardProps) => {
  return (
    <div className="bg-[#11151B] border border-white/5 rounded-2xl p-6 transition-all duration-300 hover:border-[#5BE584]/20 hover:-translate-y-1 flex flex-col justify-between h-full min-h-[280px]">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-[#5BE584]" />
            <h2 className="text-lg font-semibold text-white">
              Current Assignment
            </h2>
          </div>
          {assignment && (
            <span className="text-xs font-bold uppercase tracking-wider bg-[#5BE584]/10 text-[#5BE584] px-3 py-1 rounded-full">
              {assignment.status}
            </span>
          )}
        </div>

        {assignment ? (
          <div className="space-y-4 mt-6">
            <div>
              <h3 className="text-2xl font-bold text-white mb-1">
                {assignment.workout?.title || "Custom Workout"}
              </h3>
              <p className="text-zinc-400 text-sm">
                Trainer:{" "}
                <span className="text-zinc-200">
                  {assignment.trainer?.name}
                </span>
              </p>
            </div>
            <div className="flex flex-col gap-2 text-sm text-zinc-500">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>
                  Start: {new Date(assignment.startDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>
                  End: {new Date(assignment.endDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-40 text-center">
            <ClipboardList className="w-10 h-10 text-zinc-700 mb-3" />
            <p className="text-zinc-400">No active assignment right now.</p>
          </div>
        )}
      </div>

      {assignment && (
        <button
          onClick={() => navigate(`/assignments/${assignment.id}`)}
          className="mt-8 w-full flex items-center justify-between bg-white/5 border border-white/10 text-white px-5 py-3.5 rounded-xl font-medium hover:bg-white/10 transition-colors"
        >
          <span>Open Assignment</span>
          <ArrowUpRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
