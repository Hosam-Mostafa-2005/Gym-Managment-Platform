// src/features/dashboard/member/components/recent-activity/RecentActivity.tsx
import React from "react";
import { History } from "lucide-react";
import { ActivityItem } from "./ActivityItem";

interface RecentActivityProps {
  activities?: any[];
}

export const RecentActivity: React.FC<RecentActivityProps> = ({
  activities = [],
}) => {
  if (activities.length === 0) return null;

  return (
    <div className="flex flex-col rounded-xl border border-[#1E2329] bg-[#0D1117] p-6">
      <div className="mb-6 flex items-center gap-2">
        <History className="h-5 w-5 text-gray-400" />
        <h2 className="text-sm font-semibold text-white">Recent Activity</h2>
      </div>
      <div className="flex flex-col">
        {activities.map((activity, index) => (
          <ActivityItem key={activity.id || index} activity={activity} />
        ))}
      </div>
    </div>
  );
};
