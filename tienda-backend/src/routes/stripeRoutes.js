import { Router } from "express";
import { createCheckoutSession } from "../controllers/stripeController.js";
import { verifyApiKey } from "../middlewares/apiKeyMiddleware.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = Router();

// Crear sesión de pago en Stripe
router.post("/stripe/checkout", verifyApiKey, verifyToken, createCheckoutSession);

export default router;
