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
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useWorkouts } from "@/features/workouts/hooks/useWorkouts";
import { useDeleteWorkout } from "@/features/workouts/hooks/useDeleteWorkout";

import type { Workout } from "@/features/workouts/types/workout.types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function WorkoutsPage() {
  const navigate = useNavigate();

  // Toggle between "list" view and "create" view
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Fetch existing workouts and delete mutation
  const { data: workouts = [], isLoading } = useWorkouts();
  const { mutate: deleteWorkout } = useDeleteWorkout();

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

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      deleteWorkout(id);
    }
  };

  /* -------------------------------------------------------------------------- */
  /*                       VIEW: WORKOUTS LIBRARY LIST                        */
  /* -------------------------------------------------------------------------- */
  return (
    <section className="space-y-8 animate-in fade-in duration-300 text-foreground">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/40 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Workouts</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create, customize, and manage your structured workout routines.
          </p>
        </div>

        <Button
          onClick={() => navigate("/workouts/new")}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm transition-all self-start sm:self-auto"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Workout
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search workouts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-card/40 border-border/60 focus-visible:ring-1"
          />
        </div>

        {/* Category Chips */}
        <div className="flex flex-wrap gap-1.5">
          {[
            "strength",
            "hypertrophy",
            "powerlifting",
            "cardio",
            "functional",
          ].map((cat) => (
            <Badge
              key={cat}
              variant={selectedCategory === cat ? "default" : "secondary"}
              className="cursor-pointer capitalize px-3 py-1 font-normal transition-colors"
              onClick={() =>
                setSelectedCategory(selectedCategory === cat ? null : cat)
              }
            >
              {cat}
            </Badge>
          ))}
        </div>
      </div>

      {/* Workouts Grid / Empty State */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-48 rounded-xl border border-border/40 bg-card/20 animate-pulse"
            />
          ))}
        </div>
      ) : filteredWorkouts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/60 bg-card/10 p-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 mb-4">
            <Dumbbell className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-semibold">No workouts found</h2>
          <p className="mt-1 text-sm text-muted-foreground max-w-sm">
            {searchQuery || selectedCategory
              ? "We couldn't find any workouts matching your current filters. Try resetting them."
              : "You haven't designed any workout templates yet. Get started by creating your first routine."}
          </p>
          <Button
            variant="outline"
            className="mt-6 border-dashed border-emerald-500/50 text-emerald-500 hover:bg-emerald-500/10"
            onClick={() => {
              if (searchQuery || selectedCategory) {
                setSearchQuery("");
                setSelectedCategory(null);
              } else {
                navigate("/workouts/new");
              }
            }}
          >
            {searchQuery || selectedCategory
              ? "Clear Filters"
              : "Create First Workout"}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWorkouts.map((workout: Workout) => (
            <Card
              key={workout.id}
              className="group relative border-border/50 bg-card/30 hover:bg-card/80 hover:border-border transition-all duration-200 flex flex-col justify-between"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div
                    className="space-y-1 cursor-pointer flex-1"
                    onClick={() => navigate(`/workouts/${workout.id}`)}
                  >
                    <CardTitle className="text-lg font-semibold group-hover:text-emerald-400 transition-colors">
                      {workout.title}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {workout.description || "No description provided."}
                    </p>
                  </div>

                  {/* ========================================================= */}
                  {/*                  3-DOTS DROPDOWN MENU                     */}
                  {/* ========================================================= */}
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 -mr-2 -mt-2 text-muted-foreground hover:text-foreground focus-visible:ring-1 focus-visible:ring-primary"
                      >
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                      align="end"
                      className="w-44 border-border/60 bg-card/95 backdrop-blur-md shadow-xl"
                    >
                      <DropdownMenuItem
                        onClick={() => navigate(`/workouts/${workout.id}`)}
                        className="cursor-pointer text-xs font-medium hover:bg-accent/60"
                      >
                        <Eye className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                        View Details
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={() => navigate(`/workouts/${workout.id}/edit`)}
                        className="cursor-pointer text-xs font-medium hover:bg-accent/60"
                      >
                        <Pencil className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                        Edit Workout
                      </DropdownMenuItem>

                      <DropdownMenuSeparator className="bg-border/40" />

                      <DropdownMenuItem
                        onClick={() => handleDelete(workout.id, workout.title)}
                        className="cursor-pointer text-xs font-medium text-destructive focus:bg-destructive/10 focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-3.5 w-3.5 text-destructive" />
                        Delete Routine
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>

              <CardContent className="pt-0 space-y-4">
                {/* Tags & Difficulty */}
                <div className="flex flex-wrap gap-1.5 pt-2">
                  <Badge
                    variant="secondary"
                    className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 capitalize font-medium text-[11px]"
                  >
                    {workout.category}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="border-border/60 text-muted-foreground capitalize font-normal text-[11px]"
                  >
                    {workout.difficulty}
                  </Badge>
                  {workout.isTemplate && (
                    <Badge
                      variant="outline"
                      className="border-emerald-500/30 text-emerald-400/80 font-normal text-[11px] flex items-center gap-1"
                    >
                      <Layers className="h-3 w-3" /> Template
                    </Badge>
                  )}
                </div>

                {/* Footer metrics */}
                <div className="flex items-center justify-between border-t border-border/40 pt-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-emerald-500" />~
                    {workout.estimatedDuration} mins
                  </span>
                  <span>Active Plan</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
