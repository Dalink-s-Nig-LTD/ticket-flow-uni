import { useNavigate } from "react-router-dom";
import { Plus, Search, GraduationCap, Mail, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: FileText,
      title: "Structured Submissions",
      description: "All complaint details captured before submission",
    },
    {
      icon: Mail,
      title: "Auto-Routing",
      description: "Tickets automatically sent to the right department",
    },
    {
      icon: Search,
      title: "Easy Tracking",
      description: "Monitor your ticket status in real-time",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              University Support
            </span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container py-16 md:py-24">
        <div className="text-center space-y-6 mb-16">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Welcome to{" "}
            <span className="bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">
              University Support Portal
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Create a ticket for your complaint so the university can monitor and respond effectively.
            Fast, organized, and transparent.
          </p>
        </div>

        {/* Main Action Cards */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-16">
          <Card className="group hover:shadow-xl transition-all duration-300 border-primary/20 hover:border-primary/40 cursor-pointer">
            <CardHeader className="pb-4">
              <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Plus className="h-6 w-6 text-primary-foreground" />
              </div>
              <CardTitle className="text-2xl">Create New Ticket</CardTitle>
              <CardDescription>
                Submit a new support ticket with all necessary details for faster resolution.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => navigate("/create")}
                className="w-full bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 transition-opacity"
                size="lg"
              >
                Create Ticket
              </Button>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 border-info/20 hover:border-info/40 cursor-pointer">
            <CardHeader className="pb-4">
              <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-info to-info/80 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Search className="h-6 w-6 text-info-foreground" />
              </div>
              <CardTitle className="text-2xl">Track Existing Ticket</CardTitle>
              <CardDescription>
                Check the status of your submitted tickets and view responses from staff.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => navigate("/track")}
                variant="outline"
                className="w-full border-info hover:bg-info/10"
                size="lg"
              >
                Track Ticket
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Why Use This System?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} className="text-center border-muted">
                <CardHeader>
                  <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card/50 backdrop-blur-sm mt-16">
        <div className="container py-8 text-center text-sm text-muted-foreground">
          <p>© 2025 University Support Portal. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
