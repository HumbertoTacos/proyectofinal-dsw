import express from "express";
import { stripe } from "../services/stripeService.js";
import { db } from "../config/firebase.js";

// Importamos la función del controlador que genera la factura
import { generarFacturaDesdeStripe } from "../controllers/carritoController.js";

const router = express.Router();

// Webhook requiere RAW body
router.post("/stripe/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("❌ Webhook error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Evento cuando el pago fue exitoso
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    const carritoId = session.metadata.carritoId;
    console.log("✅ Pago confirmado en Stripe. Carrito:", carritoId);

    const cartRef = db.collection("carrito").doc(carritoId);

    // Actualizamos pagado y guardamos id_stripe
    await cartRef.set(
      {
        pagado: true,
        id_stripe: session.id,
        updated_at: new Date().toISOString()
      },
      { merge: true }
    );

    // 🔥 GENERAR FACTURA AUTOMÁTICAMENTE
    try {
      console.log("🧾 Generando factura Facturapi por webhook...");
      await generarFacturaDesdeStripe(carritoId);
      console.log("🧾 Factura generada con éxito.");
    } catch (error) {
      console.error("❌ Error generando factura desde webhook:", error.message);
    }
  }

  res.json({ received: true });
});

export default router;
