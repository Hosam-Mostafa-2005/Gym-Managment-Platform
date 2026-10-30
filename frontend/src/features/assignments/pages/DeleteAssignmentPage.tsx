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
import { useTranslation } from "react-i18next";

// Components & Hooks
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAssignment } from "@/features/assignments/hooks/useAssignment";
import { useDeleteAssignment } from "@/features/assignments/hooks/useDeleteAssignment";

export default function DeleteAssignmentPage() {
  const { t, i18n } = useTranslation(["assignments", "common"]);
  const navigate = useNavigate();
  const { assignmentId } = useParams<{ assignmentId: string }>();

  const locale = i18n.language === "ar" ? "ar-EG" : "en-US";

  // 1. Fetch assignment details
  const {
    data: assignment,
    isLoading: isFetching,
    isError,
  } = useAssignment(assignmentId!);

  // 2. Delete mutation
  const { mutate: deleteAssignment, isPending: isDeleting } =
    useDeleteAssignment();

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
          className="h-9 w-9 rounded-lg border-border/60 bg-card/40 hover:bg-accent/60 transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-destructive flex items-center gap-2">
            <Trash2 className="w-6 h-6" /> {t("deletePage.title", "Delete Assignment")}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t("deletePage.subtitle", "This action cannot be undone. Please confirm the details below.")}
          </p>
        </div>
      </div>

      {/* Loading State */}
      {isFetching && (
        <Card className="border-border/50 bg-card/30 shadow-xl">
          <CardContent className="p-12 flex flex-col items-center justify-center text-muted-foreground gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-destructive" />
            <p className="text-sm font-medium">
              {t("details.loading", "Loading assignment details...")}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {isError && (
        <Card className="border-rose-500/20 bg-rose-500/5 shadow-xl">
          <CardContent className="p-8 flex flex-col items-center justify-center text-center gap-3">
            <AlertTriangle className="w-10 h-10 text-rose-500" />
            <h3 className="text-base font-semibold text-foreground">
              {t("deletePage.notFoundTitle", "Assignment Not Found")}
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm">
              {t(
                "deletePage.notFoundDesc",
                "We couldn't retrieve the assignment details. It might have already been deleted.",
              )}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/assignments")}
              className="mt-2 border-border/60 cursor-pointer"
            >
              {t("details.backToAssignments", "Back to Assignments")}
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
            <div className="text-xs text-start">
              <span className="font-semibold text-destructive block mb-0.5">
                {t("deletePage.warningTitle", "Warning: Permanent Deletion")}
              </span>
              <span className="text-muted-foreground">
                {t(
                  "deletePage.warningDesc",
                  "You are about to permanently delete this workout routine assignment. The member will no longer see this routine in their schedule, and all logged progress for this assignment will be lost.",
                )}
              </span>
            </div>
          </div>

          <CardContent className="p-6 sm:p-8 space-y-6">
            {/* Summary Details */}
            <div className="bg-accent/30 rounded-xl p-5 border border-border/50 space-y-4">
              <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t("details.assignedMember", "Target Member")}
                </span>
                <div className="flex items-center gap-2 font-semibold text-sm">
                  <UserIcon className="w-4 h-4 text-emerald-500" />
                  <span>
                    {assignment.member?.name ||
                      t("details.unknownMember", "Unknown Member")}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t("records.columns.workout", "Assigned Routine")}
                </span>
                <div className="flex items-center gap-2 font-semibold text-sm">
                  <Dumbbell className="w-4 h-4 text-emerald-500" />
                  <Badge
                    variant="secondary"
                    className="font-medium bg-accent/60"
                  >
                    {assignment.workout?.title ||
                      t("details.customRoutine", "General Routine")}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t("records.columns.trainer", "Assigned Trainer")}
                </span>
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <UserCheck className="w-4 h-4 text-emerald-500" />
                  <span>
                    {assignment.trainer?.name ||
                      t("details.notAssigned", "Not assigned")}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t("details.routineSchedule", "Schedule")}
                </span>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                  <span>
                    {new Date(assignment.startDate).toLocaleDateString(
                      locale,
                      { month: "short", day: "numeric", year: "numeric" },
                    )}
                    {" - "}
                    {new Date(assignment.endDate).toLocaleDateString(locale, {
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
                className="w-full sm:w-auto border-border/60 hover:bg-accent/50 order-2 sm:order-1 cursor-pointer"
              >
                {t("deletePage.keepAssignment", "Cancel, Keep Assignment")}
              </Button>

              <Button
                type="button"
                variant="destructive"
                disabled={isDeleting}
                onClick={handleDelete}
                className="w-full sm:w-auto bg-destructive hover:bg-destructive/90 text-destructive-foreground font-medium min-w-[150px] shadow-sm transition-all order-1 sm:order-2 cursor-pointer"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="me-2 h-4 w-4 animate-spin" />
                    {t("deleteModal.deleting", "Deleting...")}
                  </>
                ) : (
                  <>
                    <Trash2 className="me-2 h-4 w-4" />
                    {t("deletePage.confirmDelete", "Yes, Delete Assignment")}
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
