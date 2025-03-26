
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const StylistAppointmentsTab = () => {
  // Sample data - would be replaced with real data from API/database
  const upcomingAppointments = [
    { 
      id: 1, 
      client: "Emma Johnson", 
      service: "Haircut & Styling", 
      date: "July 15, 2023", 
      time: "10:00 AM", 
      status: "confirmed" 
    },
    { 
      id: 2, 
      client: "Michael Smith", 
      service: "Hair Coloring", 
      date: "July 18, 2023", 
      time: "2:30 PM", 
      status: "confirmed" 
    },
    { 
      id: 3, 
      client: "Sophia Davis", 
      service: "Full Highlights", 
      date: "July 20, 2023", 
      time: "11:15 AM", 
      status: "pending" 
    }
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Appointments</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {upcomingAppointments.map((appointment) => (
                <TableRow key={appointment.id}>
                  <TableCell className="font-medium">{appointment.client}</TableCell>
                  <TableCell>{appointment.service}</TableCell>
                  <TableCell>{appointment.date}</TableCell>
                  <TableCell>{appointment.time}</TableCell>
                  <TableCell>
                    <Badge variant={appointment.status === "confirmed" ? "default" : "secondary"}>
                      {appointment.status === "confirmed" ? "Confirmed" : "Pending"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">Details</Button>
                      {appointment.status === "pending" && (
                        <Button size="sm">Confirm</Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default StylistAppointmentsTab;
