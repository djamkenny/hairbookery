export interface Service {
  id: string;
  name: string;
  description: string | null;
  duration: string;
  price: string;
  stylist_id: string;
  image_urls: string[];
  category: string;
  is_base_service?: boolean;
}

export interface ServiceType {
  id: string;
  service_id: string;
  name: string;
  description: string | null;
  price: number;
  duration: number; // in minutes
  created_at: string;
  updated_at: string;
}

export interface ServiceWithTypes extends Service {
  service_types: ServiceType[];
}