
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Heart, Users, Target, Gift } from "lucide-react";
import { usePayment } from "@/components/payment/PaymentProvider";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

const Donation = () => {
  const [amount, setAmount] = useState<number>(0);
  const [customAmount, setCustomAmount] = useState("");
  const [donorName, setDonorName] = useState("");
  const [message, setMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { createPayment } = usePayment();
  const isMobile = useIsMobile();

  const predefinedAmounts = [10, 25, 50, 100, 250, 500];

  const handleAmountSelect = (selectedAmount: number) => {
    setAmount(selectedAmount);
    setCustomAmount("");
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 0) {
      setAmount(numValue);
    } else {
      setAmount(0);
    }
  };

  const handleDonation = async () => {
    if (amount <= 0) {
      toast.error("Please enter a valid fund amount");
      return;
    }

    if (amount < 1) {
      toast.error("Minimum fund amount is GH₵1.00");
      return;
    }

    try {
      setIsProcessing(true);

      // Convert GHS to pesewas (1 GHS = 100 pesewas)
      const amountInPesewas = Math.round(amount * 100);
      
      const metadata = {
        donor_name: donorName || "Anonymous",
        message: message || "",
        fund_type: "general"
      };

      const result = await createPayment(
        amountInPesewas, 
        `Fund from ${donorName || "Anonymous Donor"}`,
        undefined,
        metadata
      );

      if (result?.url) {
        toast.success("Redirecting to payment page...");
        if (isMobile) {
          setTimeout(() => {
            window.location.href = result.url;
          }, 1000);
        } else {
          window.open(result.url, '_blank');
          toast.success("Payment page opened in new tab. Complete your fund there.");
        }
      }
    } catch (error) {
      console.error("Donation failed:", error);
      toast.error("Failed to process fund. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <Heart className="h-16 w-16 text-red-500" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Make a Difference Today
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Your fund helps us continue providing quality beauty and wellness services 
            to our community. Every contribution makes a meaningful impact.
          </p>
        </div>

        {/* Impact Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center">
            <CardContent className="pt-6">
              <Users className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Community Impact</h3>
              <p className="text-gray-600">
                Supporting local stylists and beauticians in our community
              </p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="pt-6">
              <Target className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Training Programs</h3>
              <p className="text-gray-600">
                Funding training and skill development for beauty professionals
              </p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="pt-6">
              <Gift className="h-12 w-12 text-purple-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Equipment & Tools</h3>
              <p className="text-gray-600">
                Providing quality equipment and tools for better service delivery
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Donation Form */}
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Choose Your Fund Amount</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Predefined Amounts */}
            <div>
              <Label className="text-base font-medium mb-3 block">Quick Select Amount (GH₵)</Label>
              <div className="grid grid-cols-3 gap-3">
                {predefinedAmounts.map((preset) => (
                  <Button
                    key={preset}
                    variant={amount === preset ? "default" : "outline"}
                    onClick={() => handleAmountSelect(preset)}
                    className="h-12"
                  >
                    GH₵{preset}
                  </Button>
                ))}
              </div>
            </div>

            {/* Custom Amount */}
            <div>
              <Label htmlFor="custom-amount" className="text-base font-medium">
                Or Enter Custom Amount (GH₵)
              </Label>
              <Input
                id="custom-amount"
                type="number"
                placeholder="0.00"
                value={customAmount}
                onChange={(e) => handleCustomAmountChange(e.target.value)}
                min="1"
                step="0.01"
                className="mt-2"
              />
            </div>

            {/* Donor Information */}
            <div>
              <Label htmlFor="donor-name" className="text-base font-medium">
                Your Name (Optional)
              </Label>
              <Input
                id="donor-name"
                placeholder="Enter your name"
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
                className="mt-2"
              />
            </div>

            {/* Message */}
            <div>
              <Label htmlFor="message" className="text-base font-medium">
                Message (Optional)
              </Label>
              <Textarea
                id="message"
                placeholder="Share why you're funding or leave a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="mt-2"
                rows={3}
              />
            </div>

            {/* Selected Amount Display */}
            {amount > 0 && (
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                 <p className="text-lg font-semibold text-green-800">
                  Fund Amount: GH₵{amount.toFixed(2)}
                </p>
                <p className="text-sm text-green-600 mt-1">
                  Thank you for your generous support!
                </p>
              </div>
            )}

            {/* Payment Methods Info */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Secure Payment Methods Available:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Mobile Money (MTN, Vodafone, AirtelTigo)</li>
                <li>• Credit/Debit Cards (Visa, Mastercard, Verve)</li>
                <li>• Bank Transfer & USSD</li>
              </ul>
            </div>

            {/* Donate Button */}
            <Button
              onClick={handleDonation}
              disabled={isProcessing || amount <= 0}
              className="w-full h-12 text-lg"
              size="lg"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <Heart className="mr-2 h-5 w-5" />
                  Fund GH₵{amount.toFixed(2)}
                </>
              )}
            </Button>

            {/* Security Note */}
            <p className="text-xs text-gray-500 text-center">
              🔒 Your fund is processed securely through Paystack. 
              We do not store your payment information.
            </p>
          </CardContent>
        </Card>

        {/* Thank You Section */}
        <div className="text-center mt-12">
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">
            Thank You for Your Support
          </h3>
          <p className="text-gray-600 max-w-xl mx-auto">
            Every fund, no matter the size, helps us make a positive impact 
            in our community. Your generosity is truly appreciated.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Donation;
