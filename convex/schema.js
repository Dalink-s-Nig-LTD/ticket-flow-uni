import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
export default defineSchema({
    tickets: defineTable({
        ticket_id: v.string(),
        matric_number: v.optional(v.string()),
        jamb_number: v.optional(v.string()),
        name: v.string(),
        email: v.string(),
        phone: v.optional(v.string()),
        department: v.string(),
        nature_of_complaint: v.string(),
        subject: v.string(),
        message: v.string(),
        status: v.optional(v.string()),
        staff_response: v.optional(v.string()),
        attachment_url: v.optional(v.string()),
    })
        .index("by_ticket_id", ["ticket_id"])
        .index("by_email", ["email"]),
    users: defineTable({
        email: v.string(),
        password: v.string(),
        created_at: v.number(),
    }).index("by_email", ["email"]),
    sessions: defineTable({
        userId: v.id("users"),
        email: v.string(),
        createdAt: v.number(),
        expiresAt: v.number(),
    }).index("by_userId", ["userId"]),
    password_reset_tokens: defineTable({
        user_id: v.id("users"),
        token: v.string(),
        expires_at: v.number(),
        used: v.boolean(),
    })
        .index("by_token", ["token"])
        .index("by_user_id", ["user_id"]),
});
