
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (currentUser) {
    return <Navigate to="/certificates" replace />;
  }

  return <Navigate to="/login" replace />;
};

export default Index;
