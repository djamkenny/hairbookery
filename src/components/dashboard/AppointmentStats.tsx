
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useIsMobile } from "@/hooks/use-mobile";

interface AppointmentStatsProps {
  pastAppointments: number;
  upcomingAppointments: number;
}

const AppointmentStats = ({ pastAppointments, upcomingAppointments }: AppointmentStatsProps) => {
  const isMobile = useIsMobile();
  
  // Create data for the chart - include current month data from props
  const data = [
    { month: "Jan", appointments: 2 },
    { month: "Feb", appointments: 3 },
    { month: "Mar", appointments: 1 },
    { month: "Apr", appointments: 4 },
    { month: "May", appointments: pastAppointments },
    { month: "Jun", appointments: upcomingAppointments },
  ];

  // For mobile, show only the last 3 months
  const mobileData = data.slice(-3);

  return (
    <Card className="border border-border/30">
      <CardHeader className="pb-2">
        <CardTitle className="text-base md:text-lg">Appointment History</CardTitle>
      </CardHeader>
      <CardContent className="h-[200px] md:h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={isMobile ? mobileData : data} 
            margin={{ 
              top: 10, 
              right: 10, 
              left: isMobile ? -10 : -20, 
              bottom: 0 
            }}
          >
            <XAxis 
              dataKey="month" 
              axisLine={false} 
              tickLine={false}
              tick={{ fontSize: isMobile ? 10 : 12 }}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false}
              tick={{ fontSize: isMobile ? 10 : 12 }}
              width={isMobile ? 20 : 30}
            />
            <Tooltip 
              contentStyle={{ 
                background: "var(--background)", 
                border: "1px solid var(--border)",
                borderRadius: "8px",
                fontSize: isMobile ? "12px" : "14px"
              }} 
            />
            <Bar 
              dataKey="appointments" 
              fill="var(--primary)" 
              radius={[4, 4, 0, 0]} 
              barSize={isMobile ? 20 : 30}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default AppointmentStats;
