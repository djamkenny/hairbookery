export interface AppointmentServiceDisplay {
  name?: string;
  baseServiceName?: string;
  typeName?: string;
  price?: number;   // in base currency units
  duration?: number; // in minutes
}

export interface Appointment {
  id: string;
  client: string;
  service: string;
  date: string;
  time: string;
  status: string; // "pending" | "confirmed" | "completed" | "canceled"
  clientEmail?: string;
  clientPhone?: string;
  client_id: string;
  updated_at?: string;
  stylist?: string;
  order_id?: string; // Unique order ID for client identification
  amount?: number;   // <----- new field: payment amount in pesewas
  services?: AppointmentServiceDisplay[]; // Detailed list of booked service types
}
