
import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, Users, FileText, Settings, User } from 'lucide-react';
import AdminLayout from './AdminLayout';

const Layout: React.FC = () => {
  const { currentUser, logout, isAdmin } = useAuth();
  const location = useLocation();

  // Use admin layout for admin users
  if (isAdmin()) {
    return <AdminLayout />;
  }

  // Regular layout for employee users
  const navigation = [
    { name: 'Certificates', href: '/certificates', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold text-gray-900">{currentUser?.company?.companyName}</h1>
              </div>
              <div className="hidden md:ml-6 md:flex md:space-x-8">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                        location.pathname === item.href
                          ? 'border-blue-500 text-gray-900'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700">{currentUser?.email}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="text-gray-500 hover:text-gray-700"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
