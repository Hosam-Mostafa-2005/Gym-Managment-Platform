// src/features/profile/components/member/MemberTimeline.tsx
import React from "react";
import {
  History,
  CheckCircle2,
  Dumbbell,
  Ruler,
  ClipboardList,
} from "lucide-react";
import { ProfileSection } from "../shared/ProfileSection";
import type { TimelineEvent } from "../../types/profile.types";

interface MemberTimelineProps {
  timeline: TimelineEvent[];
}

export const MemberTimeline: React.FC<MemberTimelineProps> = ({
  timeline = [],
}) => {
  const getEventIcon = (type: string) => {
    const t = type?.toLowerCase() || "";
    if (t.includes("workout") || t.includes("session")) return Dumbbell;
    if (t.includes("measurement") || t.includes("biometric")) return Ruler;
    if (t.includes("assignment")) return ClipboardList;
    return CheckCircle2;
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "N/A";
    try {
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(dateStr));
    } catch {
      return dateStr;
    }
  };

  return (
    <ProfileSection
      title="Account & Training Timeline"
      subtitle="Chronological milestones and activities"
      icon={History}
    >
      {timeline?.length > 0 ? (
        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-px before:bg-[#1e2329]">
          {timeline.map((event, idx) => {
            const Icon = getEventIcon(event.type);
            return (
              <div key={idx} className="relative flex flex-col gap-1">
                <div className="absolute -left-6 mt-0.5 h-5 w-5 rounded-full bg-[#16291d] border border-[#23422e] flex items-center justify-center text-[#5BE584]">
                  <Icon className="h-3 w-3" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-200">
                    {event.title}
                  </span>
                  <span className="text-[10px] text-gray-500 font-mono">
                    {formatDate(event.date)}
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  {event.description}
                </p>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-8 text-center text-xs text-gray-500">
          No timeline events recorded yet.
        </div>
      )}
    </ProfileSection>
  );
};
