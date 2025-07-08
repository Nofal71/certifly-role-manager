
import React, { useState, useEffect } from 'react';
import { getMyCertificates } from '@/services/certificateService';
import { useAuth } from '@/contexts/AuthContext';
import { Certificate } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { FileText, TrendingUp, Clock, CheckCircle, User, Building } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCertificates();
  }, []);

  const loadCertificates = async () => {
    try {
      const certs = await getMyCertificates();
      setCertificates(certs);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load certificates');
    } finally {
      setLoading(false);
    }
  };

  const getStats = () => {
    const total = certificates.length;
    const completed = certificates.filter(c => c.status?.toLowerCase() === 'completed').length;
    const inProgress = certificates.filter(c => c.status?.toLowerCase() === 'in progress').length;
    const started = certificates.filter(c => c.status?.toLowerCase() === 'started').length;
    
    return { total, completed, inProgress, started };
  };

  const getRecentCertificates = () => {
    return certificates
      .sort((a, b) => new Date(b.startDate || 0).getTime() - new Date(a.startDate || 0).getTime())
      .slice(0, 5);
  };

  const getCompletionRate = () => {
    const stats = getStats();
    return stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
  };

  const stats = getStats();
  const recentCertificates = getRecentCertificates();
  const completionRate = getCompletionRate();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Welcome back!</h1>
          <p className="text-muted-foreground">
            Here's your certificate progress overview
          </p>
        </div>
      </div>

      {/* Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Email:</span>
              <span className="font-medium">{currentUser?.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Company:</span>
              <span className="font-medium">{currentUser?.company?.companyName}</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="capitalize">
                {currentUser?.role}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Certificates</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              All your certificates
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">
              Successfully completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
            <p className="text-xs text-muted-foreground">
              Currently working on
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completionRate}%</div>
            <Progress value={completionRate} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Recent Certificates */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Certificates</CardTitle>
          <CardDescription>
            Your latest certificate activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentCertificates.length > 0 ? (
              recentCertificates.map((cert) => (
                <div key={cert.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{cert.courseName}</h4>
                    <p className="text-sm text-muted-foreground">{cert.organization}</p>
                    {cert.startDate && (
                      <p className="text-xs text-muted-foreground">
                        Started: {new Date(cert.startDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {cert.level && (
                      <Badge variant="outline" className="capitalize">
                        {cert.level}
                      </Badge>
                    )}
                    {cert.status && (
                      <Badge variant={
                        cert.status.toLowerCase() === 'completed' ? 'default' :
                        cert.status.toLowerCase() === 'in progress' ? 'secondary' : 'outline'
                      }>
                        {cert.status}
                      </Badge>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-medium">No certificates yet</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Start by adding your first certificate to track your progress.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
