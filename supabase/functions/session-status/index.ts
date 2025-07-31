
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
      return new Response(JSON.stringify({ 
        status: 'failed',
        error: verifyData.message || "Failed to verify transaction" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
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
      
      // Try to find payment record by session_id (which is the reference)
      let paymentData = null;
      let updateError = null;
      
      // First try to find by stripe_session_id (reference)
      const { data: foundPayment, error: findError } = await supabaseService
        .from("payments")
        .select('id, appointment_id, user_id, amount, service_id, stripe_session_id')
        .eq('stripe_session_id', session_id)
        .single();
      
      if (findError) {
        console.log("Payment not found by stripe_session_id, trying by reference in metadata...");
        
        // Try to find by reference in metadata as fallback
        const { data: metadataPayment, error: metadataError } = await supabaseService
          .from("payments")
          .select('id, appointment_id, user_id, amount, service_id, stripe_session_id')
          .contains('metadata', { paystack_reference: session_id })
          .single();
        
        if (metadataError) {
          console.error("Payment not found by any method:", metadataError);
          updateError = metadataError;
        } else {
          paymentData = metadataPayment;
        }
      } else {
        paymentData = foundPayment;
      }
      
      // Update payment status if found
      if (paymentData && !updateError) {
        const { data: updatedPayment, error: updateErr } = await supabaseService
          .from("payments")
          .update({ 
            status: 'completed',
            stripe_payment_intent_id: transaction.id,
            updated_at: new Date().toISOString()
          })
          .eq('id', paymentData.id)
          .select('id, appointment_id, user_id, amount, service_id')
          .single();
        
        paymentData = updatedPayment;
        updateError = updateErr;
      }

      if (updateError) {
        console.error("Failed to update payment status:", updateError);
      } else {
        console.log("Payment status updated successfully", paymentData);
        
        // Process earnings immediately after payment completion
        if (paymentData?.id && paymentData?.service_id) {
          try {
            console.log("Processing earnings for payment:", paymentData.id);
            
            // Get service details to find the stylist
            const { data: serviceData, error: serviceError } = await supabaseService
              .from("services")
              .select("stylist_id")
              .eq("id", paymentData.service_id)
              .single();

            if (serviceError || !serviceData?.stylist_id) {
              console.error("Failed to get service details:", serviceError);
            } else {
              console.log("Found stylist for service:", serviceData.stylist_id);
              
              // Check if earnings record already exists
              const { data: existingEarning } = await supabaseService
                .from("specialist_earnings")
                .select("id")
                .eq("payment_id", paymentData.id)
                .single();

              if (existingEarning) {
                console.log("Earnings record already exists for payment:", paymentData.id);
              } else {
                // Calculate earnings (15% platform fee)
                const grossAmount = paymentData.amount;
                const platformFeePercentage = 15;
                const platformFee = Math.round(grossAmount * (platformFeePercentage / 100));
                const netAmount = grossAmount - platformFee;

                console.log("Creating earnings record:", {
                  grossAmount,
                  platformFee,
                  netAmount,
                  stylist_id: serviceData.stylist_id
                });

                // Create earnings record
                const { error: earningsError } = await supabaseService
                  .from("specialist_earnings")
                  .insert({
                    stylist_id: serviceData.stylist_id,
                    appointment_id: paymentData.appointment_id,
                    payment_id: paymentData.id,
                    gross_amount: grossAmount,
                    platform_fee: platformFee,
                    net_amount: netAmount,
                    platform_fee_percentage: platformFeePercentage,
                    status: 'available' // Make immediately available for withdrawal
                  });

                if (earningsError) {
                  console.error("Failed to create earnings record:", earningsError);
                } else {
                  console.log("Earnings record created successfully");
                }
              }
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
    // Note: Paystack returns amounts in kobo (1/100 of Naira) for all currencies
    // For GHS, 1 pesewa = 1 kobo, so amounts should match
    return new Response(JSON.stringify({ 
      status: paymentStatus,
      customer_email: transaction.customer?.email || '',
      transaction_reference: transaction.reference,
      amount: transaction.amount, // This is already in pesewas (kobo equivalent)
      currency: transaction.currency,
      success: transaction.status === 'success'
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
