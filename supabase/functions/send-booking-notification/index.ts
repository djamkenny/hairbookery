import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BookingNotificationRequest {
  specialistId: string;
  bookingType: 'beauty' | 'laundry' | 'cleaning';
  appointmentDetails: {
    clientName: string;
    serviceName?: string;
    appointmentDate: string;
    appointmentTime: string;
    orderId: string;
    specialInstructions?: string;
    serviceAddress?: string;
    pickupAddress?: string;
    deliveryAddress?: string;
    amount?: number;
  };
}

const handler = async (req: Request): Promise<Response> => {
  console.log("send-booking-notification function called");
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    const { specialistId, bookingType, appointmentDetails }: BookingNotificationRequest = await req.json();
    console.log("Processing booking notification:", { specialistId, bookingType, appointmentDetails });

    // Get specialist profile and email
    const { data: specialist } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", specialistId)
      .single();

    if (!specialist?.email) {
      console.error("Specialist email not found for ID:", specialistId);
      throw new Error("Specialist email not found");
    }
    
    console.log("Found specialist email:", specialist.email);

    // Generate email content based on booking type
    let subject: string;
    let html: string;

    switch (bookingType) {
      case 'beauty':
        subject = `New Beauty Appointment - Order ${appointmentDetails.orderId}`;
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">New Beauty Appointment Booked!</h2>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Appointment Details</h3>
              <p><strong>Client:</strong> ${appointmentDetails.clientName}</p>
              <p><strong>Service:</strong> ${appointmentDetails.serviceName || 'Multiple Services'}</p>
              <p><strong>Date:</strong> ${appointmentDetails.appointmentDate}</p>
              <p><strong>Time:</strong> ${appointmentDetails.appointmentTime}</p>
              <p><strong>Order ID:</strong> ${appointmentDetails.orderId}</p>
              ${appointmentDetails.amount ? `<p><strong>Total Amount:</strong> ₵${(appointmentDetails.amount / 100).toFixed(2)}</p>` : ''}
              ${appointmentDetails.specialInstructions ? `<p><strong>Special Instructions:</strong> ${appointmentDetails.specialInstructions}</p>` : ''}
            </div>
            
            <p>Please log in to your dashboard to view more details and manage this appointment.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${Deno.env.get("SUPABASE_URL")?.replace('.supabase.co', '.vercel.app') || '#'}/stylist-dashboard" 
                 style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                View Dashboard
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px;">
              Best regards,<br>
              KnL Bookery Team
            </p>
          </div>
        `;
        break;
        
      case 'laundry':
        subject = `New Laundry Order - Order ${appointmentDetails.orderId}`;
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">New Laundry Order Assigned!</h2>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Order Details</h3>
              <p><strong>Client:</strong> ${appointmentDetails.clientName}</p>
              <p><strong>Pickup Date:</strong> ${appointmentDetails.appointmentDate}</p>
              <p><strong>Pickup Time:</strong> ${appointmentDetails.appointmentTime}</p>
              <p><strong>Order ID:</strong> ${appointmentDetails.orderId}</p>
              ${appointmentDetails.pickupAddress ? `<p><strong>Pickup Address:</strong> ${appointmentDetails.pickupAddress}</p>` : ''}
              ${appointmentDetails.deliveryAddress ? `<p><strong>Delivery Address:</strong> ${appointmentDetails.deliveryAddress}</p>` : ''}
              ${appointmentDetails.amount ? `<p><strong>Total Amount:</strong> ₵${(appointmentDetails.amount / 100).toFixed(2)}</p>` : ''}
              ${appointmentDetails.specialInstructions ? `<p><strong>Special Instructions:</strong> ${appointmentDetails.specialInstructions}</p>` : ''}
            </div>
            
            <p>Please log in to your dashboard to view more details and manage this laundry order.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${Deno.env.get("SUPABASE_URL")?.replace('.supabase.co', '.vercel.app') || '#'}/stylist-dashboard" 
                 style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                View Dashboard
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px;">
              Best regards,<br>
              KnL Bookery Team
            </p>
          </div>
        `;
        break;
        
      case 'cleaning':
        subject = `New Cleaning Service - Order ${appointmentDetails.orderId}`;
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">New Cleaning Service Booked!</h2>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Service Details</h3>
              <p><strong>Client:</strong> ${appointmentDetails.clientName}</p>
              <p><strong>Service Date:</strong> ${appointmentDetails.appointmentDate}</p>
              <p><strong>Service Time:</strong> ${appointmentDetails.appointmentTime}</p>
              <p><strong>Order ID:</strong> ${appointmentDetails.orderId}</p>
              ${appointmentDetails.serviceAddress ? `<p><strong>Service Address:</strong> ${appointmentDetails.serviceAddress}</p>` : ''}
              ${appointmentDetails.amount ? `<p><strong>Total Amount:</strong> ₵${(appointmentDetails.amount / 100).toFixed(2)}</p>` : ''}
              ${appointmentDetails.specialInstructions ? `<p><strong>Special Instructions:</strong> ${appointmentDetails.specialInstructions}</p>` : ''}
            </div>
            
            <p>Please log in to your dashboard to view more details and manage this cleaning service.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${Deno.env.get("SUPABASE_URL")?.replace('.supabase.co', '.vercel.app') || '#'}/stylist-dashboard" 
                 style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                View Dashboard
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px;">
              Best regards,<br>
              KnL Bookery Team
            </p>
          </div>
        `;
        break;
        
      default:
        throw new Error(`Unknown booking type: ${bookingType}`);
    }

    // Send email using Resend
    const emailResponse = await resend.emails.send({
      from: "KnL Bookery <team@notification.knlbookery.com>",
      to: [specialist.email],
      subject: subject,
      html: html,
    });

    console.log("Booking notification email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("Error in send-booking-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);