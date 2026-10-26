// src/mappers/body-measurement.mapper.ts

export const mapBodyMeasurement = (doc: any) => {
  const memberObj = doc.member as any;
  const trainerObj = doc.trainer as any;

  const circumferences =
    doc.circumferences ??
    (doc.chest != null ||
    doc.waist != null ||
    doc.hips != null ||
    doc.shoulders != null ||
    doc.neck != null ||
    doc.leftArm != null ||
    doc.rightArm != null ||
    doc.leftThigh != null ||
    doc.rightThigh != null ||
    doc.leftCalf != null ||
    doc.rightCalf != null
      ? {
          chest: doc.chest ?? undefined,
          waist: doc.waist ?? undefined,
          hips: doc.hips ?? undefined,
          shoulders: doc.shoulders ?? undefined,
          neck: doc.neck ?? undefined,
          leftArm: doc.leftArm ?? undefined,
          rightArm: doc.rightArm ?? undefined,
          leftThigh: doc.leftThigh ?? undefined,
          rightThigh: doc.rightThigh ?? undefined,
          leftCalf: doc.leftCalf ?? undefined,
          rightCalf: doc.rightCalf ?? undefined,
        }
      : {});

  const memberId =
    memberObj?.id?.toString() ??
    memberObj?._id?.toString() ??
    doc.memberId?.toString() ??
    doc.member?.toString();

  const trainerId =
    trainerObj?.id?.toString() ??
    trainerObj?._id?.toString() ??
    doc.trainerId?.toString() ??
    doc.trainer?.toString();

  const trainerName = trainerObj?.name ?? doc.trainerName;

  return {
    id: (doc.id ?? doc._id).toString(),
    member: memberId,
    trainer: trainerId,
    ...(trainerName ? { trainerName } : {}),
    weight: doc.weight,
    height: doc.height,
    bodyFat: doc.bodyFat,
    circumferences,
    notes: doc.notes,
    measuredAt: doc.measuredAt,
    isActive: doc.isActive,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
};

export default mapBodyMeasurement;
