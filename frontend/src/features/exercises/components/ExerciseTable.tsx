import { MoreHorizontal, Pencil, Trash2, Eye } from "lucide-react";

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

const difficultyVariant = {
  beginner: "bg-emerald-500/15 text-emerald-400",
  intermediate: "bg-yellow-500/15 text-yellow-400",
  advanced: "bg-red-500/15 text-red-400",
};

const ExerciseTable = ({ exercises, isLoading }: ExerciseTableProps) => {
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(
    null,
  );

  const [openEdit, setOpenEdit] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [openView, setOpenView] = useState(false);

  if (isLoading) {
    return <p>Loading...</p>;
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
          <TableRow>
            <TableHead>Name</TableHead>

            <TableHead>Description</TableHead>

            <TableHead>Equipment</TableHead>

            <TableHead>Difficulty</TableHead>

            <TableHead>Primary Muscles</TableHead>

            <TableHead className="w-[70px]" />
          </TableRow>
        </TableHeader>

        <TableBody>
          {exercises.map((exercise) => (
            <TableRow key={exercise.id}>
              <TableCell className="font-semibold">{exercise.name}</TableCell>

              <TableCell className="max-w-sm truncate text-muted-foreground">
                {exercise.description}
              </TableCell>

              <TableCell>
                <div className="flex flex-wrap gap-2">
                  {exercise.equipment.map((item) => (
                    <Badge key={item} variant="secondary">
                      {item}
                    </Badge>
                  ))}
                </div>
              </TableCell>

              <TableCell>
                <Badge
                  className={
                    difficultyVariant[
                      exercise.difficulty.toLowerCase() as keyof typeof difficultyVariant
                    ]
                  }
                >
                  {exercise.difficulty}
                </Badge>
              </TableCell>

              <TableCell>
                <div className="flex flex-wrap gap-2">
                  {exercise.primaryMuscles.map((muscle) => (
                    <Badge key={muscle} variant="outline">
                      {muscle}
                    </Badge>
                  ))}
                </div>
              </TableCell>

              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <Button size="icon" variant="ghost">
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
                      className="text-red-500"
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
          ))}
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
