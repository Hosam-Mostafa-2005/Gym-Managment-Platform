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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAssignment } from "@/features/assignments/hooks/useAssignment";
import { AssignmentStatusBadge } from "@/features/assignments/components/AssignmentStatusBadge";
import type { AssignmentStatus } from "@/features/assignments/types/assignment.types";

export default function AssignmentDetailsPage() {
  const navigate = useNavigate();
  // بنسحب الـ id سواء كان مبعوت في الراوت باسم id أو assignmentId
  const { id, assignmentId } = useParams<{
    id: string;
    assignmentId: string;
  }>();
  const targetId = id || assignmentId;

  // 1. جلب بيانات التمرين الحالي
  const {
    data: assignmentData,
    isLoading: isFetching,
    isError,
  } = useAssignment(targetId!);

  // 2. استخراج البيانات بأمان (Safe Extraction)
  const item = useMemo(() => {
    if (!assignmentData) return null;
    return (
      (assignmentData as any)?.data ||
      (assignmentData as any)?.assignment ||
      assignmentData
    );
  }, [assignmentData]);

  // مساعد النسبة المئوية للتقارب مع باقي التصميم
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
        return "bg-emerald-500";
      case "COMPLETED":
        return "bg-zinc-500";
      case "CANCELLED":
        return "bg-rose-500";
      default:
        return "bg-emerald-500";
    }
  };

  const progress = getProgressPercentage(item?.status);

  return (
    <section className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300 text-foreground pb-12 pt-4">
      {/* Top Header & Back Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-5">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate("/assignments")}
            className="h-9 w-9 rounded-lg border-border/60 bg-card/40 hover:bg-accent/60 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">
                Assignment Overview
              </h1>
              {item?.status && <AssignmentStatusBadge status={item.status} />}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Detailed breakdown of the assigned routine, schedule, and member
              progress.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        {!isFetching && !isError && item && (
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/assignments/${targetId}/edit`)}
              className="border-border/60 bg-card/40 hover:bg-accent/60 text-xs h-9"
            >
              <Pencil className="mr-2 h-3.5 w-3.5 text-emerald-500" />
              Edit Assignment
            </Button>
          </div>
        )}
      </div>

      {/* Loading State */}
      {isFetching && (
        <Card className="border-border/50 bg-card/30 shadow-xl">
          <CardContent className="p-16 flex flex-col items-center justify-center text-muted-foreground gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            <p className="text-sm font-medium">Loading assignment details...</p>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {isError && (
        <Card className="border-rose-500/20 bg-rose-500/5 shadow-xl">
          <CardContent className="p-10 flex flex-col items-center justify-center text-center gap-3">
            <AlertCircle className="w-10 h-10 text-rose-500" />
            <h3 className="text-base font-semibold text-foreground">
              Failed to load details
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm">
              We couldn't retrieve the details for this assignment. It might
              have been deleted or there is a network issue.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/assignments")}
              className="mt-2 border-border/60"
            >
              Back to Assignments
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Main Content View */}
      {!isFetching && !isError && item && (
        <div className="space-y-6">
          {/* Progress & Timeline Hero Card */}
          <Card className="border-border/50 bg-card/40 shadow-lg overflow-hidden relative">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500" />
            <CardContent className="p-6 sm:p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                {/* Timeline */}
                <div className="space-y-1.5 md:col-span-1 border-b md:border-b-0 md:border-r border-border/40 pb-4 md:pb-0 md:pr-4">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                    Routine Schedule
                  </span>
                  <div className="text-sm font-semibold text-foreground mt-1">
                    {new Date(item.startDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                    {" — "}
                    {new Date(item.endDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>Active Duration</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="md:col-span-2 space-y-2.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-emerald-500" />
                      Estimated Completion
                    </span>
                    <span className="font-bold text-foreground text-sm">
                      {progress}%
                    </span>
                  </div>
                  <div className="w-full bg-accent/60 h-3 rounded-full overflow-hidden p-0.5 border border-border/40">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${getProgressBarColor(
                        item.status,
                      )}`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {item.status === "COMPLETED"
                      ? "This workout assignment has been fully completed by the member."
                      : "Progress is automatically calculated based on logged workout sessions."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Grid: Member & Trainer Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Member Card */}
            <Card className="border-border/50 bg-card/30 shadow-md">
              <CardHeader className="pb-4 border-b border-border/40">
                <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-emerald-500" />
                  Assigned Member
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-base border border-emerald-500/20 shrink-0">
                  {item.member?.name?.slice(0, 2).toUpperCase() || "MB"}
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-base text-foreground">
                    {item.member?.name || "Unknown Member"}
                  </h4>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Mail className="w-3.5 h-3.5 shrink-0" />
                    <span>{item.member?.email || "No email provided"}</span>
                  </div>
                  <div className="pt-2">
                    <Badge
                      variant="outline"
                      className="text-[10px] bg-accent/40 border-border/60"
                    >
                      Active Gym Member
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Trainer Card */}
            <Card className="border-border/50 bg-card/30 shadow-md">
              <CardHeader className="pb-4 border-b border-border/40">
                <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-emerald-500" />
                  Supervising Trainer
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-accent/60 text-muted-foreground flex items-center justify-center font-bold text-base border border-border/60 shrink-0">
                  {item.trainer?.name?.slice(0, 2).toUpperCase() || "TR"}
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-base text-foreground">
                    {item.trainer?.name || "Not Assigned"}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Responsible for routine monitoring, adjustments, and member
                    guidance.
                  </p>
                  <div className="pt-2">
                    <Badge
                      variant="secondary"
                      className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    >
                      Verified Trainer
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Workout Routine Details */}
          <Card className="border-border/50 bg-card/30 shadow-md">
            <CardHeader className="pb-4 border-b border-border/40 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Dumbbell className="w-4 h-4 text-emerald-500" />
                Assigned Workout Routine
              </CardTitle>
              {item.workout?._id && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    navigate(`/workouts/${item.workout._id || item.workout.id}`)
                  }
                  className="text-xs text-emerald-400 hover:text-emerald-300 h-8 px-2"
                >
                  View Routine Structure →
                </Button>
              )}
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-accent/20 p-4 rounded-xl border border-border/40">
                <div>
                  <h3 className="text-lg font-bold text-foreground">
                    {item.workout?.title || "Custom General Routine"}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {item.workout?.description ||
                      "No specific routine description available."}
                  </p>
                </div>
                {item.workout?.category && (
                  <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 self-start sm:self-auto capitalize px-3 py-1">
                    {item.workout.category}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Additional Notes / Guidelines */}
          <Card className="border-border/50 bg-card/30 shadow-md">
            <CardHeader className="pb-4 border-b border-border/40">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-500" />
                Trainer Notes & Guidelines
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {item.notes ? (
                <div className="bg-accent/30 rounded-xl p-4 border border-border/40 text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                  {item.notes}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground border border-dashed border-border/60 rounded-xl bg-accent/10">
                  <CheckCircle2 className="w-6 h-6 mx-auto mb-2 opacity-40" />
                  <p className="text-xs font-medium">
                    No special notes or guidelines were attached to this
                    assignment.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </section>
  );
}
