import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Components & Hooks
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AssignmentForm } from "@/features/assignments/components/AssignmentForm";
import { useCreateAssignment } from "@/features/assignments/hooks/useCreateAssignment";
import type { AssignmentFormValues } from "@/features/assignments/schemas/assignment.schema";

export default function CreateAssignmentPage() {
  const navigate = useNavigate();
  const { mutate: createAssignment, isPending } = useCreateAssignment();

  // تشغيل الإضافة عند الضغط على زرار Submit
  const handleCreate = (data: AssignmentFormValues) => {
    createAssignment({
      member: data.member,
      trainer: data.trainer,
      workout: data.workout,
      startDate: data.startDate,
      endDate: data.endDate,
      notes: data.notes || undefined,
    });
  };

  return (
    <section className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300 text-foreground pb-12">
      {/* Top Header & Back Button */}
      <div className="flex items-center justify-between border-b border-border/40 pb-5">
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
            <h1 className="text-2xl font-bold tracking-tight">
              Assign Workout Routine
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Create a new structured workout assignment for a gym member.
            </p>
          </div>
        </div>
      </div>

      {/* Main Form Card */}
      <Card className="border-border/50 bg-card/30 shadow-xl overflow-hidden">
        <CardContent className="p-6 sm:p-8">
          <AssignmentForm
            onSubmit={handleCreate}
            isLoading={isPending}
            submitLabel="Assign Routine"
          />
        </CardContent>
      </Card>
    </section>
  );
}
