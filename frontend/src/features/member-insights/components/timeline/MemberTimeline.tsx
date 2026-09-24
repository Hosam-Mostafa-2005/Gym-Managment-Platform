// src/features/member-insights/components/timeline/MemberTimeline.tsx

import React from "react";
import {
  Dumbbell,
  CheckCircle2,
  XCircle,
  PlayCircle,
  CircleCheck,
  Scale,
  Activity,
} from "lucide-react";
import type { TimelineEvent } from "../../types/member-insights.types";

interface MemberTimelineProps {
  timeline: TimelineEvent[];
}

export const MemberTimeline: React.FC<MemberTimelineProps> = ({ timeline }) => {
  const getEventIcon = (type: string) => {
    switch (type.toUpperCase()) {
      case "WORKOUT_ASSIGNED":
        return <Dumbbell className="h-4 w-4" />;
      case "ASSIGNMENT_COMPLETED":
        return <CheckCircle2 className="h-4 w-4" />;
      case "ASSIGNMENT_CANCELLED":
        return <XCircle className="h-4 w-4" />;
      case "WORKOUT_STARTED":
        return <PlayCircle className="h-4 w-4" />;
      case "WORKOUT_COMPLETED":
        return <CircleCheck className="h-4 w-4" />;
      case "BODY_MEASUREMENT_RECORDED":
        return <Scale className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type.toUpperCase()) {
      case "WORKOUT_ASSIGNED":
        return "text-blue-400 bg-blue-500/10 border-blue-500/20";
      case "ASSIGNMENT_COMPLETED":
      case "WORKOUT_COMPLETED":
        return "text-green-400 bg-green-500/10 border-green-500/20";
      case "ASSIGNMENT_CANCELLED":
        return "text-red-400 bg-red-500/10 border-red-500/20";
      default:
        return "text-gray-300 bg-[#1E2329] border-[#2A313A]";
    }
  };

  const formatDateTime = (dateStr: string) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateStr));
  };

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-[#1E2329] bg-[#0D1014] p-6">
      <h2 className="text-lg font-semibold text-gray-100 mb-2">
        Activity Timeline
      </h2>
      {timeline.length === 0 ? (
        <p className="text-center text-sm text-gray-500 py-4">
          No recent activity.
        </p>
      ) : (
        <div className="relative border-l border-[#1E2329] ml-4 mt-2">
          {timeline.map((event, index) => (
            <div key={index} className="mb-8 last:mb-0 relative pl-8">
              <div
                className={`absolute -left-[18px] top-1 flex h-9 w-9 items-center justify-center rounded-full border ${getEventColor(event.type)}`}
              >
                {getEventIcon(event.type)}
              </div>
              <div className="flex flex-col">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-gray-100">
                    {event.title}
                  </h4>
                  <span className="text-[11px] font-medium text-gray-500">
                    {formatDateTime(event.date)}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-400 max-w-3xl">
                  {event.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
