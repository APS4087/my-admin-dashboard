import { createClient } from "@/lib/supabase/client";

export async function promoteUserToAdmin(userEmail: string, role: "admin" | "administrator" = "admin") {
  const supabase = createClient();

  const { error } = await supabase.rpc("promote_user_to_admin", {
    user_email: userEmail,
    new_role: role,
  });

  if (error) {
    throw new Error(error.message);
  }

  return { success: true };
}

export async function updateUserRole(userEmail: string, role: "user" | "admin" | "administrator") {
  const supabase = createClient();

  const { error } = await supabase.from("profiles").update({ role }).eq("email", userEmail);

  if (error) {
    throw new Error(error.message);
  }

  return { success: true };
}

export async function getAllUsers() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
