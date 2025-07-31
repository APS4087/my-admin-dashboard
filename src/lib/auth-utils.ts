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
