import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ErrorBoundary from "@/components/ErrorBoundary";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import Studio from "./pages/Studio";
import RealStudio from "./pages/RealStudio";
import Dashboard from "./pages/Dashboard";
import EnhancedDashboard from "./pages/EnhancedDashboard";
import MobileStudio from "./pages/MobileStudio";
import JoinRoom from "./pages/JoinRoom";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route
                path="/join/:roomId"
                element={
                  <ErrorBoundary>
                    <JoinRoom />
                  </ErrorBoundary>
                }
              />

              {/* Protected routes */}
              <Route
                path="/studio"
                element={
                  <ProtectedRoute>
                    <ErrorBoundary>
                      <Studio />
                    </ErrorBoundary>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/real-studio"
                element={
                  <ProtectedRoute>
                    <ErrorBoundary>
                      <RealStudio />
                    </ErrorBoundary>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/mobile-studio"
                element={
                  <ProtectedRoute>
                    <ErrorBoundary>
                      <MobileStudio />
                    </ErrorBoundary>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/enhanced-dashboard"
                element={
                  <ProtectedRoute>
                    <EnhancedDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />

              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
