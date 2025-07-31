
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";

interface Props {
  success: boolean;
  error?: string | null;
  onContinue: () => void;
  onGoHome: () => void;
}

const PaymentReturnResult: React.FC<Props> = ({ success, error, onContinue, onGoHome }) => (
  <div className="min-h-screen flex items-center justify-center p-4">
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          {success ? (
            <CheckCircle className="h-16 w-16 text-primary" />
          ) : (
            <XCircle className="h-16 w-16 text-red-500" />
          )}
        </div>
        <CardTitle className="text-xl">
          {success ? 'Payment Successful!' : 'Payment Failed'}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <p className="text-muted-foreground">
          {success
            ? 'Your payment has been processed successfully. Your appointment has been confirmed.'
            : error || 'There was an issue processing your payment. Please try again.'}
        </p>
        <div className="flex gap-2">
          <Button onClick={onContinue} className="flex-1">
            {success ? 'Continue' : 'Try Again'}
          </Button>
          <Button variant="outline" onClick={onGoHome} className="flex-1">
            Go Home
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
);

export default PaymentReturnResult;
