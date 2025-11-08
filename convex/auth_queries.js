import { v } from "convex/values";
import { query, mutation, internalQuery, internalMutation } from "./_generated/server";

// Get current user's admin role info
export const getCurrentUserRole = query({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, { sessionId }) => {
    const session = await ctx.db.get(sessionId);
    if (!session) return null;
    
    const user = await ctx.db.get(session.userId);
    if (!user) return null;
    
    const roles = await ctx.db
      .query("user_roles")
      .withIndex("by_user_id", (q) => q.eq("user_id", session.userId))
      .collect();
    
    const isSuperAdmin = roles.some(r => r.role === "super_admin");
    
    if (isSuperAdmin) {
      return {
        email: user.email,
        role: "super_admin",
        departments: null,
        displayName: "Super Admin"
      };
    }
    
    const departments = roles
      .filter(r => r.role === "department_admin")
      .map(r => r.department)
      .filter(Boolean);
    
    return {
      email: user.email,
      role: "department_admin",
      departments,
      displayName: departments.length > 0 ? `${departments.join(", ")} Admin` : "Department Admin"
    };
  },
});

// Internal queries and mutations for auth actions
export const getUserByEmail = internalQuery({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();
  },
});

export const createUser = internalMutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, { email, password }) => {
    return await ctx.db.insert("users", {
      email,
      password,
      created_at: Date.now(),
    });
  },
});

export const deleteUser = internalMutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    await ctx.db.delete(userId);
  },
});

export const createSession = internalMutation({
  args: {
    userId: v.id("users"),
    email: v.string(),
  },
  handler: async (ctx, { userId, email }) => {
    return await ctx.db.insert("sessions", {
      userId,
      email,
      createdAt: Date.now(),
      expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    });
  },
});

export const getResetToken = internalQuery({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    return await ctx.db
      .query("password_reset_tokens")
      .withIndex("by_token", (q) => q.eq("token", token))
      .first();
  },
});

export const updatePassword = internalMutation({
  args: {
    userId: v.id("users"),
    tokenId: v.id("password_reset_tokens"),
    hashedPassword: v.string(),
  },
  handler: async (ctx, { userId, tokenId, hashedPassword }) => {
    await ctx.db.patch(userId, {
      password: hashedPassword,
    });
    await ctx.db.patch(tokenId, {
      used: true,
    });
  },
});
