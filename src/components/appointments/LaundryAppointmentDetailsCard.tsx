import React from "react";
import { LaundryOrder } from "@/types/laundry";
import AppointmentDetailsCard from "./AppointmentDetailsCard";

interface LaundryAppointmentDetailsCardProps {
  order: LaundryOrder & { 
    client_name?: string; 
    client_phone?: string;
    service_name?: string;
    specialist_name?: string;
  };
  showClientInfo?: boolean;
}

const LaundryAppointmentDetailsCard = ({ 
  order, 
  showClientInfo = false 
}: LaundryAppointmentDetailsCardProps) => {
  const appointmentData = {
    id: order.id,
    type: 'laundry' as const,
    order_id: order.order_number,
    service_name: order.service_name || 'Laundry Service',
    specialist_name: order.specialist_name || 'Specialist',
    date: order.pickup_date,
    time: order.pickup_time,
    status: order.status,
    client_name: order.client_name || 'Client',
    client_phone: order.client_phone,
    amount: order.amount,
    pickup_address: order.pickup_address,
    delivery_address: order.delivery_address,
    pickup_date: order.pickup_date,
    pickup_time: order.pickup_time,
    delivery_date: order.delivery_date,
    delivery_time: order.delivery_time,
    items_description: order.items_description,
    special_instructions: order.special_instructions,
    estimated_weight: order.weight_kg ? Number(order.weight_kg) : undefined,
  };

  return (
    <AppointmentDetailsCard 
      appointment={appointmentData} 
      showClientInfo={showClientInfo}
    />
  );
};

export default LaundryAppointmentDetailsCard;