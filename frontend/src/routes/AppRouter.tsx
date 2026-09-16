import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";

import AuthLayout from "@/features/auth/components/layouts/AuthLayout";
import AppLayout from "@/components/shared/layouts/AppLayout";

import ProtectedRoute from "./ProtectedRoute";

// Auth
import LoginPage from "@/features/auth/pages/LoginPage";
import RegisterPage from "@/features/auth/pages/RegisterPage";
import NotFoundPage from "@/features/auth/pages/NotFoundPage";

// Home & Dashboard
import HomePage from "@/features/home/pages/HomePage";
import DashboardPage from "@/features/dashboard/pages/DashboardPage";
import CoachDashboardPage from "@/features/coach-dashboard/pages/CoachDashboardPage";

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

const router = createBrowserRouter([
  // ================= Public =================
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
    ],
  },

  // ================= Protected =================
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          // ─── Main ───────────────────────────────────────────
          {
            index: true,
            element: <HomePage />,
          },
          {
            path: "dashboard",
            element: <DashboardPage />,
          },
          {
            path: "coach-dashboard",
            element: <CoachDashboardPage />,
          },

          // ─── Members ────────────────────────────────────────
          {
            path: "members",
            children: [
              {
                index: true,
                element: <Navigate to="all" replace />,
              },
              {
                path: "all",
                element: <HomePage />, // Reused until dedicated MembersListPage is plugged in
              },
              {
                path: ":memberId",
                element: <HomePage />, // Reused until dedicated MemberDetailsPage is plugged in
              },
              {
                path: ":memberId/insights",
                element: <HomePage />, // Reused until dedicated MemberInsightsPage is plugged in
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
                path: "new",
                element: <CreateAssignmentPage />,
              },
              {
                path: ":assignmentId",
                element: <AssignmentDetailsPage />,
              },
              {
                path: ":assignmentId/edit",
                element: <EditAssignmentPage />,
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
                path: ":sessionId",
                element: <WorkoutSessionPage />,
              },
            ],
          },

          // ─── Shared ─────────────────────────────────────────
          {
            path: "notifications",
            element: <HomePage />, // Reused until dedicated NotificationsPage is plugged in
          },
          {
            path: "profile",
            element: <HomePage />, // Reused until dedicated ProfilePage is plugged in
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
