
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
    const { amount, currency = 'GHS', description, serviceId, appointmentId } = await req.json();
    
    // Validate required fields
    if (!amount || amount <= 0) {
      throw new Error("Valid amount is required");
    }

    console.log("Creating Paystack payment with amount:", amount, "currency:", currency);

    // Get Paystack secret key
    const paystackSecretKey = Deno.env.get("PAYSTACK_SECRET_KEY");
    if (!paystackSecretKey) {
      throw new Error("Paystack secret key not configured");
    }

    // Create Paystack transaction
    const paystackPayload = {
      email: user.email,
      amount: amount, // Paystack expects amount in kobo (1 GHS = 100 pesewas)
      currency: currency,
      reference: `ref_${Date.now()}_${user.id.slice(0, 8)}`,
      callback_url: `${req.headers.get("origin") || "http://localhost:3000"}/return`,
      metadata: {
        user_id: user.id,
        service_id: serviceId || '',
        appointment_id: appointmentId || '',
        description: description || 'Appointment Payment'
      }
    };

    console.log("Paystack payload:", paystackPayload);

    // Initialize Paystack transaction
    const paystackResponse = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${paystackSecretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(paystackPayload),
    });

    const paystackData = await paystackResponse.json();
    console.log("Paystack response:", paystackData);

    if (!paystackData.status) {
      throw new Error(paystackData.message || "Failed to initialize Paystack transaction");
    }

    // Store payment record in Supabase
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    await supabaseService.from("payments").insert({
      user_id: user.id,
      stripe_session_id: paystackData.data.reference, // Using reference as session ID
      amount: amount,
      currency: currency,
      status: 'pending',
      description: description,
      service_id: serviceId,
      appointment_id: appointmentId,
    });

    // Return session details
    return new Response(JSON.stringify({ 
      url: paystackData.data.authorization_url,
      reference: paystackData.data.reference,
      sessionId: paystackData.data.reference
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
