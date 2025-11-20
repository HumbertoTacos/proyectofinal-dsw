import { Router } from "express";
import { getAll, create, update, remove, importar } from "../controllers/productosController.js";
import { verifyToken, requireAdmin } from "../middlewares/authMiddleware.js";
import { verifyApiKey } from "../middlewares/apiKeyMiddleware.js";

const router = Router();
router.get("/", verifyApiKey, getAll);
router.post("/", verifyApiKey, verifyToken, requireAdmin, create);
router.put("/:id", verifyApiKey, verifyToken, requireAdmin, update);
router.delete("/:id", verifyApiKey, verifyToken, requireAdmin, remove);
router.post("/importar", verifyApiKey, verifyToken, requireAdmin, importar);
export default router;
