// src/features/coach-dashboard/components/quick-actions/QuickActions.tsx
import React from "react";
import { Zap, Users, Ruler, ClipboardList } from "lucide-react";
import { QuickActionItem } from "./QuickActionItem";
import type { QuickActions as QuickActionsType } from "@/features/coach-dashboard/types/coach-dashboard.types";

interface QuickActionsProps {
  quickActions: QuickActionsType;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ quickActions }) => {
  const inactiveCount = quickActions?.inactiveMembers ?? 0;
  const overdueCount = quickActions?.overdueMeasurements ?? 0;
  const endingSoonCount = quickActions?.assignmentsEndingSoon ?? 0;

  const hasAnyAction =
    inactiveCount > 0 || overdueCount > 0 || endingSoonCount > 0;

  return (
    <div className="flex flex-col rounded-lg border border-[#1e2329] bg-[#0d1014] overflow-hidden">
      {/* Section Header */}
      <div className="flex items-center gap-2.5 border-b border-[#1e2329] px-5 py-4">
        <Zap className="h-4 w-4 text-gray-400" />
        <h2 className="text-sm font-semibold text-gray-100">Quick Actions</h2>
      </div>

      {/* Action Items List */}
      <div className="flex flex-col gap-3 p-4">
        <QuickActionItem
          title="Inactive Members"
          description="Review athletes lacking recent session logs"
          count={inactiveCount}
          icon={Users}
          to="/members"
        />

        <QuickActionItem
          title="Overdue Measurements"
          description="Check biometrics pending update"
          count={overdueCount}
          icon={Ruler}
          to="/members"
        />

        <QuickActionItem
          title="Assignments Ending Soon"
          description="Plan upcoming routine renewals"
          count={endingSoonCount}
          icon={ClipboardList}
          to="/assignments"
        />
      </div>

      {!hasAnyAction && (
        <div className="px-4 pb-4 text-center">
          <span className="text-[11px] text-gray-500 font-medium">
            All operational workflows are up to date.
          </span>
        </div>
      )}
    </div>
  );
};
