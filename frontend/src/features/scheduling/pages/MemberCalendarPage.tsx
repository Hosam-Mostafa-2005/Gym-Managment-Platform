// src/features/scheduling/pages/MemberCalendarPage.tsx
import { useState, useMemo } from "react";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  Flame,
  CheckCircle2,
  Clock,
  Coffee,
  ShieldCheck,
  Dumbbell,
  Filter,
  List,
  Sparkles,
} from "lucide-react";
import {
  useMemberScheduledWorkouts,
  useMemberCalendarSummary,
  useMemberAppointments,
} from "../hooks/useScheduling";
import CalendarMonthView from "../components/CalendarMonthView";
import CalendarWeekView from "../components/CalendarWeekView";
import CalendarAgendaView from "../components/CalendarAgendaView";
import ScheduledWorkoutsListView from "../components/ScheduledWorkoutsListView";
import ScheduledWorkoutDetailModal from "../components/ScheduledWorkoutDetailModal";
import AppointmentDetailModal from "../components/AppointmentDetailModal";
import ScheduleWorkoutDialog from "../components/ScheduleWorkoutDialog";
import RescheduleWorkoutDialog from "../components/RescheduleWorkoutDialog";
import BuildMonthlyProgramDialog from "../components/BuildMonthlyProgramDialog";
import type {
  ScheduledWorkout,
  CoachingAppointment,
} from "../types/scheduling.types";

type PrimaryView = "calendar" | "list";
type CalendarViewMode = "month" | "week" | "agenda";
type FilterMode = "all" | "workouts" | "appointments";

export default function MemberCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [primaryView, setPrimaryView] = useState<PrimaryView>("calendar");
  const [viewMode, setViewMode] = useState<CalendarViewMode>("month");
  const [filterMode, setFilterMode] = useState<FilterMode>("all");

  // Selected item modal states
  const [selectedWorkout, setSelectedWorkout] =
    useState<ScheduledWorkout | null>(null);
  const [workoutToReschedule, setWorkoutToReschedule] =
    useState<ScheduledWorkout | null>(null);
  const [selectedAppointment, setSelectedAppointment] =
    useState<CoachingAppointment | null>(null);

  // Dialog states
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isProgramDialogOpen, setIsProgramDialogOpen] = useState(false);
  const [scheduleInitialDate, setScheduleInitialDate] = useState<string>();

  // Fetch data
  const { data: workoutsData, isLoading: isLoadingWorkouts } =
    useMemberScheduledWorkouts();
  const { data: summaryData } = useMemberCalendarSummary();
  const { data: appointmentsData, isLoading: isLoadingAppointments } =
    useMemberAppointments();

  const workouts = workoutsData || [];
  const appointments = appointmentsData || [];

  // Filter based on active filterMode
  const filteredWorkouts = useMemo(() => {
    if (filterMode === "appointments") return [];
    return workouts;
  }, [workouts, filterMode]);

  const filteredAppointments = useMemo(() => {
    if (filterMode === "workouts") return [];
    return appointments;
  }, [appointments, filterMode]);

  // Date navigation handlers
  const handlePrev = () => {
    const d = new Date(currentDate);
    if (viewMode === "month") {
      d.setMonth(d.getMonth() - 1);
    } else if (viewMode === "week") {
      d.setDate(d.getDate() - 7);
    } else {
      d.setDate(d.getDate() - 14);
    }
    setCurrentDate(d);
  };

  const handleNext = () => {
    const d = new Date(currentDate);
    if (viewMode === "month") {
      d.setMonth(d.getMonth() + 1);
    } else if (viewMode === "week") {
      d.setDate(d.getDate() + 7);
    } else {
      d.setDate(d.getDate() + 14);
    }
    setCurrentDate(d);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleSelectDate = (dateStr: string) => {
    setScheduleInitialDate(dateStr);
    setIsScheduleOpen(true);
  };

  const formattedMonthYear = currentDate.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-[#090B0F] text-white p-4 md:p-8 space-y-6">
      {/* Top Banner / Adherence KPI Row */}
      {summaryData && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Adherence Rate */}
          <div className="p-4 rounded-2xl bg-[#101418] border border-[#1E2329] shadow-lg flex items-center justify-between">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                Weekly Adherence
              </div>
              <div className="text-2xl font-black text-[#5BE584] mt-0.5">
                {summaryData.weeklyStats.adherenceRatePct}%
              </div>
              <div className="text-[11px] text-gray-500 mt-0.5">
                {summaryData.weeklyStats.completed} of{" "}
                {summaryData.weeklyStats.totalScheduled} completed
              </div>
            </div>
            <div className="h-10 w-10 rounded-xl bg-[#16291D] border border-[#23422E] flex items-center justify-center text-[#5BE584]">
              <Flame size={20} />
            </div>
          </div>

          {/* Completed Workouts */}
          <div className="p-4 rounded-2xl bg-[#101418] border border-[#1E2329] shadow-lg flex items-center justify-between">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                Sessions Completed
              </div>
              <div className="text-2xl font-black text-white mt-0.5">
                {summaryData.weeklyStats.completed}
              </div>
              <div className="text-[11px] text-gray-500 mt-0.5">This week</div>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-[#5BE584]">
              <CheckCircle2 size={20} />
            </div>
          </div>

          {/* Upcoming Sessions */}
          <div className="p-4 rounded-2xl bg-[#101418] border border-[#1E2329] shadow-lg flex items-center justify-between">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                Upcoming Workouts
              </div>
              <div className="text-2xl font-black text-blue-400 mt-0.5">
                {summaryData.upcomingWorkouts?.length || 0}
              </div>
              <div className="text-[11px] text-gray-500 mt-0.5">Next 7 days</div>
            </div>
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Clock size={20} />
            </div>
          </div>

          {/* Rest Days */}
          <div className="p-4 rounded-2xl bg-[#101418] border border-[#1E2329] shadow-lg flex items-center justify-between">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                Rest & Recovery
              </div>
              <div className="text-2xl font-black text-purple-400 mt-0.5">
                {summaryData.restDays?.length || 0}
              </div>
              <div className="text-[11px] text-gray-500 mt-0.5">
                Recovery days this week
              </div>
            </div>
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Coffee size={20} />
            </div>
          </div>
        </div>
      )}

      {/* Header & Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#101418] border border-[#1E2329] p-4 rounded-2xl shadow-xl">
        {/* Left: Navigation or Title */}
        <div className="flex items-center gap-3">
          {primaryView === "calendar" ? (
            <>
              <div className="flex items-center gap-1 bg-[#161B22] p-1 rounded-xl border border-[#1E2329]">
                <button
                  onClick={handlePrev}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                  title="Previous"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={handleToday}
                  className="px-3 py-1 rounded-lg text-xs font-semibold text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                >
                  Today
                </button>
                <button
                  onClick={handleNext}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                  title="Next"
                >
                  <ChevronRight size={16} />
                </button>
              </div>

              <h2 className="text-lg font-bold text-white tracking-tight">
                {formattedMonthYear}
              </h2>
            </>
          ) : (
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-[#16291D] border border-[#23422E] flex items-center justify-center text-[#5BE584]">
                <Dumbbell size={18} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Scheduled Workouts
                </h2>
                <p className="text-xs text-gray-400">
                  Full list of your scheduled training sessions
                </p>
              </div>
            </div>
          )}
        </div>

        {/* View Switcher, Filter & Action */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Primary View Switcher: Calendar vs List */}
          <div
            className="flex items-center bg-[#161B22] p-1 rounded-xl border border-[#1E2329]"
            role="tablist"
            aria-label="View Switcher"
          >
            <button
              role="tab"
              aria-selected={primaryView === "calendar"}
              onClick={() => setPrimaryView("calendar")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                primaryView === "calendar"
                  ? "bg-[#5BE584] text-[#090B0F] font-bold shadow-sm"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Calendar size={13} />
              Calendar
            </button>
            <button
              role="tab"
              aria-selected={primaryView === "list"}
              onClick={() => setPrimaryView("list")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                primaryView === "list"
                  ? "bg-[#5BE584] text-[#090B0F] font-bold shadow-sm"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <List size={13} />
              List
            </button>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center bg-[#161B22] p-1 rounded-xl border border-[#1E2329] text-xs font-medium">
            <button
              onClick={() => setFilterMode("all")}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                filterMode === "all"
                  ? "bg-[#1E2530] text-white font-bold shadow-sm"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              All Events
            </button>
            <button
              onClick={() => setFilterMode("workouts")}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                filterMode === "workouts"
                  ? "bg-[#1E2530] text-white font-bold shadow-sm"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Dumbbell size={12} /> Workouts
            </button>
            <button
              onClick={() => setFilterMode("appointments")}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                filterMode === "appointments"
                  ? "bg-purple-600/30 text-purple-300 font-bold shadow-sm"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <ShieldCheck size={12} /> Appointments
            </button>
          </div>

          {/* Calendar Submode Toggle (Visible only in Calendar view) */}
          {primaryView === "calendar" && (
            <div className="flex items-center bg-[#161B22] p-1 rounded-xl border border-[#1E2329] text-xs font-semibold">
              <button
                onClick={() => setViewMode("month")}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  viewMode === "month"
                    ? "bg-white/10 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Month
              </button>
              <button
                onClick={() => setViewMode("week")}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  viewMode === "week"
                    ? "bg-white/10 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setViewMode("agenda")}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  viewMode === "agenda"
                    ? "bg-white/10 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Agenda
              </button>
            </div>
          )}

          {/* "Build 4-Week Program" */}
          <button
            onClick={() => setIsProgramDialogOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#16291D] border border-[#23422E] hover:bg-[#1E3A28] text-[#5BE584] transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Sparkles size={14} />
            Build 4-Week Program
          </button>

          {/* "+ Schedule Workout" */}
          <button
            onClick={() => {
              setScheduleInitialDate(undefined);
              setIsScheduleOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#5BE584] hover:bg-[#4dd273] text-black shadow-lg shadow-[#5BE584]/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus size={15} />
            Schedule Workout
          </button>
        </div>
      </div>

      {/* Main View Display */}
      {primaryView === "calendar" ? (
        <>
          {viewMode === "month" && (
            <CalendarMonthView
              currentDate={currentDate}
              scheduledWorkouts={filteredWorkouts}
              coachingAppointments={filteredAppointments}
              restDays={summaryData?.restDays}
              onSelectWorkout={(sw) => setSelectedWorkout(sw)}
              onSelectAppointment={(appt) => setSelectedAppointment(appt)}
              onSelectDate={handleSelectDate}
            />
          )}

          {viewMode === "week" && (
            <CalendarWeekView
              currentDate={currentDate}
              scheduledWorkouts={filteredWorkouts}
              coachingAppointments={filteredAppointments}
              restDays={summaryData?.restDays}
              onSelectWorkout={(sw) => setSelectedWorkout(sw)}
              onSelectAppointment={(appt) => setSelectedAppointment(appt)}
              onSelectDate={handleSelectDate}
            />
          )}

          {viewMode === "agenda" && (
            <CalendarAgendaView
              scheduledWorkouts={filteredWorkouts}
              coachingAppointments={filteredAppointments}
              onSelectWorkout={(sw) => setSelectedWorkout(sw)}
              onSelectAppointment={(appt) => setSelectedAppointment(appt)}
            />
          )}
        </>
      ) : (
        <ScheduledWorkoutsListView
          scheduledWorkouts={filteredWorkouts}
          isLoading={isLoadingWorkouts}
          onSelectWorkout={(sw) => setSelectedWorkout(sw)}
          onRescheduleWorkout={(sw) => setWorkoutToReschedule(sw)}
          onNewSchedule={() => {
            setScheduleInitialDate(undefined);
            setIsScheduleOpen(true);
          }}
          coachingAppointments={filteredAppointments}
          onSelectAppointment={(appt) => setSelectedAppointment(appt)}
        />
      )}

      {/* Modals */}
      <ScheduledWorkoutDetailModal
        scheduledWorkout={selectedWorkout}
        isOpen={Boolean(selectedWorkout)}
        onClose={() => setSelectedWorkout(null)}
        onReschedule={(sw) => setWorkoutToReschedule(sw)}
      />

      <AppointmentDetailModal
        appointment={selectedAppointment}
        isOpen={Boolean(selectedAppointment)}
        onClose={() => setSelectedAppointment(null)}
      />

      <ScheduleWorkoutDialog
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
        initialDate={scheduleInitialDate}
      />

      <BuildMonthlyProgramDialog
        isOpen={isProgramDialogOpen}
        onClose={() => setIsProgramDialogOpen(false)}
      />

      <RescheduleWorkoutDialog
        isOpen={Boolean(workoutToReschedule)}
        onClose={() => setWorkoutToReschedule(null)}
        scheduledWorkout={workoutToReschedule}
      />
    </div>
  );
}
