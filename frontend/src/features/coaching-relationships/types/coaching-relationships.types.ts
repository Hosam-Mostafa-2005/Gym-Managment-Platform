export type RelationshipStatus =
  | "PENDING"
  | "ACTIVE"
  | "DECLINED"
  | "REVOKED";

export type HistorySharingConsent =
  | "PENDING"
  | "GRANTED"
  | "DECLINED"
  | "REVOKED";

export interface CoachingRelationship {
  id: string;
  trainerId: string;
  memberId: string;
  status: RelationshipStatus;
  historySharingConsent: HistorySharingConsent;
  invitedAt: string;
  respondedAt?: string | null;
  startedAt?: string | null;
  terminatedAt?: string | null;
  historyConsentAt?: string | null;
  notes?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  trainer?: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    bio?: string | null;
    specialties?: string[];
    yearsOfExperience?: number;
  } | null;
  member?: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
  } | null;
}

export interface InviteMemberPayload {
  email: string;
  notes?: string;
}

export interface RespondInvitationPayload {
  action: "ACCEPT" | "DECLINE";
}

export interface UpdateHistoryConsentPayload {
  consent: "GRANTED" | "DECLINED" | "REVOKED";
}
