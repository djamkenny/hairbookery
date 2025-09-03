import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface CleaningOrder {
  id: string;
  client_id: string;
  specialist_id: string | null;
  order_number: string;
  service_type: string;
  property_type: string;
  num_rooms: number | null;
  num_bathrooms: number | null;
  square_footage: number | null;
  service_date: string;
  service_time: string;
  duration_hours: number;
  service_address: string;
  special_instructions: string | null;
  addon_services: string[] | null;
  amount: number | null;
  payment_id: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
}

export const useCleaningAppointments = () => {
  const [orders, setOrders] = useState<CleaningOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<CleaningOrder | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("User not authenticated");
      }

      const { data, error } = await supabase
        .from('cleaning_orders')
        .select('*')
        .eq('specialist_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setOrders(data || []);
    } catch (error: any) {
      console.error("Error fetching cleaning orders:", error);
      toast.error("Failed to fetch cleaning orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('cleaning_orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      toast.success("Order status updated successfully");
      await fetchOrders();
    } catch (error: any) {
      console.error("Error updating order status:", error);
      toast.error("Failed to update order status");
    }
  };

  const handleViewDetails = (order: CleaningOrder) => {
    setSelectedOrder(order);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setSelectedOrder(null);
    setIsDetailsModalOpen(false);
  };

  return {
    orders,
    loading,
    selectedOrder,
    isDetailsModalOpen,
    handleUpdateStatus,
    handleViewDetails,
    handleCloseDetailsModal,
    fetchOrders,
  };
};