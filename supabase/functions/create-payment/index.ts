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
    const { amount, description, currency = 'GHS', metadata = {} } = await req.json();
    
    if (!amount || amount <= 0) {
      throw new Error("Valid amount is required");
    }

    // Get Paystack secret key
    const paystackSecretKey = Deno.env.get("PAYSTACK_SECRET_KEY");
    if (!paystackSecretKey) {
      throw new Error("Paystack secret key not configured");
    }

    // Create Supabase client for database operations
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get user from auth header if available
    const authHeader = req.headers.get("Authorization");
    let userId = null;
    let userEmail = "guest@donation.com";

    if (authHeader) {
      try {
        const token = authHeader.replace("Bearer ", "");
        const { data: userData } = await supabaseClient.auth.getUser(token);
        if (userData.user) {
          userId = userData.user.id;
          userEmail = userData.user.email || userEmail;
        }
      } catch (error) {
        console.log("No valid user session, proceeding as guest");
      }
    }

    // Generate unique reference
    const reference = `donation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Initialize Paystack payment
    const paystackResponse = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${paystackSecretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: userEmail,
        amount: amount, // Amount in pesewas
        currency: currency,
        reference: reference,
        callback_url: `${req.headers.get("origin")}/payment-return`,
        metadata: {
          ...metadata,
          user_id: userId,
          description: description,
        },
      }),
    });

    const paystackData = await paystackResponse.json();

    if (!paystackData.status) {
      throw new Error(paystackData.message || "Payment initialization failed");
    }

    // Store payment record in database
    const { error: dbError } = await supabaseClient
      .from("payments")
      .insert({
        user_id: userId,
        amount: amount,
        currency: currency,
        description: description,
        status: "pending",
        stripe_session_id: reference, // Keep this for compatibility with existing code
        stripe_payment_intent_id: paystackData.data.access_code, // Store access code
        service_id: metadata.service_id || null, // Store service_id if provided
        appointment_id: metadata.appointment_id || null, // Store appointment_id if provided
        metadata: {
          ...metadata,
          paystack_reference: reference,
          paystack_access_code: paystackData.data.access_code,
        },
      });

    if (dbError) {
      console.error("Database error:", dbError);
      // Continue anyway as payment URL is more important
    }

    return new Response(
      JSON.stringify({
        url: paystackData.data.authorization_url,
        reference: reference,
        sessionId: paystackData.data.access_code,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Payment creation failed:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});