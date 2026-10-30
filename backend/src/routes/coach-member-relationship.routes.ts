// src/routes/coach-member-relationship.routes.ts
import { Router } from "express";
import * as relationshipController from "../controllers/coach-member-relationship.controller.js";
import { protect, restrictTo } from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.middleware.js";
import {
  inviteMemberSchema,
  respondInvitationSchema,
  historySharingConsentSchema,
} from "../validators/coaching-relationship.validator.js";
import { Roles } from "../constants/roles.js";

const router = Router();

// Protect all routes
router.use(protect);

// ─── Coach Endpoints ──────────────────────────────────────────────
router.post(
  "/invite",
  restrictTo(Roles.TRAINER, Roles.ADMIN),
  validate(inviteMemberSchema),
  relationshipController.inviteMember,
);

router.get(
  "/coach/invitations",
  restrictTo(Roles.TRAINER, Roles.ADMIN),
  relationshipController.getCoachInvitations,
);

router.delete(
  "/invitations/:id",
  restrictTo(Roles.TRAINER, Roles.ADMIN),
  relationshipController.cancelInvitation,
);

// ─── Member Endpoints ─────────────────────────────────────────────
router.get(
  "/member/invitations",
  restrictTo(Roles.MEMBER),
  relationshipController.getMemberInvitations,
);

router.get(
  "/member/active",
  restrictTo(Roles.MEMBER),
  relationshipController.getMemberActiveRelationship,
);

router.patch(
  "/:id/respond",
  restrictTo(Roles.MEMBER),
  validate(respondInvitationSchema),
  relationshipController.respondInvitation,
);

router.patch(
  "/:id/history-consent",
  restrictTo(Roles.MEMBER),
  validate(historySharingConsentSchema),
  relationshipController.updateHistoryConsent,
);

router.delete(
  "/member/active",
  restrictTo(Roles.MEMBER),
  relationshipController.terminateActiveMemberRelationship,
);

// ─── Termination (Coach or Member) ────────────────────────────────
router.delete("/:id", relationshipController.terminateRelationship);

export default router;
