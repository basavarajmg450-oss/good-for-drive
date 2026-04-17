import { createServerFn } from "@tanstack/react-start";
import { stripe } from "./stripe";
import { getRequest } from "@tanstack/react-start/server";
import { supabase } from "@/integrations/supabase/client";

export const createCheckoutSession = createServerFn({ method: "POST" })
  .validator((data: { priceId: string; userId: string; email: string }) => data)
  .handler(async ({ data }) => {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: data.priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.APP_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.APP_URL}/pricing`,
      customer_email: data.email,
      metadata: {
        userId: data.userId,
      },
    });

    return { sessionId: session.id, url: session.url };
  });

export const createPortalSession = createServerFn({ method: "POST" })
  .validator((data: { customerId: string }) => data)
  .handler(async ({ data }) => {
    const session = await stripe.billingPortal.sessions.create({
      customer: data.customerId,
      return_url: `${process.env.APP_URL}/dashboard`,
    });

    return { url: session.url };
  });
