
import React from "react";
import { useStylistAnalytics } from "@/hooks/useStylistAnalytics";
import ServicePopularityChart from "./ServicePopularityChart";
import MonthlyTrendsChart from "./MonthlyTrendsChart";
import AnalyticsOverview from "./AnalyticsOverview";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AnalyticsTab = () => {
  const {
    serviceStats,
    monthlyStats,
    totalBookings,
    totalRevenue,
    loading,
    error
  } = useStylistAnalytics();

  // Find most popular service
  const topServiceEntry =
    serviceStats && serviceStats.length > 0
      ? serviceStats[0]
      : null;

  return (
    <div className="space-y-6">
      {/* totalRevenue is in pesewas */}
      <AnalyticsOverview
        totalBookings={totalBookings}
        totalRevenue={Math.round(totalRevenue * 100)}
        topService={topServiceEntry?.serviceName}
        topServiceCount={topServiceEntry?.bookingCount}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ServicePopularityChart data={serviceStats} />
        <MonthlyTrendsChart data={monthlyStats} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Service Performance Details</CardTitle>
        </CardHeader>
        <CardContent>
          {serviceStats.length === 0 ? (
            <div className="text-center text-muted-foreground py-6">
              No service performance data yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead>
                  <tr className="text-left">
                    <th className="px-4 py-2 font-semibold">Service</th>
                    <th className="px-4 py-2 font-semibold">Bookings</th>
                    <th className="px-4 py-2 font-semibold">Total Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {serviceStats.map((service) => (
                    <tr key={service.serviceName} className="border-b last:border-0">
                      <td className="px-4 py-2">{service.serviceName}</td>
                      <td className="px-4 py-2">{service.bookingCount}</td>
                      <td className="px-4 py-2">
                        GH₵{service.totalRevenue.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsTab;
