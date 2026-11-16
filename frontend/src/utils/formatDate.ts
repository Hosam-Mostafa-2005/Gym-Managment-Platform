// src/utils/formatDate.ts

export function formatDate(dateString: string | Date | undefined | null): string {
  if (!dateString) return "";
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatTime(dateString: string | Date | undefined | null): string {
  if (!dateString) return "";
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatDateTime(dateString: string | Date | undefined | null): string {
  if (!dateString) return "";
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return "";
  return `${formatDate(d)} at ${formatTime(d)}`;
}

/**
 * Returns YYYY-MM-DD representing the local calendar day, avoiding UTC timezone shifts.
 */
export function formatLocalDateKey(dateStringOrDate: number | string | Date | undefined | null): string {
  if (dateStringOrDate === undefined || dateStringOrDate === null || dateStringOrDate === "") return "";
  const d = typeof dateStringOrDate === "object" && dateStringOrDate instanceof Date
    ? dateStringOrDate
    : new Date(dateStringOrDate);
  if (isNaN(d.getTime())) return "";
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
