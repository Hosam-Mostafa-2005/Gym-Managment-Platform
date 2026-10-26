// src/controllers/coach-member-relationship.controller.ts
import type { RequestHandler } from "express";
import catchAsync from "../utils/catchAsync.js";
import coachMemberRelationshipService from "../services/coach-member-relationship.service.js";

export const inviteMember: RequestHandler = catchAsync(async (req, res) => {
  const relationship = await coachMemberRelationshipService.inviteMember(
    req.user!.id,
    req.body,
  );

  res.status(201).json({
    status: "success",
    data: {
      relationship,
    },
  });
});

export const getCoachInvitations: RequestHandler = catchAsync(
  async (req, res) => {
    const invitations =
      await coachMemberRelationshipService.getCoachInvitations(req.user!.id);

    res.status(200).json({
      status: "success",
      results: invitations.length,
      data: {
        invitations,
      },
    });
  },
);

export const cancelInvitation: RequestHandler = catchAsync(async (req, res) => {
  const relationship = await coachMemberRelationshipService.cancelInvitation(
    req.params.id as string,
    req.user!.id,
  );

  res.status(200).json({
    status: "success",
    data: {
      relationship,
    },
  });
});

export const getMemberInvitations: RequestHandler = catchAsync(
  async (req, res) => {
    const invitations =
      await coachMemberRelationshipService.getMemberInvitations(req.user!.id);

    res.status(200).json({
      status: "success",
      results: invitations.length,
      data: {
        invitations,
      },
    });
  },
);

export const getMemberActiveRelationship: RequestHandler = catchAsync(
  async (req, res) => {
    const relationship =
      await coachMemberRelationshipService.getMemberActiveRelationship(
        req.user!.id,
      );

    res.status(200).json({
      status: "success",
      data: {
        relationship,
      },
    });
  },
);

export const respondInvitation: RequestHandler = catchAsync(
  async (req, res) => {
    const relationship =
      await coachMemberRelationshipService.respondInvitation(
        req.params.id as string,
        req.user!.id,
        req.body,
      );

    res.status(200).json({
      status: "success",
      data: {
        relationship,
      },
    });
  },
);

export const updateHistoryConsent: RequestHandler = catchAsync(
  async (req, res) => {
    const relationship =
      await coachMemberRelationshipService.updateHistoryConsent(
        req.params.id as string,
        req.user!.id,
        req.body,
      );

    res.status(200).json({
      status: "success",
      data: {
        relationship,
      },
    });
  },
);

export const terminateRelationship: RequestHandler = catchAsync(
  async (req, res) => {
    const relationship =
      await coachMemberRelationshipService.terminateRelationship(
        req.params.id as string,
        req.user!.id,
        req.user!.role,
      );

    res.status(200).json({
      status: "success",
      data: {
        relationship,
      },
    });
  },
);
