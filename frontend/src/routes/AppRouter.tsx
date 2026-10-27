import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";

import AuthLayout from "@/features/auth/components/layouts/AuthLayout";
import AppLayout from "@/components/shared/layouts/AppLayout";

import ProtectedRoute from "./ProtectedRoute";

// Overview (Public Root)
import LandingPage from "@/features/landing/pages/LandingPage";
import HomePage from "@/features/homelayout/pages/HomePage";

// Auth
import LoginPage from "@/features/auth/pages/LoginPage";
import RegisterPage from "@/features/auth/pages/RegisterPage";
import VerifyEmailPage from "@/features/auth/pages/VerifyEmailPage";
import ForgotPasswordPage from "@/features/auth/pages/ForgotPasswordPage";
import VerifyResetCodePage from "@/features/auth/pages/VerifyResetCodePage";
import ResetPasswordPage from "@/features/auth/pages/ResetPasswordPage";
import NotFoundPage from "@/features/auth/pages/NotFoundPage";
import OnboardingPage from "@/features/auth/pages/OnboardingPage";
import MemberOnboardingPage from "@/features/auth/pages/MemberOnboardingPage";
import CoachOnboardingPage from "@/features/auth/pages/CoachOnboardingPage";

// Home & Dashboard
import DashboardPage from "@/features/dashboard/pages/DashboardPage";
import MemberOverviewView from "@/features/dashboard/member/views/MemberOverviewView";
import MemberAnalyticsView from "@/features/dashboard/member/views/MemberAnalyticsView";
import MemberActivityView from "@/features/dashboard/member/views/MemberActivityView";

import CoachDashboardPage from "@/features/coach-dashboard/pages/CoachDashboardPage";
import CoachOverviewView from "@/features/coach-dashboard/views/CoachOverviewView";
import CoachAnalyticsView from "@/features/coach-dashboard/views/CoachAnalyticsView";
import CoachActivityView from "@/features/coach-dashboard/views/CoachActivityView";

// Exercises
import ExercisesPage from "@/features/exercises/pages/ExercisesPage";
import CreateExercisePage from "@/features/exercises/pages/CreateExercisePage";
import ExerciseDetailsPage from "@/features/exercises/pages/ExerciseDetailsPage";
import EditExercisePage from "@/features/exercises/pages/EditExercisePage";

// Workouts
import WorkoutsPage from "@/features/workouts/pages/WorkoutsPage";
import CreateWorkoutPage from "@/features/workouts/pages/CreateWorkoutPage";
import WorkoutDetailsPage from "@/features/workouts/pages/WorkoutDetailsPage";
import EditWorkoutPage from "@/features/workouts/pages/EditWorkoutPage";

// Assignments
import AssignmentsPage from "@/features/assignments/pages/AssignmentsPage";
import CreateAssignmentPage from "@/features/assignments/pages/CreateAssignmentPage";
import AssignmentDetailsPage from "@/features/assignments/pages/AssignmentDetailsPage";
import EditAssignmentPage from "@/features/assignments/pages/EditAssignmentPage";

// Workout Sessions
import WorkoutSessionsPage from "@/features/workout-sessions/pages/WorkoutSessionsPage";
import WorkoutSessionPage from "@/features/workout-sessions/pages/WorkoutSessionPage";
import ActiveWorkoutPage from "@/features/workout-sessions/pages/ActiveWorkoutPage";
import SessionSummaryPage from "@/features/workout-sessions/pages/SessionSummaryPage";
import ScheduledWorkoutsPage from "@/features/workout-sessions/pages/ScheduledWorkoutsPage";

// Profile & Measurements
import ProfilePage from "@/features/profile/pages/ProfilePage";
import BodyMeasurementsPage from "@/features/body-measurements/pages/BodyMeasurementsPage";

import MembersManagementPage from "@/features/members-management/pages/MembersManagementPage";
import MemberProfilePage from "@/features/member-profile/pages/MemberProfilePage";
import MemberInsightsPage from "@/features/member-insights/pages/MemberInsightsPage";
import NotificationsPage from "@/features/notifications/pages/NotificationsPage";

// Nutrition
import NutritionOverviewPage from "@/features/nutrition/pages/NutritionOverviewPage";
import NutritionOnboardingPage from "@/features/nutrition/pages/NutritionOnboardingPage";
import NutritionPlanPage from "@/features/nutrition/pages/NutritionPlanPage";
import NutritionHistoryPage from "@/features/nutrition/pages/NutritionHistoryPage";
import CoachNutritionRosterPage from "@/features/nutrition/pages/CoachNutritionRosterPage";
import CoachNutritionMemberPage from "@/features/nutrition/pages/CoachNutritionMemberPage";

// Scheduling & Calendar
import MemberCalendarPage from "@/features/scheduling/pages/MemberCalendarPage";
import CoachSchedulePage from "@/features/scheduling/pages/CoachSchedulePage";
import CoachScheduleFormPage from "@/features/scheduling/pages/CoachScheduleFormPage";
import MemberPlanManagementPage from "@/features/member-profile/pages/MemberPlanManagementPage";

// Gamification
import GamificationPage from "@/features/gamification/pages/GamificationPage";

const router = createBrowserRouter([
  // ================= Public =================
  {
    path: "/",
    element: <HomePage />,
  },
  {
    element: <AuthLayout />,
    children: [
      {
        path: "/login",
        element: <LoginPage />,
      },
      {
        path: "/register",
        element: <RegisterPage />,
      },
      {
        path: "/verify-email",
        element: <VerifyEmailPage />,
      },
      {
        path: "/forgot-password",
        element: <ForgotPasswordPage />,
      },
      {
        path: "/verify-reset-code",
        element: <VerifyResetCodePage />,
      },
      {
        path: "/reset-password",
        element: <ResetPasswordPage />,
      },
    ],
  },

  // ================= Protected =================
  {
    element: <ProtectedRoute />,
    children: [
      // ─── Onboarding Flows (Full-Screen Distraction-Free) ──
      {
        path: "onboarding",
        children: [
          {
            index: true,
            element: <OnboardingPage />,
          },
          {
            path: "member",
            element: <OnboardingPage initialRole="member" />,
          },
          {
            path: "coach",
            element: <OnboardingPage initialRole="trainer" />,
          },
        ],
      },

      {
        element: <AppLayout />,
        children: [
          // ─── Main ───────────────────────────────────────────
          {
            path: "home",
            element: <LandingPage />,
          },

          // ─── Member Only ────────────────────────────────────
          {
            element: <ProtectedRoute allowedRoles={["MEMBER"]} />,
            children: [
              {
                path: "dashboard",
                element: <DashboardPage />,
                children: [
                  {
                    index: true,
                    element: <MemberOverviewView />,
                  },
                  {
                    path: "overview",
                    element: <Navigate to="/dashboard" replace />,
                  },
                  {
                    path: "analytics",
                    element: <MemberAnalyticsView />,
                  },
                  {
                    path: "activity",
                    element: <MemberActivityView />,
                  },
                ],
              },
            ],
          },

          // ─── Coach & Admin Only ─────────────────────────────
          {
            element: <ProtectedRoute allowedRoles={["TRAINER", "ADMIN"]} />,
            children: [
              {
                path: "coach-dashboard",
                element: <CoachDashboardPage />,
                children: [
                  {
                    index: true,
                    element: <CoachOverviewView />,
                  },
                  {
                    path: "overview",
                    element: <Navigate to="/coach-dashboard" replace />,
                  },
                  {
                    path: "analytics",
                    element: <CoachAnalyticsView />,
                  },
                  {
                    path: "activity",
                    element: <CoachActivityView />,
                  },
                ],
              },
              {
                path: "members",
                children: [
                  {
                    index: true,
                    element: <Navigate to="all" replace />,
                  },
                  {
                    path: "all",
                    element: <MembersManagementPage />,
                  },
                  {
                    path: ":memberId",
                    element: <MemberProfilePage />,
                  },
                  {
                    path: ":memberId/plan",
                    element: <MemberPlanManagementPage />,
                  },
                  {
                    path: ":memberId/insights",
                    element: <MemberInsightsPage />,
                  },
                  {
                    path: ":memberId/measurements",
                    element: <BodyMeasurementsPage />,
                  },
                ],
              },
              {
                path: "coach/members/:memberId/plan",
                element: <MemberPlanManagementPage />,
              },
              {
                path: "coach/nutrition",
                children: [
                  {
                    index: true,
                    element: <CoachNutritionRosterPage />,
                  },
                  {
                    path: ":memberId",
                    element: <CoachNutritionMemberPage />,
                  },
                ],
              },
              {
                path: "coach/schedule",
                children: [
                  {
                    index: true,
                    element: <CoachSchedulePage />,
                  },
                  {
                    path: "new",
                    element: <CoachScheduleFormPage />,
                  },
                ],
              },
            ],
          },

          // ─── Workout Builder ────────────────────────────────
          {
            path: "workout-builder",
            children: [
              {
                index: true,
                element: <Navigate to="all" replace />,
              },
              {
                path: "all",
                element: <WorkoutsPage />,
              },
              {
                path: "new",
                element: <CreateWorkoutPage />,
              },
              {
                path: ":workoutId",
                element: <WorkoutDetailsPage />,
              },
              {
                path: ":workoutId/edit",
                element: <EditWorkoutPage />,
              },
            ],
          },

          // ─── Workouts Alias (Direct Navigation Compatibility) ───
          {
            path: "workouts",
            children: [
              {
                index: true,
                element: <Navigate to="/workout-builder/all" replace />,
              },
              {
                path: ":workoutId",
                element: <WorkoutDetailsPage />,
              },
            ],
          },

          // ─── Exercises Alias (Direct Navigation Compatibility) ──
          {
            path: "exercises",
            children: [
              {
                index: true,
                element: <Navigate to="/workout-library/exercises" replace />,
              },
              {
                path: ":exerciseId",
                element: <ExerciseDetailsPage />,
              },
            ],
          },

          // ─── Workout Library ────────────────────────────────
          {
            path: "workout-library",
            children: [
              {
                index: true,
                element: <Navigate to="workouts" replace />,
              },
              {
                path: "workouts",
                children: [
                  {
                    index: true,
                    element: <WorkoutsPage />,
                  },
                  {
                    path: "new",
                    element: <CreateWorkoutPage />,
                  },
                  {
                    path: ":workoutId",
                    element: <WorkoutDetailsPage />,
                  },
                  {
                    path: ":workoutId/edit",
                    element: <EditWorkoutPage />,
                  },
                ],
              },
              {
                path: "exercises",
                children: [
                  {
                    index: true,
                    element: <ExercisesPage />,
                  },
                  {
                    path: "new",
                    element: <CreateExercisePage />,
                  },
                  {
                    path: ":exerciseId",
                    element: <ExerciseDetailsPage />,
                  },
                  {
                    path: ":exerciseId/edit",
                    element: <EditExercisePage />,
                  },
                ],
              },
            ],
          },

          // ─── Assignments ────────────────────────────────────
          {
            path: "assignments",
            children: [
              {
                index: true,
                element: <Navigate to="all" replace />,
              },
              {
                path: "all",
                element: <AssignmentsPage />,
              },
              {
                element: <ProtectedRoute allowedRoles={["TRAINER", "ADMIN"]} />,
                children: [
                  {
                    path: "new",
                    element: <CreateAssignmentPage />,
                  },
                  {
                    path: ":assignmentId/edit",
                    element: <EditAssignmentPage />,
                  },
                ],
              },
              {
                path: ":assignmentId",
                element: <AssignmentDetailsPage />,
              },
            ],
          },

          // ─── Sessions ───────────────────────────────────────
          {
            path: "sessions",
            children: [
              {
                index: true,
                element: <WorkoutSessionsPage />,
              },
              {
                path: "active",
                element: <ActiveWorkoutPage />,
              },
              {
                path: "scheduled",
                element: <MemberCalendarPage />,
              },
              {
                path: ":sessionId",
                element: <WorkoutSessionPage />,
              },
              {
                path: ":sessionId/summary",
                element: <SessionSummaryPage />,
              },
              {
                path: ":sessionId/active",
                element: <ActiveWorkoutPage />,
              },
            ],
          },

          // ─── Workout Sessions Alias (Prevent 404s) ───────────
          {
            path: "workout-sessions",
            children: [
              {
                index: true,
                element: <Navigate to="/sessions" replace />,
              },
              {
                path: "active",
                element: <Navigate to="/sessions/active" replace />,
              },
              {
                path: "scheduled",
                element: <Navigate to="/sessions/scheduled" replace />,
              },
              {
                path: ":sessionId",
                element: <WorkoutSessionPage />,
              },
              {
                path: ":sessionId/summary",
                element: <SessionSummaryPage />,
              },
              {
                path: ":sessionId/active",
                element: <ActiveWorkoutPage />,
              },
            ],
          },

          // ─── Shared ─────────────────────────────────────────
          {
            path: "calendar",
            element: <MemberCalendarPage />,
          },
          {
            path: "measurements",
            element: <BodyMeasurementsPage />,
          },
          {
            path: "body-measurements",
            children: [
              {
                index: true,
                element: <Navigate to="/measurements" replace />,
              },
              {
                path: ":id",
                element: <BodyMeasurementsPage />,
              },
            ],
          },
          {
            path: "nutrition",
            children: [
              {
                index: true,
                element: <NutritionOverviewPage />,
              },
              {
                path: "onboarding",
                element: <NutritionOnboardingPage />,
              },
              {
                path: "plan",
                element: <NutritionPlanPage />,
              },
              {
                path: "history",
                element: <NutritionHistoryPage />,
              },
            ],
          },
          {
            path: "notifications",
            element: <NotificationsPage />,
          },
          {
            path: "gamification",
            element: <GamificationPage />,
          },
          {
            path: "profile",
            element: <ProfilePage />,
          },
        ],
      },
    ],
  },

  // ================= 404 =================
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
