import { useState, useEffect } from "react";
import { LaundryOrder, LaundryOrderStatus } from "@/types/laundry";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface LaundryAppointmentData extends LaundryOrder {
  client_name?: string;
  client_phone?: string;
  service_name?: string;
  specialist_name?: string;
}

export const useLaundryAppointments = () => {
  const [orders, setOrders] = useState<LaundryAppointmentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<LaundryOrder | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  useEffect(() => {
    const loadLaundryOrders = async () => {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          console.log("No authenticated user found");
          return;
        }

        // Check if user is a laundry specialist
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_laundry_specialist')
          .eq('id', user.id)
          .single();

        if (!profile?.is_laundry_specialist) {
          console.log("User is not a laundry specialist");
          return;
        }

        // Fetch laundry orders assigned to this specialist or unassigned orders
        const { data: ordersData, error } = await supabase
          .from('laundry_orders')
          .select('*')
          .or(`specialist_id.eq.${user.id},specialist_id.is.null`)
          .order('created_at', { ascending: false });

        if (error) {
          console.error("Error fetching laundry orders:", error);
          throw error;
        }

        // Get client information separately
        const clientIds = [...new Set((ordersData || []).map(order => order.client_id))];
        const { data: clientProfiles } = await supabase
          .from('profiles')
          .select('id, full_name, phone')
          .in('id', clientIds);

        // Get laundry service information
        const serviceIds = [...new Set((ordersData || []).map(order => order.service_type))];
        const { data: serviceData } = await supabase
          .from('laundry_services')
          .select('id, name')
          .in('id', serviceIds);

        // Get specialist information
        const specialistIds = [...new Set((ordersData || []).map(order => order.specialist_id).filter(Boolean))];
        const { data: specialistProfiles } = specialistIds.length > 0 ? await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', specialistIds) : { data: [] };

        const clientMap = (clientProfiles || []).reduce((map, profile) => {
          map[profile.id] = profile;
          return map;
        }, {} as Record<string, any>);

        const serviceMap = (serviceData || []).reduce((map, service) => {
          map[service.id] = service;
          return map;
        }, {} as Record<string, any>);

        const specialistMap = (specialistProfiles || []).reduce((map, profile) => {
          map[profile.id] = profile;
          return map;
        }, {} as Record<string, any>);

        const formattedOrders: LaundryAppointmentData[] = (ordersData || []).map(order => ({
          ...order,
          status: order.status as LaundryOrderStatus,
          client_name: clientMap[order.client_id]?.full_name || 'Unknown Client',
          client_phone: clientMap[order.client_id]?.phone || null,
          service_name: serviceMap[order.service_type]?.name || 'Laundry Service',
          specialist_name: order.specialist_id ? specialistMap[order.specialist_id]?.full_name || 'Specialist' : 'Unassigned'
        }));

        setOrders(formattedOrders);
      } catch (error: any) {
        console.error("Error loading laundry orders:", error);
        toast.error("Failed to load laundry orders");
      } finally {
        setLoading(false);
      }
    };

    loadLaundryOrders();
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('laundry_orders')
        .update({ 
          status: newStatus,
          [`${newStatus}_at`]: new Date().toISOString() // Update timestamp field
        })
        .eq('id', orderId);

      if (error) throw error;

      // Update local state
      setOrders(prev => prev.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus as LaundryOrderStatus }
          : order
      ));

      // Send notification to client
      const order = orders.find(o => o.id === orderId);
      if (order) {
        await supabase
          .from('notifications')
          .insert({
            user_id: order.client_id,
            title: 'Laundry Order Update',
            message: `Your laundry order #${order.order_number} status has been updated to: ${newStatus.replace('_', ' ')}`,
            type: 'laundry_status_update',
            related_id: orderId
          });
      }

      toast.success(`Order status updated to ${newStatus.replace('_', ' ')}`);
    } catch (error: any) {
      console.error('Error updating order status:', error);
      toast.error("Failed to update order status");
    }
  };

  const handleViewDetails = (order: LaundryOrder) => {
    setSelectedOrder(order);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedOrder(null);
  };

  return {
    orders,
    loading,
    selectedOrder,
    isDetailsModalOpen,
    handleUpdateStatus,
    handleViewDetails,
    handleCloseDetailsModal
  };
};