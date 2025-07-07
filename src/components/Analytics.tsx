
import React, { useState, useEffect } from 'react';
import { getCompanyUsers } from '@/services/userService';
import { getUserCertificates } from '@/services/certificateService';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Users, Award, TrendingUp, Activity } from 'lucide-react';

const Analytics: React.FC = () => {
  const { userProfile } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCertificates: 0,
    activeCertificates: 0,
    expiredCertificates: 0
  });
  const [userCertData, setUserCertData] = useState<any[]>([]);
  const [statusData, setStatusData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [userProfile]);

  const loadAnalytics = async () => {
    if (!userProfile) return;

    try {
      // Get all users
      const users = await getCompanyUsers(userProfile.companyId);
      
      // Get all certificates for all users
      const allCertificates = [];
      const userCertCounts = [];
      
      for (const user of users) {
        try {
          const certificates = await getUserCertificates(user.id);
          allCertificates.push(...certificates);
          userCertCounts.push({
            name: user.name,
            certificates: certificates.length
          });
        } catch (error) {
          console.log(`Error loading certificates for user ${user.id}:`, error);
        }
      }

      // Calculate stats
      const activeCerts = allCertificates.filter(c => c.status === 'active').length;
      const expiredCerts = allCertificates.filter(c => c.status === 'expired').length;
      const pendingCerts = allCertificates.filter(c => c.status === 'pending').length;

      setStats({
        totalUsers: users.length,
        totalCertificates: allCertificates.length,
        activeCertificates: activeCerts,
        expiredCertificates: expiredCerts
      });

      // Sort users by certificate count
      setUserCertData(userCertCounts.sort((a, b) => b.certificates - a.certificates).slice(0, 5));

      // Status distribution
      setStatusData([
        { name: 'Active', value: activeCerts, color: '#10B981' },
        { name: 'Expired', value: expiredCerts, color: '#EF4444' },
        { name: 'Pending', value: pendingCerts, color: '#F59E0B' }
      ]);

    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
        <p className="text-gray-600">Overview of your company's certification data</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Company employees</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Certificates</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCertificates}</div>
            <p className="text-xs text-muted-foreground">All certificates</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Certificates</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.activeCertificates}</div>
            <p className="text-xs text-muted-foreground">Currently valid</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expired Certificates</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.expiredCertificates}</div>
            <p className="text-xs text-muted-foreground">Need renewal</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Users by Certificates */}
        <Card>
          <CardHeader>
            <CardTitle>Top Users by Certificates</CardTitle>
            <CardDescription>Users with the most certificates</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                certificates: {
                  label: "Certificates",
                  color: "#3B82F6",
                },
              }}
            >
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={userCertData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="certificates" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Certificate Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Certificate Status Distribution</CardTitle>
            <CardDescription>Breakdown of certificate statuses</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                active: {
                  label: "Active",
                  color: "#10B981",
                },
                expired: {
                  label: "Expired", 
                  color: "#EF4444",
                },
                pending: {
                  label: "Pending",
                  color: "#F59E0B",
                },
              }}
            >
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
