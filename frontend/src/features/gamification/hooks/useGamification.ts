// src/features/gamification/hooks/useGamification.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getMyGamification,
  getMemberGamification,
  sendEncouragement,
} from "../api/gamification.api";
import type { SendEncouragementPayload } from "../types/gamification.types";

export const useMyGamification = () => {
  return useQuery({
    queryKey: ["gamification", "me"],
    queryFn: getMyGamification,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const useMemberGamification = (memberId?: string) => {
  return useQuery({
    queryKey: ["gamification", "member", memberId],
    queryFn: () => getMemberGamification(memberId!),
    enabled: Boolean(memberId),
    staleTime: 1000 * 60 * 2,
  });
};

export const useSendEncouragement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      memberId,
      payload,
    }: {
      memberId: string;
      payload: SendEncouragementPayload;
    }) => sendEncouragement(memberId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["gamification", "member", variables.memberId],
      });
      queryClient.invalidateQueries({
        queryKey: ["member-profile", variables.memberId],
      });
    },
  });
};
