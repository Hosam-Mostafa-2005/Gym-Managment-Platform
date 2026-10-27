// src/constants/api.ts

/**
 * STREN API Configuration & Base URL Normalizer
 *
 * Single source of truth for the backend API base URL.
 * Automatically normalizes environment variables to prevent:
 * 1. Missing '/api/v1' route prefix when host-only URLs are provided in Vercel
 *    (e.g., 'https://gym-managment-platform.onrender.com' -> 'https://gym-managment-platform.onrender.com/api/v1')
 * 2. Accidental duplicate '/api' or '/api/v1' path segments
 * 3. Falling back to relative window origin on production when env vars are missing
 */

const FALLBACK_PROD_URL = "https://gym-managment-platform.onrender.com/api/v1";
const FALLBACK_DEV_URL = "http://localhost:5000/api/v1";

export const normalizeApiBaseUrl = (rawUrl?: string): string => {
  const trimmed = (rawUrl || "").trim().replace(/\/+$/, "");

  // If no env variable is provided, use safe environment fallback
  if (!trimmed) {
    return import.meta.env.PROD ? FALLBACK_PROD_URL : FALLBACK_DEV_URL;
  }

  // If URL already ends with /api/v1, use as-is
  if (trimmed.endsWith("/api/v1")) {
    return trimmed;
  }

  // If URL ends with /api (missing /v1), append /v1
  if (trimmed.endsWith("/api")) {
    return `${trimmed}/v1`;
  }

  // Otherwise, append the required /api/v1 prefix
  return `${trimmed}/api/v1`;
};

export const API_BASE_URL = normalizeApiBaseUrl(import.meta.env.VITE_API_BASE_URL);

/**
 * Root origin of the backend server (without API path segment).
 * Useful for Socket.IO connections or server health checks.
 */
export const BACKEND_ROOT_URL = API_BASE_URL.replace(/\/api\/v1\/?$/, "");
