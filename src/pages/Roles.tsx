
import React, { useState, useEffect } from 'react';
import { getAllRoles } from '@/services/employeeService';
import { useAuth } from '@/contexts/AuthContext';
import { Role } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Shield, Users } from 'lucide-react';

const Roles: React.FC = () => {
  const { isAdmin } = useAuth();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAdmin()) {
      loadRoles();
    }
  }, []);

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

  if (!isAdmin()) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">You don't have permission to view this page.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Roles</h1>
          <p className="text-muted-foreground">Manage system roles and permissions</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roles.map((role) => (
          <Card key={role.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">{role.name}</CardTitle>
                </div>
                <Badge variant="secondary">System Role</Badge>
              </div>
              <CardDescription>
                System role with specific permissions and access levels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>Available for employee assignment</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  This role is managed by the system administrator and can be assigned to employees during creation or updates.
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {roles.length === 0 && (
        <div className="text-center py-12">
          <Shield className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-sm font-medium">No roles available</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Contact your system administrator to set up roles.
          </p>
        </div>
      )}
    </div>
  );
};

export default Roles;
