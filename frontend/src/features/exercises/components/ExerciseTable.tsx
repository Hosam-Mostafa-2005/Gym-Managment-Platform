import { MoreHorizontal, Pencil, Trash2, Eye, Dumbbell } from "lucide-react";

import type { Exercise } from "../types/exercise.types";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";
import ViewExerciseDialog from "./ViewExerciseDialog";
import EditExerciseDialog from "./EditExerciseDialog";
import DeleteExerciseDialog from "./DeleteExerciseDialog";

interface ExerciseTableProps {
  exercises: Exercise[];
  isLoading: boolean;
}

// Clean, muted modern badge styling mapped by category type
const categoryVariant: Record<string, string> = {
  strength: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  cardio: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  mobility: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  hypertrophy: "bg-amber-500/10 text-amber-400 border-amber-500/20",
};

// Helper to determine a category badge if the property doesn't exist on the type
const getCategoryForExercise = (exercise: Exercise & { category?: string }) => {
  if (exercise.category) return exercise.category.toLowerCase();

  const name = exercise.name.toLowerCase();
  const primary = exercise.primaryMuscles?.join(" ").toLowerCase() || "";

  if (
    name.includes("sprint") ||
    name.includes("treadmill") ||
    primary.includes("cardio")
  ) {
    return "cardio";
  }
  if (
    name.includes("rotation") ||
    name.includes("stretch") ||
    name.includes("mobility")
  ) {
    return "mobility";
  }
  if (
    primary.includes("quads") ||
    primary.includes("chest") ||
    primary.includes("back") ||
    primary.includes("hamstrings")
  ) {
    return "strength";
  }
  return "hypertrophy";
};

const ExerciseTable = ({ exercises, isLoading }: ExerciseTableProps) => {
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(
    null,
  );

  const [openEdit, setOpenEdit] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [openView, setOpenView] = useState(false);

  if (isLoading) {
    return (
      <p className="py-10 text-center text-muted-foreground">Loading...</p>
    );
  }

  if (!exercises.length) {
    return (
      <div className="rounded-2xl border border-dashed border-border py-20 text-center">
        <h3 className="text-xl font-semibold">No exercises found</h3>
        <p className="mt-2 text-muted-foreground">
          Create your first exercise to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Exercise Name
            </TableHead>
            <TableHead className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Category
            </TableHead>
            <TableHead className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Equipment
            </TableHead>
            <TableHead className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Difficulty
            </TableHead>
            <TableHead className="w-[70px] text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {exercises.map((exercise) => {
            const primaryMusclesStr = exercise.primaryMuscles?.length
              ? exercise.primaryMuscles.join(", ")
              : exercise.description || "";

            const categoryKey = getCategoryForExercise(exercise);
            const badgeClass =
              categoryVariant[categoryKey] || categoryVariant.strength;

            return (
              <TableRow
                key={exercise.id}
                className="border-border hover:bg-muted/50"
              >
                {/* Exercise Name with Icon */}
                <TableCell className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary/80 text-muted-foreground">
                      <Dumbbell className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">
                        {exercise.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Primary: {primaryMusclesStr}
                      </div>
                    </div>
                  </div>
                </TableCell>

                {/* Category Badge */}
                <TableCell className="py-4">
                  <Badge
                    variant="outline"
                    className={`rounded-full px-3 py-1 font-medium capitalize ${badgeClass}`}
                  >
                    {categoryKey}
                  </Badge>
                </TableCell>

                {/* Equipment */}
                <TableCell className="py-4 font-medium text-foreground">
                  {exercise.equipment?.join(", ") || "—"}
                </TableCell>

                {/* Difficulty */}
                <TableCell className="py-4 font-normal capitalize text-muted-foreground">
                  {exercise.difficulty}
                </TableCell>

                {/* Actions Menu */}
                <TableCell className="py-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedExercise(exercise);
                          setOpenView(true);
                        }}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedExercise(exercise);
                          setOpenEdit(true);
                        }}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        className="text-red-500 focus:text-red-500"
                        onClick={() => {
                          setSelectedExercise(exercise);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <ViewExerciseDialog
        exerciseId={selectedExercise?.id}
        open={openView}
        onOpenChange={setOpenView}
      />
      <EditExerciseDialog
        open={openEdit}
        onOpenChange={setOpenEdit}
        exercise={selectedExercise}
      />
      <DeleteExerciseDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);
          if (!open) {
            setSelectedExercise(null);
          }
        }}
        exercise={selectedExercise}
      />
    </div>
  );
};

export default ExerciseTable;
