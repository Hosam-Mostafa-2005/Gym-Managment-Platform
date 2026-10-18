import { useMemo } from "react";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Pencil,
  Calendar,
  Dumbbell,
  User as UserIcon,
  UserCheck,
  FileText,
  Clock,
  Mail,
  Activity,
  CheckCircle2,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

// Components & Hooks
import { useAssignment } from "@/features/assignments/hooks/useAssignment";
import { AssignmentStatusBadge } from "@/features/assignments/components/AssignmentStatusBadge";
import type { AssignmentStatus } from "@/features/assignments/types/assignment.types";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { ROLES } from "@/constants/roles";

export default function AssignmentDetailsPage() {
  const navigate = useNavigate();
  const { data: user } = useCurrentUser();
  const canManage = user?.role === ROLES.ADMIN || user?.role === ROLES.TRAINER;
  // Fetch id whether it's passed as id or assignmentId
  const { id, assignmentId } = useParams<{
    id: string;
    assignmentId: string;
  }>();
  const targetId = id || assignmentId;

  // 1. Fetch assignment data
  const {
    data: assignmentData,
    isLoading: isFetching,
    isError,
  } = useAssignment(targetId!);

  // 2. Safe Extraction
  const item = useMemo(() => {
    if (!assignmentData) return null;
    return (
      (assignmentData as any)?.data ||
      (assignmentData as any)?.assignment ||
      assignmentData
    );
  }, [assignmentData]);

  // Helpers for progress and colors
  const getProgressPercentage = (status?: AssignmentStatus) => {
    switch (status) {
      case "COMPLETED":
        return 100;
      case "ACTIVE":
        return 65;
      case "CANCELLED":
        return 15;
      default:
        return 0;
    }
  };

  const getProgressBarColor = (status?: AssignmentStatus) => {
    switch (status) {
      case "ACTIVE":
        return "bg-[#5BE584]";
      case "COMPLETED":
        return "bg-[#6B7280]";
      case "CANCELLED":
        return "bg-red-500/80";
      default:
        return "bg-[#5BE584]";
    }
  };

  const getStatusBorderColor = (status?: AssignmentStatus) => {
    switch (status) {
      case "ACTIVE":
        return "bg-[#5BE584]";
      case "COMPLETED":
        return "bg-[#6B7280]";
      case "CANCELLED":
        return "bg-red-500";
      default:
        return "bg-[#5BE584]";
    }
  };

  const progress = getProgressPercentage(item?.status);

  return (
    <div className="relative min-h-screen w-full bg-[#0D1014] text-[#F3F4F6] font-sans selection:bg-[#5BE584]/30">
      {/* Background Atmosphere */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(30,35,41,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(30,35,41,0.2)_1px,transparent_1px)] bg-[size:32px_32px]" />
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-[radial-gradient(circle_at_center,_rgba(91,229,132,0.02)_0%,_rgba(13,16,20,0)_70%)] blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-[#1E2329] bg-[#0D1014]/90 backdrop-blur-md pt-8 pb-6 px-6 lg:px-12">
        <div className="mx-auto max-w-5xl flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-[11px] font-medium tracking-wide text-[#6B7280] uppercase">
              <span
                className="hover:text-[#9CA3AF] cursor-pointer transition-colors"
                onClick={() => navigate("/assignments")}
              >
                Assignments
              </span>
              <span>/</span>
              <span className="text-[#F3F4F6]">Details</span>
            </div>
            <div className="flex items-center gap-3 mt-1">
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-white">
                Assignment Overview
              </h1>
              {item?.status && <AssignmentStatusBadge status={item.status} />}
            </div>
            <p className="text-sm text-[#9CA3AF]">
              Detailed breakdown of the assigned routine, schedule, and
              progress.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
            <button
              onClick={() => navigate("/assignments")}
              className="group flex items-center justify-center gap-2 rounded-md border border-[#1E2329] bg-[#101418] px-4 py-2 text-sm font-medium text-[#9CA3AF] transition-colors hover:border-[#6B7280] hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Back
            </button>
            {canManage && !isFetching && !isError && item && (
              <button
                onClick={() => navigate(`/assignments/${targetId}/edit`)}
                className="flex items-center justify-center gap-2 rounded-md bg-[#16291D] border border-[#23422E] px-4 py-2 text-sm font-medium text-[#5BE584] transition-colors hover:bg-[#1f3827]"
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 mx-auto max-w-5xl px-6 lg:px-12 py-10 pb-32 animate-in fade-in duration-300">
        {/* Loading State */}
        {isFetching && (
          <div className="flex flex-col items-center justify-center py-24 text-[#6B7280]">
            <Loader2 className="h-8 w-8 animate-spin text-[#5BE584]" />
            <p className="mt-4 text-sm font-medium">
              Loading assignment details...
            </p>
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="rounded-xl border border-red-900/50 bg-red-950/20 p-10 flex flex-col items-center justify-center text-center gap-3 backdrop-blur-sm">
            <AlertCircle className="w-10 h-10 text-red-400" />
            <h3 className="text-base font-semibold text-white">
              Failed to load details
            </h3>
            <p className="text-xs text-[#9CA3AF] max-w-sm">
              We couldn't retrieve the details for this assignment. It might
              have been deleted or there is a network issue.
            </p>
            <button
              onClick={() => navigate("/assignments")}
              className="mt-4 rounded-md border border-[#1E2329] bg-[#101418] px-5 py-2 text-sm font-medium text-[#9CA3AF] transition-colors hover:text-white hover:border-[#6B7280]"
            >
              Back to Assignments
            </button>
          </div>
        )}

        {/* Details View */}
        {!isFetching && !isError && item && (
          <div className="flex flex-col gap-10">
            {/* Hero Progress Section */}
            <section>
              <div className="relative overflow-hidden rounded-xl border border-[#1E2329] bg-[#101418]/80 p-6 sm:p-8 shadow-2xl backdrop-blur-md">
                <div
                  className={`absolute top-0 left-0 w-1.5 h-full ${getStatusBorderColor(
                    item.status,
                  )}`}
                />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center pl-2">
                  {/* Timeline */}
                  <div className="space-y-2 md:col-span-1 border-b md:border-b-0 md:border-r border-[#1E2329] pb-6 md:pb-0 md:pr-6">
                    <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#5BE584]" />
                      Routine Schedule
                    </span>
                    <div className="text-sm font-semibold text-white mt-1">
                      {new Date(item.startDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                      <span className="text-[#6B7280] mx-2">—</span>
                      {new Date(item.endDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </div>
                    <div className="text-xs text-[#9CA3AF] flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#6B7280]" />
                      <span>Active Duration</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="md:col-span-2 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280] flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-[#5BE584]" />
                        Estimated Completion
                      </span>
                      <span className="font-bold text-white text-sm">
                        {progress}%
                      </span>
                    </div>
                    <div className="w-full bg-[#1E2329] h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${getProgressBarColor(
                          item.status,
                        )}`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-[#6B7280]">
                      {item.status === "COMPLETED"
                        ? "This workout assignment has been fully completed by the member."
                        : "Progress is estimated based on schedule and logged activity."}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* People Section (Member & Trainer) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Member Block */}
              <div className="flex flex-col rounded-xl border border-[#1E2329] bg-[#101418] p-6 transition-colors hover:border-[#2A313A]">
                <div className="flex items-center justify-between border-b border-[#1E2329] pb-4 mb-4">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280] flex items-center gap-2">
                    <UserIcon className="w-3.5 h-3.5 text-[#5BE584]" />
                    Assigned Member
                  </h3>
                  <span className="text-[10px] font-medium text-[#5BE584] bg-[#16291D] border border-[#23422E] px-2 py-0.5 rounded">
                    Active Gym Member
                  </span>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded border border-[#23422E] bg-[#16291D] text-[#5BE584] flex items-center justify-center font-bold text-sm shrink-0 uppercase">
                    {item.member?.name?.slice(0, 2) || "MB"}
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-semibold text-white">
                      {item.member?.name || "Unknown Member"}
                    </h4>
                    <div className="flex items-center gap-1.5 text-xs text-[#9CA3AF]">
                      <Mail className="w-3.5 h-3.5 text-[#6B7280] shrink-0" />
                      <span>{item.member?.email || "No email provided"}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Trainer Block */}
              <div className="flex flex-col rounded-xl border border-[#1E2329] bg-[#101418] p-6 transition-colors hover:border-[#2A313A]">
                <div className="flex items-center justify-between border-b border-[#1E2329] pb-4 mb-4">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280] flex items-center gap-2">
                    <UserCheck className="w-3.5 h-3.5 text-[#5BE584]" />
                    Supervising Trainer
                  </h3>
                  <span className="text-[10px] font-medium text-[#9CA3AF] bg-[#1E2329] px-2 py-0.5 rounded">
                    Verified Trainer
                  </span>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded border border-[#1E2329] bg-[#0D1014] text-[#6B7280] flex items-center justify-center font-bold text-sm shrink-0 uppercase">
                    {item.trainer?.name?.slice(0, 2) || "TR"}
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-semibold text-white">
                      {item.trainer?.name || "Not Assigned"}
                    </h4>
                    <p className="text-xs text-[#6B7280] leading-relaxed">
                      Responsible for routine monitoring, adjustments, and
                      member guidance.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="h-px w-full bg-gradient-to-r from-[#1E2329] to-transparent" />

            {/* Workout Routine Section */}
            <section>
              <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <h2 className="text-[11px] font-bold tracking-widest text-[#6B7280] uppercase">
                    Workout Structure
                  </h2>
                  <p className="text-xs text-[#6B7280] mt-1">
                    The structured plan assigned to the member.
                  </p>
                </div>
                {(item.workout?.id || item.workout?._id) && (
                  <button
                    onClick={() =>
                      navigate(
                        `/workout-builder/${item.workout.id || item.workout._id}`,
                      )
                    }
                    className="flex items-center gap-1.5 text-xs font-medium text-[#5BE584] hover:text-[#4ade80] transition-colors"
                  >
                    View Routine Details →
                  </button>
                )}
              </div>

              <div className="rounded-xl border border-[#1E2329] bg-[#101418] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors hover:border-[#2A313A]">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <Dumbbell className="w-5 h-5 text-[#6B7280]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">
                      {item.workout?.title || "Custom General Routine"}
                    </h3>
                    <p className="text-xs text-[#9CA3AF] mt-1 line-clamp-2 max-w-xl leading-relaxed">
                      {item.workout?.description ||
                        "No specific routine description available."}
                    </p>
                  </div>
                </div>
                {item.workout?.category && (
                  <span className="inline-flex shrink-0 items-center rounded bg-[#16291D] border border-[#23422E] px-2.5 py-1 text-[11px] font-medium text-[#5BE584] capitalize">
                    {item.workout.category}
                  </span>
                )}
              </div>
            </section>

            <div className="h-px w-full bg-gradient-to-r from-[#1E2329] to-transparent" />

            {/* Notes Section */}
            <section>
              <div className="mb-6">
                <h2 className="text-[11px] font-bold tracking-widest text-[#6B7280] uppercase flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-[#5BE584]" />
                  Trainer Notes & Guidelines
                </h2>
              </div>

              {item.notes ? (
                <div className="rounded-xl border border-[#1E2329] bg-[#101418] p-5 text-sm text-[#9CA3AF] leading-relaxed whitespace-pre-wrap shadow-inner">
                  {item.notes}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#1E2329] bg-transparent py-10 px-6 text-center">
                  <CheckCircle2 className="w-6 h-6 text-[#1E2329] mb-3" />
                  <p className="text-xs font-medium text-[#6B7280]">
                    No special notes or guidelines were attached to this
                    assignment.
                  </p>
                </div>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
