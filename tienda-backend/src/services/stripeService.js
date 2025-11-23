import Stripe from "stripe";
import dotenv from "dotenv";
dotenv.config();

export const stripe = new Stripe(process.env.STRIPE_KEY, {
  apiVersion: "2023-10-16",
});

/**
 * Crear Checkout Session de Stripe
 */
export async function createStripeCheckoutSession({ line_items, metadata }) {
  return await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items,
    metadata, // Aqui pondremos el carritoId
    success_url: "http://localhost:3000/success",
    cancel_url: "http://localhost:3000/cancel",
  });
}
