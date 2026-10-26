export const RELATIONSHIP_STATUS = {
  PENDING: "PENDING",
  ACTIVE: "ACTIVE",
  DECLINED: "DECLINED",
  REVOKED: "REVOKED",
} as const;

export type RelationshipStatus =
  (typeof RELATIONSHIP_STATUS)[keyof typeof RELATIONSHIP_STATUS];

export const HISTORY_SHARING_CONSENT = {
  PENDING: "PENDING",
  GRANTED: "GRANTED",
  DECLINED: "DECLINED",
  REVOKED: "REVOKED",
} as const;

export type HistorySharingConsent =
  (typeof HISTORY_SHARING_CONSENT)[keyof typeof HISTORY_SHARING_CONSENT];
