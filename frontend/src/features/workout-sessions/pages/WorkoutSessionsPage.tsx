import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Calendar, Clock, Activity, Dumbbell } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useWorkoutSessions } from "../hooks/useWorkoutSessions";

export default function WorkoutSessionsPage() {
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const { data, isLoading, isError, refetch } = useWorkoutSessions(page, limit);

  const sessions = data?.sessions ?? [];
  const totalItems = data?.results ?? 0;

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

  const handleViewSession = (id: string) => {
    navigate(`/sessions/${id}`);
  };

  const handleContinueWorkout = () => {
    navigate("/sessions/active");
  };

  return (
    <section className="space-y-8 text-white min-h-screen bg-[#090B0F] p-6 md:p-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Workout Sessions</h1>
          <p className="text-[#9CA3AF] text-sm mt-2">
            Monitor live workout activity and review completed session history.
          </p>
        </div>
        <Button
          onClick={handleContinueWorkout}
          className="bg-[#5BE584] text-black hover:bg-[#5BE584]/90 rounded-2xl font-medium px-6 py-6"
        >
          + Start Session
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-[#11151B] border-white/5 rounded-2xl text-white shadow-sm">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[#9CA3AF] text-xs font-semibold uppercase tracking-wider">
                Total Sessions
              </span>
              <Calendar size={18} className="text-[#9CA3AF]" />
            </div>
            <div className="text-4xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card className="bg-[#11151B] border-white/5 rounded-2xl text-white shadow-sm">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[#9CA3AF] text-xs font-semibold uppercase tracking-wider">
                Active Sessions
              </span>
              <Activity size={18} className="text-[#5BE584]" />
            </div>
            <div className="text-4xl font-bold flex items-center gap-3">
              {stats.inProgress}
              {stats.inProgress > 0 && (
                <span className="flex items-center gap-1.5 text-xs text-[#5BE584] bg-[#5BE584]/10 px-2 py-1 rounded-full font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5BE584] animate-pulse"></span>
                  LIVE NOW
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#11151B] border-white/5 rounded-2xl text-white shadow-sm">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[#9CA3AF] text-xs font-semibold uppercase tracking-wider">
                Completed
              </span>
              <Dumbbell size={18} className="text-[#9CA3AF]" />
            </div>
            <div className="text-4xl font-bold">{stats.completed}</div>
          </CardContent>
        </Card>

        <Card className="bg-[#11151B] border-white/5 rounded-2xl text-white shadow-sm">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[#9CA3AF] text-xs font-semibold uppercase tracking-wider">
                Avg Duration
              </span>
              <Clock size={18} className="text-[#9CA3AF]" />
            </div>
            <div className="text-4xl font-bold">{stats.averageDuration}m</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
            size={18}
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name or ID..."
            className="w-full bg-[#11151B] border-white/5 rounded-2xl h-12 pl-12 pr-4 text-white placeholder:text-[#9CA3AF] focus-visible:ring-1 focus-visible:ring-[#5BE584]/50 focus-visible:ring-offset-0"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#11151B] border border-white/5 rounded-2xl px-4 h-12 text-white focus:outline-none focus:border-[#5BE584]/50 cursor-pointer appearance-none min-w-[140px] text-sm"
          >
            <option value="all">All Status</option>
            <option value="IN_PROGRESS">Active</option>
            <option value="COMPLETED">Completed</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-[#11151B] border border-white/5 rounded-2xl px-4 h-12 text-white focus:outline-none focus:border-[#5BE584]/50 cursor-pointer appearance-none min-w-[140px] text-sm"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="duration">Duration</option>
          </select>
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center items-center h-64 bg-[#11151B] border border-white/5 rounded-2xl">
          <span className="w-8 h-8 border-2 border-[#5BE584] border-t-transparent rounded-full animate-spin"></span>
        </div>
      )}

      {isError && (
        <div className="flex flex-col justify-center items-center h-64 bg-[#11151B] border border-white/5 rounded-2xl">
          <p className="text-red-400 mb-4">Error loading sessions.</p>
          <Button
            onClick={() => refetch()}
            variant="outline"
            className="border-white/10 text-white hover:bg-white/5"
          >
            Try Again
          </Button>
        </div>
      )}

      {!isLoading && !isError && filteredSessions.length === 0 && (
        <div className="flex flex-col justify-center items-center h-64 bg-[#11151B] border border-white/5 rounded-2xl">
          <p className="text-[#9CA3AF] mb-6">No workout sessions found.</p>
          {search || statusFilter !== "all" ? (
            <Button
              onClick={() => {
                setSearch("");
                setStatusFilter("all");
              }}
              variant="outline"
              className="border-white/10 text-white hover:bg-white/5 rounded-xl h-10 px-6"
            >
              Clear Filters
            </Button>
          ) : (
            <Button
              onClick={handleContinueWorkout}
              className="bg-[#5BE584] text-black hover:bg-[#5BE584]/90 rounded-xl h-10 px-6 font-medium"
            >
              Start your first workout
            </Button>
          )}
        </div>
      )}

      {!isLoading && !isError && filteredSessions.length > 0 && (
        <div className="bg-[#11151B] border border-white/5 rounded-2xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="text-[#9CA3AF] border-b border-white/5 uppercase text-xs tracking-wider">
                <tr>
                  <th className="px-6 py-5 font-medium">Workout</th>
                  <th className="px-6 py-5 font-medium">Coach</th>
                  <th className="px-6 py-5 font-medium">Time</th>
                  <th className="px-6 py-5 font-medium">Progress</th>
                  <th className="px-6 py-5 font-medium text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredSessions.map((session) => (
                  <tr
                    key={session.id}
                    onClick={() => handleViewSession(session.id)}
                    className="hover:bg-white/[0.03] transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-5">
                      <div className="font-semibold text-white group-hover:text-[#5BE584] transition-colors">
                        {session.assignment.workout.title}
                      </div>
                      <div className="text-[#9CA3AF] text-xs mt-1">
                        ID: M-{session.id.slice(-4).toUpperCase()}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-[#9CA3AF]">
                      {session.assignment.trainer.name}
                    </td>
                    <td className="px-6 py-5 text-[#9CA3AF]">
                      <div className="font-medium text-white">
                        {new Date(session.startedAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                      <div className="text-xs mt-1">
                        {session.duration ?? 0}m elapsed
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-32 h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              session.status === "COMPLETED"
                                ? "bg-white/30"
                                : session.status === "IN_PROGRESS"
                                  ? "bg-[#5BE584]"
                                  : "bg-orange-400"
                            }`}
                            style={{ width: `${session.progress ?? 0}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-medium text-[#9CA3AF] w-8">
                          {session.progress ?? 0}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <span
                        className={`inline-flex items-center justify-center px-3 py-1.5 rounded-full text-xs font-medium border ${
                          session.status === "IN_PROGRESS"
                            ? "bg-[#5BE584]/10 border-[#5BE584]/20 text-[#5BE584]"
                            : session.status === "COMPLETED"
                              ? "bg-white/5 border-white/5 text-[#9CA3AF]"
                              : "bg-orange-400/10 border-orange-400/20 text-orange-400"
                        }`}
                      >
                        {session.status === "IN_PROGRESS" && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#5BE584] mr-2 animate-pulse"></span>
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

          <div className="flex items-center justify-between px-6 py-4 border-t border-white/5 text-sm text-[#9CA3AF] bg-black/20">
            <div>
              Showing {filteredSessions.length} of {stats.total} active sessions
            </div>
            <div className="flex items-center gap-6">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="flex items-center gap-1 hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="font-medium text-white bg-white/5 px-3 py-1 rounded-lg">
                Page {page}
              </span>
              <button
                disabled={sessions.length < limit}
                onClick={() => setPage(page + 1)}
                className="flex items-center gap-1 hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
