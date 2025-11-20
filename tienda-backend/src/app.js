import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import usuariosRoutes from "./routes/usuariosRoutes.js";
import productosRoutes from "./routes/productosRoutes.js";
import carritoRoutes from "./routes/carritoRoutes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// --- 🔹 Configuración de rutas del backend ---
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/productos", productosRoutes);
app.use("/api/carrito", carritoRoutes);

// --- 🔹 Servir el frontend (HTML, CSS, JS) ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ruta absoluta a tu carpeta tienda-frontend (afuera del src)
app.use(express.static(path.join(__dirname, "../../tienda-frontend")));

// Fallback: cualquier ruta no-API devuelve el index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../../tienda-frontend/index.html"));
});

// --- 🔹 Ruta base para verificar servicio ---
app.get("/api", (_req, res) => res.json({ ok: true, service: "tienda-backend" }));

// --- 🔹 Iniciar servidor ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("🚀 Servidor corriendo en http://localhost:" + PORT));

