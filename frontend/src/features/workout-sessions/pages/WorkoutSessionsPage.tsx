import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Search, Calendar, Clock, Activity, Dumbbell } from "lucide-react";

import { useWorkoutSessions } from "../hooks/useWorkoutSessions";
import { useStartWorkoutSession } from "../hooks/useStartWorkoutSession";
import { useMyAssignments } from "../hooks/useMyAssignments";

export default function WorkoutSessionsPage() {
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const { data: assignments = [] } = useMyAssignments();
  const { mutate: startWorkout, isPending: isStarting } =
    useStartWorkoutSession();
  const { data, isLoading, isError, refetch } = useWorkoutSessions(page, limit);

  const sessions = data?.sessions ?? [];
  const totalItems = data?.results ?? 0;

  const activeAssignment = assignments.find((a) => a.status === "ACTIVE");

  const stats = useMemo(() => {
    const completed = sessions.filter(
      (session) => session.status === "COMPLETED",
    ).length;

    const inProgress = sessions.filter(
      (session) => session.status === "IN_PROGRESS",
    ).length;

    const averageDuration =
      sessions.length === 0
        ? 0
        : Math.round(
            sessions.reduce(
              (acc, session) => acc + (session.duration ?? 0),
              0,
            ) / sessions.length,
          );

    return {
      total: totalItems,
      completed,
      inProgress,
      averageDuration,
    };
  }, [sessions, totalItems]);

  const filteredSessions = useMemo(() => {
    let filtered = [...sessions];

    if (search.trim()) {
      const value = search.toLowerCase();
      filtered = filtered.filter(
        (session) =>
          session.assignment.workout.title.toLowerCase().includes(value) ||
          session.assignment.trainer.name.toLowerCase().includes(value),
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((session) => session.status === statusFilter);
    }

    switch (sortBy) {
      case "oldest":
        filtered.sort(
          (a, b) =>
            new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime(),
        );
        break;
      case "duration":
        filtered.sort((a, b) => (b.duration ?? 0) - (a.duration ?? 0));
        break;
      default:
        filtered.sort(
          (a, b) =>
            new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
        );
    }

    return filtered;
  }, [sessions, search, statusFilter, sortBy]);

  const handleViewSession = (id: string, status: string) => {
    if (status === "IN_PROGRESS") {
      navigate("/sessions/active");
      return;
    }

    navigate(`/sessions/${id}`);
  };

  const handleContinueWorkout = () => {
    if (hasActiveSession) {
      navigate("/sessions/active");
      return;
    }

    if (!activeAssignment) {
      toast.error("No active workout assignment found.");
      return;
    }

    startWorkout(
      {
        assignment: activeAssignment._id,
      },
      {
        onSuccess: () => {
          navigate("/sessions/active");
        },

        onError: (error) => {
          console.error("Failed to start workout:", error);
          toast.error("Failed to start workout.");
        },
      },
    );
  };

  const hasActiveSession = stats.inProgress > 0;

  return (
    <div className="relative min-h-screen w-full bg-[#0D1014] text-[#F3F4F6] font-sans selection:bg-[#5BE584]/30">
      {/* Background Atmosphere */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(30,35,41,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(30,35,41,0.2)_1px,transparent_1px)] bg-[size:32px_32px]" />
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-[radial-gradient(circle_at_center,_rgba(91,229,132,0.02)_0%,_rgba(13,16,20,0)_70%)] blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-[#1E2329] bg-[#0D1014]/90 backdrop-blur-md pt-8 pb-6 px-6 lg:px-12">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-[11px] font-medium tracking-wide text-[#6B7280] uppercase">
              <span className="text-[#F3F4F6]">Sessions</span>
              <span>/</span>
              <span className="hover:text-[#9CA3AF] cursor-pointer">
                Overview
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-white mt-1">
              Workout Sessions
            </h1>
            <p className="text-sm text-[#9CA3AF]">
              Monitor live workout activity and review completed session
              history.
            </p>
          </div>

          <button
            onClick={handleContinueWorkout}
            disabled={isStarting}
            className="group flex items-center justify-center gap-2 rounded-md bg-[#5BE584] px-5 py-2.5 text-sm font-semibold text-[#090B0F] transition-all hover:bg-[#4ade80] focus:outline-none focus:ring-2 focus:ring-[#5BE584] focus:ring-offset-2 focus:ring-offset-[#0D1014]"
          >
            {isStarting
              ? "Starting..."
              : hasActiveSession
                ? "Continue Session"
                : "Start Workout"}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 mx-auto max-w-7xl px-6 lg:px-12 py-10 pb-32 space-y-10 animate-in fade-in duration-300">
        {/* Stats Section */}
        <section>
          <div className="mb-4">
            <h2 className="text-[11px] font-bold tracking-widest text-[#6B7280] uppercase">
              Activity Metrics
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Total */}
            <div className="rounded-xl border border-[#1E2329] bg-[#101418] p-5 flex items-start justify-between transition-colors hover:border-[#2A313A]">
              <div>
                <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">
                  Total Sessions
                </p>
                <h3 className="text-2xl font-semibold text-white mt-2">
                  {stats.total}
                </h3>
              </div>
              <div className="p-2 rounded bg-[#1E2329]/50 text-[#9CA3AF]">
                <Calendar className="w-4 h-4" />
              </div>
            </div>

            {/* Active */}
            <div className="rounded-xl border border-[#1E2329] bg-[#101418] p-5 flex items-start justify-between transition-colors hover:border-[#2A313A]">
              <div>
                <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">
                  Active Sessions
                </p>
                <div className="flex items-baseline gap-2 mt-2">
                  <h3 className="text-2xl font-semibold text-white">
                    {stats.inProgress}
                  </h3>
                  {stats.inProgress > 0 && (
                    <span className="flex items-center gap-1 text-[10px] font-medium text-[#5BE584] bg-[#16291D] border border-[#23422E] px-2 py-0.5 rounded">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#5BE584] animate-pulse"></span>
                      LIVE
                    </span>
                  )}
                </div>
              </div>
              <div className="p-2 rounded bg-[#16291D] border border-[#23422E] text-[#5BE584]">
                <Activity className="w-4 h-4" />
              </div>
            </div>

            {/* Completed */}
            <div className="rounded-xl border border-[#1E2329] bg-[#101418] p-5 flex items-start justify-between transition-colors hover:border-[#2A313A]">
              <div>
                <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">
                  Completed
                </p>
                <h3 className="text-2xl font-semibold text-white mt-2">
                  {stats.completed}
                </h3>
              </div>
              <div className="p-2 rounded bg-[#1E2329]/50 text-[#9CA3AF]">
                <Dumbbell className="w-4 h-4" />
              </div>
            </div>

            {/* Avg Duration */}
            <div className="rounded-xl border border-[#1E2329] bg-[#101418] p-5 flex items-start justify-between transition-colors hover:border-[#2A313A]">
              <div>
                <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">
                  Avg Duration
                </p>
                <h3 className="text-2xl font-semibold text-white mt-2">
                  {stats.averageDuration}m
                </h3>
              </div>
              <div className="p-2 rounded bg-[#1E2329]/50 text-[#9CA3AF]">
                <Clock className="w-4 h-4" />
              </div>
            </div>
          </div>
        </section>

        <div className="h-px w-full bg-gradient-to-r from-[#1E2329] to-transparent" />

        {/* Filter & Search Bar */}
        <section>
          <div className="mb-4">
            <h2 className="text-[11px] font-bold tracking-widest text-[#6B7280] uppercase">
              Filter & History
            </h2>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7280]"
                size={16}
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name or ID..."
                className="w-full bg-[#101418] border border-[#1E2329] rounded-md h-9 pl-9 pr-4 text-xs text-[#F3F4F6] placeholder-[#6B7280] transition-colors focus:border-[#5BE584] focus:outline-none focus:ring-1 focus:ring-[#5BE584]"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-[#101418] border border-[#1E2329] rounded-md px-3 h-9 text-xs text-[#F3F4F6] focus:outline-none focus:border-[#5BE584] focus:ring-1 focus:ring-[#5BE584] cursor-pointer appearance-none min-w-[130px]"
              >
                <option value="all">All Status</option>
                <option value="IN_PROGRESS">Active</option>
                <option value="COMPLETED">Completed</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-[#101418] border border-[#1E2329] rounded-md px-3 h-9 text-xs text-[#F3F4F6] focus:outline-none focus:border-[#5BE584] focus:ring-1 focus:ring-[#5BE584] cursor-pointer appearance-none min-w-[130px]"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="duration">Duration</option>
              </select>
            </div>
          </div>
        </section>

        {/* Sessions Table Workspace */}
        <section>
          <div className="rounded-xl border border-[#1E2329] bg-[#101418]/50 overflow-hidden backdrop-blur-sm">
            {isLoading && (
              <div className="flex justify-center items-center py-24 text-[#6B7280]">
                <span className="w-8 h-8 border-2 border-[#5BE584] border-t-transparent rounded-full animate-spin"></span>
              </div>
            )}

            {isError && (
              <div className="flex flex-col justify-center items-center py-24 text-center">
                <p className="text-red-400 mb-4 text-sm">
                  Error loading sessions.
                </p>
                <button
                  onClick={() => refetch()}
                  className="rounded-md border border-[#1E2329] bg-[#101418] px-4 py-2 text-xs font-medium text-[#9CA3AF] transition-colors hover:text-white hover:border-[#6B7280]"
                >
                  Try Again
                </button>
              </div>
            )}

            {!isLoading && !isError && filteredSessions.length === 0 && (
              <div className="flex flex-col justify-center items-center py-24 text-center px-4">
                <p className="text-[#9CA3AF] mb-4 text-xs">
                  No workout sessions found.
                </p>
                {search || statusFilter !== "all" ? (
                  <button
                    onClick={() => {
                      setSearch("");
                      setStatusFilter("all");
                    }}
                    className="rounded-md border border-[#1E2329] bg-[#101418] px-4 py-2 text-xs font-medium text-[#9CA3AF] transition-colors hover:text-white hover:border-[#6B7280]"
                  >
                    Clear Filters
                  </button>
                ) : (
                  <button
                    onClick={handleContinueWorkout}
                    className="rounded-md bg-[#5BE584] px-4 py-2 text-xs font-semibold text-[#090B0F] transition-all hover:bg-[#4ade80]"
                  >
                    Start your first workout
                  </button>
                )}
              </div>
            )}

            {!isLoading && !isError && filteredSessions.length > 0 && (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="text-[#6B7280] border-b border-[#1E2329] uppercase text-[10px] font-bold tracking-widest bg-[#101418]">
                      <tr>
                        <th className="px-5 py-4">Workout</th>
                        <th className="px-5 py-4">Coach</th>
                        <th className="px-5 py-4">Time</th>
                        <th className="px-5 py-4">Progress</th>
                        <th className="px-5 py-4 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1E2329] text-sm">
                      {filteredSessions.map((session) => (
                        <tr
                          key={session.id}
                          onClick={() =>
                            handleViewSession(session.id, session.status)
                          }
                          className="hover:bg-[#1E2329]/30 transition-colors cursor-pointer group"
                        >
                          <td className="px-5 py-3.5">
                            <div className="font-medium text-[#F3F4F6] group-hover:text-[#5BE584] transition-colors">
                              {session.assignment.workout.title}
                            </div>
                            <div className="text-[#6B7280] text-[11px] mt-0.5">
                              ID: M-{session.id.slice(-4).toUpperCase()}
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-xs text-[#9CA3AF]">
                            {session.assignment.trainer.name}
                          </td>
                          <td className="px-5 py-3.5 text-xs text-[#9CA3AF]">
                            <div className="font-medium text-[#F3F4F6]">
                              {new Date(session.startedAt).toLocaleTimeString(
                                [],
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )}
                            </div>
                            <div className="text-[11px] text-[#6B7280] mt-0.5">
                              {session.duration ?? 0}m elapsed
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-24 bg-[#1E2329] h-1.5 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-500 ${
                                    session.status === "COMPLETED"
                                      ? "bg-[#6B7280]"
                                      : session.status === "IN_PROGRESS"
                                        ? "bg-[#5BE584]"
                                        : "bg-orange-400"
                                  }`}
                                  style={{ width: `${session.progress ?? 0}%` }}
                                />
                              </div>
                              <span className="text-[11px] font-medium text-[#6B7280] w-8">
                                {session.progress ?? 0}%
                              </span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <span
                              className={`inline-flex items-center justify-center px-2.5 py-1 rounded text-[11px] font-medium border ${
                                session.status === "IN_PROGRESS"
                                  ? "bg-[#16291D] border-[#23422E] text-[#5BE584]"
                                  : session.status === "COMPLETED"
                                    ? "bg-[#1E2329] border-[#1E2329] text-[#9CA3AF]"
                                    : "bg-orange-950/30 border-orange-900/50 text-orange-400"
                              }`}
                            >
                              {session.status === "IN_PROGRESS" && (
                                <span className="w-1.5 h-1.5 rounded-full bg-[#5BE584] mr-1.5 animate-pulse"></span>
                              )}
                              {session.status === "IN_PROGRESS"
                                ? "In Progress"
                                : session.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Footer */}
                <div className="flex items-center justify-between px-5 py-4 border-t border-[#1E2329] text-xs text-[#9CA3AF] bg-[#101418]">
                  <div>
                    Showing {filteredSessions.length} of {stats.total} sessions
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      disabled={page === 1}
                      onClick={() => setPage(page - 1)}
                      className="rounded border border-[#1E2329] bg-[#101418] px-3 py-1.5 text-xs font-medium text-[#9CA3AF] hover:text-white hover:border-[#6B7280] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      Previous
                    </button>
                    <span className="px-3 py-1.5 rounded bg-[#1E2329]/50 text-[#F3F4F6] font-medium border border-[#1E2329]">
                      Page {page}
                    </span>
                    <button
                      disabled={sessions.length < limit}
                      onClick={() => setPage(page + 1)}
                      className="rounded border border-[#1E2329] bg-[#101418] px-3 py-1.5 text-xs font-medium text-[#9CA3AF] hover:text-white hover:border-[#6B7280] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
