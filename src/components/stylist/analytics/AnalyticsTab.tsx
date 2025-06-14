
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

const AnalyticsTab = () => {
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTotalRevenue = async () => {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setTotalRevenue(0);
          setLoading(false);
          return;
        }
        // Fetch stylist's appointment IDs
        const { data: appointments, error: aptErr } = await supabase
          .from("appointments")
          .select("id")
          .eq("stylist_id", user.id)
          .is("canceled_at", null);

        if (aptErr || !appointments) {
          setTotalRevenue(0);
          setLoading(false);
          return;
        }
        const appointmentIds = appointments.map(a => a.id);
        if (appointmentIds.length === 0) {
          setTotalRevenue(0);
          setLoading(false);
          return;
        }

        // Sum payments for these completed appointments
        const { data: payments, error: payErr } = await supabase
          .from("payments")
          .select("amount, appointment_id, status")
          .in("appointment_id", appointmentIds)
          .eq("status", "completed");

        if (payErr || !payments) {
          setTotalRevenue(0);
        } else {
          const revenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
          setTotalRevenue(revenue);
        }
      } catch (e) {
        setTotalRevenue(0);
      } finally {
        setLoading(false);
      }
    };

    fetchTotalRevenue();
  }, []);

  const formatAmount = (amt: number) => `GH₵${(amt / 100).toFixed(2)}`;

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>Total Revenue (All Client Payments)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-purple-800">
          {loading ? "..." : formatAmount(totalRevenue)}
        </div>
        <div className="text-sm text-muted-foreground">
          Total from all completed client payments
        </div>
      </CardContent>
    </Card>
  );
};

export default AnalyticsTab;
