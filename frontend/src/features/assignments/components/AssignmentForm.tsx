import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Save,
  Loader2,
  Calendar,
  Dumbbell,
  User as UserIcon,
  UserCheck,
  FileText,
} from "lucide-react";

// Types & Schema
import {
  assignmentSchema,
  type AssignmentFormValues,
} from "@/features/assignments/schemas/assignment.schema";

// Shadcn UI & Hooks
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWorkouts } from "@/features/workouts/hooks/useWorkouts";
import { useUsers } from "@/features/users/hooks/useUsers"; // 💡 الهوك الجديد اللي عملناه

interface AssignmentFormProps {
  initialValues?: Partial<AssignmentFormValues>;
  onSubmit: (data: AssignmentFormValues) => void;
  isLoading?: boolean;
  submitLabel?: string;
}

export const AssignmentForm = ({
  initialValues,
  onSubmit,
  isLoading = false,
  submitLabel = "Create Assignment",
}: AssignmentFormProps) => {
  // 1. سحب التمارين الحقيقية
  const { data: workouts = [], isLoading: loadingWorkouts } = useWorkouts();

  // 2. سحب الأعضاء والمدربين الحقيقيين من الباك اند من خلال الـ Role
  // 💡 غيرنا الكلمات لحروف سمول عشان تطابق الداتابيز بالظبت:
  const { data: members = [], isLoading: loadingMembers } = useUsers("member");

  const { data: trainers = [], isLoading: loadingTrainers } =
    useUsers("trainer");

  // حساب التواريخ الافتراضية
  const defaultDates = useMemo(() => {
    const today = new Date();
    const nextMonth = new Date();
    nextMonth.setDate(today.getDate() + 30);

    return {
      start: today.toISOString().split("T")[0],
      end: nextMonth.toISOString().split("T")[0],
    };
  }, []);

  // إعداد React Hook Form مع Zod
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AssignmentFormValues>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      member: initialValues?.member || "",
      trainer: initialValues?.trainer || "",
      workout: initialValues?.workout || "",
      startDate: initialValues?.startDate || defaultDates.start,
      endDate: initialValues?.endDate || defaultDates.end,
      notes: initialValues?.notes || "",
    },
  });

  const isFormDisabled =
    isLoading || loadingWorkouts || loadingMembers || loadingTrainers;

  const submitHandler = (data: AssignmentFormValues) => {
    onSubmit(data);
  };
  return (
    <form onSubmit={handleSubmit(submitHandler)} className="space-y-6">
      {/* 1. Member & Trainer Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Member Select */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 uppercase tracking-wider">
            <UserIcon className="w-3.5 h-3.5 text-emerald-500" />
            <span>Select Member</span>
          </label>
          <select
            {...register("member")}
            disabled={isFormDisabled}
            className="w-full h-10 px-3 rounded-lg bg-card/40 border border-border/60 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm text-foreground cursor-pointer disabled:opacity-50 transition-all"
          >
            <option value="">
              {loadingMembers ? "Loading members..." : "-- Choose a member --"}
            </option>
            {members.map((m: any) => (
              <option
                key={m._id || m.id}
                value={m._id || m.id}
                className="bg-zinc-900"
              >
                {m.name} ({m.email})
              </option>
            ))}
          </select>
          {errors.member && (
            <p className="text-xs text-destructive mt-1 font-medium">
              {errors.member.message}
            </p>
          )}
        </div>

        {/* Trainer Select */}
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
