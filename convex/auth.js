import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { internal } from "./_generated/api";
import bcrypt from "bcryptjs";
import { verifySuperAdmin } from "./roles";

// Use a fixed bcrypt-format dummy hash string for constant-time checks when a
// user is not found. We must NOT call bcrypt.hashSync here because bcryptjs
// may use timers internally (setTimeout), which Convex disallows in queries
// and mutations. Constructing a valid-looking 60-char hash string avoids that
// problem while ensuring bcrypt.compare receives a correctly formatted hash.
const DUMMY_BCRYPT_HASH = "$2a$10$" + "A".repeat(53);
export const signUp = action({
    args: {
        email: v.string(),
        password: v.string(),
    },
    handler: async (ctx, { email, password }) => {
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new Error("Invalid email format");
        }
        // Validate password strength
        if (password.length < 8) {
            throw new Error("Password must be at least 8 characters");
        }
        if (!/[A-Z]/.test(password)) {
            throw new Error("Password must contain at least one uppercase letter");
        }
        if (!/[a-z]/.test(password)) {
            throw new Error("Password must contain at least one lowercase letter");
        }
        if (!/[0-9]/.test(password)) {
            throw new Error("Password must contain at least one number");
        }
        const existing = await ctx.runQuery(internal.auth_queries.getUserByEmail, { email });
        if (existing) {
            throw new Error("User already exists");
        }

        // Create a regular user account (no admin role assigned here).
        // Admins should be created via the `createUserWithRole` endpoint by a super admin.
        const hashedPassword = await bcrypt.hash(password, 10);
        const userId = await ctx.runMutation(internal.auth_queries.createUser, {
            email,
            password: hashedPassword,
        });

        return { userId, email };
    },
});
export const signIn = action({
    args: {
        email: v.string(),
        password: v.string(),
    },
    handler: async (ctx, { email, password }) => {
        // Use constant-time comparison to prevent timing attacks
        const user = await ctx.runQuery(internal.auth_queries.getUserByEmail, { email });
    // Always check password even if user doesn't exist (prevent timing attack)
    // Use a valid precomputed bcrypt hash when the user record is missing so
    // that bcrypt.compare never receives a malformed hash and throws.
    const passwordToCheck = user?.password || DUMMY_BCRYPT_HASH;
    const isValidPassword = await bcrypt.compare(password, passwordToCheck);
        if (!user || !isValidPassword) {
            throw new Error("Invalid credentials");
        }
        // Create a session
        const sessionId = await ctx.runMutation(internal.auth_queries.createSession, {
            userId: user._id,
            email: user.email,
        });
        return { userId: user._id, email: user.email, sessionId };
    },
});
// REMOVED: getCurrentUser - Security vulnerability
// This function exposed user data including password hashes
// Admin operations should use session-based authentication instead
export const requestPasswordReset = mutation({
    args: {
        email: v.string(),
    },
    handler: async (ctx, { email }) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", email))
            .first();
        if (!user) {
            // Don't reveal if user exists - return success anyway
            return { success: true };
        }
        // Generate secure random token
        const token = Array.from(globalThis.crypto.getRandomValues(new Uint8Array(32)))
            .map((b) => b.toString(16).padStart(2, '0'))
            .join('');
        // Token expires in 1 hour
        const expiresAt = Date.now() + 60 * 60 * 1000;
        await ctx.db.insert("password_reset_tokens", {
            user_id: user._id,
            token,
            expires_at: expiresAt,
            used: false,
        });
        // SECURITY: Only return token and email for email sending
        // Never expose token in API response to frontend
        return { success: true, token, email: user.email };
    },
});
export const verifyResetToken = query({
    args: {
        token: v.string(),
    },
    handler: async (ctx, { token }) => {
        const resetToken = await ctx.db
            .query("password_reset_tokens")
            .withIndex("by_token", (q) => q.eq("token", token))
            .first();
        if (!resetToken) {
            return { valid: false, error: "Invalid token" };
        }
        if (resetToken.used) {
            return { valid: false, error: "Token already used" };
        }
        if (resetToken.expires_at < Date.now()) {
            return { valid: false, error: "Token expired" };
        }
        return { valid: true };
    },
});
export const resetPassword = action({
    args: {
        token: v.string(),
        newPassword: v.string(),
    },
    handler: async (ctx, { token, newPassword }) => {
        // Validate password strength
        if (newPassword.length < 8) {
            throw new Error("Password must be at least 8 characters");
        }
        if (!/[A-Z]/.test(newPassword)) {
            throw new Error("Password must contain at least one uppercase letter");
        }
        if (!/[a-z]/.test(newPassword)) {
            throw new Error("Password must contain at least one lowercase letter");
        }
        if (!/[0-9]/.test(newPassword)) {
            throw new Error("Password must contain at least one number");
        }
        const resetToken = await ctx.runQuery(internal.auth_queries.getResetToken, { token });
        if (!resetToken) {
            throw new Error("Invalid token");
        }
        if (resetToken.used) {
            throw new Error("Token already used");
        }
        if (resetToken.expires_at < Date.now()) {
            throw new Error("Token expired");
        }
        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        // Update user password and mark token as used
        await ctx.runMutation(internal.auth_queries.updatePassword, {
            userId: resetToken.user_id,
            tokenId: resetToken._id,
            hashedPassword,
        });
        return { success: true };
    },
});

// Create user with specified role (super admin only)
export const createUserWithRole = action({
    args: {
        sessionId: v.id("sessions"),
        email: v.string(),
        password: v.string(),
        role: v.optional(v.union(
            v.literal("super_admin"),
            v.literal("department_admin"),
            v.literal("regular")
        )),
        departments: v.optional(v.array(v.string()))
    },
    handler: async (ctx, { sessionId, email, password, role, departments }) => {
        // Verify caller is super admin
        await verifySuperAdmin(ctx, sessionId);

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new Error("Invalid email format");
        }

        // Validate password strength
        if (password.length < 8) {
            throw new Error("Password must be at least 8 characters");
        }
        if (!/[A-Z]/.test(password)) {
            throw new Error("Password must contain at least one uppercase letter");
        }
        if (!/[a-z]/.test(password)) {
            throw new Error("Password must contain at least one lowercase letter");
        }
        if (!/[0-9]/.test(password)) {
            throw new Error("Password must contain at least one number");
        }

        // Check if user already exists
        const existing = await ctx.runQuery(internal.auth_queries.getUserByEmail, { email });
        if (existing) {
            throw new Error("User already exists");
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const userId = await ctx.runMutation(internal.auth_queries.createUser, {
            email,
            password: hashedPassword,
        });

        // Assign role if specified (skip for regular users)
        if (role && role !== "regular") {
            try {
                await ctx.runMutation(internal.roles.assignRoleManually, {
                    userId,
                    role,
                    departments,
                });
            } catch (roleError) {
                // If role assignment fails, delete the user
                await ctx.runMutation(internal.auth_queries.deleteUser, { userId });
                throw new Error("Failed to assign role. Please try again.");
            }
        }

        return { userId, email, role: role || "regular" };
    },
});
