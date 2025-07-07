
import React, { useState, useEffect } from 'react';
import { getCompanyUsers, getCompanyRoles, updateUser, deleteUser } from '@/services/userService';
import { createEmployee } from '@/services/authService';
import { useAuth } from '@/contexts/AuthContext';
import { User, Role } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Users as UsersIcon, UserPlus } from 'lucide-react';

const Users: React.FC = () => {
  const { userProfile } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    roleId: ''
  });

  useEffect(() => {
    loadUsers();
    loadRoles();
  }, [userProfile]);

  const loadUsers = async () => {
    if (!userProfile) return;
    
    try {
      const companyUsers = await getCompanyUsers(userProfile.companyId);
      setUsers(companyUsers);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const loadRoles = async () => {
    if (!userProfile) return;
    
    try {
      const companyRoles = await getCompanyRoles(userProfile.companyId);
      setRoles(companyRoles);
    } catch (error) {
      toast.error('Failed to load roles');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;

    try {
      await createEmployee({
        ...formData,
        companyId: userProfile.companyId
      });
      toast.success('Employee created successfully! Password reset email sent to the user.');
      setDialogOpen(false);
      resetForm();
      loadUsers();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create employee');
    }
  };

  const handleRoleUpdate = async (userId: string, newRoleId: string) => {
    try {
      await updateUser(userId, { roleId: newRoleId });
      toast.success('User role updated successfully');
      loadUsers();
    } catch (error) {
      toast.error('Failed to update user role');
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (window.confirm(`Are you sure you want to delete ${userName}?`)) {
      try {
        await deleteUser(userId);
        toast.success('User deleted successfully');
        loadUsers();
      } catch (error) {
        toast.error('Failed to delete user');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      roleId: ''
    });
  };

  const getRoleName = (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    return role ? role.name : 'Unknown Role';
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
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-600">Manage company users and their roles</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <UserPlus className="w-4 h-4 mr-2" />
              Add Employee
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Employee</DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="roleId">Role</Label>
                <Select
                  value={formData.roleId}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, roleId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Employee</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user) => (
          <Card key={user.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{user.name}</CardTitle>
                  <CardDescription>{user.email}</CardDescription>
                </div>
                <Badge variant={user.isActive ? "default" : "secondary"}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium">Role</Label>
                  <Select
                    value={user.roleId}
                    onValueChange={(newRoleId) => handleRoleUpdate(user.id, newRoleId)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue>{getRoleName(user.roleId)}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="text-sm text-gray-500">
                  <div>Joined: {user?.createdAt ? (
                    typeof user.createdAt === 'string'
                      ? user.createdAt
                      : user.createdAt instanceof Date && user.createdAt.toLocaleDateString
                        ? user.createdAt.toLocaleDateString()
                        : String(user.createdAt)
                  ) : 'Unknown'}</div>
                </div>
                
                <div className="flex justify-end space-x-2 pt-2">
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeleteUser(user.id, user.name)}
                    disabled={user.id === userProfile?.id}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {users.length === 0 && (
        <div className="text-center py-12">
          <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No users</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by adding your first employee.
          </p>
        </div>
      )}
    </div>
  );
};

export default Users;
