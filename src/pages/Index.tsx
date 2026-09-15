import { useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  Ticket,
  Search,
  GraduationCap,
  UserPlus,
  Briefcase,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Clock,
  CheckCircle2,
  FileText,
  Mail,
  Zap,
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
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { useIsMobile } from "@/hooks/use-mobile";
import Autoplay from "embla-carousel-autoplay";
import ruLogo from "@/assets/ru-logo.png";
import campus1 from "@/assets/campus-1.jpg";
import campus2 from "@/assets/campus-2.jpg";

const Index = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [quickTicketId, setQuickTicketId] = useState("");

  const handleQuickTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickTicketId.trim()) {
      navigate(`/track?id=${encodeURIComponent(quickTicketId.trim())}`);
    } else {
      navigate("/track");
    }
  };

  const categories = [
    {
      id: "student",
      title: "Existing Student",
      subtitle: "Enrolled Students",
      description: "For portal access, course registration, results, and ICT support.",
      requirement: "Matric No. & RUN Email",
      badgeText: "Student",
      badgeColor: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300",
      accentGradient: "from-blue-600 to-indigo-600",
      bgGlow: "hover:border-blue-400/50 hover:shadow-blue-500/10",
      iconBg: "bg-gradient-to-br from-blue-500 to-indigo-700",
      icon: GraduationCap,
      actionText: "Create Ticket",
      route: "/create",
    },
    {
      id: "prospective",
      title: "Prospective Student",
      subtitle: "Applicants & Transfers",
      description: "For admission portal, screening status, and fee verification.",
      requirement: "JAMB Reg No. & Email",
      badgeText: "Applicant",
      badgeColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300",
      accentGradient: "from-emerald-600 to-teal-600",
      bgGlow: "hover:border-emerald-400/50 hover:shadow-emerald-500/10",
      iconBg: "bg-gradient-to-br from-emerald-500 to-teal-700",
      icon: UserPlus,
      actionText: "Create Ticket",
      route: "/create-prospective",
    },
    {
      id: "staff",
      title: "Staff & Faculty",
      subtitle: "Academic & Admin Staff",
      description: "For staff email, workstations, portal issues, and IT services.",
      requirement: "Staff ID & RUN Email",
      badgeText: "Staff",
      badgeColor: "bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300",
      accentGradient: "from-purple-600 to-violet-600",
      bgGlow: "hover:border-purple-400/50 hover:shadow-purple-500/10",
      iconBg: "bg-gradient-to-br from-purple-500 to-violet-700",
      icon: Briefcase,
      actionText: "Create Ticket",
      route: "/create-staff",
    },
  ];

  const steps = [
    {
      title: "Select Category & Describe Issue",
      desc: "Fill out the dedicated form for your identity with your details and ticket category.",
      icon: FileText,
    },
    {
      title: "Receive Unique Ticket Reference",
      desc: "Get an instant confirmation and tracking ID sent directly to your registered email address.",
      icon: Mail,
    },
    {
      title: "Track Real-Time Progress",
      desc: "Monitor staff updates, response timelines, and resolution status in real time.",
      icon: Zap,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100">
      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b sticky top-0 z-50 transition-all">
        <div className="container flex h-16 md:h-20 items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-3">
            <img
              src={ruLogo}
              alt="Redeemer's University Logo"
              className="h-10 md:h-14 w-auto object-contain"
            />
            <div className="hidden sm:block border-l border-slate-200 dark:border-slate-800 pl-3">
              <span className="text-xs font-semibold tracking-wider text-primary uppercase block">
                DICT Helpdesk
              </span>
              <span className="text-xs text-muted-foreground font-medium">
                Support & Ticketing Portal
              </span>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate("/auth")}
            className="rounded-full px-5 hover:bg-primary hover:text-white transition-all shadow-sm"
          >
            Admin Portal
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative text-white py-14 md:py-20 overflow-hidden">
        <Carousel
          className="absolute inset-0"
          plugins={[
            Autoplay({
              delay: 4500,
            }),
          ]}
          opts={{
            loop: true,
          }}
        >
          <CarouselContent>
            <CarouselItem>
              <div
                className="h-full w-full bg-cover bg-center transition-transform duration-700 scale-105"
                style={{
                  backgroundImage: `url(${campus1})`,
                  height: "100%",
                  minHeight: "360px",
                }}
              />
            </CarouselItem>
            <CarouselItem>
              <div
                className="h-full w-full bg-cover bg-center transition-transform duration-700 scale-105"
                style={{
                  backgroundImage: `url(${campus2})`,
                  height: "100%",
                  minHeight: "360px",
                }}
              />
            </CarouselItem>
          </CarouselContent>
        </Carousel>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-950/90 via-slate-900/85 to-indigo-950/90 z-[5]" />

        <div className="container text-center px-4 relative z-10 max-w-4xl mx-auto">


          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-4 md:mb-6 text-white leading-tight">
            How can we assist you today?
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-slate-200 max-w-2xl mx-auto font-normal leading-relaxed">
            Select your user role below to open a ticket, or check the live status of an existing inquiry.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="container py-12 md:py-16 px-4 md:px-8 max-w-7xl mx-auto -mt-8 relative z-20">
        
        {/* Section Title */}
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-xs uppercase font-bold tracking-widest text-primary mb-1">
            Choose Your Identity
          </h2>
          <p className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100">
            Select a category to get started
          </p>
        </div>

        {/* 3 Primary Unique Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-10 md:mb-14">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Card
                key={cat.id}
                className={`relative flex flex-col justify-between overflow-hidden border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md hover:shadow-2xl transition-all duration-300 rounded-2xl group ${cat.bgGlow}`}
              >
                {/* Top Accent Line */}
                <div
                  className={`h-2.5 w-full bg-gradient-to-r ${cat.accentGradient}`}
                />

                <CardHeader className="p-6 pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`h-14 w-14 rounded-2xl ${cat.iconBg} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}
                    >
                      <Icon className="h-7 w-7 text-white" />
                    </div>
                    <span
                      className={`text-xs font-semibold px-3 py-1 rounded-full ${cat.badgeColor}`}
                    >
                      {cat.badgeText}
                    </span>
                  </div>

                  <CardTitle className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                    {cat.title}
                  </CardTitle>

                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
                    {cat.subtitle}
                  </p>

                  <CardDescription className="text-sm text-slate-600 dark:text-slate-300 mt-3 leading-relaxed">
                    {cat.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-6 pt-0 flex-1 flex flex-col justify-end space-y-4">
                  {/* Requirement Badge */}
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300">
                    <ShieldCheck className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                    <span>Required: {cat.requirement}</span>
                  </div>

                  {/* Primary Action Button */}
                  <Button
                    onClick={() => navigate(cat.route)}
                    className={`w-full py-5 rounded-xl bg-gradient-to-r ${cat.accentGradient} text-white font-semibold shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-2 group-hover:gap-3`}
                  >
                    <span>{cat.actionText}</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Track Existing Ticket Banner - Prominently Underneath the 3 Cards */}
        <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white p-6 sm:p-8 md:p-10 border border-blue-900/50">
          {/* Subtle Background Glow Effect */}
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold">
                <Search className="h-3.5 w-3.5" />
                <span>Existing Support Ticket</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Already submitted a support ticket?
              </h2>
              <p className="text-slate-300 text-sm sm:text-base max-w-xl leading-relaxed">
                Track your ticket's real-time resolution status, read staff responses, and communicate with the DICT support team.
              </p>
            </div>

            {/* Right Quick Track Form */}
            <div className="lg:col-span-5 bg-white/10 dark:bg-slate-900/60 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-white/10 shadow-inner">
              <form onSubmit={handleQuickTrack} className="space-y-3">
                <label className="text-xs font-semibold text-blue-200 block uppercase tracking-wider">
                  Quick Track Lookup
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Ticket className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="e.g., DICT-20261028-1234"
                      value={quickTicketId}
                      onChange={(e) => setQuickTicketId(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 px-5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <span>Track Status</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400 pt-1 px-1">
                  <span>Enter your reference Ticket ID</span>
                  <button
                    type="button"
                    onClick={() => navigate("/track")}
                    className="text-blue-300 hover:text-white underline font-medium"
                  >
                    Advanced Search
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="mt-16 md:mt-24 max-w-5xl mx-auto bg-white dark:bg-slate-900 rounded-3xl p-8 md:p-10 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h3 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
              How the Support System Works
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              return (
                <div
                  key={index}
                  className="flex flex-col items-center text-center p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 hover:border-slate-200 transition-all group"
                >
                  <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-xl font-bold mb-4 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                    <StepIcon className="h-6 w-6" />
                  </div>
                  <span className="text-xs font-bold text-primary mb-1">
                    Step 0{index + 1}
                  </span>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                    {step.title}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 mt-16 md:mt-24">
        <div className="container py-8 md:py-12 text-center px-4">
          <p className="font-medium text-sm text-slate-300">
            ©2026 @DICT, Redeemer's University All Rights Reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
