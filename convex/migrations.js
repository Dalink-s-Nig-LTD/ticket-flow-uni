import { mutation } from "./_generated/server";
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
        console.log(
          `✅ Assigned department_admin role to ${user.email} for: ${departments.join(", ")}`
        );
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
      skipped,
    };
  },
});

// Seed super admin account for dpo@run.edu.ng with password 12345678
export const seedDpoAdmin = mutation({
  args: {},
  handler: async (ctx) => {
    const email = "dpo@run.edu.ng";
    const hashedPassword =
      "$2b$10$zTxWslxadHNKNUZSceqx4OUwT8SMicAdYzwux5K1rA/o6ccOgkLrG";

    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    let userId;
    if (existingUser) {
      userId = existingUser._id;
      await ctx.db.patch(userId, { password: hashedPassword });
      console.log("Updated password for existing dpo@run.edu.ng");
    } else {
      userId = await ctx.db.insert("users", {
        email,
        password: hashedPassword,
        created_at: Date.now(),
      });
      console.log("Created new user for dpo@run.edu.ng");
    }

    const existingRole = await ctx.db
      .query("user_roles")
      .withIndex("by_user_id", (q) => q.eq("user_id", userId))
      .first();

    if (!existingRole) {
      await ctx.db.insert("user_roles", {
        user_id: userId,
        role: "super_admin",
        assigned_at: Date.now(),
      });
      console.log("Assigned super_admin role to dpo@run.edu.ng");
    }

    return {
      success: true,
      message:
        "Superadmin account dpo@run.edu.ng created/updated successfully!",
    };
  },
});
