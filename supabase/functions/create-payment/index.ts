
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
    // Initialize Supabase client with anon key for auth
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Extract and validate user authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header provided");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !user?.email) {
      throw new Error("User not authenticated or email not available");
    }

    // Parse request body for payment details
    const { amount, currency = 'usd', description, serviceId, appointmentId, priceId } = await req.json();
    
    // Validate required fields
    if (!amount || amount <= 0) {
      throw new Error("Valid amount is required");
    }

    console.log("Creating payment with amount:", amount, "currency:", currency);

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Check for existing Stripe customer
    const customers = await stripe.customers.list({ 
      email: user.email, 
      limit: 1 
    });
    
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    // Create checkout session for hosted checkout (not embedded)
    const sessionConfig: any = {
      mode: 'payment',
      success_url: `${req.headers.get("origin") || "http://localhost:3000"}/return?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin") || "http://localhost:3000"}/booking`,
    };

    // Set customer info
    if (customerId) {
      sessionConfig.customer = customerId;
    } else {
      sessionConfig.customer_email = user.email;
    }

    // Configure line items
    if (priceId) {
      // Use existing Stripe price
      sessionConfig.line_items = [{
        price: priceId,
        quantity: 1,
      }];
    } else {
      // Create price data on the fly
      sessionConfig.line_items = [{
        price_data: {
          currency: currency,
          product_data: {
            name: description || "Appointment Payment",
          },
          unit_amount: amount,
        },
        quantity: 1,
      }];
    }

    // Add metadata for tracking
    sessionConfig.metadata = {
      user_id: user.id,
      service_id: serviceId || '',
      appointment_id: appointmentId || '',
    };

    console.log("Creating Stripe session with config:", sessionConfig);
    const session = await stripe.checkout.sessions.create(sessionConfig);
    console.log("Stripe session created:", { id: session.id, url: session.url });

    // Store payment record in Supabase
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    await supabaseService.from("payments").insert({
      user_id: user.id,
      stripe_session_id: session.id,
      amount: amount,
      currency: currency,
      status: 'pending',
      description: description,
      service_id: serviceId,
      appointment_id: appointmentId,
    });

    // Return session details
    return new Response(JSON.stringify({ 
      clientSecret: session.client_secret,
      sessionId: session.id,
      url: session.url 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Payment creation failed:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
