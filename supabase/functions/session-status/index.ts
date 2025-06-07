
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
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
    // Get session_id from request body (matching the frontend call)
    const { session_id } = await req.json();
    
    if (!session_id) {
      throw new Error("session_id is required");
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Retrieve session (matching your Flask code)
    const session = await stripe.checkout.sessions.retrieve(session_id);

    // Update payment status in database if completed
    if (session.status === 'complete') {
      const supabaseService = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
        { auth: { persistSession: false } }
      );

      await supabaseService
        .from("payments")
        .update({ 
          status: 'completed',
          stripe_payment_intent_id: session.payment_intent
        })
        .eq('stripe_session_id', session_id);
    }

    // Return status and customer email (matching your Flask response)
    return new Response(JSON.stringify({ 
      status: session.status,
      customer_email: session.customer_details?.email 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Session status check failed:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
