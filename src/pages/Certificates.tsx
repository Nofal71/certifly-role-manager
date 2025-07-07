
import React, { useState, useEffect } from 'react';
import { getCertificates, addCertificate, updateCertificate, deleteCertificate } from '@/services/certificateService';
import { getCompanyUsers } from '@/services/userService';
import { useAuth } from '@/contexts/AuthContext';
import { Certificate, User } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { FileText, Edit, Trash2, Loader, ExternalLink } from 'lucide-react';

const Certificates: React.FC = () => {
  const { userProfile, hasPermission } = useAuth();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCertificate, setEditingCertificate] = useState<Certificate | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  
  const isAdmin = hasPermission('manage-users');
  const canManageCertificates = hasPermission('manage-certificates');
  
  const [formData, setFormData] = useState({
    courseName: '',
    courseLink: '',
    category: 'frontend' as 'frontend' | 'backend' | 'automation' | 'testing' | 'project-management' | 'others',
    organization: '',
    certificateName: '',
    level: 'beginner' as 'beginner' | 'intermediate' | 'advance',
    startDate: '',
    endDate: '',
    status: 'started' as 'started' | 'in-progress' | 'completed' | 'other',
    output: 'demo' as 'demo' | 'certificate',
    userId: userProfile?.id || ''
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

    setSaveLoading(true);
    try {
      const certificateData = {
        ...formData,
        companyId: userProfile.companyId,
        userId: isAdmin ? formData.userId : userProfile.id,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate)
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
    } finally {
      setSaveLoading(false);
    }
  };

  const handleEdit = (certificate: Certificate) => {
    // Check if user can edit this certificate
    if (!canManageCertificates && certificate.userId !== userProfile?.id) {
      toast.error('You do not have permission to edit this certificate');
      return;
    }

    setEditingCertificate(certificate);
    setFormData({
      courseName: certificate.courseName,
      courseLink: certificate.courseLink,
      category: certificate.category,
      organization: certificate.organization,
      certificateName: certificate.certificateName,
      level: certificate.level,
      startDate: certificate.startDate ? (() => { const d = new Date(certificate.startDate); return isNaN(d.getTime()) ? '' : d.toISOString().split('T')[0]; })() : '',
      endDate: certificate.endDate ? (() => { const d = new Date(certificate.endDate); return isNaN(d.getTime()) ? '' : d.toISOString().split('T')[0]; })() : '',
      status: certificate.status,
      output: certificate.output,
      userId: certificate.userId
    });
    setDialogOpen(true);
  };

  const handleDelete = async (certificateId: string, certificate: Certificate) => {
    // Check if user can delete this certificate
    if (!canManageCertificates && certificate.userId !== userProfile?.id) {
      toast.error('You do not have permission to delete this certificate');
      return;
    }

    setDeleteLoading(certificateId);
    try {
      await deleteCertificate(certificateId);
      toast.success('Certificate deleted successfully');
      loadCertificates();
    } catch (error) {
      toast.error('Failed to delete certificate');
    } finally {
      setDeleteLoading(null);
    }
  };

  const resetForm = () => {
    setFormData({
      courseName: '',
      courseLink: '',
      category: 'frontend',
      organization: '',
      certificateName: '',
      level: 'beginner',
      startDate: '',
      endDate: '',
      status: 'started',
      output: 'demo',
      userId: userProfile?.id || ''
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'in-progress': return 'secondary';
      case 'started': return 'outline';
      case 'other': return 'destructive';
      default: return 'outline';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'frontend': return 'bg-blue-100 text-blue-800';
      case 'backend': return 'bg-green-100 text-green-800';
      case 'automation': return 'bg-purple-100 text-purple-800';
      case 'testing': return 'bg-yellow-100 text-yellow-800';
      case 'project-management': return 'bg-orange-100 text-orange-800';
      case 'others': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user ? user.name : 'Unknown User';
  };

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    if (typeof date === 'object' && 'seconds' in date) {
      return new Date(Number(date.seconds) * 1000).toLocaleDateString();
    }
    if (date instanceof Date) {
      return date.toLocaleDateString();
    }
    return String(date);
  };

  const canEditCertificate = (certificate: Certificate) => {
    return canManageCertificates || certificate.userId === userProfile?.id;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
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
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingCertificate ? 'Edit Certificate' : 'Add New Certificate'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="courseName">Course Name</Label>
                  <Input
                    id="courseName"
                    value={formData.courseName}
                    onChange={(e) => setFormData(prev => ({ ...prev, courseName: e.target.value }))}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="courseLink">Course Link</Label>
                  <Input
                    id="courseLink"
                    type="url"
                    value={formData.courseLink}
                    onChange={(e) => setFormData(prev => ({ ...prev, courseLink: e.target.value }))}
                    placeholder="https://..."
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value: any) => setFormData(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="frontend">Frontend</SelectItem>
                      <SelectItem value="backend">Backend</SelectItem>
                      <SelectItem value="automation">Automation</SelectItem>
                      <SelectItem value="testing">Testing</SelectItem>
                      <SelectItem value="project-management">Project Management</SelectItem>
                      <SelectItem value="others">Others</SelectItem>
                    </SelectContent>
                  </Select>
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
                  <Label htmlFor="certificateName">Certificate Name</Label>
                  <Input
                    id="certificateName"
                    value={formData.certificateName}
                    onChange={(e) => setFormData(prev => ({ ...prev, certificateName: e.target.value }))}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="level">Level</Label>
                  <Select
                    value={formData.level}
                    onValueChange={(value: any) => setFormData(prev => ({ ...prev, level: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advance">Advance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    required
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
                      <SelectItem value="started">Started</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="output">Output</Label>
                  <Select
                    value={formData.output}
                    onValueChange={(value: any) => setFormData(prev => ({ ...prev, output: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="demo">Demo</SelectItem>
                      <SelectItem value="certificate">Certificate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saveLoading}>
                  {saveLoading && <Loader className="w-4 h-4 mr-2 animate-spin" />}
                  {editingCertificate ? 'Update Certificate' : 'Add Certificate'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Course Name</TableHead>
              <TableHead>Certificate Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Organization</TableHead>
              <TableHead>Level</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Output</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              {isAdmin && <TableHead>User</TableHead>}
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {certificates.map((certificate) => (
              <TableRow key={certificate.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center space-x-2">
                    <span>{certificate.courseName}</span>
                    {certificate.courseLink && (
                      <a 
                        href={certificate.courseLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </TableCell>
                <TableCell>{certificate.certificateName}</TableCell>
                <TableCell>
                  <Badge className={getCategoryColor(certificate.category)}>
                    {certificate.category.replace('-', ' ')}
                  </Badge>
                </TableCell>
                <TableCell>{certificate.organization}</TableCell>
                <TableCell className="capitalize">{certificate.level}</TableCell>
                <TableCell>
                  <Badge variant={getStatusColor(certificate.status)}>
                    {certificate.status.replace('-', ' ')}
                  </Badge>
                </TableCell>
                <TableCell className="capitalize">{certificate.output}</TableCell>
                <TableCell>{formatDate(certificate.startDate)}</TableCell>
                <TableCell>{formatDate(certificate.endDate)}</TableCell>
                {isAdmin && <TableCell>{getUserName(certificate.userId)}</TableCell>}
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    {canEditCertificate(certificate) && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(certificate)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    )}
                    {canEditCertificate(certificate) && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="destructive"
                            disabled={deleteLoading === certificate.id}
                          >
                            {deleteLoading === certificate.id ? (
                              <Loader className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the certificate 
                              <strong> {certificate.certificateName}</strong>.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(certificate.id, certificate)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete Certificate
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
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
