import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import Index from "./pages/Index";
import CreateTicket from "./pages/CreateTicket";
import ProspectiveStudentTicket from "./pages/ProspectiveStudentTicket";
import Confirmation from "./pages/Confirmation";
import TrackTicket from "./pages/TrackTicket";
import Auth from "./pages/Auth";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AdminDashboard from "./pages/AdminDashboard";
import DepartmentAdmin from "./pages/DepartmentAdmin";
import TicketDetail from "./pages/TicketDetail";
import DepartmentManagement from "./pages/DepartmentManagement";
import AdminActivityDashboard from "./pages/AdminActivityDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();
const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

const App = () => (
  <ConvexProvider client={convex}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/create" element={<CreateTicket />} />
            <Route
              path="/create-prospective"
              element={<ProspectiveStudentTicket />}
            />
            <Route path="/confirmation" element={<Confirmation />} />
            <Route path="/track" element={<TrackTicket />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route
              path="/admin/department/:departmentName"
              element={<DepartmentAdmin />}
            />
            <Route path="/admin/ticket/:ticketId" element={<TicketDetail />} />
            <Route
              path="/admin/departments"
              element={<DepartmentManagement />}
            />
            <Route
              path="/admin/activity"
              element={<AdminActivityDashboard />}
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ConvexProvider>
);

export default App;
