import { api } from "@/lib/axios";
import type {
  CoachingRelationship,
  InviteMemberPayload,
  RespondInvitationPayload,
  UpdateHistoryConsentPayload,
} from "../types/coaching-relationships.types";

export const inviteMember = async (
  payload: InviteMemberPayload,
): Promise<CoachingRelationship> => {
  const { data } = await api.post("/coaching-relationships/invite", payload);
  return data.data.relationship;
};

export const getCoachInvitations = async (): Promise<CoachingRelationship[]> => {
  const { data } = await api.get("/coaching-relationships/coach/invitations");
  return data.data.invitations;
};

export const cancelInvitation = async (
  id: string,
): Promise<CoachingRelationship> => {
  const { data } = await api.delete(`/coaching-relationships/invitations/${id}`);
  return data.data.relationship;
};

export const getMemberInvitations = async (): Promise<CoachingRelationship[]> => {
  const { data } = await api.get("/coaching-relationships/member/invitations");
  return data.data.invitations;
};

export const getMemberActiveRelationship =
  async (): Promise<CoachingRelationship | null> => {
    const { data } = await api.get("/coaching-relationships/member/active");
    return data.data.relationship;
  };

export const respondInvitation = async (
  id: string,
  payload: RespondInvitationPayload,
): Promise<CoachingRelationship> => {
  const { data } = await api.patch(
    `/coaching-relationships/${id}/respond`,
    payload,
  );
  return data.data.relationship;
};

export const updateHistoryConsent = async (
  id: string,
  payload: UpdateHistoryConsentPayload,
): Promise<CoachingRelationship> => {
  const { data } = await api.patch(
    `/coaching-relationships/${id}/history-consent`,
    payload,
  );
  return data.data.relationship;
};

export const terminateRelationship = async (
  id: string,
): Promise<CoachingRelationship> => {
  const { data } = await api.delete(`/coaching-relationships/${id}`);
  return data.data.relationship;
};

export const terminateActiveMemberRelationship =
  async (): Promise<CoachingRelationship> => {
    const { data } = await api.delete("/coaching-relationships/member/active");
    return data.data.relationship;
  };
