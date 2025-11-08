import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
// Create a session for authenticated users
export const createSession = mutation({
    args: {
        userId: v.id("users"),
        email: v.string(),
    },
    handler: async (ctx, { userId, email }) => {
        const sessionId = await ctx.db.insert("sessions", {
            userId,
            email,
            createdAt: Date.now(),
            expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
        });
        return { sessionId, userId, email };
    },
});
// Verify a session is valid
export const verifySession = query({
    args: { sessionId: v.id("sessions") },
    handler: async (ctx, { sessionId }) => {
        const session = await ctx.db.get(sessionId);
        if (!session) {
            return { valid: false, error: "Session not found" };
        }
        if (session.expiresAt < Date.now()) {
            return { valid: false, error: "Session expired" };
        }
        const user = await ctx.db.get(session.userId);
        if (!user) {
            return { valid: false, error: "User not found" };
        }
        return {
            valid: true,
            userId: session.userId,
            email: session.email
        };
    },
});
// Delete a session (logout)
export const deleteSession = mutation({
    args: { sessionId: v.id("sessions") },
    handler: async (ctx, { sessionId }) => {
        await ctx.db.delete(sessionId);
        return { success: true };
    },
});
// Get current session by ID
export const getCurrentSession = query({
    args: { sessionId: v.optional(v.id("sessions")) },
    handler: async (ctx, { sessionId }) => {
        if (!sessionId)
            return null;
        const session = await ctx.db.get(sessionId);
        if (!session)
            return null;
        if (session.expiresAt < Date.now()) {
            return null;
        }
        return session;
    },
});
