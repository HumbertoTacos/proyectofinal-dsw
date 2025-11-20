import { Router } from "express";
import { getAll, create, update, remove } from "../controllers/carritoController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { verifyApiKey } from "../middlewares/apiKeyMiddleware.js";

const router = Router();

router.get("/", verifyApiKey, verifyToken, getAll);
router.post("/", verifyApiKey, verifyToken, create);
router.put("/:id", verifyApiKey, verifyToken, update);
router.delete("/:id", verifyApiKey, verifyToken, remove);

export default router;
