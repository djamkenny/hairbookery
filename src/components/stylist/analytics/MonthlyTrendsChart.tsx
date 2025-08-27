
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, CartesianGrid } from "recharts";
import { MonthlyBookingData } from "@/services/analyticsService";
import { useIsMobile } from "@/hooks/use-mobile";

interface MonthlyTrendsChartProps {
  data: MonthlyBookingData[];
}

const MonthlyTrendsChart = ({ data }: MonthlyTrendsChartProps) => {
  const isMobile = useIsMobile();
  
  const chartConfig = {
    bookings: {
      label: "Bookings",
      color: "hsl(var(--primary))",
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Booking Trends</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <ChartContainer config={chartConfig} className={`${isMobile ? 'h-[250px]' : 'h-[300px]'}`}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart 
                data={data} 
                margin={{ 
                  top: 10, 
                  right: isMobile ? 5 : 20, 
                  left: isMobile ? -10 : 10, 
                  bottom: 10 
                }}
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
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                />
                <Line 
                  type="monotone" 
                  dataKey="bookings" 
                  stroke="var(--color-bookings)"
                  strokeWidth={isMobile ? 2 : 3}
                  dot={{ 
                    fill: "var(--color-bookings)", 
                    strokeWidth: 2, 
                    r: isMobile ? 3 : 4 
                  }}
                  activeDot={{ 
                    r: isMobile ? 4 : 6, 
                    fill: "var(--color-bookings)" 
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        ) : (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            No trend data available yet
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MonthlyTrendsChart;
