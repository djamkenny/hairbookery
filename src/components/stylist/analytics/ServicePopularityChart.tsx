
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, CartesianGrid } from "recharts";
import { ServiceBookingStats } from "@/services/analyticsService";
import { useIsMobile } from "@/hooks/use-mobile";

interface ServicePopularityChartProps {
  data: ServiceBookingStats[];
}

const ServicePopularityChart = ({ data }: ServicePopularityChartProps) => {
  const isMobile = useIsMobile();
  
  const chartConfig = {
    bookingCount: {
      label: "Bookings",
      color: "hsl(var(--primary))",
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Most Popular Services</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <ChartContainer config={chartConfig} className={`${isMobile ? 'h-[250px]' : 'h-[300px]'}`}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={data} 
                margin={{ 
                  top: 10, 
                  right: isMobile ? 5 : 20, 
                  left: isMobile ? -10 : 10, 
                  bottom: isMobile ? 60 : 40 
                }}
                barCategoryGap={isMobile ? "20%" : "30%"}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="serviceName" 
                  tick={{ 
                    fontSize: isMobile ? 10 : 12,
                    fill: "hsl(var(--muted-foreground))"
                  }}
                  angle={-45}
                  textAnchor="end"
                  height={isMobile ? 60 : 80}
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
                <Bar 
                  dataKey="bookingCount" 
                  fill="var(--color-bookingCount)"
                  radius={[4, 4, 0, 0]}
                  barSize={isMobile ? 30 : 40}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        ) : (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            No booking data available yet
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ServicePopularityChart;
