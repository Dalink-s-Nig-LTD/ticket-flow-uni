import { v } from "convex/values";
import { mutation } from "./_generated/server";
// File upload utilities for Convex storage
export const generateUploadUrl = mutation(async (ctx) => {
    return await ctx.storage.generateUploadUrl();
});
export const getFileUrl = mutation({
    args: { storageId: v.string() },
    handler: async (ctx, { storageId }) => {
        return await ctx.storage.getUrl(storageId);
    },
});
