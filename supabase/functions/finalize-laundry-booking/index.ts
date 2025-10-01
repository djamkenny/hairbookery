import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body
    const { reference } = await req.json();
    
    if (!reference) {
      throw new Error('Payment reference is required');
    }

    // Initialize Supabase client with service role key for admin operations
    const supabaseServiceRole = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    // Initialize regular client for user authentication
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Get authenticated user
    const authHeader = req.headers.get('Authorization')!;
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('User not authenticated');
    }

    console.log(`Processing laundry booking for user: ${user.id}, reference: ${reference}`);

    // Get payment details from database
    const { data: payment, error: paymentError } = await supabaseServiceRole
      .from('payments')
      .select('*')
      .eq('paystack_reference', reference)
      .single();

    if (paymentError) {
      console.error('Error fetching payment:', paymentError);
      throw new Error('Payment not found');
    }

    console.log('Payment found:', payment);

    // Verify payment belongs to user (if user_id is set)
    if (payment.user_id && payment.user_id !== user.id) {
      throw new Error('Payment does not belong to authenticated user');
    }

    // Check if payment is already processed and has laundry order
    if (payment.status === 'completed') {
      const { data: existingOrder } = await supabaseServiceRole
        .from('laundry_orders')
        .select('id')
        .eq('payment_id', payment.id)
        .single();

      if (existingOrder) {
        console.log('Laundry order already exists for this payment');
        return new Response(
          JSON.stringify({ success: true, order_id: existingOrder.id }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        );
      }
    }

    // Validate payment metadata for laundry booking
    const metadata = payment.metadata || {};
    
    if (metadata.type !== 'laundry') {
      throw new Error('Payment is not for a laundry service');
    }

    console.log('Payment metadata:', metadata);

    // Find an available laundry specialist
    const { data: availableSpecialists, error: specialistError } = await supabaseServiceRole
      .from('profiles')
      .select('id, full_name')
      .eq('is_laundry_specialist', true)
      .eq('availability', true)
      .limit(1);

    if (specialistError) {
      console.error('Error finding laundry specialists:', specialistError);
    }

    const assignedSpecialist = availableSpecialists?.[0] || null;

    // Create laundry order
    const { data: laundryOrder, error: orderError } = await supabaseServiceRole
      .from('laundry_orders')
      .insert({
        client_id: user.id,
        specialist_id: assignedSpecialist?.id || null,
        service_type: metadata.serviceType,
        pickup_address: metadata.pickupAddress,
        pickup_instructions: metadata.pickupInstructions || null,
        delivery_address: metadata.deliveryAddress,
        delivery_instructions: metadata.deliveryInstructions || null,
        pickup_date: metadata.pickupDate,
        pickup_time: metadata.pickupTime,
        delivery_date: metadata.deliveryDate || null,
        delivery_time: metadata.deliveryTime || null,
        amount: metadata.servicePrice ? Math.round(metadata.servicePrice * 100) : payment.amount, // Store service price in pesewas
        payment_id: payment.id,
        items_description: metadata.itemsDescription || null,
        special_instructions: metadata.specialInstructions || null,
        weight_kg: metadata.estimatedWeight || null,
        status: 'pending_pickup'
      })
      .select()
      .single();

    if (orderError) {
      console.error('Error creating laundry order:', orderError);
      throw new Error('Failed to create laundry order: ' + orderError.message);
    }

    console.log('Laundry order created:', laundryOrder);

    // Create appointment record in appointments table for tracking purposes only
    const appointmentOrderId = `LDR-${new Date(metadata.pickupDate).toISOString().slice(0, 10).replace(/-/g, '')}-${String(Math.floor(Math.random() * 99999) + 1).padStart(5, '0')}`;
    
    const { data: appointment, error: appointmentError } = await supabaseServiceRole
      .from('appointments')
      .insert({
        client_id: user.id,
        stylist_id: assignedSpecialist?.id || null,
        appointment_date: metadata.pickupDate,
        appointment_time: metadata.pickupTime,
        notes: `Laundry Service: ${metadata.serviceType}. Items: ${metadata.itemsDescription || 'Not specified'}. Special instructions: ${metadata.specialInstructions || 'None'}`,
        order_id: appointmentOrderId,
        status: 'pending'
      })
      .select()
      .single();

    if (appointmentError) {
      console.log('Warning: Failed to create appointment record:', appointmentError);
      // Don't throw error here as the laundry order was created successfully
    } else {
      console.log('Appointment record created:', appointment);
    }

    // Notify assigned specialist if one was found
    if (assignedSpecialist) {
      await supabaseServiceRole
        .from('notifications')
        .insert({
          user_id: assignedSpecialist.id,
          title: 'New Laundry Order Assigned',
          message: `A new laundry order #${laundryOrder.order_number} has been assigned to you. Pickup scheduled for ${metadata.pickupDate} at ${metadata.pickupTime}.`,
          type: 'laundry_order_assigned',
          related_id: laundryOrder.id
        });

      // Send email notification to specialist
      try {
        const { data: clientProfile } = await supabaseServiceRole
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .single();

        // Calculate total: service price + booking fee (₵5 = 500 pesewas)
        const servicePricePesewas = metadata.servicePrice ? Math.round(metadata.servicePrice * 100) : 0;
        const bookingFeePesewas = 500;
        const totalAmountPesewas = servicePricePesewas + bookingFeePesewas;

        const { error: emailErr } = await supabaseServiceRole.functions.invoke("send-booking-notification", {
          body: {
            specialistId: assignedSpecialist.id,
            bookingType: "laundry",
            appointmentDetails: {
              clientName: clientProfile?.full_name || "Client",
              appointmentDate: metadata.pickupDate,
              appointmentTime: metadata.pickupTime,
              orderId: laundryOrder.order_number,
              pickupAddress: metadata.pickupAddress,
              deliveryAddress: metadata.deliveryAddress,
              specialInstructions: metadata.specialInstructions,
              amount: totalAmountPesewas
            }
          }
        });
        
        if (emailErr) {
          console.log("Email notification error:", emailErr);
        } else {
          console.log("Laundry email notification sent successfully");
        }
      } catch (emailException) {
        console.log("Laundry email notification exception:", emailException);
      }
    }


    // Update payment status to completed and link order
    const { error: updateError } = await supabaseServiceRole
      .from('payments')
      .update({
        status: 'completed'
      })
      .eq('id', payment.id);

    if (updateError) {
      console.error('Error updating payment status:', updateError);
      // Don't throw here as the order was created successfully
    }

    // Create notification for user
    await supabaseServiceRole
      .from('notifications')
      .insert({
        user_id: user.id,
        title: 'Laundry Order Confirmed',
        message: `Your laundry order #${laundryOrder.order_number} has been confirmed. We'll pick up your items on ${metadata.pickupDate} at ${metadata.pickupTime}.`,
        type: 'laundry_order',
        related_id: laundryOrder.id
      });

    console.log('Laundry booking finalized successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        order_id: laundryOrder.id,
        order_number: laundryOrder.order_number
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error: any) {
    console.error('Error in finalize-laundry-booking:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Internal server error' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});