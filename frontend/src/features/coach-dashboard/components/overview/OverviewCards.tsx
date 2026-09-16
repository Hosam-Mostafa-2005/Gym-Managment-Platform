// src/features/coach-dashboard/components/overview/OverviewCards.tsx
import React from "react";
import { OverviewCard } from "./OverviewCard";
import {
  Users,
  ClipboardList,
  Dumbbell,
  Flame,
  CalendarDays,
  Percent,
  Ruler,
  HeartPulse,
} from "lucide-react";
import type { DashboardOverview } from "@/features/coach-dashboard/types/coach-dashboard.types";

interface OverviewCardsProps {
  overview: DashboardOverview;
}

export const OverviewCards: React.FC<OverviewCardsProps> = ({ overview }) => {
  return (
    <section
      className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-8"
      aria-label="Dashboard Key Performance Indicators"
    >
      <OverviewCard
        title="Active Members"
        value={overview.members?.active ?? 0}
        secondaryValue={overview.members?.total}
        secondaryLabel="total"
        icon={Users}
      />

      <OverviewCard
        title="Active Assignments"
        value={overview.assignments?.active ?? 0}
        secondaryValue={overview.assignments?.total}
        secondaryLabel="total"
        icon={ClipboardList}
      />

      <OverviewCard
        title="Workouts Created"
        value={overview.workoutsCreated ?? 0}
        icon={Dumbbell}
      />

      <OverviewCard
        title="Sessions Today"
        value={overview.completedSessionsToday ?? 0}
        icon={Flame}
      />

      <OverviewCard
        title="Sessions This Week"
        value={overview.completedSessionsThisWeek ?? 0}
        icon={CalendarDays}
      />

      <OverviewCard
        title="Completion Rate"
        value={`${overview.completionRate ?? 0}%`}
        icon={Percent}
      />

      <OverviewCard
        title="Measurements (Week)"
        value={overview.measurementsThisWeek ?? 0}
        icon={Ruler}
      />

      <OverviewCard
        title="Health Score"
        value={overview.healthScore ?? 0}
        icon={HeartPulse}
      />
    </section>
  );
};
