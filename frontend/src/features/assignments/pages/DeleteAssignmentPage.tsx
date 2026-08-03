import {
  ArrowLeft,
  Loader2,
  AlertTriangle,
  Trash2,
  Calendar,
  Dumbbell,
  User as UserIcon,
  UserCheck,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

// Components & Hooks
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAssignment } from "@/features/assignments/hooks/useAssignment";
import { useDeleteAssignment } from "@/features/assignments/hooks/useDeleteAssignment";

export default function DeleteAssignmentPage() {
  const navigate = useNavigate();
  const { assignmentId } = useParams<{ assignmentId: string }>();

  // 1. جلب تفاصيل التمرين للتأكيد قبل الحذف
  const {
    data: assignment,
    isLoading: isFetching,
    isError,
  } = useAssignment(assignmentId!);

  // 2. هوك الحذف
  const { mutate: deleteAssignment, isPending: isDeleting } =
    useDeleteAssignment();

  // 3. تشغيل الحذف مع التوجيه بعد النجاح
  const handleDelete = () => {
    if (!assignmentId) return;

    deleteAssignment(assignmentId, {
      onSuccess: () => {
        navigate("/assignments");
      },
    });
  };

  return (
    <section className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300 text-foreground pb-12 pt-8">
      {/* Top Header */}
      <div className="flex items-center gap-4 border-b border-border/40 pb-5">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate("/assignments")}
          className="h-9 w-9 rounded-lg border-border/60 bg-card/40 hover:bg-accent/60 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-destructive flex items-center gap-2">
            <Trash2 className="w-6 h-6" /> Delete Assignment
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            This action cannot be undone. Please confirm the details below.
          </p>
        </div>
      </div>

      {/* Loading State */}
      {isFetching && (
        <Card className="border-border/50 bg-card/30 shadow-xl">
          <CardContent className="p-12 flex flex-col items-center justify-center text-muted-foreground gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-destructive" />
            <p className="text-sm font-medium">Loading assignment details...</p>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {isError && (
        <Card className="border-rose-500/20 bg-rose-500/5 shadow-xl">
          <CardContent className="p-8 flex flex-col items-center justify-center text-center gap-3">
            <AlertTriangle className="w-10 h-10 text-rose-500" />
            <h3 className="text-base font-semibold text-foreground">
              Assignment Not Found
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm">
              We couldn't retrieve the assignment details. It might have already
              been deleted.
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

      {/* Details Card & Confirmation Form */}
      {!isFetching && !isError && assignment && (
        <Card className="border-destructive/30 bg-card/40 shadow-2xl overflow-hidden relative">
          {/* Top Alert Banner */}
          <div className="bg-destructive/10 border-b border-destructive/20 p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-semibold text-destructive block mb-0.5">
                Warning: Permanent Deletion
              </span>
              <span className="text-muted-foreground">
                You are about to permanently delete this workout routine
                assignment. The member will no longer see this routine in their
                schedule, and all logged progress for this assignment will be
                lost.
              </span>
            </div>
          </div>

          <CardContent className="p-6 sm:p-8 space-y-6">
            {/* Summary Details */}
            <div className="bg-accent/30 rounded-xl p-5 border border-border/50 space-y-4">
              <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Target Member
                </span>
                <div className="flex items-center gap-2 font-semibold text-sm">
                  <UserIcon className="w-4 h-4 text-emerald-500" />
                  <span>{assignment.member?.name || "Unknown Member"}</span>
                </div>
              </div>

              <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Assigned Routine
                </span>
                <div className="flex items-center gap-2 font-semibold text-sm">
                  <Dumbbell className="w-4 h-4 text-emerald-500" />
                  <Badge
                    variant="secondary"
                    className="font-medium bg-accent/60"
                  >
                    {assignment.workout?.title || "General Routine"}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Assigned Trainer
                </span>
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <UserCheck className="w-4 h-4 text-emerald-500" />
                  <span>{assignment.trainer?.name || "Not assigned"}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Schedule
                </span>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                  <span>
                    {new Date(assignment.startDate).toLocaleDateString(
                      "en-US",
                      { month: "short", day: "numeric", year: "numeric" },
                    )}
                    {" - "}
                    {new Date(assignment.endDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                disabled={isDeleting}
                onClick={() => navigate("/assignments")}
                className="w-full sm:w-auto border-border/60 hover:bg-accent/50 order-2 sm:order-1"
              >
                Cancel, Keep Assignment
              </Button>

              <Button
                type="button"
                variant="destructive"
                disabled={isDeleting}
                onClick={handleDelete}
                className="w-full sm:w-auto bg-destructive hover:bg-destructive/90 text-destructive-foreground font-medium min-w-[150px] shadow-sm transition-all order-1 sm:order-2"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Yes, Delete Assignment
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </section>
  );
}
