import type {
  RelationshipStatus,
  HistorySharingConsent,
} from "../constants/coaching-relationship.js";

export interface InviteMemberDto {
  email: string;
  notes?: string;
}

export interface RespondInvitationDto {
  action: "ACCEPT" | "DECLINE";
}

export interface UpdateHistoryConsentDto {
  consent: "GRANTED" | "DECLINED" | "REVOKED";
}

export interface CoachingRelationshipEntity {
  id: string;
  trainerId: string;
  memberId: string;
  status: RelationshipStatus;
  historySharingConsent: HistorySharingConsent;
  invitedAt: Date;
  respondedAt?: Date | null;
  startedAt?: Date | null;
  terminatedAt?: Date | null;
  historyConsentAt?: Date | null;
  notes?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  trainer?: {
    id: string;
    name: string;
    email: string;
    specialties?: string[];
  };
  member?: {
    id: string;
    name: string;
    email: string;
  };
}
