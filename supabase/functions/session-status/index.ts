
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get reference from request body
    const { session_id } = await req.json();
    
    if (!session_id) {
      throw new Error("session_id (reference) is required");
    }

    console.log("Checking payment status for session:", session_id);

    // Get Paystack secret key
    const paystackSecretKey = Deno.env.get("PAYSTACK_SECRET_KEY");
    if (!paystackSecretKey) {
      console.error("Paystack secret key not configured");
      throw new Error("Paystack secret key not configured");
    }

    // Verify transaction with Paystack
    const verifyResponse = await fetch(`https://api.paystack.co/transaction/verify/${session_id}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${paystackSecretKey}`,
        "Content-Type": "application/json",
      },
    });

    const verifyData = await verifyResponse.json();
    console.log("Paystack verification response:", verifyData);

    if (!verifyData.status) {
      console.error("Paystack verification failed:", verifyData.message);
      throw new Error(verifyData.message || "Failed to verify transaction");
    }

    const transaction = verifyData.data;
    console.log("Transaction status:", transaction.status);

    // Initialize Supabase service client
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Update payment status in database if completed
    if (transaction.status === 'success') {
      console.log("Updating payment status to completed for session:", session_id);
      
      const { data: paymentData, error: updateError } = await supabaseService
        .from("payments")
        .update({ 
          status: 'completed',
          stripe_payment_intent_id: transaction.id,
          updated_at: new Date().toISOString()
        })
        .eq('stripe_session_id', session_id)
        .select('appointment_id, user_id, amount')
        .single();

      if (updateError) {
        console.error("Failed to update payment status:", updateError);
      } else {
        console.log("Payment status updated successfully");
        
        // Process earnings immediately after payment completion
        if (paymentData?.appointment_id) {
          try {
            console.log("Processing earnings for appointment:", paymentData.appointment_id);
            
            const { error: earningsError } = await supabaseService.functions.invoke('process-earnings', {
              body: { 
                payment_id: paymentData.appointment_id,
                appointment_id: paymentData.appointment_id,
                platform_fee_percentage: 15 
              }
            });
            
            if (earningsError) {
              console.error("Failed to process earnings:", earningsError);
            } else {
              console.log("Earnings processed successfully");
            }
          } catch (earningsProcessingError) {
            console.error("Error processing earnings:", earningsProcessingError);
          }
        }
      }
    }

    // Map Paystack status to our status
    let paymentStatus = 'pending';
    if (transaction.status === 'success') {
      paymentStatus = 'complete';
    } else if (transaction.status === 'failed') {
      paymentStatus = 'failed';
    } else if (transaction.status === 'abandoned') {
      paymentStatus = 'canceled';
    }

    // Return status and customer email
    return new Response(JSON.stringify({ 
      status: paymentStatus,
      customer_email: transaction.customer?.email || '',
      transaction_reference: transaction.reference,
      amount: transaction.amount,
      currency: transaction.currency
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Session status check failed:", error);
    return new Response(JSON.stringify({ 
      error: error.message,
      status: 'failed' 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
