
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
    // The function is now triggered by appointment_id
    const { appointment_id, platform_fee_percentage = 15 } = await req.json();
    
    if (!appointment_id) {
      throw new Error("appointment_id is required");
    }

    console.log("Processing earnings for appointment:", appointment_id);

    // Initialize Supabase service client
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get payment details from appointment_id
    const { data: payment, error: paymentError } = await supabaseService
      .from("payments")
      .select("*")
      .eq("appointment_id", appointment_id)
      .eq("status", "completed") // We still need to ensure payment was successful
      .maybeSingle(); // Use maybeSingle to avoid error if no payment found yet

    if (paymentError) {
      console.error("Error fetching payment for appointment:", appointment_id, paymentError);
      throw new Error("Error fetching payment.");
    }

    if (!payment) {
      console.log("No completed payment found for appointment yet:", appointment_id);
      return new Response(JSON.stringify({ message: "No completed payment found for appointment. Will retry." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 202, // Accepted, but not processed
      });
    }

    // Get appointment details to find the stylist
    const { data: appointment, error: appointmentError } = await supabaseService
      .from("appointments")
      .select("stylist_id")
      .eq("id", appointment_id)
      .single();

    if (appointmentError || !appointment || !appointment.stylist_id) {
      console.error("Could not find stylist for appointment:", appointment_id, appointmentError);
      throw new Error("Could not determine stylist for the appointment.");
    }
    const stylist_id = appointment.stylist_id;

    // Check if earnings record already exists
    const { data: existingEarning } = await supabaseService
      .from("specialist_earnings")
      .select("id")
      .eq("payment_id", payment.id)
      .single();

    if (existingEarning) {
      console.log("Earnings record already exists for payment:", payment.id);
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
        appointment_id: appointment_id,
        payment_id: payment.id,
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
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
