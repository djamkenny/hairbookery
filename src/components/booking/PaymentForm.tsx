
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { toast } from "sonner";

interface PaymentFormProps {
  amount: number;
  onSuccess: () => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ 
  amount, 
  onSuccess, 
  onCancel,
  isSubmitting 
}) => {
  const [cardNumber, setCardNumber] = useState("");
  const [expiryMonth, setExpiryMonth] = useState("");
  const [expiryYear, setExpiryYear] = useState("");
  const [cvv, setCvv] = useState("");
  const [name, setName] = useState("");

  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(" ");
    } else {
      return value;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!cardNumber || !expiryMonth || !expiryYear || !cvv || !name) {
      toast.error("Please fill in all payment details");
      return;
    }
    
    if (cardNumber.replace(/\s/g, "").length !== 16) {
      toast.error("Please enter a valid card number");
      return;
    }
    
    if (cvv.length < 3) {
      toast.error("Please enter a valid CVV");
      return;
    }

    // In a real app, we would send the payment info to a payment processor
    // For demo purposes, we'll just simulate a successful payment
    setTimeout(() => {
      onSuccess();
      toast.success("Payment processed successfully!");
    }, 1500);
  };

  // Generate month options
  const months = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    return month < 10 ? `0${month}` : `${month}`;
  });

  // Generate year options (current year + 10 years)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => `${currentYear + i}`);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cardName">Name on Card</Label>
              <Input
                id="cardName"
                placeholder="John Smith"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cardNumber">Card Number</Label>
              <Input
                id="cardNumber"
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                maxLength={19}
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Expiry Date</Label>
                <div className="flex gap-2">
                  <Select value={expiryMonth} onValueChange={setExpiryMonth}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="MM" />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((month) => (
                        <SelectItem key={month} value={month}>
                          {month}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select value={expiryYear} onValueChange={setExpiryYear}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="YYYY" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year} value={year}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  placeholder="123"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.slice(0, 4))}
                  maxLength={4}
                  required
                />
              </div>
            </div>
            
            <div className="pt-2 border-t border-border/30 mt-4">
              <div className="flex justify-between font-medium">
                <span>Total Amount:</span>
                <span className="text-primary">${amount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex gap-3">
        <Button 
          type="button" 
          variant="outline" 
          className="w-full" 
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Back
        </Button>
        <Button 
          type="submit" 
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Processing..." : "Pay Now"}
        </Button>
      </div>
    </form>
  );
};

export default PaymentForm;
