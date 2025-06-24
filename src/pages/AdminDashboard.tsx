import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  LogOut,
  Shield,
  Scissors,
  Star,
  Database
} from "lucide-react";
import { adminAuth } from "@/services/adminAuth";
import { adminAnalytics, UserAnalytics, BookingAnalytics, StylistAnalytics, ServiceAnalytics } from "@/services/adminAnalytics";
import { adminDataService, DetailedUser, DetailedAppointment, DetailedPayment } from "@/services/adminData";
import DataTables from "@/components/admin/DataTables";
import RevenueHistory from "@/components/admin/RevenueHistory";
import { toast } from "sonner";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [userAnalytics, setUserAnalytics] = useState<UserAnalytics | null>(null);
  const [bookingAnalytics, setBookingAnalytics] = useState<BookingAnalytics | null>(null);
  const [stylistAnalytics, setStylistAnalytics] = useState<StylistAnalytics | null>(null);
  const [serviceAnalytics, setServiceAnalytics] = useState<ServiceAnalytics | null>(null);
  const [users, setUsers] = useState<DetailedUser[]>([]);
  const [appointments, setAppointments] = useState<DetailedAppointment[]>([]);
  const [payments, setPayments] = useState<DetailedPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    // Check authentication
    if (!adminAuth.isAuthenticated()) {
      navigate("/admin-login");
      return;
    }

    // Load analytics data
    loadAnalytics();
    loadDetailedData();
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

  const loadDetailedData = async () => {
    try {
      setDataLoading(true);
      const [usersData, appointmentsData, paymentsData] = await Promise.all([
        adminDataService.getAllUsers(),
        adminDataService.getAllAppointments(),
        adminDataService.getAllPayments()
      ]);

      setUsers(usersData);
      setAppointments(appointmentsData);
      setPayments(paymentsData);
    } catch (error) {
      console.error('Error loading detailed data:', error);
      toast.error('Failed to load detailed data');
    } finally {
      setDataLoading(false);
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
      <div className="min-h-screen flex items-center justify-center p-4">
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
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-4 min-w-0">
              <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-primary flex-shrink-0" />
              <div className="min-w-0">
                <h1 className="text-lg sm:text-2xl font-semibold truncate">Admin Dashboard</h1>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">
                  Welcome, {currentAdmin?.full_name}
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout} size="sm" className="flex-shrink-0">
              <LogOut className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-4 sm:py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="revenue" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              <span className="hidden sm:inline">Revenue</span>
            </TabsTrigger>
            <TabsTrigger value="data" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              <span className="hidden sm:inline">All Data</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Overview Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
              <Card className="mobile-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="p-3 sm:p-6 pt-0">
                  <div className="text-lg sm:text-2xl font-bold">{userAnalytics?.totalUsers || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {userAnalytics?.newUsersThisMonth || 0} new this month
                  </p>
                </CardContent>
              </Card>

              <Card className="mobile-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">Total Bookings</CardTitle>
                  <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="p-3 sm:p-6 pt-0">
                  <div className="text-lg sm:text-2xl font-bold">{bookingAnalytics?.totalBookings || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {bookingAnalytics?.bookingsThisMonth || 0} this month
                  </p>
                </CardContent>
              </Card>

              <Card className="mobile-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">Platform Revenue</CardTitle>
                  <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="p-3 sm:p-6 pt-0">
                  <div className="text-lg sm:text-2xl font-bold">
                    GH₵{bookingAnalytics?.totalRevenue?.toFixed(2) || '0.00'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    From booking fees (20%)
                  </p>
                </CardContent>
              </Card>

              <Card className="mobile-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">Active Stylists</CardTitle>
                  <Scissors className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="p-3 sm:p-6 pt-0">
                  <div className="text-lg sm:text-2xl font-bold">{userAnalytics?.totalStylists || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Total stylists registered
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
              {/* Booking Status */}
              <Card className="mobile-card">
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">Booking Status Overview</CardTitle>
                  <CardDescription className="text-sm">Current status of all bookings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 sm:space-y-4">
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
              <Card className="mobile-card">
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">User Distribution</CardTitle>
                  <CardDescription className="text-sm">Breakdown of user types</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 sm:space-y-4">
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
              {/* Top Stylists */}
              <Card className="mobile-card">
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">Top Performing Stylists</CardTitle>
                  <CardDescription className="text-sm">Based on total earnings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 sm:space-y-4">
                    {stylistAnalytics?.topStylists?.map((stylist, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 min-w-0">
                          <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500 flex-shrink-0" />
                          <span className="text-sm font-medium truncate">{stylist.name}</span>
                        </div>
                        <div className="text-right flex-shrink-0">
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
              <Card className="mobile-card">
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">Popular Services</CardTitle>
                  <CardDescription className="text-sm">Most booked services</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 sm:space-y-4">
                    {serviceAnalytics?.popularServices?.map((service, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 min-w-0">
                          <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 flex-shrink-0" />
                          <span className="text-sm font-medium truncate">{service.name}</span>
                        </div>
                        <div className="text-right flex-shrink-0">
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
            <Card className="mobile-card">
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Platform Summary</CardTitle>
                <CardDescription className="text-sm">Overall platform performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                  <div className="text-center">
                    <p className="text-xl sm:text-2xl font-bold text-primary">
                      {((bookingAnalytics?.completedBookings || 0) / (bookingAnalytics?.totalBookings || 1) * 100).toFixed(1)}%
                    </p>
                    <p className="text-sm text-muted-foreground">Success Rate</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl sm:text-2xl font-bold text-primary">
                      GH₵{stylistAnalytics?.averageEarnings?.toFixed(2) || '0.00'}
                    </p>
                    <p className="text-sm text-muted-foreground">Avg. Stylist Earnings</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl sm:text-2xl font-bold text-primary">
                      {serviceAnalytics?.totalServices || 0}
                    </p>
                    <p className="text-sm text-muted-foreground">Total Services</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="revenue" className="space-y-6">
            <RevenueHistory />
          </TabsContent>

          <TabsContent value="data" className="space-y-6">
            <DataTables 
              users={users}
              appointments={appointments}
              payments={payments}
              loading={dataLoading}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
