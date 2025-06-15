
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Calendar, DollarSign, Users } from "lucide-react";

interface AnalyticsOverviewProps {
  totalBookings: number;
  totalRevenue: number;
  topService?: string;
  topServiceCount?: number;
}

const AnalyticsOverview = ({ 
  totalBookings, 
  totalRevenue, 
  topService, 
  topServiceCount 
}: AnalyticsOverviewProps) => {
  const formatRevenue = (amount: number) => {
    // Always treat amount as cedis (not pesewas)
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS'
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalBookings}</div>
          <p className="text-xs text-muted-foreground">All time bookings</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatRevenue(totalRevenue)}</div>
          <p className="text-xs text-muted-foreground">All time revenue</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Top Service</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{topService || "N/A"}</div>
          <p className="text-xs text-muted-foreground">
            {topServiceCount ? `${topServiceCount} bookings` : "No data"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg per Booking</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {totalBookings > 0 ? formatRevenue(totalRevenue / totalBookings) : formatRevenue(0)}
          </div>
          <p className="text-xs text-muted-foreground">Average booking value</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsOverview;
