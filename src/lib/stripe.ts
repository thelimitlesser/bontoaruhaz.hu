import Stripe from 'stripe';

let stripeInstance: Stripe | null = null;

export const stripe = (() => {
  if (stripeInstance) return stripeInstance;
  
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    // Return a proxy or just null and check in actions
    return null;
  }
  
  stripeInstance = new Stripe(key, {
    apiVersion: '2023-10-16', // using a fixed api version
    httpClient: Stripe.createFetchHttpClient(),
  } as any);
  return stripeInstance;
})() as Stripe; // Casting for TS, but we should check for null in usage.
