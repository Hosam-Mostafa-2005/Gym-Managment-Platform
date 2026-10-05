import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Components & Hooks
import { AssignmentForm } from "@/features/assignments/components/AssignmentForm";
import { useCreateAssignment } from "@/features/assignments/hooks/useCreateAssignment";
import type { AssignmentFormValues } from "@/features/assignments/schemas/assignment.schema";

export default function CreateAssignmentPage() {
  const navigate = useNavigate();
  const { mutate: createAssignment, isPending } = useCreateAssignment();

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
              <span className="text-[#F3F4F6]">Assign Routine</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-white mt-1">
              Assign Workout Routine
            </h1>
            <p className="text-sm text-[#9CA3AF]">
              Create a new structured workout assignment for a gym member.
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
        <div className="rounded-xl border border-[#1E2329] bg-[#101418]/80 backdrop-blur-sm p-6 sm:p-10 shadow-2xl">
          <div className="mb-8 border-b border-[#1E2329] pb-4">
            <h2 className="text-[11px] font-bold tracking-widest text-[#6B7280] uppercase">
              Assignment Details
            </h2>
            <p className="text-xs text-[#6B7280] mt-1">
              Select the member, trainer, and schedule for this routine.
            </p>
          </div>

          {/* 
            Since AssignmentForm contains the actual fields and submission buttons, 
            we wrap it in a premium container that matches the GymFlow design system.
          */}
          <AssignmentForm
            onSubmit={handleCreate}
            isLoading={isPending}
            submitLabel="Assign Routine"
          />
        </div>
      </main>
    </div>
  );
}
