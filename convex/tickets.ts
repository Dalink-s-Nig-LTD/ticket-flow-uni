import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Helper function to verify admin session
async function verifyAdminSession(ctx: any, sessionId: string) {
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
export const getAllTickets = query({
  args: { sessionId: v.optional(v.id("sessions")) },
  handler: async (ctx, { sessionId }) => {
    if (!sessionId) {
      throw new Error("Unauthorized: Authentication required");
    }
    
    await verifyAdminSession(ctx, sessionId);
    return await ctx.db.query("tickets").order("desc").collect();
  },
});

// PUBLIC: Get ticket by ID (ADMIN ONLY - requires authentication)
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
    
    return await ctx.db
      .query("tickets")
      .withIndex("by_ticket_id", (q) => q.eq("ticket_id", ticketId))
      .first();
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
    // SERVER-SIDE INPUT VALIDATION
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(args.email)) {
      throw new Error("Invalid email format");
    }

    // Validate input lengths
    if (args.name.length < 2 || args.name.length > 100) {
      throw new Error("Name must be between 2 and 100 characters");
    }
    if (args.email.length > 255) {
      throw new Error("Email too long");
    }
    if (args.subject.length < 5 || args.subject.length > 200) {
      throw new Error("Subject must be between 5 and 200 characters");
    }
    if (args.message.length < 10 || args.message.length > 2000) {
      throw new Error("Message must be between 10 and 2000 characters");
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
    if (!allowedNatures.includes(args.nature_of_complaint)) {
      throw new Error("Invalid nature of complaint");
    }

    // Validate matric number format if provided
    if (args.matric_number) {
      const matricRegex = /^RUN\/[A-Z]+\/\d{2}\/\d{4}$/;
      if (!matricRegex.test(args.matric_number)) {
        throw new Error("Invalid matric number format");
      }
    }

    // Validate department (basic check)
    if (args.department.length < 2 || args.department.length > 100) {
      throw new Error("Invalid department");
    }

    // Generate secure server-side ticket ID
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
    const randomBytes = crypto.getRandomValues(new Uint8Array(3));
    const randomNum = (randomBytes[0] << 16 | randomBytes[1] << 8 | randomBytes[2]) % 10000;
    const ticketId = `UNIU-${dateStr}-${String(randomNum).padStart(4, '0')}`;
    
    const newTicketId = await ctx.db.insert("tickets", {
      ticket_id: ticketId,
      matric_number: args.matric_number,
      jamb_number: args.jamb_number,
      name: args.name,
      email: args.email,
      phone: args.phone,
      department: args.department,
      nature_of_complaint: args.nature_of_complaint,
      subject: args.subject,
      message: args.message,
      status: "Pending",
      attachment_url: args.attachment_url,
    });
    
    return { ticketId: newTicketId, ticket_id: ticketId };
  },
});

// ADMIN ONLY: Update ticket
export const updateTicket = mutation({
  args: {
    sessionId: v.id("sessions"),
    id: v.id("tickets"),
    status: v.optional(v.string()),
    staff_response: v.optional(v.string()),
  },
  handler: async (ctx, { sessionId, id, status, staff_response }) => {
    await verifyAdminSession(ctx, sessionId);
    
    const updates: any = {};
    if (status !== undefined) updates.status = status;
    if (staff_response !== undefined) updates.staff_response = staff_response;
    
    await ctx.db.patch(id, updates);
    return id;
  },
});
