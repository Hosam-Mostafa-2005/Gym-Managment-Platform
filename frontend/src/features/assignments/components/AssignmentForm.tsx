import { useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Save,
  Loader2,
  Calendar,
  Dumbbell,
  UserCheck,
  FileText,
  ShieldCheck,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { SearchableMemberSelect } from "@/features/users/components/SearchableMemberSelect";

// Types & Schema
import {
  assignmentSchema,
  type AssignmentFormValues,
} from "@/features/assignments/schemas/assignment.schema";

// Shadcn UI & Hooks
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWorkouts } from "@/features/workouts/hooks/useWorkouts";
import { useUsers } from "@/features/users/hooks/useUsers";
import { useMembersManagement } from "@/features/members-management/hooks/use-members-management";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";

interface AssignmentFormProps {
  initialValues?: Partial<AssignmentFormValues>;
  preselectedMember?: any;
  onSubmit: (data: AssignmentFormValues) => void;
  isLoading?: boolean;
  submitLabel?: string;
}

export const AssignmentForm = ({
  initialValues,
  preselectedMember,
  onSubmit,
  isLoading = false,
  submitLabel,
}: AssignmentFormProps) => {
  const { t } = useTranslation(["assignments", "common"]);
  const { data: user } = useCurrentUser();
  const userRole = user?.role?.toUpperCase();
  const isCoach = userRole === "TRAINER" || userRole === "COACH";

  // 1. Fetch real workouts
  const { data: workouts = [], isLoading: loadingWorkouts } = useWorkouts();

  // 2. Fetch members and trainers
  // For Admins: retrieve all system members
  const {
    data: adminMembers = [],
    isLoading: loadingAdminMembers,
    isError: errorAdminMembers,
  } = useUsers(!isCoach ? "member" : undefined, { enabled: !isCoach });

  // For Coaches: retrieve only members managed by the logged-in coach
  const {
    data: coachMembersData,
    isLoading: loadingCoachMembers,
    isError: errorCoachMembers,
  } = useMembersManagement(isCoach ? { limit: 100 } : undefined, {
    enabled: isCoach,
  });

  const { data: trainers = [], isLoading: loadingTrainers } = useUsers(
    "trainer",
    { enabled: !isCoach },
  );

  // Adapt coach members to the shape expected by SearchableMemberSelect
  const coachMembers = useMemo(() => {
    if (!coachMembersData?.members) return [];
    return coachMembersData.members.map((card) => ({
      id: card.member.id,
      _id: card.member.id,
      name: card.member.name,
      email: card.member.email,
      role: "member",
      isActive: card.member.isActive,
      joinedAt: card.member.joinedAt,
      member: card.member,
      relationship: card.relationship,
      currentWorkout: card.assignment?.currentWorkout,
    }));
  }, [coachMembersData?.members]);

  const members = useMemo(() => {
    return isCoach ? coachMembers : adminMembers;
  }, [isCoach, coachMembers, adminMembers]);

  const loadingMembers = isCoach ? loadingCoachMembers : loadingAdminMembers;
  const errorMembers = isCoach ? errorCoachMembers : errorAdminMembers;

  // Default dates
  const defaultDates = useMemo(() => {
    const today = new Date();
    const nextMonth = new Date();
    nextMonth.setDate(today.getDate() + 30);

    return {
      start: today.toISOString().split("T")[0],
      end: nextMonth.toISOString().split("T")[0],
    };
  }, []);

  const coachId = user?.id || (user as any)?._id || "";

  // React Hook Form with Zod
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<AssignmentFormValues>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      member: initialValues?.member || "",
      trainer: isCoach ? coachId : initialValues?.trainer || "",
      workout: initialValues?.workout || "",
      startDate: initialValues?.startDate || defaultDates.start,
      endDate: initialValues?.endDate || defaultDates.end,
      status: initialValues?.status,
      cancelReason: initialValues?.cancelReason || "",
      notes: initialValues?.notes || "",
    },
  });

  // Sync initialValues & lock coach identity
  useEffect(() => {
    if (initialValues?.workout) {
      setValue("workout", initialValues.workout, { shouldValidate: true });
    }
    if (initialValues?.member) {
      setValue("member", initialValues.member, { shouldValidate: true });
    }
  }, [initialValues?.workout, initialValues?.member, setValue]);

  useEffect(() => {
    if (isCoach && coachId) {
      setValue("trainer", coachId, { shouldValidate: true });
    }
  }, [isCoach, coachId, setValue]);

  const selectedStatus = watch("status");
  const isEditMode = Boolean(initialValues && initialValues.status);

  const isFormDisabled =
    isLoading ||
    loadingWorkouts ||
    loadingMembers ||
    (!isCoach && loadingTrainers);

  const submitHandler = (data: AssignmentFormValues) => {
    onSubmit({
      ...data,
      trainer: isCoach ? coachId : data.trainer || coachId,
    });
  };

  const translateValidation = (msg?: string) => {
    if (!msg) return "";
    switch (msg) {
      case "Please select a member":
        return t("validation.selectMember", msg);
      case "Please select a workout routine":
        return t("validation.selectWorkout", msg);
      case "Start date is required":
        return t("validation.startDateRequired", msg);
      case "End date is required":
        return t("validation.endDateRequired", msg);
      case "End date cannot be earlier than the start date":
        return t("validation.dateRangeInvalid", msg);
      case "Cancel reason cannot exceed 500 characters":
        return t("validation.cancelReasonMax", msg);
      case "Cancel reason is required when cancelling an assignment":
        return t("validation.cancelReasonRequired", msg);
      case "Notes cannot exceed 500 characters":
        return t("validation.notesMax", msg);
      default:
        return msg;
    }
  };

  return (
    <form onSubmit={handleSubmit(submitHandler)} className="space-y-6">
      {/* 1. Member & Trainer Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Member Select */}
        <div>
          <Controller
            name="member"
            control={control}
            render={({ field }) => (
              <SearchableMemberSelect
                value={field.value}
                onChange={field.onChange}
                members={members}
                preselectedMember={preselectedMember}
                disabled={isFormDisabled}
                locked={Boolean(initialValues?.member)}
                error={translateValidation(errors.member?.message)}
                label={t("form.memberLabel", "Select Member")}
                placeholder={t("form.memberPlaceholder", "Choose an athlete...")}
              />
            )}
          />
          {errorMembers && (
            <p className="text-xs text-destructive mt-1 font-medium">
              {t(
                "form.errorMembers",
                "Unable to load assigned members. Please try refreshing.",
              )}
            </p>
          )}
        </div>

        {/* Trainer: Locked to Authenticated Coach or Admin Selector */}
        {isCoach ? (
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-[#5BE584]" />
              <span>{t("form.assignedCoach", "Assigned Coach")}</span>
            </label>
            <div className="w-full h-10 px-3.5 rounded-lg bg-card/20 border border-border/40 flex items-center justify-between text-sm text-foreground">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white">
                  {user?.name || t("common.you", "You")}
                </span>
                <span className="text-xs text-[#9CA3AF]">({user?.email})</span>
              </div>
              <span className="rounded bg-[#16291D] border border-[#23422E] px-2 py-0.5 text-[10px] font-semibold text-[#5BE584] uppercase tracking-wider">
                {t("form.loggedInCoach", "Logged-In Coach")}
              </span>
            </div>
            <input type="hidden" {...register("trainer")} value={coachId} />
          </div>
        ) : (
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 uppercase tracking-wider">
              <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>{t("form.assignTrainer", "Assign Trainer")}</span>
            </label>
            <select
              {...register("trainer")}
              disabled={isFormDisabled}
              className="w-full h-10 px-3 rounded-lg bg-card/40 border border-border/60 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm text-foreground cursor-pointer disabled:opacity-50 transition-all"
            >
              <option value="">
                {loadingTrainers
                  ? t("form.loadingTrainers", "Loading trainers...")
                  : t("form.chooseTrainer", "-- Choose a trainer --")}
              </option>
              {trainers.map((tItem: any) => (
                <option
                  key={tItem._id || tItem.id}
                  value={tItem._id || tItem.id}
                  className="bg-zinc-900"
                >
                  {tItem.name}
                </option>
              ))}
            </select>
            {errors.trainer && (
              <p className="text-xs text-destructive mt-1 font-medium">
                {translateValidation(errors.trainer.message)}
              </p>
            )}
          </div>
        )}
      </div>

      {/* 2. Workout Routine Row */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 uppercase tracking-wider">
          <Dumbbell className="w-3.5 h-3.5 text-emerald-500" />
          <span>{t("form.workoutRoutine", "Workout Routine")}</span>
        </label>
        <select
          {...register("workout")}
          disabled={isFormDisabled}
          className="w-full h-10 px-3 rounded-lg bg-card/40 border border-border/60 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm text-foreground cursor-pointer disabled:opacity-50 transition-all"
        >
          <option value="">
            {loadingWorkouts
              ? t("form.loadingWorkouts", "Loading routines...")
              : t("form.chooseWorkout", "-- Choose a workout routine --")}
          </option>
          {workouts.map((w: any) => (
            <option
              key={w._id || w.id}
              value={w._id || w.id}
              className="bg-zinc-900"
            >
              {w.title} {w.category ? `(${w.category})` : ""}
            </option>
          ))}
        </select>
        {errors.workout && (
          <p className="text-xs text-destructive mt-1 font-medium">
            {translateValidation(errors.workout.message)}
          </p>
        )}
      </div>

      {/* 3. Dates Row (Start Date & End Date) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 uppercase tracking-wider">
            <Calendar className="w-3.5 h-3.5 text-emerald-500" />
            <span>{t("form.startDate", "Start Date")}</span>
          </label>
          <Input
            type="date"
            {...register("startDate")}
            disabled={isLoading}
            className="bg-card/40 border-border/60 focus-visible:ring-emerald-500 text-sm h-10"
          />
          {errors.startDate && (
            <p className="text-xs text-destructive mt-1 font-medium">
              {translateValidation(errors.startDate.message)}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 uppercase tracking-wider">
            <Calendar className="w-3.5 h-3.5 text-emerald-500" />
            <span>{t("form.endDate", "End Date")}</span>
          </label>
          <Input
            type="date"
            {...register("endDate")}
            disabled={isLoading}
            className="bg-card/40 border-border/60 focus-visible:ring-emerald-500 text-sm h-10"
          />
          {errors.endDate && (
            <p className="text-xs text-destructive mt-1 font-medium">
              {translateValidation(errors.endDate.message)}
            </p>
          )}
        </div>
      </div>

      {/* 3b. Status & Cancellation Reason (Edit Mode) */}
      {isEditMode && (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 uppercase tracking-wider">
              <span>{t("form.assignmentStatus", "Assignment Status")}</span>
            </label>
            <select
              {...register("status")}
              disabled={isLoading}
              className="w-full h-10 px-3 rounded-lg bg-card/40 border border-border/60 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm text-foreground cursor-pointer disabled:opacity-50 transition-all"
            >
              <option value="ACTIVE" className="bg-zinc-900">
                {t("status.active", "Active")}
              </option>
              <option value="COMPLETED" className="bg-zinc-900">
                {t("status.completed", "Completed")}
              </option>
              <option value="CANCELLED" className="bg-zinc-900">
                {t("status.cancelled", "Cancelled")}
              </option>
            </select>
            {errors.status && (
              <p className="text-xs text-destructive mt-1 font-medium">
                {translateValidation(errors.status.message)}
              </p>
            )}
          </div>

          {selectedStatus === "CANCELLED" && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 uppercase tracking-wider">
                <span>
                  {t(
                    "form.cancelReasonLabel",
                    "Cancellation Reason (Required)",
                  )}
                </span>
              </label>
              <textarea
                {...register("cancelReason")}
                disabled={isLoading}
                rows={3}
                placeholder={t(
                  "form.cancelReasonPlaceholder",
                  "Provide a reason for cancelling this assignment...",
                )}
                className="w-full p-3 rounded-lg bg-card/40 border border-border/60 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm text-foreground placeholder:text-muted-foreground/60 disabled:opacity-50 transition-all resize-none"
              />
              {errors.cancelReason && (
                <p className="text-xs text-destructive mt-1 font-medium">
                  {translateValidation(errors.cancelReason.message)}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* 4. Notes Row */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 uppercase tracking-wider">
          <FileText className="w-3.5 h-3.5 text-emerald-500" />
          <span>{t("form.notesLabel", "Additional Notes (Optional)")}</span>
        </label>
        <textarea
          {...register("notes")}
          disabled={isLoading}
          rows={4}
          placeholder={t(
            "form.notesPlaceholder",
            "Add any specific instructions, injury notes, or guidelines for this member...",
          )}
          className="w-full p-3 rounded-lg bg-card/40 border border-border/60 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm text-foreground placeholder:text-muted-foreground/60 disabled:opacity-50 transition-all resize-none"
        />
        {errors.notes && (
          <p className="text-xs text-destructive mt-1 font-medium">
            {translateValidation(errors.notes.message)}
          </p>
        )}
      </div>

      {/* 5. Submit & Cancel Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/40">
        <Button
          type="button"
          variant="outline"
          disabled={isLoading}
          onClick={() => window.history.back()}
          className="border-border/60 hover:bg-accent/50 cursor-pointer"
        >
          {t("form.cancel", "Cancel")}
        </Button>

        <Button
          type="submit"
          disabled={isFormDisabled}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium min-w-[140px] shadow-sm transition-all cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="me-2 h-4 w-4 animate-spin" />
              {t("form.saving", "Saving...")}
            </>
          ) : (
            <>
              <Save className="me-2 h-4 w-4" />
              {submitLabel || t("form.createButton", "Create Assignment")}
            </>
          )}
        </Button>
      </div>
    </form>
  );
};
