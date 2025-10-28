import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, Search, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const formSchema = z.object({
  email: z.string().email("Invalid email address"),
  ticketId: z.string().min(10, "Please enter a valid ticket ID"),
});

type FormValues = z.infer<typeof formSchema>;

const TrackTicket = () => {
  const navigate = useNavigate();
  const [isSearching, setIsSearching] = useState(false);
  const [ticketData, setTicketData] = useState<any>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      ticketId: "",
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Resolved":
        return <CheckCircle2 className="h-5 w-5 text-success" />;
      case "In Progress":
        return <Clock className="h-5 w-5 text-info" />;
      default:
        return <AlertCircle className="h-5 w-5 text-warning" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Resolved":
        return "bg-success/20 text-success-foreground border-success/30";
      case "In Progress":
        return "bg-info/20 text-info-foreground border-info/30";
      default:
        return "bg-warning/20 text-warning-foreground border-warning/30";
    }
  };

  const onSubmit = async (values: FormValues) => {
    setIsSearching(true);
    try {
      const { data, error } = await supabase
        .from("tickets")
        .select("*")
        .eq("ticket_id", values.ticketId)
        .eq("email", values.email)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          toast.error("Ticket not found. Please check your Ticket ID and email.");
        } else {
          throw error;
        }
        setTicketData(null);
        return;
      }

      setTicketData(data);
      toast.success("Ticket found!");
    } catch (error: any) {
      console.error("Error searching ticket:", error);
      toast.error("Failed to search ticket. Please try again.");
      setTicketData(null);
    } finally {
      setIsSearching(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <div className="container max-w-4xl py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6 hover:bg-primary/10"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <Card className="shadow-lg border-primary/10 mb-6">
          <CardHeader className="space-y-3 bg-gradient-to-r from-primary to-primary-glow text-primary-foreground rounded-t-lg">
            <CardTitle className="text-3xl font-bold">Track Your Ticket</CardTitle>
            <CardDescription className="text-primary-foreground/90">
              Enter your email address and ticket ID to check the status of your support ticket.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Enter the email used for ticket submission"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ticketId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ticket ID</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., UNIU-20251028-1234"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={isSearching}
                  className="w-full bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 transition-opacity"
                >
                  <Search className="mr-2 h-4 w-4" />
                  {isSearching ? "Searching..." : "Search Ticket"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {ticketData && (
          <Card className="shadow-lg border-primary/10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CardHeader className="bg-muted/50">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl">Ticket Information</CardTitle>
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${getStatusColor(ticketData.status)}`}>
                  {getStatusIcon(ticketData.status)}
                  <span className="font-semibold">{ticketData.status}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="bg-primary/5 p-6 rounded-lg border border-primary/10">
                <h3 className="text-lg font-semibold text-primary mb-4">Basic Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ticket ID:</span>
                    <span className="font-mono font-bold text-primary">{ticketData.ticket_id}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name:</span>
                    <span className="font-medium">{ticketData.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Matric Number:</span>
                    <span className="font-medium">{ticketData.matric_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Department:</span>
                    <span className="font-medium">{ticketData.department}</span>
                  </div>
                </div>
              </div>

              <div className="bg-muted/30 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Complaint Details</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-muted-foreground text-sm">Nature of Complaint:</span>
                    <p className="font-medium mt-1">{ticketData.nature_of_complaint}</p>
                  </div>
                  <Separator />
                  <div>
                    <span className="text-muted-foreground text-sm">Subject:</span>
                    <p className="font-medium mt-1">{ticketData.subject}</p>
                  </div>
                  <Separator />
                  <div>
                    <span className="text-muted-foreground text-sm">Message:</span>
                    <p className="mt-1 text-foreground/90">{ticketData.message}</p>
                  </div>
                </div>
              </div>

              <div className="bg-accent/10 p-6 rounded-lg border border-accent/20">
                <h3 className="text-lg font-semibold mb-4">Timeline</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Submitted:</span>
                    <span className="font-medium">{formatDate(ticketData.created_at)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Updated:</span>
                    <span className="font-medium">{formatDate(ticketData.updated_at)}</span>
                  </div>
                </div>
              </div>

              {ticketData.staff_response && (
                <div className="bg-success/10 p-6 rounded-lg border border-success/20">
                  <h3 className="text-lg font-semibold text-success mb-3">Staff Response</h3>
                  <p className="text-foreground/90">{ticketData.staff_response}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TrackTicket;
