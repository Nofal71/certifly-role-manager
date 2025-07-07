
import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import CompanySignup from "./pages/CompanySignup";
import Certificates from "./pages/Certificates";
import Users from "./pages/Users";
import Settings from "./pages/Settings";
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={!currentUser ? <Login /> : <Navigate to="/certificates" />} />
      <Route path="/signup" element={!currentUser ? <CompanySignup /> : <Navigate to="/certificates" />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      
      {/* Protected routes */}
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/certificates" />} />
        <Route path="certificates" element={
          <ProtectedRoute requiredPermission="manage-certificates">
            <Certificates />
          </ProtectedRoute>
        } />
        <Route path="users" element={
          <ProtectedRoute requiredPermission="manage-users">
            <Users />
          </ProtectedRoute>
        } />
        <Route path="settings" element={
          <ProtectedRoute requiredPermission="manage-roles">
            <Settings />
          </ProtectedRoute>
        } />
      </Route>
      
      {/* Catch all route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
