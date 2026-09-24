// src/features/members-management/components/MemberCard.tsx
import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Dumbbell } from "lucide-react";
import type { MemberManagementCard } from "../../members-management/types/members-management.types";

interface MemberCardProps {
  data: MemberManagementCard;
}

export const MemberCard: React.FC<MemberCardProps> = ({ data }) => {
  const { member, assignment, workout, measurements } = data;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "No record";
    try {
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(new Date(dateString));
    } catch {
      return "Invalid Date";
    }
  };

  const completionRate = workout?.completionRate ?? 0;
  // SVG Circle calculation
  const radius = 14;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (completionRate / 100) * circumference;

  return (
    <div className="flex flex-col rounded-lg border border-[#1e2329] bg-[#0d1014] transition-all hover:border-[#2a313a] hover:bg-[#101318]">
      {/* Header */}
      <div className="flex items-start justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#23422e] bg-[#16291d] text-sm font-bold tracking-wider text-[#5BE584]">
            {getInitials(member.name)}
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="truncate text-sm font-bold text-gray-100">
              {member.name}
            </span>
            <span className="truncate text-[10px] text-gray-500">
              {member.email}
            </span>
          </div>
        </div>
        <div className="shrink-0 pl-2">
          {member.isActive ? (
            <span className="inline-flex items-center rounded bg-[#16291d] border border-[#23422e] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#5BE584]">
              Active
            </span>
          ) : (
            <span className="inline-flex items-center rounded bg-[#13171d] border border-[#1e2329] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-gray-500">
              Inactive
            </span>
          )}
        </div>
      </div>

      {/* Assignment Section */}
      <div className="flex items-center justify-between border-t border-[#1e2329] px-4 py-3">
        <div className="flex flex-col gap-0.5">
          <span className="flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-wider text-gray-500">
            <Dumbbell className="h-3 w-3" />
            CURRENT WORKOUT
          </span>
          <span className="text-xs font-semibold text-gray-200 line-clamp-1">
            {assignment?.currentWorkout?.title || "No Active Routine"}
          </span>
          {assignment?.trainer && (
            <span className="text-[10px] text-gray-500">
              Coach:{" "}
              <strong className="text-gray-400">
                {assignment.trainer.name}
              </strong>
            </span>
          )}
        </div>

        {/* Progress Ring */}
        <div className="relative flex h-10 w-10 shrink-0 items-center justify-center">
          <svg
            className="h-full w-full -rotate-90 transform"
            viewBox="0 0 36 36"
          >
            <circle
              cx="18"
              cy="18"
              r={radius}
              fill="none"
              stroke="#1e2329"
              strokeWidth="2.5"
            />
            <circle
              cx="18"
              cy="18"
              r={radius}
              fill="none"
              stroke="#5BE584"
              strokeWidth="2.5"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-500 ease-in-out"
              strokeLinecap="round"
            />
          </svg>
          <span className="absolute text-[9px] font-bold text-gray-200">
            {completionRate}%
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-px bg-[#1e2329] border-t border-[#1e2329]">
        <div className="flex flex-col bg-[#0d1014] p-3">
          <span className="text-[9px] font-semibold uppercase tracking-wider text-gray-500">
            Mass
          </span>
          <span className="mt-0.5 text-xs font-bold font-mono text-gray-200">
            {measurements?.latestWeight !== null &&
            measurements?.latestWeight !== undefined
              ? `${measurements.latestWeight} kg`
              : "--"}
          </span>
        </div>
        <div className="flex flex-col bg-[#0d1014] p-3">
          <span className="text-[9px] font-semibold uppercase tracking-wider text-gray-500">
            Last Logged
          </span>
          <span className="mt-0.5 text-xs font-bold text-gray-200">
            {formatDate(workout?.lastWorkout)}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="border-t border-[#1e2329] p-2 bg-[#13171d]/30">
        <Link
          to={`/members/${member.id}`}
          className="flex w-full items-center justify-center gap-2 rounded-md px-3 py-1.5 text-[11px] font-semibold text-gray-300 transition-colors hover:bg-white/[0.04] hover:text-white"
        >
          View Profile
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
};
