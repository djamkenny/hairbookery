
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  LogOut,
  Shield,
  Scissors,
  Star
} from "lucide-react";
import { adminAuth } from "@/services/adminAuth";
import { adminAnalytics, UserAnalytics, BookingAnalytics, StylistAnalytics, ServiceAnalytics } from "@/services/adminAnalytics";
import { toast } from "sonner";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [userAnalytics, setUserAnalytics] = useState<UserAnalytics | null>(null);
  const [bookingAnalytics, setBookingAnalytics] = useState<BookingAnalytics | null>(null);
  const [stylistAnalytics, setStylistAnalytics] = useState<StylistAnalytics | null>(null);
  const [serviceAnalytics, setServiceAnalytics] = useState<ServiceAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication
    if (!adminAuth.isAuthenticated()) {
      navigate("/admin-login");
      return;
    }

    // Load analytics data
    loadAnalytics();
  }, [navigate]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const [users, bookings, stylists, services] = await Promise.all([
        adminAnalytics.getUserAnalytics(),
        adminAnalytics.getBookingAnalytics(),
        adminAnalytics.getStylistAnalytics(),
        adminAnalytics.getServiceAnalytics()
      ]);

      setUserAnalytics(users);
      setBookingAnalytics(bookings);
      setStylistAnalytics(stylists);
      setServiceAnalytics(services);
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    adminAuth.logout();
    toast.success('Logged out successfully');
    navigate("/admin-login");
  };

  const currentAdmin = adminAuth.getCurrentAdmin();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Shield className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
                <p className="text-sm text-muted-foreground">
                  Welcome, {currentAdmin?.full_name}
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userAnalytics?.totalUsers || 0}</div>
              <p className="text-xs text-muted-foreground">
                {userAnalytics?.newUsersThisMonth || 0} new this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{bookingAnalytics?.totalBookings || 0}</div>
              <p className="text-xs text-muted-foreground">
                {bookingAnalytics?.bookingsThisMonth || 0} this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Platform Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                GH₵{bookingAnalytics?.totalRevenue?.toFixed(2) || '0.00'}
              </div>
              <p className="text-xs text-muted-foreground">
                From booking fees (20%)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Stylists</CardTitle>
              <Scissors className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userAnalytics?.totalStylists || 0}</div>
              <p className="text-xs text-muted-foreground">
                Total stylists registered
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Booking Status */}
          <Card>
            <CardHeader>
              <CardTitle>Booking Status Overview</CardTitle>
              <CardDescription>Current status of all bookings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Completed</span>
                  <span className="font-medium text-green-600">
                    {bookingAnalytics?.completedBookings || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Pending</span>
                  <span className="font-medium text-yellow-600">
                    {bookingAnalytics?.pendingBookings || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Canceled</span>
                  <span className="font-medium text-red-600">
                    {bookingAnalytics?.canceledBookings || 0}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>User Distribution</CardTitle>
              <CardDescription>Breakdown of user types</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Clients</span>
                  <span className="font-medium text-blue-600">
                    {userAnalytics?.totalClients || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Stylists</span>
                  <span className="font-medium text-purple-600">
                    {userAnalytics?.totalStylists || 0}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Performers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Stylists */}
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Stylists</CardTitle>
              <CardDescription>Based on total earnings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stylistAnalytics?.topStylists?.map((stylist, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm font-medium">{stylist.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">GH₵{stylist.earnings.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">{stylist.bookings} bookings</p>
                    </div>
                  </div>
                )) || (
                  <p className="text-sm text-muted-foreground">No data available</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Popular Services */}
          <Card>
            <CardHeader>
              <CardTitle>Popular Services</CardTitle>
              <CardDescription>Most booked services</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {serviceAnalytics?.popularServices?.map((service, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">{service.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{service.bookings} bookings</p>
                      <p className="text-xs text-muted-foreground">
                        GH₵{service.revenue.toFixed(2)} revenue
                      </p>
                    </div>
                  </div>
                )) || (
                  <p className="text-sm text-muted-foreground">No data available</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary Stats */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Platform Summary</CardTitle>
            <CardDescription>Overall platform performance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">
                  {((bookingAnalytics?.completedBookings || 0) / (bookingAnalytics?.totalBookings || 1) * 100).toFixed(1)}%
                </p>
                <p className="text-sm text-muted-foreground">Success Rate</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">
                  GH₵{stylistAnalytics?.averageEarnings?.toFixed(2) || '0.00'}
                </p>
                <p className="text-sm text-muted-foreground">Avg. Stylist Earnings</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">
                  {serviceAnalytics?.totalServices || 0}
                </p>
                <p className="text-sm text-muted-foreground">Total Services</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminDashboard;
