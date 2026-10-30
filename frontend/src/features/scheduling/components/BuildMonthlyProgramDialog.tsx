// src/features/scheduling/components/BuildMonthlyProgramDialog.tsx
import { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import {
  Calendar,
  Sparkles,
  Clock,
  Dumbbell,
  CheckCircle2,
  X,
  Layers,
  Loader2,
  Coffee,
  AlertCircle,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useWorkouts } from "@/features/workouts/hooks/useWorkouts";
import { useAuthStore } from "@/store/auth.store";
import * as schedulingApi from "../api/scheduling.api";

interface BuildMonthlyProgramDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface DayConfig {
  isTraining: boolean;
  workoutId: string;
}

const DAYS_OF_WEEK = [
  { key: "monday", labelKey: "weekdays.monday", shortKey: "weekdaysShort.mon", offset: 0 },
  { key: "tuesday", labelKey: "weekdays.tuesday", shortKey: "weekdaysShort.tue", offset: 1 },
  { key: "wednesday", labelKey: "weekdays.wednesday", shortKey: "weekdaysShort.wed", offset: 2 },
  { key: "thursday", labelKey: "weekdays.thursday", shortKey: "weekdaysShort.thu", offset: 3 },
  { key: "friday", labelKey: "weekdays.friday", shortKey: "weekdaysShort.fri", offset: 4 },
  { key: "saturday", labelKey: "weekdays.saturday", shortKey: "weekdaysShort.sat", offset: 5 },
  { key: "sunday", labelKey: "weekdays.sunday", shortKey: "weekdaysShort.sun", offset: 6 },
] as const;

export default function BuildMonthlyProgramDialog({
  isOpen,
  onClose,
  onSuccess,
}: BuildMonthlyProgramDialogProps) {
  const { t } = useTranslation(["trainingCalendar"]);
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  // Compute upcoming Monday as default start date
  const defaultMondayStr = useMemo(() => {
    const d = new Date();
    const day = d.getDay(); // 0 is Sunday, 1 is Monday...
    const diff = day === 0 ? 1 : (8 - day) % 7 || 7; // next Monday
    const nextMon = new Date(d);
    nextMon.setDate(d.getDate() + diff);
    return nextMon.toISOString().split("T")[0];
  }, []);

  const [programName, setProgramName] = useState(() => t("programDialog.defaultProgramName"));
  const [startDate, setStartDate] = useState(defaultMondayStr);
  const [durationWeeks, setDurationWeeks] = useState(4);
  const [preferredTime, setPreferredTime] = useState("09:00");
  const [isGenerating, setIsGenerating] = useState(false);
  const [progressMsg, setProgressMsg] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setProgramName(t("programDialog.defaultProgramName"));
      setError(null);
    }
  }, [isOpen, t]);

  // 7-day configuration (Mon..Sun)
  const [weeklySplit, setWeeklySplit] = useState<Record<string, DayConfig>>({
    monday: { isTraining: true, workoutId: "" },
    tuesday: { isTraining: true, workoutId: "" },
    wednesday: { isTraining: false, workoutId: "" },
    thursday: { isTraining: true, workoutId: "" },
    friday: { isTraining: true, workoutId: "" },
    saturday: { isTraining: false, workoutId: "" },
    sunday: { isTraining: false, workoutId: "" },
  });

  // Load available workouts
  const { data: workoutsData, isLoading: isLoadingWorkouts } = useWorkouts();
  const workouts = useMemo(() => {
    if (Array.isArray(workoutsData)) return workoutsData;
    return (workoutsData as any)?.workouts || [];
  }, [workoutsData]);

  // Separate into personal and library templates
  const { personalWorkouts, templateWorkouts } = useMemo(() => {
    const personal: any[] = [];
    const templates: any[] = [];

    for (const w of workouts) {
      if (w.isActive === false) continue;
      const creatorId =
        typeof w.createdBy === "object" && w.createdBy !== null
          ? w.createdBy.id || w.createdBy._id
          : typeof w.creator === "object" && w.creator !== null
            ? w.creator.id || w.creator._id
            : w.createdById || w.createdBy || (w as any).userId;

      const isOwner = Boolean(
        user?.id &&
          creatorId &&
          String(creatorId).toLowerCase() === String(user.id).toLowerCase(),
      );

      if (isOwner) {
        personal.push(w);
      } else if (w.isTemplate) {
        templates.push(w);
      }
    }

    return { personalWorkouts: personal, templateWorkouts: templates };
  }, [workouts, user]);

  // Set default workout selections if unselected
  const allAvailableWorkouts = useMemo(
    () => [...personalWorkouts, ...templateWorkouts],
    [personalWorkouts, templateWorkouts],
  );

  const toggleDayTraining = (dayKey: string) => {
    setWeeklySplit((prev) => {
      const cur = prev[dayKey];
      const willBeTraining = !cur.isTraining;
      return {
        ...prev,
        [dayKey]: {
          isTraining: willBeTraining,
          workoutId: willBeTraining
            ? cur.workoutId || (allAvailableWorkouts[0]?.id || allAvailableWorkouts[0]?._id || "")
            : "",
        },
      };
    });
  };

  const handleWorkoutChange = (dayKey: string, workoutId: string) => {
    setWeeklySplit((prev) => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        workoutId,
      },
    }));
  };

  // Quick Preset Handlers
  const applyPreset = (presetType: "push_pull_legs" | "upper_lower" | "full_body") => {
    const firstWId = allAvailableWorkouts[0]?.id || allAvailableWorkouts[0]?._id || "";
    const secondWId = allAvailableWorkouts[1]?.id || allAvailableWorkouts[1]?._id || firstWId;
    const thirdWId = allAvailableWorkouts[2]?.id || allAvailableWorkouts[2]?._id || secondWId;

    if (presetType === "push_pull_legs") {
      setProgramName(t("programDialog.presetPPLProgramName"));
      setWeeklySplit({
        monday: { isTraining: true, workoutId: firstWId },
        tuesday: { isTraining: true, workoutId: secondWId },
        wednesday: { isTraining: false, workoutId: "" },
        thursday: { isTraining: true, workoutId: thirdWId },
        friday: { isTraining: true, workoutId: firstWId },
        saturday: { isTraining: false, workoutId: "" },
        sunday: { isTraining: false, workoutId: "" },
      });
    } else if (presetType === "upper_lower") {
      setProgramName(t("programDialog.presetULProgramName"));
      setWeeklySplit({
        monday: { isTraining: true, workoutId: firstWId },
        tuesday: { isTraining: true, workoutId: secondWId },
        wednesday: { isTraining: false, workoutId: "" },
        thursday: { isTraining: true, workoutId: firstWId },
        friday: { isTraining: true, workoutId: secondWId },
        saturday: { isTraining: false, workoutId: "" },
        sunday: { isTraining: false, workoutId: "" },
      });
    } else if (presetType === "full_body") {
      setProgramName(t("programDialog.presetFBProgramName"));
      setWeeklySplit({
        monday: { isTraining: true, workoutId: firstWId },
        tuesday: { isTraining: false, workoutId: "" },
        wednesday: { isTraining: true, workoutId: secondWId },
        thursday: { isTraining: false, workoutId: "" },
        friday: { isTraining: true, workoutId: thirdWId },
        saturday: { isTraining: false, workoutId: "" },
        sunday: { isTraining: false, workoutId: "" },
      });
    }
  };

  // Calculate training sessions count
  const activeTrainingDaysPerWeek = useMemo(() => {
    return Object.values(weeklySplit).filter((d) => d.isTraining && d.workoutId).length;
  }, [weeklySplit]);

  const totalSessions = activeTrainingDaysPerWeek * durationWeeks;

  const handleGenerateProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!programName.trim()) {
      setError(t("programDialog.errName"));
      return;
    }

    if (!startDate) {
      setError(t("programDialog.errStartDate"));
      return;
    }

    if (activeTrainingDaysPerWeek === 0) {
      setError(t("programDialog.errNoDays"));
      return;
    }

    // Verify all active training days have a workout selected
    for (const day of DAYS_OF_WEEK) {
      const config = weeklySplit[day.key];
      if (config.isTraining && !config.workoutId) {
        setError(t("programDialog.errDayMissingWorkout", { day: t(day.labelKey as any) }));
        return;
      }
    }

    try {
      setIsGenerating(true);
      const baseStart = new Date(`${startDate}T${preferredTime}:00`);
      let createdCount = 0;

      // Loop through each week and each day of the week
      for (let week = 1; week <= durationWeeks; week++) {
        setProgressMsg(
          t("programDialog.schedulingWeekProgress", {
            week,
            total: durationWeeks,
          }),
        );

        for (const day of DAYS_OF_WEEK) {
          const config = weeklySplit[day.key];
          if (!config.isTraining || !config.workoutId) continue;

          // Calculate specific date
          const sessionDate = new Date(baseStart);
          const dayOffset = (week - 1) * 7 + day.offset;
          sessionDate.setDate(baseStart.getDate() + dayOffset);

          // Find workout title for note
          const matchedWorkout = allAvailableWorkouts.find(
            (w) => (w.id || w._id) === config.workoutId,
          );
          const workoutTitle = matchedWorkout?.title || t("programDialog.workoutFallback");

          await schedulingApi.createScheduledWorkout({
            workoutId: config.workoutId,
            scheduledAt: sessionDate.toISOString(),
            notes: t("programDialog.programNote", {
              name: programName.trim(),
              week,
              day: t(day.labelKey as any),
              workout: workoutTitle,
            }),
          });

          createdCount++;
        }
      }

      toast.success(
        t("programDialog.successToast", {
          name: programName,
          count: createdCount,
        }),
      );

      // Invalidate calendar caches so new scheduled workouts display immediately
      queryClient.invalidateQueries({ queryKey: ["member-scheduled-workouts"] });
      queryClient.invalidateQueries({ queryKey: ["member-calendar-summary"] });
      queryClient.invalidateQueries({ queryKey: ["scheduled-workouts"] });

      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Failed to generate program:", err);
      setError(
        err?.response?.data?.message ||
          t("programDialog.errFailed"),
      );
    } finally {
      setIsGenerating(false);
      setProgressMsg("");
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] overflow-y-auto bg-black/80 backdrop-blur-md">
      <div className="min-h-full flex items-center justify-center p-4">
        <div className="bg-[#0D1014] border border-[#1E2329] rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-[#1E2329]">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#16291D] border border-[#23422E] text-[#5BE584]">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  {t("programDialog.title")}
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#16291D] border border-[#23422E] text-[#5BE584]">
                    {t("programDialog.badge")}
                  </span>
                </h3>
                <p className="text-xs text-[#9CA3AF]">
                  {t("programDialog.subtitle")}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              disabled={isGenerating}
              className="text-[#9CA3AF] hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5 disabled:opacity-40"
            >
              <X size={18} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleGenerateProgram} className="p-6 space-y-6">
            {error && (
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium">
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Program Name & Start Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-[#9CA3AF] mb-1.5 block">
                  {t("programDialog.programNameLabel")}
                </label>
                <input
                  type="text"
                  value={programName}
                  onChange={(e) => setProgramName(e.target.value)}
                  placeholder={t("programDialog.programNamePlaceholder")}
                  required
                  disabled={isGenerating}
                  className="w-full bg-[#101418] border border-[#1E2329] rounded-xl px-3.5 py-2 text-xs text-white placeholder-[#6B7280] focus:outline-none focus:border-[#5BE584]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium text-[#9CA3AF] mb-1.5 block">
                    {t("programDialog.durationLabel")}
                  </label>
                  <select
                    value={durationWeeks}
                    onChange={(e) => setDurationWeeks(Number(e.target.value))}
                    disabled={isGenerating}
                    className="w-full bg-[#101418] border border-[#1E2329] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#5BE584]"
                  >
                    <option value={2}>{t("programDialog.duration2Weeks")}</option>
                    <option value={4}>{t("programDialog.duration4Weeks")}</option>
                    <option value={6}>{t("programDialog.duration6Weeks")}</option>
                    <option value={8}>{t("programDialog.duration8Weeks")}</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-[#9CA3AF] mb-1.5 block">
                    {t("programDialog.defaultTimeLabel")}
                  </label>
                  <input
                    type="time"
                    value={preferredTime}
                    onChange={(e) => setPreferredTime(e.target.value)}
                    disabled={isGenerating}
                    className="w-full bg-[#101418] border border-[#1E2329] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#5BE584]"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-[#9CA3AF] mb-1.5 block">
                {t("programDialog.startDateLabel")}
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                disabled={isGenerating}
                className="w-full bg-[#101418] border border-[#1E2329] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#5BE584]"
              />
            </div>

            {/* Quick Presets */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-white">
                  {t("programDialog.quickPresetsTitle")}
                </span>
                <span className="text-[11px] text-[#6B7280]">
                  {t("programDialog.quickPresetsHint")}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => applyPreset("push_pull_legs")}
                  disabled={isGenerating}
                  className="px-3 py-1.5 rounded-lg border border-[#1E2329] bg-[#101418] text-xs font-medium text-[#9CA3AF] hover:text-[#5BE584] hover:border-[#23422E] transition-colors"
                >
                  {t("programDialog.presetPushPullLegs")}
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset("upper_lower")}
                  disabled={isGenerating}
                  className="px-3 py-1.5 rounded-lg border border-[#1E2329] bg-[#101418] text-xs font-medium text-[#9CA3AF] hover:text-[#5BE584] hover:border-[#23422E] transition-colors"
                >
                  {t("programDialog.presetUpperLower")}
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset("full_body")}
                  disabled={isGenerating}
                  className="px-3 py-1.5 rounded-lg border border-[#1E2329] bg-[#101418] text-xs font-medium text-[#9CA3AF] hover:text-[#5BE584] hover:border-[#23422E] transition-colors"
                >
                  {t("programDialog.presetFullBody")}
                </button>
              </div>
            </div>

            {/* Weekly Training Split Configuration */}
            <div className="space-y-3">
              <label className="text-xs font-semibold text-white block">
                {t("programDialog.weeklyScheduleTitle")}
              </label>

              <div className="space-y-2 rounded-xl border border-[#1E2329] bg-[#101418]/60 p-3 max-h-[260px] overflow-y-auto">
                {DAYS_OF_WEEK.map((day) => {
                  const dayConfig = weeklySplit[day.key];

                  return (
                    <div
                      key={day.key}
                      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-lg border transition-all ${
                        dayConfig.isTraining
                          ? "bg-[#141A1F] border-[#2A313A]"
                          : "bg-[#0D1014]/40 border-transparent opacity-60 hover:opacity-100"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => toggleDayTraining(day.key)}
                          disabled={isGenerating}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs transition-colors shrink-0 ${
                            dayConfig.isTraining
                              ? "bg-[#5BE584] text-[#090B0F]"
                              : "bg-[#1E2329] text-[#6B7280] hover:text-white"
                          }`}
                        >
                          {t(day.shortKey as any)}
                        </button>
                        <div>
                          <div className="text-xs font-semibold text-white">
                            {t(day.labelKey as any)}
                          </div>
                          <div className="text-[10px] text-[#6B7280]">
                            {dayConfig.isTraining
                              ? t("programDialog.trainingDay")
                              : t("programDialog.restAndRecovery")}
                          </div>
                        </div>
                      </div>

                      {dayConfig.isTraining ? (
                        <div className="flex-1 sm:max-w-xs">
                          <select
                            value={dayConfig.workoutId}
                            onChange={(e) =>
                              handleWorkoutChange(day.key, e.target.value)
                            }
                            disabled={isGenerating}
                            className="w-full bg-[#101418] border border-[#1E2329] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#5BE584]"
                          >
                            <option value="">{t("programDialog.selectRoutinePlaceholder")}</option>
                            {personalWorkouts.length > 0 && (
                              <optgroup label={t("programDialog.myRoutinesOptgroup")}>
                                {personalWorkouts.map((w: any) => (
                                  <option key={w.id || w._id} value={w.id || w._id}>
                                    {w.title} ({w.estimatedDuration || 45}m)
                                  </option>
                                ))}
                              </optgroup>
                            )}
                            {templateWorkouts.length > 0 && (
                              <optgroup label={t("programDialog.libraryTemplatesOptgroup")}>
                                {templateWorkouts.map((w: any) => (
                                  <option key={w.id || w._id} value={w.id || w._id}>
                                    {w.title} ({w.category || t("programDialog.template")})
                                  </option>
                                ))}
                              </optgroup>
                            )}
                          </select>
                        </div>
                      ) : (
                        <div className="text-[11px] text-[#6B7280] flex items-center gap-1.5 px-3 py-1">
                          <Coffee size={13} className="shrink-0" />
                          <span>{t("programDialog.activeRest")}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Summary & Metrics */}
            <div className="rounded-xl border border-[#23422E] bg-[#16291D]/30 p-4 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-[#5BE584] flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="shrink-0" />
                  {t("programDialog.projectionTitle")}
                </div>
                <div className="text-[11px] text-[#9CA3AF] mt-0.5">
                  {t("programDialog.projectionText", { totalSessions, durationWeeks })}
                </div>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold text-white">
                  {t("programDialog.workoutsCount", { count: totalSessions })}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isGenerating}
                className="px-4 py-2 text-xs font-semibold text-[#9CA3AF] hover:text-white transition-colors"
              >
                {t("programDialog.cancel")}
              </button>

              <button
                type="submit"
                disabled={isGenerating || totalSessions === 0}
                className="inline-flex items-center gap-2 rounded-xl bg-[#5BE584] px-5 py-2.5 text-xs font-bold text-[#090B0F] transition-all hover:bg-[#4ade80] shadow-md shadow-[#5BE584]/10 disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    <span>{progressMsg || t("programDialog.generating")}</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={15} />
                    <span>{t("programDialog.generateBtn", { weeks: durationWeeks })}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body,
  );
}
