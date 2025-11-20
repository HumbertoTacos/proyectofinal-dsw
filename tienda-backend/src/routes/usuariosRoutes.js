import { Router } from "express";
import { getAll, create, update, remove, login } from "../controllers/usuariosController.js";
import { verifyToken, requireAdmin } from "../middlewares/authMiddleware.js";
import { verifyApiKey } from "../middlewares/apiKeyMiddleware.js";

const router = Router();

router.post("/login", login);

router.get("/", verifyApiKey, verifyToken, requireAdmin, getAll);
router.post("/", verifyApiKey, create);
router.put("/:id", verifyApiKey, verifyToken, requireAdmin, update);
router.delete("/:id", verifyApiKey, verifyToken, requireAdmin, remove);

export default router;
