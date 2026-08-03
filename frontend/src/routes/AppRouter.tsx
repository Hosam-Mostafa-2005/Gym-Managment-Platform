import { createBrowserRouter, RouterProvider } from "react-router-dom";

import AuthLayout from "@/features/auth/components/layouts/AuthLayout";
import AppLayout from "@/components/shared/layouts/AppLayout";

import ProtectedRoute from "./ProtectedRoute";

// Auth
import LoginPage from "@/features/auth/pages/LoginPage";
import RegisterPage from "@/features/auth/pages/RegisterPage";
import NotFoundPage from "@/features/auth/pages/NotFoundPage";

// Home
import HomePage from "@/features/home/pages/HomePage";
import DashboardPage from "@/features/dashboard/pages/DashboardPage";

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
          {
            index: true,
            element: <HomePage />,
          },
          {
            path: "dashboard",
            element: <DashboardPage />,
          },

          // ================= Exercises =================

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

          // ================= Workouts =================

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

          // ================= Assignments =================

          {
            path: "assignments",
            children: [
              {
                index: true,
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

          // ================= Future =================

          // assignments
          // members
          // sessions
          // users
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
