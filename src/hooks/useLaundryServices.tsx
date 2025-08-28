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
        toast.error('Failed to load laundry services');
        return;
      }

      setServices(data || []);
    } catch (error) {
      console.error('Error fetching laundry services:', error);
      toast.error('Failed to load laundry services');
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
        toast.error('Failed to load laundry orders');
        return;
      }

      setOrders((data || []) as LaundryOrder[]);
    } catch (error) {
      console.error('Error fetching laundry orders:', error);
      toast.error('Failed to load laundry orders');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string, notes?: string) => {
    try {
      const { error } = await supabase
        .from('laundry_orders')
        .update({ 
          status,
          [`${status}_at`]: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) {
        console.error('Error updating order status:', error);
        toast.error('Failed to update order status');
        return false;
      }

      // Add status history entry if notes provided
      if (notes) {
        await supabase
          .from('laundry_status_history')
          .insert({
            order_id: orderId,
            status,
            notes,
          });
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