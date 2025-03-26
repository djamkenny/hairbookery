
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface AppointmentStatsProps {
  pastAppointments: number;
  upcomingAppointments: number;
}

const AppointmentStats = ({ pastAppointments, upcomingAppointments }: AppointmentStatsProps) => {
  // Create sample data for the chart
  const data = [
    { month: "Jan", appointments: 2 },
    { month: "Feb", appointments: 3 },
    { month: "Mar", appointments: 1 },
    { month: "Apr", appointments: 4 },
    { month: "May", appointments: pastAppointments },
    { month: "Jun", appointments: upcomingAppointments },
  ];

  return (
    <Card className="border border-border/30">
      <CardHeader>
        <CardTitle className="text-lg">Appointment History</CardTitle>
      </CardHeader>
      <CardContent className="h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis dataKey="month" axisLine={false} tickLine={false} />
            <YAxis axisLine={false} tickLine={false} />
            <Tooltip 
              contentStyle={{ 
                background: "var(--background)", 
                border: "1px solid var(--border)",
                borderRadius: "8px" 
              }} 
            />
            <Bar 
              dataKey="appointments" 
              fill="var(--primary)" 
              radius={[4, 4, 0, 0]} 
              barSize={30}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default AppointmentStats;
