
export interface BookingFormData {
  date: Date | undefined;
  service: string;
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
  setService: (service: string) => void;
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
