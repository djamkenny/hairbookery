
# Stripe Payment System Implementation Guide

## Overview
This document outlines the complete Stripe payment integration for the application, including both one-time payments and subscription management.

## Prerequisites
Before implementing the payment system locally, ensure you have:
- [ ] Stripe account (https://stripe.com)
- [ ] Supabase project with edge functions enabled
- [ ] Required environment variables configured

## Environment Variables Required

### Supabase Secrets (configure in Supabase dashboard)
```
STRIPE_SECRET_KEY=sk_test_... (or sk_live_... for production)
STRIPE_WEBHOOK_SECRET=whsec_... (for webhook verification)
```

### Frontend Environment (if using Stripe Elements)
```
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_... (or pk_live_... for production)
```

## Implementation Steps

### 1. Database Setup
Run the migration to create payment tables:
```sql
-- This creates the payments and subscribers tables
-- File: supabase/migrations/20241206000002_create_payment_tables.sql
```

### 2. Edge Functions
The following edge functions are created:
- `create-payment`: Creates one-time payment sessions
- `create-subscription`: Creates subscription checkout sessions
- `check-subscription`: Verifies and updates subscription status
- `customer-portal`: Creates Stripe customer portal sessions
- `webhook-stripe`: Handles Stripe webhook events

### 3. Frontend Integration
Wrap your app with the PaymentProvider:
```tsx
import { PaymentProvider } from "@/components/payment/PaymentProvider";

function App() {
  return (
    <PaymentProvider>
      {/* Your app components */}
    </PaymentProvider>
  );
}
```

### 4. Using Payment Components

#### One-time Payments
```tsx
import { PaymentButton } from "@/components/payment/PaymentButton";

<PaymentButton
  amount={5000} // $50.00 in cents
  description="Haircut Service"
  serviceId="service-id"
  appointmentId="appointment-id"
/>
```

#### Subscription Management
```tsx
import { SubscriptionPlans } from "@/components/payment/SubscriptionPlans";
import { SubscriptionStatus } from "@/components/payment/SubscriptionStatus";

// Display subscription plans
<SubscriptionPlans />

// Show current subscription status
<SubscriptionStatus />
```

#### Using Payment Context
```tsx
import { usePayment } from "@/components/payment/PaymentProvider";

function MyComponent() {
  const { 
    isSubscribed, 
    subscriptionTier, 
    createPayment,
    openCustomerPortal 
  } = usePayment();

  // Component logic here
}
```

## Stripe Configuration

### 1. Webhook Setup
1. In Stripe Dashboard, go to Developers > Webhooks
2. Add endpoint: `https://your-project.supabase.co/functions/v1/webhook-stripe`
3. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy webhook signing secret to Supabase secrets

### 2. Product and Price Setup
Create products and prices in Stripe Dashboard:
```javascript
// Example price IDs to replace in SubscriptionPlans.tsx
const plans = [
  {
    id: 'basic',
    priceId: 'price_1234567890', // Replace with actual Stripe price ID
    // ...
  }
];
```

## Testing

### Test Mode
1. Use Stripe test keys (`sk_test_` and `pk_test_`)
2. Use test card numbers:
   - Success: `4242424242424242`
   - Decline: `4000000000000002`
   - 3D Secure: `4000002500003155`

### Production Deployment
1. Replace test keys with live keys
2. Update webhook endpoint to production URL
3. Test with small amounts first

## Security Considerations

1. **Never expose secret keys** in frontend code
2. **Always verify webhooks** using signing secrets
3. **Use HTTPS** for all payment-related endpoints
4. **Validate amounts** on both frontend and backend
5. **Log payment activities** for audit trails

## Troubleshooting

### Common Issues
1. **Webhook signature verification fails**
   - Ensure webhook secret is correct
   - Check that raw body is used for verification

2. **Payment sessions not created**
   - Verify Stripe secret key is valid
   - Check user authentication
   - Validate request parameters

3. **Subscription status not updating**
   - Ensure webhook is configured correctly
   - Check database permissions for edge functions
   - Verify subscription events are being received

## File Structure
```
src/
├── components/
│   └── payment/
│       ├── PaymentProvider.tsx
│       ├── PaymentButton.tsx
│       ├── SubscriptionPlans.tsx
│       └── SubscriptionStatus.tsx
├── types/
│   └── payment.ts
supabase/
├── functions/
│   ├── create-payment/
│   ├── create-subscription/
│   ├── check-subscription/
│   ├── customer-portal/
│   └── webhook-stripe/
├── migrations/
│   └── 20241206000002_create_payment_tables.sql
└── config.toml
```

## Next Steps
1. Configure Stripe account and get API keys
2. Set up products and prices in Stripe Dashboard
3. Configure webhook endpoints
4. Test payment flows in development
5. Deploy to production with live keys

## Resources
- [Stripe Documentation](https://stripe.com/docs)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
