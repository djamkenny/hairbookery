
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useIsMobile } from "@/hooks/use-mobile";
import { useStylistRevenue } from "@/hooks/useStylistRevenue";
import { useStylistAnalytics } from "@/hooks/useStylistAnalytics";
import { supabase } from "@/integrations/supabase/client";
import { formatGHS } from "@/components/stylist/services/formatGHS";
import RealTimeBalance from "./RealTimeBalance";

const AnalyticsTab = () => {
  const isMobile = useIsMobile();
  const [user, setUser] = React.useState<any>(null);

  React.useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  const { revenueSummary, loading } = useStylistRevenue(user?.id);
  const { serviceStats, monthlyStats, loading: analyticsLoading } = useStylistAnalytics();

  // Mock data for Most Popular Services
  const servicesData = [
    { name: "Haircut", count: 18 },
    { name: "Coloring", count: 12 },
    { name: "Styling", count: 8 },
    { name: "Treatment", count: 6 }
  ];

  // Mock data for Monthly Booking Trends
  const monthlyData = [
    { month: "Jan", bookings: 15 },
    { month: "Feb", bookings: 22 },
    { month: "Mar", bookings: 18 },
    { month: "Apr", bookings: 28 },
    { month: "May", bookings: 24 },
    { month: "Jun", bookings: 32 }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl md:text-2xl font-semibold">Analytics Overview</h2>
      </div>

      {/* Revenue Summary Cards */}
      {user && (
        <div className="mb-6">
          <RealTimeBalance stylistId={user.id} />
        </div>
      )}

      {/* Revenue Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "Loading..." : formatGHS(revenueSummary.total_revenue)}
            </div>
            <p className="text-xs text-muted-foreground">All time earnings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "Loading..." : revenueSummary.total_bookings}
            </div>
            <p className="text-xs text-muted-foreground">Completed appointments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Booking Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "Loading..." : formatGHS(revenueSummary.avg_booking_value)}
            </div>
            <p className="text-xs text-muted-foreground">Per appointment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Service Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "Loading..." : formatGHS(revenueSummary.total_service_revenue)}
            </div>
            <p className="text-xs text-muted-foreground">From services only</p>
          </CardContent>
        </Card>
      </div>

      {/* Service Performance Details Table */}
      <Card>
        <CardHeader>
          <CardTitle className={`${isMobile ? 'text-lg' : 'text-xl'}`}>
            Service Performance Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          {analyticsLoading ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">Loading service data...</p>
            </div>
          ) : serviceStats && serviceStats.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead>Bookings</TableHead>
                    <TableHead>Total Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {serviceStats.map((service, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{service.serviceName}</TableCell>
                      <TableCell>{service.bookingCount}</TableCell>
                      <TableCell>{formatGHS(service.totalRevenue)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">No service performance data available yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Monthly Revenue & Bookings Table */}
      <Card>
        <CardHeader>
          <CardTitle className={`${isMobile ? 'text-lg' : 'text-xl'}`}>
            Monthly Revenue & Bookings
          </CardTitle>
        </CardHeader>
        <CardContent>
          {analyticsLoading ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">Loading monthly data...</p>
            </div>
          ) : monthlyStats && monthlyStats.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Month</TableHead>
                    <TableHead>Bookings</TableHead>
                    <TableHead>Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {monthlyStats.map((month, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{month.month}</TableCell>
                      <TableCell>{month.bookings}</TableCell>
                      <TableCell>{formatGHS(month.revenue)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">No monthly data available yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Charts Grid - Stack on mobile, side by side on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Popular Services Chart */}
        <Card className="w-full">
          <CardHeader className="pb-2">
            <CardTitle className={`${isMobile ? 'text-lg' : 'text-xl'}`}>
              Most Popular Services
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 md:p-6">
            <div className={`${isMobile ? 'h-[250px]' : 'h-[300px]'} w-full`}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={servicesData}
                  margin={{
                    top: 10,
                    right: isMobile ? 5 : 20,
                    left: isMobile ? -10 : 10,
                    bottom: isMobile ? 20 : 10
                  }}
                  barCategoryGap={isMobile ? "20%" : "30%"}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ 
                      fontSize: isMobile ? 10 : 12, 
                      fill: "hsl(var(--muted-foreground))" 
                    }}
                    axisLine={false}
                    tickLine={false}
                    angle={isMobile ? -45 : 0}
                    textAnchor={isMobile ? "end" : "middle"}
                    height={isMobile ? 60 : 40}
                  />
                  <YAxis 
                    tick={{ 
                      fontSize: isMobile ? 10 : 12, 
                      fill: "hsl(var(--muted-foreground))" 
                    }}
                    axisLine={false}
                    tickLine={false}
                    width={isMobile ? 20 : 40}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: isMobile ? "12px" : "14px",
                      padding: isMobile ? "8px" : "12px"
                    }}
                  />
                  <Bar 
                    dataKey="count" 
                    fill="hsl(var(--primary))" 
                    radius={[4, 4, 0, 0]}
                    barSize={isMobile ? 30 : 40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Booking Trends Chart */}
        <Card className="w-full">
          <CardHeader className="pb-2">
            <CardTitle className={`${isMobile ? 'text-lg' : 'text-xl'}`}>
              Monthly Booking Trends
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 md:p-6">
            <div className={`${isMobile ? 'h-[250px]' : 'h-[300px]'} w-full`}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={monthlyData}
                  margin={{
                    top: 10,
                    right: isMobile ? 5 : 20,
                    left: isMobile ? -10 : 10,
                    bottom: 10
                  }}
                  barCategoryGap={isMobile ? "20%" : "30%"}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ 
                      fontSize: isMobile ? 10 : 12, 
                      fill: "hsl(var(--muted-foreground))" 
                    }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ 
                      fontSize: isMobile ? 10 : 12, 
                      fill: "hsl(var(--muted-foreground))" 
                    }}
                    axisLine={false}
                    tickLine={false}
                    width={isMobile ? 20 : 40}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: isMobile ? "12px" : "14px",
                      padding: isMobile ? "8px" : "12px"
                    }}
                  />
                  <Bar 
                    dataKey="bookings" 
                    fill="hsl(var(--primary))" 
                    radius={[4, 4, 0, 0]}
                    barSize={isMobile ? 30 : 40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsTab;
