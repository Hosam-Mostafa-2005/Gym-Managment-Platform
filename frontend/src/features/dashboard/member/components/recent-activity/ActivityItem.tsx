// src/features/dashboard/member/components/recent-activity/ActivityItem.tsx
import React from "react";
import { ClipboardList, CheckCircle2, Info } from "lucide-react";

interface ActivityItemProps {
  activity: any;
}

export const ActivityItem: React.FC<ActivityItemProps> = ({ activity }) => {
  const getIcon = () => {
    switch (activity.type) {
      case "ASSIGNMENT_RECEIVED":
        return <ClipboardList className="h-4 w-4 text-blue-400" />;
      case "SESSION_COMPLETED":
        return <CheckCircle2 className="h-4 w-4 text-[#5BE584]" />;
      default:
        return <Info className="h-4 w-4 text-gray-400" />;
    }
  };

  const formattedDate = new Date(activity.date).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <div className="flex gap-4">
      <div className="relative flex flex-col items-center">
        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#1E2329] bg-[#090B0F]">
          {getIcon()}
        </div>
        <div className="mt-2 w-px flex-1 bg-[#1E2329]" />
      </div>
      <div className="flex flex-col pb-6 pt-1">
        <p className="text-sm font-medium text-gray-200">{activity.message}</p>
        <span className="mt-1 text-xs text-gray-500">{formattedDate}</span>
      </div>
    </div>
  );
};
