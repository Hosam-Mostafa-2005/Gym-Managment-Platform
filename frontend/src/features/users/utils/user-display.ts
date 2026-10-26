// src/features/users/utils/user-display.ts

export interface MemberDisplayInfo {
  id: string;
  displayName: string;
  displayEmail: string;
  fullLabel: string;
  isTestAccount: boolean;
  avatarInitials: string;
}

/**
 * Normalizes and formats member names and emails for consistent display across all coach selectors,
 * avoiding synthetic technical labels and providing neutral, honest fallbacks.
 * Unpacks nested member structures (e.g. from coaching roster { member: User, assignment: ... }).
 */
export function formatMemberDisplay(
  user?: any,
): MemberDisplayInfo {
  // Unpack nested member object if passed as { member: { id, name, email }, ... }
  const actualUser =
    user && typeof user === "object" && "member" in user && user.member
      ? user.member
      : user;

  const id = actualUser?.id || actualUser?._id || "";

  if (!actualUser) {
    return {
      id,
      displayName: "Member",
      displayEmail: "",
      fullLabel: "Member",
      isTestAccount: false,
      avatarInitials: "MB",
    };
  }

  const rawName =
    typeof actualUser.name === "string" ? actualUser.name.trim() : "";
  const rawEmail =
    typeof actualUser.email === "string" ? actualUser.email.trim() : "";

  // Detect synthetic accounts created by automated test runners
  const isTestAccount = Boolean(
    rawEmail &&
      (rawEmail.includes(".google.") ||
        rawEmail.startsWith("google.user.") ||
        (rawEmail.includes("@stren.app") &&
          (rawEmail.includes("test") ||
            rawEmail.includes(".1792") ||
            rawEmail.includes(".user."))))
  );

  let displayName =
    rawName && rawName.length > 0
      ? rawName
      : rawEmail && rawEmail.length > 0
        ? rawEmail.split("@")[0]
        : "Member";

  const displayEmail = rawEmail && rawEmail.length > 0 ? rawEmail : "";

  // Differentiate automated test/demo artifacts cleanly
  if (
    isTestAccount &&
    (displayName === "Google Member" || displayName === "Standard Athlete")
  ) {
    displayName = `${displayName} [Test Account]`;
  }

  const fullLabel = displayEmail
    ? `${displayName} (${displayEmail})`
    : displayName;

  const initials =
    displayName
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "MB";

  return {
    id,
    displayName,
    displayEmail,
    fullLabel,
    isTestAccount,
    avatarInitials: initials,
  };
}
