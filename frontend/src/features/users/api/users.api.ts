import { api } from "@/lib/axios"; // 💡 تأكد إن المسار مطابق لملف الـ axios بتاعك

export interface User {
  _id: string;
  id?: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
}

export const getUsers = async (role?: string): Promise<User[]> => {
  const params = role ? { role } : {};
  const response = await api.get("/users", { params });

  // 💡 التعامل الذكي مع كل أشكال الـ Response الممكنة من الباك اند
  if (Array.isArray(response.data)) {
    return response.data;
  }
  if (Array.isArray(response.data?.data)) {
    return response.data.data;
  }
  if (Array.isArray(response.data?.users)) {
    return response.data.users;
  }
  if (Array.isArray(response.data?.data?.users)) {
    return response.data.data.users;
  }

  return [];
};
