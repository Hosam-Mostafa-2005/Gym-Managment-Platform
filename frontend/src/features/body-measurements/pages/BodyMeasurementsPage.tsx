// src/features/body-measurements/pages/BodyMeasurementsPage.tsx
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { useMemberMeasurements } from "../hooks/use-member-measurements";
import { useLatestMeasurement } from "../hooks/use-latest-measurement";

import { MeasurementsHeader } from "../components/shared/MeasurementsHeader";
import { LatestMeasurement } from "../components/overview/LatestMeasurement";
import { MeasurementsTable } from "../components/history/MeasurementsTable";

import { CreateMeasurementDialog } from "../components/dialogs/CreateMeasurementDialog";
import { EditMeasurementDialog } from "../components/dialogs/EditMeasurementDialog";
import { DeleteMeasurementDialog } from "../components/dialogs/DeleteMeasurementDialog";

import { MeasurementsLoading } from "../components/states/MeasurementsLoading";
import { MeasurementsError } from "../components/states/MeasurementsError";
import type { BodyMeasurement } from "../types/body-measurements.types";

const BodyMeasurementsPage: React.FC = () => {
  const { memberId } = useParams<{ memberId: string }>();
  const { data: user } = useCurrentUser();
  const trainerId = user?.id || user?._id || "";

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingMeasurement, setEditingMeasurement] =
    useState<BodyMeasurement | null>(null);
  const [measurementToDelete, setMeasurementToDelete] =
    useState<BodyMeasurement | null>(null);

  const {
    data: measurements,
    isLoading: isLoadingAll,
    isError: isErrorAll,
    error: errorAll,
    refetch: refetchAll,
  } = useMemberMeasurements(memberId);

  const { data: latestMeasurement, isLoading: isLoadingLatest } =
    useLatestMeasurement(memberId);

  if (isLoadingAll || isLoadingLatest) {
    return <MeasurementsLoading />;
  }

  if (isErrorAll) {
    return (
      <MeasurementsError
        message={errorAll instanceof Error ? errorAll.message : undefined}
        onRetry={() => refetchAll()}
      />
    );
  }

  return (
    <div className="min-h-full w-full bg-[#090B0F] p-4 md:p-6 lg:p-8 pb-20">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6">
        <MeasurementsHeader
          memberId={memberId!}
          onAddMeasurement={() => setIsCreateOpen(true)}
        />

        <LatestMeasurement measurement={latestMeasurement || null} />

        <MeasurementsTable
          measurements={measurements || []}
          onEdit={setEditingMeasurement}
          onDelete={setMeasurementToDelete}
        />

        {/* Dialogs */}
        <CreateMeasurementDialog
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          memberId={memberId!}
          trainerId={trainerId}
        />

        <EditMeasurementDialog
          measurement={editingMeasurement}
          onClose={() => setEditingMeasurement(null)}
          memberId={memberId!}
        />

        <DeleteMeasurementDialog
          measurement={measurementToDelete}
          onClose={() => setMeasurementToDelete(null)}
          memberId={memberId!}
        />
      </div>
    </div>
  );
};

export default BodyMeasurementsPage;
