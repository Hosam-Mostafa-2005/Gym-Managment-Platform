import { z } from "zod";
import {
  HISTORY_SHARING_CONSENT,
} from "../constants/coaching-relationship.js";

export const inviteMemberSchema = z.object({
  body: z.object({
    email: z
      .string({ error: "Member email is required" })
      .trim()
      .email("Please provide a valid email address")
      .toLowerCase(),
    notes: z
      .string()
      .trim()
      .max(500, "Notes must not exceed 500 characters")
      .optional(),
  }),
});

export const respondInvitationSchema = z.object({
  body: z.object({
    action: z.enum(["ACCEPT", "DECLINE"], {
      error: "Action must be ACCEPT or DECLINE",
    }),
  }),
});

export const historySharingConsentSchema = z.object({
  body: z.object({
    consent: z.enum(
      [
        HISTORY_SHARING_CONSENT.GRANTED,
        HISTORY_SHARING_CONSENT.DECLINED,
        HISTORY_SHARING_CONSENT.REVOKED,
      ],
      {
        error: "Consent must be GRANTED, DECLINED, or REVOKED",
      },
    ),
  }),
});
