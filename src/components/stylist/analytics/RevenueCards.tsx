
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RevenueSummary } from "@/services/revenueService";
import { formatGHS } from "@/components/stylist/services/formatGHS";

interface RevenueCardsProps {
  revenueSummary: RevenueSummary;
  loading: boolean;
}

const RevenueCards = ({ revenueSummary, loading }: RevenueCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {loading ? "Loading..." : formatGHS(revenueSummary.total_revenue)}
          </div>
          <p className="text-xs text-muted-foreground">All time earnings</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {loading ? "Loading..." : revenueSummary.total_bookings}
          </div>
          <p className="text-xs text-muted-foreground">Completed appointments</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg. Booking Value</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {loading ? "Loading..." : formatGHS(revenueSummary.avg_booking_value)}
          </div>
          <p className="text-xs text-muted-foreground">Per appointment</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Service Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {loading ? "Loading..." : formatGHS(revenueSummary.total_service_revenue)}
          </div>
          <p className="text-xs text-muted-foreground">From services only</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default RevenueCards;
