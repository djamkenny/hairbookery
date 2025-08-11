// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { reference } = await req.json();
    if (!reference) {
      return new Response(JSON.stringify({ error: "Missing reference" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("Authorization") ?? undefined;

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      global: { headers: authHeader ? { Authorization: authHeader } : {} },
    });

    // Identify current user (used for ownership checks but we use service role for DB ops)
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();
    if (userErr) {
      console.log("Auth getUser error (non-fatal):", userErr.message);
    }

    // 1) Find payment by Paystack reference
    let { data: payment, error: payErr } = await supabase
      .from("payments")
      .select("*")
      .eq("paystack_reference", reference)
      .single();

    if (payErr || !payment) {
      console.log("Payment not found, attempting verification refresh", payErr);
      // Try to refresh/verify transaction via existing function
      try {
        const { error: sessErr } = await supabase.functions.invoke("session-status", {
          body: { session_id: reference },
          headers: authHeader ? { Authorization: authHeader } : undefined,
        });
        if (sessErr) console.log("session-status error:", sessErr.message);
      } catch (e) {
        console.log("session-status exception:", e);
      }
      // Refetch payment
      const refetch = await supabase
        .from("payments")
        .select("*")
        .eq("paystack_reference", reference)
        .single();
      payment = refetch.data;
    }

    if (!payment) {
      return new Response(JSON.stringify({ success: false, error: "Payment not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2) Ownership check: if payment has user_id, it must match current user
    if (payment.user_id && user && payment.user_id !== user.id) {
      return new Response(JSON.stringify({ success: false, error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 3) If appointment already linked, return success
    if (payment.status === "completed" && payment.appointment_id) {
      return new Response(
        JSON.stringify({ success: true, appointment_id: payment.appointment_id, alreadyProcessed: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const metadata = payment.metadata as any;
    if (!metadata || metadata.type !== "booking") {
      return new Response(JSON.stringify({ success: false, error: "Invalid payment type" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 4) Fetch service type mappings
    const typeIds: string[] = Array.isArray(metadata.serviceTypeIds) ? metadata.serviceTypeIds : [];
    if (typeIds.length === 0) {
      return new Response(JSON.stringify({ success: false, error: "No service types provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: typeMappings, error: typeErr } = await supabase
      .from("service_types")
      .select("id, service_id")
      .in("id", typeIds);

    if (typeErr) {
      console.log("Type mapping fetch error:", typeErr);
      return new Response(JSON.stringify({ success: false, error: "Failed to fetch service types" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!typeMappings || typeMappings.length === 0) {
      return new Response(JSON.stringify({ success: false, error: "Selected services could not be found" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const filtered = typeMappings
      .map((st: any) => ({ service_id: st.service_id, service_type_id: st.id }))
      .filter((r) => r.service_id && r.service_type_id);

    if (filtered.length === 0) {
      return new Response(JSON.stringify({ success: false, error: "Invalid service selection" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Deduplicate by service_id to avoid unique constraint (appointment_id, service_id)
    const uniqueByService = new Map<string, { service_id: string; service_type_id: string }>();
    for (const r of filtered) {
      if (!uniqueByService.has(r.service_id)) uniqueByService.set(r.service_id, r);
    }
    const toLink = Array.from(uniqueByService.values());

    // 5) Create appointment
    const { data: orderId } = await supabase.rpc("generate_appointment_reference");

    const { data: appointment, error: apptErr } = await supabase
      .from("appointments")
      .insert({
        client_id: user?.id ?? payment.user_id, // fallback to payment user
        service_id: null,
        stylist_id: metadata.stylistId,
        appointment_date: metadata.appointmentDate,
        appointment_time: metadata.appointmentTime,
        notes: metadata.notes || "",
        status: "confirmed",
        order_id: orderId || null,
      })
      .select()
      .single();

    if (apptErr || !appointment) {
      console.log("Appointment creation error:", apptErr);
      return new Response(JSON.stringify({ success: false, error: "Failed to create appointment" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 6) Link services
    const rows = toLink.map((r) => ({
      appointment_id: appointment.id,
      service_id: r.service_id,
      service_type_id: r.service_type_id,
    }));

    const { error: linkErr } = await supabase.from("appointment_services").insert(rows);
    if (linkErr) {
      console.log("Appointment services linking error:", linkErr);
      return new Response(JSON.stringify({ success: false, error: "Failed to link services to appointment" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 7) Update payment
    const { error: payUpdateErr } = await supabase
      .from("payments")
      .update({ appointment_id: appointment.id, status: "completed" })
      .eq("id", payment.id);
    if (payUpdateErr) {
      console.log("Payment update error:", payUpdateErr);
    }

    // 8) Trigger earnings processing (best-effort)
    try {
      const { error: earnErr } = await supabase.functions.invoke("process-earnings", {
        body: { appointment_id: appointment.id },
        headers: authHeader ? { Authorization: authHeader } : undefined,
      });
      if (earnErr) console.log("process-earnings error:", earnErr.message);
    } catch (e) {
      console.log("process-earnings exception:", e);
    }

    return new Response(
      JSON.stringify({ success: true, appointment_id: appointment.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err: any) {
    console.error("finalize-booking exception:", err);
    return new Response(JSON.stringify({ success: false, error: err?.message || "Unexpected error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
