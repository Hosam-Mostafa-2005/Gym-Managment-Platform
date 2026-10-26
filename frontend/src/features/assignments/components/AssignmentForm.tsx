import { useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Save,
  Loader2,
  Calendar,
  Dumbbell,
  User as UserIcon,
  UserCheck,
  FileText,
  ShieldCheck,
} from "lucide-react";
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
import { ROLES } from "@/constants/roles";

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
  submitLabel = "Create Assignment",
}: AssignmentFormProps) => {
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
                error={errors.member?.message}
                label="Select Member"
              />
            )}
          />
          {errorMembers && (
            <p className="text-xs text-destructive mt-1 font-medium">
              Unable to load assigned members. Please try refreshing.
            </p>
          )}
        </div>

        {/* Trainer: Locked to Authenticated Coach or Admin Selector */}
        {isCoach ? (
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-[#5BE584]" />
              <span>Assigned Coach</span>
            </label>
            <div className="w-full h-10 px-3.5 rounded-lg bg-card/20 border border-border/40 flex items-center justify-between text-sm text-foreground">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white">
                  {user?.name || "You"}
                </span>
                <span className="text-xs text-[#9CA3AF]">({user?.email})</span>
              </div>
              <span className="rounded bg-[#16291D] border border-[#23422E] px-2 py-0.5 text-[10px] font-semibold text-[#5BE584] uppercase tracking-wider">
                Logged-In Coach
              </span>
            </div>
            <input type="hidden" {...register("trainer")} value={coachId} />
          </div>
        ) : (
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 uppercase tracking-wider">
              <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Assign Trainer</span>
            </label>
            <select
              {...register("trainer")}
              disabled={isFormDisabled}
              className="w-full h-10 px-3 rounded-lg bg-card/40 border border-border/60 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm text-foreground cursor-pointer disabled:opacity-50 transition-all"
            >
              <option value="">
                {loadingTrainers
                  ? "Loading trainers..."
                  : "-- Choose a trainer --"}
              </option>
              {trainers.map((t: any) => (
                <option
                  key={t._id || t.id}
                  value={t._id || t.id}
                  className="bg-zinc-900"
                >
                  {t.name}
                </option>
              ))}
            </select>
            {errors.trainer && (
              <p className="text-xs text-destructive mt-1 font-medium">
                {errors.trainer.message}
              </p>
            )}
          </div>
        )}
      </div>

      {/* 2. Workout Routine Row */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 uppercase tracking-wider">
          <Dumbbell className="w-3.5 h-3.5 text-emerald-500" />
          <span>Workout Routine</span>
        </label>
        <select
          {...register("workout")}
          disabled={isFormDisabled}
          className="w-full h-10 px-3 rounded-lg bg-card/40 border border-border/60 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm text-foreground cursor-pointer disabled:opacity-50 transition-all"
        >
          <option value="">
            {loadingWorkouts
              ? "Loading routines..."
              : "-- Choose a workout routine --"}
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
            {errors.workout.message}
          </p>
        )}
      </div>

      {/* 3. Dates Row (Start Date & End Date) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 uppercase tracking-wider">
            <Calendar className="w-3.5 h-3.5 text-emerald-500" />
            <span>Start Date</span>
          </label>
          <Input
            type="date"
            {...register("startDate")}
            disabled={isLoading}
            className="bg-card/40 border-border/60 focus-visible:ring-emerald-500 text-sm h-10"
          />
          {errors.startDate && (
            <p className="text-xs text-destructive mt-1 font-medium">
              {errors.startDate.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 uppercase tracking-wider">
            <Calendar className="w-3.5 h-3.5 text-emerald-500" />
            <span>End Date</span>
          </label>
          <Input
            type="date"
            {...register("endDate")}
            disabled={isLoading}
            className="bg-card/40 border-border/60 focus-visible:ring-emerald-500 text-sm h-10"
          />
          {errors.endDate && (
            <p className="text-xs text-destructive mt-1 font-medium">
              {errors.endDate.message}
            </p>
          )}
        </div>
      </div>

      {/* 3b. Status & Cancellation Reason (Edit Mode) */}
      {isEditMode && (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 uppercase tracking-wider">
              <span>Assignment Status</span>
            </label>
            <select
              {...register("status")}
              disabled={isLoading}
              className="w-full h-10 px-3 rounded-lg bg-card/40 border border-border/60 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm text-foreground cursor-pointer disabled:opacity-50 transition-all"
            >
              <option value="ACTIVE" className="bg-zinc-900">
                ACTIVE
              </option>
              <option value="COMPLETED" className="bg-zinc-900">
                COMPLETED
              </option>
              <option value="CANCELLED" className="bg-zinc-900">
                CANCELLED
              </option>
            </select>
            {errors.status && (
              <p className="text-xs text-destructive mt-1 font-medium">
                {errors.status.message}
              </p>
            )}
          </div>

          {selectedStatus === "CANCELLED" && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 uppercase tracking-wider">
                <span>Cancellation Reason (Required)</span>
              </label>
              <textarea
                {...register("cancelReason")}
                disabled={isLoading}
                rows={3}
                placeholder="Provide a reason for cancelling this assignment..."
                className="w-full p-3 rounded-lg bg-card/40 border border-border/60 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm text-foreground placeholder:text-muted-foreground/60 disabled:opacity-50 transition-all resize-none"
              />
              {errors.cancelReason && (
                <p className="text-xs text-destructive mt-1 font-medium">
                  {errors.cancelReason.message}
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
          <span>Additional Notes (Optional)</span>
        </label>
        <textarea
          {...register("notes")}
          disabled={isLoading}
          rows={4}
          placeholder="Add any specific instructions, injury notes, or guidelines for this member..."
          className="w-full p-3 rounded-lg bg-card/40 border border-border/60 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm text-foreground placeholder:text-muted-foreground/60 disabled:opacity-50 transition-all resize-none"
        />
        {errors.notes && (
          <p className="text-xs text-destructive mt-1 font-medium">
            {errors.notes.message}
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
          className="border-border/60 hover:bg-accent/50"
        >
          Cancel
        </Button>

        <Button
          type="submit"
          disabled={isFormDisabled}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium min-w-[140px] shadow-sm transition-all"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              {submitLabel}
            </>
          )}
        </Button>
      </div>
    </form>
  );
};
