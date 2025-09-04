import { serve } from "https://deno.land/std@0.208.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { reference } = await req.json()
    console.log('Finalizing cleaning booking for reference:', reference)

    if (!reference) {
      return new Response(
        JSON.stringify({ success: false, error: 'Payment reference is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Verify payment with Paystack
    const paystackSecretKey = Deno.env.get('PAYSTACK_SECRET_KEY')
    if (!paystackSecretKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'Payment configuration error' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const verifyResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        'Authorization': `Bearer ${paystackSecretKey}`,
      }
    })

    const verifyData = await verifyResponse.json()
    console.log('Paystack verification:', verifyData)

    if (!verifyData.status || verifyData.data.status !== 'success') {
      return new Response(
        JSON.stringify({ success: false, error: 'Payment verification failed' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get payment record
    const { data: paymentRecord, error: paymentError } = await supabase
      .from('payments')
      .select('*')
      .eq('paystack_reference', reference)
      .single()

    if (paymentError || !paymentRecord) {
      console.error('Payment record not found:', paymentError)
      return new Response(
        JSON.stringify({ success: false, error: 'Payment record not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Update payment status
    await supabase
      .from('payments')
      .update({ 
        status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('id', paymentRecord.id)

    // Get metadata from payment record
    const metadata = paymentRecord.metadata as any

    // Get cleaning order details and calculate full service cost
    const { data: serviceData, error: serviceError } = await supabase
      .from('cleaning_services')
      .select('*')
      .eq('id', metadata.service_id)
      .single()

    if (serviceError || !serviceData) {
      console.error('Service data fetch error:', serviceError)
      return new Response(
        JSON.stringify({ success: false, error: 'Service data not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Calculate full service cost (not just booking fee)
    const fullServiceCost = serviceData.total_price; // This is already in pesewas

    // Create cleaning order
    const { data: cleaningOrder, error: orderError } = await supabase
      .from('cleaning_orders')
      .insert({
        client_id: paymentRecord.user_id,
        specialist_id: metadata.specialist_id,
        service_type: metadata.service_id,
        service_date: metadata.service_date,
        service_time: metadata.service_time,
        service_address: metadata.service_address,
        property_type: metadata.property_type || 'house',
        num_rooms: metadata.num_rooms,
        num_bathrooms: metadata.num_bathrooms,
        square_footage: metadata.square_footage,
        special_instructions: metadata.special_instructions,
        addon_services: metadata.selected_addons || [],
        customer_name: metadata.customer_name,
        customer_phone: metadata.customer_phone,
        customer_email: metadata.customer_email,
        amount: fullServiceCost, // Store full service amount, not just booking fee
        payment_id: paymentRecord.id,
        status: 'pending'
      })
      .select()
      .single()

    if (orderError) {
      console.error('Cleaning order creation error:', orderError)
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to create cleaning order' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Create notification for specialist
    await supabase.rpc('create_notification', {
      p_user_id: metadata.specialist_id,
      p_title: 'New Cleaning Service Booking',
      p_message: `You have a new cleaning service booking for ${metadata.service_date} at ${metadata.service_time}`,
      p_type: 'cleaning_booking',
      p_related_id: cleaningOrder.id,
      p_action_url: '/stylist-dashboard'
    })

    console.log('Cleaning booking finalized successfully:', cleaningOrder.id)

    return new Response(
      JSON.stringify({
        success: true,
        orderId: cleaningOrder.id,
        orderNumber: cleaningOrder.order_number
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Cleaning booking finalization error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})