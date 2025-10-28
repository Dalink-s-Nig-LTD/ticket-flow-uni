import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CheckCircle2, Home, Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const Confirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const ticketData = location.state?.ticketData;

  useEffect(() => {
    if (!ticketData) {
      navigate("/");
    }
  }, [ticketData, navigate]);

  if (!ticketData) {
    return null;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-success/5 to-background flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full shadow-xl border-success/20">
        <CardHeader className="text-center space-y-4 bg-gradient-to-r from-success to-success/80 text-success-foreground rounded-t-lg pb-8">
          <div className="flex justify-center">
            <div className="rounded-full bg-success-foreground/20 p-4">
              <CheckCircle2 className="h-16 w-16 text-success-foreground" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold">Ticket Submitted Successfully!</CardTitle>
          <CardDescription className="text-success-foreground/90 text-lg">
            Your support ticket has been created and routed to the appropriate department.
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-8 space-y-6">
          <div className="bg-muted/50 p-6 rounded-lg border border-primary/10">
            <h3 className="text-lg font-semibold text-primary mb-4">Ticket Details</h3>
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
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Nature of Complaint:</span>
                <span className="font-medium">{ticketData.nature_of_complaint}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subject:</span>
                <span className="font-medium">{ticketData.subject}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Submitted:</span>
                <span className="font-medium">{formatDate(ticketData.created_at)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-warning/20 text-warning-foreground border border-warning/30">
                  {ticketData.status}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-info/10 border border-info/20 p-4 rounded-lg">
            <p className="text-sm text-info-foreground">
              <strong>Note:</strong> A confirmation email has been sent to <strong>{ticketData.email}</strong>. 
              You can track your ticket status using the Ticket ID provided above.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-3 pt-4">
            <Button
              onClick={() => navigate("/track")}
              variant="default"
              className="bg-gradient-to-r from-primary to-primary-glow"
            >
              <Search className="mr-2 h-4 w-4" />
              Track Ticket
            </Button>
            <Button
              onClick={() => navigate("/create")}
              variant="outline"
            >
              <Plus className="mr-2 h-4 w-4" />
              New Ticket
            </Button>
            <Button
              onClick={() => navigate("/")}
              variant="ghost"
            >
              <Home className="mr-2 h-4 w-4" />
              Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Confirmation;
