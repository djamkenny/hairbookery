
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface User {
  id: string;
  full_name: string;
  email: string;
  is_stylist: boolean;
  created_at: string;
}

interface Appointment {
  id: string;
  order_id: string;
  client_name: string;
  stylist_name: string;
  service_name: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  created_at: string;
}

interface Payment {
  id: string;
  amount: number;
  status: string;
  user_name: string;
  service_name: string;
  created_at: string;
}

interface DataTablesProps {
  users: User[];
  appointments: Appointment[];
  payments: Payment[];
  loading: boolean;
}

const DataTables: React.FC<DataTablesProps> = ({ users, appointments, payments, loading }) => {
  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="h-4 bg-gray-200 rounded"></div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const colors = {
      completed: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      canceled: "bg-red-100 text-red-800",
      confirmed: "bg-blue-100 text-blue-800"
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-6">
      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">All Users</CardTitle>
          <CardDescription>Complete list of registered users</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.full_name || 'No name'}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={user.is_stylist ? "default" : "secondary"}>
                        {user.is_stylist ? 'Stylist' : 'Client'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(user.created_at), 'MMM dd, yyyy')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Appointments Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">All Appointments</CardTitle>
          <CardDescription>Complete list of appointments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Stylist</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell className="font-mono text-sm">
                      {appointment.order_id || 'N/A'}
                    </TableCell>
                    <TableCell>{appointment.client_name || 'Unknown'}</TableCell>
                    <TableCell>{appointment.stylist_name || 'Unknown'}</TableCell>
                    <TableCell>{appointment.service_name || 'Unknown'}</TableCell>
                    <TableCell>
                      {format(new Date(appointment.appointment_date), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>{appointment.appointment_time}</TableCell>
                    <TableCell>
                      <Badge className={getStatusBadge(appointment.status)}>
                        {appointment.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">All Payments</CardTitle>
          <CardDescription>Complete list of payment transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Amount</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">
                      GH₵{(payment.amount / 100).toFixed(2)}
                    </TableCell>
                    <TableCell>{payment.user_name || 'Unknown'}</TableCell>
                    <TableCell>{payment.service_name || 'Unknown'}</TableCell>
                    <TableCell>
                      <Badge className={getStatusBadge(payment.status)}>
                        {payment.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(payment.created_at), 'MMM dd, yyyy')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataTables;
