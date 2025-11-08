import { v } from "convex/values";
import { action } from "./_generated/server";
import { escapeHtml, sanitizeForEmail } from "./utils";
const BREVO_API_KEY = process.env.BREVO_API_KEY;
export const sendTicketEmail = action({
    args: {
        ticketId: v.string(),
        matricNumber: v.optional(v.string()),
        jambNumber: v.optional(v.string()),
        name: v.string(),
        email: v.string(),
        phone: v.optional(v.string()),
        department: v.string(),
        natureOfComplaint: v.string(),
        subject: v.string(),
        message: v.string(),
        createdAt: v.string(),
    },
    handler: async (ctx, args) => {
        const departmentEmails = {
            "ICT/Portal": "support@dalinksnigltd.com.ng",
            "Payment/Bursary": "studentaccount@run.edu.ng",
            "Exams/Results": "support@dalinksnigltd.com.ng",
            "Hostel/Accommodation": "dssscomplaints@run.edu.ng",
            "Library": "library@run.edu.ng",
            "Registrar": "registrar@run.edu.ng",
            "Others": "support@dalinksnigltd.com.ng",
        };
        const staffEmail = departmentEmails[args.natureOfComplaint] || departmentEmails["Others"];
        try {
            // Send confirmation email to student
            const studentEmailHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
              .ticket-id { background: #dbeafe; color: #1e40af; padding: 15px; border-radius: 6px; font-size: 20px; font-weight: bold; text-align: center; margin: 20px 0; }
              .info-row { margin: 10px 0; padding: 10px; background: white; border-radius: 4px; }
              .label { font-weight: bold; color: #1e40af; }
              .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
              .track-button { display: inline-block; background: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Ticket Confirmation</h1>
                <p>Redeemer's University Support Portal</p>
              </div>
              <div class="content">
                <p>Dear ${escapeHtml(args.name)},</p>
                <p>Thank you for submitting your support ticket. We have received your request and our team will review it shortly.</p>
                
                <div class="ticket-id">
                  Ticket ID: ${escapeHtml(args.ticketId)}
                </div>
                
                <p>Please save this ticket ID for tracking purposes.</p>
                
                <div style="margin: 20px 0;">
                  <div class="info-row">
                    <span class="label">Subject:</span> ${escapeHtml(args.subject)}
                  </div>
                  <div class="info-row">
                    <span class="label">Department:</span> ${escapeHtml(args.department)}
                  </div>
                  <div class="info-row">
                    <span class="label">Nature of Complaint:</span> ${escapeHtml(args.natureOfComplaint)}
                  </div>
                  <div class="info-row">
                    <span class="label">Submitted:</span> ${escapeHtml(args.createdAt)}
                  </div>
                </div>
                
                <p><strong>Your Message:</strong></p>
                <div style="background: white; padding: 15px; border-radius: 6px; margin: 10px 0;">
                  ${sanitizeForEmail(args.message)}
                </div>
                
                <div style="text-align: center;">
                  <a href="https://runticket2.vercel.app/track" class="track-button">Track Your Ticket</a>
                </div>
                
                <p style="margin-top: 20px;">You will receive email updates when there are changes to your ticket status.</p>
              </div>
              <div class="footer">
                <p>Redeemer's University Support Portal<br>
                If you have questions, please contact us with your ticket ID.</p>
              </div>
            </div>
          </body>
        </html>
      `;

      const studentResponse = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "api-key": BREVO_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sender: { name: "RUN Support Portal", email: "support@dalinksnigltd.com.ng" },
          to: [{ email: args.email }],
          subject: `Ticket Confirmation - ${args.ticketId}`,
          htmlContent: studentEmailHtml,
        }),
      });

      if (!studentResponse.ok) {
        const error = await studentResponse.text();
        console.error("Failed to send student email:", error);
      }

      // Send notification email to staff
      const staffEmailHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #dc2626; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #fef2f2; padding: 30px; border-radius: 0 0 8px 8px; }
              .ticket-id { background: #fee2e2; color: #dc2626; padding: 15px; border-radius: 6px; font-size: 20px; font-weight: bold; text-align: center; margin: 20px 0; }
              .info-row { margin: 10px 0; padding: 10px; background: white; border-radius: 4px; }
              .label { font-weight: bold; color: #dc2626; }
              .view-button { display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎫 New Support Ticket</h1>
                <p>Requires Your Attention</p>
              </div>
              <div class="content">
                <p>A new support ticket has been submitted and assigned to your department.</p>
                
                <div class="ticket-id">
                  Ticket ID: ${args.ticketId}
                </div>
                
                <div style="margin: 20px 0;">
                  <div class="info-row">
                    <span class="label">From:</span> ${escapeHtml(args.name)}
                  </div>
                  <div class="info-row">
                    <span class="label">Email:</span> ${escapeHtml(args.email)}
                  </div>
                  ${args.phone ? `<div class="info-row"><span class="label">Phone:</span> ${escapeHtml(args.phone)}</div>` : ''}
                  ${args.matricNumber ? `<div class="info-row"><span class="label">Matric Number:</span> ${escapeHtml(args.matricNumber)}</div>` : ''}
                  ${args.jambNumber ? `<div class="info-row"><span class="label">JAMB Number:</span> ${escapeHtml(args.jambNumber)}</div>` : ''}
                  <div class="info-row">
                    <span class="label">Department:</span> ${escapeHtml(args.department)}
                  </div>
                  <div class="info-row">
                    <span class="label">Nature:</span> ${escapeHtml(args.natureOfComplaint)}
                  </div>
                  <div class="info-row">
                    <span class="label">Subject:</span> ${escapeHtml(args.subject)}
                  </div>
                  <div class="info-row">
                    <span class="label">Submitted:</span> ${escapeHtml(args.createdAt)}
                  </div>
                </div>
                
                <p><strong>Message:</strong></p>
                <div style="background: white; padding: 15px; border-radius: 6px; margin: 10px 0; border-left: 4px solid #dc2626;">
                  ${sanitizeForEmail(args.message)}
                </div>
                
                <div style="text-align: center;">
                  <a href="https://runticket2.vercel.app/admin" class="view-button">View in Admin Portal</a>
                </div>
              </div>
            </div>
          </body>
        </html>
      `;

      const staffResponse = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "api-key": BREVO_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sender: { name: "RUN Support Portal", email: "support@dalinksnigltd.com.ng" },
          to: [{ email: staffEmail }],
          subject: `New Ticket: ${args.subject} [${args.ticketId}]`,
          htmlContent: staffEmailHtml,
        }),
      });

      if (!staffResponse.ok) {
        const error = await staffResponse.text();
        console.error("Failed to send staff email:", error);
      }

      console.log("✅ Emails sent successfully");
      console.log("Student email:", args.email);
      console.log("Staff email:", staffEmail);

      return { success: true, studentEmail: args.email, staffEmail };
    } catch (error) {
      console.error("Email sending error:", error);
      return { success: false, error: String(error) };
    }
  },
});
export const sendPasswordResetEmail = action({
    args: {
        email: v.string(),
        token: v.string(),
    },
    handler: async (ctx, { email, token }) => {
        const resetUrl = `https://runticket2.vercel.app/reset-password?token=${token}`;
        try {
            const emailHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
              .reset-button { display: inline-block; background: #dc2626; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }
              .token-box { background: #fee2e2; color: #991b1b; padding: 15px; border-radius: 6px; font-family: monospace; font-size: 16px; text-align: center; margin: 20px 0; }
              .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 4px; margin: 20px 0; }
              .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🔐 Password Reset Request</h1>
                <p>Redeemer's University Admin Portal</p>
              </div>
              <div class="content">
                <p>Hello,</p>
                <p>We received a request to reset your password for your admin account. Click the button below to create a new password:</p>
                
                <div style="text-align: center;">
                  <a href="${resetUrl}" class="reset-button">Reset Password</a>
                </div>
                
                <p>Or copy and paste this link into your browser:</p>
                <div class="token-box">
                  ${resetUrl}
                </div>
                
                <div class="warning">
                  <p style="margin: 0;"><strong>⏰ Important:</strong> This link will expire in 1 hour for security reasons.</p>
                </div>
                
                <p>If you didn't request a password reset, please ignore this email. Your password will remain unchanged.</p>
                
                <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">For security reasons, never share this link with anyone. If you're having trouble, contact the IT department.</p>
              </div>
              <div class="footer">
                <p>Redeemer's University Support Portal<br>
                This is an automated message, please do not reply.</p>
              </div>
            </div>
          </body>
        </html>
      `;

      const response = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "api-key": BREVO_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sender: { name: "RUN Support Portal", email: "support@dalinksnigltd.com.ng" },
          to: [{ email: email }],
          subject: "Password Reset Request - RUN Admin Portal",
          htmlContent: emailHtml,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error("Failed to send password reset email:", error);
        return { success: false, error };
      }

      console.log("✅ Password reset email sent to:", email);
      return { success: true, email };
    } catch (error) {
      console.error("Password reset email error:", error);
      return { success: false, error: String(error) };
    }
  },
});
export const sendStatusUpdateEmail = action({
    args: {
        ticketId: v.string(),
        name: v.string(),
        email: v.string(),
        subject: v.string(),
        oldStatus: v.string(),
        newStatus: v.string(),
        staffResponse: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        try {
            const statusColors = {
                open: { bg: "#dbeafe", color: "#1e40af" },
                "in-progress": { bg: "#fef3c7", color: "#92400e" },
                resolved: { bg: "#d1fae5", color: "#065f46" },
                closed: { bg: "#f3f4f6", color: "#374151" },
            };
            const statusColor = statusColors[args.newStatus] || statusColors.open;
            const emailHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
              .ticket-id { background: #dbeafe; color: #1e40af; padding: 15px; border-radius: 6px; font-size: 18px; font-weight: bold; text-align: center; margin: 20px 0; }
              .status-change { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #10b981; }
              .status-badge { display: inline-block; padding: 8px 16px; border-radius: 20px; font-weight: bold; text-transform: uppercase; font-size: 12px; }
              .response-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 4px; margin: 20px 0; }
              .track-button { display: inline-block; background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
              .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>📬 Ticket Status Update</h1>
                <p>Your ticket has been updated</p>
              </div>
              <div class="content">
                <p>Dear ${escapeHtml(args.name)},</p>
                <p>There's an update on your support ticket.</p>
                
                <div class="ticket-id">
                  Ticket ID: ${escapeHtml(args.ticketId)}
                </div>
                
                <div style="margin: 20px 0;">
                  <p><strong>Subject:</strong> ${escapeHtml(args.subject)}</p>
                </div>
                
                <div class="status-change">
                  <p style="margin: 0 0 10px 0;"><strong>Status Changed:</strong></p>
                  <div style="display: flex; align-items: center; gap: 10px;">
                    <span class="status-badge" style="background: #e5e7eb; color: #6b7280;">
                      ${escapeHtml(args.oldStatus)}
                    </span>
                    <span style="font-size: 20px;">→</span>
                    <span class="status-badge" style="background: ${statusColor.bg}; color: ${statusColor.color};">
                      ${escapeHtml(args.newStatus)}
                    </span>
                  </div>
                </div>
                
                ${args.staffResponse ? `
                  <div class="response-box">
                    <p style="margin: 0 0 10px 0;"><strong>💬 Staff Response:</strong></p>
                    <p style="margin: 0;">${sanitizeForEmail(args.staffResponse)}</p>
                  </div>
                ` : ''}
                
                <div style="text-align: center;">
                  <a href="https://runticket2.vercel.app/track" class="track-button">View Ticket Details</a>
                </div>
                
                <p style="margin-top: 20px;">You will continue to receive updates as your ticket progresses.</p>
              </div>
              <div class="footer">
                <p>Redeemer's University Support Portal<br>
                If you have questions, please reply with your ticket ID.</p>
              </div>
            </div>
          </body>
        </html>
      `;
            const response = await fetch("https://api.brevo.com/v3/smtp/email", {
                method: "POST",
                headers: {
                    "api-key": BREVO_API_KEY,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    sender: { name: "RUN Support Portal", email: "support@dalinksnigltd.com.ng" },
                    to: [{ email: args.email }],
                    subject: `Ticket Update: ${args.subject} [${args.ticketId}]`,
                    htmlContent: emailHtml,
                }),
            });
            if (!response.ok) {
                const error = await response.text();
                console.error("Failed to send status update email:", error);
                return { success: false, error };
            }
            console.log("✅ Status update email sent to:", args.email);
            return { success: true, email: args.email };
        }
        catch (error) {
            console.error("Status update email error:", error);
            return { success: false, error: String(error) };
        }
    },
});
