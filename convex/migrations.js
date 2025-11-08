import { mutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { getDepartmentsForEmail } from "./departments";

// Run this once to assign roles to existing admin users
export const migrateExistingAdmins = mutation({
  args: {},
  handler: async (ctx) => {
    console.log("Starting admin role migration...");
    
    const allUsers = await ctx.db.query("users").collect();
    let migrated = 0;
    let skipped = 0;
    
    for (const user of allUsers) {
      // Check if user already has a role
      const existingRole = await ctx.db
        .query("user_roles")
        .withIndex("by_user_id", (q) => q.eq("user_id", user._id))
        .first();
      
      if (existingRole) {
        console.log(`Skipping ${user.email} - already has role`);
        skipped++;
        continue;
      }
      
      // Assign role based on email
      const departments = getDepartmentsForEmail(user.email);
      
      if (departments === null) {
        // Super admin
        await ctx.db.insert("user_roles", {
          user_id: user._id,
          role: "super_admin",
          assigned_at: Date.now(),
        });
        console.log(`✅ Assigned super_admin role to ${user.email}`);
        migrated++;
      } else if (departments.length > 0) {
        // Department admin
        for (const dept of departments) {
          await ctx.db.insert("user_roles", {
            user_id: user._id,
            role: "department_admin",
            department: dept,
            assigned_at: Date.now(),
          });
        }
        console.log(`✅ Assigned department_admin role to ${user.email} for: ${departments.join(", ")}`);
        migrated++;
      } else {
        console.log(`⚠️ Skipping ${user.email} - not authorized as admin`);
        skipped++;
      }
    }
    
    console.log(`Migration complete: ${migrated} migrated, ${skipped} skipped`);
    return { 
      success: true, 
      message: `Migration completed: ${migrated} users migrated, ${skipped} users skipped`,
      migrated,
      skipped
    };
  },
});
