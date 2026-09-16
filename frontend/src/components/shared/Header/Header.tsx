// src/components/shared/header/Header.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import { useLocation, Link } from "react-router-dom";
import {
  // Search,
  Bell,
  Moon,
  Sun,
  User,
  Settings,
  LogOut,
  ChevronRight,
  Activity,
  CalendarCheck,
  TrendingUp,
  CheckCircle2,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

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

// const DisabledSearch = () => {
//   return (
//     <div className="hidden md:flex relative group w-48 lg:w-80 items-center">
//       <Search className="absolute left-3 h-4 w-4 text-gray-500 group-hover:text-gray-400 transition-colors" />
//       <input
//         type="text"
//         disabled
//         placeholder="Search..."
//         className="w-full h-9 rounded-md border border-[#1e2329] bg-[#13171d] pl-9 pr-14 text-sm text-gray-200 placeholder-gray-500 shadow-sm transition-all focus:outline-none cursor-not-allowed"
//         aria-label="Search"
//       />
//       <div className="absolute right-2 flex items-center gap-1 rounded border border-[#1e2329] bg-[#090B0F] px-1.5 py-0.5 text-[10px] font-mono text-gray-500">
//         <span>Ctrl</span>
//         <span>+</span>
//         <span>K</span>
//       </div>
//     </div>
//   );
// };

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

const NotificationMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useOnClickOutside(ref, () => setIsOpen(false));

  const notifications = [
    {
      id: 1,
      title: "Workout Completed",
      message: "Ahmed completed Push Day A.",
      time: "2 min ago",
      icon: Activity,
      color: "text-[#5BE584]",
      bg: "bg-[#5BE584]/10",
    },
    {
      id: 2,
      title: "New Assignment",
      message: "Sarah updated her weekly goals.",
      time: "1 hr ago",
      icon: CalendarCheck,
      color: "text-blue-400",
      bg: "bg-blue-400/10",
    },
    {
      id: 3,
      title: "Progress Milestone",
      message: "Marcus hit a new PR on Bench Press.",
      time: "3 hrs ago",
      icon: TrendingUp,
      color: "text-purple-400",
      bg: "bg-purple-400/10",
    },
  ];

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
        <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#5BE584] ring-2 ring-[#090B0F]" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 origin-top-right rounded-xl border border-[#1e2329] bg-[#0d1014] shadow-2xl shadow-black/50 ring-1 ring-black/5 focus:outline-none animate-in fade-in slide-in-from-top-2 duration-200 z-50">
          <div className="flex items-center justify-between border-b border-[#1e2329] px-4 py-3">
            <h3 className="text-sm font-semibold text-gray-100">
              Notifications
            </h3>
            <button className="text-[11px] font-medium text-[#5BE584] hover:text-[#4ade80] transition-colors flex items-center gap-1 focus-visible:outline-none focus-visible:underline">
              <CheckCircle2 className="h-3 w-3" /> Mark all read
            </button>
          </div>
          <div className="max-h-[300px] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {notifications.map((notif) => {
              const Icon = notif.icon;
              return (
                <div
                  key={notif.id}
                  className="flex items-start gap-3 border-b border-[#1e2329]/50 p-4 transition-colors hover:bg-white/[0.02] cursor-pointer"
                >
                  <div
                    className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${notif.bg} ${notif.color}`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-medium text-gray-200">
                      {notif.title}
                    </p>
                    <p className="text-xs text-gray-500">{notif.message}</p>
                    <span className="text-[10px] font-medium text-gray-600">
                      {notif.time}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="p-2 border-t border-[#1e2329]">
            <button className="w-full rounded-md py-2 text-xs font-medium text-gray-400 transition-colors hover:bg-[#13171d] hover:text-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5BE584]">
              View All Notifications
            </button>
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

      {/* <div className="flex-1 flex justify-center px-4">
        <DisabledSearch />
      </div> */}

      <div className="flex items-center gap-1 md:gap-2">
        <ThemeToggle />
        <NotificationMenu />
        <div className="mx-1 h-5 w-px bg-[#1e2329] hidden sm:block" />
        <ProfileMenu />
      </div>
    </header>
  );
}
