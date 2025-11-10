import { v } from "convex/values";
import { query } from "./_generated/server";
import { verifySuperAdmin } from "./roles";

// Get comprehensive admin activity statistics (super admin only)
export const getAdminActivityStats = query({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, { sessionId }) => {
    // Verify super admin access
    await verifySuperAdmin(ctx, sessionId);

    // Get all user roles
    const allRoles = await ctx.db.query("user_roles").collect();

    // Count super admins
    const superAdminCount = allRoles.filter((r) => r.role === "super_admin").length;

    // Count unique department admins
    const departmentAdminUserIds = new Set(
      allRoles.filter((r) => r.role === "department_admin").map((r) => r.user_id)
    );
    const departmentAdminCount = departmentAdminUserIds.size;

    // Get department distribution
    const departmentDistribution = {};
    allRoles
      .filter((r) => r.role === "department_admin" && r.department)
      .forEach((role) => {
        const dept = role.department;
        departmentDistribution[dept] = (departmentDistribution[dept] || 0) + 1;
      });

    // Get recent role changes (last 30 days)
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const recentRoleChanges = allRoles
      .filter((r) => r.assigned_at && r.assigned_at > thirtyDaysAgo)
      .sort((a, b) => b.assigned_at - a.assigned_at)
      .slice(0, 20); // Get last 20 changes

    // Fetch user details for recent changes
    const recentChangesWithUsers = await Promise.all(
      recentRoleChanges.map(async (role) => {
        const user = await ctx.db.get(role.user_id);
        return {
          email: user?.email || "Unknown",
          role: role.role,
          department: role.department,
          assigned_at: role.assigned_at,
        };
      })
    );

    // Get all tickets for metrics
    const allTickets = await ctx.db.query("tickets").collect();

    // Calculate ticket handling metrics per department
    const departmentMetrics = {};
    const departments = [
      "ICT/Portal",
      "Payment/Bursary",
      "Exams/Results",
      "Hostel/Accommodation",
      "Library",
      "Registrar",
      "Others",
    ];

    departments.forEach((dept) => {
      const deptTickets = allTickets.filter((t) => t.nature_of_complaint === dept);
      
      departmentMetrics[dept] = {
        total: deptTickets.length,
        pending: deptTickets.filter((t) => t.status.toLowerCase() === "pending").length,
        inProgress: deptTickets.filter((t) => t.status.toLowerCase() === "in progress").length,
        resolved: deptTickets.filter((t) => t.status.toLowerCase() === "resolved").length,
        closed: deptTickets.filter((t) => t.status.toLowerCase() === "closed").length,
        adminCount: departmentDistribution[dept] || 0,
        avgResponseTime: calculateAvgResponseTime(deptTickets),
      };
    });

    return {
      totalAdmins: superAdminCount + departmentAdminCount,
      superAdminCount,
      departmentAdminCount,
      departmentDistribution,
      recentRoleChanges: recentChangesWithUsers,
      departmentMetrics,
      totalTickets: allTickets.length,
    };
  },
});

// Helper function to calculate average response time
function calculateAvgResponseTime(tickets) {
  const respondedTickets = tickets.filter((t) => t.staff_response);
  if (respondedTickets.length === 0) return 0;

  const totalTime = respondedTickets.reduce((sum, ticket) => {
    // Rough estimate: if ticket has response, assume it was responded to
    // This is a simplified calculation
    return sum + 1;
  }, 0);

  return Math.round(totalTime / respondedTickets.length);
}
