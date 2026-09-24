// src/components/shared/header/Header.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import {
  Bell,
  Moon,
  Sun,
  User,
  Settings,
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
} from "lucide-react";

// Import real notification hooks and types
import { useNotifications } from "@/features/notifications/hooks/use-notifications";
import { useMarkNotificationRead } from "@/features/notifications/hooks/use-mark-notification-read";
import { useMarkAllNotificationsRead } from "@/features/notifications/hooks/use-mark-all-notifications-read";
import type { Notification } from "@/features/notifications/types/notifications.types";

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
      className="flex items-center text-[11px] font-medium text-gray-500"
    >
      <Link className="hover:text-gray-300 transition-colors" to="/">
        Dashboard
      </Link>
      {pathnames.map((value, index) => {
        const to = `/${pathnames.slice(0, index + 1).join("/")}`;
        const isLast = index === pathnames.length - 1;
        const title = value
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");

        return (
          <div key={to} className="flex items-center">
            <ChevronRight className="h-3 w-3 mx-1 text-gray-600" />
            {isLast ? (
              <span className="text-[#5BE584]">{title}</span>
            ) : (
              <Link className="hover:text-gray-300 transition-colors" to={to}>
                {title}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
};

const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(true);

  return (
    <button
      type="button"
      onClick={() => setIsDark(!isDark)}
      aria-label="Toggle Theme"
      className="flex h-9 w-9 items-center justify-center rounded-md border border-transparent text-gray-400 transition-all hover:bg-[#13171d] hover:text-gray-200 hover:border-[#1e2329] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5BE584]"
    >
      {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
    </button>
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
      return { icon: Dumbbell, color: "text-[#5BE584]", bg: "bg-green-500/10" };
    case "ASSIGNMENT":
    case "WORKOUT_ASSIGNED":
      return {
        icon: ClipboardList,
        color: "text-blue-400",
        bg: "bg-blue-400/10",
      };
    case "MEASUREMENT":
    case "BODY_MEASUREMENT_RECORDED":
      return { icon: Scale, color: "text-purple-400", bg: "bg-purple-400/10" };
    case "SYSTEM":
      return { icon: Info, color: "text-gray-400", bg: "bg-gray-500/10" };
    default:
      return { icon: Bell, color: "text-gray-400", bg: "bg-gray-500/10" };
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
        className="relative flex h-9 w-9 items-center justify-center rounded-md border border-transparent text-gray-400 transition-all hover:bg-[#13171d] hover:text-gray-200 hover:border-[#1e2329] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5BE584]"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#5BE584] ring-2 ring-[#090B0F]" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 origin-top-right rounded-xl border border-[#1e2329] bg-[#0d1014] shadow-2xl shadow-black/50 ring-1 ring-black/5 focus:outline-none animate-in fade-in slide-in-from-top-2 duration-200 z-50 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#1e2329] px-4 py-3 shrink-0">
            <h3 className="text-sm font-semibold text-gray-100 flex items-center gap-2">
              Notifications
              {unreadCount > 0 && (
                <span className="rounded-full bg-[#16291d] border border-[#23422e] px-1.5 py-0.5 text-[9px] font-bold text-[#5BE584]">
                  {unreadCount}
                </span>
              )}
            </h3>
            <button
              onClick={handleMarkAllRead}
              disabled={unreadCount === 0 || isMarkingAll}
              className="text-[11px] font-medium text-[#5BE584] hover:text-[#4ade80] transition-colors flex items-center gap-1 focus-visible:outline-none focus-visible:underline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircle2 className="h-3 w-3" /> Mark all read
            </button>
          </div>

          {/* List Area */}
          <div className="max-h-[320px] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {isLoading ? (
              <div className="p-4 flex flex-col gap-3 animate-pulse">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="h-8 w-8 rounded-full bg-[#1e2329] shrink-0" />
                    <div className="flex flex-col gap-1 w-full mt-1">
                      <div className="h-3 w-3/4 bg-[#1e2329] rounded" />
                      <div className="h-2 w-1/2 bg-[#13171d] rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : isError ? (
              <div className="p-6 text-center text-xs text-red-400 bg-red-500/5">
                Unable to load notifications.
              </div>
            ) : recentNotifications.length === 0 ? (
              <div className="p-8 flex flex-col items-center justify-center text-center">
                <Bell className="h-6 w-6 text-gray-600 mb-2" />
                <span className="text-sm font-medium text-gray-400">
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
                    className={`relative flex items-start gap-3 border-b border-[#1e2329]/50 p-4 transition-colors cursor-pointer ${
                      isUnread
                        ? "bg-[#13171d]/50 hover:bg-[#13171d]"
                        : "hover:bg-white/[0.02]"
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
                    <div className="flex flex-col gap-1 pr-2">
                      <p
                        className={`text-sm ${isUnread ? "font-semibold text-gray-100" : "font-medium text-gray-300"}`}
                      >
                        {notif.title}
                      </p>
                      <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                        {notif.message}
                      </p>
                      <span className="text-[10px] font-medium text-gray-600 mt-0.5">
                        {formatTimeAgo(notif.createdAt)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* View All */}
          <div className="p-2 border-t border-[#1e2329] shrink-0 bg-[#0d1014]">
            <button
              onClick={() => {
                navigate("/notifications");
                setIsOpen(false);
              }}
              className="w-full rounded-md py-2 text-xs font-medium text-gray-400 transition-colors hover:bg-[#13171d] hover:text-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5BE584]"
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

  useOnClickOutside(ref, () => setIsOpen(false));

  const actions = [
    {
      title: "Create Assignment",
      description: "Assign a workout to a member",
      icon: ClipboardPlus,
      path: "/assignments/create",
    },
    {
      title: "Create Workout",
      description: "Build a new workout",
      icon: Dumbbell,
      path: "/workouts/create",
    },
    {
      title: "View Members",
      description: "Manage gym members",
      icon: Users,
      path: "/members/all",
    },
  ];

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Quick Actions"
        aria-expanded={isOpen}
        className="relative flex h-9 w-9 items-center justify-center rounded-md border border-transparent text-gray-400 transition-all hover:bg-[#13171d] hover:text-gray-200 hover:border-[#1e2329] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5BE584]"
      >
        <Zap className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 origin-top-right rounded-xl border border-[#1e2329] bg-[#0d1014] shadow-2xl shadow-black/50 ring-1 ring-black/5 focus:outline-none animate-in fade-in slide-in-from-top-2 duration-200 z-50 flex flex-col overflow-hidden">
          <div className="flex items-center border-b border-[#1e2329] px-4 py-3 shrink-0">
            <h3 className="text-sm font-semibold text-gray-100 flex items-center gap-2">
              Quick Actions
            </h3>
          </div>

          <div className="p-2 flex flex-col gap-1">
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={() => {
                  navigate(action.path);
                  setIsOpen(false);
                }}
                className="group flex w-full items-start gap-3 rounded-md px-3 py-2.5 text-left transition-colors hover:bg-[#13171d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5BE584]"
              >
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-[#23422e] bg-[#16291d] text-[#5BE584] transition-colors group-hover:bg-[#5BE584] group-hover:text-[#090B0F]">
                  <action.icon className="h-4 w-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors">
                    {action.title}
                  </span>
                  <span className="text-[11px] text-gray-500">
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

  useOnClickOutside(ref, () => setIsOpen(false));

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className="flex items-center gap-3 rounded-md border border-transparent p-1 pl-2 transition-all hover:bg-[#13171d] hover:border-[#1e2329] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5BE584]"
      >
        <div className="hidden sm:flex flex-col items-end text-right">
          <span className="text-sm font-semibold text-gray-200 leading-none">
            Hosam
          </span>
          <span className="text-[10px] font-medium text-[#5BE584] mt-1 tracking-wide">
            Coach
          </span>
        </div>
        <div className="relative h-8 w-8 overflow-hidden rounded-md border border-[#1e2329] bg-[#16291d] flex items-center justify-center text-[#5BE584] shadow-sm">
          <span className="text-xs font-bold">HO</span>
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl border border-[#1e2329] bg-[#0d1014] shadow-2xl shadow-black/50 ring-1 ring-black/5 focus:outline-none animate-in fade-in slide-in-from-top-2 duration-200 z-50 overflow-hidden">
          <div className="border-b border-[#1e2329] px-4 py-3 sm:hidden">
            <p className="text-sm font-semibold text-gray-200">Hosam</p>
            <p className="text-xs font-medium text-[#5BE584]">Coach</p>
          </div>
          <div className="p-1.5">
            <button className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-sm font-medium text-gray-400 transition-colors hover:bg-white/[0.03] hover:text-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5BE584]">
              <User className="h-4 w-4 text-gray-500" />
              Profile
            </button>
            <button className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-sm font-medium text-gray-400 transition-colors hover:bg-white/[0.03] hover:text-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5BE584]">
              <Settings className="h-4 w-4 text-gray-500" />
              Settings
            </button>
          </div>
          <div className="border-t border-[#1e2329] p-1.5">
            <button className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-sm font-medium text-gray-400 transition-colors hover:bg-red-500/10 hover:text-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400">
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default function Header({ collapsed, onToggle }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 flex h-16 w-full shrink-0 items-center justify-between border-b border-[#1e2329] bg-[#090B0F]/90 px-4 md:px-6 backdrop-blur-md">
      <div className="flex items-center gap-4">
        <button
          onClick={onToggle}
          type="button"
          aria-label={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          className="flex h-9 w-9 items-center justify-center rounded-md border border-transparent text-gray-400 transition-all hover:bg-[#13171d] hover:text-gray-200 hover:border-[#1e2329] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5BE584]"
        >
          {collapsed ? (
            <PanelLeftOpen className="h-5 w-5 transition-transform" />
          ) : (
            <PanelLeftClose className="h-5 w-5 transition-transform" />
          )}
        </button>

        <div className="flex flex-col justify-center">
          <h1 className="text-xs font-bold uppercase tracking-wider text-gray-100 mb-0.5 flex items-center gap-2">
            GYM Management Platform
          </h1>
          <Breadcrumb />
        </div>
      </div>

      <div className="flex items-center gap-1 md:gap-2">
        <ThemeToggle />
        <NotificationMenu />
        <QuickActionsMenu />

        <div className="mx-1 h-5 w-px bg-[#1e2329] hidden sm:block" />

        <ProfileMenu />
      </div>
    </header>
  );
}
