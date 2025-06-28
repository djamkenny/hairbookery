
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ServiceBookingStats } from "@/services/analyticsService";
import { formatGHS } from "@/components/stylist/services/formatGHS";
import { useIsMobile } from "@/hooks/use-mobile";

interface ServicePerformanceTableProps {
  serviceStats: ServiceBookingStats[];
  loading: boolean;
}

const ServicePerformanceTable = ({ serviceStats, loading }: ServicePerformanceTableProps) => {
  const isMobile = useIsMobile();

  return (
    <Card>
      <CardHeader>
        <CardTitle className={`${isMobile ? 'text-lg' : 'text-xl'}`}>
          Service Performance Details
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
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
  );
};

export default ServicePerformanceTable;
