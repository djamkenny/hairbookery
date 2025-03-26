
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
}
