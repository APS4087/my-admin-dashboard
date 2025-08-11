import { createClient } from "@supabase/supabase-js";

import { createClient as createServerClient } from "@/lib/supabase/server";

// Create admin client with service role key for bypassing RLS
function createAdminClient() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is required for admin operations");
  }

  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export async function getAllUsersAdmin() {
  const supabase = createAdminClient();

  const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function approveUserAdmin(userId: string) {
  const supabase = createAdminClient();

  const { error } = await supabase.from("profiles").update({ approved: true }).eq("id", userId);

  if (error) {
    throw new Error(error.message);
  }

  return { success: true };
}

export async function unapproveUserAdmin(userId: string) {
  const supabase = createAdminClient();

  const { error } = await supabase.from("profiles").update({ approved: false }).eq("id", userId);

  if (error) {
    throw new Error(error.message);
  }

  return { success: true };
}

export async function updateUserRoleAdmin(userEmail: string, role: "user" | "admin" | "administrator") {
  const supabase = createAdminClient();

  const { error } = await supabase.from("profiles").update({ role }).eq("email", userEmail);

  if (error) {
    throw new Error(error.message);
  }

  return { success: true };
}

export async function getPendingUsersAdmin() {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("approved", false)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

// Function to verify if current user is admin (for authorization checks)
export async function verifyAdminAccess() {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("Not authenticated");
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();

  if (!profile || !["admin", "administrator"].includes(profile.role)) {
    throw new Error("Insufficient permissions");
  }

  return profile;
}
