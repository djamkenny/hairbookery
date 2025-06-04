
import { supabase } from "@/integrations/supabase/client";
import { Service } from "./types";
import { ServiceFormValues } from "./ServiceForm";

export const fetchServices = async (): Promise<Service[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("User not authenticated");
  }

  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("stylist_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data.map(service => ({
    id: service.id,
    name: service.name,
    description: service.description,
    price: service.price.toString(),
    duration: service.duration.toString(),
    stylist_id: service.stylist_id,
    image_urls: service.image_urls || []
  }));
};

export const createService = async (serviceData: ServiceFormValues): Promise<Service> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("User not authenticated");
  }

  const { data, error } = await supabase
    .from("services")
    .insert([{
      name: serviceData.name,
      description: serviceData.description || null,
      price: parseFloat(serviceData.price),
      duration: parseInt(serviceData.duration),
      stylist_id: user.id,
      image_urls: []
    }])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return {
    id: data.id,
    name: data.name,
    description: data.description,
    price: data.price.toString(),
    duration: data.duration.toString(),
    stylist_id: data.stylist_id,
    image_urls: data.image_urls || []
  };
};

export const updateService = async (id: string, serviceData: ServiceFormValues): Promise<Service> => {
  const { data, error } = await supabase
    .from("services")
    .update({
      name: serviceData.name,
      description: serviceData.description || null,
      price: parseFloat(serviceData.price),
      duration: parseInt(serviceData.duration)
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return {
    id: data.id,
    name: data.name,
    description: data.description,
    price: data.price.toString(),
    duration: data.duration.toString(),
    stylist_id: data.stylist_id,
    image_urls: data.image_urls || []
  };
};

export const deleteService = async (id: string): Promise<void> => {
  // First, get the service to find associated images
  const { data: service } = await supabase
    .from("services")
    .select("image_urls, stylist_id")
    .eq("id", id)
    .single();

  // Delete associated images from storage
  if (service?.image_urls && service.image_urls.length > 0) {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user && service.stylist_id === user.id) {
      const filePaths = service.image_urls.map(url => {
        const urlParts = url.split('/');
        return urlParts.slice(-3).join('/'); // user_id/service_id/filename
      });
      
      await supabase.storage
        .from('service-images')
        .remove(filePaths);
    }
  }

  // Delete the service
  const { error } = await supabase
    .from("services")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
};
