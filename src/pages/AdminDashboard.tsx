
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useSecurityMiddleware } from '@/hooks/useSecurityMiddleware';
import { secureAdminAuth } from '@/services/security/adminAuth';
import { adminDataService } from '@/services/adminData';
import { 
  Users, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Activity,
  UserCheck,
  MessageSquare,
  Settings,
  ArrowLeft,
  LogOut
} from 'lucide-react';
import { toast } from 'sonner';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { isAuthorized } = useSecurityMiddleware(true);
  const [dashboardData, setDashboardData] = useState({
    totalUsers: 0,
    totalBookings: 0,
    totalRevenue: 0,
    activeStylists: 0,
    recentActivity: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAuthorized) {
      fetchDashboardData();
    }
  }, [isAuthorized]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const data = await adminDataService.getDashboardOverview();
      setDashboardData(data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    secureAdminAuth.logout();
    navigate('/admin-login');
    toast.success('Logged out successfully');
  };

  if (isAuthorized === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Main Site
              </Button>
              <div>
                <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
                <p className="text-sm text-muted-foreground">
                  Welcome back, Administrator
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? '...' : dashboardData.totalUsers.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Registered users on platform
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? '...' : dashboardData.totalBookings.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                All-time appointments
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? '...' : `GH₵${dashboardData.totalRevenue.toLocaleString()}`}
              </div>
              <p className="text-xs text-muted-foreground">
                Platform revenue generated
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Stylists</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? '...' : dashboardData.activeStylists.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Currently available
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" 
                onClick={() => navigate('/customer-service-management')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Customer Service
              </CardTitle>
              <CardDescription>
                Manage support tickets and customer communications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                Open Customer Service
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => navigate('/admin-support')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Support Dashboard
              </CardTitle>
              <CardDescription>
                View support metrics and analytics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                View Support Dashboard
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                System Settings
              </CardTitle>
              <CardDescription>
                Configure platform settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" disabled>
                Coming Soon
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest system activities and notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded animate-pulse"></div>
                <div className="h-4 bg-muted rounded animate-pulse w-3/4"></div>
                <div className="h-4 bg-muted rounded animate-pulse w-1/2"></div>
              </div>
            ) : dashboardData.recentActivity.length === 0 ? (
              <p className="text-muted-foreground">No recent activity to display.</p>
            ) : (
              <div className="space-y-2">
                {dashboardData.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 rounded border">
                    <Activity className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{activity}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminDashboard;
