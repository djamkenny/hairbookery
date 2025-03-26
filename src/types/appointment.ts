
export interface Appointment {
  id: string;
  client: string;
  service: string;
  date: string;
  time: string;
  status: string;
  clientEmail?: string;
  clientPhone?: string;
  client_id: string;
}
