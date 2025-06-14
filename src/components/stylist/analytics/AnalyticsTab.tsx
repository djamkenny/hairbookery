
import React from "react";
import { useStylistAnalytics } from "@/hooks/useStylistAnalytics";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import AnalyticsOverview from "./AnalyticsOverview";
import ServicePopularityChart from "./ServicePopularityChart";
import MonthlyTrendsChart from "./MonthlyTrendsChart";

const AnalyticsTab = () => {
  const {
    serviceStats,
    monthlyStats,
    totalBookings,
    totalRevenue,
    loading,
    error,
    refetch
  } = useStylistAnalytics();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <p className="text-destructive">Error loading analytics: {error}</p>
        <Button onClick={refetch} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  const topService = serviceStats.length > 0 ? serviceStats[0] : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Analytics & Insights</h2>
          <p className="text-muted-foreground">Track your booking performance and popular services</p>
        </div>
        <Button onClick={refetch} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <AnalyticsOverview
        totalBookings={totalBookings}
        totalRevenue={totalRevenue}
        topService={topService?.serviceName}
        topServiceCount={topService?.bookingCount}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ServicePopularityChart data={serviceStats} />
        <MonthlyTrendsChart data={monthlyStats} />
      </div>

      {serviceStats.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-4">Service Performance Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {serviceStats.map((service, index) => (
              <div
                key={service.serviceName}
                className="bg-secondary/30 p-4 rounded-lg border"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{service.serviceName}</h4>
                  <span className="text-sm text-primary font-medium">#{index + 1}</span>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Bookings: <span className="font-medium text-foreground">{service.bookingCount}</span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Revenue: <span className="font-medium text-foreground">
                      {new Intl.NumberFormat('en-GH', {
                        style: 'currency',
                        currency: 'GHS'
                      }).format(service.totalRevenue)}
                    </span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsTab;
