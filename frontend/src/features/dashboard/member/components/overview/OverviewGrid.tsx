// src/features/dashboard/member/components/overview/OverviewGrid.tsx
import React from "react";
import { useTranslation } from "react-i18next";
import {
  CheckCircle2,
  Dumbbell,
  Flame,
  Timer,
  TrendingUp,
  CalendarDays,
} from "lucide-react";
import { OverviewCard } from "./OverviewCard";

interface OverviewGridProps {
  overview: any;
}

export const OverviewGrid: React.FC<OverviewGridProps> = ({ overview }) => {
  const { t } = useTranslation(["dashboard"]);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <OverviewCard
        title={t("member.overviewGrid.completed")}
        value={overview?.completedSessions ?? 0}
        icon={CheckCircle2}
        description={t("member.overviewGrid.sessions")}
        highlight
        infoTooltip={{
          title: "Completed Sessions",
          description:
            "Total number of workout sessions you have successfully completed in your training history.",
          calculation: "SUM(sessions WHERE status = 'COMPLETED')",
          unit: "sessions",
          dateRange: "All time",
          limitations: "Excludes active, abandoned, or cancelled sessions.",
        }}
      />
      <OverviewCard
        title={t("member.overviewGrid.adherence")}
        value={`${overview?.completionRate ?? 0}%`}
        icon={TrendingUp}
        description={t("member.overviewGrid.rate")}
        highlight
        infoTooltip={{
          title: "Workout Adherence Rate",
          description:
            "Percentage of started workout routines that you have successfully finished.",
          calculation: "(Completed Sessions / Total Started Sessions) × 100",
          unit: "%",
          dateRange: "All time",
          limitations:
            "A high adherence rate reflects disciplined workout execution without premature abandonment.",
        }}
      />
      <OverviewCard
        title={t("member.overviewGrid.streak")}
        value={`${overview?.currentStreak ?? 0}d`}
        icon={Flame}
        description={t("member.overviewGrid.best", {
          count: overview?.bestStreak ?? 0,
        })}
        infoTooltip={{
          title: "Active Workout Streak",
          description:
            "Consecutive active days with at least one completed workout session.",
          calculation:
            "Calculated backwards from today/yesterday for consecutive active workout days",
          unit: "days",
          dateRange: "Current streak window",
          limitations:
            "Resets to 0 if a scheduled rest day exceeds the inactivity threshold.",
        }}
      />
      <OverviewCard
        title={t("member.overviewGrid.thisWeek")}
        value={overview?.workoutsThisWeek ?? 0}
        icon={CalendarDays}
        description={t("member.overviewGrid.workouts")}
        infoTooltip={{
          title: "Weekly Frequency",
          description:
            "Number of completed workout sessions logged in the last 7 calendar days.",
          calculation:
            "COUNT(sessions WHERE startedAt >= 7 days ago AND status = 'COMPLETED')",
          unit: "workouts / week",
          dateRange: "Rolling 7 days",
          limitations:
            "Rolling window advances continuously and refreshes daily.",
        }}
      />
      <OverviewCard
        title={t("member.overviewGrid.avgDuration")}
        value={`${overview?.averageWorkoutDuration ?? 0}m`}
        icon={Timer}
        description={t("member.overviewGrid.perSession")}
        infoTooltip={{
          title: "Average Session Duration",
          description:
            "Mean active workout duration across all completed sessions.",
          calculation: "Total active workout minutes / Total completed sessions",
          unit: "minutes",
          dateRange: "All time",
          limitations:
            "Measured from live session start to finish; excludes unlogged offline warmups.",
        }}
      />
      <OverviewCard
        title={t("member.overviewGrid.totalVolume")}
        value={(overview?.totalVolumeLifted ?? 0).toLocaleString()}
        icon={Dumbbell}
        description={t("member.overviewGrid.kgLifted")}
        infoTooltip={{
          title: "Cumulative Tonnage / Volume",
          description:
            "Total workload lifted across all completed sets and exercises.",
          calculation:
            "SUM(weight_kg × reps) across all completed sets",
          unit: "kg",
          dateRange: "All time cumulative",
          limitations:
            "Bodyweight-only sets contribute 0 kg unless external resistance is recorded.",
        }}
      />
    </div>
  );
};
