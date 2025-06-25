
import React from "react";
import { useStylistAnalytics } from "@/hooks/useStylistAnalytics";
import { useStylistRevenue } from "@/hooks/useStylistRevenue";
import { supabase } from "@/integrations/supabase/client";
import ServicePopularityChart from "./ServicePopularityChart";
import MonthlyTrendsChart from "./MonthlyTrendsChart";
import AnalyticsOverview from "./AnalyticsOverview";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AnalyticsTab = () => {
  const [userId, setUserId] = React.useState<string | undefined>();
  
  React.useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id);
    };
    getUser();
  }, []);

  const {
    serviceStats,
    monthlyStats,
    totalBookings,
    totalRevenue,
    loading: analyticsLoading,
    error: analyticsError
  } = useStylistAnalytics();

  const {
    revenueSummary,
    loading: revenueLoading
  } = useStylistRevenue(userId);

  // Find most popular service
  const topServiceEntry =
    serviceStats && serviceStats.length > 0
      ? serviceStats[0]
      : null;

  // Revenue formatting helper (cedis)
  const formatRevenue = (amount: number) =>
    new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS'
    }).format(amount);

  // Use revenue from revenue service if available, otherwise use analytics revenue
  const displayRevenue = revenueSummary.total_revenue > 0 ? revenueSummary.total_revenue : totalRevenue;

  return (
    <div className="space-y-4 md:space-y-6 px-2 md:px-0">
      <AnalyticsOverview
        totalBookings={totalBookings}
        totalRevenue={displayRevenue}
        topService={topServiceEntry?.serviceName}
        topServiceCount={topServiceEntry?.bookingCount}
      />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
        <ServicePopularityChart data={serviceStats} />
        <MonthlyTrendsChart data={monthlyStats} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base md:text-lg">Service Performance Details</CardTitle>
        </CardHeader>
        <CardContent className="p-3 md:p-6">
          {serviceStats.length === 0 ? (
            <div className="text-center text-muted-foreground py-6">
              No service performance data yet.
            </div>
          ) : (
            <div className="overflow-x-auto -mx-3 md:mx-0">
              <div className="min-w-[300px] px-3 md:px-0">
                <table className="w-full divide-y divide-gray-200 text-xs md:text-sm">
                  <thead>
                    <tr className="text-left">
                      <th className="px-2 md:px-4 py-2 font-semibold">Service</th>
                      <th className="px-2 md:px-4 py-2 font-semibold">Bookings</th>
                      <th className="px-2 md:px-4 py-2 font-semibold">Total Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {serviceStats.map((service) => (
                      <tr key={service.serviceName} className="border-b last:border-0">
                        <td className="px-2 md:px-4 py-2 truncate max-w-[120px] md:max-w-none">{service.serviceName}</td>
                        <td className="px-2 md:px-4 py-2">{service.bookingCount}</td>
                        <td className="px-2 md:px-4 py-2">
                          {formatRevenue(service.totalRevenue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base md:text-lg">Monthly Revenue & Bookings</CardTitle>
        </CardHeader>
        <CardContent className="p-3 md:p-6">
          {monthlyStats.length === 0 ? (
            <div className="text-center text-muted-foreground py-6">
              No monthly data yet.
            </div>
          ) : (
            <div className="overflow-x-auto -mx-3 md:mx-0">
              <div className="min-w-[300px] px-3 md:px-0">
                <table className="w-full divide-y divide-gray-200 text-xs md:text-sm">
                  <thead>
                    <tr className="text-left">
                      <th className="px-2 md:px-4 py-2 font-semibold">Month</th>
                      <th className="px-2 md:px-4 py-2 font-semibold">Bookings</th>
                      <th className="px-2 md:px-4 py-2 font-semibold">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyStats.map((month) => (
                      <tr key={month.month} className="border-b last:border-0">
                        <td className="px-2 md:px-4 py-2">{month.month}</td>
                        <td className="px-2 md:px-4 py-2">{month.bookings}</td>
                        <td className="px-2 md:px-4 py-2">
                          {formatRevenue(month.revenue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsTab;
