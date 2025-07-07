
import React, { useState, useEffect } from 'react';
import { getCertificates, addCertificate, updateCertificate, deleteCertificate } from '@/services/certificateService';
import { getCompanyUsers } from '@/services/userService';
import { useAuth } from '@/contexts/AuthContext';
import { Certificate, User } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { FileText, Edit, Settings } from 'lucide-react';

const Certificates: React.FC = () => {
  const { userProfile, hasPermission } = useAuth();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCertificate, setEditingCertificate] = useState<Certificate | null>(null);
  
  const isAdmin = hasPermission('manage-users');
  
  const [formData, setFormData] = useState({
    name: '',
    organization: '',
    level: '',
    certificateId: '',
    outputType: 'PDF',
    duration: '',
    status: 'active' as const,
    userId: userProfile?.id || '',
    issueDate: '',
    expiryDate: ''
  });

  useEffect(() => {
    loadCertificates();
    if (isAdmin) {
      loadUsers();
    }
  }, [userProfile, isAdmin]);

  const loadCertificates = async () => {
    if (!userProfile) return;
    
    try {
      const certs = await getCertificates(
        userProfile.id,
        userProfile.companyId,
        isAdmin
      );
      setCertificates(certs);
    } catch (error) {
      toast.error('Failed to load certificates');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    if (!userProfile) return;
    
    try {
      const companyUsers = await getCompanyUsers(userProfile.companyId);
      setUsers(companyUsers);
    } catch (error) {
      toast.error('Failed to load users');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;

    try {
      const certificateData = {
        ...formData,
        companyId: userProfile.companyId,
        userId: isAdmin ? formData.userId : userProfile.id,
        issueDate: new Date(formData.issueDate),
        expiryDate: formData.expiryDate ? new Date(formData.expiryDate) : undefined
      };

      if (editingCertificate) {
        await updateCertificate(editingCertificate.id, certificateData);
        toast.success('Certificate updated successfully');
      } else {
        await addCertificate(certificateData);
        toast.success('Certificate added successfully');
      }

      setDialogOpen(false);
      setEditingCertificate(null);
      resetForm();
      loadCertificates();
    } catch (error) {
      toast.error('Failed to save certificate');
    }
  };

  const handleEdit = (certificate: Certificate) => {
    setEditingCertificate(certificate);
    setFormData({
      name: certificate.name,
      organization: certificate.organization,
      level: certificate.level,
      certificateId: certificate.certificateId,
      outputType: certificate.outputType,
      duration: certificate.duration,
      status: certificate.status,
      userId: certificate.userId,
      issueDate: certificate.issueDate.toISOString().split('T')[0],
      expiryDate: certificate.expiryDate ? certificate.expiryDate.toISOString().split('T')[0] : ''
    });
    setDialogOpen(true);
  };

  const handleDelete = async (certificateId: string) => {
    if (window.confirm('Are you sure you want to delete this certificate?')) {
      try {
        await deleteCertificate(certificateId);
        toast.success('Certificate deleted successfully');
        loadCertificates();
      } catch (error) {
        toast.error('Failed to delete certificate');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      organization: '',
      level: '',
      certificateId: '',
      outputType: 'PDF',
      duration: '',
      status: 'active',
      userId: userProfile?.id || '',
      issueDate: '',
      expiryDate: ''
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user ? user.name : 'Unknown User';
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
          <h1 className="text-2xl font-bold text-gray-900">Certificates</h1>
          <p className="text-gray-600">
            {isAdmin ? 'Manage all company certificates' : 'Manage your certificates'}
          </p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setEditingCertificate(null); }}>
              <FileText className="w-4 h-4 mr-2" />
              Add Certificate
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingCertificate ? 'Edit Certificate' : 'Add New Certificate'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Certificate Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="organization">Organization</Label>
                  <Input
                    id="organization"
                    value={formData.organization}
                    onChange={(e) => setFormData(prev => ({ ...prev, organization: e.target.value }))}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="level">Level</Label>
                  <Select
                    value={formData.level}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, level: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Beginner">Beginner</SelectItem>
                      <SelectItem value="Intermediate">Intermediate</SelectItem>
                      <SelectItem value="Advanced">Advanced</SelectItem>
                      <SelectItem value="Expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="certificateId">Certificate ID</Label>
                  <Input
                    id="certificateId"
                    value={formData.certificateId}
                    onChange={(e) => setFormData(prev => ({ ...prev, certificateId: e.target.value }))}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="outputType">Output Type</Label>
                  <Select
                    value={formData.outputType}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, outputType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PDF">PDF</SelectItem>
                      <SelectItem value="Digital Badge">Digital Badge</SelectItem>
                      <SelectItem value="Physical Certificate">Physical Certificate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration</Label>
                  <Input
                    id="duration"
                    value={formData.duration}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                    placeholder="e.g., 40 hours, 3 months"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {isAdmin && (
                  <div className="space-y-2">
                    <Label htmlFor="userId">Assign to User</Label>
                    <Select
                      value={formData.userId}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, userId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select user" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name} ({user.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="issueDate">Issue Date</Label>
                  <Input
                    id="issueDate"
                    type="date"
                    value={formData.issueDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, issueDate: e.target.value }))}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="expiryDate">Expiry Date (Optional)</Label>
                  <Input
                    id="expiryDate"
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingCertificate ? 'Update Certificate' : 'Add Certificate'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {certificates.map((certificate) => (
          <Card key={certificate.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{certificate.name}</CardTitle>
                  <CardDescription>{certificate.organization}</CardDescription>
                </div>
                <Badge className={getStatusColor(certificate.status)}>
                  {certificate.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div><strong>Level:</strong> {certificate.level}</div>
                <div><strong>ID:</strong> {certificate.certificateId}</div>
                <div><strong>Type:</strong> {certificate.outputType}</div>
                {certificate.duration && (
                  <div><strong>Duration:</strong> {certificate.duration}</div>
                )}
                <div><strong>Issue Date:</strong> {certificate.issueDate.toLocaleDateString()}</div>
                {certificate.expiryDate && (
                  <div><strong>Expires:</strong> {certificate.expiryDate.toLocaleDateString()}</div>
                )}
                {isAdmin && (
                  <div><strong>User:</strong> {getUserName(certificate.userId)}</div>
                )}
              </div>
              
              <div className="flex justify-end space-x-2 mt-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(certificate)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(certificate.id)}
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {certificates.length === 0 && (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No certificates</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by adding your first certificate.
          </p>
        </div>
      )}
    </div>
  );
};

export default Certificates;
