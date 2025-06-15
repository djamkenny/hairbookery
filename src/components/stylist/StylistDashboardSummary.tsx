import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarClock, Users, CalendarCheck, Star, DollarSign } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";

interface StylistDashboardSummaryProps {
  upcomingAppointments: number;
  totalClients: number;
  completedAppointments: number;
  rating: number | null;
  extraBalance?: number;   // <--- new optional prop
}

const StylistDashboardSummary = ({
  upcomingAppointments = 0,
  totalClients = 0,
  completedAppointments = 0,
  rating = null,
  extraBalance = 0
}: StylistDashboardSummaryProps) => {
  const isMobile = useIsMobile();
  const [availableBalance, setAvailableBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchBalance = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: earnings, error: earningsError } = await supabase
        .rpc('get_stylist_earnings', { stylist_uuid: user.id });

      if (earningsError) {
        console.error("Error fetching earnings for dashboard:", earningsError);
        return;
      }
      const available = (earnings || [])
        .filter((e: any) => e.status === 'available')
        .reduce((sum: number, e: any) => sum + (e.net_amount || 0), 0);

      setAvailableBalance(available);
    } catch (error) {
      console.error("Error fetching balance for dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
    const channel = supabase
      .channel('dashboard-balance-updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'payments' },
        () => setTimeout(fetchBalance, 1000)
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'specialist_earnings' },
        () => fetchBalance()
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const formatAmount = (amount: number) => `GH₵${(amount / 100).toFixed(2)}`;

  // New: "available balance" can have the appended booking amount
  const totalBalance = availableBalance + (extraBalance || 0);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
      <Card className="border border-border/30 hover:shadow-md transition-shadow">
        <CardContent className="flex items-center gap-3 md:gap-4 p-3 md:p-4">
          <div className={`${isMobile ? 'h-10 w-10' : 'h-12 w-12'} flex items-center justify-center rounded-full bg-primary/10`}>
            <CalendarClock className={`${isMobile ? 'h-5 w-5' : 'h-6 w-6'} text-primary`} />
          </div>
          <div>
            <p className="text-muted-foreground text-xs sm:text-sm">Upcoming</p>
            <p className="text-xl sm:text-2xl font-medium">{upcomingAppointments}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-border/30 hover:shadow-md transition-shadow">
        <CardContent className="flex items-center gap-3 md:gap-4 p-3 md:p-4">
          <div className={`${isMobile ? 'h-10 w-10' : 'h-12 w-12'} flex items-center justify-center rounded-full bg-primary/10`}>
            <Users className={`${isMobile ? 'h-5 w-5' : 'h-6 w-6'} text-primary`} />
          </div>
          <div>
            <p className="text-muted-foreground text-xs sm:text-sm">Clients</p>
            <p className="text-xl sm:text-2xl font-medium">{totalClients}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-border/30 hover:shadow-md transition-shadow">
        <CardContent className="flex items-center gap-3 md:gap-4 p-3 md:p-4">
          <div className={`${isMobile ? 'h-10 w-10' : 'h-12 w-12'} flex items-center justify-center rounded-full bg-primary/10`}>
            <CalendarCheck className={`${isMobile ? 'h-5 w-5' : 'h-6 w-6'} text-primary`} />
          </div>
          <div>
            <p className="text-muted-foreground text-xs sm:text-sm">Completed</p>
            <p className="text-xl sm:text-2xl font-medium">{completedAppointments}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-border/30 hover:shadow-md transition-shadow">
        <CardContent className="flex items-center gap-3 md:gap-4 p-3 md:p-4">
          <div className={`${isMobile ? 'h-10 w-10' : 'h-12 w-12'} flex items-center justify-center rounded-full bg-primary/10`}>
            <Star className={`${isMobile ? 'h-5 w-5' : 'h-6 w-6'} text-primary`} />
          </div>
          <div>
            <p className="text-muted-foreground text-xs sm:text-sm">Rating</p>
            <p className="text-xl sm:text-2xl font-medium">{rating ? rating.toFixed(1) : '--'}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-green-200 bg-green-50 hover:shadow-md transition-shadow">
        <CardContent className="flex items-center gap-3 md:gap-4 p-3 md:p-4">
          <div className={`${isMobile ? 'h-10 w-10' : 'h-12 w-12'} flex items-center justify-center rounded-full bg-green-200`}>
            <DollarSign className={`${isMobile ? 'h-5 w-5' : 'h-6 w-6'} text-green-700`} />
          </div>
          <div>
            <p className="text-green-700 text-xs sm:text-sm font-medium">Balance</p>
            <p className="text-xl sm:text-2xl font-bold text-green-800">
              {loading ? '...' : formatAmount(totalBalance)}
              {extraBalance > 0 && (
                <span className="ml-2 bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded">
                  +{formatAmount(extraBalance)} new
                </span>
              )}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StylistDashboardSummary;
