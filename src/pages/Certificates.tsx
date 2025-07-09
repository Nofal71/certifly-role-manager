
import React, { useState, useEffect } from 'react';
import { getAllCertificates, getMyCertificates, createCertificate, updateCertificate, deleteCertificate, getAllUsers } from '@/services/certificateService';
import { useAuth } from '@/contexts/AuthContext';
import { Certificate } from '@/types';
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
import { Award, Plus, Trash2, Loader, Edit, ExternalLink } from 'lucide-react';

const Certificates: React.FC = () => {
  const { currentUser, isAdmin } = useAuth();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCertificate, setEditingCertificate] = useState<Certificate | null>(null);
  const [createLoading, setCreateLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);
  const [updateLoading, setUpdateLoading] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    courseName: '',
    courseLink: '',
    organization: '',
    certificateName: '',
    level: '',
    startDate: '',
    endDate: '',
    status: 'In Progress',
    demo: '',
    userId: ''
  });

  useEffect(() => {
    loadCertificates();
    if (isAdmin()) {
      loadUsers();
    }
  }, [isAdmin]);

  const loadCertificates = async () => {
    try {
      let certificateList;
      if (isAdmin()) {
        certificateList = await getAllCertificates();
      } else {
        certificateList = await getMyCertificates();
      }
      setCertificates(certificateList);
    } catch (error: any) {
      toast.error(error.message || "Failed to load certificates");
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const userList = await getAllUsers();
      setUsers(userList);
    } catch (error: any) {
      toast.error(error.message || "Failed to load users");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingCertificate) {
      setUpdateLoading(editingCertificate.id);
    } else {
      setCreateLoading(true);
    }

    try {
      const submitData = {
        ...formData,
        startDate: formData.startDate ? new Date(formData.startDate) : undefined,
        endDate: formData.endDate ? new Date(formData.endDate) : undefined,
        userId: isAdmin() && formData.userId ? parseInt(formData.userId) : undefined,
      };

      // Remove userId from submitData if it's undefined or empty
      if (!submitData.userId) {
        delete submitData.userId;
      }

      if (editingCertificate) {
        await updateCertificate(editingCertificate.id, submitData);
        toast.success("Certificate updated successfully!");
      } else {
        await createCertificate(submitData);
        toast.success("Certificate created successfully!");
      }
      setDialogOpen(false);
      setEditingCertificate(null);
      resetForm();
      loadCertificates();
    } catch (error: any) {
      toast.error(error.message || "Failed to save certificate");
    } finally {
      if (editingCertificate) {
        setUpdateLoading(null);
      } else {
        setCreateLoading(false);
      }
    }
  };

  const handleEdit = (certificate: Certificate) => {
    setEditingCertificate(certificate);
    setFormData({
      courseName: certificate.courseName,
      courseLink: certificate.courseLink || '',
      organization: certificate.organization || '',
      certificateName: certificate.certificateName || '',
      level: certificate.level || '',
      startDate: certificate.startDate ? new Date(certificate.startDate).toISOString().split('T')[0] : '',
      endDate: certificate.endDate ? new Date(certificate.endDate).toISOString().split('T')[0] : '',
      status: certificate.status || 'In Progress',
      demo: certificate.demo || '',
      userId: certificate.userId?.toString() || ''
    });
    setDialogOpen(true);
  };

  const handleDeleteCertificate = async (certificateId: number) => {
    setDeleteLoading(certificateId);
    try {
      await deleteCertificate(certificateId);
      toast.success("Certificate deleted successfully");
      loadCertificates();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete certificate");
    } finally {
      setDeleteLoading(null);
    }
  };

  const resetForm = () => {
    setFormData({
      courseName: '',
      courseLink: '',
      organization: '',
      certificateName: '',
      level: '',
      startDate: '',
      endDate: '',
      status: 'In Progress',
      demo: '',
      userId: ''
    });
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'in progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'not started':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

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
          <h1 className="text-3xl font-bold">Certificates</h1>
          <p className="text-muted-foreground">
            {isAdmin() ? 'Manage all certificates' : 'Track and manage your professional certifications'}
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setEditingCertificate(null); }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Certificate
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingCertificate ? 'Edit Certificate' : 'Add New Certificate'}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              {isAdmin() && (
                <div className="space-y-2">
                  <Label htmlFor="userId">Select User *</Label>
                  <Select
                    value={formData.userId}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, userId: value }))}
                    required={!editingCertificate}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a user" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.userId} value={user.userId.toString()}>
                          {user.fullName} ({user.user.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="courseName">Course Name *</Label>
                  <Input
                    id="courseName"
                    value={formData.courseName}
                    onChange={(e) => setFormData(prev => ({ ...prev, courseName: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="organization">Organization</Label>
                  <Input
                    id="organization"
                    value={formData.organization}
                    onChange={(e) => setFormData(prev => ({ ...prev, organization: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="certificateName">Certificate Name</Label>
                  <Input
                    id="certificateName"
                    value={formData.certificateName}
                    onChange={(e) => setFormData(prev => ({ ...prev, certificateName: e.target.value }))}
                  />
                </div>

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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Not Started">Not Started</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="demo">Demo/Notes</Label>
                <Textarea
                  id="demo"
                  value={formData.demo}
                  onChange={(e) => setFormData(prev => ({ ...prev, demo: e.target.value }))}
                  placeholder="Add any notes or demo information..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createLoading || updateLoading === editingCertificate?.id}>
                  {(createLoading || updateLoading === editingCertificate?.id) && (
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  {editingCertificate ? 'Update Certificate' : 'Add Certificate'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[150px]">Course Name</TableHead>
              <TableHead className="min-w-[120px]">Organization</TableHead>
              <TableHead className="min-w-[120px]">Certificate</TableHead>
              <TableHead className="min-w-[100px]">Level</TableHead>
              <TableHead className="min-w-[100px]">Start Date</TableHead>
              <TableHead className="min-w-[100px]">End Date</TableHead>
              <TableHead className="min-w-[100px]">Status</TableHead>
              <TableHead className="min-w-[80px]">Course Link</TableHead>
              {isAdmin() && <TableHead className="min-w-[120px]">User</TableHead>}
              <TableHead className="text-right min-w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {certificates.map((certificate) => (
              <TableRow key={certificate.id}>
                <TableCell className="font-medium">{certificate.courseName}</TableCell>
                <TableCell>{certificate.organization || '-'}</TableCell>
                <TableCell>{certificate.certificateName || '-'}</TableCell>
                <TableCell>{certificate.level || '-'}</TableCell>
                <TableCell>
                  {certificate.startDate
                    ? new Date(certificate.startDate).toLocaleDateString()
                    : '-'
                  }
                </TableCell>
                <TableCell>
                  {certificate.endDate
                    ? new Date(certificate.endDate).toLocaleDateString()
                    : '-'
                  }
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(certificate.status || 'Not Started')}>
                    {certificate.status || 'Not Started'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {certificate.courseLink ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(certificate.courseLink, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  ) : '-'}
                </TableCell>
                {isAdmin() && (
                  <TableCell>
                    {users.find(user => user.userId === certificate.userId)?.fullName || 'Unknown User'}
                  </TableCell>
                )}
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(certificate)}
                      disabled={updateLoading === certificate.id}
                    >
                      {updateLoading === certificate.id ? (
                        <Loader className="w-4 h-4 animate-spin" />
                      ) : (
                        <Edit className="w-4 h-4" />
                      )}
                    </Button>
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
                            <strong> {certificate.courseName}</strong> and remove it from our records.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteCertificate(certificate.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete Certificate
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {certificates.length === 0 && (
        <div className="text-center py-12">
          <Award className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-sm font-medium">No certificates</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Get started by adding your first certificate.
          </p>
        </div>
      )}
    </div>
  );
};

export default Certificates;
