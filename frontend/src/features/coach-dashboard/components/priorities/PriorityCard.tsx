// src/features/coach-dashboard/components/priorities/PriorityCard.tsx
import React from "react";
import { Link } from "react-router-dom";
import { AlertCircle, ArrowRight, User } from "lucide-react";
import type { DashboardPriority } from "@/features/coach-dashboard/types/coach-dashboard.types";

interface PriorityCardProps {
  priority: DashboardPriority;
}

const getPriorityVisuals = (level: string) => {
  const normalized = level.toLowerCase();
  if (
    normalized.includes("high") ||
    normalized.includes("critical") ||
    normalized === "urgent"
  ) {
    return {
      badge: "text-red-400 bg-red-400/10 border-red-500/20",
      icon: "text-red-400",
    };
  }
  if (normalized.includes("medium") || normalized.includes("warn")) {
    return {
      badge: "text-yellow-400 bg-yellow-400/10 border-yellow-500/20",
      icon: "text-yellow-400",
    };
  }
  return {
    badge: "text-[#5BE584] bg-[#5BE584]/10 border-[#5BE584]/20",
    icon: "text-[#5BE584]",
  };
};

export const PriorityCard: React.FC<PriorityCardProps> = ({ priority }) => {
  const visuals = getPriorityVisuals(priority.priority);

  return (
    <div className="flex h-full flex-col justify-between rounded-lg border border-[#1e2329] bg-[#0d1014] p-5 transition-colors hover:border-[#2a313a]">
      <div className="flex flex-col gap-3">
        {/* Header: Severity Badge & Context Type */}
        <div className="flex items-center justify-between">
          <div
            className={`inline-flex items-center gap-1.5 rounded border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${visuals.badge}`}
          >
            <AlertCircle className={`h-3 w-3 ${visuals.icon}`} />
            {priority.priority}
          </div>
          <span className="text-[10px] font-medium uppercase tracking-wider text-gray-500 line-clamp-1 max-w-[120px] text-right">
            {priority.type.replace(/_/g, " ")}
          </span>
        </div>

        {/* Title & Description */}
        <div className="flex flex-col gap-1.5">
          <h3 className="text-sm font-semibold text-gray-100 line-clamp-2">
            {priority.title}
          </h3>
          <p className="text-xs text-gray-400 line-clamp-3 leading-relaxed">
            {priority.description}
          </p>
        </div>

        {/* Dynamic Details (Reasons/Count) */}
        {(priority.reasons && priority.reasons.length > 0) || priority.count ? (
          <div className="mt-1 flex flex-wrap gap-2">
            {priority.count && priority.count > 1 && (
              <span className="inline-flex rounded bg-[#13171d] border border-[#1e2329] px-1.5 py-0.5 text-[10px] font-medium text-gray-400">
                Count: {priority.count}
              </span>
            )}
            {priority.reasons?.map((reason, idx) => (
              <span
                key={idx}
                className="inline-flex rounded bg-[#13171d] border border-[#1e2329] px-1.5 py-0.5 text-[10px] font-medium text-gray-400 line-clamp-1 max-w-full"
              >
                {reason}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      {/* Footer: Member Info & Action */}
      <div className="mt-5 flex flex-col gap-3 border-t border-[#1e2329] pt-4">
        {priority.member && (
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#1e2329] bg-[#16291d] text-[#5BE584]">
              <User className="h-4 w-4" />
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-medium text-gray-200 truncate">
                {priority.member.name}
              </span>
              {priority.member.email && (
                <span className="text-[10px] text-gray-500 truncate">
                  {priority.member.email}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Action Button */}
        {priority.member ? (
          <Link
            to={`/members/${priority.member.id}`}
            className="group flex w-full items-center justify-center gap-2 rounded-md bg-[#13171d] border border-[#1e2329] py-2 text-xs font-medium text-gray-300 transition-colors hover:bg-white/[0.03] hover:text-white"
          >
            Open Member
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        ) : (
          <button
            type="button"
            disabled
            className="flex w-full items-center justify-center gap-2 rounded-md bg-[#13171d] border border-[#1e2329] py-2 text-xs font-medium text-gray-500 opacity-50 cursor-not-allowed"
          >
            Action Pending
          </button>
        )}
      </div>
    </div>
  );
};
