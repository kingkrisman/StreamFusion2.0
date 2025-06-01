import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Studio from "./pages/Studio";
import RealStudio from "./pages/RealStudio";
import Dashboard from "./pages/Dashboard";
import EnhancedDashboard from "./pages/EnhancedDashboard";
import MobileStudio from "./pages/MobileStudio";
import JoinRoom from "./pages/JoinRoom";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/studio" element={<Studio />} />
          <Route path="/real-studio" element={<RealStudio />} />
          <Route path="/mobile-studio" element={<MobileStudio />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/enhanced-dashboard" element={<EnhancedDashboard />} />
          <Route path="/join/:roomId" element={<JoinRoom />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
