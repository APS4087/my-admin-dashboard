"use server";

import {
  getAllUsersAdmin,
  approveUserAdmin,
  unapproveUserAdmin,
  updateUserRoleAdmin,
  getPendingUsersAdmin,
  verifyAdminAccess,
} from "@/lib/admin-service";

export async function getAllUsersAction() {
  try {
    // Verify admin access first
    await verifyAdminAccess();

    return await getAllUsersAdmin();
  } catch (error) {
    console.error("Error in getAllUsersAction:", error);
    throw error;
  }
}

export async function approveUserAction(userId: string) {
  try {
    // Verify admin access first
    await verifyAdminAccess();

    return await approveUserAdmin(userId);
  } catch (error) {
    console.error("Error in approveUserAction:", error);
    throw error;
  }
}

export async function unapproveUserAction(userId: string) {
  try {
    // Verify admin access first
    await verifyAdminAccess();

    return await unapproveUserAdmin(userId);
  } catch (error) {
    console.error("Error in unapproveUserAction:", error);
    throw error;
  }
}

export async function updateUserRoleAction(userEmail: string, role: "user" | "admin" | "administrator") {
  try {
    // Verify admin access first
    await verifyAdminAccess();

    return await updateUserRoleAdmin(userEmail, role);
  } catch (error) {
    console.error("Error in updateUserRoleAction:", error);
    throw error;
  }
}

export async function getPendingUsersAction() {
  try {
    // Verify admin access first
    await verifyAdminAccess();

    return await getPendingUsersAdmin();
  } catch (error) {
    console.error("Error in getPendingUsersAction:", error);
    throw error;
  }
}
