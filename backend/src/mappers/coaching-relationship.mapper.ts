export const mapCoachingRelationship = (entity: any) => ({
  id: entity._id ?? entity.id,
  trainerId: entity.trainerId,
  memberId: entity.memberId,
  status: entity.status,
  historySharingConsent: entity.historySharingConsent,
  invitedAt: entity.invitedAt,
  respondedAt: entity.respondedAt ?? null,
  startedAt: entity.startedAt ?? null,
  terminatedAt: entity.terminatedAt ?? null,
  historyConsentAt: entity.historyConsentAt ?? null,
  notes: entity.notes ?? null,
  isActive: entity.isActive,
  createdAt: entity.createdAt,
  updatedAt: entity.updatedAt,
  trainer: entity.trainer
    ? {
        id: entity.trainer._id ?? entity.trainer.id,
        name: entity.trainer.name,
        email: entity.trainer.email,
        phone: entity.trainer.phone ?? null,
        bio: entity.trainer.bio ?? null,
        professionalTitle: entity.trainer.professionalTitle ?? null,
        specialties: entity.trainer.specialties ?? [],
        certifications: entity.trainer.certifications ?? [],
        yearsOfExperience: entity.trainer.yearsOfExperience ?? 0,
        coachingPhilosophy: entity.trainer.coachingPhilosophy ?? null,
        languagesSpoken: entity.trainer.languagesSpoken ?? [],
      }
    : null,
  member: entity.member
    ? {
        id: entity.member._id ?? entity.member.id,
        name: entity.member.name,
        email: entity.member.email,
        phone: entity.member.phone ?? null,
      }
    : null,
});

export default mapCoachingRelationship;
