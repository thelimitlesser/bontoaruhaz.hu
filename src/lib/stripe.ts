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
    // apiVersion is optional, let the library use its default
  } as any);
  return stripeInstance;
})() as Stripe; // Casting for TS, but we should check for null in usage.
