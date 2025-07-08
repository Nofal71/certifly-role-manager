
import React from 'react';
import { Outlet } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';
import EmployeeSidebar from './EmployeeSidebar';

const EmployeeLayout: React.FC = () => {
  const { currentUser } = useAuth();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <EmployeeSidebar />
        <div className="flex-1">
          <header className="flex h-14 items-center justify-between border-b px-4">
            <div className="flex items-center">
              <SidebarTrigger />
              <div className="ml-4">
                <h1 className="text-lg font-semibold">{currentUser?.company?.companyName || 'Certificate Management System'}</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">{currentUser?.email}</span>
            </div>
          </header>
          <main className="flex-1 p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default EmployeeLayout;
