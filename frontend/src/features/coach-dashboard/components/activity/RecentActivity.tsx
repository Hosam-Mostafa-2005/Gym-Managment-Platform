// src/features/coach-dashboard/components/activity/RecentActivity.tsx
import React from "react";
import { Link } from "react-router-dom";
import { Activity as ActivityIcon, CheckCircle2, Clock } from "lucide-react";
import type { DashboardActivity } from "@/features/coach-dashboard/types/coach-dashboard.types";

interface RecentActivityProps {
  activities?: DashboardActivity[];
}

export const RecentActivity: React.FC<RecentActivityProps> = ({
  activities = [],
}) => {
  const hasActivities = activities && activities.length > 0;

  const formatTimestamp = (dateValue: string | Date | null) => {
    if (!dateValue) return "Just now";
    try {
      const date = new Date(dateValue);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? "s" : ""} ago`;
      if (diffHours < 24)
        return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
      return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    } catch {
      return "Recently";
    }
  };

  return (
    <div className="flex flex-col rounded-lg border border-[#1e2329] bg-[#0d1014] overflow-hidden">
      {/* Section Header */}
      <div className="flex items-center justify-between border-b border-[#1e2329] px-5 py-4">
        <div className="flex items-center gap-2.5">
          <ActivityIcon className="h-4 w-4 text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-100">
            Live Operational Gym Feed
          </h2>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-medium text-gray-500 uppercase tracking-wider">
          <span className="h-1.5 w-1.5 rounded-full bg-[#5BE584] animate-pulse" />
          Feed Latency: 14ms • Refresh
        </div>
      </div>

      {/* Activity Feed List */}
      {hasActivities ? (
        <div className="divide-y divide-[#1e2329]">
          {activities.map((item, index) => {
            const memberId = item.member?.id;
            const memberName = item.member?.name || "System / Coach";
            const workoutTitle =
              item.metadata?.workoutTitle || item.action || "Activity logged";
            const timeAgo = formatTimestamp(item.date);

            return (
              <div
                key={item.id || index}
                className="flex items-start justify-between gap-4 px-5 py-3.5 transition-colors hover:bg-white/[0.02]"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#16291d] border border-[#23422e] text-[#5BE584]">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <div className="text-xs text-gray-300">
                      {memberId ? (
                        <Link
                          to={`/members/${memberId}`}
                          className="font-semibold text-gray-200 hover:text-[#5BE584] transition-colors mr-1.5"
                        >
                          {memberName}
                        </Link>
                      ) : (
                        <span className="font-semibold text-gray-200 mr-1.5">
                          {memberName}
                        </span>
                      )}
                      <span className="text-gray-400">completed</span>
                      <span className="font-medium text-gray-200 ml-1.5">
                        {workoutTitle}
                      </span>
                    </div>

                    {item.metadata && Object.keys(item.metadata).length > 0 && (
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-500 mt-1">
                        {item.metadata.duration && (
                          <span>
                            Duration:{" "}
                            <strong className="text-gray-400 font-mono">
                              {item.metadata.duration}m
                            </strong>
                          </span>
                        )}
                        {item.metadata.volume && (
                          <span>
                            Volume:{" "}
                            <strong className="text-gray-400 font-mono">
                              {item.metadata.volume}kg
                            </strong>
                          </span>
                        )}
                        {item.metadata.weight !== undefined && (
                          <span>
                            Weight:{" "}
                            <strong className="text-gray-400 font-mono">
                              {item.metadata.weight}kg
                            </strong>
                          </span>
                        )}
                        {item.metadata.bodyFat !== undefined && (
                          <span>
                            Body Fat:{" "}
                            <strong className="text-gray-400 font-mono">
                              {item.metadata.bodyFat}%
                            </strong>
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] font-medium text-gray-500 whitespace-nowrap shrink-0">
                  <Clock className="h-3 w-3 text-gray-600" />
                  <span>{timeAgo}</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#16291d] border border-[#23422e] mb-3">
            <ActivityIcon className="h-5 w-5 text-[#5BE584]" />
          </div>
          <p className="text-sm font-semibold text-gray-200">
            No recent operational activity
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            Real-time session updates will stream here as athletes train.
          </p>
        </div>
      )}
    </div>
  );
};
