
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
  const hasHistory = pastAppointments > 0 || upcomingAppointments > 0;
  
  // Create data for the chart - include current month data from props
  const data = [
    { month: "Jan", appointments: 0 },
    { month: "Feb", appointments: 0 },
    { month: "Mar", appointments: 0 },
    { month: "Apr", appointments: 0 },
    { month: "May", appointments: pastAppointments },
    { month: "Jun", appointments: upcomingAppointments },
  ];

  // For mobile, show only the last 3 months
  const mobileData = data.slice(-3);

  return (
    <Card className="border border-border/30">
      <CardHeader className="pb-1 md:pb-2">
        <CardTitle className="text-sm md:text-base lg:text-lg">Appointment History</CardTitle>
      </CardHeader>
      <CardContent className="h-[180px] md:h-[220px]">
        {hasHistory ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={isMobile ? mobileData : data} 
              margin={{ 
                top: 10, 
                right: 10, 
                left: isMobile ? -18 : -20, 
                bottom: 0 
              }}
            >
              <XAxis 
                dataKey="month" 
                axisLine={false} 
                tickLine={false}
                tick={{ fontSize: isMobile ? 9 : 12 }}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false}
                tick={{ fontSize: isMobile ? 9 : 12 }}
                width={isMobile ? 15 : 30}
              />
              <Tooltip 
                contentStyle={{ 
                  background: "var(--background)", 
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  fontSize: isMobile ? "11px" : "14px",
                  padding: isMobile ? "4px 8px" : "8px 12px"
                }}
              />
              <Bar 
                dataKey="appointments" 
                fill="var(--primary)" 
                radius={[4, 4, 0, 0]} 
                barSize={isMobile ? 16 : 30}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground text-center text-sm md:text-base">
              No appointment history available yet.<br />
              Book your first appointment to see stats.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AppointmentStats;
