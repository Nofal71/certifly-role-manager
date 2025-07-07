
import React, { useState, useEffect } from 'react';
import { getCertificates } from '@/services/certificateService';
import { getCompanyUsers } from '@/services/userService';
import { useAuth } from '@/contexts/AuthContext';
import { Certificate, User } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, Award, TrendingUp, BookOpen } from 'lucide-react';

const Analytics: React.FC = () => {
  const { userProfile } = useAuth();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [userProfile]);

  const loadData = async () => {
    if (!userProfile) return;
    
    try {
      const [certsData, usersData] = await Promise.all([
        getCertificates(userProfile.id, userProfile.companyId, true),
        getCompanyUsers(userProfile.companyId)
      ]);
      
      setCertificates(certsData);
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCertificatesByCategory = () => {
    const categoryCount: { [key: string]: number } = {};
    certificates.forEach(cert => {
      const category = cert.category.replace('-', ' ');
      categoryCount[category] = (categoryCount[category] || 0) + 1;
    });
    
    return Object.entries(categoryCount).map(([name, count]) => ({
      name,
      count
    }));
  };

  const getCertificatesByStatus = () => {
    const statusCount: { [key: string]: number } = {};
    certificates.forEach(cert => {
      const status = cert.status.replace('-', ' ');
      statusCount[status] = (statusCount[status] || 0) + 1;
    });
    
    return Object.entries(statusCount).map(([name, count]) => ({
      name,
      count
    }));
  };

  const getUsersWithMostCertificates = () => {
    const userCertCount: { [key: string]: number } = {};
    certificates.forEach(cert => {
      userCertCount[cert.userId] = (userCertCount[cert.userId] || 0) + 1;
    });
    
    return Object.entries(userCertCount)
      .map(([userId, count]) => {
        const user = users.find(u => u.id === userId);
        return {
          name: user ? user.name : 'Unknown User',
          certificates: count
        };
      })
      .sort((a, b) => b.certificates - a.certificates)
      .slice(0, 5);
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const totalCertificates = certificates.length;
  const completedCertificates = certificates.filter(cert => cert.status === 'completed').length;
  const inProgressCertificates = certificates.filter(cert => cert.status === 'in-progress').length;
  const totalUsers = users.length;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="text-gray-600">Overview of your company's certificate management</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Active employees
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Certificates</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCertificates}</div>
            <p className="text-xs text-muted-foreground">
              All certificates
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedCertificates}</div>
            <p className="text-xs text-muted-foreground">
              Completed certificates
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressCertificates}</div>
            <p className="text-xs text-muted-foreground">
              Ongoing certificates
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Certificates by Category</CardTitle>
            <CardDescription>Distribution of certificates across different categories</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getCertificatesByCategory()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Certificate Status Distribution</CardTitle>
            <CardDescription>Current status of all certificates</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={getCertificatesByStatus()}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {getCertificatesByStatus().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Users */}
      <Card>
        <CardHeader>
          <CardTitle>Top Users by Certificates</CardTitle>
          <CardDescription>Users with the most certificates</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={getUsersWithMostCertificates()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="certificates" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;
