
export interface Service {
  id: string;
  name: string;
  description: string | null;
  duration: string;
  price: string;
  stylist_id: string;
  image_urls: string[];
  category: string;
}
