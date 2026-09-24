// src/features/profile/components/coach/UpcomingTasks.tsx
import React from "react";
import { Link } from "react-router-dom";
import { ClipboardList, Calendar } from "lucide-react";
import { ProfileSection } from "../shared/ProfileSection";
import type { CoachTask } from "../../types/profile.types";

interface UpcomingTasksProps {
  upcomingTasks: CoachTask[];
}

export const UpcomingTasks: React.FC<UpcomingTasksProps> = ({
  upcomingTasks = [],
}) => {
  return (
    <ProfileSection
      title="Upcoming Tasks & Roster Actions"
      icon={ClipboardList}
    >
      {upcomingTasks?.length > 0 ? (
        <div className="flex flex-col gap-4">
          {upcomingTasks.map((task, idx) => {
            const memberId = task.member?.id;
            const memberName = task.member?.name;
            return (
              <div
                key={idx}
                className="flex flex-col justify-between p-4 rounded-lg border border-[#1e2329] bg-[#13171d]"
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex rounded border border-[#5BE584]/20 bg-[#5BE584]/10 px-2 py-0.5 text-[9px] font-bold text-[#5BE584] uppercase tracking-wider">
                      {task.priority} Priority
                    </span>
                    {task.dueDate && (
                      <span className="flex items-center gap-1 text-[10px] text-gray-500 font-mono">
                        <Calendar className="h-3 w-3" />
                        {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <h3 className="text-xs font-semibold text-gray-200">
                    {task.title}
                  </h3>
                  <p className="text-[11px] text-gray-400 leading-relaxed line-clamp-2">
                    {task.description}
                  </p>
                </div>
                <div className="mt-3 pt-2.5 border-t border-[#1e2329] flex items-center justify-between text-xs">
                  {memberName && memberId ? (
                    <Link
                      to={`/members/${memberId}`}
                      className="text-gray-300 hover:text-[#5BE584] font-medium truncate"
                    >
                      Athlete: {memberName}
                    </Link>
                  ) : (
                    <span className="text-gray-500">General Task</span>
                  )}
                  <span className="text-[10px] text-[#5BE584] uppercase tracking-wider font-semibold">
                    Review
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-8 text-center text-xs text-gray-500">
          No pending coach tasks or upcoming actions.
        </div>
      )}
    </ProfileSection>
  );
};
