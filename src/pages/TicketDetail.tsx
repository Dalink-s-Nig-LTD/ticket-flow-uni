import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Mail,
  Phone,
  Calendar,
  User,
  FileText,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { toast } from "sonner";
import ruLogo from "@/assets/ru-logo.png";

interface Ticket {
  _id: Id<"tickets">;
  ticket_id: string;
  name: string;
  email: string;
  matric_number?: string | null;
  jamb_number?: string | null;
  phone?: string | null;
  department: string;
  nature_of_complaint: string;
  subject: string;
  message: string;
  status: string;
  staff_response?: string | null;
  _creationTime: number;
}

const TicketDetail = () => {
  const { ticketId } = useParams<{ ticketId: string }>();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState("");
  const [staffResponse, setStaffResponse] = useState("");

  const ticket = useQuery(
    api.tickets.getTicketById,
    ticketId ? { ticketId } : "skip"
  ) as Ticket | null | undefined;
  const updateTicket = useMutation(api.tickets.updateTicket);

  useEffect(() => {
    const userEmail = localStorage.getItem("userEmail");
    if (!userEmail) {
      navigate("/auth");
    }
  }, [navigate]);

  useEffect(() => {
    if (ticket) {
      setStatus(ticket.status);
      setStaffResponse(ticket.staff_response || "");
    }
  }, [ticket]);

  const handleSave = async () => {
    if (!ticket) return;

    // Ensure we have a valid sessionId required by the API
    const storedSessionId = localStorage.getItem("sessionId");
    if (!storedSessionId) {
      toast.error("Session expired. Please sign in again.");
      navigate("/auth");
      return;
    }

    // Cast the stored string to the session Id type expected by the API
    const sessionIdForApi = storedSessionId as unknown as Id<"sessions">;

    setIsSaving(true);
    try {
      await updateTicket({
        sessionId: sessionIdForApi,
        id: ticket._id,
        status: status,
        staff_response: staffResponse || undefined,
      });

      toast.success("Ticket updated successfully");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      toast.error("Failed to update ticket: " + message);
      console.error("Error updating ticket:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-warning/10 text-warning border-warning/20";
      case "in progress":
        return "bg-info/10 text-info border-info/20";
      case "resolved":
        return "bg-success/10 text-success border-success/20";
      case "closed":
        return "bg-destructive/10 text-destructive border-destructive/20";
      default:
        return "bg-muted";
    }
  };

  if (ticket === undefined) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading ticket details...</p>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Ticket not found</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b sticky top-0 z-10">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <img
              src={ruLogo}
              alt="Redeemer's University Logo"
              className="h-12"
            />
            <div>
              <h1 className="text-lg font-bold">Ticket Details</h1>
              <p className="text-sm text-muted-foreground">
                {ticket.ticket_id}
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={() => navigate("/admin")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </header>

      <main className="container py-6 px-4 max-w-6xl">
        <div className="grid gap-6 md:grid-cols-3">
          {/* Left Column - Ticket Information */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-2xl mb-2">
                      {ticket.subject}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 text-base">
                      <Badge className={getStatusColor(ticket.status)}>
                        {ticket.status}
                      </Badge>
                      <span>•</span>
                      <span>{ticket.nature_of_complaint}</span>
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-semibold text-muted-foreground">
                    Description
                  </Label>
                  <p className="mt-2 text-foreground whitespace-pre-wrap">
                    {ticket.message}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Student Information</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <Label className="text-sm font-semibold text-muted-foreground">
                      Name
                    </Label>
                    <p className="mt-1 text-foreground">{ticket.name}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <Label className="text-sm font-semibold text-muted-foreground">
                      ID Number
                    </Label>
                    <p className="mt-1 text-foreground">
                      {ticket.matric_number || ticket.jamb_number || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <Label className="text-sm font-semibold text-muted-foreground">
                      Email
                    </Label>
                    <p className="mt-1 text-foreground break-all">
                      {ticket.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <Label className="text-sm font-semibold text-muted-foreground">
                      Phone
                    </Label>
                    <p className="mt-1 text-foreground">
                      {ticket.phone || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <Label className="text-sm font-semibold text-muted-foreground">
                      Department
                    </Label>
                    <p className="mt-1 text-foreground">{ticket.department}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <Label className="text-sm font-semibold text-muted-foreground">
                      Submitted
                    </Label>
                    <p className="mt-1 text-foreground">
                      {new Date(ticket._creationTime).toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Management Actions */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Ticket Management</CardTitle>
                <CardDescription>
                  Update status and add response
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Resolved">Resolved</SelectItem>
                      <SelectItem value="Closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="response">Staff Response</Label>
                  <Textarea
                    id="response"
                    placeholder="Add your response to the student..."
                    value={staffResponse}
                    onChange={(e) => setStaffResponse(e.target.value)}
                    rows={8}
                    className="resize-none"
                  />
                </div>

                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="w-full"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="h-2 w-2 rounded-full bg-primary"></div>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Ticket Created</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(ticket._creationTime).toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TicketDetail;
