// src/features/landing/components/overview/PlatformOverview.tsx
import React from "react";
import {
  Users,
  ClipboardList,
  Dumbbell,
  Activity,
  BookOpen,
  UserCircle,
  LayoutDashboard,
  Bell,
} from "lucide-react";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { PlatformModuleCard } from "./PlatformModuleCard";

export const PlatformOverview: React.FC = () => {
  const { data: user } = useCurrentUser();
  const userRole = user?.role?.toUpperCase() || "MEMBER";
  const isCoachOrAdmin = userRole === "TRAINER" || userRole === "ADMIN";

  const modules = [
    {
      title: userRole === "TRAINER" ? "Coach Dashboard" : "Dashboard",
      description:
        userRole === "TRAINER"
          ? "Centralized command center for coaching operations and member metrics."
          : "View your training summary, active schedule, and progress overview.",
      icon: LayoutDashboard,
      href: userRole === "TRAINER" ? "/coach-dashboard" : "/dashboard",
    },
    {
      title: "Workouts",
      description: isCoachOrAdmin
        ? "Build, edit, and organize structured multi-exercise training routines."
        : "Browse structured workout routines and training templates.",
      icon: Dumbbell,
      href: isCoachOrAdmin ? "/workout-builder/all" : "/workout-library/workouts",
    },
    {
      title: "Exercises",
      description:
        "Explore categorized movements with target muscles, equipment, and instructions.",
      icon: BookOpen,
      href: "/workout-library/exercises",
    },
    {
      title: "Assignments",
      description: isCoachOrAdmin
        ? "Assign training plans to members and track completion status."
        : "Review workouts assigned to you by your coach.",
      icon: ClipboardList,
      href: "/assignments/all",
    },
    {
      title: "Workout Sessions",
      description:
        "Launch live training sessions and log sets, reps, weight, and volume.",
      icon: Activity,
      href: "/sessions",
    },
    ...(isCoachOrAdmin
      ? [
          {
            title: "Members",
            description:
              "Inspect member profiles, training insights, and body measurements.",
            icon: Users,
            href: "/members/all",
          },
        ]
      : [
          {
            title: "Performance Overview",
            description:
              "Review your personal training consistency and logged metrics.",
            icon: Users,
            href: "/dashboard",
          },
        ]),
    {
      title: "Notifications",
      description:
        "Stay updated on new workout assignments and training milestones.",
      icon: Bell,
      href: "/notifications",
    },
    {
      title: "Profile",
      description:
        "Manage your personal account details and workspace preferences.",
      icon: UserCircle,
      href: "/profile",
    },
  ];

  return (
    <section
      id="platform"
      className="relative overflow-hidden border-b border-[#2A3039] bg-[linear-gradient(180deg,#090B0F_0%,#0C1017_50%,#090B0F_100%)] py-14 sm:py-20 px-4 sm:px-6 lg:px-8"
    >
      {/* Subtle center-top ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-[280px] w-[620px] rounded-full bg-[#5BE584]/[0.05] blur-[120px]"
      />

      <div className="relative z-10 mx-auto max-w-[1280px] flex flex-col items-center gap-10">
        <div className="text-center flex flex-col items-center">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#5BE584] border border-[#5BE584]/30 bg-[#5BE584]/10 px-3 py-1 rounded-full mb-4">
            Workspace Quick Navigation
          </span>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-[-0.02em] text-[#F8FAFC] mb-3">
            Jump directly into your STREN modules.
          </h2>
          <p className="max-w-2xl text-sm sm:text-base text-[#94A3B8]">
            Select any module below to open your dashboard, manage workouts and
            assignments, log live sessions, or review notifications.
          </p>
        </div>

        <div className="grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {modules.map((mod) => (
            <PlatformModuleCard
              key={mod.title}
              title={mod.title}
              description={mod.description}
              icon={mod.icon}
              href={mod.href}
            />
          ))}
        </div>
      </div>
    </section>
  );
};


