
export interface BookingFormData {
  date: Date | undefined;
  services: string[]; // Changed from single service to array of services
  stylist: string;
  time: string;
  name: string;
  email: string;
  phone: string;
  notes: string;
}

export interface BookingFormState extends BookingFormData {
  isSubmitting: boolean;
  loading: boolean;
  step: number;
}

export interface BookingData {
  allServices: any[];
  stylists: any[];
  currentUser: any;
}

export interface BookingFormActions {
  setDate: (date: Date | undefined) => void;
  setServices: (services: string[]) => void; // Changed from setService to setServices
  setStylist: (stylist: string) => void;
  setTime: (time: string) => void;
  setName: (name: string) => void;
  setEmail: (email: string) => void;
  setPhone: (phone: string) => void;
  setNotes: (notes: string) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handlePaymentSuccess: () => Promise<void>;
  handleGoBack: () => void;
}
