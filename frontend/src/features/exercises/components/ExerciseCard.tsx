import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { Exercise } from "../types/exercise.types";
import { ROLES } from "@/constants/roles";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import ExerciseImage from "./ExerciseImage";

interface Props {
  exercise: Exercise;
  onDelete: (id: string) => void;
}

const ExerciseCard = ({ exercise, onDelete }: Props) => {
  const { t } = useTranslation(["exercises"]);
  const { data: user } = useCurrentUser();
  const exerciseId = exercise.id || exercise._id || "";

  const canModify =
    user?.role === ROLES.ADMIN ||
    (user?.role === ROLES.TRAINER &&
      (!exercise.isCustom || exercise.createdById === user.id)) ||
    (user?.role === ROLES.MEMBER &&
      Boolean(exercise.isCustom && exercise.createdById === user.id));

  return (
    <div className="group flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-[#1E2329] bg-[#101418] p-4 shadow-md transition-all hover:border-[#5BE584]/40">
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-base font-bold text-white">{exercise.name}</h3>
          <span className="rounded-md border border-[#5BE584]/30 bg-[#5BE584]/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-[#5BE584]">
            {t(
              `difficulties.${exercise.difficulty?.toLowerCase()}`,
              exercise.difficulty,
            )}
          </span>
        </div>

        <p className="text-xs text-[#9CA3AF]">
          <strong className="text-white">
            {t("card.musclesLabel", "Muscles:")}
          </strong>{" "}
          {exercise.primaryMuscles && exercise.primaryMuscles.length > 0
            ? exercise.primaryMuscles
                .map((m) => t(`muscles.${m}`, m))
                .join(", ")
            : "—"}
        </p>

        <p className="text-xs text-[#9CA3AF]">
          <strong className="text-white">
            {t("card.equipmentLabel", "Equipment:")}
          </strong>{" "}
          {exercise.equipment && exercise.equipment.length > 0
            ? exercise.equipment.map((eq) => t(`equipment.${eq}`, eq)).join(", ")
            : t("card.bodyweight", "Bodyweight")}
        </p>

        <div className="flex items-center gap-2 pt-2">
          <Link
            to={`/workout-library/exercises/${exerciseId}`}
            className="rounded-xl border border-[#262D36] bg-[#141920] px-3 py-1.5 text-xs font-semibold text-white hover:border-[#5BE584]/50 hover:text-[#5BE584] transition-colors"
          >
            {t("card.view", "View")}
          </Link>

          {canModify && (
            <>
              <Link
                to={`/workout-library/exercises/${exerciseId}/edit`}
                className="rounded-xl border border-[#1E2329] bg-[#090B0F] px-3 py-1.5 text-xs font-medium text-[#9CA3AF] hover:text-white transition-colors"
              >
                {t("card.edit", "Edit")}
              </Link>

              <button
                type="button"
                onClick={() => onDelete(exerciseId)}
                className="rounded-xl border border-[#1E2329] bg-[#090B0F] px-3 py-1.5 text-xs font-medium text-red-400 hover:border-red-500/40 hover:bg-red-500/10 transition-colors"
              >
                {t("card.delete", "Delete")}
              </button>
            </>
          )}
        </div>
      </div>

      <ExerciseImage
        src={exercise.imageUrl}
        alt={exercise.name}
        size="lg"
        fit="contain"
      />
    </div>
  );
};

export default ExerciseCard;
