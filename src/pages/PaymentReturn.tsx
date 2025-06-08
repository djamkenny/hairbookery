
import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2, AlertCircle } from "lucide-react";
import { usePayment } from "@/components/payment/PaymentProvider";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { toast } from "sonner";

const PaymentReturn = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { checkSessionStatus } = usePayment();
  const [status, setStatus] = useState<string | null>(null);
  const [customerEmail, setCustomerEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  const checkPaymentStatus = async (sessionId: string, attempt = 1) => {
    console.log(`Checking payment status, attempt ${attempt}`);
    
    try {
      const result = await checkSessionStatus(sessionId);
      if (result) {
        console.log("Payment status result:", result);
        setStatus(result.status);
        setCustomerEmail(result.customer_email);
        
        if (result.status === 'complete') {
          toast.success("Payment completed successfully!");
        } else if (result.status === 'failed') {
          toast.error("Payment failed. Please try again.");
        }
      }
    } catch (error) {
      console.error(`Payment status check failed (attempt ${attempt}):`, error);
      
      // Retry up to 3 times with delay for pending payments
      if (attempt < 3) {
        setTimeout(() => {
          setRetryCount(attempt);
          checkPaymentStatus(sessionId, attempt + 1);
        }, 2000 * attempt); // Exponential backoff
      } else {
        setStatus('failed');
        toast.error("Unable to verify payment status. Please contact support.");
      }
    }
  };

  useEffect(() => {
    const reference = searchParams.get('reference');
    const trxref = searchParams.get('trxref');
    const sessionId = reference || trxref;
    
    console.log("Payment return parameters:", { reference, trxref, sessionId });
    
    if (sessionId) {
      checkPaymentStatus(sessionId);
    } else {
      console.error("No payment reference found in URL");
      setStatus('failed');
      toast.error("No payment reference found");
    }
    
    setLoading(false);
  }, [searchParams, checkSessionStatus]);

  const getStatusIcon = () => {
    if (loading) return <Loader2 className="h-8 w-8 animate-spin text-blue-500" />;
    if (status === 'complete') return <CheckCircle className="h-8 w-8 text-green-500" />;
    if (status === 'pending') return <AlertCircle className="h-8 w-8 text-yellow-500" />;
    return <XCircle className="h-8 w-8 text-red-500" />;
  };

  const getStatusMessage = () => {
    if (loading) return "Verifying payment status...";
    if (status === 'complete') return "Payment successful!";
    if (status === 'pending') return "Payment is being processed";
    if (status === 'failed') return "Payment failed";
    return "Payment canceled";
  };

  const getStatusDescription = () => {
    if (loading) return "Please wait while we confirm your payment.";
    if (status === 'complete') return "Your payment has been processed successfully. You will receive a confirmation email shortly.";
    if (status === 'pending') return "Your payment is being processed. This may take a few minutes.";
    if (status === 'failed') return "There was an issue processing your payment. Please try again.";
    return "Your payment was canceled. No charges have been made.";
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow py-16 md:py-20">
        <div className="container mx-auto max-w-md px-4">
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                {getStatusIcon()}
              </div>
              <CardTitle className="text-xl">{getStatusMessage()}</CardTitle>
            </CardHeader>
            
            <CardContent className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                {getStatusDescription()}
              </p>
              
              {customerEmail && (
                <p className="text-sm text-muted-foreground">
                  Confirmation sent to: {customerEmail}
                </p>
              )}
              
              {retryCount > 0 && (
                <p className="text-xs text-yellow-600">
                  Retrying payment verification... (Attempt {retryCount}/3)
                </p>
              )}
              
              <div className="flex gap-3 mt-6">
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/booking')}
                  className="flex-1"
                >
                  Book Again
                </Button>
                <Button 
                  onClick={() => navigate('/profile')}
                  className="flex-1"
                >
                  View Appointments
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default PaymentReturn;
