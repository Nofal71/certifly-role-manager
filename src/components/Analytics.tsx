
import React, { useState, useEffect } from 'react';
import { getAllCertificates, getMyCertificates } from '@/services/certificateService';
import { getAllEmployees } from '@/services/employeeService';
import { useAuth } from '@/contexts/AuthContext';
import { Certificate, Employee } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, Award, TrendingUp, BookOpen } from 'lucide-react';

const Analytics: React.FC = () => {
  const { currentUser } = useAuth();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const loadData = async () => {
    if (!currentUser) return;
    
    try {
      let certsData;
      if (currentUser.role?.toLowerCase() === 'admin') {
        certsData = await getAllCertificates();
        const employeesData = await getAllEmployees();
        setEmployees(employeesData);
      } else {
        certsData = await getMyCertificates();
      }
      setCertificates(certsData);
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCertificatesByLevel = () => {
    const levelCount: { [key: string]: number } = {};
    certificates.forEach(cert => {
      const level = cert.level || 'Unknown';
      levelCount[level] = (levelCount[level] || 0) + 1;
    });
    
    return Object.entries(levelCount).map(([name, count]) => ({
      name,
      count
    }));
  };

  const getCertificatesByStatus = () => {
    const statusCount: { [key: string]: number } = {};
    certificates.forEach(cert => {
      const status = cert.status || 'Unknown';
      statusCount[status] = (statusCount[status] || 0) + 1;
    });
    
    return Object.entries(statusCount).map(([name, count]) => ({
      name,
      count
    }));
  };

  const getEmployeesWithMostCertificates = () => {
    const userCertCount: { [key: number]: number } = {};
    certificates.forEach(cert => {
      userCertCount[cert.userId] = (userCertCount[cert.userId] || 0) + 1;
    });
    
    return Object.entries(userCertCount)
      .map(([userId, count]) => {
        const employee = employees.find(e => e.user.id === parseInt(userId));
        return {
          name: employee ? employee.fullName : 'Unknown Employee',
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
  const inProgressCertificates = certificates.filter(cert => cert.status === 'In progress').length;
  const totalEmployees = employees.length;

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
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEmployees}</div>
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
            <CardTitle>Certificates by Level</CardTitle>
            <CardDescription>Distribution of certificates across different levels</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getCertificatesByLevel()}>
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

      {/* Top Employees */}
      {employees.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Employees by Certificates</CardTitle>
            <CardDescription>Employees with the most certificates</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getEmployeesWithMostCertificates()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="certificates" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Analytics;
