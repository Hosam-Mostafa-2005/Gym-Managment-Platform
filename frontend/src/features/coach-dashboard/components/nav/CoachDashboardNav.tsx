// src/features/coach-dashboard/components/nav/CoachDashboardNav.tsx
import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  BarChart3,
  Clock,
  Users,
  ClipboardList,
} from "lucide-react";

export const CoachDashboardNav: React.FC = () => {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[#1E2329] pb-3">
      {/* Primary Subview Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
        <NavLink
          to="/coach-dashboard"
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
          <span>Coaching Overview</span>
        </NavLink>

        <NavLink
          to="/coach-dashboard/analytics"
          className={({ isActive }) =>
            `inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition ${
              isActive
                ? "bg-[#1E2329] text-[#5BE584] border border-[#5BE584]/30 shadow-sm"
                : "text-gray-400 hover:text-white hover:bg-white/[0.04]"
            }`
          }
        >
          <BarChart3 className="h-4 w-4" />
          <span>Roster Analytics & Telemetry</span>
        </NavLink>

        <NavLink
          to="/coach-dashboard/activity"
          className={({ isActive }) =>
            `inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition ${
              isActive
                ? "bg-[#1E2329] text-[#5BE584] border border-[#5BE584]/30 shadow-sm"
                : "text-gray-400 hover:text-white hover:bg-white/[0.04]"
            }`
          }
        >
          <Clock className="h-4 w-4" />
          <span>Activity Feed</span>
        </NavLink>
      </div>

      {/* Quick Links to Dedicated Feature Pages */}
      <div className="hidden lg:flex items-center gap-2">
        <NavLink
          to="/members"
          className="inline-flex items-center gap-1.5 rounded-lg border border-[#1E2329] bg-[#101418] px-3 py-1.5 text-xs font-medium text-gray-400 hover:text-white hover:border-[#2A313C] transition"
        >
          <Users className="h-3.5 w-3.5 text-[#5BE584]" />
          <span>Athletes Roster</span>
        </NavLink>

        <NavLink
          to="/assignments"
          className="inline-flex items-center gap-1.5 rounded-lg border border-[#1E2329] bg-[#101418] px-3 py-1.5 text-xs font-medium text-gray-400 hover:text-white hover:border-[#2A313C] transition"
        >
          <ClipboardList className="h-3.5 w-3.5 text-blue-400" />
          <span>Assignments</span>
        </NavLink>
      </div>
    </div>
  );
};
