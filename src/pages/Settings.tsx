
import React, { useState, useEffect } from 'react';
import { getAllRoles } from '@/services/employeeService';
import { useAuth } from '@/contexts/AuthContext';
import { Role } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Settings as SettingsIcon } from 'lucide-react';

const Settings: React.FC = () => {
  const { currentUser } = useAuth();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRoles();
  }, [currentUser]);

  const loadRoles = async () => {
    try {
      const roleList = await getAllRoles();
      setRoles(roleList);
    } catch (error) {
      toast.error('Failed to load roles');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">View available roles</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roles.map((role) => (
          <Card key={role.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{role.name}</CardTitle>
                  <CardDescription>
                    Role ID: {role.id}
                  </CardDescription>
                </div>
                <Badge variant="secondary">System Role</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">
                    This role is managed by the system administrator.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {roles.length === 0 && (
        <div className="text-center py-12">
          <SettingsIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No roles available</h3>
          <p className="mt-1 text-sm text-gray-500">
            Contact your system administrator to set up roles.
          </p>
        </div>
      )}
    </div>
  );
};

export default Settings;
