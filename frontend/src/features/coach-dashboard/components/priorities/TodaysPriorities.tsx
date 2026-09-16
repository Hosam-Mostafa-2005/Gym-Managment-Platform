// src/features/coach-dashboard/components/priorities/TodaysPriorities.tsx
import React from "react";
import { Target, CheckCircle2 } from "lucide-react";
import { PriorityCard } from "./PriorityCard";
import type { DashboardPriority } from "@/features/coach-dashboard/types/coach-dashboard.types";

interface TodaysPrioritiesProps {
  priorities?: DashboardPriority[];
}

export const TodaysPriorities: React.FC<TodaysPrioritiesProps> = ({
  priorities = [],
}) => {
  const hasPriorities = priorities && priorities.length > 0;

  return (
    <section
      className="mb-8 flex flex-col gap-4"
      aria-labelledby="priorities-heading"
    >
      {/* Section Header */}
      <div className="flex items-center gap-3 border-b border-[#1e2329] pb-3">
        <Target className="h-4 w-4 text-gray-400" />
        <h2
          id="priorities-heading"
          className="text-sm font-semibold text-gray-100"
        >
          Today's Priorities
        </h2>
        {hasPriorities && (
          <span className="inline-flex rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-bold text-red-400 uppercase tracking-wider border border-red-500/20">
            {priorities.length} Action{priorities.length !== 1 && "s"} Required
          </span>
        )}
      </div>

      {/* Content Grid */}
      {hasPriorities ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {priorities.map((priority, index) => (
            <PriorityCard
              key={`${priority.type}-${index}`}
              priority={priority}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="flex w-full flex-col items-center justify-center rounded-lg border border-[#1e2329] border-dashed bg-[#0d1014]/50 py-12">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#16291d] border border-[#23422e] mb-4">
            <CheckCircle2 className="h-6 w-6 text-[#5BE584]" />
          </div>
          <h3 className="text-sm font-semibold text-gray-200">
            You're all caught up!
          </h3>
          <p className="mt-1 text-xs text-gray-500">
            No critical priorities require your attention today.
          </p>
        </div>
      )}
    </section>
  );
};
