import axios from "axios";

import { API_BASE_URL } from "@/constants/api";
import { tokenService } from "@/services/token.service";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = tokenService.getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url || "";

    // Auth endpoints (login, register, forgot/reset password, onboarding, me) manage
    // their own 401/403 responses via React Query onError callbacks without hard reloads.
    const isAuthEndpoint = requestUrl.includes("/auth/");
    const isAuthPage =
      typeof window !== "undefined" &&
      (window.location.pathname === "/login" ||
        window.location.pathname === "/register" ||
        window.location.pathname.startsWith("/verify-") ||
        window.location.pathname.startsWith("/reset-") ||
        window.location.pathname.startsWith("/forgot-"));

    // For expired sessions on protected resources when not already on an auth page,
    // clear token and safely redirect to login with return path preserved.
    if (status === 401 && !isAuthEndpoint && !isAuthPage) {
      tokenService.removeToken();

      if (typeof window !== "undefined") {
        const currentPath = window.location.pathname + window.location.search;
        const returnParam =
          currentPath && currentPath !== "/"
            ? `?returnTo=${encodeURIComponent(currentPath)}`
            : "";
        window.location.replace(`/login${returnParam}`);
      }
    }

    return Promise.reject(error);
  },
);
