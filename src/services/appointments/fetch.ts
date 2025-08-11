
import { supabase } from "@/integrations/supabase/client";
import { Appointment } from "@/types/appointment";
import { format } from "date-fns";

export const fetchStylistAppointments = async (): Promise<Appointment[]> => {
  try {
    // Get the authenticated user
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.log("No authenticated user found");
      return [];
    }

    console.log("Fetching appointments for stylist:", user.id);

    // 1. Fetch appointments for this stylist
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *
      `)
      .eq('stylist_id', user.id)
      .is('canceled_at', null);

    if (error) {
      console.error("Error fetching appointments:", error);
      throw error;
    }

    if (!data || data.length === 0) {
      console.log("No appointments found for stylist");
      return [];
    }

    // 2. Fetch services for all appointments
    const appointmentIds = data.map((apt: any) => apt.id);
    
    let servicesMap: Record<string, any[]> = {};
    if (appointmentIds.length > 0) {
      const { data: appointmentServicesData, error: servicesError } = await supabase
        .from('appointment_services')
        .select(`
          appointment_id,
          service_id,
          service_type_id,
          services:service_id(name, price, duration),
          service_types:service_type_id(name, price, duration)
        `)
        .in('appointment_id', appointmentIds);

      if (servicesError) {
        console.error("Error fetching appointment services:", servicesError);
      }
      if (appointmentServicesData) {
        servicesMap = appointmentServicesData.reduce((map, item: any) => {
          if (!map[item.appointment_id]) {
            map[item.appointment_id] = [];
          }
          const base = item.services || {};
          const type = item.service_types || {};
          const display = {
            name: (type?.name || base?.name) as string,
            baseServiceName: base?.name as string | undefined,
            typeName: type?.name as string | undefined,
            price: Number(type?.price ?? base?.price ?? 0),
            duration: Number(type?.duration ?? base?.duration ?? 0),
          };
          map[item.appointment_id].push(display);
          return map;
        }, {} as Record<string, any[]>);
      }
    }

    // 3. Fetch payments for these appointments
    let paymentsMap: Record<string, { amount: number }> = {};
    if (appointmentIds.length > 0) {
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payments')
        .select('appointment_id, amount, status')
        .in('appointment_id', appointmentIds)
        .eq('status', 'completed');  // ONLY fetch completed payments

      if (paymentsError) {
        console.error("Error fetching payments for appointments:", paymentsError);
      }
      if (paymentsData) {
        paymentsMap = paymentsData.reduce((map, rec) => {
          map[rec.appointment_id] = rec;
          return map;
        }, {} as Record<string, { amount: number }>);
      }
    }

    // Get all unique client IDs from the appointments
    const clientIds = [...new Set(data.map((appointment: any) => appointment.client_id))];
    
    // Fetch client profiles in a separate query
    const { data: clientProfiles, error: clientError } = await supabase
      .from('profiles')
      .select('id, full_name, email, phone')
      .in('id', clientIds);

    if (clientError) {
      console.error("Error fetching client profiles:", clientError);
    }

    // Create a map of client profiles by ID for easy lookup
    const clientProfileMap = (clientProfiles || []).reduce((map, profile) => {
      map[profile.id] = profile;
      return map;
    }, {} as Record<string, any>);

    console.log("Client profiles found:", clientProfiles?.length || 0);
    console.log("Client profile map:", clientProfileMap);

    // Format the appointments data with client info from the map and attach payment amount
    const formattedAppointments = data.map((appointment: any) => {
      const clientProfile = clientProfileMap[appointment.client_id] || {};
      // Use mapped payment data
      const paymentEntry = paymentsMap[appointment.id];
      const amount = paymentEntry?.amount ?? 0;

      // Get the actual client name from the profile or fall back to "Unknown Client"
      const clientName = clientProfile.full_name || "Unknown Client";
      
      // Get services for this appointment
      const appointmentServices = servicesMap[appointment.id] || [];
      const serviceLabels = appointmentServices.map(s => {
        if (s?.typeName) {
          return `${s.baseServiceName ? s.baseServiceName + ' — ' : ''}${s.typeName}`;
        }
        return s?.name || "Service";
      }).filter(Boolean);
      const serviceName = serviceLabels.length > 0
        ? serviceLabels.length === 1
          ? serviceLabels[0]
          : `${serviceLabels.length} Services: ${serviceLabels.join(', ')}`
        : "Service";
      
      console.log(`Appointment ${appointment.id}: client_id=${appointment.client_id}, clientName=${clientName}, services=${serviceLabels.join(', ')}`);

      return {
        id: appointment.id,
        client: clientName, // Use the actual client name here
        service: serviceName,
        services: appointmentServices, // Add full services array
        date: format(new Date(appointment.appointment_date), "MMMM dd, yyyy"),
        time: appointment.appointment_time,
        status: appointment.status,
        clientEmail: clientProfile.email,
        clientPhone: clientProfile.phone,
        client_id: appointment.client_id,
        order_id: appointment.order_id || undefined,
        created_at: appointment.created_at,
        amount, // payment amount if available
      };
    });

    console.log("Formatted appointments with client names:", formattedAppointments);
    return formattedAppointments;
  } catch (error) {
    console.error("Error in fetchStylistAppointments:", error);
    throw error;
  }
};
