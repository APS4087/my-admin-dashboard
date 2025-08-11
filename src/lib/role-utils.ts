import type { Profile } from "@/types/auth";

export function isAdmin(profile: Profile | null): boolean {
  return profile?.role === "admin" || profile?.role === "administrator";
}

export function isApproved(profile: Profile | null): boolean {
  return profile?.approved === true || isAdmin(profile);
}

export function canAccessDashboard(profile: Profile | null): boolean {
  return isApproved(profile);
}

export function canManageUsers(profile: Profile | null): boolean {
  return isAdmin(profile);
}

export function getRoleDisplayName(role: string): string {
  switch (role) {
    case "admin":
      return "Administrator";
    case "administrator":
      return "Administrator";
    case "user":
      return "User";
    default:
      return "Unknown";
  }
}
