import Stripe from "stripe";

const stripeSecretKey = import.meta.env.VITE_STRIPE_SECRET_KEY || process.env.VITE_STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  throw new Error("Missing VITE_STRIPE_SECRET_KEY");
}

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2023-10-16" as any,
  appInfo: {
    name: "Birdie Golf Charity",
    version: "0.1.0",
  },
});
