import { useState, useMemo } from "react";
import {
  Plus,
  Search,
  Dumbbell,
  Clock,
  Layers,
  MoreVertical,
  Eye,
  Pencil,
  Trash2,
  X,
  AlertTriangle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useWorkouts } from "@/features/workouts/hooks/useWorkouts";
import { useDeleteWorkout } from "@/features/workouts/hooks/useDeleteWorkout";

import type { Workout } from "@/features/workouts/types/workout.types";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function WorkoutsPage() {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Delete Confirmation Modal State
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    id: string;
    title: string;
  }>({
    isOpen: false,
    id: "",
    title: "",
  });

  // Fetch existing workouts and delete mutation
  const { data: workouts = [], isLoading } = useWorkouts();
  const { mutate: deleteWorkout, isPending: isDeleting } = useDeleteWorkout();

  // Filter workouts for the search bar and category chips
  const filteredWorkouts = useMemo(() => {
    return workouts.filter((workout: Workout) => {
      const matchesSearch =
        workout.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        workout.description?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        !selectedCategory ||
        workout.category.toLowerCase() === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [workouts, searchQuery, selectedCategory]);

  const handleDeleteClick = (id: string, title: string) => {
    setDeleteModal({ isOpen: true, id, title });
  };

  const confirmDelete = () => {
    if (deleteModal.id) {
      deleteWorkout(deleteModal.id, {
        onSuccess: () => {
          setDeleteModal({ isOpen: false, id: "", title: "" });
        },
      });
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#0D1014] text-[#F3F4F6] font-sans selection:bg-[#5BE584]/30">
      {/* Background Atmosphere */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(30,35,41,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(30,35,41,0.2)_1px,transparent_1px)] bg-[size:32px_32px]" />
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-[radial-gradient(circle_at_center,_rgba(91,229,132,0.02)_0%,_rgba(13,16,20,0)_70%)] blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-[#1E2329] bg-[#0D1014]/90 backdrop-blur-md pt-8 pb-6 px-6 lg:px-12">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-[11px] font-medium tracking-wide text-[#6B7280] uppercase">
              <span className="text-[#F3F4F6]">Workouts</span>
              <span>/</span>
              <span className="hover:text-[#9CA3AF] cursor-pointer">
                Library
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-white mt-1">
              Workouts
            </h1>
            <p className="text-sm text-[#9CA3AF]">
              Create, customize, and manage your structured workout routines.
            </p>
          </div>

          <button
            onClick={() => navigate("/workout-builder/new")}
            className="group flex items-center justify-center gap-2 rounded-md bg-[#5BE584] px-5 py-2.5 text-sm font-semibold text-[#090B0F] transition-all hover:bg-[#4ade80] focus:outline-none focus:ring-2 focus:ring-[#5BE584] focus:ring-offset-2 focus:ring-offset-[#0D1014]"
          >
            <Plus className="h-4 w-4 transition-transform group-hover:scale-110" />
            New Workout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 mx-auto max-w-7xl px-6 lg:px-12 py-10 pb-32 space-y-10 animate-in fade-in duration-300">
        {/* Filter & Search Section */}
        <section>
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-[11px] font-bold tracking-widest text-[#6B7280] uppercase">
              Filter & Search
            </h2>
          </div>

          <div className="rounded-xl border border-[#1E2329] bg-[#101418] p-4 flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Category Chips */}
            <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
              {[
                "strength",
                "hypertrophy",
                "powerlifting",
                "cardio",
                "functional",
              ].map((cat) => {
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(isSelected ? null : cat)}
                    className={`px-3 py-1.5 rounded-full text-[11px] font-medium transition-colors duration-200 border capitalize ${
                      isSelected
                        ? "bg-[#16291D] border-[#23422E] text-[#5BE584]"
                        : "bg-[#101418] border-[#1E2329] text-[#9CA3AF] hover:border-[#6B7280] hover:text-[#F3F4F6]"
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            {/* Search Bar */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7280]" />
              <input
                type="text"
                placeholder="Search workouts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 pl-9 pr-4 rounded-md border border-[#1E2329] bg-[#101418] text-xs text-[#F3F4F6] placeholder-[#6B7280] transition-colors focus:border-[#5BE584] focus:outline-none focus:ring-1 focus:ring-[#5BE584]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#9CA3AF]"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </section>

        <div className="h-px w-full bg-gradient-to-r from-[#1E2329] to-transparent" />

        {/* Workouts Grid Workspace */}
        <section>
          <div className="mb-4">
            <h2 className="text-[11px] font-bold tracking-widest text-[#6B7280] uppercase">
              Workout Templates
            </h2>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-48 rounded-xl border border-[#1E2329] bg-[#101418] animate-pulse"
                />
              ))}
            </div>
          ) : filteredWorkouts.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#1E2329] bg-[#101418]/50 p-16 text-center backdrop-blur-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#16291D] text-[#5BE584] border border-[#23422E] mb-4">
                <Dumbbell className="h-5 w-5" />
              </div>
              <h2 className="text-sm font-semibold text-white">
                No workouts found
              </h2>
              <p className="mt-1.5 text-xs text-[#9CA3AF] max-w-sm">
                {searchQuery || selectedCategory
                  ? "We couldn't find any workouts matching your current filters. Try resetting them."
                  : "You haven't designed any workout templates yet. Get started by creating your first routine."}
              </p>
              <button
                className="mt-5 rounded-md border border-[#1E2329] bg-[#101418] px-4 py-2 text-xs font-medium text-[#9CA3AF] transition-colors hover:border-[#6B7280] hover:text-white"
                onClick={() => {
                  if (searchQuery || selectedCategory) {
                    setSearchQuery("");
                    setSelectedCategory(null);
                  } else {
                    navigate("/workout-builder/new");
                  }
                }}
              >
                {searchQuery || selectedCategory
                  ? "Clear Filters"
                  : "Create First Workout"}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredWorkouts.map((workout: Workout) => (
                <div
                  key={workout.id}
                  className="group relative rounded-xl border border-[#1E2329] bg-[#101418] hover:border-[#2A313A] transition-all duration-200 flex flex-col justify-between p-6"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div
                        className="space-y-1 cursor-pointer flex-1"
                        onClick={() =>
                          navigate(`/workout-builder/${workout.id}`)
                        }
                      >
                        <h3 className="text-base font-semibold text-white group-hover:text-[#5BE584] transition-colors">
                          {workout.title}
                        </h3>
                        <p className="text-xs text-[#9CA3AF] line-clamp-2 leading-relaxed">
                          {workout.description || "No description provided."}
                        </p>
                      </div>

                      {/* 3-DOTS DROPDOWN MENU */}
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <button className="h-8 w-8 -mr-2 -mt-2 inline-flex items-center justify-center rounded text-[#6B7280] hover:bg-[#1E2329] hover:text-[#F3F4F6] transition-colors focus:outline-none focus:ring-1 focus:ring-[#5BE584]">
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent
                          align="end"
                          className="w-44 border-[#1E2329] bg-[#101418] text-[#F3F4F6] shadow-xl"
                        >
                          <DropdownMenuItem
                            onClick={() =>
                              navigate(`/workout-builder/${workout.id}`)
                            }
                            className="cursor-pointer text-xs font-medium hover:bg-[#1E2329] focus:bg-[#1E2329] focus:text-white"
                          >
                            <Eye className="mr-2 h-3.5 w-3.5 text-[#9CA3AF]" />
                            View Details
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={() =>
                              navigate(`/workout-builder/${workout.id}/edit`)
                            }
                            className="cursor-pointer text-xs font-medium hover:bg-[#1E2329] focus:bg-[#1E2329] focus:text-white"
                          >
                            <Pencil className="mr-2 h-3.5 w-3.5 text-[#9CA3AF]" />
                            Edit Workout
                          </DropdownMenuItem>

                          <DropdownMenuSeparator className="bg-[#1E2329]" />

                          <DropdownMenuItem
                            onClick={() =>
                              handleDeleteClick(workout.id, workout.title)
                            }
                            className="cursor-pointer text-xs font-medium text-red-400 focus:bg-red-950/30 focus:text-red-400"
                          >
                            <Trash2 className="mr-2 h-3.5 w-3.5 text-red-400" />
                            Delete Routine
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Tags & Difficulty */}
                    <div className="flex flex-wrap gap-1.5 mt-4">
                      <span className="inline-flex items-center rounded bg-[#16291D] border border-[#23422E] px-2.5 py-0.5 text-[11px] font-medium text-[#5BE584] capitalize">
                        {workout.category}
                      </span>
                      <span className="inline-flex items-center rounded bg-[#1E2329] px-2.5 py-0.5 text-[11px] font-medium text-[#D1D5DB] capitalize">
                        {workout.difficulty}
                      </span>
                      {workout.isTemplate && (
                        <span className="inline-flex items-center gap-1 rounded bg-[#1E2329] border border-[#1E2329] px-2.5 py-0.5 text-[11px] font-medium text-[#9CA3AF]">
                          <Layers className="h-3 w-3 text-[#5BE584]" /> Template
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Footer metrics */}
                  <div className="flex items-center justify-between border-t border-[#1E2329] mt-6 pt-4 text-xs text-[#6B7280]">
                    <span className="flex items-center gap-1.5 font-mono text-[#9CA3AF]">
                      <Clock className="h-3.5 w-3.5 text-[#5BE584]" /> ~
                      {workout.estimatedDuration} mins
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280]">
                      Active Plan
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Delete Confirmation Modal */}
      <Dialog
        open={deleteModal.isOpen}
        onOpenChange={(open) =>
          !open && setDeleteModal({ isOpen: false, id: "", title: "" })
        }
      >
        <DialogContent className="sm:max-w-[425px] border-[#1E2329] bg-[#101418] shadow-2xl p-6 text-[#F3F4F6]">
          <DialogHeader className="gap-2 text-left">
            <div className="flex h-10 w-10 items-center justify-center rounded bg-red-950/30 border border-red-900/50 text-red-400 mb-2">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <DialogTitle className="text-xl font-semibold tracking-tight text-white">
              Delete Routine?
            </DialogTitle>
            <DialogDescription className="text-sm text-[#9CA3AF]">
              You are about to permanently delete the workout routine{" "}
              <span className="font-semibold text-white">
                "{deleteModal.title}"
              </span>
              . This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-3 sm:gap-0 mt-6 border-t border-[#1E2329] pt-4">
            <button
              type="button"
              disabled={isDeleting}
              onClick={() =>
                setDeleteModal({ isOpen: false, id: "", title: "" })
              }
              className="rounded-md px-4 py-2 text-sm font-medium text-[#9CA3AF] transition-colors hover:bg-[#1E2329] hover:text-white disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isDeleting}
              onClick={confirmDelete}
              className="inline-flex items-center justify-center rounded-md bg-red-500/90 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-[#101418] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isDeleting ? (
                <>
                  <svg
                    className="mr-2 h-4 w-4 animate-spin text-white"
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
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-3.5 w-3.5" />
                  Delete Routine
                </>
              )}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
