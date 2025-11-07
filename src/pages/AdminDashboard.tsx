import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Ticket, CheckCircle, Clock, XCircle, RefreshCw, Search, Filter, X, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
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

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [natureFilter, setNatureFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  
  const tickets = useQuery(
    api.tickets.getAllTickets, 
    sessionId ? { sessionId: sessionId as any } : "skip"
  ) || [];

  // Filter and sort tickets
  const filteredAndSortedTickets = useMemo(() => {
    let filtered = [...tickets];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (ticket) =>
          ticket.ticket_id.toLowerCase().includes(query) ||
          ticket.name.toLowerCase().includes(query) ||
          ticket.email.toLowerCase().includes(query) ||
          ticket.subject.toLowerCase().includes(query) ||
          ticket.department.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (ticket) => ticket.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    // Apply nature of complaint filter
    if (natureFilter !== "all") {
      filtered = filtered.filter(
        (ticket) => ticket.nature_of_complaint === natureFilter
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return b._creationTime - a._creationTime;
        case "oldest":
          return a._creationTime - b._creationTime;
        case "status-asc":
          return a.status.localeCompare(b.status);
        case "status-desc":
          return b.status.localeCompare(a.status);
        default:
          return 0;
      }
    });

    return filtered;
  }, [tickets, searchQuery, statusFilter, natureFilter, sortBy]);

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setNatureFilter("all");
    setSortBy("newest");
    toast.success("Filters cleared");
  };

  const hasActiveFilters = searchQuery || statusFilter !== "all" || natureFilter !== "all" || sortBy !== "newest";

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    const storedSessionId = localStorage.getItem("sessionId");
    if (!storedSessionId) {
      navigate("/auth");
      return;
    }
    setSessionId(storedSessionId);
  };

  const handleSignOut = () => {
    localStorage.removeItem("sessionId");
    toast.success("Signed out successfully");
    navigate("/auth");
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "warning";
      case "in progress":
        return "info";
      case "resolved":
        return "success";
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

  const stats = {
    total: filteredAndSortedTickets.length,
    pending: filteredAndSortedTickets.filter((t) => t.status.toLowerCase() === "pending").length,
    inProgress: filteredAndSortedTickets.filter((t) => t.status.toLowerCase() === "in progress").length,
    resolved: filteredAndSortedTickets.filter((t) => t.status.toLowerCase() === "resolved").length,
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b sticky top-0 z-10">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2 md:gap-4 min-w-0">
            <img src={ruLogo} alt="Redeemer's University Logo" className="h-8 md:h-12 flex-shrink-0" />
            <div className="min-w-0">
              <h1 className="text-sm md:text-lg font-bold truncate">Admin Dashboard</h1>
              <p className="text-xs md:text-sm text-muted-foreground truncate">{userEmail}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleSignOut} className="flex-shrink-0">
            <LogOut className="h-4 w-4 md:mr-2" />
            <span className="hidden md:inline">Sign Out</span>
          </Button>
        </div>
      </header>

      <main className="container py-4 md:py-6 px-4">
        <div className="grid gap-3 grid-cols-2 md:grid-cols-4 mb-4 md:mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs md:text-sm font-medium">Total</CardTitle>
              <Ticket className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 md:p-6">
              <CardTitle className="text-xs md:text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
              <div className="text-xl md:text-2xl font-bold">{stats.pending}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 md:p-6">
              <CardTitle className="text-xs md:text-sm font-medium">Progress</CardTitle>
              <RefreshCw className="h-4 w-4 text-info" />
            </CardHeader>
            <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
              <div className="text-xl md:text-2xl font-bold">{stats.inProgress}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 md:p-6">
              <CardTitle className="text-xs md:text-sm font-medium">Resolved</CardTitle>
              <CheckCircle className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
              <div className="text-xl md:text-2xl font-bold">{stats.resolved}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="p-4 md:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <CardTitle className="text-base md:text-lg">All Tickets</CardTitle>
                <CardDescription className="text-xs md:text-sm">
                  Showing {filteredAndSortedTickets.length} of {tickets.length}
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="w-full sm:w-auto"
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                {showFilters ? "Hide" : "Filters"}
              </Button>
            </div>

            {/* Search and Filter Controls */}
            {showFilters && (
              <div className="pt-4 space-y-3 border-t mt-4">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by ticket ID, name, email, subject, or department..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Filters Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  {/* Status Filter */}
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover z-50">
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Nature Filter */}
                  <Select value={natureFilter} onValueChange={setNatureFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover z-50">
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="ICT/Portal">ICT/Portal</SelectItem>
                      <SelectItem value="Payment/Bursary">Payment/Bursary</SelectItem>
                      <SelectItem value="Exams/Results">Exams/Results</SelectItem>
                      <SelectItem value="Hostel/Accommodation">Hostel/Accommodation</SelectItem>
                      <SelectItem value="Library">Library</SelectItem>
                      <SelectItem value="Registrar">Registrar</SelectItem>
                      <SelectItem value="Others">Others</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Sort By */}
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover z-50">
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                      <SelectItem value="status-asc">Status (A-Z)</SelectItem>
                      <SelectItem value="status-desc">Status (Z-A)</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Clear Filters Button */}
                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      onClick={clearFilters}
                      className="w-full"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Clear All
                    </Button>
                  )}
                </div>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {filteredAndSortedTickets.length === 0 ? (
              <div className="text-center py-8">
                <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">
                  {tickets.length === 0 ? "No tickets found" : "No tickets match your filters"}
                </p>
                {hasActiveFilters && tickets.length > 0 && (
                  <Button variant="link" onClick={clearFilters} className="mt-2">
                    Clear filters to see all tickets
                  </Button>
                )}
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ticket ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>ID Number</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAndSortedTickets.map((ticket) => (
                        <TableRow 
                          key={ticket._id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => navigate(`/admin/ticket/${ticket.ticket_id}`)}
                        >
                          <TableCell className="font-medium">{ticket.ticket_id}</TableCell>
                          <TableCell>{ticket.name}</TableCell>
                          <TableCell className="text-sm">
                            {ticket.matric_number || ticket.jamb_number || "N/A"}
                          </TableCell>
                          <TableCell className="text-sm">{ticket.department}</TableCell>
                          <TableCell className="text-sm">{ticket.nature_of_complaint}</TableCell>
                          <TableCell className="max-w-xs truncate">{ticket.subject}</TableCell>
                          <TableCell>
                            <Badge variant={getStatusColor(ticket.status) as any} className="flex items-center gap-1 w-fit">
                              {getStatusIcon(ticket.status)}
                              {ticket.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">
                            {new Date(ticket._creationTime).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-3">
                  {filteredAndSortedTickets.map((ticket) => (
                    <Card 
                      key={ticket._id}
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => navigate(`/admin/ticket/${ticket.ticket_id}`)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1 min-w-0 flex-1">
                            <CardTitle className="text-sm font-medium truncate">
                              {ticket.ticket_id}
                            </CardTitle>
                            <CardDescription className="text-xs truncate">
                              {ticket.name}
                            </CardDescription>
                          </div>
                          <Badge variant={getStatusColor(ticket.status) as any} className="flex items-center gap-1 flex-shrink-0">
                            {getStatusIcon(ticket.status)}
                            <span className="text-xs">{ticket.status}</span>
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground text-xs">ID:</span>
                          <span className="text-xs">{ticket.matric_number || ticket.jamb_number || "N/A"}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground text-xs">Department:</span>
                          <span className="text-xs truncate ml-2">{ticket.department}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground text-xs">Type:</span>
                          <span className="text-xs truncate ml-2">{ticket.nature_of_complaint}</span>
                        </div>
                        <div className="pt-1 border-t">
                          <p className="text-xs font-medium truncate">{ticket.subject}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(ticket._creationTime).toLocaleDateString()}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminDashboard;
