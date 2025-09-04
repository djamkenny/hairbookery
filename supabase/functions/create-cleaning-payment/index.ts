import { serve } from "https://deno.land/std@0.208.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CleaningBookingData {
  serviceType: string;
  serviceDate: string;
  serviceTime: string;
  serviceAddress: string;
  propertyType?: string;
  numRooms?: number;
  numBathrooms?: number;
  squareFootage?: number;
  specialInstructions?: string;
  selectedAddons: string[];
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  totalAmount: number;
  specialistId?: string;
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

    const { data: { user } } = await supabase.auth.getUser(
      req.headers.get('Authorization')?.replace('Bearer ', '') ?? ''
    )

    if (!user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const bookingData: CleaningBookingData = await req.json()
    console.log('Cleaning booking data:', bookingData)

    // Validate required fields
    if (!bookingData.serviceType || !bookingData.serviceDate || !bookingData.serviceTime || 
        !bookingData.serviceAddress || !bookingData.customerName || !bookingData.customerPhone || 
        !bookingData.customerEmail || !bookingData.totalAmount) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required booking data' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get the cleaning service details
    const { data: serviceData, error: serviceError } = await supabase
      .from('cleaning_services')
      .select('*')
      .eq('id', bookingData.serviceType)
      .single()

    if (serviceError || !serviceData) {
      console.error('Service fetch error:', serviceError)
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid service selected' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Fixed booking fee of 10 GHS (1000 pesewas)
    const fixedBookingFee = 10
    const amountInPesewas = fixedBookingFee * 100

    // Initialize Paystack payment
    const paystackSecretKey = Deno.env.get('PAYSTACK_SECRET_KEY')
    if (!paystackSecretKey) {
      console.error('Paystack secret key not found')
      return new Response(
        JSON.stringify({ success: false, error: 'Payment configuration error' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Generate unique reference
    const reference = `CLN-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`

    // Create payment record first
    const { data: paymentData, error: paymentError } = await supabase
      .from('payments')
      .insert({
        user_id: user.id,
        amount: amountInPesewas,
        currency: 'ghs',
        description: `Cleaning Service Booking Fee (GHS ${fixedBookingFee}): ${serviceData.name}`,
        paystack_reference: reference,
        metadata: {
          booking_type: 'cleaning',
          service_id: bookingData.serviceType,
          service_date: bookingData.serviceDate,
          service_time: bookingData.serviceTime,
          service_address: bookingData.serviceAddress,
          property_type: bookingData.propertyType,
          num_rooms: bookingData.numRooms,
          num_bathrooms: bookingData.numBathrooms,
          square_footage: bookingData.squareFootage,
          special_instructions: bookingData.specialInstructions,
          selected_addons: bookingData.selectedAddons,
          customer_name: bookingData.customerName,
          customer_phone: bookingData.customerPhone,
          customer_email: bookingData.customerEmail,
          specialist_id: bookingData.specialistId || serviceData.specialist_id
        }
      })
      .select()
      .single()

    if (paymentError) {
      console.error('Payment record creation error:', paymentError)
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to create payment record' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Initialize Paystack transaction
    const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${paystackSecretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: bookingData.customerEmail,
        amount: amountInPesewas,
        reference: reference,
        currency: 'GHS',
        callback_url: `${req.headers.get('origin')}/payment-return?reference=${reference}&type=cleaning`,
        metadata: {
          booking_type: 'cleaning',
          service_name: serviceData.name,
          customer_name: bookingData.customerName,
          customer_phone: bookingData.customerPhone,
          service_date: bookingData.serviceDate,
          service_time: bookingData.serviceTime,
          payment_type: 'booking_fee'
        }
      })
    })

    const paystackData = await paystackResponse.json()
    console.log('Paystack response:', paystackData)

    if (!paystackData.status) {
      console.error('Paystack initialization failed:', paystackData)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: paystackData.message || 'Payment initialization failed' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Update payment record with Paystack details
    await supabase
      .from('payments')
      .update({
        paystack_access_code: paystackData.data.access_code,
        paystack_transaction_id: paystackData.data.id
      })
      .eq('id', paymentData.id)

    return new Response(
      JSON.stringify({
        success: true,
        paymentUrl: paystackData.data.authorization_url,
        reference: reference,
        accessCode: paystackData.data.access_code
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Cleaning payment creation error:', error)
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