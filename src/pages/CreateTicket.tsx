import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const formSchema = z.object({
  matricNumber: z.string().min(5, "Matric number must be at least 5 characters").max(50),
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address").max(255),
  phone: z.string().optional(),
  department: z.string().min(2, "Please select your department").max(100),
  natureOfComplaint: z.string().min(1, "Please select nature of complaint"),
  subject: z.string().min(5, "Subject must be at least 5 characters").max(200),
  message: z.string().min(10, "Message must be at least 10 characters").max(2000),
});

type FormValues = z.infer<typeof formSchema>;

const natureOptions = [
  "ICT/Portal",
  "Payment/Bursary",
  "Exams/Results",
  "Hostel/Accommodation",
  "Library",
  "Registrar",
  "Others",
];

const CreateTicket = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      matricNumber: "",
      name: "",
      email: "",
      phone: "",
      department: "",
      natureOfComplaint: "",
      subject: "",
      message: "",
    },
  });

  const generateTicketId = () => {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `UNIU-${dateStr}-${randomNum}`;
  };

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      const ticketId = generateTicketId();
      const now = new Date().toISOString();

      // Insert ticket into database
      const { data: ticketData, error: insertError } = await supabase
        .from("tickets")
        .insert({
          ticket_id: ticketId,
          matric_number: values.matricNumber,
          name: values.name,
          email: values.email,
          phone: values.phone || null,
          department: values.department,
          nature_of_complaint: values.natureOfComplaint,
          subject: values.subject,
          message: values.message,
          status: "Pending",
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Send emails via edge function
      const { error: emailError } = await supabase.functions.invoke("send-ticket-email", {
        body: {
          ticketId,
          matricNumber: values.matricNumber,
          name: values.name,
          email: values.email,
          phone: values.phone,
          department: values.department,
          natureOfComplaint: values.natureOfComplaint,
          subject: values.subject,
          message: values.message,
          createdAt: now,
        },
      });

      if (emailError) {
        console.error("Email sending failed:", emailError);
        toast.warning("Ticket created but email notification may have failed");
      }

      toast.success("Ticket submitted successfully!");
      navigate("/confirmation", { state: { ticketData: { ...ticketData, ticket_id: ticketId } } });
    } catch (error: any) {
      console.error("Error submitting ticket:", error);
      toast.error("Failed to submit ticket. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl py-6 md:py-8 px-4">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-4 md:mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <Card>
          <CardHeader className="space-y-2 md:space-y-3 bg-primary text-primary-foreground rounded-t-lg p-4 md:p-6">
            <CardTitle className="text-xl md:text-3xl font-bold">Create Support Ticket</CardTitle>
            <CardDescription className="text-primary-foreground/90 text-sm md:text-base">
              Please provide all necessary details for your complaint. All fields marked with * are required.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 md:pt-6 p-4 md:p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 md:space-y-6">
                <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                  <FormField
                    control={form.control}
                    name="matricNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Matric/JAMB Number *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 2024001234" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address *</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="your.email@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number (Optional)</FormLabel>
                        <FormControl>
                          <Input type="tel" placeholder="+234 800 000 0000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                  <FormField
                    control={form.control}
                    name="department"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Department/Faculty *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Computer Science" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="natureOfComplaint"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nature of Complaint *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select complaint type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {natureOptions.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject *</FormLabel>
                      <FormControl>
                        <Input placeholder="Brief description of your issue" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message/Description *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Please provide detailed information about your complaint..."
                          rows={6}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    <Send className="mr-2 h-4 w-4" />
                    {isSubmitting ? "Submitting..." : "Submit Ticket"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => form.reset()}
                    disabled={isSubmitting}
                    className="sm:w-auto"
                  >
                    Reset Form
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateTicket;
