import { v, ConvexError } from "convex/values";
import { query, mutation, action } from "./_generated/server";
import { internal } from "./_generated/api";
import { getUserDepartments } from "./roles";

// Helper function to verify admin session
async function verifyAdminSession(ctx, sessionId) {
    if (!sessionId) {
        throw new Error("Unauthorized: No session provided");
    }
    const session = await ctx.db.get(sessionId);
    if (!session) {
        throw new Error("Unauthorized: Invalid session");
    }
    if (session.expiresAt < Date.now()) {
        throw new Error("Unauthorized: Session expired");
    }
    return session;
}

// PUBLIC: Get all tickets (ADMIN ONLY - requires authentication)
// Filters by department access for department admins
export const getAllTickets = query({
    args: { sessionId: v.optional(v.id("sessions")) },
    handler: async (ctx, { sessionId }) => {
        if (!sessionId) {
            throw new Error("Unauthorized: Authentication required");
        }
        await verifyAdminSession(ctx, sessionId);
        
        // Get admin's department access
        const { isSuperAdmin, departments } = await getUserDepartments(ctx, sessionId);
        
        // Super admin sees all tickets
        if (isSuperAdmin) {
            return await ctx.db.query("tickets").order("desc").collect();
        }
        
        // Department admin sees only their departments' tickets
        if (!departments || departments.length === 0) {
            throw new Error("No departments assigned to your account");
        }
        
        const allTickets = await ctx.db.query("tickets").order("desc").collect();
        return allTickets.filter(ticket => 
            departments.includes(ticket.nature_of_complaint)
        );
    },
});

// PUBLIC: Get ticket by ID (ADMIN ONLY - requires authentication)
// Checks department access for department admins
export const getTicketById = query({
    args: {
        ticketId: v.string(),
        sessionId: v.optional(v.id("sessions"))
    },
    handler: async (ctx, { ticketId, sessionId }) => {
        if (!sessionId) {
            throw new Error("Unauthorized: Authentication required");
        }
        await verifyAdminSession(ctx, sessionId);
        
        const ticket = await ctx.db
            .query("tickets")
            .withIndex("by_ticket_id", (q) => q.eq("ticket_id", ticketId))
            .first();
        
        if (!ticket) {
            throw new Error("Ticket not found");
        }
        
        // Check department access
        const { isSuperAdmin, departments } = await getUserDepartments(ctx, sessionId);
        
        if (!isSuperAdmin) {
            if (!departments || !departments.includes(ticket.nature_of_complaint)) {
                throw new Error("You don't have access to this ticket's department");
            }
        }
        
        return ticket;
    },
});
// PUBLIC: Track ticket (requires email + ticket ID match)
export const trackTicket = query({
    args: {
        email: v.string(),
        ticketId: v.string(),
    },
    handler: async (ctx, { email, ticketId }) => {
        const tickets = await ctx.db
            .query("tickets")
            .withIndex("by_ticket_id", (q) => q.eq("ticket_id", ticketId))
            .collect();
        // Only return ticket if email matches
        const ticket = tickets.find((ticket) => ticket.email === email);
        if (!ticket) {
            throw new Error("Ticket not found or email does not match");
        }
        return ticket;
    },
});
// PUBLIC: Create ticket (no auth required - students can submit)
export const createTicket = mutation({
    args: {
        matric_number: v.optional(v.string()),
        jamb_number: v.optional(v.string()),
        name: v.string(),
        email: v.string(),
        phone: v.optional(v.string()),
        department: v.string(),
        nature_of_complaint: v.string(),
        subject: v.string(),
        message: v.string(),
        attachment_url: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        // Normalize inputs
        const normalized = {
            matric_number: args.matric_number?.trim(),
            jamb_number: args.jamb_number?.trim(),
            name: args.name.trim(),
            email: args.email.trim(),
            phone: args.phone?.trim(),
            department: args.department.trim(),
            nature_of_complaint: args.nature_of_complaint.trim(),
            subject: args.subject.trim(),
            message: args.message.trim(),
            attachment_url: args.attachment_url?.trim(),
        };
        console.log("[tickets.createTicket] start", {
            email: normalized.email,
            nature: normalized.nature_of_complaint,
            hasMatric: Boolean(normalized.matric_number),
            hasJamb: Boolean(normalized.jamb_number),
            hasAttachment: Boolean(normalized.attachment_url),
        });
        // SERVER-SIDE INPUT VALIDATION
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(normalized.email)) {
            throw new ConvexError("Invalid email format");
        }
        // Validate input lengths
        if (normalized.name.length < 2 || normalized.name.length > 100) {
            throw new ConvexError("Name must be between 2 and 100 characters");
        }
        if (normalized.email.length > 255) {
            throw new ConvexError("Email too long");
        }
        if (normalized.subject.length < 5 || normalized.subject.length > 200) {
            throw new ConvexError("Subject must be between 5 and 200 characters");
        }
        if (normalized.message.length < 10 || normalized.message.length > 2000) {
            throw new ConvexError("Message must be between 10 and 2000 characters");
        }
        // Validate nature of complaint against allowed values
        const allowedNatures = [
            "ICT/Portal",
            "Payment/Bursary",
            "Exams/Results",
            "Hostel/Accommodation",
            "Library",
            "Registrar",
            "Others"
        ];
        if (!allowedNatures.includes(normalized.nature_of_complaint)) {
            throw new ConvexError("Invalid nature of complaint");
        }
        // Validate matric number format if provided
        if (normalized.matric_number) {
            const matricRegex = /^RUN\/[A-Z]+\/\d{2}\/\d{4,5}$/;
            if (!matricRegex.test(normalized.matric_number)) {
                throw new ConvexError("Invalid matric number format");
            }
        }
        // Validate department (basic check)
        if (normalized.department.length < 2 || normalized.department.length > 100) {
            throw new ConvexError("Invalid department");
        }
        // Generate secure server-side ticket ID
        const date = new Date();
        const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
        let randomNum = Math.floor(Math.random() * 10000);
        try {
            const bytes = globalThis.crypto?.getRandomValues?.(new Uint8Array(2));
            if (bytes) {
                randomNum = ((bytes[0] << 8) | bytes[1]) % 10000;
            }
        }
        catch { }
        const ticketId = `UNIU-${dateStr}-${String(randomNum).padStart(4, '0')}`;
        try {
            const newTicketId = await ctx.db.insert("tickets", {
                ticket_id: ticketId,
                matric_number: normalized.matric_number,
                jamb_number: normalized.jamb_number,
                name: normalized.name,
                email: normalized.email,
                phone: normalized.phone,
                department: normalized.department,
                nature_of_complaint: normalized.nature_of_complaint,
                subject: normalized.subject,
                message: normalized.message,
                status: "Pending",
                attachment_url: normalized.attachment_url,
            });
            console.log("[tickets.createTicket] success", { ticket_id: ticketId, _id: newTicketId });
            return { ticketId: newTicketId, ticket_id: ticketId };
        }
        catch (e) {
            console.error("[tickets.createTicket] insert failed", e);
            throw new ConvexError("Failed to create ticket. Please try again.");
        }
    },
});
// ADMIN ONLY: Update ticket (internal mutation)
const internalUpdateTicket = mutation({
    args: {
        sessionId: v.id("sessions"),
        id: v.id("tickets"),
        status: v.optional(v.string()),
        staff_response: v.optional(v.string()),
    },
    handler: async (ctx, { sessionId, id, status, staff_response }) => {
        await verifyAdminSession(ctx, sessionId);
        
        // Get the current ticket to compare status and get student info
        const ticket = await ctx.db.get(id);
        if (!ticket) {
            throw new Error("Ticket not found");
        }
        
        const updates = {};
        if (status !== undefined)
            updates.status = status;
        if (staff_response !== undefined)
            updates.staff_response = staff_response;
        await ctx.db.patch(id, updates);
        
        return {
            id,
            ticket,
            oldStatus: ticket.status,
            newStatus: status,
            staff_response,
        };
    },
});

// ADMIN ONLY: Update ticket (public action that sends email)
export const updateTicket = action({
    args: {
        sessionId: v.id("sessions"),
        id: v.id("tickets"),
        status: v.optional(v.string()),
        staff_response: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        // Call the mutation to update the ticket
        const result = await ctx.runMutation(internalUpdateTicket, args);
        
        // Send email notification if status changed or staff response was added
        if (args.status || args.staff_response) {
            try {
                await ctx.runAction(internal.emails.sendStatusUpdateEmail, {
                    ticketId: result.ticket.ticket_id,
                    name: result.ticket.name,
                    email: result.ticket.email,
                    subject: result.ticket.subject,
                    oldStatus: result.oldStatus || "Pending",
                    newStatus: result.newStatus || result.oldStatus || "Pending",
                    staffResponse: args.staff_response,
                });
                console.log("✅ Status update email sent successfully");
            } catch (emailError) {
                console.error("⚠️ Failed to send status update email:", emailError);
                // Don't fail the ticket update if email fails
            }
        }
        
        return result.id;
    },
});
