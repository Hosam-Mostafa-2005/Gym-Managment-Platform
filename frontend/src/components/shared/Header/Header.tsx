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
  Trophy,
  Sparkles,
  Calendar,
  Utensils,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import { useLogout } from "@/features/auth/hooks/useLogout";
import { useNotifications } from "@/features/notifications/hooks/use-notifications";
import { useMarkNotificationRead } from "@/features/notifications/hooks/use-mark-notification-read";
import { useMarkAllNotificationsRead } from "@/features/notifications/hooks/use-mark-all-notifications-read";
import type { Notification } from "@/features/notifications/types/notifications.types";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher/LanguageSwitcher";
import {
  localizeNotification,
  formatNotificationTimeAgo,
} from "@/features/notifications/utils/notification-localization";

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
  const { t } = useTranslation(["common"]);
  const { isCoachOrAdmin } = useAuth();
  const homePath = isCoachOrAdmin ? "/coach-dashboard" : "/dashboard";
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter(Boolean);

  if (pathnames.length === 0) {
    return (
      <div className="flex items-center text-[11px] font-medium text-[#5BE584]">
        <span>{t("header.dashboardBreadcrumb", "Dashboard")}</span>
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
        to={homePath}
      >
        {t("header.workspaceBreadcrumb", "Workspace")}
      </Link>
      {pathnames.map((value, index) => {
        const to = `/${pathnames.slice(0, index + 1).join("/")}`;
        const isLast = index === pathnames.length - 1;
        const title =
          value.length > 20
            ? t("header.detailsBreadcrumb", "Details")
            : value
                .split("-")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ");

        return (
          <div key={to} className="flex items-center min-w-0">
            <ChevronRight className="h-3 w-3 mx-1 text-[#2A3039] shrink-0 rtl:rotate-180" />
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

// Helper to map notification type to an icon and color
const getNotificationStyles = (type: string, category?: string) => {
  const normType = type?.toUpperCase() || "";
  const normCat = category?.toUpperCase() || "";

  if (normType.includes("ACHIEVEMENT") || normCat === "ACHIEVEMENT") {
    return { icon: Trophy, color: "text-yellow-400", bg: "bg-yellow-500/15" };
  }
  if (normType.includes("STREAK")) {
    return { icon: Flame, color: "text-orange-400", bg: "bg-orange-500/15" };
  }
  if (normType.includes("ENCOURAGEMENT")) {
    return { icon: Sparkles, color: "text-yellow-400", bg: "bg-yellow-500/15" };
  }
  if (normType.includes("APPOINTMENT") || normCat === "COACHING") {
    return { icon: Calendar, color: "text-blue-400", bg: "bg-blue-500/15" };
  }
  if (normCat === "NUTRITION") {
    return {
      icon: Utensils,
      color: "text-emerald-400",
      bg: "bg-emerald-500/15",
    };
  }
  if (
    normCat === "WORKOUT" ||
    normType.includes("WORKOUT") ||
    normType.includes("SESSION")
  ) {
    return {
      icon: Dumbbell,
      color: "text-[#5BE584]",
      bg: "bg-[#5BE584]/15",
    };
  }
  if (normType === "ASSIGNMENT" || normType === "WORKOUT_ASSIGNED") {
    return {
      icon: ClipboardList,
      color: "text-[#5BE584]",
      bg: "bg-[#5BE584]/15",
    };
  }
  if (normType === "MEASUREMENT" || normType === "BODY_MEASUREMENT_RECORDED") {
    return { icon: Scale, color: "text-[#F59E0B]", bg: "bg-[#F59E0B]/15" };
  }
  if (normCat === "SYSTEM") {
    return { icon: Info, color: "text-[#94A3B8]", bg: "bg-[#1B2028]" };
  }
  return { icon: Bell, color: "text-[#94A3B8]", bg: "bg-[#1B2028]" };
};

const NotificationMenu = () => {
  const { t, i18n } = useTranslation(["common", "notifications"]);
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
    } else if (notification.category === "ACHIEVEMENT") {
      navigate("/gamification");
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
        aria-label={t("notifications:dropdown.openNotificationsAria")}
        aria-expanded={isOpen}
        className="relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-[12px] border border-transparent text-[#94A3B8] transition-colors hover:bg-[#13171D] hover:text-[#F8FAFC] hover:border-[#2A3039] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5BE584]"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -end-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#5BE584] px-1 text-[9px] font-extrabold text-gray-950 ring-2 ring-[#090B0F]">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="fixed sm:absolute top-[68px] sm:top-full mt-0 sm:mt-2 end-3 sm:end-0 w-[min(400px,calc(100vw-24px))] sm:w-80 max-w-[400px] sm:max-w-80 origin-top sm:origin-top-right rtl:sm:origin-top-left rounded-[20px] border border-[#2A3039] bg-[#13171D] shadow-[0_12px_40px_rgba(0,0,0,0.35)] focus:outline-none z-50 flex flex-col overflow-hidden max-h-[calc(100dvh-5.5rem)] sm:max-h-[520px] box-border animate-in fade-in-0 zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#2A3039] px-4 py-3 shrink-0 gap-2">
            <h3 className="text-sm font-semibold text-[#F8FAFC] flex items-center gap-2 min-w-0">
              <span className="truncate">{t("notifications:dropdown.title")}</span>
              {unreadCount > 0 && (
                <span className="shrink-0 rounded-full bg-[#5BE584]/15 border border-[#5BE584]/30 px-2 py-0.5 text-[10px] font-bold text-[#5BE584]">
                  {unreadCount}
                </span>
              )}
            </h3>
            <button
              type="button"
              onClick={handleMarkAllRead}
              disabled={unreadCount === 0 || isMarkingAll}
              className="cursor-pointer text-xs font-medium text-[#5BE584] hover:text-[#49D472] transition-colors flex items-center gap-1 focus-visible:outline-none disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            >
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />{" "}
              <span className="whitespace-nowrap">{t("notifications:dropdown.markAllRead")}</span>
            </button>
          </div>

          {/* List Area */}
          <div className="flex-1 overflow-y-auto min-h-0 divide-y divide-[#2A3039]">
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
                {t("notifications:dropdown.unableToLoad")}
              </div>
            ) : recentNotifications.length === 0 ? (
              <div className="p-8 flex flex-col items-center justify-center text-center">
                <Bell className="h-6 w-6 text-[#94A3B8] mb-2" />
                <span className="text-sm font-medium text-[#94A3B8]">
                  {t("notifications:dropdown.noNotificationsYet")}
                </span>
              </div>
            ) : (
              recentNotifications.map((notif) => {
                const isUnread = !notif.readAt;
                const {
                  icon: Icon,
                  color,
                  bg,
                } = getNotificationStyles(notif.type, notif.category);
                const localized = localizeNotification(
                  notif,
                  t,
                  i18n.language,
                );

                return (
                  <div
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`relative flex items-start gap-3 p-3.5 sm:p-4 transition-colors cursor-pointer ${
                      isUnread
                        ? "bg-[#1B2028]/50 hover:bg-[#1B2028]"
                        : "hover:bg-[#1B2028]/40"
                    }`}
                  >
                    {isUnread && (
                      <div className="absolute start-0 top-0 h-full w-0.5 bg-[#5BE584]" />
                    )}
                    <div
                      className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${bg} ${color}`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col gap-1 pe-2 min-w-0 flex-1">
                      <p
                        className={`text-sm break-words line-clamp-2 ${
                          isUnread
                            ? "font-semibold text-[#F8FAFC]"
                            : "font-medium text-[#F8FAFC]/80"
                        }`}
                      >
                        {localized.title}
                      </p>
                      <p className="text-xs text-[#94A3B8] line-clamp-2 leading-relaxed break-words">
                        {localized.message}
                      </p>
                      <span className="text-[11px] font-medium text-[#94A3B8]/70 mt-0.5">
                        {formatNotificationTimeAgo(
                          notif.createdAt,
                          t,
                          i18n.language,
                        )}
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
              className="w-full cursor-pointer rounded-[12px] py-2 text-xs font-semibold text-[#94A3B8] transition-colors hover:bg-[#13171D] hover:text-[#F8FAFC] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#5BE584]"
            >
              {t("notifications:dropdown.viewAll")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const QuickActionsMenu = () => {
  const { t } = useTranslation(["common"]);
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { isCoachOrAdmin } = useAuth();

  useOnClickOutside(ref, () => setIsOpen(false));

  const actions = isCoachOrAdmin
    ? [
        {
          title: t("header.quickActionsList.createAssignment", "Create Assignment"),
          description: t(
            "header.quickActionsList.createAssignmentDesc",
            "Assign a workout plan to a member",
          ),
          icon: ClipboardPlus,
          path: "/assignments/new",
        },
        {
          title: t("header.quickActionsList.createWorkout", "Create Workout"),
          description: t(
            "header.quickActionsList.createWorkoutDesc",
            "Build a new workout template",
          ),
          icon: Dumbbell,
          path: "/workout-builder/new",
        },
        {
          title: t("header.quickActionsList.manageMembers", "Manage Members"),
          description: t(
            "header.quickActionsList.manageMembersDesc",
            "View assigned member roster",
          ),
          icon: Users,
          path: "/members",
        },
      ]
    : [
        {
          title: t("header.quickActionsList.workoutSessions", "Workout Sessions"),
          description: t(
            "header.quickActionsList.workoutSessionsDesc",
            "Start or review your training logs",
          ),
          icon: Flame,
          path: "/sessions",
        },
        {
          title: t("header.quickActionsList.myAssignments", "My Assignments"),
          description: t(
            "header.quickActionsList.myAssignmentsDesc",
            "View workouts assigned by your coach",
          ),
          icon: ClipboardList,
          path: "/assignments/all",
        },
        {
          title: t("header.quickActionsList.exerciseLibrary", "Exercise Library"),
          description: t(
            "header.quickActionsList.exerciseLibraryDesc",
            "Browse exercises and instructions",
          ),
          icon: BookOpen,
          path: "/workout-library/exercises",
        },
      ];

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={t("header.quickActions", "Quick Actions")}
        aria-expanded={isOpen}
        className="relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-[12px] border border-transparent text-[#94A3B8] transition-colors hover:bg-[#13171D] hover:text-[#F8FAFC] hover:border-[#2A3039] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5BE584]"
      >
        <Zap className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className="fixed sm:absolute top-[68px] sm:top-full mt-0 sm:mt-2 end-3 sm:end-0 w-[min(360px,calc(100vw-24px))] sm:w-72 max-w-[360px] sm:max-w-72 origin-top sm:origin-top-right rtl:sm:origin-top-left rounded-[20px] border border-[#2A3039] bg-[#13171D] shadow-[0_12px_40px_rgba(0,0,0,0.35)] focus:outline-none z-50 flex flex-col overflow-hidden max-h-[calc(100dvh-5.5rem)] sm:max-h-[480px] box-border animate-in fade-in-0 zoom-in-95 duration-150">
          <div className="flex items-center border-b border-[#2A3039] px-4 py-3 shrink-0">
            <h3 className="text-sm font-semibold text-[#F8FAFC]">
              {t("header.quickActions", "Quick Actions")}
            </h3>
          </div>

          <div className="p-2 flex flex-col gap-1 overflow-y-auto min-h-0 flex-1">
            {actions.map((action, index) => (
              <button
                key={index}
                type="button"
                onClick={() => {
                  navigate(action.path);
                  setIsOpen(false);
                }}
                className="group flex w-full cursor-pointer items-start gap-3 rounded-[12px] px-3 py-2.5 text-start transition-colors hover:bg-[#1B2028]"
              >
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] border border-[#2A3039] bg-[#090B0F] text-[#5BE584] transition-colors group-hover:bg-[#5BE584] group-hover:text-[#090B0F]">
                  <action.icon className="h-4 w-4" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-semibold text-[#F8FAFC] truncate">
                    {action.title}
                  </span>
                  <span className="text-xs text-[#94A3B8] line-clamp-1">
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
  const { t } = useTranslation(["common"]);
  const [isOpen, setIsOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const [prevAvatarUrl, setPrevAvatarUrl] = useState<string | undefined>(undefined);

  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const { mutate: logoutUser, isPending } = useLogout();
  const { user, isLoading } = useAuth();

  if (user?.avatarUrl !== prevAvatarUrl) {
    setPrevAvatarUrl(user?.avatarUrl);
    setAvatarError(false);
  }

  useOnClickOutside(ref, () => setIsOpen(false));

  const handleLogout = () => {
    setIsOpen(false);
    logoutUser();
  };

  const getRoleLabel = (role?: string) => {
    switch (role?.toUpperCase()) {
      case "TRAINER":
        return t("roles.coach", "Coach");
      case "MEMBER":
        return t("roles.member", "Member");
      case "ADMIN":
        return t("roles.admin", "Admin");
      default:
        return t("roles.user", "User");
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

  const displayName = isLoading
    ? "..."
    : user?.name || t("roles.user", "User");
  const roleLabel = getRoleLabel(user?.role);
  const initials = getInitials(user?.name);
  const showAvatar = Boolean(user?.avatarUrl) && !avatarError;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className="flex cursor-pointer items-center gap-3 rounded-[12px] border border-transparent p-1 ps-2 transition-colors hover:bg-[#13171D] hover:border-[#2A3039] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5BE584]"
      >
        <div className="hidden sm:flex flex-col items-end text-end">
          <span className="text-sm font-semibold text-[#F8FAFC] leading-none">
            {displayName}
          </span>

          <span className="text-[11px] font-medium text-[#5BE584] mt-1">
            {roleLabel}
          </span>
        </div>

        <div className="relative h-8 w-8 overflow-hidden rounded-[10px] border border-[#2A3039] bg-[#13171D] flex items-center justify-center text-[#5BE584]">
          {showAvatar ? (
            <img
              src={user!.avatarUrl!}
              alt={displayName}
              className="h-full w-full object-cover"
              onError={() => setAvatarError(true)}
            />
          ) : (
            <span className="text-xs font-bold">{initials}</span>
          )}
        </div>
      </button>

      {isOpen && (
        <div className="absolute end-0 mt-2 w-[calc(100vw-2rem)] max-w-56 origin-top-right rtl:origin-top-left rounded-[20px] border border-[#2A3039] bg-[#13171D] shadow-[0_12px_40px_rgba(0,0,0,0.35)] focus:outline-none z-50 overflow-hidden box-border">
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
              {t("header.profileAndSettings", "Profile & Settings")}
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
              {isPending
                ? t("header.signingOut", "Signing out...")
                : t("header.signOut", "Sign Out")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default function Header({ collapsed, onToggle }: HeaderProps) {
  const { t } = useTranslation(["common"]);

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full shrink-0 items-center justify-between border-b border-[#2A3039] bg-[#090B0F]/95 px-4 sm:px-6 backdrop-blur-md">
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        <button
          onClick={onToggle}
          type="button"
          aria-label={
            collapsed
              ? t("header.expandSidebar", "Expand Sidebar")
              : t("header.collapseSidebar", "Collapse Sidebar")
          }
          title={
            collapsed
              ? t("header.expandSidebar", "Expand Sidebar")
              : t("header.collapseSidebar", "Collapse Sidebar")
          }
          className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-[12px] border border-[#2A3039] bg-[#13171D] text-[#94A3B8] transition-colors hover:bg-[#1B2028] hover:text-[#F8FAFC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5BE584]"
        >
          {collapsed ? (
            <PanelLeftOpen className="h-4 w-4 rtl:rotate-180" />
          ) : (
            <PanelLeftClose className="h-4 w-4 rtl:rotate-180" />
          )}
        </button>

        <div className="flex flex-col justify-center min-w-0">
          <h1 className="truncate text-xs font-bold uppercase tracking-wider text-[#F8FAFC] mb-0.5">
            {t("header.workspace", "STREN Workspace")}
          </h1>
          <Breadcrumb />
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        <NotificationMenu />
        <QuickActionsMenu />

        <div className="mx-1 h-5 w-px bg-[#2A3039] hidden sm:block" />

        <LanguageSwitcher />
        <ProfileMenu />
      </div>
    </header>
  );
}
