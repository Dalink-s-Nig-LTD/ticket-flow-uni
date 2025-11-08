import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { SUPER_ADMIN_EMAILS, DEPARTMENT_ADMINS } from "./departments";

// Get all admins with their roles and departments (super admin only)
export const getAllAdmins = query({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, { sessionId }) => {
    const session = await ctx.db.get(sessionId);
    if (!session) throw new Error("Invalid session");

    // Check if super admin
    const roles = await ctx.db
      .query("user_roles")
      .withIndex("by_user_id", (q) => q.eq("user_id", session.userId))
      .collect();

    const isSuperAdmin = roles.some((r) => r.role === "super_admin");
    if (!isSuperAdmin) {
      throw new Error("Only super admins can access this");
    }

    // Get all users with roles
    const allUsers = await ctx.db.query("users").collect();
    const adminsList = [];

    for (const user of allUsers) {
      const userRoles = await ctx.db
        .query("user_roles")
        .withIndex("by_user_id", (q) => q.eq("user_id", user._id))
        .collect();

      if (userRoles.length > 0) {
        const isSuperAdmin = userRoles.some((r) => r.role === "super_admin");

        if (isSuperAdmin) {
          adminsList.push({
            userId: user._id,
            email: user.email,
            role: "super_admin",
            departments: null,
          });
        } else {
          const departments = userRoles
            .filter((r) => r.role === "department_admin")
            .map((r) => r.department)
            .filter(Boolean);

          adminsList.push({
            userId: user._id,
            email: user.email,
            role: "department_admin",
            departments,
          });
        }
      }
    }

    return adminsList;
  },
});

// Remove a department assignment from an admin (super admin only)
export const removeAdminDepartment = mutation({
  args: {
    sessionId: v.id("sessions"),
    userId: v.id("users"),
    department: v.string(),
  },
  handler: async (ctx, { sessionId, userId, department }) => {
    const session = await ctx.db.get(sessionId);
    if (!session) throw new Error("Invalid session");

    // Check if super admin
    const roles = await ctx.db
      .query("user_roles")
      .withIndex("by_user_id", (q) => q.eq("user_id", session.userId))
      .collect();

    const isSuperAdmin = roles.some((r) => r.role === "super_admin");
    if (!isSuperAdmin) {
      throw new Error("Only super admins can modify assignments");
    }

    // Find and delete the role assignment
    const roleToDelete = await ctx.db
      .query("user_roles")
      .withIndex("by_user_id", (q) => q.eq("user_id", userId))
      .filter((q) =>
        q.and(
          q.eq(q.field("role"), "department_admin"),
          q.eq(q.field("department"), department)
        )
      )
      .first();

    if (roleToDelete) {
      await ctx.db.delete(roleToDelete._id);
    }

    return { success: true };
  },
});

// Add a department assignment to an admin (super admin only)
export const addAdminDepartment = mutation({
  args: {
    sessionId: v.id("sessions"),
    email: v.string(),
    department: v.string(),
  },
  handler: async (ctx, { sessionId, email, department }) => {
    const session = await ctx.db.get(sessionId);
    if (!session) throw new Error("Invalid session");

    // Check if super admin
    const roles = await ctx.db
      .query("user_roles")
      .withIndex("by_user_id", (q) => q.eq("user_id", session.userId))
      .collect();

    const isSuperAdmin = roles.some((r) => r.role === "super_admin");
    if (!isSuperAdmin) {
      throw new Error("Only super admins can modify assignments");
    }

    // Find user by email
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (!user) {
      throw new Error(
        "User not found. The admin must sign up first before assignment."
      );
    }

    // Check if user is super admin (can't modify super admin)
    const userRoles = await ctx.db
      .query("user_roles")
      .withIndex("by_user_id", (q) => q.eq("user_id", user._id))
      .collect();

    if (userRoles.some((r) => r.role === "super_admin")) {
      throw new Error("Cannot modify super admin assignments");
    }

    // Check if assignment already exists
    const existingAssignment = userRoles.find(
      (r) => r.role === "department_admin" && r.department === department
    );

    if (existingAssignment) {
      throw new Error("This user is already assigned to this department");
    }

    // Add new assignment
    await ctx.db.insert("user_roles", {
      user_id: user._id,
      role: "department_admin",
      department,
      assigned_at: Date.now(),
    });

    return { success: true };
  },
});
