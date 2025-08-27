
import React from "react";
import { supabase } from "@/integrations/supabase/client";
import { useStylistRevenue } from "@/hooks/useStylistRevenue";
import { useStylistAnalytics } from "@/hooks/useStylistAnalytics";
import AnalyticsHeader from "./AnalyticsHeader";
import RevenueCards from "./RevenueCards";
import ServicePerformanceTable from "./ServicePerformanceTable";
import MonthlyDataTable from "./MonthlyDataTable";
import ServicePopularityChart from "./ServicePopularityChart";
import MonthlyTrendsChart from "./MonthlyTrendsChart";

const AnalyticsTab = () => {
  const [user, setUser] = React.useState<any>(null);

  React.useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  const { revenueSummary, loading } = useStylistRevenue(user?.id);
  const { serviceStats, monthlyStats, loading: analyticsLoading } = useStylistAnalytics();

  return (
    <div className="space-y-6">
      <AnalyticsHeader />

      {/* Revenue Overview Cards */}
      <RevenueCards revenueSummary={revenueSummary} loading={loading} />

      {/* Service Performance Details Table */}
      <ServicePerformanceTable serviceStats={serviceStats} loading={analyticsLoading} />

      {/* Monthly Revenue & Bookings Table */}
      <MonthlyDataTable monthlyStats={monthlyStats} loading={analyticsLoading} />

      {/* Charts Grid - Stack on mobile, side by side on desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ServicePopularityChart data={serviceStats} />
        <MonthlyTrendsChart data={monthlyStats} />
      </div>
    </div>
  );
};

export default AnalyticsTab;
