// src/features/dashboard/member/views/MemberActivityView.tsx
import React, { useState, useMemo } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  Clock,
  Search,
  History,
  CheckCircle2,
  ClipboardList,
  Filter,
} from "lucide-react";
import { useMemberDashboard } from "../../hooks/use-dashboard";
import type {
  MemberDashboardData,
  MemberDashboardActivity,
} from "../../types/dashboard.types";

export const MemberActivityView: React.FC = () => {
  const { t, i18n } = useTranslation(["dashboard"]);
  const contextData = useOutletContext<MemberDashboardData | undefined>();
  const { data: queryData } = useMemberDashboard();

  const data = contextData || queryData;
  const activities: MemberDashboardActivity[] = data?.recentActivity || [];

  const [filterType, setFilterType] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const currentLang = i18n.language === "ar" ? "ar-EG" : "en-US";

  const filteredActivities = useMemo(() => {
    return activities.filter((act) => {
      const matchesType =
        filterType === "ALL" ||
        (filterType === "WORKOUT" && act.type === "SESSION_COMPLETED") ||
        (filterType === "ASSIGNMENT" && act.type === "ASSIGNMENT_RECEIVED");

      const matchesSearch =
        searchQuery === "" ||
        act.message?.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesType && matchesSearch;
    });
  }, [activities, filterType, searchQuery]);

  const formatActivityDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return {
        date: d.toLocaleDateString(currentLang, {
          weekday: "short",
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        time: d.toLocaleTimeString(currentLang, {
          hour: "numeric",
          minute: "2-digit",
        }),
      };
    } catch {
      return { date: t("member.activityView.recently"), time: "" };
    }
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
              {t("member.activityView.title")}
            </h1>
            <p className="text-xs text-gray-400">
              {t("member.activityView.subtitle")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#1E2329] bg-[#161B22] px-3 py-1.5 text-xs font-medium text-gray-300 hover:text-white hover:border-[#5BE584]/40 transition"
          >
            <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" />
            <span>{t("member.activityView.returnToOverview")}</span>
          </Link>
          <Link
            to="/sessions"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#1E2329] bg-[#161B22] px-3 py-1.5 text-xs font-medium text-gray-300 hover:text-white transition"
          >
            <History className="h-3.5 w-3.5 text-blue-400" />
            <span>{t("member.activityView.allSessions")}</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#1E2329] bg-[#101418] p-4">
        {/* Filter Pills */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500 mr-1 rtl:ml-1 rtl:mr-0" />
          <button
            type="button"
            onClick={() => setFilterType("ALL")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              filterType === "ALL"
                ? "bg-[#1E2329] text-[#5BE584] border border-[#5BE584]/30"
                : "text-gray-400 hover:text-white hover:bg-white/[0.04]"
            }`}
          >
            {t("member.activityView.allEvents", { count: activities.length })}
          </button>
          <button
            type="button"
            onClick={() => setFilterType("WORKOUT")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              filterType === "WORKOUT"
                ? "bg-[#1E2329] text-[#5BE584] border border-[#5BE584]/30"
                : "text-gray-400 hover:text-white hover:bg-white/[0.04]"
            }`}
          >
            {t("member.activityView.workoutsCompleted")}
          </button>
          <button
            type="button"
            onClick={() => setFilterType("ASSIGNMENT")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              filterType === "ASSIGNMENT"
                ? "bg-[#1E2329] text-[#5BE584] border border-[#5BE584]/30"
                : "text-gray-400 hover:text-white hover:bg-white/[0.04]"
            }`}
          >
            {t("member.activityView.assignments")}
          </button>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[220px]">
          <Search className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder={t("member.activityView.searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-[#1E2329] bg-[#0D1014] py-1.5 pl-8 pr-3 rtl:pl-3 rtl:pr-8 text-xs text-white placeholder-gray-500 focus:border-[#5BE584] focus:outline-none"
          />
        </div>
      </div>

      {/* Activity Timeline List */}
      <div className="rounded-xl border border-[#1E2329] bg-[#101418] overflow-hidden">
        {filteredActivities.length > 0 ? (
          <div className="divide-y divide-[#1E2329]">
            {filteredActivities.map((act, idx) => {
              const { date, time } = formatActivityDate(act.date);
              const isWorkout = act.type === "SESSION_COMPLETED";

              return (
                <div
                  key={act.id || idx}
                  className="flex items-start justify-between gap-4 p-4 hover:bg-white/[0.02] transition"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${
                        isWorkout
                          ? "bg-[#5BE584]/10 border-[#5BE584]/20 text-[#5BE584]"
                          : "bg-blue-500/10 border-blue-500/20 text-blue-400"
                      }`}
                    >
                      {isWorkout ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <ClipboardList className="h-4 w-4" />
                      )}
                    </div>

                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-white">
                        {act.message}
                      </span>
                      <span className="text-[11px] text-gray-500 mt-0.5">
                        {isWorkout
                          ? t("member.activityView.workoutCompletion")
                          : t("member.activityView.coachAssignment")}
                      </span>
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
              {t("member.activityView.noMatchingRecords")}
            </h3>
            <p className="text-xs text-gray-500 mt-1 max-w-sm">
              {searchQuery
                ? t("member.activityView.noMatchSearch", {
                    query: searchQuery,
                  })
                : t("member.activityView.noMatchFallback")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberActivityView;
