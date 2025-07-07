
import React, { useState, useEffect } from 'react';
import { collection, doc, addDoc, updateDoc, deleteDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Role, DEFAULT_PERMISSIONS } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Settings as SettingsIcon, Plus, Edit } from 'lucide-react';

const Settings: React.FC = () => {
  const { userProfile } = useAuth();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    permissions: [] as string[]
  });

  useEffect(() => {
    loadRoles();
  }, [userProfile]);

  const loadRoles = async () => {
    if (!userProfile) return;
    
    try {
      const q = query(
        collection(db, 'roles'),
        where('companyId', '==', userProfile.companyId)
      );
      const snapshot = await getDocs(q);
      const rolesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Role[];
      setRoles(rolesData);
    } catch (error) {
      toast.error('Failed to load roles');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;

    try {
      const roleData = {
        name: formData.name,
        permissions: formData.permissions,
        companyId: userProfile.companyId,
        isDefault: false,
        createdAt: new Date()
      };

      if (editingRole) {
        await updateDoc(doc(db, 'roles', editingRole.id), {
          ...roleData,
          createdAt: editingRole.createdAt
        });
        toast.success('Role updated successfully');
      } else {
        await addDoc(collection(db, 'roles'), roleData);
        toast.success('Role created successfully');
      }

      setDialogOpen(false);
      setEditingRole(null);
      resetForm();
      loadRoles();
    } catch (error) {
      toast.error('Failed to save role');
    }
  };

  const handleEdit = (role: Role) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      permissions: role.permissions
    });
    setDialogOpen(true);
  };

  const handleDelete = async (roleId: string, roleName: string) => {
    if (window.confirm(`Are you sure you want to delete the role "${roleName}"?`)) {
      try {
        await deleteDoc(doc(db, 'roles', roleId));
        toast.success('Role deleted successfully');
        loadRoles();
      } catch (error) {
        toast.error('Failed to delete role');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      permissions: []
    });
  };

  const handlePermissionChange = (permissionId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      permissions: checked
        ? [...prev.permissions, permissionId]
        : prev.permissions.filter(p => p !== permissionId)
    }));
  };

  const getPermissionName = (permissionId: string) => {
    const permission = DEFAULT_PERMISSIONS.find(p => p.id === permissionId);
    return permission ? permission.name : permissionId;
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
          <p className="text-gray-600">Manage roles and permissions</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setEditingRole(null); }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Role
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingRole ? 'Edit Role' : 'Create New Role'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Role Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              
              <div className="space-y-3">
                <Label>Permissions</Label>
                {DEFAULT_PERMISSIONS.map((permission) => (
                  <div key={permission.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={permission.id}
                      checked={formData.permissions.includes(permission.id)}
                      onCheckedChange={(checked) => handlePermissionChange(permission.id, checked as boolean)}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label
                        htmlFor={permission.id}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {permission.name}
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {permission.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingRole ? 'Update Role' : 'Create Role'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roles.map((role) => (
          <Card key={role.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{role.name}</CardTitle>
                  <CardDescription>
                    {role.permissions.length} permission{role.permissions.length !== 1 ? 's' : ''}
                  </CardDescription>
                </div>
                {role.isDefault && (
                  <Badge variant="secondary">Default</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium mb-2 block">Permissions</Label>
                  <div className="space-y-1">
                    {role.permissions.map((permissionId) => (
                      <div key={permissionId} className="text-sm text-gray-600">
                        • {getPermissionName(permissionId)}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(role)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  {!role.isDefault && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(role.id, role.name)}
                    >
                      Delete
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {roles.length === 0 && (
        <div className="text-center py-12">
          <SettingsIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No custom roles</h3>
          <p className="mt-1 text-sm text-gray-500">
            Default roles are automatically created. Add custom roles as needed.
          </p>
        </div>
      )}
    </div>
  );
};

export default Settings;
