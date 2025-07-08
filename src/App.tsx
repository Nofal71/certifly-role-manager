
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import CompanySignup from "./pages/CompanySignup";
import Dashboard from "./pages/Dashboard";
import Certificates from "./pages/Certificates";
import Employees from "./pages/Employees";
import Roles from "./pages/Roles";
import Settings from "./pages/Settings";
import Analytics from "./pages/Analytics";
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={!currentUser ? <Login /> : <Navigate to="/dashboard" />} />
      <Route path="/signup" element={!currentUser ? <CompanySignup /> : <Navigate to="/dashboard" />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      
      {/* Protected routes */}
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="analytics" element={
          <ProtectedRoute requireAdmin>
            <Analytics />
          </ProtectedRoute>
        } />
        <Route path="certificates" element={<Certificates />} />
        <Route path="employees" element={
          <ProtectedRoute requireAdmin>
            <Employees />
          </ProtectedRoute>
        } />
        <Route path="roles" element={
          <ProtectedRoute requireAdmin>
            <Roles />
          </ProtectedRoute>
        } />
        <Route path="settings" element={<Settings />} />
      </Route>
      
      {/* Catch all route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" storageKey="lovable-ui-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
