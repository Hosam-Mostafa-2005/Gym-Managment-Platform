import { useNavigate } from "react-router-dom";
import { Hero } from "../components/Hero";
import { ActivityCards } from "../components/ActivityCards";
import { TodayAssignment } from "../components/TodayAssignment";
import { CurrentWorkout } from "../components/CurrentWorkout";
import { Features } from "../components/Features";
import { RecentSessions } from "../components/RecentSessions";
import { QuickActions } from "../components/QuickActions";

import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { useMyAssignments } from "@/features/assignments/hooks/useMyAssignments";
import { useCurrentWorkoutSession } from "@/features/workout-sessions/hooks/useCurrentWorkoutSession";
import { useWorkoutSessions } from "@/features/workout-sessions/hooks/useWorkoutSessions";
import { useWorkouts } from "@/features/workouts/hooks/useWorkouts";
import { useExercises } from "@/features/exercises/hooks/useExercises";
import { useMemberDashboard } from "@/features/dashboard/hooks/useMemberDashboard";

export default function HomePage() {
  const navigate = useNavigate();

  const { data: user } = useCurrentUser();
  const { data: assignments = [] } = useMyAssignments();
  const { data: currentSession } = useCurrentWorkoutSession();
  const { data: sessionHistory } = useWorkoutSessions(1, 3);
  const { data: workouts = [] } = useWorkouts();
  const { data: exercisesData } = useExercises();
  const { data: dashboardStats } = useMemberDashboard();

  const todayAssignment = assignments[0];
  const featuredWorkouts = workouts.slice(0, 3);
  const featuredExercises = exercisesData?.exercises?.slice(0, 6) ?? [];
  const recentSessions = sessionHistory?.sessions || [];

  return (
    <div className="min-h-screen bg-[#090B0F] text-zinc-50 font-sans selection:bg-[#5BE584] selection:text-black">
      <Hero user={user} currentSession={currentSession} navigate={navigate} />

      <div className="max-w-7xl mx-auto px-6 md:px-10 py-24 space-y-12">
        <TodayAssignment assignment={todayAssignment} navigate={navigate} />
        <CurrentWorkout currentSession={currentSession} navigate={navigate} />
        <ActivityCards
          stats={dashboardStats}
          assignmentsCount={assignments.length}
        />
        <Features
          workouts={featuredWorkouts}
          exercises={featuredExercises}
          navigate={navigate}
        />
        <RecentSessions sessions={recentSessions} />
        <QuickActions />
      </div>
    </div>
  );
}
