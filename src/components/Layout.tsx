
import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AdminLayout from './AdminLayout';
import EmployeeLayout from './EmployeeLayout';

const Layout: React.FC = () => {
  const { isAdmin } = useAuth();

  // Use admin layout for admin users
  if (isAdmin()) {
    return <AdminLayout />;
  }

  // Use employee layout for regular users
  return <EmployeeLayout />;
};

export default Layout;
