import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, UserCog, Trash2, Plus, Crown, UserMinus, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  const [hasChecked, setHasChecked] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [isPromoteDialogOpen, setIsPromoteDialogOpen] = useState(false);
  const [isDemoteDialogOpen, setIsDemoteDialogOpen] = useState(false);
  const [isConvertDialogOpen, setIsConvertDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserEmail, setSelectedUserEmail] = useState<string | null>(null);
  const [demoteDepartments, setDemoteDepartments] = useState<string[]>([]);

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

  const userRoleData = useQuery(
    api.auth_queries.getCurrentUserRole,
    sessionId ? { sessionId: sessionId as any } : "skip"
  );

  const userRole = userRoleData ? { ...userRoleData, userId: sessionId } : null;

  const allAdmins = useQuery(
    api.roles_management.getAllAdmins,
    sessionId ? { sessionId: sessionId as any } : "skip"
  );

  const removeAssignment = useMutation(api.roles_management.removeAdminDepartment);
  const addAssignment = useMutation(api.roles_management.addAdminDepartment);
  const promoteToSuperAdmin = useMutation(api.roles_management.promoteToSuperAdmin);
  const demoteFromSuperAdmin = useMutation(api.roles_management.demoteFromSuperAdmin);

  // Redirect if not super admin
  useEffect(() => {
    if (!hasChecked) return;
    
    if (userRole && userRole.role !== "super_admin") {
      toast({
        title: "Access Denied",
        description: "Only super admins can access this page.",
        variant: "destructive",
      });
      navigate("/admin");
    }
  }, [hasChecked, userRole, navigate, toast]);

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

  const handlePromoteToSuperAdmin = async () => {
    if (!sessionId || !selectedUserId) return;

    try {
      await promoteToSuperAdmin({
        sessionId: sessionId as any,
        userId: selectedUserId as any,
      });
      toast({
        title: "Promoted Successfully",
        description: `${selectedUserEmail} is now a super admin`,
      });
      setIsPromoteDialogOpen(false);
      setSelectedUserId(null);
      setSelectedUserEmail(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to promote user",
        variant: "destructive",
      });
    }
  };

  const handleDemoteToRegularUser = async () => {
    if (!sessionId || !selectedUserId) return;

    try {
      await demoteFromSuperAdmin({
        sessionId: sessionId as any,
        userId: selectedUserId as any,
        convertToDepartmentAdmin: false,
      });
      toast({
        title: "Demoted Successfully",
        description: `${selectedUserEmail} has been demoted to regular user`,
      });
      setIsDemoteDialogOpen(false);
      setSelectedUserId(null);
      setSelectedUserEmail(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to demote user",
        variant: "destructive",
      });
    }
  };

  const handleConvertToDepartmentAdmin = async () => {
    if (!sessionId || !selectedUserId || demoteDepartments.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please select at least one department",
        variant: "destructive",
      });
      return;
    }

    try {
      await demoteFromSuperAdmin({
        sessionId: sessionId as any,
        userId: selectedUserId as any,
        convertToDepartmentAdmin: true,
        departments: demoteDepartments,
      });
      toast({
        title: "Converted Successfully",
        description: `${selectedUserEmail} is now a department admin`,
      });
      setIsConvertDialogOpen(false);
      setSelectedUserId(null);
      setSelectedUserEmail(null);
      setDemoteDepartments([]);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to convert user",
        variant: "destructive",
      });
    }
  };

  const toggleDepartment = (dept: string) => {
    setDemoteDepartments(prev =>
      prev.includes(dept) ? prev.filter(d => d !== dept) : [...prev, dept]
    );
  };

  if (!hasChecked) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!sessionId || !userRole || userRole.role !== "super_admin") {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 md:p-6 max-w-6xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 md:gap-4 mb-4 md:mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/admin")}
            className="flex-shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl md:text-3xl font-bold flex items-center gap-2">
              <UserCog className="h-6 w-6 md:h-8 md:w-8" />
              <span className="truncate">Department Management</span>
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground mt-1">
              Manage admin assignments and department access
            </p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="w-full sm:w-auto flex-shrink-0">
                <Plus className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Add Assignment</span>
                <span className="sm:hidden">Add</span>
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

        <div className="space-y-3 md:space-y-4">
          {allAdmins?.map((admin) => (
            <Card key={admin.userId}>
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 min-w-0">
                    <span className="text-sm md:text-base break-all">{admin.email}</span>
                    {admin.role === "super_admin" && (
                      <Badge variant="default" className="w-fit">Super Admin</Badge>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {admin.role === "department_admin" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedUserId(admin.userId);
                          setSelectedUserEmail(admin.email);
                          setIsPromoteDialogOpen(true);
                        }}
                      >
                        <Crown className="h-4 w-4 mr-2" />
                        Promote
                      </Button>
                    )}
                    {admin.role === "super_admin" && admin.userId !== userRole?.userId && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="outline">
                            <UserMinus className="h-4 w-4 mr-2" />
                            Demote
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedUserId(admin.userId);
                              setSelectedUserEmail(admin.email);
                              setIsDemoteDialogOpen(true);
                            }}
                          >
                            <UserMinus className="h-4 w-4 mr-2" />
                            Demote to Regular User
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedUserId(admin.userId);
                              setSelectedUserEmail(admin.email);
                              setIsConvertDialogOpen(true);
                            }}
                          >
                            <Users className="h-4 w-4 mr-2" />
                            Convert to Department Admin
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6">
                {admin.role === "super_admin" ? (
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Has access to all departments
                  </p>
                ) : (
                  <div className="space-y-2">
                    <p className="text-xs md:text-sm text-muted-foreground mb-2">
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

        {/* Promote Dialog */}
        <AlertDialog open={isPromoteDialogOpen} onOpenChange={setIsPromoteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Promote to Super Admin?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to promote <strong>{selectedUserEmail}</strong> to Super Admin? 
                They will have access to all departments and management features.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handlePromoteToSuperAdmin}>
                Promote
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Demote to Regular User Dialog */}
        <AlertDialog open={isDemoteDialogOpen} onOpenChange={setIsDemoteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Demote to Regular User?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to demote <strong>{selectedUserEmail}</strong> to a regular user? 
                They will lose all admin privileges and department access.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDemoteToRegularUser} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Demote
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Convert to Department Admin Dialog */}
        <Dialog open={isConvertDialogOpen} onOpenChange={setIsConvertDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Convert to Department Admin</DialogTitle>
              <DialogDescription>
                Convert <strong>{selectedUserEmail}</strong> from Super Admin to Department Admin. 
                Select the departments they should manage.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Select Departments</Label>
                <div className="border rounded-md p-4 space-y-2 max-h-60 overflow-y-auto">
                  {DEPARTMENTS.map((dept) => (
                    <div key={dept} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`dept-${dept}`}
                        checked={demoteDepartments.includes(dept)}
                        onChange={() => toggleDepartment(dept)}
                        className="h-4 w-4"
                      />
                      <label htmlFor={`dept-${dept}`} className="text-sm cursor-pointer">
                        {dept}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsConvertDialogOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleConvertToDepartmentAdmin} className="flex-1">
                  Convert
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default DepartmentManagement;
