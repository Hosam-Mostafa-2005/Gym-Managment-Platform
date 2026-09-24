// src/features/notifications/hooks/use-notifications.ts
import { useQuery } from "@tanstack/react-query";
import { getNotifications } from "../api/notifications.api";

export const useNotifications = () => {
  return useQuery({
    // IMPORTANT: Reusing the exact query key ensures that the existing Navbar
    // and Socket.IO listeners automatically update this page's cache too.
    queryKey: ["notifications"],
    queryFn: getNotifications,
  });
};
