
import React from "react";
import { useStylistAnalytics } from "@/hooks/useStylistAnalytics";
import { supabase } from "@/integrations/supabase/client";
import AnalyticsOverview from "./AnalyticsOverview";
import ServicePopularityChart from "./ServicePopularityChart";
import MonthlyTrendsChart from "./MonthlyTrendsChart";
import RealTimeBalance from "./RealTimeBalance";

const AnalyticsTab = () => {
  const {
    serviceStats,
    monthlyStats,
    totalBookings,
    totalRevenue,
    loading,
    error
  } = useStylistAnalytics();

  const [stylistId, setStylistId] = React.useState<string | null>(null);

  React.useEffect(() => {
    const getUserId = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setStylistId(user.id);
      }
    };
    getUserId();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <p className="text-red-600 mb-2">Error loading analytics: {error}</p>
          <p className="text-muted-foreground text-sm">
            Please check if the earnings system is properly set up.
          </p>
        </div>
      </div>
    );
  }

  const topService = serviceStats.length > 0 ? serviceStats[0] : null;

  return (
    <div className="space-y-6">
      {/* Real-time Balance Section */}
      {stylistId && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Real-Time Balance</h3>
          <RealTimeBalance stylistId={stylistId} />
        </div>
      )}

      {/* Analytics Overview */}
      <AnalyticsOverview
        totalBookings={totalBookings}
        totalRevenue={totalRevenue}
        topService={topService?.serviceName}
        topServiceCount={topService?.bookingCount}
      />

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ServicePopularityChart data={serviceStats} />
        <MonthlyTrendsChart data={monthlyStats} />
      </div>

      {/* Additional Info */}
      {serviceStats.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-2">No booking data available yet</p>
          <p className="text-sm text-muted-foreground">
            Start completing appointments to see your analytics and earnings here.
          </p>
        </div>
      )}
    </div>
  );
};

export default AnalyticsTab;
