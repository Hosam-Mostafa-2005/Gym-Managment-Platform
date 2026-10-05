// src/features/exercises/pages/CreateExercisePage.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, X, AlertCircle } from "lucide-react";

import { useCreateExercise } from "../hooks/useCreateExercise";
import type { CreateExerciseDto } from "../types/exercise.types";

const EQUIPMENT_OPTIONS = [
  "Barbell",
  "Dumbbell",
  "Cable",
  "Machine",
  "Smith Machine",
  "Bodyweight",
  "EZ Bar",
  "Resistance Band",
  "Kettlebell",
];

const DIFFICULTY_OPTIONS = [
  { label: "Beginner", value: "beginner" },
  { label: "Intermediate", value: "intermediate" },
  { label: "Advanced", value: "advanced" },
];

export const CreateExercisePage: React.FC = () => {
  const navigate = useNavigate();
  const createExerciseMutation = useCreateExercise();

  // 1. Form State based strictly on CreateExerciseDto[cite: 14]
  const [formData, setFormData] = useState<CreateExerciseDto>({
    name: "",
    description: "",
    videoUrl: "",
    difficulty: "beginner",
    equipment: [],
    primaryMuscles: [],
    secondaryMuscles: [],
    instructions: [""],
    tips: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Local state for dynamic list inputs
  const [primaryInput, setPrimaryInput] = useState("");
  const [secondaryInput, setSecondaryInput] = useState("");

  // 2. Handlers
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name])
      setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  };

  const setDifficulty = (val: string) => {
    setFormData((prev) => ({ ...prev, difficulty: val }));
  };

  const toggleEquipment = (eq: string) => {
    setFormData((prev) => ({
      ...prev,
      equipment: prev.equipment.includes(eq)
        ? prev.equipment.filter((item) => item !== eq)
        : [...prev.equipment, eq],
    }));
    if (errors.equipment) setErrors((prev) => ({ ...prev, equipment: "" }));
  };

  const handleMuscleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    type: "primary" | "secondary",
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const val =
        type === "primary" ? primaryInput.trim() : secondaryInput.trim();
      if (!val) return;

      const field = type === "primary" ? "primaryMuscles" : "secondaryMuscles";
      if (!formData[field].includes(val)) {
        setFormData((prev) => ({ ...prev, [field]: [...prev[field], val] }));
      }

      // Replaced ternary expression to satisfy ESLint no-unused-expressions[cite: 15]
      if (type === "primary") {
        setPrimaryInput("");
      } else {
        setSecondaryInput("");
      }
    }
  };

  const removeMuscle = (val: string, type: "primary" | "secondary") => {
    const field = type === "primary" ? "primaryMuscles" : "secondaryMuscles";
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((m) => m !== val),
    }));
  };

  const handleDynamicListChange = (
    index: number,
    value: string,
    list: "instructions" | "tips",
  ) => {
    const updated = [...formData[list]];
    updated[index] = value;
    setFormData((prev) => ({ ...prev, [list]: updated }));
    if (list === "instructions" && errors.instructions)
      setErrors((prev) => ({ ...prev, instructions: "" }));
  };

  const addDynamicItem = (list: "instructions" | "tips") => {
    setFormData((prev) => ({ ...prev, [list]: [...prev[list], ""] }));
  };

  const removeDynamicItem = (index: number, list: "instructions" | "tips") => {
    const updated = [...formData[list]];
    updated.splice(index, 1);
    setFormData((prev) => ({ ...prev, [list]: updated }));
  };

  // 3. Validation & Submission
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Exercise name is required.";
    if (!formData.description.trim())
      newErrors.description = "Description is required.";
    if (formData.equipment.length === 0)
      newErrors.equipment = "Select at least one equipment type.";

    const validInstructions = formData.instructions
      .map((i) => i.trim())
      .filter(Boolean);
    if (validInstructions.length === 0) {
      newErrors.instructions = "At least one instruction is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload: CreateExerciseDto = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      videoUrl: formData.videoUrl?.trim() || undefined,
      difficulty: formData.difficulty,
      equipment: formData.equipment,
      primaryMuscles: formData.primaryMuscles
        .map((i) => i.trim())
        .filter(Boolean),
      secondaryMuscles: formData.secondaryMuscles
        .map((i) => i.trim())
        .filter(Boolean),
      instructions: formData.instructions.map((i) => i.trim()).filter(Boolean),
      tips: formData.tips.map((i) => i.trim()).filter(Boolean),
    };

    createExerciseMutation.mutate(payload, {
      onSuccess: () => {
        navigate("/workout-library/exercises");
      },
    });
  };

  return (
    <div className="relative min-h-screen w-full bg-[#0D1014] text-[#F3F4F6] font-sans selection:bg-[#5BE584]/30">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(30,35,41,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(30,35,41,0.2)_1px,transparent_1px)] bg-[size:32px_32px]" />
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-[radial-gradient(circle_at_center,_rgba(91,229,132,0.02)_0%,_rgba(13,16,20,0)_70%)] blur-3xl" />
      </div>

      <header className="relative z-10 border-b border-[#1E2329] bg-[#0D1014]/90 backdrop-blur-md pt-8 pb-6 px-6 lg:px-12">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-[11px] font-medium tracking-wide text-[#6B7280] uppercase">
              <span
                className="hover:text-[#9CA3AF] cursor-pointer"
                onClick={() => navigate("/workout-library")}
              >
                Workout Library
              </span>
              <span>/</span>
              <span
                className="hover:text-[#9CA3AF] cursor-pointer"
                onClick={() => navigate("/workout-library/exercises")}
              >
                Exercises
              </span>
              <span>/</span>
              <span className="text-[#F3F4F6]">Create</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-white mt-1">
              Create Exercise
            </h1>
            <p className="text-sm text-[#9CA3AF]">
              Add a new movement to your exercise library.
            </p>
          </div>
          <button
            onClick={() => navigate("/workout-library/exercises")}
            className="group hidden md:flex items-center gap-2 text-sm font-medium text-[#9CA3AF] transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Exercises
          </button>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-6 lg:px-12 py-10 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          <div className="lg:col-span-8 flex flex-col gap-10">
            <section>
              <div className="mb-6">
                <h2 className="text-[11px] font-bold tracking-widest text-[#6B7280] uppercase">
                  Basic Information
                </h2>
                <p className="text-xs text-[#6B7280] mt-1">
                  Tell us what this exercise is.
                </p>
              </div>
              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#9CA3AF]">
                    Exercise Name <span className="text-red-400/80">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Barbell Bench Press"
                    className={`w-full rounded-md border bg-[#101418] px-4 py-2.5 text-sm text-[#F3F4F6] placeholder-[#6B7280] transition-colors focus:outline-none focus:ring-1 ${
                      errors.name
                        ? "border-red-500/50 focus:border-red-500 focus:ring-red-500"
                        : "border-[#1E2329] focus:border-[#5BE584] focus:ring-[#5BE584]"
                    }`}
                  />
                  {errors.name && (
                    <span className="text-[11px] text-red-400 mt-0.5 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.name}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#9CA3AF]">
                    Description <span className="text-red-400/80">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Briefly describe the mechanics and purpose..."
                    rows={3}
                    className={`w-full resize-y rounded-md border bg-[#101418] px-4 py-2.5 text-sm text-[#F3F4F6] placeholder-[#6B7280] transition-colors focus:outline-none focus:ring-1 ${
                      errors.description
                        ? "border-red-500/50 focus:border-red-500 focus:ring-red-500"
                        : "border-[#1E2329] focus:border-[#5BE584] focus:ring-[#5BE584]"
                    }`}
                  />
                  {errors.description && (
                    <span className="text-[11px] text-red-400 mt-0.5 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.description}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#9CA3AF]">
                    Video URL
                  </label>
                  <input
                    type="url"
                    name="videoUrl"
                    value={formData.videoUrl}
                    onChange={handleChange}
                    placeholder="https://..."
                    className="w-full rounded-md border border-[#1E2329] bg-[#101418] px-4 py-2.5 text-sm text-[#F3F4F6] placeholder-[#6B7280] transition-colors focus:border-[#5BE584] focus:outline-none focus:ring-1 focus:ring-[#5BE584]"
                  />
                </div>
              </div>
            </section>

            <div className="h-px w-full bg-gradient-to-r from-[#1E2329] to-transparent" />

            <section>
              <div className="mb-6">
                <h2 className="text-[11px] font-bold tracking-widest text-[#6B7280] uppercase">
                  Classification
                </h2>
                <p className="text-xs text-[#6B7280] mt-1">
                  Difficulty and required equipment.
                </p>
              </div>
              <div className="flex flex-col gap-8">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-[#9CA3AF]">
                    Difficulty <span className="text-red-400/80">*</span>
                  </label>
                  <div className="flex w-full md:w-fit rounded-md border border-[#1E2329] bg-[#101418] p-1">
                    {DIFFICULTY_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setDifficulty(opt.value)}
                        className={`flex-1 md:flex-none px-6 py-2 text-xs font-medium rounded transition-all duration-200 ${
                          formData.difficulty === opt.value
                            ? "bg-[#1E2329] text-white shadow-sm"
                            : "text-[#6B7280] hover:text-[#9CA3AF]"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <label className="text-xs font-semibold text-[#9CA3AF]">
                    Equipment <span className="text-red-400/80">*</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {EQUIPMENT_OPTIONS.map((eq) => {
                      const isSelected = formData.equipment.includes(eq);
                      return (
                        <button
                          key={eq}
                          type="button"
                          onClick={() => toggleEquipment(eq)}
                          className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors duration-200 ${
                            isSelected
                              ? "bg-[#16291D] border-[#23422E] text-[#5BE584]"
                              : "bg-[#101418] border-[#1E2329] text-[#9CA3AF] hover:border-[#6B7280] hover:text-[#F3F4F6]"
                          }`}
                        >
                          {eq}
                        </button>
                      );
                    })}
                  </div>
                  {errors.equipment && (
                    <span className="text-[11px] text-red-400 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.equipment}
                    </span>
                  )}
                </div>
              </div>
            </section>

            <div className="h-px w-full bg-gradient-to-r from-[#1E2329] to-transparent" />

            <section>
              <div className="mb-6">
                <h2 className="text-[11px] font-bold tracking-widest text-[#6B7280] uppercase">
                  Muscle Groups
                </h2>
                <p className="text-xs text-[#6B7280] mt-1">
                  Targeted anatomical regions.
                </p>
              </div>
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-[#9CA3AF]">
                    Primary Muscles
                  </label>
                  <div className="flex flex-wrap items-center gap-2">
                    {formData.primaryMuscles.map((muscle) => (
                      <div
                        key={muscle}
                        className="group flex items-center gap-1.5 rounded bg-[#101418] border border-[#1E2329] px-2.5 py-1 text-xs font-medium text-[#F3F4F6] transition-colors hover:border-red-500/30"
                      >
                        {muscle}
                        <button
                          type="button"
                          onClick={() => removeMuscle(muscle, "primary")}
                          className="text-[#6B7280] hover:text-red-400 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    <input
                      type="text"
                      value={primaryInput}
                      onChange={(e) => setPrimaryInput(e.target.value)}
                      onKeyDown={(e) => handleMuscleKeyDown(e, "primary")}
                      placeholder="Type & press Enter"
                      className="w-40 bg-transparent py-1 text-xs text-[#F3F4F6] placeholder-[#6B7280] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-[#9CA3AF]">
                    Secondary Muscles
                  </label>
                  <div className="flex flex-wrap items-center gap-2">
                    {formData.secondaryMuscles.map((muscle) => (
                      <div
                        key={muscle}
                        className="group flex items-center gap-1.5 rounded bg-[#101418] border border-[#1E2329] px-2.5 py-1 text-xs font-medium text-[#F3F4F6] transition-colors hover:border-red-500/30"
                      >
                        {muscle}
                        <button
                          type="button"
                          onClick={() => removeMuscle(muscle, "secondary")}
                          className="text-[#6B7280] hover:text-red-400 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    <input
                      type="text"
                      value={secondaryInput}
                      onChange={(e) => setSecondaryInput(e.target.value)}
                      onKeyDown={(e) => handleMuscleKeyDown(e, "secondary")}
                      placeholder="Type & press Enter"
                      className="w-40 bg-transparent py-1 text-xs text-[#F3F4F6] placeholder-[#6B7280] focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </section>

            <div className="h-px w-full bg-gradient-to-r from-[#1E2329] to-transparent" />

            <section>
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-[11px] font-bold tracking-widest text-[#6B7280] uppercase">
                    Instructions
                  </h2>
                  <p className="text-xs text-[#6B7280] mt-1">
                    Step-by-step execution guide.
                  </p>
                </div>
                {errors.instructions && (
                  <span className="text-[11px] text-red-400 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.instructions}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-3">
                {formData.instructions.map((inst, index) => (
                  <div key={index} className="group flex items-start gap-4">
                    <div className="flex w-6 shrink-0 justify-end pt-2">
                      <span className="text-sm font-mono text-[#6B7280] group-focus-within:text-[#5BE584] transition-colors">
                        {(index + 1).toString().padStart(2, "0")}
                      </span>
                    </div>
                    <div className="relative flex-1">
                      <textarea
                        value={inst}
                        onChange={(e) =>
                          handleDynamicListChange(
                            index,
                            e.target.value,
                            "instructions",
                          )
                        }
                        placeholder="Describe this step..."
                        rows={2}
                        className="w-full resize-none rounded-md border border-[#1E2329] bg-[#101418] py-2 pl-4 pr-10 text-sm text-[#F3F4F6] placeholder-[#6B7280] transition-colors focus:border-[#5BE584] focus:outline-none focus:ring-1 focus:ring-[#5BE584]"
                      />
                      <button
                        type="button"
                        onClick={() => removeDynamicItem(index, "instructions")}
                        disabled={formData.instructions.length <= 1}
                        className="absolute right-2 top-2 rounded p-1 text-[#6B7280] opacity-0 transition-all hover:bg-red-500/10 hover:text-red-400 group-hover:opacity-100 disabled:hidden"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}

                <div className="flex pl-10 mt-2">
                  <button
                    type="button"
                    onClick={() => addDynamicItem("instructions")}
                    className="text-xs font-semibold text-[#6B7280] transition-colors hover:text-[#F3F4F6]"
                  >
                    + Add instruction
                  </button>
                </div>
              </div>
            </section>

            <div className="h-px w-full bg-gradient-to-r from-[#1E2329] to-transparent" />

            <section>
              <div className="mb-6">
                <h2 className="text-[11px] font-bold tracking-widest text-[#6B7280] uppercase">
                  Tips
                </h2>
                <p className="text-xs text-[#6B7280] mt-1">
                  Form cues and common mistakes to avoid.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                {formData.tips.map((tip, index) => (
                  <div key={index} className="group flex items-center gap-4">
                    <div className="w-6 shrink-0 flex justify-end">
                      <div className="h-1.5 w-1.5 rounded-full bg-[#1E2329] group-focus-within:bg-[#5BE584] transition-colors" />
                    </div>
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={tip}
                        onChange={(e) =>
                          handleDynamicListChange(index, e.target.value, "tips")
                        }
                        placeholder="E.g., Keep your shoulder blades retracted."
                        className="w-full rounded-md border border-transparent bg-[#101418] py-2 pl-4 pr-10 text-sm text-[#F3F4F6] placeholder-[#6B7280] transition-colors hover:border-[#1E2329] focus:border-[#5BE584] focus:outline-none focus:ring-1 focus:ring-[#5BE584]"
                      />
                      <button
                        type="button"
                        onClick={() => removeDynamicItem(index, "tips")}
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-[#6B7280] opacity-0 transition-all hover:bg-red-500/10 hover:text-red-400 group-hover:opacity-100"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}

                <div className="flex pl-10 mt-1">
                  <button
                    type="button"
                    onClick={() => addDynamicItem("tips")}
                    className="text-xs font-semibold text-[#6B7280] transition-colors hover:text-[#F3F4F6]"
                  >
                    + Add tip
                  </button>
                </div>
              </div>
            </section>
          </div>

          <div className="lg:col-span-4 hidden lg:block">
            <div className="sticky top-24 rounded-xl border border-[#1E2329] bg-[#101418]/80 backdrop-blur-md p-6 shadow-2xl">
              <div className="mb-6 flex items-center justify-between border-b border-[#1E2329] pb-4">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280]">
                  Exercise Preview
                </h3>
                <span className="flex h-2 w-2 rounded-full bg-[#5BE584] opacity-50" />
              </div>

              <div className="flex flex-col gap-6">
                <div>
                  <h4
                    className={`text-lg font-semibold tracking-tight ${formData.name ? "text-white" : "text-[#6B7280]"}`}
                  >
                    {formData.name || "New Exercise"}
                  </h4>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className="text-xs capitalize text-[#9CA3AF] bg-[#1E2329] px-2 py-0.5 rounded">
                      {formData.difficulty}
                    </span>
                    {formData.equipment.slice(0, 2).map((eq, i) => (
                      <span
                        key={i}
                        className="text-xs text-[#9CA3AF] bg-[#1E2329] px-2 py-0.5 rounded"
                      >
                        {eq}
                      </span>
                    ))}
                    {formData.equipment.length > 2 && (
                      <span className="text-xs text-[#6B7280]">
                        +{formData.equipment.length - 2}
                      </span>
                    )}
                  </div>
                </div>

                {(formData.primaryMuscles.length > 0 ||
                  formData.secondaryMuscles.length > 0) && (
                  <div className="flex flex-col gap-4 border-t border-[#1E2329] pt-4">
                    {formData.primaryMuscles.length > 0 && (
                      <div>
                        <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider block mb-1.5">
                          Primary
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {formData.primaryMuscles.map((m) => (
                            <span key={m} className="text-xs text-[#F3F4F6]">
                              {m}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {formData.secondaryMuscles.length > 0 && (
                      <div>
                        <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider block mb-1.5">
                          Secondary
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {formData.secondaryMuscles.map((m) => (
                            <span key={m} className="text-xs text-[#9CA3AF]">
                              {m}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {formData.description && (
                  <div className="border-t border-[#1E2329] pt-4">
                    <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider block mb-1.5">
                      Description
                    </span>
                    <p className="text-xs text-[#9CA3AF] line-clamp-4 leading-relaxed">
                      {formData.description}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 w-full z-20 border-t border-[#1E2329] bg-[#0D1014]/80 backdrop-blur-xl px-6 py-4">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <p className="hidden md:block text-xs text-[#6B7280]">
            Review your details before creating.
          </p>
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <button
              type="button"
              onClick={() => navigate("/workout-library/exercises")}
              className="rounded-md px-5 py-2 text-sm font-medium text-[#9CA3AF] transition-colors hover:bg-[#1E2329] hover:text-white disabled:opacity-50"
              disabled={createExerciseMutation.isPending}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={createExerciseMutation.isPending}
              className="inline-flex min-w-[140px] items-center justify-center rounded-md bg-[#5BE584] px-5 py-2 text-sm font-semibold text-[#090B0F] transition-all hover:bg-[#4ade80] focus:outline-none focus:ring-2 focus:ring-[#5BE584] focus:ring-offset-2 focus:ring-offset-[#0D1014] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {createExerciseMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="h-4 w-4 animate-spin text-[#090B0F]"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Saving...
                </span>
              ) : (
                "Create Exercise"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateExercisePage;
