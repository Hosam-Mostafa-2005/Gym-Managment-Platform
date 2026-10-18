// src/components/shared/header/Header.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import {
  Bell,
  User,
  LogOut,
  ChevronRight,
  CheckCircle2,
  PanelLeftClose,
  PanelLeftOpen,
  Dumbbell,
  ClipboardList,
  Scale,
  Info,
  ClipboardPlus,
  Users,
  Zap,
  Flame,
  BookOpen,
} from "lucide-react";

import { useLogout } from "@/features/auth/hooks/useLogout";
import { useNotifications } from "@/features/notifications/hooks/use-notifications";
import { useMarkNotificationRead } from "@/features/notifications/hooks/use-mark-notification-read";
import { useMarkAllNotificationsRead } from "@/features/notifications/hooks/use-mark-all-notifications-read";
import type { Notification } from "@/features/notifications/types/notifications.types";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";

export interface HeaderProps {
  collapsed: boolean;
  onToggle: () => void;
}

function useOnClickOutside<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
  handler: (event: MouseEvent | TouchEvent) => void,
) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler(event);
    };
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
}

const Breadcrumb = () => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter(Boolean);

  if (pathnames.length === 0) {
    return (
      <div className="flex items-center text-[11px] font-medium text-[#5BE584]">
        <span>Dashboard</span>
      </div>
    );
  }

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center text-[11px] font-medium text-[#94A3B8] overflow-hidden"
    >
      <Link
        className="hover:text-[#F8FAFC] transition-colors shrink-0"
        to="/dashboard"
      >
        Workspace
      </Link>
      {pathnames.map((value, index) => {
        const to = `/${pathnames.slice(0, index + 1).join("/")}`;
        const isLast = index === pathnames.length - 1;
        const title =
          value.length > 20
            ? "Details"
            : value
                .split("-")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ");

        return (
          <div key={to} className="flex items-center min-w-0">
            <ChevronRight className="h-3 w-3 mx-1 text-[#2A3039] shrink-0" />
            {isLast ? (
              <span className="truncate text-[#5BE584] font-semibold">
                {title}
              </span>
            ) : (
              <Link
                className="truncate hover:text-[#F8FAFC] transition-colors"
                to={to}
              >
                {title}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
};

// Helper for relative timestamps
const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
};

// Helper to map notification type to an icon and color
const getNotificationStyles = (type: string) => {
  switch (type?.toUpperCase()) {
    case "WORKOUT":
    case "SESSION":
    case "WORKOUT_COMPLETED":
      return {
        icon: Dumbbell,
        color: "text-[#5BE584]",
        bg: "bg-[#5BE584]/15",
      };
    case "ASSIGNMENT":
    case "WORKOUT_ASSIGNED":
      return {
        icon: ClipboardList,
        color: "text-[#5BE584]",
        bg: "bg-[#5BE584]/15",
      };
    case "MEASUREMENT":
    case "BODY_MEASUREMENT_RECORDED":
      return { icon: Scale, color: "text-[#F59E0B]", bg: "bg-[#F59E0B]/15" };
    case "SYSTEM":
      return { icon: Info, color: "text-[#94A3B8]", bg: "bg-[#1B2028]" };
    default:
      return { icon: Bell, color: "text-[#94A3B8]", bg: "bg-[#1B2028]" };
  }
};

const NotificationMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useOnClickOutside(ref, () => setIsOpen(false));

  const { data, isLoading, isError } = useNotifications();
  const { mutate: markAsRead } = useMarkNotificationRead();
  const { mutate: markAllRead, isPending: isMarkingAll } =
    useMarkAllNotificationsRead();

  const notifications = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;
  const recentNotifications = notifications.slice(0, 5);

  const handleNotificationClick = (notification: Notification) => {
    const isUnread = !notification.readAt;

    if (isUnread) {
      markAsRead(notification.id);
    }
    if (notification.actionUrl) {
      navigate(notification.actionUrl.replace(window.location.origin, ""));
      setIsOpen(false);
    }
  };

  const handleMarkAllRead = () => {
    if (unreadCount > 0 && !isMarkingAll) {
      markAllRead();
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
        aria-expanded={isOpen}
        className="relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-[12px] border border-transparent text-[#94A3B8] transition-colors hover:bg-[#13171D] hover:text-[#F8FAFC] hover:border-[#2A3039] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5BE584]"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#5BE584] ring-2 ring-[#090B0F]" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] max-w-80 origin-top-right rounded-[20px] border border-[#2A3039] bg-[#13171D] shadow-[0_12px_40px_rgba(0,0,0,0.35)] focus:outline-none z-50 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#2A3039] px-4 py-3 shrink-0">
            <h3 className="text-sm font-semibold text-[#F8FAFC] flex items-center gap-2">
              Notifications
              {unreadCount > 0 && (
                <span className="rounded-full bg-[#5BE584]/15 border border-[#5BE584]/30 px-2 py-0.5 text-[10px] font-bold text-[#5BE584]">
                  {unreadCount}
                </span>
              )}
            </h3>
            <button
              type="button"
              onClick={handleMarkAllRead}
              disabled={unreadCount === 0 || isMarkingAll}
              className="cursor-pointer text-xs font-medium text-[#5BE584] hover:text-[#49D472] transition-colors flex items-center gap-1 focus-visible:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircle2 className="h-3.5 w-3.5" /> Mark all read
            </button>
          </div>

          {/* List Area */}
          <div className="max-h-[320px] overflow-y-auto">
            {isLoading ? (
              <div className="p-4 flex flex-col gap-3 animate-pulse">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="h-8 w-8 rounded-full bg-[#1B2028] shrink-0" />
                    <div className="flex flex-col gap-1.5 w-full mt-1">
                      <div className="h-3 w-3/4 bg-[#1B2028] rounded" />
                      <div className="h-2.5 w-1/2 bg-[#090B0F] rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : isError ? (
              <div className="p-6 text-center text-xs text-[#EF4444] bg-[#EF4444]/10">
                Unable to load notifications.
              </div>
            ) : recentNotifications.length === 0 ? (
              <div className="p-8 flex flex-col items-center justify-center text-center">
                <Bell className="h-6 w-6 text-[#94A3B8] mb-2" />
                <span className="text-sm font-medium text-[#94A3B8]">
                  No notifications yet
                </span>
              </div>
            ) : (
              recentNotifications.map((notif) => {
                const isUnread = !notif.readAt;
                const {
                  icon: Icon,
                  color,
                  bg,
                } = getNotificationStyles(notif.type);

                return (
                  <div
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`relative flex items-start gap-3 border-b border-[#2A3039] p-4 transition-colors cursor-pointer ${
                      isUnread
                        ? "bg-[#1B2028]/50 hover:bg-[#1B2028]"
                        : "hover:bg-[#1B2028]/40"
                    }`}
                  >
                    {isUnread && (
                      <div className="absolute left-0 top-0 h-full w-0.5 bg-[#5BE584]" />
                    )}
                    <div
                      className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${bg} ${color}`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col gap-1 pr-2 min-w-0">
                      <p
                        className={`text-sm ${
                          isUnread
                            ? "font-semibold text-[#F8FAFC]"
                            : "font-medium text-[#F8FAFC]/80"
                        }`}
                      >
                        {notif.title}
                      </p>
                      <p className="text-xs text-[#94A3B8] line-clamp-2 leading-relaxed">
                        {notif.message}
                      </p>
                      <span className="text-[11px] font-medium text-[#94A3B8]/70 mt-0.5">
                        {formatTimeAgo(notif.createdAt)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* View All */}
          <div className="p-2 border-t border-[#2A3039] shrink-0 bg-[#090B0F]">
            <button
              type="button"
              onClick={() => {
                navigate("/notifications");
                setIsOpen(false);
              }}
              className="w-full cursor-pointer rounded-[12px] py-2 text-xs font-semibold text-[#94A3B8] transition-colors hover:bg-[#13171D] hover:text-[#F8FAFC]"
            >
              View All Notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const QuickActionsMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { data: user } = useCurrentUser();
  const userRole = user?.role?.toUpperCase() || "MEMBER";
  const isCoachOrAdmin = userRole === "TRAINER" || userRole === "ADMIN";

  useOnClickOutside(ref, () => setIsOpen(false));

  const actions = isCoachOrAdmin
    ? [
        {
          title: "Create Assignment",
          description: "Assign a workout plan to a member",
          icon: ClipboardPlus,
          path: "/assignments/new",
        },
        {
          title: "Create Workout",
          description: "Build a new workout template",
          icon: Dumbbell,
          path: "/workout-builder/new",
        },
        {
          title: "Manage Members",
          description: "View assigned member roster",
          icon: Users,
          path: "/members",
        },
      ]
    : [
        {
          title: "Workout Sessions",
          description: "Start or review your training logs",
          icon: Flame,
          path: "/sessions",
        },
        {
          title: "My Assignments",
          description: "View workouts assigned by your coach",
          icon: ClipboardList,
          path: "/assignments/all",
        },
        {
          title: "Exercise Library",
          description: "Browse exercises and instructions",
          icon: BookOpen,
          path: "/workout-library/exercises",
        },
      ];

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Quick Actions"
        aria-expanded={isOpen}
        className="relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-[12px] border border-transparent text-[#94A3B8] transition-colors hover:bg-[#13171D] hover:text-[#F8FAFC] hover:border-[#2A3039] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5BE584]"
      >
        <Zap className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 origin-top-right rounded-[20px] border border-[#2A3039] bg-[#13171D] shadow-[0_12px_40px_rgba(0,0,0,0.35)] focus:outline-none z-50 flex flex-col overflow-hidden">
          <div className="flex items-center border-b border-[#2A3039] px-4 py-3 shrink-0">
            <h3 className="text-sm font-semibold text-[#F8FAFC]">
              Quick Actions
            </h3>
          </div>

          <div className="p-2 flex flex-col gap-1">
            {actions.map((action, index) => (
              <button
                key={index}
                type="button"
                onClick={() => {
                  navigate(action.path);
                  setIsOpen(false);
                }}
                className="group flex w-full cursor-pointer items-start gap-3 rounded-[12px] px-3 py-2.5 text-left transition-colors hover:bg-[#1B2028]"
              >
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] border border-[#2A3039] bg-[#090B0F] text-[#5BE584] transition-colors group-hover:bg-[#5BE584] group-hover:text-[#090B0F]">
                  <action.icon className="h-4 w-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-[#F8FAFC]">
                    {action.title}
                  </span>
                  <span className="text-xs text-[#94A3B8]">
                    {action.description}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const ProfileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const { mutate: logoutUser, isPending } = useLogout();
  const { data: user, isLoading } = useCurrentUser();

  useOnClickOutside(ref, () => setIsOpen(false));

  const handleLogout = () => {
    setIsOpen(false);
    logoutUser();
  };

  const getRoleLabel = (role?: string) => {
    switch (role?.toUpperCase()) {
      case "TRAINER":
        return "Coach";
      case "MEMBER":
        return "Member";
      case "ADMIN":
        return "Admin";
      default:
        return "User";
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return "U";

    return name
      .trim()
      .split(/\s+/)
      .map((word) => word[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const displayName = isLoading ? "Loading..." : user?.name || "User";
  const roleLabel = getRoleLabel(user?.role);
  const initials = getInitials(user?.name);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className="flex cursor-pointer items-center gap-3 rounded-[12px] border border-transparent p-1 pl-2 transition-colors hover:bg-[#13171D] hover:border-[#2A3039] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5BE584]"
      >
        <div className="hidden sm:flex flex-col items-end text-right">
          <span className="text-sm font-semibold text-[#F8FAFC] leading-none">
            {displayName}
          </span>

          <span className="text-[11px] font-medium text-[#5BE584] mt-1">
            {roleLabel}
          </span>
        </div>

        <div className="relative h-8 w-8 overflow-hidden rounded-[10px] border border-[#2A3039] bg-[#13171D] flex items-center justify-center text-[#5BE584]">
          <span className="text-xs font-bold">{initials}</span>
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-[20px] border border-[#2A3039] bg-[#13171D] shadow-[0_12px_40px_rgba(0,0,0,0.35)] focus:outline-none z-50 overflow-hidden">
          <div className="border-b border-[#2A3039] px-4 py-3">
            <p className="truncate text-sm font-semibold text-[#F8FAFC]">
              {displayName}
            </p>
            <p className="truncate text-xs text-[#94A3B8]">
              {user?.email || roleLabel}
            </p>
          </div>

          <div className="p-1.5">
            <button
              type="button"
              onClick={() => {
                navigate("/profile");
                setIsOpen(false);
              }}
              className="flex w-full cursor-pointer items-center gap-2.5 rounded-[10px] px-3 py-2 text-sm font-medium text-[#F8FAFC] transition-colors hover:bg-[#1B2028]"
            >
              <User className="h-4 w-4 text-[#94A3B8]" />
              Profile & Settings
            </button>
          </div>

          <div className="border-t border-[#2A3039] p-1.5">
            <button
              type="button"
              onClick={handleLogout}
              disabled={isPending}
              className="flex w-full cursor-pointer items-center gap-2.5 rounded-[10px] px-3 py-2 text-sm font-medium text-[#EF4444] transition-colors hover:bg-[#EF4444]/15"
            >
              <LogOut className="h-4 w-4" />
              {isPending ? "Signing out..." : "Sign Out"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default function Header({ collapsed, onToggle }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full shrink-0 items-center justify-between border-b border-[#2A3039] bg-[#090B0F]/95 px-4 sm:px-6 backdrop-blur-md">
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        <button
          onClick={onToggle}
          type="button"
          aria-label={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-[12px] border border-[#2A3039] bg-[#13171D] text-[#94A3B8] transition-colors hover:bg-[#1B2028] hover:text-[#F8FAFC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5BE584]"
        >
          {collapsed ? (
            <PanelLeftOpen className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </button>

        <div className="flex flex-col justify-center min-w-0">
          <h1 className="truncate text-xs font-bold uppercase tracking-wider text-[#F8FAFC] mb-0.5">
            STREN Workspace
          </h1>
          <Breadcrumb />
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        <NotificationMenu />
        <QuickActionsMenu />

        <div className="mx-1 h-5 w-px bg-[#2A3039] hidden sm:block" />

        <ProfileMenu />
      </div>
    </header>
  );
}
