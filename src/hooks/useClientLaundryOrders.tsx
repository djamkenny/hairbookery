import { useState, useEffect } from "react";
import { LaundryOrder, LaundryOrderStatus } from "@/types/laundry";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ClientLaundryOrderData extends LaundryOrder {
  service_name?: string;
  specialist_name?: string;
}

export const useClientLaundryOrders = (userId: string | undefined) => {
  const [orders, setOrders] = useState<ClientLaundryOrderData[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLaundryOrders = async (userId: string) => {
    if (!userId) return;

    try {
      setLoading(true);
      console.log("Fetching laundry orders for client:", userId);

      // Fetch laundry orders for this client
      const { data: ordersData, error } = await supabase
        .from('laundry_orders')
        .select('*')
        .eq('client_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching laundry orders:", error);
        return;
      }

      console.log("Raw laundry orders data:", ordersData);

      if (!ordersData || ordersData.length === 0) {
        console.log("No laundry orders found for client");
        setOrders([]);
        return;
      }

      // Get laundry service information
      const serviceIds = [...new Set(ordersData.map(order => order.service_type))];
      const { data: serviceData } = await supabase
        .from('laundry_services')
        .select('id, name')
        .in('id', serviceIds);

      // Get specialist information
      const specialistIds = [...new Set(ordersData.map(order => order.specialist_id).filter(Boolean))];
      const { data: specialistProfiles } = specialistIds.length > 0 ? await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', specialistIds) : { data: [] };

      const serviceMap = (serviceData || []).reduce((map, service) => {
        map[service.id] = service;
        return map;
      }, {} as Record<string, any>);

      const specialistMap = (specialistProfiles || []).reduce((map, profile) => {
        map[profile.id] = profile;
        return map;
      }, {} as Record<string, any>);

      const formattedOrders: ClientLaundryOrderData[] = ordersData.map(order => ({
        ...order,
        status: order.status as LaundryOrderStatus,
        service_name: serviceMap[order.service_type]?.name || 'Laundry Service',
        specialist_name: order.specialist_id ? specialistMap[order.specialist_id]?.full_name || 'Specialist' : 'Pending Assignment'
      }));

      console.log("Formatted laundry orders:", formattedOrders);
      setOrders(formattedOrders);
    } catch (error) {
      console.error("Error in fetchLaundryOrders:", error);
      toast.error("Failed to load laundry orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchLaundryOrders(userId);

      // Set up real-time subscription for laundry order updates
      const channel = supabase
        .channel('client_laundry_orders')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'laundry_orders',
            filter: `client_id=eq.${userId}`
          }, 
          (payload) => {
            console.log("Client laundry order changed:", payload);
            
            // Refetch orders when there's a change
            fetchLaundryOrders(userId);
            
            // Show toast notification based on the type of change
            if (payload.eventType === 'UPDATE') {
              const newStatus = payload.new.status;
              const orderNumber = payload.new.order_number;
              
              if (newStatus === 'picked_up') {
                toast.success(`Your laundry has been picked up. Order: ${orderNumber}`);
              } else if (newStatus === 'washing') {
                toast.success(`Washing has started for order: ${orderNumber}`);
              } else if (newStatus === 'ready') {
                toast.success(`Your laundry is ready for delivery. Order: ${orderNumber}`);
              } else if (newStatus === 'out_for_delivery') {
                toast.success(`Your laundry is out for delivery. Order: ${orderNumber}`);
              } else if (newStatus === 'delivered') {
                toast.success(`Your laundry has been delivered. Order: ${orderNumber}`);
              }
            } else if (payload.eventType === 'INSERT') {
              toast.success('New laundry order created');
            }
          }
        )
        .subscribe();

      // Cleanup subscription on unmount
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [userId]);

  return {
    orders,
    loading,
    refetch: () => userId && fetchLaundryOrders(userId)
  };
};