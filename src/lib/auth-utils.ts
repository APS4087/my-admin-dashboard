import { createClient } from "@/lib/supabase/server";
import { type Profile } from "@/types/auth";

export async function getAuthenticatedUser() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }

  // Try to get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();

  return {
    user,
    profile: profile as Profile | null,
  };
}

export async function requireApprovedUser() {
  const authData = await getAuthenticatedUser();

  if (!authData?.user) {
    return { redirectTo: "/auth/v1/login" };
  }

  if (!authData.profile) {
    return { redirectTo: "/auth/v1/login" };
  }

  // Check if user is approved (admins are auto-approved)
  const isAdmin = authData.profile.role === "admin" || authData.profile.role === "administrator";
  if (!isAdmin && !authData.profile.approved) {
    return { redirectTo: "/pending-approval" };
  }

  return { authData };
}
