import { Router } from "express";
import { buscarClaveSAT, buscarUnidadSAT } from "../services/satService.js";
import { verifyApiKey } from "../middlewares/apiKeyMiddleware.js";

const router = Router();

// Buscar claves de producto SAT
router.get("/sat/productos", verifyApiKey, async (req, res) => {
  const q = req.query.q;
  if (!q) return res.status(400).json({ error: "Falta parámetro q" });

  const results = await buscarClaveSAT(q);
  res.json(results);
});

// Buscar unidad SAT automáticamente
router.get("/sat/unidades", verifyApiKey, async (req, res) => {
  const q = req.query.q;
  const unidad = await buscarUnidadSAT(q || "pieza");
  res.json(unidad);
});

export default router;
