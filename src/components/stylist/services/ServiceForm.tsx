import React, { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Clock, DollarSign } from "lucide-react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ServiceImageUpload } from "./ServiceImageUpload";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const serviceFormSchema = z.object({
  name: z.string().min(1, "Service name is required"),
  description: z.string().optional(),
  duration: z.string().min(1, "Duration is required"),
  price: z.string().min(1, "Price is required"),
  category: z.string().min(1, "Category is required")
});

export type ServiceFormValues = z.infer<typeof serviceFormSchema>;

interface ServiceCategory {
  id: string;
  name: string;
  description: string;
}

interface ServiceFormProps {
  defaultValues?: ServiceFormValues;
  onSubmit: (data: ServiceFormValues) => Promise<void>;
  onCancel: () => void;
  isEditing: boolean;
  serviceId?: string;
  currentImages?: string[];
  onImagesUpdate?: (images: string[]) => void;
}

export const ServiceForm: React.FC<ServiceFormProps> = ({
  defaultValues,
  onSubmit,
  onCancel,
  isEditing,
  serviceId,
  currentImages = [],
  onImagesUpdate
}) => {
  const [localImages, setLocalImages] = useState<string[]>(currentImages);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [hiddenCategoryNames, setHiddenCategoryNames] = useState<string[]>([]);
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState("");
  const [durationHours, setDurationHours] = useState<number>(0);
  const [durationMinutes, setDurationMinutes] = useState<number>(0);
  
  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: defaultValues || {
      name: "",
      description: "",
      duration: "",
      price: "",
      category: ""
    }
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const { data, error } = await supabase
          .from('service_categories')
          .select('id, name, description')
          .order('display_order');
        if (error) throw error;
        setCategories(data || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast.error('Failed to load service categories');
      } finally {
        setLoadingCategories(false);
      }
    };

    // Load hidden categories
    const saved = localStorage.getItem('hidden_categories');
    if (saved) {
      try { setHiddenCategoryNames(JSON.parse(saved)); } catch {}
    }

    // Initialize duration fields from default values
    const initialMinutes = parseInt((defaultValues?.duration as string) || '0');
    if (!isNaN(initialMinutes) && initialMinutes > 0) {
      setDurationHours(Math.floor(initialMinutes / 60));
      setDurationMinutes(initialMinutes % 60);
    }

    fetchCategories();
  }, [defaultValues]);

  // Keep form duration in sync
  useEffect(() => {
    form.setValue('duration', String(durationHours * 60 + durationMinutes));
  }, [durationHours, durationMinutes]);

  const handleImagesUpdate = (images: string[]) => {
    setLocalImages(images);
    if (onImagesUpdate) {
      onImagesUpdate(images);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{isEditing ? "Edit Service" : "Add New Service"}</CardTitle>
        <CardDescription>
          {isEditing 
            ? "Update the details of your service" 
            : "Fill in the details to add a new service to your offerings"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Haircut & Styling" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Type a category (e.g. Haircut, Nails, Spa)"
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe what this service includes" 
                      {...field} 
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration</FormLabel>
                  <FormControl>
                    <div>
                      <input type="hidden" {...field} value={String(durationHours * 60 + durationMinutes)} />
                      <div className="grid grid-cols-2 gap-2">
                        <div className="relative">
                          <Clock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Hours"
                            className="pl-8"
                            type="number"
                            min={0}
                            value={durationHours}
                            onChange={(e) => setDurationHours(Math.max(0, parseInt(e.target.value || '0')))}
                          />
                        </div>
                        <div className="relative">
                          <Clock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Minutes"
                            className="pl-8"
                            type="number"
                            min={0}
                            max={59}
                            value={durationMinutes}
                            onChange={(e) => setDurationMinutes(Math.max(0, Math.min(59, parseInt(e.target.value || '0'))))}
                          />
                        </div>
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
              
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price (₵)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground font-medium select-none">₵</span>
                        <Input
                          placeholder="e.g. 65"
                          className="pl-8"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="flex flex-wrap justify-end gap-2 pt-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel}
              >
                Cancel
              </Button>
              <Button type="submit">
                {isEditing ? "Update Service" : "Add Service"}
              </Button>
            </div>
          </form>
        </Form>

        {serviceId && (
          <div className="border-t pt-6">
            <ServiceImageUpload
              serviceId={serviceId}
              currentImages={localImages}
              onImagesUpdate={handleImagesUpdate}
              maxImages={5}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};
