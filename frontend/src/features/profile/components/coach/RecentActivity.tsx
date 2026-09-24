// src/features/profile/components/coach/RecentActivity.tsx
import React from "react";
import { Link } from "react-router-dom";
import { Activity, Clock } from "lucide-react";
import { ProfileSection } from "../shared/ProfileSection";
import type { CoachActivity } from "../../types/profile.types";

interface RecentActivityProps {
  recentActivity: CoachActivity[];
}

export const RecentActivity: React.FC<RecentActivityProps> = ({
  recentActivity = [],
}) => {
  return (
    <ProfileSection title="Live Activity Feed" icon={Activity}>
      {recentActivity?.length > 0 ? (
        <div className="divide-y divide-[#1e2329]">
          {recentActivity.map((item, idx) => {
            const memberId = item.member?.id;
            const memberName = item.member?.name || "System Athlete";
            return (
              <div
                key={idx}
                className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0 hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-semibold text-gray-200">
                    {item.action}
                  </span>
                  <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                    <span>Athlete:</span>
                    {memberId ? (
                      <Link
                        to={`/members/${memberId}`}
                        className="text-gray-300 hover:text-[#5BE584] transition-colors font-medium"
                      >
                        {memberName}
                      </Link>
                    ) : (
                      <span className="text-gray-400">{memberName}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-gray-500 whitespace-nowrap">
                  <Clock className="h-3 w-3 text-gray-600" />
                  <span>{new Date(item.date).toLocaleDateString()}</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-8 text-center text-xs text-gray-500">
          No recent coach activity recorded.
        </div>
      )}
    </ProfileSection>
  );
};
