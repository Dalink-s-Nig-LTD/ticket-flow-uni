import { useNavigate } from "react-router-dom";
import { Ticket, Search, GraduationCap, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useIsMobile } from "@/hooks/use-mobile";
import Autoplay from "embla-carousel-autoplay";
import ruLogo from "@/assets/ru-logo.png";
import campus1 from "@/assets/campus-1.jpg";
import campus2 from "@/assets/campus-2.jpg";

const Index = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const steps = [
    "Create your ticket with all necessary details",
    "Receive confirmation email with ticket ID",
    "Track progress and get responses via email",
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b">
        <div className="container flex h-16 md:h-20 items-center justify-between px-4">
          <div className="flex items-center gap-2 md:gap-4">
            <img
              src={ruLogo}
              alt="Redeemer's University Logo"
              className="h-12 md:h-16"
            />
          </div>
          <Button variant="outline" onClick={() => navigate("/auth")}>
            Admin Login
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative text-white py-12 md:py-16 overflow-hidden">
        <Carousel
          className="absolute inset-0"
          plugins={[
            Autoplay({
              delay: 4000,
            }),
          ]}
          opts={{
            loop: true,
          }}
        >
          <CarouselContent>
            <CarouselItem>
              <div
                className="h-full w-full bg-cover bg-center"
                style={{
                  backgroundImage: `url(${campus1})`,
                  height: "100%",
                  minHeight: "300px",
                }}
              />
            </CarouselItem>
            <CarouselItem>
              <div
                className="h-full w-full bg-cover bg-center"
                style={{
                  backgroundImage: `url(${campus2})`,
                  height: "100%",
                  minHeight: "300px",
                }}
              />
            </CarouselItem>
          </CarouselContent>
        </Carousel>
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/70 via-blue-800/60 to-blue-900/70 z-[5]" />
        <div className="container text-center px-4 relative z-10">
          <h2 className="text-2xl md:text-4xl font-bold mb-3 md:mb-4">
            Welcome to the Support Center
          </h2>
          <p className="text-base md:text-lg max-w-3xl mx-auto">
            Create a ticket for your complaint so the university can monitor and
            respond effectively. Our dedicated team is here to help you.
          </p>
        </div>
      </section>

      {/* Main Content Cards */}
      <section className="container py-8 md:py-12 px-4">
        {isMobile ? (
          <Carousel
            className="max-w-sm mx-auto mb-12"
            plugins={[
              Autoplay({
                delay: 3000,
                stopOnInteraction: false,
              }),
            ]}
            opts={{
              align: "start",
              loop: true,
            }}
          >
            <CarouselContent>
              <CarouselItem>
                <Card>
                  <CardHeader>
                    <div className="h-14 w-14 rounded-xl bg-primary flex items-center justify-center mb-3">
                      <GraduationCap className="h-7 w-7 text-white" />
                    </div>
                    <CardTitle className="text-lg">Existing Student</CardTitle>
                    <CardDescription className="text-sm">
                      Already enrolled? Use your RUN matric number and email to
                      submit a ticket.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={() => navigate("/create")}
                      className="w-full"
                    >
                      Create Ticket →
                    </Button>
                  </CardContent>
                </Card>
              </CarouselItem>
              <CarouselItem>
                <Card>
                  <CardHeader>
                    <div className="h-14 w-14 rounded-xl bg-primary flex items-center justify-center mb-3">
                      <UserPlus className="h-7 w-7 text-white" />
                    </div>
                    <CardTitle className="text-lg">
                      Prospective Student
                    </CardTitle>
                    <CardDescription className="text-sm">
                      New applicant? Use your JAMB number and email to submit a
                      ticket.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={() => navigate("/create-prospective")}
                      className="w-full"
                    >
                      Create Ticket →
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
                    <CardTitle className="text-lg">
                      Track Existing Ticket
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Check the status of your submitted tickets and view
                      responses from our support team.
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
          </Carousel>
        ) : (
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
            <Card>
              <CardHeader>
                <div className="h-16 w-16 rounded-xl bg-primary flex items-center justify-center mb-4">
                  <GraduationCap className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl">Existing Student</CardTitle>
                <CardDescription className="text-base">
                  Already enrolled? Use your RUN matric number and email to
                  submit a ticket.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => navigate("/create")} className="w-full">
                  Create Ticket →
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="h-16 w-16 rounded-xl bg-primary flex items-center justify-center mb-4">
                  <UserPlus className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl">Prospective Student</CardTitle>
                <CardDescription className="text-base">
                  New applicant? Use your JAMB number and email to submit a
                  ticket.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => navigate("/create-prospective")}
                  className="w-full"
                >
                  Create Ticket →
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
                  Check the status of your submitted tickets and view responses
                  from our support team.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => navigate("/track")} className="w-full">
                  Track Now →
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* How It Works Section */}
        <div className="max-w-5xl mx-auto bg-card rounded-lg p-6 md:p-8">
          <h2 className="text-xl md:text-2xl font-bold mb-6 md:mb-8 text-center md:text-left">
            How It Works
          </h2>
          <div className="space-y-4 md:space-y-0 md:grid md:grid-cols-3 md:gap-6">
            {steps.map((step, index) => (
              <div
                key={index}
                className="flex md:flex-col items-start md:items-center md:text-center gap-4 md:gap-0"
              >
                <div className="h-10 w-10 md:h-12 md:w-12 flex-shrink-0 rounded-full bg-primary/10 text-primary flex items-center justify-center text-lg md:text-xl font-bold md:mx-auto mb-0 md:mb-4">
                  {index + 1}
                </div>
                <p className="text-sm text-foreground flex-1">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-white mt-12 md:mt-16">
        <div className="container py-6 md:py-8 text-center px-4">
          <p className="font-medium mb-2 text-sm md:text-base">
            ©2025 @DICT,Redeemer's University All Rights Reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
