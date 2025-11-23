import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Rutas
import usuariosRoutes from "./routes/usuariosRoutes.js";
import productosRoutes from "./routes/productosRoutes.js";
import carritoRoutes from "./routes/carritoRoutes.js";
import stripeWebhook from "./routes/stripeWebhook.js";
import stripeRoutes from "./routes/stripeRoutes.js";

dotenv.config();

// ==========================================================
// VALIDAR VARIABLES DE ENTORNO IMPORTANTES
// ==========================================================
if (!process.env.PORT) {
  console.warn("⚠️  Advertencia: Falta PORT en .env, usando 3000 por default");
}
if (!process.env.API_KEY) {
  console.warn("⚠️  Advertencia: Falta API_KEY en .env");
}
if (!process.env.JWT_SECRET) {
  console.error("❌ ERROR: Falta JWT_SECRET en .env");
  process.exit(1);
}
if (!process.env.FACTURAPI_KEY) {
  console.warn("⚠️ Advertencia: FACTURAPI_KEY no está configurada. Facturación no funcionará.");
}

// ==========================================================
// CONFIGURAR SERVIDOR EXPRESS
// ==========================================================
const app = express();

// --- Seguridad básica ---
app.use(cors({ origin: "*", methods: "GET,POST,PUT,DELETE" }));

// Stripe Webhook (RAW body)
app.use("/api", stripeWebhook);

// --- Manejar JSON grandes (para facturas, pagos, etc.) ---
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ==========================================================
// RUTAS API
// ==========================================================
app.use("/api", stripeRoutes);
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/productos", productosRoutes);
app.use("/api/carrito", carritoRoutes);

// Ruta base de verificación (antes del fallback)
app.get("/api", (_req, res) =>
  res.json({ ok: true, service: "tienda-backend", status: "online" })
);

// ==========================================================
// SERVIR FRONTEND (PUBLICO)
// ==========================================================

// __dirname con ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carpeta del frontend
app.use(express.static(path.join(__dirname, "../../tienda-frontend")));

// Fallback: enviar index.html a cualquier ruta NO API
app.get("*", (req, res) => {
  // Evita que rutas /api lleguen aquí
  if (req.originalUrl.startsWith("/api")) {
    return res.status(404).json({ error: "Recurso API no encontrado" });
  }
  res.sendFile(path.join(__dirname, "../../tienda-frontend/index.html"));
});

// ==========================================================
// MANEJO GLOBAL DE ERRORES (OPCIONAL PERO PROFESIONAL)
// ==========================================================
app.use((err, req, res, next) => {
  console.error("❌ Error global:", err.stack);
  res.status(500).json({ error: "Error interno del servidor" });
});

// ==========================================================
// INICIAR SERVIDOR
// ==========================================================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("==============================================");
  console.log("🚀 Tienda Backend Activa");
  console.log("📡 Puerto:", PORT);

  console.log("🔑 API Key:", process.env.API_KEY ? "Cargada ✔" : "NO DEFINIDA ✖");
  console.log("🔐 JWT Secret:", process.env.JWT_SECRET ? "Cargado ✔" : "NO DEFINIDO ✖");

  console.log("🧾 Facturapi:",
    process.env.FACTURAPI_KEY
      ? "Conectado ✔"
      : "SIN FACTURAPI_KEY ✖"
  );

  console.log("💳 Stripe Secret Key:",
    process.env.STRIPE_KEY
      ? "Cargada ✔"
      : "NO DEFINIDA ✖"
  );

  console.log("🔔 Stripe Webhook Secret:",
    process.env.STRIPE_WEBHOOK_SECRET
      ? "Cargado ✔"
      : "NO DEFINIDO ✖"
  );

  console.log("🔥 Frontend servido desde: tienda-frontend/");
  console.log("🎞️  Solo abre en tu navegador: http://localhost:3000/");
  console.log("==============================================");
});
