// src/components/shared/sidebar/Sidebar.tsx
"use client";

import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
  Dumbbell,
  LogOut,
  LayoutGrid,
  Users,
  Dumbbell as DumbbellIcon,
  BookOpen,
  ClipboardList,
  Flame,
  UserCircle,
  Bell,
  ChevronRight,
  LayoutDashboard,
  Scale,
  Calendar,
  X,
  House,
  Utensils,
  Trophy,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useLogout } from "@/features/auth/hooks/useLogout";

export interface SidebarProps {
  collapsed: boolean;
  onCloseMobile?: () => void;
}

interface NavChild {
  nameKey: string;
  defaultName: string;
  path: string;
  roles?: string[];
}

interface NavItem {
  id: string;
  nameKey: string;
  defaultName: string;
  icon: LucideIcon;
  path?: string;
  badgeKey?: string;
  roles?: string[];
  children?: NavChild[];
}

interface NavGroup {
  id: string;
  labelKey?: string;
  defaultLabel?: string;
  roles?: string[];
  items: NavItem[];
}

// Master configuration of navigation strictly separated by role
const navGroups: NavGroup[] = [
  {
    id: "main",
    items: [
      {
        id: "home",
        nameKey: "nav.home",
        defaultName: "Home",
        icon: House,
        path: "/home",
      },
      {
        id: "coach-dashboard",
        nameKey: "nav.coachDashboard",
        defaultName: "Coach Dashboard",
        icon: LayoutDashboard,
        path: "/coach-dashboard",
        roles: ["TRAINER", "ADMIN"],
      },
      {
        id: "dashboard",
        nameKey: "nav.dashboard",
        defaultName: "Dashboard",
        icon: LayoutGrid,
        path: "/dashboard",
        roles: ["MEMBER"],
        badgeKey: "nav.liveBadge",
      },
    ],
  },
  {
    id: "members-group",
    labelKey: "nav.rosterGroup",
    defaultLabel: "ROSTER",
    roles: ["TRAINER", "ADMIN"],
    items: [
      {
        id: "members-management",
        nameKey: "nav.membersManagement",
        defaultName: "Members Management",
        icon: Users,
        path: "/members",
      },
      {
        id: "coach-nutrition",
        nameKey: "nav.athleteNutrition",
        defaultName: "Athlete Nutrition",
        icon: Utensils,
        path: "/coach/nutrition",
      },
      {
        id: "coach-schedule",
        nameKey: "nav.scheduleAppointments",
        defaultName: "Schedule & Appointments",
        icon: Calendar,
        path: "/coach/schedule",
      },
    ],
  },
  {
    id: "workouts-group",
    labelKey: "nav.trainingGroup",
    defaultLabel: "TRAINING",
    items: [
      {
        id: "workout-builder",
        nameKey: "nav.workouts",
        defaultName: "Workouts",
        icon: DumbbellIcon,
        children: [
          {
            nameKey: "nav.allWorkouts",
            defaultName: "All Workouts",
            path: "/workout-builder/all",
          },
          {
            nameKey: "nav.createWorkout",
            defaultName: "Create Workout",
            path: "/workout-builder/new",
          },
        ],
      },
      {
        id: "workout-library",
        nameKey: "nav.exerciseLibrary",
        defaultName: "Exercise Library",
        icon: BookOpen,
        children: [
          {
            nameKey: "nav.allExercises",
            defaultName: "All Exercises",
            path: "/workout-library/exercises",
          },
          {
            nameKey: "nav.createExercise",
            defaultName: "Create Exercise",
            path: "/workout-library/exercises/new",
          },
        ],
      },
      {
        id: "assignments",
        nameKey: "nav.assignments",
        defaultName: "Assignments",
        icon: ClipboardList,
        children: [
          {
            nameKey: "nav.allAssignments",
            defaultName: "All Assignments",
            path: "/assignments/all",
          },
          {
            nameKey: "nav.createAssignment",
            defaultName: "Create Assignment",
            path: "/assignments/new",
            roles: ["TRAINER", "ADMIN"],
          },
        ],
      },
      {
        id: "sessions",
        nameKey: "nav.workoutSessions",
        defaultName: "Workout Sessions",
        icon: Flame,
        path: "/sessions",
      },
      {
        id: "scheduled-workouts",
        nameKey: "nav.trainingCalendar",
        defaultName: "Training Calendar",
        icon: Calendar,
        path: "/calendar",
      },
      {
        id: "measurements",
        nameKey: "nav.bodyMeasurements",
        defaultName: "Body Measurements",
        icon: Scale,
        path: "/measurements",
        roles: ["MEMBER"],
      },
      {
        id: "nutrition",
        nameKey: "nav.nutritionDiet",
        defaultName: "Nutrition & Diet",
        icon: Utensils,
        path: "/nutrition",
        roles: ["MEMBER"],
      },
      {
        id: "gamification",
        nameKey: "nav.achievementsStreaks",
        defaultName: "Achievements & Streaks",
        icon: Trophy,
        path: "/gamification",
        roles: ["MEMBER"],
      },
    ],
  },
  {
    id: "account-group",
    labelKey: "nav.accountGroup",
    defaultLabel: "ACCOUNT",
    items: [
      {
        id: "profile",
        nameKey: "nav.profile",
        defaultName: "Profile",
        icon: UserCircle,
        path: "/profile",
      },
      {
        id: "notifications",
        nameKey: "nav.notifications",
        defaultName: "Notifications",
        icon: Bell,
        path: "/notifications",
      },
    ],
  },
];

export default function Sidebar({ collapsed, onCloseMobile }: SidebarProps) {
  const { t } = useTranslation(["common"]);
  const [isHovered, setIsHovered] = useState(false);
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({});

  const { mutate: logoutUser, isPending } = useLogout();
  const { role, isLoading: isAuthLoading } = useAuth();

  const handleLogout = () => {
    logoutUser();
  };

  useEffect(() => {
    if (!collapsed) {
      if (typeof window !== "undefined" && window.innerWidth < 1024) {
        document.body.style.overflow = "hidden";
      }
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape" && onCloseMobile) {
          onCloseMobile();
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = "";
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [collapsed, onCloseMobile]);

  // On desktop (lg+), sidebar opens when !collapsed or hovered.
  // On mobile (< lg), when !collapsed it opens as a full-width drawer (isOpen = true).
  const isOpen = !collapsed || isHovered;

  const toggleSection = (id: string) => {
    if (!isOpen) return;
    setExpandedSections((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleNavClick = () => {
    if (onCloseMobile && window.innerWidth < 1024) {
      onCloseMobile();
    }
  };

  // Filter groups, items, and children dynamically based on authenticated role
  const userRole = role || "";
  const filteredNavGroups = userRole
    ? navGroups
        .filter((group) => !group.roles || group.roles.includes(userRole))
        .map((group) => ({
          ...group,
          items: group.items
            .filter((item) => !item.roles || item.roles.includes(userRole))
            .map((item) => ({
              ...item,
              children: item.children?.filter(
                (child) => !child.roles || child.roles.includes(userRole),
              ),
            })),
        }))
        .filter((group) => group.items.length > 0)
    : [];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {!collapsed && (
        <div
          onClick={onCloseMobile}
          aria-hidden="true"
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      <aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          fixed inset-y-0 start-0 z-50 flex h-[100dvh] flex-col border-e border-[#2A3039] bg-[#13171D]
          transition-all duration-200 ease-in-out shrink-0 select-none
          lg:static lg:z-30
          ${collapsed ? "max-lg:-translate-x-full max-lg:rtl:translate-x-full lg:translate-x-0" : "translate-x-0"}
          ${isOpen ? "w-[264px] max-w-[85vw]" : "lg:w-20"}
        `}
        aria-label={t("nav.mainNavigation", "Main Navigation")}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-[#2A3039] px-5 shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] bg-[#5BE584] text-[#090B0F]">
              <Dumbbell className="h-5 w-5 stroke-[2.5]" aria-hidden="true" />
            </div>

            <div
              className={`flex flex-col transition-all duration-200 overflow-hidden ${
                isOpen ? "max-w-[150px] opacity-100" : "max-w-0 opacity-0"
              }`}
            >
              <span className="text-base font-bold tracking-wider text-[#F8FAFC]">
                STREN
              </span>
              <span className="text-[10px] font-semibold text-[#5BE584] uppercase tracking-widest">
                {userRole === "TRAINER"
                  ? t("perspectives.coach", "Coach Perspective")
                  : userRole === "ADMIN"
                    ? t("perspectives.admin", "Admin Perspective")
                    : t("perspectives.member", "Member Perspective")}
              </span>
            </div>
          </div>

          {/* Close button inside mobile drawer */}
          <button
            type="button"
            onClick={onCloseMobile}
            aria-label={t("nav.closeNavigation", "Close navigation")}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#94A3B8] hover:bg-[#1B2028] hover:text-[#F8FAFC] lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Groups */}
        <nav
          className="flex-1 overflow-y-auto px-3 py-4 space-y-6"
          tabIndex={-1}
        >
          {isAuthLoading || !role ? (
            <div className="space-y-4 px-2 py-2">
              <div className="h-9 rounded-lg bg-[#1E2329]/60 animate-pulse" />
              <div className="h-9 rounded-lg bg-[#1E2329]/40 animate-pulse" />
              <div className="h-9 rounded-lg bg-[#1E2329]/40 animate-pulse" />
            </div>
          ) : (
            filteredNavGroups.map((group) => (
              <div key={group.id} className="space-y-1">
                {group.labelKey && isOpen && (
                  <div className="px-3 pb-1 pt-2 text-[10px] font-semibold tracking-wider text-[#94A3B8]/60 uppercase">
                    {t(group.labelKey as any, {
                      defaultValue: group.defaultLabel || "",
                    })}
                  </div>
                )}

                <div className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const hasChildren =
                      item.children && item.children.length > 0;
                    const isExpanded = expandedSections[item.id];

                    return (
                      <div key={item.id} className="space-y-1">
                        {hasChildren ? (
                          <>
                            <button
                              type="button"
                              onClick={() => toggleSection(item.id)}
                              aria-expanded={isExpanded}
                              className={`
                                group flex w-full items-center justify-between rounded-[12px] text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5BE584] text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1B2028]/60
                                ${isOpen ? "px-3 py-2.5" : "justify-center px-0 py-3"}
                              `}
                            >
                              <div className="flex items-center overflow-hidden">
                                <Icon
                                  size={17}
                                  aria-hidden="true"
                                  className="shrink-0 text-[#94A3B8] group-hover:text-[#F8FAFC]"
                                />
                                <span
                                  className={`transition-all duration-200 whitespace-nowrap overflow-hidden ${
                                    isOpen
                                      ? "max-w-[150px] opacity-100 ms-3"
                                      : "max-w-0 opacity-0 ms-0"
                                  }`}
                                >
                                  {t(item.nameKey as any, {
                                    defaultValue: item.defaultName,
                                  })}
                                </span>
                              </div>
                              {isOpen && (
                                <ChevronRight
                                  size={14}
                                  className={`transition-transform duration-200 text-[#94A3B8] ${
                                    isExpanded ? "rotate-90" : "rtl:rotate-180"
                                  }`}
                                />
                              )}
                            </button>

                            {/* Dropdown Children */}
                            {isExpanded && isOpen && (
                              <div className="ms-5 space-y-1 border-s border-[#2A3039] ps-3 py-1">
                                {item.children!.map((child) => (
                                  <NavLink
                                    key={child.path}
                                    to={child.path}
                                    onClick={handleNavClick}
                                    className={({ isActive }) => `
                                      block rounded-[8px] px-3 py-2 text-xs transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5BE584]
                                      ${
                                        isActive
                                          ? "bg-[#5BE584]/10 text-[#5BE584] font-semibold"
                                          : "text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1B2028]"
                                      }
                                    `}
                                  >
                                    {t(child.nameKey as any, {
                                      defaultValue: child.defaultName,
                                    })}
                                  </NavLink>
                                ))}
                              </div>
                            )}
                          </>
                        ) : (
                          <NavLink
                            to={item.path!}
                            end={item.path === "/"}
                            onClick={handleNavClick}
                            className={({ isActive }) => `
                              group flex items-center justify-between rounded-[12px] text-sm transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5BE584]
                              ${isOpen ? "px-3 py-2.5" : "justify-center px-0 py-3"}
                              ${
                                isActive
                                  ? "bg-[#5BE584]/10 border border-[#5BE584]/25 text-[#5BE584]"
                                  : "border border-transparent text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1B2028]/60"
                              }
                            `}
                          >
                            {({ isActive }) => (
                              <>
                                <div className="flex items-center overflow-hidden">
                                  <Icon
                                    size={17}
                                    aria-hidden="true"
                                    className={`shrink-0 ${
                                      isActive
                                        ? "text-[#5BE584]"
                                        : "text-[#94A3B8] group-hover:text-[#F8FAFC]"
                                    }`}
                                  />
                                  <span
                                    className={`transition-all duration-200 whitespace-nowrap overflow-hidden ${
                                      isActive ? "font-semibold" : "font-medium"
                                    } ${isOpen ? "max-w-[150px] opacity-100 ms-3" : "max-w-0 opacity-0 ms-0"}`}
                                  >
                                    {t(item.nameKey as any, {
                                      defaultValue: item.defaultName,
                                    })}
                                  </span>
                                </div>
                                {item.badgeKey && (
                                  <span
                                    className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md border shrink-0 transition-all duration-200
                                    ${
                                      isActive
                                        ? "bg-[#5BE584]/15 text-[#5BE584] border-[#5BE584]/30"
                                        : "bg-[#090B0F] text-[#94A3B8] border-[#2A3039]"
                                    }
                                    ${isOpen ? "max-w-[44px] opacity-100" : "max-w-0 opacity-0 ms-0 px-0 border-0"}`}
                                  >
                                    {t(item.badgeKey as any, {
                                      defaultValue: "LIVE",
                                    })}
                                  </span>
                                )}
                              </>
                            )}
                          </NavLink>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </nav>

        {/* Logout Footer */}
        <div className="p-3 border-t border-[#2A3039] shrink-0 bg-[#13171D]">
          <button
            type="button"
            onClick={handleLogout}
            disabled={isPending}
            className={`
              group flex w-full cursor-pointer items-center rounded-[12px] text-sm transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EF4444] text-[#94A3B8] hover:bg-[#EF4444]/15 hover:text-[#EF4444]
              ${isOpen ? "px-3 py-2.5" : "justify-center px-0 py-3"}
            `}
          >
            <LogOut
              size={17}
              aria-hidden="true"
              className="shrink-0 text-[#94A3B8] transition-colors group-hover:text-[#EF4444]"
            />
            <span
              className={`font-medium transition-all duration-200 whitespace-nowrap overflow-hidden ${
                isOpen
                  ? "max-w-[150px] opacity-100 ms-3"
                  : "max-w-0 opacity-0 ms-0"
              }`}
            >
              {isPending
                ? t("nav.signingOut", "Signing out...")
                : t("nav.signOut", "Sign Out")}
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}
