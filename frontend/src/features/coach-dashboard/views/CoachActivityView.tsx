// src/features/coach-dashboard/views/CoachActivityView.tsx
import React, { useState, useMemo } from "react";
import { Link, useOutletContext } from "react-router-dom";
import {
  ArrowLeft,
  Clock,
  Search,
  Users,
  CheckCircle2,
  Play,
  Calendar,
  Scale,
  Filter,
  Activity as ActivityIcon,
} from "lucide-react";
import { useCoachDashboard } from "../hooks/use-coach-dashboard";
import type {
  CoachDashboard,
  DashboardActivity,
} from "../types/coach-dashboard.types";

export const CoachActivityView: React.FC = () => {
  const contextData = useOutletContext<CoachDashboard | undefined>();
  const { data: queryData } = useCoachDashboard();

  const data = contextData || queryData;
  const activities: DashboardActivity[] = data?.recentActivity || [];

  const [filterAction, setFilterAction] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredActivities = useMemo(() => {
    return activities.filter((act) => {
      const action = act.action?.toUpperCase();
      const type = act.type?.toUpperCase();

      let matchesFilter = true;
      if (filterAction === "COMPLETED") {
        matchesFilter = action === "COMPLETED" || (!action && type === "WORKOUT");
      } else if (filterAction === "STARTED") {
        matchesFilter = action === "STARTED";
      } else if (filterAction === "ASSIGNMENT") {
        matchesFilter = action === "CREATED" || type === "ASSIGNMENT";
      } else if (filterAction === "MEASUREMENT") {
        matchesFilter = action === "RECORDED" || type === "BODY_MEASUREMENT";
      }

      const q = searchQuery.toLowerCase();
      const matchesSearch =
        searchQuery === "" ||
        act.member?.name?.toLowerCase().includes(q) ||
        act.metadata?.workoutTitle?.toLowerCase().includes(q) ||
        false;

      return matchesFilter && matchesSearch;
    });
  }, [activities, filterAction, searchQuery]);

  const formatActivityDate = (dateValue: string | Date | null) => {
    if (!dateValue) return { date: "Recently", time: "" };
    try {
      const d = new Date(dateValue);
      return {
        date: d.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        time: d.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        }),
      };
    } catch {
      return { date: "Recently", time: "" };
    }
  };

  const formatDuration = (mins?: number | null) => {
    if (mins === undefined || mins === null) return null;
    if (mins <= 0) return "< 1 min";
    if (mins === 1) return "1 min";
    if (mins < 60) return `${mins} mins`;
    const hrs = Math.floor(mins / 60);
    const remMins = mins % 60;
    return remMins > 0 ? `${hrs}h ${remMins}m` : `${hrs}h`;
  };

  const getActionDetails = (item: DashboardActivity) => {
    const action = item.action?.toUpperCase();
    const type = item.type?.toUpperCase();

    if (action === "COMPLETED" || (!action && type === "WORKOUT")) {
      return {
        verb: "completed",
        Icon: CheckCircle2,
        badgeClasses: "bg-[#5BE584]/10 border-[#5BE584]/20 text-[#5BE584]",
      };
    }

    if (action === "STARTED") {
      return {
        verb: "started",
        Icon: Play,
        badgeClasses: "bg-blue-500/10 border-blue-500/20 text-blue-400",
      };
    }

    if (action === "CREATED" || type === "ASSIGNMENT") {
      return {
        verb: "assigned",
        Icon: Calendar,
        badgeClasses: "bg-purple-500/10 border-purple-500/20 text-purple-400",
      };
    }

    if (action === "RECORDED" || type === "BODY_MEASUREMENT") {
      return {
        verb: "logged metrics for",
        Icon: Scale,
        badgeClasses: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
      };
    }

    return {
      verb: "logged",
      Icon: ActivityIcon,
      badgeClasses: "bg-gray-500/10 border-gray-500/20 text-gray-400",
    };
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#1E2329] bg-[#101418] p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#5BE584]/10 text-[#5BE584]">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white">
              Coaching Activity Feed
            </h1>
            <p className="text-xs text-gray-400">
              Verified chronological timeline of all athlete workouts, program assignments, and metric updates
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/coach-dashboard"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#1E2329] bg-[#161B22] px-3 py-1.5 text-xs font-medium text-gray-300 hover:text-white hover:border-[#5BE584]/40 transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Return to Overview</span>
          </Link>
          <Link
            to="/members"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#1E2329] bg-[#161B22] px-3 py-1.5 text-xs font-medium text-gray-300 hover:text-white transition"
          >
            <Users className="h-3.5 w-3.5 text-[#5BE584]" />
            <span>Athletes Roster</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#1E2329] bg-[#101418] p-4">
        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500 mr-1" />
          <button
            type="button"
            onClick={() => setFilterAction("ALL")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              filterAction === "ALL"
                ? "bg-[#1E2329] text-[#5BE584] border border-[#5BE584]/30"
                : "text-gray-400 hover:text-white hover:bg-white/[0.04]"
            }`}
          >
            All Events ({activities.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterAction("COMPLETED")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              filterAction === "COMPLETED"
                ? "bg-[#1E2329] text-[#5BE584] border border-[#5BE584]/30"
                : "text-gray-400 hover:text-white hover:bg-white/[0.04]"
            }`}
          >
            Completed Sessions
          </button>
          <button
            type="button"
            onClick={() => setFilterAction("STARTED")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              filterAction === "STARTED"
                ? "bg-[#1E2329] text-[#5BE584] border border-[#5BE584]/30"
                : "text-gray-400 hover:text-white hover:bg-white/[0.04]"
            }`}
          >
            In-Progress
          </button>
          <button
            type="button"
            onClick={() => setFilterAction("ASSIGNMENT")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              filterAction === "ASSIGNMENT"
                ? "bg-[#1E2329] text-[#5BE584] border border-[#5BE584]/30"
                : "text-gray-400 hover:text-white hover:bg-white/[0.04]"
            }`}
          >
            Assignments
          </button>
          <button
            type="button"
            onClick={() => setFilterAction("MEASUREMENT")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              filterAction === "MEASUREMENT"
                ? "bg-[#1E2329] text-[#5BE584] border border-[#5BE584]/30"
                : "text-gray-400 hover:text-white hover:bg-white/[0.04]"
            }`}
          >
            Body Metrics
          </button>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[220px]">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search by athlete or workout..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-[#1E2329] bg-[#0D1014] py-1.5 pl-8 pr-3 text-xs text-white placeholder-gray-500 focus:border-[#5BE584] focus:outline-none"
          />
        </div>
      </div>

      {/* Activity Timeline List */}
      <div className="rounded-xl border border-[#1E2329] bg-[#101418] overflow-hidden">
        {filteredActivities.length > 0 ? (
          <div className="divide-y divide-[#1E2329]">
            {filteredActivities.map((item, index) => {
              const memberId = item.member?.id;
              const memberName = item.member?.name || "Member";
              const workoutTitle =
                item.metadata?.workoutTitle || item.action || "Activity logged";
              const { date, time } = formatActivityDate(item.date);
              const { verb, Icon, badgeClasses } = getActionDetails(item);
              const formattedDuration = formatDuration(item.metadata?.duration);

              return (
                <div
                  key={item.id || index}
                  className="flex items-start justify-between gap-4 p-4 hover:bg-white/[0.02] transition"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${badgeClasses}`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>

                    <div className="flex flex-col gap-0.5">
                      <div className="text-xs text-gray-300">
                        {memberId ? (
                          <Link
                            to={`/members/${memberId}`}
                            className="font-semibold text-white hover:text-[#5BE584] transition-colors mr-1.5"
                          >
                            {memberName}
                          </Link>
                        ) : (
                          <span className="font-semibold text-white mr-1.5">
                            {memberName}
                          </span>
                        )}
                        <span className="text-gray-400 mr-1.5">{verb}</span>
                        <span className="font-medium text-white">
                          {workoutTitle}
                        </span>
                      </div>

                      {item.metadata && Object.keys(item.metadata).length > 0 && (
                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-400 mt-1">
                          {formattedDuration && (
                            <span>
                              Duration:{" "}
                              <strong className="text-gray-300 font-mono">
                                {formattedDuration}
                              </strong>
                            </span>
                          )}
                          {item.metadata.volume !== undefined &&
                            item.metadata.volume > 0 && (
                              <span>
                                Volume:{" "}
                                <strong className="text-gray-300 font-mono">
                                  {item.metadata.volume.toLocaleString()}kg
                                </strong>
                              </span>
                            )}
                          {item.metadata.weight !== undefined && (
                            <span>
                              Weight:{" "}
                              <strong className="text-gray-300 font-mono">
                                {item.metadata.weight}kg
                              </strong>
                            </span>
                          )}
                          {item.metadata.bodyFat !== undefined && (
                            <span>
                              Body Fat:{" "}
                              <strong className="text-gray-300 font-mono">
                                {item.metadata.bodyFat}%
                              </strong>
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end shrink-0">
                    <span className="text-xs font-medium text-gray-300 font-mono">
                      {date}
                    </span>
                    <span className="text-[10px] text-gray-500">{time}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <Clock className="h-8 w-8 text-gray-600 mb-2" />
            <h3 className="text-sm font-semibold text-white">
              No matching coaching activity
            </h3>
            <p className="text-xs text-gray-500 mt-1 max-w-sm">
              {searchQuery
                ? `No activity records match "${searchQuery}".`
                : "Verified workout completions and program assignments by your athletes will appear here."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoachActivityView;
