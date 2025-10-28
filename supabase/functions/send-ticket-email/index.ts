import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TicketEmailRequest {
  ticketId: string;
  matricNumber: string;
  name: string;
  email: string;
  phone?: string;
  department: string;
  natureOfComplaint: string;
  subject: string;
  message: string;
  createdAt: string;
}

// Department routing configuration
const departmentEmails: Record<string, string> = {
  "ICT/Portal": "ict@university.edu.ng",
  "Payment/Bursary": "bursary@university.edu.ng",
  "Exams/Results": "exams@university.edu.ng",
  "Hostel/Accommodation": "hostel@university.edu.ng",
  "Library": "library@university.edu.ng",
  "Registrar": "registrar@university.edu.ng",
  "Others": "info@university.edu.ng",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ticketData: TicketEmailRequest = await req.json();
    console.log("Processing ticket email for:", ticketData.ticketId);

    const staffEmail = departmentEmails[ticketData.natureOfComplaint] || departmentEmails["Others"];

    // Send confirmation email to student
    const studentEmailResponse = await resend.emails.send({
      from: "University Support <onboarding@resend.dev>",
      to: [ticketData.email],
      subject: `Ticket Confirmation - ${ticketData.ticketId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1e3a8a;">Ticket Submitted Successfully</h2>
          <p>Dear ${ticketData.name},</p>
          <p>Your support ticket has been submitted successfully. Below are the details:</p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Ticket ID:</strong> ${ticketData.ticketId}</p>
            <p style="margin: 5px 0;"><strong>Matric Number:</strong> ${ticketData.matricNumber}</p>
            <p style="margin: 5px 0;"><strong>Department:</strong> ${ticketData.department}</p>
            <p style="margin: 5px 0;"><strong>Nature of Complaint:</strong> ${ticketData.natureOfComplaint}</p>
            <p style="margin: 5px 0;"><strong>Subject:</strong> ${ticketData.subject}</p>
            <p style="margin: 5px 0;"><strong>Submitted:</strong> ${new Date(ticketData.createdAt).toLocaleString()}</p>
          </div>
          
          <p><strong>Your Message:</strong></p>
          <p style="background: #f9fafb; padding: 15px; border-left: 4px solid #1e3a8a;">${ticketData.message}</p>
          
          <p>Your ticket has been routed to the appropriate department (${ticketData.natureOfComplaint}). You will receive a response shortly.</p>
          
          <p>You can track your ticket status using the Ticket ID above.</p>
          
          <p>Best regards,<br>University Support Team</p>
        </div>
      `,
    });

    console.log("Student confirmation email sent:", studentEmailResponse);

    // Send notification to staff
    const staffEmailResponse = await resend.emails.send({
      from: "University Support System <onboarding@resend.dev>",
      to: [staffEmail],
      subject: `New Support Ticket - ${ticketData.ticketId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1e3a8a;">New Support Ticket Received</h2>
          <p>A new support ticket has been submitted to your department.</p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Ticket ID:</strong> ${ticketData.ticketId}</p>
            <p style="margin: 5px 0;"><strong>Student Name:</strong> ${ticketData.name}</p>
            <p style="margin: 5px 0;"><strong>Matric Number:</strong> ${ticketData.matricNumber}</p>
            <p style="margin: 5px 0;"><strong>Email:</strong> ${ticketData.email}</p>
            ${ticketData.phone ? `<p style="margin: 5px 0;"><strong>Phone:</strong> ${ticketData.phone}</p>` : ''}
            <p style="margin: 5px 0;"><strong>Department:</strong> ${ticketData.department}</p>
            <p style="margin: 5px 0;"><strong>Nature of Complaint:</strong> ${ticketData.natureOfComplaint}</p>
            <p style="margin: 5px 0;"><strong>Subject:</strong> ${ticketData.subject}</p>
            <p style="margin: 5px 0;"><strong>Submitted:</strong> ${new Date(ticketData.createdAt).toLocaleString()}</p>
          </div>
          
          <p><strong>Message:</strong></p>
          <p style="background: #f9fafb; padding: 15px; border-left: 4px solid #1e3a8a;">${ticketData.message}</p>
          
          <p>Please review and respond to this ticket at your earliest convenience.</p>
          
          <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">This is an automated message from the University Support System.</p>
        </div>
      `,
    });

    console.log("Staff notification email sent to:", staffEmail, staffEmailResponse);

    return new Response(
      JSON.stringify({
        success: true,
        studentEmail: studentEmailResponse,
        staffEmail: staffEmailResponse,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error sending ticket emails:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
