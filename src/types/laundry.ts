export interface LaundryService {
  id: string;
  name: string;
  description: string | null;
  price_per_kg: number;
  base_price: number;
  turnaround_days: number;
  is_express: boolean;
  created_at: string;
  updated_at: string;
}

export interface LaundryOrder {
  id: string;
  client_id: string;
  specialist_id: string | null;
  order_number: string;
  service_type: string;
  pickup_address: string;
  pickup_instructions: string | null;
  delivery_address: string | null;
  delivery_instructions: string | null;
  pickup_date: string;
  pickup_time: string;
  delivery_date: string | null;
  delivery_time: string | null;
  status: LaundryOrderStatus;
  amount: number | null;
  payment_id: string | null;
  items_description: string | null;
  special_instructions: string | null;
  weight_kg: number | null;
  created_at: string;
  updated_at: string;
  pickup_completed_at: string | null;
  washing_started_at: string | null;
  ready_at: string | null;
  out_for_delivery_at: string | null;
  delivered_at: string | null;
}

export type LaundryOrderStatus = 
  | 'pending_pickup' 
  | 'picked_up' 
  | 'washing' 
  | 'ready' 
  | 'out_for_delivery' 
  | 'delivered' 
  | 'cancelled';

export interface LaundryStatusHistory {
  id: string;
  order_id: string;
  status: LaundryOrderStatus;
  notes: string | null;
  updated_by: string | null;
  created_at: string;
}

export interface LaundryBookingData {
  serviceType: string;
  pickupAddress: string;
  pickupInstructions: string;
  deliveryAddress: string;
  deliveryInstructions: string;
  pickupDate: string;
  pickupTime: string;
  deliveryDate: string;
  deliveryTime: string;
  itemsDescription: string;
  specialInstructions: string;
  estimatedWeight: number;
  totalAmount: number;
}

export const LAUNDRY_STATUS_LABELS = {
  pending_pickup: 'Pending Pickup',
  picked_up: 'Picked Up',
  washing: 'Washing',
  ready: 'Ready',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
} as const;

export const LAUNDRY_STATUS_COLORS = {
  pending_pickup: 'bg-yellow-100 text-yellow-800',
  picked_up: 'bg-blue-100 text-blue-800',
  washing: 'bg-purple-100 text-purple-800',
  ready: 'bg-green-100 text-green-800',
  out_for_delivery: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-red-100 text-red-800',
} as const;