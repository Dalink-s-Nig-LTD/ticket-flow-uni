import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { SUPER_ADMIN_EMAILS, getDepartmentsForEmail } from "./departments";

// Verify if session belongs to a super admin
export async function verifySuperAdmin(ctx, sessionId) {
  const session = await ctx.db.get(sessionId);
  if (!session) {
    throw new Error("Invalid session");
  }
  
  const roles = await ctx.db
    .query("user_roles")
    .withIndex("by_user_id", (q) => q.eq("user_id", session.userId))
    .collect();
  
  const isSuperAdmin = roles.some(r => r.role === "super_admin");
  if (!isSuperAdmin) {
    throw new Error("Only super admins can perform this action");
  }
  
  return session;
}

// Manually assign role without email-based authorization logic
export const assignRoleManually = internalMutation({
  args: {
    userId: v.id("users"),
    role: v.string(),
    departments: v.optional(v.array(v.string())),
  },
  handler: async (ctx, { userId, role, departments }) => {
    if (role === "super_admin") {
      await ctx.db.insert("user_roles", {
        user_id: userId,
        role: "super_admin",
        assigned_at: Date.now(),
      });
    } else if (role === "department_admin") {
      if (!departments || departments.length === 0) {
        throw new Error("Department admins must have at least one department");
      }
      for (const dept of departments) {
        await ctx.db.insert("user_roles", {
          user_id: userId,
          role: "department_admin",
          department: dept,
          assigned_at: Date.now(),
        });
      }
    }
    // If role is "regular" or undefined, don't insert any role (regular user)
  },
});

// Assign role to user (called during signup)
export const assignRole = internalMutation({
  args: {
    userId: v.id("users"),
    email: v.string(),
  },
  handler: async (ctx, { userId, email }) => {
    const departments = getDepartmentsForEmail(email);
    
    if (departments === null) {
      // Super admin
      await ctx.db.insert("user_roles", {
        user_id: userId,
        role: "super_admin",
        assigned_at: Date.now(),
      });
    } else if (departments.length > 0) {
      // Department admin - create one role entry per department
      for (const dept of departments) {
        await ctx.db.insert("user_roles", {
          user_id: userId,
          role: "department_admin",
          department: dept,
          assigned_at: Date.now(),
        });
      }
    } else {
      throw new Error("This email is not authorized as an admin");
    }
  },
});

// Get user's role and departments
export const getUserRole = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const roles = await ctx.db
      .query("user_roles")
      .withIndex("by_user_id", (q) => q.eq("user_id", userId))
      .collect();
    
    if (roles.length === 0) {
      return { role: "none", departments: [] };
    }
    
    const isSuperAdmin = roles.some(r => r.role === "super_admin");
    
    if (isSuperAdmin) {
      return { role: "super_admin", departments: null };
    }
    
    const departments = roles
      .filter(r => r.role === "department_admin")
      .map(r => r.department)
      .filter(Boolean);
    
    return { role: "department_admin", departments };
  },
});

// Check if session has access to a specific department
export async function canAccessDepartment(ctx, sessionId, department) {
  const session = await ctx.db.get(sessionId);
  if (!session) return false;
  
  const roles = await ctx.db
    .query("user_roles")
    .withIndex("by_user_id", (q) => q.eq("user_id", session.userId))
    .collect();
  
  // Super admin can access everything
  if (roles.some(r => r.role === "super_admin")) {
    return true;
  }
  
  // Check if department admin has access to this specific department
  return roles.some(
    r => r.role === "department_admin" && r.department === department
  );
}

// Get user's departments from session
export async function getUserDepartments(ctx, sessionId) {
  const session = await ctx.db.get(sessionId);
  if (!session) return { isSuperAdmin: false, departments: [] };
  
  const roles = await ctx.db
    .query("user_roles")
    .withIndex("by_user_id", (q) => q.eq("user_id", session.userId))
    .collect();
  
  const isSuperAdmin = roles.some(r => r.role === "super_admin");
  
  if (isSuperAdmin) {
    return { isSuperAdmin: true, departments: null };
  }
  
  const departments = roles
    .filter(r => r.role === "department_admin")
    .map(r => r.department)
    .filter(Boolean);
  
  return { isSuperAdmin: false, departments };
}
