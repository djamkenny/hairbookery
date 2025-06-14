import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import EarningsOverview from "./EarningsOverview";
import WithdrawalForm from "./WithdrawalForm";
import { format } from "date-fns";

interface Earning {
  id: string;
  gross_amount: number;
  platform_fee: number;
  net_amount: number;
  platform_fee_percentage: number;
  status: string;
  created_at: string;
  appointment_id: string;
}

interface WithdrawalRequest {
  id: string;
  amount: number;
  status: string;
  bank_name: string;
  account_number: string;
  account_name: string;
  created_at: string;
  processed_at: string | null;
}

const EarningsTab = () => {
  const [earnings, setEarnings] = useState<Earning[]>([]);
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [availableBalance, setAvailableBalance] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [pendingEarnings, setPendingEarnings] = useState(0);
  const [withdrawnAmount, setWithdrawnAmount] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);

  const fetchEarningsData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch earnings data using the RPC function
      const { data: earningsData, error: earningsError } = await supabase
        .rpc('get_stylist_earnings', { stylist_uuid: user.id });

      if (earningsError) {
        console.error("Earnings error:", earningsError);
        setEarnings([]);
      } else {
        const typedEarnings = (earningsData as any[]) || [];
        setEarnings(typedEarnings);
      }

      // Fetch withdrawals data using the RPC function
      const { data: withdrawalsData, error: withdrawalsError } = await supabase
        .rpc('get_stylist_withdrawals', { stylist_uuid: user.id });

      if (withdrawalsError) {
        console.error("Withdrawals error:", withdrawalsError);
        setWithdrawalRequests([]);
      } else {
        const typedWithdrawals = (withdrawalsData as any[]) || [];
        setWithdrawalRequests(typedWithdrawals);
      }

      // Calculate totals safely
      const typedEarningsData = (earningsData as any[]) || [];
      const typedWithdrawalsData = (withdrawalsData as any[]) || [];

      const available = typedEarningsData
        .filter((e: any) => e.status === 'available')
        .reduce((sum: number, e: any) => sum + (e.net_amount || 0), 0);
      
      const pending = typedEarningsData
        .filter((e: any) => e.status === 'pending')
        .reduce((sum: number, e: any) => sum + (e.net_amount || 0), 0);
      
      const total = typedEarningsData
        .reduce((sum: number, e: any) => sum + (e.net_amount || 0), 0);
      
      const withdrawn = typedWithdrawalsData
        .filter((w: any) => w.status === 'completed')
        .reduce((sum: number, w: any) => sum + (w.amount || 0), 0);

      setAvailableBalance(available);
      setPendingEarnings(pending);
      setTotalEarnings(total);
      setWithdrawnAmount(withdrawn);

      // New: Fetch total gross revenue from payments table for this stylist's completed appointments
      // Fetch all stylist's appointment ids
      const { data: appointmentsData, error: aptsError } = await supabase
        .from("appointments")
        .select("id")
        .eq("stylist_id", user.id)
        .is('canceled_at', null);

      if (aptsError || !appointmentsData) {
        setTotalRevenue(0);
        console.warn("Failed to fetch stylist appointments for revenue calc");
        return;
      }
      const appointmentIds = appointmentsData.map((apt: any) => apt.id);

      if (appointmentIds.length === 0) {
        setTotalRevenue(0);
        return;
      }

      // Fetch payments for these appointments
      const { data: paymentsData, error: paymentsError } = await supabase
        .from("payments")
        .select("amount, appointment_id, status")
        .in("appointment_id", appointmentIds)
        .eq("status", "completed");

      if (paymentsError || !paymentsData) {
        setTotalRevenue(0);
        console.warn("Failed to fetch payments for revenue calc");
        return;
      }

      const grossRevenue = paymentsData.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
      setTotalRevenue(grossRevenue);

    } catch (error) {
      console.error("Error fetching earnings data:", error);
      toast.error("Failed to load earnings data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Real-time updates for earnings
  useEffect(() => {
    fetchEarningsData();

    // Set up real-time subscriptions for earnings updates
    const earningsChannel = supabase
      .channel('earnings-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'specialist_earnings'
        },
        () => {
          console.log('Earnings updated, refreshing data...');
          fetchEarningsData();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'withdrawal_requests'
        },
        () => {
          console.log('Withdrawal requests updated, refreshing data...');
          fetchEarningsData();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payments'
        },
        () => {
          console.log('Payments updated, refreshing earnings...');
          // Small delay to ensure related earnings records are created
          setTimeout(fetchEarningsData, 1000);
        }
      )
      .subscribe();

    // Auto-refresh every 30 seconds as backup
    const refreshInterval = setInterval(fetchEarningsData, 30000);

    return () => {
      supabase.removeChannel(earningsChannel);
      clearInterval(refreshInterval);
    };
  }, []);

  const formatAmount = (amount: number) => `GH₵${(amount / 100).toFixed(2)}`;

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "Pending", variant: "secondary" as const },
      available: { label: "Available", variant: "default" as const },
      withdrawn: { label: "Withdrawn", variant: "outline" as const },
      processing: { label: "Processing", variant: "secondary" as const },
      completed: { label: "Completed", variant: "default" as const },
      rejected: { label: "Rejected", variant: "destructive" as const }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return <div className="flex items-center justify-center py-8">Loading earnings data...</div>;
  }

  return (
    <div className="space-y-6">
      <EarningsOverview
        availableBalance={availableBalance}
        totalEarnings={totalEarnings}
        pendingEarnings={pendingEarnings}
        withdrawnAmount={withdrawnAmount}
        totalRevenue={totalRevenue}
      />

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Earnings</CardTitle>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchEarningsData}
                disabled={loading}
              >
                Refresh
              </Button>
            </CardHeader>
            <CardContent>
              {earnings.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-2">No earnings yet</p>
                  <p className="text-sm text-muted-foreground">
                    Start completing appointments to see your earnings here.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {earnings.slice(0, 5).map((earning) => (
                    <div key={earning.id} className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{formatAmount(earning.net_amount)}</p>
                        <p className="text-sm text-muted-foreground">
                          Platform fee: {formatAmount(earning.platform_fee)} ({earning.platform_fee_percentage}%)
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(earning.created_at), "MMM d, yyyy")}
                        </p>
                      </div>
                      {getStatusBadge(earning.status)}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="withdraw">
          <WithdrawalForm
            availableBalance={availableBalance}
            onSuccess={fetchEarningsData}
          />
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Withdrawal History</CardTitle>
            </CardHeader>
            <CardContent>
              {withdrawalRequests.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-2">No withdrawal requests yet</p>
                  <p className="text-sm text-muted-foreground">
                    Submit your first withdrawal request when you have available earnings.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {withdrawalRequests.map((request) => (
                    <div key={request.id} className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{formatAmount(request.amount)}</p>
                        <p className="text-sm text-muted-foreground">
                          {request.bank_name} - {request.account_number}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Requested: {format(new Date(request.created_at), "MMM d, yyyy")}
                          {request.processed_at && (
                            <span> | Processed: {format(new Date(request.processed_at), "MMM d, yyyy")}</span>
                          )}
                        </p>
                      </div>
                      {getStatusBadge(request.status)}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EarningsTab;
