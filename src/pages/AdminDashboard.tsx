
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
  LogOut,
  BarChart3,
  Shield,
  Database,
  Bell,
  FileText,
  CreditCard,
  Star,
  Clock,
  AlertCircle
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
    recentActivity: [],
    pendingTickets: 0,
    completedBookings: 0,
    avgRating: 0,
    monthlyGrowth: 0
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
      setDashboardData({
        ...data,
        pendingTickets: 12,
        completedBookings: 156,
        avgRating: 4.7,
        monthlyGrowth: 15.2
      });
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

  const adminActions = [
    {
      title: 'User Management',
      description: 'Manage users, stylists, and account settings',
      icon: Users,
      onClick: () => navigate('/admin/users'),
      color: 'bg-blue-500',
      disabled: true
    },
    {
      title: 'Booking Management',
      description: 'View and manage all bookings and appointments',
      icon: Calendar,
      onClick: () => navigate('/admin/bookings'),
      color: 'bg-green-500',
      disabled: true
    },
    {
      title: 'Financial Overview',
      description: 'Revenue tracking, payments, and analytics',
      icon: DollarSign,
      onClick: () => navigate('/admin/finance'),
      color: 'bg-yellow-500',
      disabled: true
    },
    {
      title: 'Customer Service',
      description: 'Manage support tickets and customer communications',
      icon: MessageSquare,
      onClick: () => navigate('/customer-service-management'),
      color: 'bg-purple-500',
      disabled: false
    },
    {
      title: 'Support Dashboard',
      description: 'Advanced support analytics and metrics',
      icon: Activity,
      onClick: () => navigate('/admin-support'),
      color: 'bg-indigo-500',
      disabled: false
    },
    {
      title: 'Analytics & Reports',
      description: 'Business intelligence and reporting tools',
      icon: BarChart3,
      onClick: () => navigate('/admin/analytics'),
      color: 'bg-orange-500',
      disabled: true
    },
    {
      title: 'Security Center',
      description: 'Security settings and access controls',
      icon: Shield,
      onClick: () => navigate('/admin/security'),
      color: 'bg-red-500',
      disabled: true
    },
    {
      title: 'System Settings',
      description: 'Platform configuration and preferences',
      icon: Settings,
      onClick: () => navigate('/admin/settings'),
      color: 'bg-gray-500',
      disabled: true
    }
  ];

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
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Notifications
              </Button>
              <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2">
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-6">
        {/* Key Metrics Overview */}
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
                +12% from last month
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
                +8% from last month
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
                +{dashboardData.monthlyGrowth}% from last month
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

        {/* Secondary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Tickets</CardTitle>
              <AlertCircle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {dashboardData.pendingTickets}
              </div>
              <p className="text-xs text-muted-foreground">
                Requires attention
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
              <Clock className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {dashboardData.completedBookings}
              </div>
              <p className="text-xs text-muted-foreground">
                Appointments finished
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
              <Star className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {dashboardData.avgRating}
              </div>
              <p className="text-xs text-muted-foreground">
                Customer satisfaction
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                +{dashboardData.monthlyGrowth}%
              </div>
              <p className="text-xs text-muted-foreground">
                Monthly growth
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Admin Actions Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Admin Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {adminActions.map((action, index) => (
              <Card 
                key={index}
                className={`cursor-pointer hover:shadow-lg transition-all duration-200 ${
                  action.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
                }`}
                onClick={action.disabled ? undefined : action.onClick}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${action.color} text-white`}>
                      <action.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-base">{action.title}</CardTitle>
                      {action.disabled && (
                        <span className="text-xs text-muted-foreground">Coming Soon</span>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription className="text-sm">
                    {action.description}
                  </CardDescription>
                  <Button 
                    className="w-full mt-3" 
                    variant={action.disabled ? "secondary" : "default"}
                    disabled={action.disabled}
                  >
                    {action.disabled ? "Coming Soon" : "Open"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Activity
              </CardTitle>
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
                <div className="space-y-3">
                  {dashboardData.recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30">
                      <Activity className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <span className="text-sm">{activity}</span>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date().toLocaleTimeString()} - Just now
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Quick Statistics
              </CardTitle>
              <CardDescription>
                System performance and usage metrics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Payment Success Rate</span>
                </div>
                <span className="text-sm font-bold text-green-600">98.5%</span>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">Avg Response Time</span>
                </div>
                <span className="text-sm font-bold text-blue-600">2.3 min</span>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-purple-500" />
                  <span className="text-sm font-medium">Active Sessions</span>
                </div>
                <span className="text-sm font-bold text-purple-600">1,247</span>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-medium">Server Uptime</span>
                </div>
                <span className="text-sm font-bold text-orange-600">99.9%</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
