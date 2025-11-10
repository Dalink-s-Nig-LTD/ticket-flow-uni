import { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  LogOut,
  Ticket,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import ruLogo from "@/assets/ru-logo.png";

interface Ticket {
  _id: string;
  ticket_id: string;
  name: string;
  email: string;
  matric_number?: string | null;
  jamb_number?: string | null;
  department: string;
  nature_of_complaint: string;
  subject: string;
  message: string;
  status: string;
  _creationTime: number;
  phone?: string | null;
  attachment_url?: string | null;
  staff_response?: string | null;
}

const DepartmentAdmin = () => {
  const { departmentName } = useParams();
  const navigate = useNavigate();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [hasChecked, setHasChecked] = useState(false);

  const ticketsRaw = useQuery(
    api.tickets.getAllTickets,
    sessionId ? { sessionId } : "skip"
  );

  const tickets = useMemo(() => ticketsRaw || [], [ticketsRaw]);

  // Local optimistic updates keyed by ticket _id
  const [localUpdates, setLocalUpdates] = useState<
    Record<string, Partial<Ticket>>
  >({});

  const ticketsWithLocal = useMemo(() => {
    return (tickets as Ticket[]).map((t) => ({
      ...(t as Ticket),
      ...(localUpdates[t._id] || {}),
    }));
  }, [tickets, localUpdates]);

  useEffect(() => {
    const stored = localStorage.getItem("sessionId");
    if (stored) setSessionId(stored);
    setHasChecked(true);
  }, []);

  useEffect(() => {
    if (!hasChecked) return;
    if (!sessionId) {
      navigate("/auth");
    }
  }, [hasChecked, sessionId, navigate]);

  const dept = departmentName
    ? decodeURIComponent(departmentName).replace(/-/g, " ")
    : "Department";

  const filteredTickets = useMemo(() => {
    if (!dept) return [] as Ticket[];
    return (ticketsWithLocal as Ticket[]).filter(
      (t) => t.department?.toLowerCase() === dept.toLowerCase()
    );
  }, [ticketsWithLocal, dept]);

  const stats = useMemo(
    () => ({
      total: filteredTickets.length,
      pending: filteredTickets.filter(
        (t) => t.status.toLowerCase() === "pending"
      ).length,
      inProgress: filteredTickets.filter(
        (t) => t.status.toLowerCase() === "in progress"
      ).length,
      resolved: filteredTickets.filter(
        (t) => t.status.toLowerCase() === "resolved"
      ).length,
    }),
    [filteredTickets]
  );

  // Mutations
  const updateTicket = useMutation(api.tickets.updateTicket);

  const handleSetStatus = async (ticketId: string) => {
    // open status dialog
    if (!sessionId) {
      toast.error("No session. Please sign in again.");
      navigate("/auth");
      return;
    }
    setSelectedTicketId(ticketId);
    setDialogMode("status");
    // prefill with current ticket status if available
    const t = ticketsWithLocal.find((x) => x._id === ticketId) as
      | Ticket
      | undefined;
    setDialogStatus(t?.status || "Pending");
    setDialogResponse("");
    setDialogOpen(true);
  };

  const handleReply = async (ticketId: string) => {
    if (!sessionId) {
      toast.error("No session. Please sign in again.");
      navigate("/auth");
      return;
    }
    setSelectedTicketId(ticketId);
    setDialogMode("reply");
    const t = ticketsWithLocal.find((x) => x._id === ticketId) as
      | Ticket
      | undefined;
    setDialogResponse(t?.staff_response || "");
    setDialogStatus(t?.status || "Pending");
    setDialogOpen(true);
  };

  // dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"status" | "reply" | null>(null);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [dialogStatus, setDialogStatus] = useState<string>("Pending");
  const [dialogResponse, setDialogResponse] = useState<string>("");

  const submitDialog = async () => {
    if (!sessionId || !selectedTicketId) {
      toast.error("Session expired. Please sign in again.");
      navigate("/auth");
      return;
    }

    if (dialogMode === "status") {
      const ticketId = selectedTicketId;
      const newStatus = dialogStatus;
      // optimistic
      setLocalUpdates((prev) => ({
        ...prev,
        [ticketId]: { ...(prev[ticketId] || {}), status: newStatus },
      }));
      setDialogOpen(false);
      try {
        await updateTicket({ sessionId, id: ticketId, status: newStatus });
        toast.success("Status updated");
      } catch (e: unknown) {
        setLocalUpdates((prev) => {
          const copy = { ...prev } as Record<string, Partial<Ticket>>;
          if (copy[ticketId]) {
            const { status, ...rest } = copy[ticketId] as Partial<Ticket>;
            if (Object.keys(rest).length === 0) delete copy[ticketId];
            else copy[ticketId] = rest;
          }
          return copy;
        });
        const msg = e instanceof Error ? e.message : String(e);
        toast.error(msg || "Failed to update status");
      }
    } else if (dialogMode === "reply") {
      const ticketId = selectedTicketId;
      const response = dialogResponse;
      setLocalUpdates((prev) => ({
        ...prev,
        [ticketId]: { ...(prev[ticketId] || {}), staff_response: response },
      }));
      setDialogOpen(false);
      try {
        await updateTicket({
          sessionId,
          id: ticketId,
          staff_response: response,
        });
        toast.success("Response saved");
      } catch (e: unknown) {
        setLocalUpdates((prev) => {
          const copy = { ...prev } as Record<string, Partial<Ticket>>;
          if (copy[ticketId]) {
            const { staff_response, ...rest } = copy[
              ticketId
            ] as Partial<Ticket>;
            if (Object.keys(rest).length === 0) delete copy[ticketId];
            else copy[ticketId] = rest;
          }
          return copy;
        });
        const msg = e instanceof Error ? e.message : String(e);
        toast.error(msg || "Failed to save response");
      }
    }
    // reset
    setSelectedTicketId(null);
    setDialogMode(null);
    setDialogStatus("Pending");
    setDialogResponse("");
  };

  // Map ticket status to Badge variants used in the design system
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "secondary";
      case "in progress":
        return "outline";
      case "resolved":
        return "secondary";
      case "closed":
        return "destructive";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "in progress":
        return <RefreshCw className="h-4 w-4" />;
      case "resolved":
        return <CheckCircle className="h-4 w-4" />;
      case "closed":
        return <XCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  if (!hasChecked) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b sticky top-0 z-10">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2 md:gap-4 min-w-0">
            <img
              src={ruLogo}
              alt="Redeemer's University Logo"
              className="h-8 md:h-12 flex-shrink-0"
            />
            <div className="min-w-0">
              <h1 className="text-sm md:text-lg font-bold truncate">
                {dept} Admin
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground truncate">
                Department Admin Dashboard
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/admin")}
              className="flex-shrink-0"
            >
              Back
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                localStorage.removeItem("sessionId");
                toast.success("Signed out");
                navigate("/auth");
              }}
              className="flex-shrink-0"
            >
              <LogOut className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-4 md:py-6 px-4">
        <div className="grid gap-3 grid-cols-2 md:grid-cols-4 mb-4 md:mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs md:text-sm font-medium">
                Total
              </CardTitle>
              <Ticket className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 md:p-6">
              <CardTitle className="text-xs md:text-sm font-medium">
                Pending
              </CardTitle>
              <Clock className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
              <div className="text-xl md:text-2xl font-bold">
                {stats.pending}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 md:p-6">
              <CardTitle className="text-xs md:text-sm font-medium">
                Progress
              </CardTitle>
              <RefreshCw className="h-4 w-4 text-info" />
            </CardHeader>
            <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
              <div className="text-xl md:text-2xl font-bold">
                {stats.inProgress}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 md:p-6">
              <CardTitle className="text-xs md:text-sm font-medium">
                Resolved
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
              <div className="text-xl md:text-2xl font-bold">
                {stats.resolved}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base md:text-lg">
                  {dept} Tickets
                </CardTitle>
                <CardDescription className="text-xs md:text-sm">
                  Showing {filteredTickets.length} of {tickets.length}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredTickets.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  No tickets for this department
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ticket ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>ID Number</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTickets.map((ticket: Ticket) => (
                      <TableRow
                        key={ticket._id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() =>
                          navigate(`/admin/ticket/${ticket.ticket_id}`)
                        }
                      >
                        <TableCell className="font-medium">
                          {ticket.ticket_id}
                        </TableCell>
                        <TableCell>{ticket.name}</TableCell>
                        <TableCell className="text-sm">
                          {ticket.matric_number || ticket.jamb_number || "N/A"}
                        </TableCell>
                        <TableCell className="text-sm">
                          {ticket.nature_of_complaint}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {ticket.subject}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={getStatusColor(ticket.status)}
                            className="flex items-center gap-1 w-fit"
                          >
                            {getStatusIcon(ticket.status)}
                            {ticket.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(ticket._creationTime).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-sm">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSetStatus(ticket._id);
                              }}
                            >
                              Set Status
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleReply(ticket._id);
                              }}
                            >
                              Reply
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Dialog for status / reply */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            // reset when closed
            setSelectedTicketId(null);
            setDialogMode(null);
            setDialogStatus("Pending");
            setDialogResponse("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogMode === "status"
                ? "Set Ticket Status"
                : "Reply to Ticket"}
            </DialogTitle>
            <DialogDescription>
              {dialogMode === "status"
                ? "Choose a new status for the ticket."
                : "Write a response that will be saved to the ticket."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            {dialogMode === "status" && (
              <Select value={dialogStatus} onValueChange={setDialogStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Resolved">Resolved</SelectItem>
                  <SelectItem value="Closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            )}

            {dialogMode === "reply" && (
              <Textarea
                value={dialogResponse}
                onChange={(e) => setDialogResponse(e.target.value)}
                placeholder="Enter your response here"
                className="min-h-[120px]"
              />
            )}
          </div>

          <DialogFooter>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={submitDialog}>Save</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DepartmentAdmin;
