import { useNavigate } from "react-router-dom";

import { DashboardLayout } from "../components/DashboardLayout";
import { StatsGrid } from "../components/StatsGrid";
import { CompletionCard } from "../components/CompletionCard";
import { CurrentAssignmentCard } from "../components/CurrentAssignmentCard";
import { LastWorkoutCard } from "../components/LastWorkoutCard";
import { RecentLogsCard } from "../components/RecentLogsCard";
import { QuickLinks } from "../components/QuickLinks";

import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { useMemberDashboard } from "@/features/dashboard/hooks/useMemberDashboard";

export default function DashboardPage() {
  const navigate = useNavigate();

  const { data: user } = useCurrentUser();
  const { data: dashboard, isLoading } = useMemberDashboard();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#090B0F] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5BE584]"></div>
      </div>
    );
  }

  return (
    <DashboardLayout userName={user?.name || "Athlete"}>
      <StatsGrid dashboard={dashboard} />

      <CompletionCard
        completed={dashboard?.completedSessions || 0}
        total={dashboard?.totalSessions || 0}
      />

      <div className="grid md:grid-cols-2 gap-6 mb-10">
        <CurrentAssignmentCard
          assignment={dashboard?.activeAssignment}
          navigate={navigate}
        />
        <LastWorkoutCard
          lastWorkout={dashboard?.lastWorkout}
          navigate={navigate}
        />
      </div>

      <RecentLogsCard logs={dashboard?.recentLogs} />

      <QuickLinks />
    </DashboardLayout>
  );
}
