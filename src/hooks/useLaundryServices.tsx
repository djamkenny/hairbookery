import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LaundryService, LaundryOrder } from "@/types/laundry";
import { toast } from "sonner";

export const useLaundryServices = () => {
  const [services, setServices] = useState<LaundryService[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('laundry_services')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching laundry services:', error);
        toast.error('Failed to load cleaning services');
        return;
      }

      setServices(data || []);
    } catch (error) {
      console.error('Error fetching laundry services:', error);
      toast.error('Failed to load cleaning services');
    } finally {
      setLoading(false);
    }
  };

  return { services, loading, refetch: fetchServices };
};

export const useLaundryOrders = () => {
  const [orders, setOrders] = useState<LaundryOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('laundry_orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching laundry orders:', error);
        toast.error('Failed to load cleaning orders');
        return;
      }

      setOrders((data || []) as LaundryOrder[]);
    } catch (error) {
      console.error('Error fetching laundry orders:', error);
      toast.error('Failed to load cleaning orders');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string, notes?: string) => {
    try {
      const updates: any = { 
        status,
        updated_at: new Date().toISOString()
      };

      // Set the appropriate timestamp field based on status
      switch (status) {
        case 'picked_up':
          updates.pickup_completed_at = new Date().toISOString();
          break;
        case 'washing':
          updates.washing_started_at = new Date().toISOString();
          break;
        case 'ready':
          updates.ready_at = new Date().toISOString();
          break;
        case 'out_for_delivery':
          updates.out_for_delivery_at = new Date().toISOString();
          break;
        case 'delivered':
          updates.delivered_at = new Date().toISOString();
          break;
      }

      const { error } = await supabase
        .from('laundry_orders')
        .update(updates)
        .eq('id', orderId);

      if (error) {
        console.error('Error updating order status:', error);
        toast.error('Failed to update order status');
        return false;
      }

      // Add status history entry
      const { error: historyError } = await supabase
        .from('laundry_status_history')
        .insert({
          order_id: orderId,
          status,
          notes: notes || `Status updated to ${status}`,
        });

      if (historyError) {
        console.error('Error adding status history:', historyError);
        // Don't return false here as the main update succeeded
      }

      toast.success('Order status updated successfully');
      fetchOrders(); // Refresh the orders
      return true;
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
      return false;
    }
  };

  return { 
    orders, 
    loading, 
    refetch: fetchOrders, 
    updateOrderStatus 
  };
};