import React, { useState, useEffect } from 'react';
import { getAllCertificates, getMyCertificates, createCertificate, updateCertificate, deleteCertificate } from '@/services/certificateService';
import { getAllEmployees } from '@/services/employeeService';
import { useAuth } from '@/contexts/AuthContext';
import { Certificate, Employee } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { FileText, Edit, Trash2, Loader, ExternalLink, Plus } from 'lucide-react';

const Certificates: React.FC = () => {
  const { currentUser, isAdmin } = useAuth();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCertificate, setEditingCertificate] = useState<Certificate | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    courseName: '',
    courseLink: '',
    organization: '',
    certificateName: '',
    level: '',
    startDate: '',
    endDate: '',
    status: '',
    demo: '',
    userId: currentUser?.id || 0
  });

  useEffect(() => {
    loadCertificates();
    if (isAdmin()) {
      loadEmployees();
    }
  }, [currentUser]);

  const loadCertificates = async () => {
    try {
      let certs;
      if (isAdmin()) {
        certs = await getAllCertificates();
      } else {
        certs = await getMyCertificates();
      }
      setCertificates(certs);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load certificates');
    } finally {
      setLoading(false);
    }
  };

  const loadEmployees = async () => {
    try {
      const employeeList = await getAllEmployees();
      setEmployees(employeeList);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load employees');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveLoading(true);

    try {
      const certificateData = {
        ...formData,
        userId: isAdmin() ? formData.userId : currentUser?.id || 0,
        startDate: formData.startDate ? new Date(formData.startDate) : undefined,
        endDate: formData.endDate ? new Date(formData.endDate) : undefined
      };

      if (editingCertificate) {
        await updateCertificate(editingCertificate.id, certificateData);
        toast.success('Certificate updated successfully');
      } else {
        await createCertificate(certificateData);
        toast.success('Certificate added successfully');
      }

      setDialogOpen(false);
      setEditingCertificate(null);
      resetForm();
      loadCertificates();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save certificate');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleEdit = (certificate: Certificate) => {
    if (!canEditCertificate(certificate)) {
      toast.error('You do not have permission to edit this certificate');
      return;
    }

    setEditingCertificate(certificate);
    setFormData({
      courseName: certificate.courseName,
      courseLink: certificate.courseLink || '',
      organization: certificate.organization || '',
      certificateName: certificate.certificateName || '',
      level: certificate.level || '',
      startDate: certificate.startDate ? new Date(certificate.startDate).toISOString().split('T')[0] : '',
      endDate: certificate.endDate ? new Date(certificate.endDate).toISOString().split('T')[0] : '',
      status: certificate.status || '',
      demo: certificate.demo || '',
      userId: certificate.userId
    });
    setDialogOpen(true);
  };

  const handleDelete = async (certificateId: number, certificate: Certificate) => {
    if (!canEditCertificate(certificate)) {
      toast.error('You do not have permission to delete this certificate');
      return;
    }

    setDeleteLoading(certificateId);
    try {
      await deleteCertificate(certificateId);
      toast.success('Certificate deleted successfully');
      loadCertificates();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete certificate');
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
      status: '',
      demo: '',
      userId: currentUser?.id || 0
    });
  };

  const canEditCertificate = (certificate: Certificate) => {
    return isAdmin() || certificate.userId === currentUser?.id;
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'default';
      case 'in progress': return 'secondary';
      case 'started': return 'outline';
      case 'other': return 'destructive';
      default: return 'outline';
    }
  };

  const getCategoryColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'advance': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getEmployeeName = (userId: number) => {
    const employee = employees.find(e => e.user.id === userId);
    return employee ? employee.fullName : 'Unknown Employee';
  };

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
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
            {isAdmin() ? 'Manage all company certificates' : 'Manage your certificates'}
          </p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setEditingCertificate(null); }}>
              <Plus className="w-4 h-4 mr-2" />
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
                  <Label htmlFor="organization">Organization</Label>
                  <Input
                    id="organization"
                    value={formData.organization}
                    onChange={(e) => setFormData(prev => ({ ...prev, organization: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="certificateName">Certificate Name</Label>
                  <Input
                    id="certificateName"
                    value={formData.certificateName}
                    onChange={(e) => setFormData(prev => ({ ...prev, certificateName: e.target.value }))}
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
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advance">Advance</SelectItem>
                    </SelectContent>
                  </Select>
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
                      <SelectItem value="Started">Started</SelectItem>
                      <SelectItem value="In progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
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
                <Label htmlFor="demo">Output</Label>
                <Select
                  value={formData.demo}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, demo: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select output type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="demo">Demo</SelectItem>
                    <SelectItem value="certificate">Certificate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {isAdmin() && (
                <div className="space-y-2">
                  <Label htmlFor="userId">Assign to Employee</Label>
                  <Select
                    value={formData.userId.toString()}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, userId: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((employee) => (
                        <SelectItem key={employee.id} value={employee.user.id.toString()}>
                          {employee.fullName} ({employee.user.email})
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
        <ScrollArea className="w-full">
          <div className="min-w-[1200px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px]">Course Name</TableHead>
                  <TableHead className="min-w-[200px]">Certificate Name</TableHead>
                  <TableHead className="min-w-[150px]">Organization</TableHead>
                  <TableHead className="min-w-[100px]">Level</TableHead>
                  <TableHead className="min-w-[120px]">Status</TableHead>
                  <TableHead className="min-w-[100px]">Output</TableHead>
                  <TableHead className="min-w-[120px]">Start Date</TableHead>
                  <TableHead className="min-w-[120px]">End Date</TableHead>
                  {isAdmin() && <TableHead className="min-w-[150px]">Employee</TableHead>}
                  <TableHead className="text-right min-w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {certificates.map((certificate) => (
                  <TableRow key={certificate.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-2">
                        <span className="truncate">{certificate.courseName}</span>
                        {certificate.courseLink && (
                          <a 
                            href={certificate.courseLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:text-primary/80"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{certificate.certificateName}</TableCell>
                    <TableCell>{certificate.organization}</TableCell>
                    <TableCell>
                      {certificate.level && (
                        <Badge className={getCategoryColor(certificate.level)}>
                          {certificate.level}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {certificate.status && (
                        <Badge variant={getStatusColor(certificate.status)}>
                          {certificate.status}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="capitalize">{certificate.demo}</TableCell>
                    <TableCell>{formatDate(certificate.startDate)}</TableCell>
                    <TableCell>{formatDate(certificate.endDate)}</TableCell>
                    {isAdmin() && <TableCell>{getEmployeeName(certificate.userId)}</TableCell>}
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
                                  <strong> {certificate.certificateName || certificate.courseName}</strong>.
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
        </ScrollArea>
      </div>
      
      {certificates.length === 0 && (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
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
