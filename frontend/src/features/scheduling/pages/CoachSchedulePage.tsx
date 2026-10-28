// src/features/scheduling/pages/CoachSchedulePage.tsx
import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  ShieldCheck,
  Dumbbell,
  User,
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  List,
} from "lucide-react";
import { formatMemberDisplay } from "@/features/users/utils/user-display";
import {
  useCoachScheduledWorkouts,
  useCoachAppointments,
  useCoachAgenda,
} from "../hooks/useScheduling";
import { useMembersManagement } from "@/features/members-management/hooks/use-members-management";
import CalendarMonthView from "../components/CalendarMonthView";
import CalendarWeekView from "../components/CalendarWeekView";
import CalendarAgendaView from "../components/CalendarAgendaView";
import ScheduledWorkoutsListView from "../components/ScheduledWorkoutsListView";
import ScheduledWorkoutDetailModal from "../components/ScheduledWorkoutDetailModal";
import AppointmentDetailModal from "../components/AppointmentDetailModal";
import ScheduleWorkoutDialog from "../components/ScheduleWorkoutDialog";
import BookAppointmentDialog from "../components/BookAppointmentDialog";
import RescheduleWorkoutDialog from "../components/RescheduleWorkoutDialog";
import type {
  ScheduledWorkout,
  CoachingAppointment,
} from "../types/scheduling.types";

type PrimaryView = "calendar" | "list";
type CalendarViewMode = "month" | "week" | "agenda";
type FilterMode = "all" | "workouts" | "appointments";

export default function CoachSchedulePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const memberFromUrl = searchParams.get("memberId");

  const [currentDate, setCurrentDate] = useState(new Date());
  const [primaryView, setPrimaryView] = useState<PrimaryView>("calendar");
  const [viewMode, setViewMode] = useState<CalendarViewMode>("week");
  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const [selectedMemberId, setSelectedMemberId] = useState<string>(
    memberFromUrl || "all",
  );

  useEffect(() => {
    if (memberFromUrl) {
      setSelectedMemberId(memberFromUrl);
    }
  }, [memberFromUrl]);

  // Selected item modal states
  const [selectedWorkout, setSelectedWorkout] =
    useState<ScheduledWorkout | null>(null);
  const [workoutToReschedule, setWorkoutToReschedule] =
    useState<ScheduledWorkout | null>(null);
  const [selectedAppointment, setSelectedAppointment] =
    useState<CoachingAppointment | null>(null);

  // Dialog states
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isBookApptOpen, setIsBookApptOpen] = useState(false);
  const [initialDateForDialog, setInitialDateForDialog] = useState<string>();

  // Fetch athletes
  const { data: membersData } = useMembersManagement();
  const rawMembers = (membersData as any)?.members || [];
  const members = useMemo(
    () => rawMembers.map((m: any) => m.member || m),
    [rawMembers],
  );

  // Fetch coach schedule and appointments
  const queryParams = useMemo(() => {
    return selectedMemberId !== "all"
      ? { memberId: selectedMemberId }
      : undefined;
  }, [selectedMemberId]);

  const { data: workoutsData, isLoading: isLoadingWorkouts } =
    useCoachScheduledWorkouts(queryParams);
  const { data: appointmentsData, isLoading: isLoadingAppointments } =
    useCoachAppointments(queryParams);
  const { data: agendaData } = useCoachAgenda();

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
    setInitialDateForDialog(dateStr);
    setIsBookApptOpen(true);
  };

  const formattedMonthYear = currentDate.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-[#090B0F] text-white p-4 md:p-8 space-y-6">
      {/* Coach Agenda Overview Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Today's Appointments */}
        <div className="p-4 rounded-2xl bg-[#101418] border border-[#1E2329] shadow-lg flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              Today's Appointments
            </div>
            <div className="text-2xl font-black text-purple-400 mt-0.5">
              {agendaData?.todayAppointments?.length || 0}
            </div>
            <div className="text-[11px] text-gray-500 mt-0.5">
              Consultations & reviews today
            </div>
          </div>
          <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <ShieldCheck size={20} />
          </div>
        </div>

        {/* Scheduled Athlete Workouts */}
        <div className="p-4 rounded-2xl bg-[#101418] border border-[#1E2329] shadow-lg flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              Athletes Training Sessions
            </div>
            <div className="text-2xl font-black text-[#5BE584] mt-0.5">
              {workouts.length}
            </div>
            <div className="text-[11px] text-gray-500 mt-0.5">
              Active scheduled workouts
            </div>
          </div>
          <div className="h-10 w-10 rounded-xl bg-[#16291D] border border-[#23422E] flex items-center justify-center text-[#5BE584]">
            <Dumbbell size={20} />
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="p-4 rounded-2xl bg-[#101418] border border-[#1E2329] shadow-lg flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              Upcoming Follow-ups
            </div>
            <div className="text-2xl font-black text-blue-400 mt-0.5">
              {agendaData?.upcomingAppointments?.length || 0}
            </div>
            <div className="text-[11px] text-gray-500 mt-0.5">
              Next 14 days
            </div>
          </div>
          <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Clock size={20} />
          </div>
        </div>
      </div>

      {/* Control Bar with Athlete Filter & Action Buttons */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#101418] border border-[#1E2329] p-4 rounded-2xl shadow-xl">
        {/* Navigation & Month (in calendar view) or Title (in list view) */}
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
                  Coach Workouts & Schedule
                </h2>
                <p className="text-xs text-gray-400">
                  Manage athlete training schedules and appointments
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Athlete Filter Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 font-semibold flex items-center gap-1">
            <Users size={13} className="text-[#5BE584]" />
            Athlete:
          </span>
          <select
            value={selectedMemberId}
            onChange={(e) => setSelectedMemberId(e.target.value)}
            className="bg-[#161B22] border border-[#1E2329] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#5BE584]"
          >
            <option value="all">All Athletes ({members.length})</option>
            {members.map((m: any) => {
              const display = formatMemberDisplay(m);
              return (
                <option key={display.id} value={display.id}>
                  {display.displayName}
                  {display.isTestAccount ? " [Demo Account]" : ""}
                </option>
              );
            })}
          </select>
        </div>

        {/* Filters, View Toggle & Actions */}
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
              All
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

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const targetUrl =
                  selectedMemberId && selectedMemberId !== "all"
                    ? `/coach/schedule/new?memberId=${selectedMemberId}`
                    : "/coach/schedule/new";
                navigate(targetUrl);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-[#16291D] border border-[#23422E] text-[#5BE584] hover:bg-[#1f3a29] transition-all"
              title="Schedule using dedicated form"
            >
              <FileText size={14} />
              Schedule with Form
            </button>

            <button
              onClick={() => {
                setInitialDateForDialog(undefined);
                setIsScheduleOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-[#161B22] border border-[#1E2329] text-gray-300 hover:text-white hover:bg-white/5 transition-all"
              title="Quick Schedule Dialog"
            >
              <Plus size={14} />
              Quick Schedule
            </button>

            <button
              onClick={() => {
                setInitialDateForDialog(undefined);
                setIsBookApptOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus size={14} />
              Book Appointment
            </button>
          </div>
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
              onSelectWorkout={(sw) => setSelectedWorkout(sw)}
              onSelectAppointment={(appt) => setSelectedAppointment(appt)}
              onSelectDate={handleSelectDate}
              isCoachView={true}
            />
          )}

          {viewMode === "week" && (
            <CalendarWeekView
              currentDate={currentDate}
              scheduledWorkouts={filteredWorkouts}
              coachingAppointments={filteredAppointments}
              onSelectWorkout={(sw) => setSelectedWorkout(sw)}
              onSelectAppointment={(appt) => setSelectedAppointment(appt)}
              onSelectDate={handleSelectDate}
              isCoachView={true}
            />
          )}

          {viewMode === "agenda" && (
            <CalendarAgendaView
              scheduledWorkouts={filteredWorkouts}
              coachingAppointments={filteredAppointments}
              onSelectWorkout={(sw) => setSelectedWorkout(sw)}
              onSelectAppointment={(appt) => setSelectedAppointment(appt)}
              isCoachView={true}
            />
          )}
        </>
      ) : (
        <ScheduledWorkoutsListView
          scheduledWorkouts={filteredWorkouts}
          isLoading={isLoadingWorkouts}
          isCoachView={true}
          onSelectWorkout={(sw) => setSelectedWorkout(sw)}
          onRescheduleWorkout={(sw) => setWorkoutToReschedule(sw)}
          onNewSchedule={() => {
            setInitialDateForDialog(undefined);
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
        isCoachView={true}
        onReschedule={(sw) => setWorkoutToReschedule(sw)}
      />

      <AppointmentDetailModal
        appointment={selectedAppointment}
        isOpen={Boolean(selectedAppointment)}
        onClose={() => setSelectedAppointment(null)}
        isCoachView={true}
      />

      <ScheduleWorkoutDialog
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
        initialDate={initialDateForDialog}
        isCoach={true}
        preselectedMemberId={
          selectedMemberId !== "all" ? selectedMemberId : undefined
        }
      />

      <BookAppointmentDialog
        isOpen={isBookApptOpen}
        onClose={() => setIsBookApptOpen(false)}
        initialDate={initialDateForDialog}
        preselectedMemberId={
          selectedMemberId !== "all" ? selectedMemberId : undefined
        }
      />

      <RescheduleWorkoutDialog
        isOpen={Boolean(workoutToReschedule)}
        onClose={() => setWorkoutToReschedule(null)}
        scheduledWorkout={workoutToReschedule}
        isCoach={true}
      />
    </div>
  );
}
