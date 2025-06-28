
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useIsMobile } from "@/hooks/use-mobile";

const AnalyticsTab = () => {
  const isMobile = useIsMobile();

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
