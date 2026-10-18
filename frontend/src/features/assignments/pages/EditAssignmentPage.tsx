import { useMemo } from "react";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

// Components & Hooks
import { AssignmentForm } from "@/features/assignments/components/AssignmentForm";
import { useAssignment } from "@/features/assignments/hooks/useAssignment";
import { useUpdateAssignment } from "@/features/assignments/hooks/useUpdateAssignment";

import type { AssignmentFormValues } from "@/features/assignments/schemas/assignment.schema";

export default function EditAssignmentPage() {
  const navigate = useNavigate();

  const { assignmentId } = useParams<{
    assignmentId: string;
  }>();

  const {
    data: assignment,
    isLoading: isFetching,
    isError,
  } = useAssignment(assignmentId!);

  const { mutate: updateAssignment, isPending: isUpdating } =
    useUpdateAssignment();

  const initialValues: Partial<AssignmentFormValues> | undefined =
    useMemo(() => {
      if (!assignment) return undefined;

      return {
        member: assignment.member.id,
        trainer: assignment.trainer.id,
        workout: assignment.workout.id,
        startDate: assignment.startDate
          ? new Date(assignment.startDate).toISOString().split("T")[0]
          : "",
        endDate: assignment.endDate
          ? new Date(assignment.endDate).toISOString().split("T")[0]
          : "",
        status: assignment.status,
        cancelReason: assignment.cancelReason ?? "",
        notes: assignment.notes ?? "",
      };
    }, [assignment]);

  const handleUpdate = (data: AssignmentFormValues) => {
    if (!assignmentId) return;

    updateAssignment(
      {
        id: assignmentId,
        data: {
          member: data.member,
          trainer: data.trainer,
          workout: data.workout,
          startDate: data.startDate,
          endDate: data.endDate,
          status: data.status,
          cancelReason:
            data.status === "CANCELLED"
              ? data.cancelReason?.trim() || undefined
              : undefined,
          notes: data.notes || undefined,
        },
      },
      {
        onSuccess: () => {
          navigate("/assignments");
        },
      },
    );
  };

  return (
    <div className="relative min-h-screen w-full bg-[#0D1014] text-[#F3F4F6] font-sans selection:bg-[#5BE584]/30">
      {/* Background Atmosphere */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(30,35,41,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(30,35,41,0.2)_1px,transparent_1px)] bg-[size:32px_32px]" />
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[radial-gradient(circle_at_center,_rgba(91,229,132,0.02)_0%,_rgba(13,16,20,0)_70%)] blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-[#1E2329] bg-[#0D1014]/90 backdrop-blur-md pt-8 pb-6 px-6 lg:px-12">
        <div className="mx-auto max-w-4xl flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-[11px] font-medium tracking-wide text-[#6B7280] uppercase">
              <span
                className="hover:text-[#9CA3AF] cursor-pointer transition-colors"
                onClick={() => navigate("/assignments")}
              >
                Assignments
              </span>
              <span>/</span>
              <span className="text-[#F3F4F6]">Edit</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-white mt-1">
              Edit Workout Assignment
            </h1>
            <p className="text-sm text-[#9CA3AF]">
              Update routine schedule, trainer assignment, or guidelines.
            </p>
          </div>
          <button
            onClick={() => navigate("/assignments")}
            className="group hidden md:flex items-center gap-2 text-sm font-medium text-[#9CA3AF] transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Assignments
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 mx-auto max-w-4xl px-6 lg:px-12 py-10 pb-32 animate-in fade-in duration-300">
        {/* Loading */}
        {isFetching && (
          <div className="flex flex-col items-center justify-center py-24 text-[#6B7280]">
            <Loader2 className="h-8 w-8 animate-spin text-[#5BE584]" />
            <p className="mt-4 text-sm font-medium">
              Loading assignment details...
            </p>
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className="rounded-xl border border-red-900/50 bg-red-950/20 p-10 flex flex-col items-center justify-center text-center gap-3 backdrop-blur-sm">
            <AlertCircle className="w-10 h-10 text-red-400" />
            <h3 className="text-base font-semibold text-white">
              Failed to load assignment
            </h3>
            <p className="text-xs text-[#9CA3AF] max-w-sm">
              We couldn't retrieve this assignment. It may have been deleted or
              there is a network problem.
            </p>
            <button
              onClick={() => navigate("/assignments")}
              className="mt-4 rounded-md border border-[#1E2329] bg-[#101418] px-5 py-2 text-sm font-medium text-[#9CA3AF] transition-colors hover:text-white hover:border-[#6B7280]"
            >
              Back to Assignments
            </button>
          </div>
        )}

        {/* Form */}
        {!isFetching && !isError && initialValues && (
          <div className="rounded-xl border border-[#1E2329] bg-[#101418]/80 backdrop-blur-sm p-6 sm:p-10 shadow-2xl">
            <div className="mb-8 border-b border-[#1E2329] pb-4">
              <h2 className="text-[11px] font-bold tracking-widest text-[#6B7280] uppercase">
                Assignment Details
              </h2>
              <p className="text-xs text-[#6B7280] mt-1">
                Modify the configuration for this routine assignment.
              </p>
            </div>

            <AssignmentForm
              initialValues={initialValues}
              onSubmit={handleUpdate}
              isLoading={isUpdating}
              submitLabel="Update Assignment"
            />
          </div>
        )}
      </main>
    </div>
  );
}
