import { useAuth } from "@/contexts/auth-context";

export function useRole() {
  const { profile } = useAuth();

  const isAdmin = profile?.role === "admin" || profile?.role === "administrator";
  const isApproved = profile?.approved === true;
  const isUser = profile?.role === "user";

  return {
    role: profile?.role ?? "user",
    isAdmin,
    isUser,
    isApproved,
    profile,
  };
}

export function useIsAdmin() {
  const { isAdmin } = useRole();
  return isAdmin;
}

export function useIsApproved() {
  const { isApproved } = useRole();
  return isApproved;
}
