import { useNavigate } from "react-router-dom";
import { ArrowLeft, Sparkles, Layers, ShieldCheck } from "lucide-react";

import WorkoutForm from "../components/WorkoutForm";
import { useCreateWorkout } from "../hooks/useCreateWorkout";
import type { WorkoutFormData } from "../schemas/workout.schema";

export default function CreateWorkoutPage() {
  const navigate = useNavigate();
  const { mutate, isPending } = useCreateWorkout();

  function handleSubmit(data: WorkoutFormData) {
    mutate(data, {
      onSuccess: () => {
        navigate("/workout-builder");
      },
    });
  }

  return (
    <div className="relative min-h-screen w-full bg-[#0D1014] text-[#F3F4F6] font-sans selection:bg-[#5BE584]/30">
      {/* Background Atmosphere */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(30,35,41,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(30,35,41,0.2)_1px,transparent_1px)] bg-[size:32px_32px]" />
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-[radial-gradient(circle_at_center,_rgba(91,229,132,0.02)_0%,_rgba(13,16,20,0)_70%)] blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-[#1E2329] bg-[#0D1014]/90 backdrop-blur-md pt-8 pb-6 px-6 lg:px-12">
        <div className="mx-auto max-w-7xl flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            {/* Back Navigation & Status Pill */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => navigate("/workout-builder")}
                className="group inline-flex items-center gap-1.5 text-xs font-medium text-[#6B7280] hover:text-[#F3F4F6] transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
                Workouts
              </button>

              <span className="text-[#1E2329]">/</span>

              <span className="inline-flex items-center gap-1 rounded bg-[#16291D] border border-[#23422E] px-2.5 py-0.5 text-[11px] font-medium text-[#5BE584]">
                <Sparkles className="h-3 w-3" />
                Template Creator
              </span>
            </div>

            {/* Title & Description */}
            <div className="space-y-1.5">
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-white">
                Create Workout Routine
              </h1>
              <p className="text-sm text-[#9CA3AF] max-w-2xl leading-relaxed">
                Design a structured training sequence by picking exercises from
                your library, configuring target sets, reps, and rest intervals.
              </p>
            </div>
          </div>

          {/* Right Metadata Chips */}
          <div className="flex items-center gap-2.5 self-start lg:self-auto pt-2 lg:pt-0">
            <div className="flex items-center gap-2 rounded-lg border border-[#1E2329] bg-[#101418] px-3.5 py-1.5 text-xs font-medium text-[#9CA3AF] backdrop-blur-sm">
              <Layers className="h-3.5 w-3.5 text-[#5BE584]" />
              <span>Draft Mode</span>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 rounded-lg border border-[#1E2329] bg-[#101418] px-3.5 py-1.5 text-xs font-medium text-[#9CA3AF] backdrop-blur-sm">
              <ShieldCheck className="h-3.5 w-3.5 text-[#5BE584]" />
              <span>Zod Validated</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 mx-auto max-w-7xl px-6 lg:px-12 py-10 pb-32 animate-in fade-in duration-300">
        <WorkoutForm onSubmit={handleSubmit} isSubmitting={isPending} />
      </main>
    </div>
  );
}
