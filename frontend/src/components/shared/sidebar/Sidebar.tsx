// src/components/shared/sidebar/Sidebar.tsx
"use client";

import { useState } from "react";
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
  Home,
  LayoutDashboard,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { useLogout } from "@/features/auth/hooks/useLogout";

export interface SidebarProps {
  collapsed: boolean;
  onCloseMobile?: () => void;
}

interface NavChild {
  name: string;
  path: string;
  roles?: string[];
}

interface NavItem {
  id: string;
  name: string;
  icon: LucideIcon;
  path?: string;
  badge?: string;
  roles?: string[];
  children?: NavChild[];
}

interface NavGroup {
  id: string;
  label?: string;
  roles?: string[];
  items: NavItem[];
}

// Master configuration of navigation
const navGroups: NavGroup[] = [
  {
    id: "main",
    items: [
      { id: "home", name: "Overview", icon: Home, path: "/home" },
      {
        id: "dashboard",
        name: "Dashboard",
        icon: LayoutGrid,
        path: "/dashboard",
        badge: "LIVE",
      },
      {
        id: "coach-dashboard",
        name: "Coach Dashboard",
        icon: LayoutDashboard,
        path: "/coach-dashboard",
        roles: ["TRAINER", "ADMIN"],
      },
    ],
  },
  {
    id: "members-group",
    label: "ROSTER",
    roles: ["TRAINER", "ADMIN"],
    items: [
      {
        id: "members-management",
        name: "Members Management",
        icon: Users,
        path: "/members",
      },
    ],
  },
  {
    id: "workouts-group",
    label: "TRAINING",
    items: [
      {
        id: "workout-builder",
        name: "Workouts",
        icon: DumbbellIcon,
        children: [
          { name: "All Workouts", path: "/workout-builder/all" },
          {
            name: "Create Workout",
            path: "/workout-builder/new",
            roles: ["TRAINER", "ADMIN"],
          },
        ],
      },
      {
        id: "workout-library",
        name: "Exercise Library",
        icon: BookOpen,
        children: [
          { name: "All Exercises", path: "/workout-library/exercises" },
          {
            name: "Create Exercise",
            path: "/workout-library/exercises/new",
            roles: ["TRAINER", "ADMIN"],
          },
        ],
      },
      {
        id: "assignments",
        name: "Assignments",
        icon: ClipboardList,
        children: [
          { name: "All Assignments", path: "/assignments/all" },
          {
            name: "Create Assignment",
            path: "/assignments/new",
            roles: ["TRAINER", "ADMIN"],
          },
        ],
      },
      {
        id: "sessions",
        name: "Workout Sessions",
        icon: Flame,
        path: "/sessions",
      },
    ],
  },
  {
    id: "account-group",
    label: "ACCOUNT",
    items: [
      {
        id: "profile",
        name: "Profile",
        icon: UserCircle,
        path: "/profile",
      },
      {
        id: "notifications",
        name: "Notifications",
        icon: Bell,
        path: "/notifications",
      },
    ],
  },
];

export default function Sidebar({ collapsed, onCloseMobile }: SidebarProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({
    "workout-builder": true,
    assignments: true,
  });

  const { mutate: logoutUser, isPending } = useLogout();

  const handleLogout = () => {
    logoutUser();
  };

  const { data: user } = useCurrentUser();
  const userRole = user?.role?.toUpperCase() || "MEMBER";

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

  // Filter groups, items, and children dynamically based on role
  const filteredNavGroups = navGroups
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
    .filter((group) => group.items.length > 0);

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {!collapsed && (
        <div
          onClick={onCloseMobile}
          aria-hidden="true"
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-xs lg:hidden"
        />
      )}

      <aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          fixed inset-y-0 left-0 z-50 flex h-screen flex-col border-r border-[#2A3039] bg-[#13171D]
          transition-all duration-200 ease-in-out shrink-0 select-none
          lg:static lg:z-30
          ${collapsed ? "-translate-x-full lg:translate-x-0" : "translate-x-0"}
          ${isOpen ? "w-[264px]" : "lg:w-20"}
        `}
        aria-label="Main Navigation"
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-[#2A3039] px-5 shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] bg-[#5BE584] text-[#090B0F]">
              <Dumbbell className="h-4 w-4" aria-hidden="true" />
            </div>

            <div
              className={`flex items-center gap-2 transition-all duration-200 overflow-hidden whitespace-nowrap ${
                isOpen ? "max-w-[180px] opacity-100" : "max-w-0 opacity-0"
              }`}
            >
              <span className="text-base font-bold tracking-tight text-[#F8FAFC]">
                STREN
              </span>
              <span className="rounded-md border border-[#5BE584]/30 bg-[#5BE584]/10 px-1.5 py-0.5 text-[10px] font-semibold text-[#5BE584]">
                {userRole === "TRAINER"
                  ? "COACH"
                  : userRole === "ADMIN"
                    ? "ADMIN"
                    : "ATHLETE"}
              </span>
            </div>
          </div>

          {/* Mobile Close Button */}
          {!collapsed && (
            <button
              type="button"
              onClick={onCloseMobile}
              aria-label="Close navigation menu"
              className="flex lg:hidden h-8 w-8 items-center justify-center rounded-[10px] text-[#94A3B8] hover:bg-[#1B2028] hover:text-[#F8FAFC]"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Nav List */}
        <nav
          className="flex-1 overflow-y-auto px-3 py-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          aria-label="Sidebar Menu"
        >
          {filteredNavGroups.map((group, groupIdx) => (
            <div key={group.id} className={groupIdx > 0 ? "mt-5" : ""}>
              {group.label && isOpen && (
                <div className="flex items-center mb-2 px-3">
                  <h3 className="text-[11px] font-semibold tracking-wider text-[#94A3B8] uppercase">
                    {group.label}
                  </h3>
                </div>
              )}

              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isExpanded = !!expandedSections[item.id];
                  const isContentOpen = isExpanded && isOpen;

                  return (
                    <div key={item.id}>
                      {item.children && item.children.length > 0 ? (
                        <div>
                          <button
                            type="button"
                            onClick={() => toggleSection(item.id)}
                            aria-expanded={isContentOpen}
                            aria-controls={`accordion-content-${item.id}`}
                            className={`
                              group w-full flex items-center justify-between rounded-[12px] text-sm transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5BE584]
                              ${isOpen ? "px-3 py-2.5" : "justify-center px-0 py-3"}
                              ${
                                isContentOpen
                                  ? "text-[#F8FAFC] bg-[#1B2028]"
                                  : "text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1B2028]/60"
                              }
                            `}
                          >
                            <div className="flex items-center overflow-hidden">
                              <Icon
                                size={17}
                                aria-hidden="true"
                                className={`shrink-0 ${
                                  isContentOpen
                                    ? "text-[#5BE584]"
                                    : "text-[#94A3B8] group-hover:text-[#F8FAFC]"
                                }`}
                              />
                              <span
                                className={`font-medium transition-all duration-200 whitespace-nowrap overflow-hidden ${
                                  isOpen
                                    ? "max-w-[150px] opacity-100 ml-3"
                                    : "max-w-0 opacity-0 ml-0"
                                }`}
                              >
                                {item.name}
                              </span>
                            </div>
                            <ChevronRight
                              size={14}
                              aria-hidden="true"
                              className={`shrink-0 text-[#94A3B8] transition-transform duration-200 
                                ${isExpanded ? "rotate-90" : ""} 
                                ${isOpen ? "max-w-[20px] opacity-100 ml-2" : "max-w-0 opacity-0 ml-0"}
                              `}
                            />
                          </button>

                          <div
                            id={`accordion-content-${item.id}`}
                            className={`grid transition-all duration-200 ease-in-out ${
                              isContentOpen
                                ? "grid-rows-[1fr] opacity-100"
                                : "grid-rows-[0fr] opacity-0"
                            }`}
                          >
                            <div className="overflow-hidden">
                              <div className="py-1 space-y-0.5">
                                {item.children.map((child, idx) => (
                                  <NavLink
                                    key={idx}
                                    to={child.path}
                                    onClick={handleNavClick}
                                    className={({ isActive }) => `
                                      flex items-center gap-3 pl-9 pr-3 py-2 rounded-[10px] text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5BE584]
                                      ${
                                        isActive
                                          ? "text-[#5BE584] font-semibold bg-[#5BE584]/10 border border-[#5BE584]/25"
                                          : "text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1B2028]/60 border border-transparent"
                                      }
                                    `}
                                  >
                                    {({ isActive }) => (
                                      <>
                                        <div
                                          aria-hidden="true"
                                          className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                            isActive
                                              ? "bg-[#5BE584]"
                                              : "bg-[#2A3039]"
                                          }`}
                                        />
                                        <span className="whitespace-nowrap overflow-hidden text-ellipsis">
                                          {child.name}
                                        </span>
                                      </>
                                    )}
                                  </NavLink>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
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
                                  } ${isOpen ? "max-w-[150px] opacity-100 ml-3" : "max-w-0 opacity-0 ml-0"}`}
                                >
                                  {item.name}
                                </span>
                              </div>
                              {item.badge && (
                                <span
                                  className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md border shrink-0 transition-all duration-200
                                  ${
                                    isActive
                                      ? "bg-[#5BE584]/15 text-[#5BE584] border-[#5BE584]/30"
                                      : "bg-[#090B0F] text-[#94A3B8] border-[#2A3039]"
                                  }
                                  ${isOpen ? "max-w-[44px] opacity-100" : "max-w-0 opacity-0 ml-0 px-0 border-0"}`}
                                >
                                  {item.badge}
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
          ))}
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
                  ? "max-w-[150px] opacity-100 ml-3"
                  : "max-w-0 opacity-0 ml-0"
              }`}
            >
              Sign Out
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}
