import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Users,
  UserCog,
  Shield,
  TrendingUp,
  Activity,
  Clock,
  CheckCircle,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import ruLogo from "@/assets/ru-logo.png";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer } from "recharts";

const AdminActivityDashboard = () => {
  const navigate = useNavigate();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [hasChecked, setHasChecked] = useState(false);

  const statsData = useQuery(
    api.admin_analytics.getAdminActivityStats,
    sessionId ? { sessionId } : "skip"
  );

  const userRole = useQuery(
    api.auth_queries.getCurrentUserRole,
    sessionId ? { sessionId } : "skip"
  );

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (!hasChecked) return;

    if (!sessionId) {
      navigate("/auth");
      return;
    }

    if (userRole && userRole.role !== "super_admin") {
      toast.error("Only super admins can access this page");
      navigate("/admin");
    }
  }, [hasChecked, sessionId, userRole, navigate]);

  const checkAuth = () => {
    const storedSessionId = localStorage.getItem("sessionId");
    if (storedSessionId) {
      setSessionId(storedSessionId);
    }
    setHasChecked(true);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Prepare chart data for department distribution
  const departmentChartData = statsData
    ? Object.entries(statsData.departmentDistribution).map(([dept, count]) => ({
        department: dept.split("/")[0], // Shorten names for chart
        admins: count,
      }))
    : [];

  // Prepare ticket metrics data for chart
  const ticketMetricsChartData = statsData
    ? Object.entries(statsData.departmentMetrics).map(([dept, metrics]: [string, any]) => ({
        department: dept.split("/")[0],
        total: metrics.total,
        pending: metrics.pending,
        resolved: metrics.resolved,
      }))
    : [];

  if (!hasChecked || !statsData) {
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
                Admin Activity Dashboard
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground truncate">
                System-wide admin statistics and metrics
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

      <main className="container py-4 md:py-6 px-4 space-y-6">
        {/* Overview Stats */}
        <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs md:text-sm font-medium">
                Total Admins
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold">
                {statsData.totalAdmins}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                System-wide administrators
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs md:text-sm font-medium">
                Super Admins
              </CardTitle>
              <Shield className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold">
                {statsData.superAdminCount}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Full system access
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs md:text-sm font-medium">
                Dept Admins
              </CardTitle>
              <UserCog className="h-4 w-4 text-info" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold">
                {statsData.departmentAdminCount}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Department-specific
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs md:text-sm font-medium">
                Total Tickets
              </CardTitle>
              <Activity className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold">
                {statsData.totalTickets}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                All-time submissions
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Department Distribution Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Department Admin Distribution</CardTitle>
            <CardDescription>
              Number of admins assigned to each department
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                admins: {
                  label: "Admins",
                  color: "hsl(var(--primary))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentChartData}>
                  <XAxis
                    dataKey="department"
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="admins" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Ticket Handling Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Ticket Handling Metrics by Department</CardTitle>
            <CardDescription>
              Performance overview of each support department
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(statsData.departmentMetrics).map(([dept, metrics]: [string, any]) => (
                <div key={dept} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">{dept}</h3>
                    <Badge variant="outline">
                      {metrics.adminCount} admin{metrics.adminCount !== 1 ? "s" : ""}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Total</p>
                      <p className="text-xl font-bold">{metrics.total}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Pending</p>
                      <p className="text-xl font-bold text-warning">{metrics.pending}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">In Progress</p>
                      <p className="text-xl font-bold text-info">{metrics.inProgress}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Resolved</p>
                      <p className="text-xl font-bold text-success">{metrics.resolved}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Closed</p>
                      <p className="text-xl font-bold text-muted-foreground">{metrics.closed}</p>
                    </div>
                  </div>
                  <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full flex">
                      {metrics.total > 0 && (
                        <>
                          <div
                            className="bg-warning"
                            style={{ width: `${(metrics.pending / metrics.total) * 100}%` }}
                          />
                          <div
                            className="bg-info"
                            style={{ width: `${(metrics.inProgress / metrics.total) * 100}%` }}
                          />
                          <div
                            className="bg-success"
                            style={{ width: `${(metrics.resolved / metrics.total) * 100}%` }}
                          />
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Role Changes */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Role Changes</CardTitle>
            <CardDescription>
              Last 20 role assignments in the past 30 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            {statsData.recentRoleChanges.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No recent role changes in the past 30 days</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Date Assigned</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {statsData.recentRoleChanges.map((change, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{change.email}</TableCell>
                        <TableCell>
                          <Badge variant={change.role === "super_admin" ? "default" : "secondary"}>
                            {change.role === "super_admin" ? "Super Admin" : "Dept Admin"}
                          </Badge>
                        </TableCell>
                        <TableCell>{change.department || "All Departments"}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(change.assigned_at)}
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
    </div>
  );
};

export default AdminActivityDashboard;
