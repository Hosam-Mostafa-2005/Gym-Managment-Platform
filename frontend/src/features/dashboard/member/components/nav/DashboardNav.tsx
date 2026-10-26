// src/features/dashboard/member/components/nav/DashboardNav.tsx
import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  BarChart3,
  Clock,
  History,
  Scale,
  Calendar,
} from "lucide-react";

export const DashboardNav: React.FC = () => {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[#1E2329] pb-3">
      {/* Primary Subview Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
        <NavLink
          to="/dashboard"
          end
          className={({ isActive }) =>
            `inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition ${
              isActive
                ? "bg-[#1E2329] text-[#5BE584] border border-[#5BE584]/30 shadow-sm"
                : "text-gray-400 hover:text-white hover:bg-white/[0.04]"
            }`
          }
        >
          <LayoutDashboard className="h-4 w-4" />
          <span>Overview</span>
        </NavLink>

        <NavLink
          to="/dashboard/analytics"
          className={({ isActive }) =>
            `inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition ${
              isActive
                ? "bg-[#1E2329] text-[#5BE584] border border-[#5BE584]/30 shadow-sm"
                : "text-gray-400 hover:text-white hover:bg-white/[0.04]"
            }`
          }
        >
          <BarChart3 className="h-4 w-4" />
          <span>Training Analytics</span>
        </NavLink>

        <NavLink
          to="/dashboard/activity"
          className={({ isActive }) =>
            `inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition ${
              isActive
                ? "bg-[#1E2329] text-[#5BE584] border border-[#5BE584]/30 shadow-sm"
                : "text-gray-400 hover:text-white hover:bg-white/[0.04]"
            }`
          }
        >
          <Clock className="h-4 w-4" />
          <span>Activity Log</span>
        </NavLink>
      </div>

      {/* Quick Links to Dedicated Feature Pages */}
      <div className="hidden lg:flex items-center gap-2">
        <NavLink
          to="/sessions"
          className="inline-flex items-center gap-1.5 rounded-lg border border-[#1E2329] bg-[#101418] px-3 py-1.5 text-xs font-medium text-gray-400 hover:text-white hover:border-[#2A313C] transition"
        >
          <History className="h-3.5 w-3.5 text-blue-400" />
          <span>Workout History</span>
        </NavLink>

        <NavLink
          to="/sessions/scheduled"
          className="inline-flex items-center gap-1.5 rounded-lg border border-[#1E2329] bg-[#101418] px-3 py-1.5 text-xs font-medium text-gray-400 hover:text-white hover:border-[#2A313C] transition"
        >
          <Calendar className="h-3.5 w-3.5 text-[#5BE584]" />
          <span>Schedule</span>
        </NavLink>

        <NavLink
          to="/measurements"
          className="inline-flex items-center gap-1.5 rounded-lg border border-[#1E2329] bg-[#101418] px-3 py-1.5 text-xs font-medium text-gray-400 hover:text-white hover:border-[#2A313C] transition"
        >
          <Scale className="h-3.5 w-3.5 text-emerald-400" />
          <span>Measurements</span>
        </NavLink>
      </div>
    </div>
  );
};
