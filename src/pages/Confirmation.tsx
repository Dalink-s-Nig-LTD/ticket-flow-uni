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
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Mobile Home Icon - Top Left */}
      <Button
        onClick={() => navigate("/")}
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 md:hidden z-10"
      >
        <Home className="h-5 w-5" />
      </Button>

      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center space-y-2 md:space-y-4 bg-success text-success-foreground rounded-t-lg pb-4 md:pb-8 p-3 md:p-6">
          <div className="flex justify-center">
            <div className="rounded-full bg-white/20 p-2 md:p-4 animate-scale-in">
              <CheckCircle2 className="h-8 w-8 md:h-16 md:w-16 text-white animate-fade-in" />
            </div>
          </div>
          <CardTitle className="text-xl md:text-3xl font-bold">Ticket Submitted Successfully!</CardTitle>
          <CardDescription className="text-white/90 text-sm md:text-lg">
            Your support ticket has been created and routed to the appropriate department.
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-3 md:pt-8 space-y-2.5 md:space-y-6 p-3 md:p-6">
          {/* Track Ticket Button */}
          <Button
            onClick={() => navigate("/track")}
            variant="default"
            size="sm"
            className="w-full"
          >
            <Search className="mr-2 h-4 w-4" />
            Track Ticket
          </Button>

          <div className="bg-muted/50 p-3 md:p-6 rounded-lg border border-primary/10">
            <h3 className="text-sm md:text-lg font-semibold text-primary mb-2 md:mb-4">Ticket Details</h3>
            <div className="space-y-1.5 md:space-y-3 text-xs md:text-base">
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                <span className="text-muted-foreground">Ticket ID:</span>
                <span className="font-mono font-bold text-primary break-all">{ticketData.ticket_id}</span>
              </div>
              <Separator />
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                <span className="text-muted-foreground">Name:</span>
                <span className="font-medium">{ticketData.name}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                <span className="text-muted-foreground">Matric Number:</span>
                <span className="font-medium">{ticketData.matric_number || "N/A"}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                <span className="text-muted-foreground">JAMB Number:</span>
                <span className="font-medium">{ticketData.jamb_number || "N/A"}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                <span className="text-muted-foreground">Department:</span>
                <span className="font-medium">{ticketData.department}</span>
              </div>
              <Separator />
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                <span className="text-muted-foreground">Nature of Complaint:</span>
                <span className="font-medium">{ticketData.nature_of_complaint}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                <span className="text-muted-foreground">Subject:</span>
                <span className="font-medium break-words">{ticketData.subject}</span>
              </div>
              <Separator />
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                <span className="text-muted-foreground">Submitted:</span>
                <span className="font-medium">{formatDate(ticketData.created_at)}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                <span className="text-muted-foreground">Status:</span>
                <span className="inline-flex items-center px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs font-medium bg-warning/20 text-warning-foreground border border-warning/30 self-start sm:self-auto w-fit">
                  {ticketData.status}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-info/10 border border-info/20 p-2.5 md:p-4 rounded-lg">
            <p className="text-[11px] leading-tight md:text-sm text-info-foreground">
              <strong>Note:</strong> A confirmation email has been sent to <strong className="break-all">{ticketData.email}</strong>. 
              You can track your ticket status using the Ticket ID provided above.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Confirmation;
