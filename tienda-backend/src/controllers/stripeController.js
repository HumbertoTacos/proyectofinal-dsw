import { db } from "../config/firebase.js";
import { stripe } from "../services/stripeService.js";

export async function createCheckoutSession(req, res) {
  try {
    const { carritoId } = req.body;

    if (!carritoId) {
      return res.status(400).json({ error: "Falta el parámetro carritoId" });
    }

    // Leer carrito desde Firestore
    const snap = await db.collection("carrito").doc(carritoId).get();

    if (!snap.exists) {
      return res.status(404).json({ error: "Carrito no encontrado" });
    }

    const cart = snap.data();

    if (!cart.items || cart.items.length === 0) {
      return res.status(400).json({ error: "El carrito está vacío" });
    }

    // Construir Line Items
    const lineItems = cart.items.map((item) => ({
      price_data: {
        currency: "mxn",
        product_data: {
          name: item.name,
        },
        unit_amount: Math.round(item.price * 100), // Stripe usa centavos
      },
      quantity: item.quantity,
    }));

    // Crear Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",

      success_url: "http://localhost:3000/success.html",
      cancel_url: "http://localhost:3000/cancel.html",

      metadata: {
        carritoId,
      },
    });

    res.json({
      url: session.url,
      id: session.id,
    });

  } catch (err) {
    console.error("❌ Error creando sesión de Stripe:", err.message);
    res.status(500).json({ error: "Error creando sesión de pago" });
  }
}
