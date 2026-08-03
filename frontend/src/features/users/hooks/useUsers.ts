import { useQuery } from "@tanstack/react-query";
import { getUsers, type User } from "../api/users.api";

export const useUsers = (role?: string) => {
  return useQuery<User[]>({
    queryKey: ["users", role],
    queryFn: async () => {
      const users = await getUsers(role);

      // 💡 لو طلبنا role معين والباك اند رجع كل الناس، هنفلترهم هنا أوتوماتيك
      if (role && Array.isArray(users)) {
        return users.filter((u) => u.role === role && u.isActive !== false);
      }

      return users;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
