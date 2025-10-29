import { useNavigate } from "react-router-dom";
import { Ticket, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { useIsMobile } from "@/hooks/use-mobile";
import ruLogo from "@/assets/ru-logo.png";

const Index = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const steps = [
    "Create your ticket with all necessary details",
    "System routes to the correct department automatically",
    "Receive confirmation email with ticket ID",
    "Track progress and get responses via email"
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b">
        <div className="container flex h-16 md:h-20 items-center justify-between px-4">
          <div className="flex items-center gap-2 md:gap-4">
            <img src={ruLogo} alt="Redeemer's University Logo" className="h-12 md:h-16" />
          </div>
          <div className="text-right">
            <h2 className="text-lg md:text-2xl font-bold text-primary">Student Support Portal</h2>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-primary text-white py-12 md:py-16">
        <div className="container text-center px-4">
          <h2 className="text-2xl md:text-4xl font-bold mb-3 md:mb-4">Welcome to the Support Center</h2>
          <p className="text-base md:text-lg max-w-3xl mx-auto">
            Create a ticket for your complaint so the university can monitor and respond effectively. Our dedicated team is here to help you.
          </p>
        </div>
      </section>

      {/* Main Content Cards */}
      <section className="container py-8 md:py-12 px-4">
        {isMobile ? (
          <Carousel className="max-w-sm mx-auto mb-12">
            <CarouselContent>
              <CarouselItem>
                <Card>
                  <CardHeader>
                    <div className="h-14 w-14 rounded-xl bg-primary flex items-center justify-center mb-3">
                      <Ticket className="h-7 w-7 text-white" />
                    </div>
                    <CardTitle className="text-lg">Create Support Ticket</CardTitle>
                    <CardDescription className="text-sm">
                      Submit a new complaint or request. Our system will automatically route it to the appropriate department.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      onClick={() => navigate("/create")}
                      className="w-full"
                    >
                      Get Started →
                    </Button>
                  </CardContent>
                </Card>
              </CarouselItem>
              <CarouselItem>
                <Card>
                  <CardHeader>
                    <div className="h-14 w-14 rounded-xl bg-primary flex items-center justify-center mb-3">
                      <Search className="h-7 w-7 text-white" />
                    </div>
                    <CardTitle className="text-lg">Track Existing Ticket</CardTitle>
                    <CardDescription className="text-sm">
                      Check the status of your submitted tickets and view responses from our support team.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      onClick={() => navigate("/track")}
                      className="w-full"
                    >
                      Track Now →
                    </Button>
                  </CardContent>
                </Card>
              </CarouselItem>
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        ) : (
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
            <Card>
              <CardHeader>
                <div className="h-16 w-16 rounded-xl bg-primary flex items-center justify-center mb-4">
                  <Ticket className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl">Create Support Ticket</CardTitle>
                <CardDescription className="text-base">
                  Submit a new complaint or request. Our system will automatically route it to the appropriate department.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => navigate("/create")}
                  className="w-full"
                >
                  Get Started →
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="h-16 w-16 rounded-xl bg-primary flex items-center justify-center mb-4">
                  <Search className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl">Track Existing Ticket</CardTitle>
                <CardDescription className="text-base">
                  Check the status of your submitted tickets and view responses from our support team.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => navigate("/track")}
                  className="w-full"
                >
                  Track Now →
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* How It Works Section */}
        <div className="max-w-5xl mx-auto bg-card rounded-lg p-6 md:p-8">
          <h2 className="text-xl md:text-2xl font-bold mb-6 md:mb-8">How It Works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center text-lg md:text-xl font-bold mx-auto mb-3 md:mb-4">
                  {index + 1}
                </div>
                <p className="text-sm text-foreground">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-white mt-12 md:mt-16">
        <div className="container py-6 md:py-8 text-center px-4">
          <p className="font-medium mb-2 text-sm md:text-base">© 2025 Redeemers University Support Portal @ DICT. All rights reserved.</p>
          <p className="text-xs md:text-sm">For urgent matters, please contact the registrar's office directly.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
