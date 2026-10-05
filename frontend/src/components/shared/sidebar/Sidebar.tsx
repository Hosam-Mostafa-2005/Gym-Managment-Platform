// src/components/shared/sidebar/Sidebar.tsx
"use client";

import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
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
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { useLogout } from "@/features/auth/hooks/useLogout";

export interface SidebarProps {
  collapsed: boolean;
}

interface NavChild {
  name: string;
  path: string;
}

interface NavItem {
  id: string;
  name: string;
  icon: LucideIcon;
  path?: string;
  badge?: string;
  children?: NavChild[];
}

interface NavGroup {
  id: string;
  label?: string;
  roles?: string[]; // Role-based access control array
  items: NavItem[];
}

// Master configuration of navigation
const navGroups: NavGroup[] = [
  {
    id: "main",
    items: [
      { id: "home", name: "Home", icon: Home, path: "/" },
      {
        id: "dashboard",
        name: "Dashboard",
        icon: LayoutGrid,
        path: "/dashboard",
        badge: "LIVE",
      },
    ],
  },
  {
    id: "members-group",
    label: "MEMBERS",
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
    label: "WORKOUTS",
    items: [
      {
        id: "workout-builder",
        name: "Workout Builder",
        icon: DumbbellIcon,
        children: [
          { name: "All Workouts", path: "/workout-builder/all" },
          { name: "Create Workout", path: "/workout-builder/new" },
        ],
      },
      {
        id: "workout-library",
        name: "Workout Library",
        icon: BookOpen,
        children: [
          { name: "All Exercises", path: "/workout-library/exercises" },
          { name: "Create Exercise", path: "/workout-library/exercises/new" },
        ],
      },
    ],
  },
  {
    id: "assignments-group",
    label: "ASSIGNMENTS",
    items: [
      {
        id: "assignments",
        name: "Assignments",
        icon: ClipboardList,
        children: [
          { name: "All Assignments", path: "/assignments/all" },
          { name: "Create Assignment", path: "/assignments/new" },
        ],
      },
    ],
  },
  {
    id: "sessions-group",
    label: "SESSIONS",
    items: [
      {
        id: "sessions",
        name: "Workout Sessions",
        icon: Flame,
        path: "/sessions",
      },
    ],
  },
  {
    id: "coach-group",
    label: "COACH",
    // Only users with these roles will see this section in the sidebar
    roles: ["TRAINER", "ADMIN"],
    items: [
      {
        id: "coach-dashboard",
        name: "Coach Dashboard",
        icon: LayoutDashboard,
        path: "/coach-dashboard",
      },
      {
        id: "profile",
        name: "Coach Profile",
        icon: UserCircle,
        path: "/profile",
      },
    ],
  },
  {
    id: "system-group",
    label: "SYSTEM",
    items: [
      {
        id: "notifications",
        name: "Notifications",
        icon: Bell,
        path: "/notifications",
      },
    ],
  },
];

// Helper to format the role nicely
const formatRole = (role?: string) => {
  if (!role) return "Member";
  return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
};

export default function Sidebar({ collapsed }: SidebarProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({});

  const { mutate: logoutUser, isPending } = useLogout();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser(undefined, {
      onSuccess: () => {
        navigate("/login");
      },
    });
  };

  // Use the existing auth system to determine user data and roles
  const { data: user } = useCurrentUser();
  const userRole = user?.role?.toUpperCase() || "MEMBER";

  // Calculate open state
  const isOpen = !collapsed || isHovered;

  const toggleSection = (id: string) => {
    if (!isOpen) return;
    setExpandedSections((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Filter groups dynamically based on role
  const filteredNavGroups = navGroups.filter((group) => {
    if (!group.roles) return true;
    return group.roles.includes(userRole);
  });

  return (
    <aside
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        sticky top-0 flex h-screen flex-col border-r border-[#1e2329] bg-[#0d1014]
        transition-[width] duration-300 ease-in-out z-30 shrink-0 select-none
        ${isOpen ? "w-[280px]" : "w-20"}
      `}
      aria-label="Main Navigation"
    >
      {/* User Identity Header */}
      <div className="flex h-20 items-center px-5 shrink-0 mb-1">
        <div className="flex items-center gap-3.5 overflow-hidden w-full">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#23422e] bg-[#16291d] text-[#5BE584] shadow-[0_0_15px_rgba(91,229,132,0.1)] transition-transform duration-300 hover:scale-105">
            <Dumbbell className="h-4 w-4" aria-hidden="true" />
          </div>

          <div
            className={`flex flex-col transition-all duration-300 overflow-hidden whitespace-nowrap ${
              isOpen ? "max-w-[200px] opacity-100" : "max-w-0 opacity-0"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold tracking-wide text-gray-100 truncate max-w-[130px]">
                STREN
              </span>
              <span className="flex items-center justify-center text-[9px] font-mono font-medium px-1.5 py-0.5 rounded bg-[#16291d] text-[#5BE584] border border-[#23422e]">
                OS V.2
              </span>
            </div>
            {/* <div className="flex items-center gap-1.5 mt-0.5">
              <span
                className="flex h-1.5 w-1.5 rounded-full bg-[#5BE584] animate-pulse shrink-0"
                aria-hidden="true"
              />
              <span className="text-[9px] font-medium tracking-widest text-gray-400"></span>
            </div> */}
          </div>
        </div>
      </div>

      {/* Nav List */}
      <nav
        className="flex-1 overflow-y-auto px-3 pb-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        aria-label="Sidebar Menu"
      >
        {filteredNavGroups.map((group, groupIdx) => (
          <div key={group.id} className={groupIdx > 0 ? "mt-5" : ""}>
            {group.label && isOpen && (
              <div className="flex items-center mb-2 px-3 opacity-80">
                <h3 className="text-[10px] font-semibold tracking-widest text-gray-500 uppercase">
                  {group.label}
                </h3>
              </div>
            )}

            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isExpanded = !!expandedSections[item.id];
                const isContentOpen = isExpanded && isOpen;

                return (
                  <div key={item.id}>
                    {item.children ? (
                      <div>
                        <button
                          type="button"
                          onClick={() => toggleSection(item.id)}
                          aria-expanded={isContentOpen}
                          aria-controls={`accordion-content-${item.id}`}
                          className={`
                            group w-full flex items-center justify-between rounded-md text-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5BE584]
                            ${isOpen ? "px-3 py-2" : "justify-center px-0 py-3"}
                            ${
                              isContentOpen
                                ? "text-gray-200 bg-white/[0.02]"
                                : "text-[#8b95a1] hover:text-gray-200 hover:bg-white/[0.02]"
                            }
                          `}
                        >
                          <div className="flex items-center overflow-hidden">
                            <Icon
                              size={16}
                              aria-hidden="true"
                              className={`shrink-0 ${
                                isContentOpen
                                  ? "text-gray-300"
                                  : "text-gray-500 group-hover:text-gray-300"
                              }`}
                            />
                            <span
                              className={`font-medium transition-all duration-300 whitespace-nowrap overflow-hidden ${
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
                            className={`shrink-0 text-gray-500 transition-all duration-300 ease-in-out 
                              ${isExpanded ? "rotate-90" : ""} 
                              ${isOpen ? "max-w-[20px] opacity-100 ml-2" : "max-w-0 opacity-0 ml-0"}
                            `}
                          />
                        </button>

                        <div
                          id={`accordion-content-${item.id}`}
                          className={`grid transition-all duration-300 ease-in-out ${
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
                                  className={({ isActive }) => `
                                    flex items-center gap-3 pl-10 pr-3 py-1.5 rounded-md text-[13px] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5BE584]
                                    ${
                                      isActive
                                        ? "text-[#5BE584] font-medium bg-[#101b14] border border-[#1e3023]"
                                        : "text-gray-400 hover:text-gray-200 hover:bg-white/[0.02] border border-transparent"
                                    }
                                  `}
                                >
                                  {({ isActive }) => (
                                    <>
                                      <div
                                        aria-hidden="true"
                                        className={`w-1 h-1 rounded-full shrink-0 transition-colors ${
                                          isActive
                                            ? "bg-[#5BE584] shadow-[0_0_8px_rgba(91,229,132,0.8)]"
                                            : "bg-gray-600"
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
                        className={({ isActive }) => `
                          group flex items-center justify-between rounded-md text-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5BE584]
                          ${isOpen ? "px-3 py-2" : "justify-center px-0 py-3"}
                          ${
                            isActive
                              ? "bg-[#101b14] border border-[#1e3023] text-[#5BE584]"
                              : "border border-transparent text-[#8b95a1] hover:text-gray-200 hover:bg-white/[0.02]"
                          }
                        `}
                      >
                        {({ isActive }) => (
                          <>
                            <div className="flex items-center overflow-hidden">
                              <Icon
                                size={16}
                                aria-hidden="true"
                                className={`shrink-0 ${
                                  isActive
                                    ? "text-[#5BE584]"
                                    : "text-gray-500 group-hover:text-gray-300"
                                }`}
                              />
                              <span
                                className={`transition-all duration-300 whitespace-nowrap overflow-hidden ${
                                  isActive ? "font-semibold" : "font-medium"
                                } ${isOpen ? "max-w-[150px] opacity-100 ml-3" : "max-w-0 opacity-0 ml-0"}`}
                              >
                                {item.name}
                              </span>
                            </div>
                            {item.badge && (
                              <span
                                className={`text-[9px] font-mono px-1.5 py-0.5 rounded border shrink-0 transition-all duration-300
                                ${
                                  isActive
                                    ? "bg-[#16291d] text-[#5BE584] border-[#23422e]"
                                    : "bg-gray-800 text-gray-400 border-gray-700"
                                }
                                ${isOpen ? "max-w-[40px] opacity-100" : "max-w-0 opacity-0 ml-0 px-0 border-0"}`}
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
      <div className="p-4 border-t border-[#1e2329] shrink-0 bg-[#0d1014]">
        <button
          type="button"
          onClick={handleLogout}
          disabled={isPending}
          className={`
            group flex w-full items-center rounded-md text-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 text-[#8b95a1] hover:bg-red-500/10 hover:text-red-400
            ${isOpen ? "px-3 py-2" : "justify-center px-0 py-3"}
          `}
        >
          <LogOut
            size={16}
            aria-hidden="true"
            className="shrink-0 text-gray-500 transition-colors group-hover:text-red-400"
          />
          <span
            className={`font-medium transition-all duration-300 whitespace-nowrap overflow-hidden ${
              isOpen
                ? "max-w-[150px] opacity-100 ml-3"
                : "max-w-0 opacity-0 ml-0"
            }`}
          >
            Logout
          </span>
        </button>
      </div>
    </aside>
  );
}
