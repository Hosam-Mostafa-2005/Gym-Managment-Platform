import { AxiosError } from "axios";

export function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data;
    if (data) {
      // 1. Backend standard message
      if (typeof data.message === "string" && data.message.trim()) {
        return data.message;
      }

      // 2. Backend Zod error array: { status: "fail", errors: [{ field: "...", message: "..." }] }
      if (Array.isArray(data.errors) && data.errors.length > 0) {
        const errorMessages = data.errors
          .map((item: any) => {
            if (typeof item === "string") return item;
            if (item && typeof item.message === "string") return item.message;
            if (item && typeof item.field === "string") return `${item.field} is invalid`;
            return null;
          })
          .filter(Boolean);

        if (errorMessages.length > 0) {
          return errorMessages.join(". ");
        }
      }

      // 3. Fallback error field
      if (typeof data.error === "string" && data.error.trim()) {
        return data.error;
      }
    }

    if (error.message) {
      return error.message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong. Please check your inputs and try again.";
}
