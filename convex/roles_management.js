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

// Promote a user to super admin (super admin only)
export const promoteToSuperAdmin = mutation({
  args: {
    sessionId: v.id("sessions"),
    userId: v.id("users"),
  },
  handler: async (ctx, { sessionId, userId }) => {
    const session = await ctx.db.get(sessionId);
    if (!session) throw new Error("Invalid session");

    // Check if caller is super admin
    const callerRoles = await ctx.db
      .query("user_roles")
      .withIndex("by_user_id", (q) => q.eq("user_id", session.userId))
      .collect();

    const isSuperAdmin = callerRoles.some((r) => r.role === "super_admin");
    if (!isSuperAdmin) {
      throw new Error("Only super admins can promote users");
    }

    // Check if target user already has super admin role
    const targetRoles = await ctx.db
      .query("user_roles")
      .withIndex("by_user_id", (q) => q.eq("user_id", userId))
      .collect();

    if (targetRoles.some((r) => r.role === "super_admin")) {
      throw new Error("User is already a super admin");
    }

    // Add super admin role
    await ctx.db.insert("user_roles", {
      user_id: userId,
      role: "super_admin",
      assigned_at: Date.now(),
    });

    return { success: true };
  },
});

// Demote a super admin (super admin only)
export const demoteFromSuperAdmin = mutation({
  args: {
    sessionId: v.id("sessions"),
    userId: v.id("users"),
    convertToDepartmentAdmin: v.optional(v.boolean()),
    departments: v.optional(v.array(v.string())),
  },
  handler: async (ctx, { sessionId, userId, convertToDepartmentAdmin, departments }) => {
    const session = await ctx.db.get(sessionId);
    if (!session) throw new Error("Invalid session");

    // Check if caller is super admin
    const callerRoles = await ctx.db
      .query("user_roles")
      .withIndex("by_user_id", (q) => q.eq("user_id", session.userId))
      .collect();

    const isSuperAdmin = callerRoles.some((r) => r.role === "super_admin");
    if (!isSuperAdmin) {
      throw new Error("Only super admins can demote users");
    }

    // Prevent demoting yourself
    if (session.userId === userId) {
      throw new Error("You cannot demote yourself");
    }

    // Find and remove super admin role
    const targetRoles = await ctx.db
      .query("user_roles")
      .withIndex("by_user_id", (q) => q.eq("user_id", userId))
      .collect();

    const superAdminRole = targetRoles.find((r) => r.role === "super_admin");
    if (!superAdminRole) {
      throw new Error("User is not a super admin");
    }

    await ctx.db.delete(superAdminRole._id);

    // Optionally convert to department admin
    if (convertToDepartmentAdmin && departments && departments.length > 0) {
      for (const dept of departments) {
        await ctx.db.insert("user_roles", {
          user_id: userId,
          role: "department_admin",
          department: dept,
          assigned_at: Date.now(),
        });
      }
    }

    return { success: true };
  },
});
