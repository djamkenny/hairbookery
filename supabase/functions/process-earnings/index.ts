
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { payment_id, appointment_id, platform_fee_percentage = 15 } = await req.json();
    
    if (!payment_id) {
      throw new Error("payment_id is required");
    }

    console.log("Processing earnings for payment:", payment_id);

    // Initialize Supabase service client
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get payment details
    const { data: payment, error: paymentError } = await supabaseService
      .from("payments")
      .select("*")
      .eq("id", payment_id)
      .eq("status", "completed")
      .single();

    if (paymentError || !payment) {
      console.error("Payment not found or not completed:", paymentError);
      throw new Error("Payment not found or not completed");
    }

    // Get appointment details to find the stylist
    let stylist_id = null;
    let actual_appointment_id = appointment_id || payment.appointment_id;
    
    if (actual_appointment_id) {
      const { data: appointment, error: appointmentError } = await supabaseService
        .from("appointments")
        .select("stylist_id")
        .eq("id", actual_appointment_id)
        .single();

      if (!appointmentError && appointment) {
        stylist_id = appointment.stylist_id;
      }
    }

    if (!stylist_id) {
      console.log("No stylist found for this payment, skipping earnings creation");
      return new Response(JSON.stringify({ message: "No stylist found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Check if earnings record already exists
    const { data: existingEarning } = await supabaseService
      .from("specialist_earnings")
      .select("id")
      .eq("payment_id", payment_id)
      .single();

    if (existingEarning) {
      console.log("Earnings record already exists for payment:", payment_id);
      return new Response(JSON.stringify({ message: "Earnings already processed" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Calculate earnings
    const grossAmount = payment.amount;
    const platformFee = Math.round(grossAmount * (platform_fee_percentage / 100));
    const netAmount = grossAmount - platformFee;

    console.log("Creating earnings record:", {
      stylist_id,
      grossAmount,
      platformFee,
      netAmount
    });

    // Create earnings record
    const { error: earningsError } = await supabaseService
      .from("specialist_earnings")
      .insert({
        stylist_id: stylist_id,
        appointment_id: actual_appointment_id,
        payment_id: payment_id,
        gross_amount: grossAmount,
        platform_fee: platformFee,
        net_amount: netAmount,
        platform_fee_percentage: platform_fee_percentage,
        status: 'available' // Make immediately available for withdrawal
      });

    if (earningsError) {
      console.error("Failed to create earnings record:", earningsError);
      throw new Error("Failed to create earnings record");
    }

    console.log("Earnings record created successfully for stylist:", stylist_id);

    return new Response(JSON.stringify({ 
      message: "Earnings processed successfully",
      gross_amount: grossAmount,
      platform_fee: platformFee,
      net_amount: netAmount,
      stylist_id: stylist_id
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Earnings processing failed:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
