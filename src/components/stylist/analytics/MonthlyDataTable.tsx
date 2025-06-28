
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MonthlyBookingData } from "@/services/analyticsService";
import { formatGHS } from "@/components/stylist/services/formatGHS";
import { useIsMobile } from "@/hooks/use-mobile";

interface MonthlyDataTableProps {
  monthlyStats: MonthlyBookingData[];
  loading: boolean;
}

const MonthlyDataTable = ({ monthlyStats, loading }: MonthlyDataTableProps) => {
  const isMobile = useIsMobile();

  return (
    <Card>
      <CardHeader>
        <CardTitle className={`${isMobile ? 'text-lg' : 'text-xl'}`}>
          Monthly Revenue & Bookings
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Loading monthly data...</p>
          </div>
        ) : monthlyStats && monthlyStats.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead>Bookings</TableHead>
                  <TableHead>Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {monthlyStats.map((month, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{month.month}</TableCell>
                    <TableCell>{month.bookings}</TableCell>
                    <TableCell>{formatGHS(month.revenue)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">No monthly data available yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MonthlyDataTable;
