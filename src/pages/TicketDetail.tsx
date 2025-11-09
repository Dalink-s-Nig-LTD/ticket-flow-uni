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
  Image as ImageIcon,
  File,
  Download,
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
import { useQuery, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { toast } from "sonner";
import ruLogo from "@/assets/ru-logo.png";

const useSessionId = () => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [hasChecked, setHasChecked] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedSessionId = localStorage.getItem("sessionId");
    if (storedSessionId) {
      setSessionId(storedSessionId);
    }
    setHasChecked(true);
  }, [navigate]);

  useEffect(() => {
    if (!hasChecked) return;

    if (!sessionId) {
      navigate("/auth");
    }
  }, [hasChecked, sessionId, navigate]);

  return { sessionId, hasChecked };
};

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
  attachment_url?: string | null;
  _creationTime: number;
}

const getFileInfo = (url: string) => {
  const fileName = url.split("/").pop() || "attachment";
  const extension = fileName.split(".").pop()?.toLowerCase();

  let icon = File;
  let fileType = "Document";
  let canPreview = false;

  if (["jpg", "jpeg", "png", "webp", "gif"].includes(extension || "")) {
    icon = ImageIcon;
    fileType = "Image";
    canPreview = true;
  } else if (extension === "pdf") {
    icon = FileText;
    fileType = "PDF Document";
  } else if (["doc", "docx"].includes(extension || "")) {
    icon = FileText;
    fileType = "Word Document";
  }

  return { fileName, extension, icon, fileType, canPreview };
};

const TicketDetail = () => {
  const { ticketId } = useParams<{ ticketId: string }>();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState("");
  const [staffResponse, setStaffResponse] = useState("");
  const { sessionId, hasChecked } = useSessionId();
  // Convert sessionId string to the Convex-generated Id type when present.
  // This avoids using `any` while matching the generated API types.
  const sessionIdForApi: Id<"sessions"> | undefined = sessionId
    ? (sessionId as unknown as Id<"sessions">)
    : undefined;

  const ticket = useQuery(
    api.tickets.getTicketById,
    ticketId && sessionIdForApi
      ? { ticketId, sessionId: sessionIdForApi }
      : "skip"
  ) as Ticket | null | undefined;

  const userRole = useQuery(
    api.auth_queries.getCurrentUserRole,
    sessionIdForApi ? { sessionId: sessionIdForApi } : "skip"
  );

  const updateTicket = useAction(api.tickets.updateTicket);

  useEffect(() => {
    if (userRole && userRole.role === "none") {
      toast.info("You don't have admin access. Redirecting to home page.");
      navigate("/");
    }
  }, [userRole, navigate]);

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

  if (!hasChecked || ticket === undefined) {
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
        <div className="container flex h-16 items-center justify-between px-4 gap-2">
          <div className="flex items-center gap-2 md:gap-4 min-w-0 flex-1">
            <img
              src={ruLogo}
              alt="Redeemer's University Logo"
              className="h-8 md:h-12 flex-shrink-0"
            />
            <div className="min-w-0">
              <h1 className="text-sm md:text-lg font-bold truncate">
                Ticket Details
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground truncate">
                {ticket.ticket_id}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/admin")}
            className="flex-shrink-0"
          >
            <ArrowLeft className="h-4 w-4 md:mr-2" />
            <span className="hidden md:inline">Back</span>
          </Button>
        </div>
      </header>

      <main className="container py-4 md:py-6 px-4 max-w-6xl">
        <div className="grid gap-4 md:gap-6 md:grid-cols-3">
          {/* Left Column - Ticket Information */}
          <div className="md:col-span-2 space-y-4 md:space-y-6">
            <Card>
              <CardHeader className="p-4 md:p-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg md:text-2xl mb-2">
                      {ticket.subject}
                    </CardTitle>
                    <CardDescription className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm md:text-base">
                      <Badge className={getStatusColor(ticket.status)}>
                        {ticket.status}
                      </Badge>
                      <span className="hidden sm:inline">•</span>
                      <span className="break-words">
                        {ticket.nature_of_complaint}
                      </span>
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 md:p-6 space-y-4">
                <div>
                  <Label className="text-xs md:text-sm font-semibold text-muted-foreground">
                    Description
                  </Label>
                  <p className="mt-2 text-sm md:text-base text-foreground whitespace-pre-wrap">
                    {ticket.message}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="text-base md:text-lg">
                  Student Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6 grid gap-3 md:gap-4 sm:grid-cols-2">
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

            {/* Attachments Card */}
            <Card>
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="text-base md:text-lg">
                  Attachments
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6">
                {ticket.attachment_url ? (
                  <div className="space-y-3">
                    {(() => {
                      const fileInfo = getFileInfo(ticket.attachment_url);
                      const FileIcon = fileInfo.icon;

                      return (
                        <div className="border rounded-lg p-4 bg-muted/30">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-primary/10 rounded-md">
                              <FileIcon className="h-6 w-6 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">
                                {fileInfo.fileName}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {fileInfo.fileType}
                              </p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                window.open(ticket.attachment_url, "_blank")
                              }
                              className="shrink-0"
                            >
                              <Download className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </div>

                          {fileInfo.canPreview && (
                            <div className="mt-3 pt-3 border-t">
                              <img
                                src={ticket.attachment_url}
                                alt="Attachment preview"
                                className="w-full h-48 object-cover rounded-md cursor-pointer hover:opacity-90 transition-opacity"
                                onClick={() =>
                                  window.open(ticket.attachment_url, "_blank")
                                }
                              />
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No attachments
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Management Actions */}
          <div className="space-y-4 md:space-y-6">
            <Card>
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="text-base md:text-lg">
                  Ticket Management
                </CardTitle>
                <CardDescription className="text-xs md:text-sm">
                  Update status and add response
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 md:p-6 space-y-4">
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
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="text-base md:text-lg">Timeline</CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6 space-y-3">
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
