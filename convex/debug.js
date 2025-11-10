import { v } from "convex/values";
import { query } from "./_generated/server";

// Development-only helper to inspect whether a user exists by email.
// WARNING: This should NOT be deployed to production in a real app.
export const getUserByEmailDebug = query({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    // Only allow in non-production to avoid leaking user presence in prod
    if (process.env.NODE_ENV === "production") {
      throw new Error("Debug endpoint not available in production");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (!user) return { exists: false };

    return {
      exists: true,
      _id: user._id,
      email: user.email,
      createdAt: user.createdAt || null,
    };
  },
});
