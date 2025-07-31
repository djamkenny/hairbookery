import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { toast } from "sonner";

interface PlanFeature {
  name: string;
  included: boolean;
}

interface PaystackPlan {
  id: string;
  name: string;
  price: number;
  interval: string;
  features: PlanFeature[];
  popular?: boolean;
}

// Note: Subscription functionality would need to be implemented with Paystack
// This is a placeholder component for future Paystack subscription integration
const plans: PaystackPlan[] = [
  {
    id: 'basic',
    name: 'Basic',
    price: 9.99,
    interval: 'month',
    features: [
      { name: 'Up to 5 appointments per month', included: true },
      { name: 'Basic booking features', included: true },
      { name: 'Email support', included: true },
      { name: 'Advanced analytics', included: false },
      { name: 'Priority support', included: false },
    ],
  },
  {
    id: 'premium',
    name: 'Premium', 
    price: 19.99,
    interval: 'month',
    popular: true,
    features: [
      { name: 'Unlimited appointments', included: true },
      { name: 'All Basic features', included: true },
      { name: 'Advanced analytics', included: true },
      { name: 'Priority support', included: true },
      { name: 'Custom branding', included: false },
    ]
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 49.99,
    interval: 'month',
    features: [
      { name: 'Everything in Premium', included: true },
      { name: 'Custom branding', included: true },
      { name: 'API access', included: true },
      { name: 'Dedicated support', included: true },
      { name: 'Custom integrations', included: true },
    ]
  }
];

export const SubscriptionPlans: React.FC = () => {
  const handleSelectPlan = (planName: string) => {
    // TODO: Implement Paystack subscription checkout
    toast.info(`Paystack subscription for ${planName} plan coming soon`);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4">Choose Your Plan</h2>
        <p className="text-muted-foreground">
          Select the perfect plan for your styling needs
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {plans.map((plan) => (
          <Card key={plan.id} className={`relative ${plan.popular ? 'border-primary' : ''}`}>
            {plan.popular && (
              <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                Most Popular
              </Badge>
            )}
            
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <div className="text-3xl font-bold">
                ${plan.price}
                <span className="text-sm font-normal text-muted-foreground">
                  /{plan.interval}
                </span>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Check 
                      className={`h-4 w-4 ${
                        feature.included ? 'text-primary' : 'text-muted-foreground'
                      }`} 
                    />
                    <span 
                      className={feature.included ? '' : 'text-muted-foreground line-through'}
                    >
                      {feature.name}
                    </span>
                  </li>
                ))}
              </ul>

              <Button
                className="w-full"
                onClick={() => handleSelectPlan(plan.name)}
              >
                Select {plan.name}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Subscription management would be implemented with Paystack */}
      <div className="text-center mt-8">
        <Button 
          onClick={() => toast.info("Paystack subscription management coming soon")}
          variant="outline"
        >
          Manage Subscription
        </Button>
      </div>
    </div>
  );
};