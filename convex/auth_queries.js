import { v } from "convex/values";
import { query } from "./_generated/server";

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
