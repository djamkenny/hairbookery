
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { MonthlyBookingData } from "@/services/analyticsService";

interface MonthlyTrendsChartProps {
  data: MonthlyBookingData[];
}

const MonthlyTrendsChart = ({ data }: MonthlyTrendsChartProps) => {
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
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                />
                <Line 
                  type="monotone" 
                  dataKey="bookings" 
                  stroke="var(--color-bookings)"
                  strokeWidth={3}
                  dot={{ fill: "var(--color-bookings)", strokeWidth: 2, r: 4 }}
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
