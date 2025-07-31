
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface RealTimeBalanceProps {
  stylistId: string;
}

const RealTimeBalance = ({ stylistId }: RealTimeBalanceProps) => {
  const [availableBalance, setAvailableBalance] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchBalance = async () => {
    try {
      setFetchError(null);
      setLoading(true);
      console.log("Fetching real-time balance for stylist:", stylistId);

      // Fetch earnings using RPC function
      const { data: earnings, error: earningsError } = await supabase
        .rpc('get_stylist_earnings', { stylist_uuid: stylistId });

      if (earningsError) {
        console.error("Error fetching earnings:", earningsError);
        setFetchError("Failed to fetch from Supabase: " + earningsError.message);
        toast.error("Failed to fetch balance");
        setAvailableBalance(0);
        setTotalEarnings(0);
        return;
      }

      console.log("Earnings returned:", earnings);

      // Calculate balances
      const available = (earnings || [])
        .filter((e: any) => e.status === 'available')
        .reduce((sum: number, e: any) => sum + (e.net_amount || 0), 0);

      const total = (earnings || [])
        .reduce((sum: number, e: any) => sum + (e.net_amount || 0), 0);

      setAvailableBalance(available);
      setTotalEarnings(total);

      // Debug: show in UI if empty
      if ((earnings || []).length === 0) {
        setFetchError("No earnings data found for your account. Please confirm you are viewing your stylist account.");
      }
      console.log("Balance updated - Available:", available, "Total:", total);
    } catch (error) {
      console.error("Error fetching balance:", error);
      setFetchError("Unexpected error: " + (error as any)?.message);
      toast.error("Failed to fetch balance");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!stylistId) return;

    fetchBalance();

    // Set up real-time subscription for payments and earnings
    const channel = supabase
      .channel('balance-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payments'
        },
        (payload) => {
          console.log('Payment update detected:', payload);
          // Small delay to ensure related earnings are processed
          setTimeout(fetchBalance, 1000);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'specialist_earnings'
        },
        (payload) => {
          console.log('Earnings update detected:', payload);
          fetchBalance();
        }
      )
      .subscribe();

    // Auto-refresh every 30 seconds as backup
    const refreshInterval = setInterval(fetchBalance, 30000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(refreshInterval);
    };
  }, [stylistId]);

  const formatAmount = (amount: number) => `GH₵${(amount / 100).toFixed(2)}`;

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <RefreshCw className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  // Show helpful error or empty message
  if (fetchError) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-6">
          <span className="text-red-600 font-medium">{fetchError}</span>
          <span className="text-xs text-muted-foreground mt-2">If this persists, please contact support.</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="border-2 border-primary/20 bg-primary/5">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-primary">Available Balance</CardTitle>
          <DollarSign className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">
            {formatAmount(availableBalance)}
          </div>
          <p className="text-xs text-primary">Ready for withdrawal</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
          <DollarSign className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-700">
            {formatAmount(totalEarnings)}
          </div>
          <p className="text-xs text-muted-foreground">All time earnings</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default RealTimeBalance;
