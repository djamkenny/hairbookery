
import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { usePayment } from "@/components/payment/PaymentProvider";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const PaymentReturn = () => {
  const [searchParams] = useSearchParams();
  const { checkSessionStatus } = usePayment();
  const [status, setStatus] = useState<string | null>(null);
  const [customerEmail, setCustomerEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    
    if (sessionId) {
      checkSessionStatus(sessionId).then((result) => {
        if (result) {
          setStatus(result.status);
          setCustomerEmail(result.customer_email);
        }
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [searchParams, checkSessionStatus]);

  const getStatusIcon = () => {
    if (loading) return <Loader2 className="h-8 w-8 animate-spin" />;
    if (status === 'complete') return <CheckCircle className="h-8 w-8 text-green-500" />;
    return <XCircle className="h-8 w-8 text-red-500" />;
  };

  const getStatusMessage = () => {
    if (loading) return "Checking payment status...";
    if (status === 'complete') return "Payment successful!";
    return "Payment failed or canceled";
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow py-16 md:py-20">
        <div className="container mx-auto max-w-md">
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                {getStatusIcon()}
              </div>
              <CardTitle>{getStatusMessage()}</CardTitle>
            </CardHeader>
            
            <CardContent className="text-center space-y-4">
              {customerEmail && (
                <p className="text-sm text-muted-foreground">
                  Confirmation sent to: {customerEmail}
                </p>
              )}
              
              {status === 'complete' && (
                <p className="text-sm text-green-600">
                  Your payment has been processed successfully.
                </p>
              )}
              
              {status && status !== 'complete' && (
                <p className="text-sm text-red-600">
                  Something went wrong with your payment. Please try again.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default PaymentReturn;
