import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, UserCog, Trash2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const DEPARTMENTS = [
  "ICT/Portal",
  "Payment/Bursary",
  "Exams/Results",
  "Hostel/Accommodation",
  "Library",
  "Registrar",
  "Others"
];

const DepartmentManagement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");

  useEffect(() => {
    const storedSessionId = localStorage.getItem("sessionId");
    if (!storedSessionId) {
      navigate("/auth");
      return;
    }
    setSessionId(storedSessionId);
  }, [navigate]);

  const userRole = useQuery(
    api.auth_queries.getCurrentUserRole,
    sessionId ? { sessionId: sessionId as any } : "skip"
  );

  const allAdmins = useQuery(
    api.roles_management.getAllAdmins,
    sessionId ? { sessionId: sessionId as any } : "skip"
  );

  const removeAssignment = useMutation(api.roles_management.removeAdminDepartment);
  const addAssignment = useMutation(api.roles_management.addAdminDepartment);

  // Redirect if not super admin
  useEffect(() => {
    if (userRole && userRole.role !== "super_admin") {
      toast({
        title: "Access Denied",
        description: "Only super admins can access this page.",
        variant: "destructive",
      });
      navigate("/admin");
    }
  }, [userRole, navigate, toast]);

  const handleRemoveAssignment = async (userId: string, department: string) => {
    if (!sessionId) return;
    
    try {
      await removeAssignment({
        sessionId: sessionId as any,
        userId: userId as any,
        department,
      });
      toast({
        title: "Assignment Removed",
        description: `Successfully removed department assignment.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to remove assignment",
        variant: "destructive",
      });
    }
  };

  const handleAddAssignment = async () => {
    if (!sessionId || !newAdminEmail || !selectedDepartment) {
      toast({
        title: "Missing Information",
        description: "Please provide both email and department.",
        variant: "destructive",
      });
      return;
    }

    try {
      await addAssignment({
        sessionId: sessionId as any,
        email: newAdminEmail,
        department: selectedDepartment,
      });
      toast({
        title: "Assignment Added",
        description: `Successfully assigned ${newAdminEmail} to ${selectedDepartment}`,
      });
      setIsAddDialogOpen(false);
      setNewAdminEmail("");
      setSelectedDepartment("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add assignment",
        variant: "destructive",
      });
    }
  };

  if (!sessionId || !userRole || userRole.role !== "super_admin") {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/admin")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <UserCog className="h-8 w-8" />
              Department Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage admin assignments and department access
            </p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Assignment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Department Assignment</DialogTitle>
                <DialogDescription>
                  Assign an admin email to a department. The user must sign up with this email.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Admin Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@run.edu.ng"
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {DEPARTMENTS.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleAddAssignment} className="w-full">
                  Add Assignment
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-4">
          {allAdmins?.map((admin) => (
            <Card key={admin.userId}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span>{admin.email}</span>
                    {admin.role === "super_admin" && (
                      <Badge variant="default">Super Admin</Badge>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {admin.role === "super_admin" ? (
                  <p className="text-muted-foreground">
                    Has access to all departments
                  </p>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground mb-2">
                      Assigned Departments:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {admin.departments?.map((dept) => (
                        <Badge
                          key={dept}
                          variant="secondary"
                          className="flex items-center gap-2"
                        >
                          {dept}
                          <button
                            onClick={() => handleRemoveAssignment(admin.userId, dept)}
                            className="ml-1 hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                      {(!admin.departments || admin.departments.length === 0) && (
                        <span className="text-sm text-muted-foreground">
                          No departments assigned
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {!allAdmins || allAdmins.length === 0 && (
            <Card>
              <CardContent className="flex items-center justify-center p-12">
                <p className="text-muted-foreground">No admins found</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default DepartmentManagement;
