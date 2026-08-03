import { useMemo } from "react";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

// Components & Hooks
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
    <section className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300 text-foreground pb-12">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/40 pb-5">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate("/assignments")}
            className="h-9 w-9 rounded-lg border-border/60 bg-card/40 hover:bg-accent/60"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Edit Workout Assignment
            </h1>

            <p className="text-xs text-muted-foreground mt-0.5">
              Update routine schedule, trainer assignment, or guidelines.
            </p>
          </div>
        </div>
      </div>

      {/* Loading */}
      {isFetching && (
        <Card className="border-border/50 bg-card/30 shadow-xl">
          <CardContent className="p-12 flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            <p className="text-sm font-medium">Loading assignment details...</p>
          </CardContent>
        </Card>
      )}

      {/* Error */}
      {isError && (
        <Card className="border-rose-500/20 bg-rose-500/5 shadow-xl">
          <CardContent className="p-8 flex flex-col items-center text-center gap-3">
            <AlertCircle className="w-10 h-10 text-rose-500" />

            <h3 className="text-base font-semibold">
              Failed to load assignment
            </h3>

            <p className="text-xs text-muted-foreground max-w-sm">
              We couldn't retrieve this assignment. It may have been deleted or
              there is a network problem.
            </p>

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/assignments")}
            >
              Back to Assignments
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Form */}
      {!isFetching && !isError && initialValues && (
        <Card className="border-border/50 bg-card/30 shadow-xl overflow-hidden">
          <CardContent className="p-6 sm:p-8">
            <AssignmentForm
              initialValues={initialValues}
              onSubmit={handleUpdate}
              isLoading={isUpdating}
              submitLabel="Update Assignment"
            />
          </CardContent>
        </Card>
      )}
    </section>
  );
}
