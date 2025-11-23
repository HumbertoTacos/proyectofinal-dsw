import { Router } from "express";
import { 
  getAll,
  getById,      
  create,
  update,
  remove,
  login 
} from "../controllers/usuariosController.js";


import { verifyToken } from "../middlewares/authMiddleware.js";
import { verifyApiKey } from "../middlewares/apiKeyMiddleware.js";

const router = Router();

// ===================== AUTH =====================

// Login debe requerir API KEY pero NO token
router.post("/login", verifyApiKey, login);

// ===================== USUARIOS CRUD =====================

// Obtener todos los usuarios
router.get("/", verifyApiKey, verifyToken, getAll);
router.get("/:id", verifyApiKey, verifyToken, getById);


// Crear usuario (registro) - solo requiere API KEY
router.post("/", verifyApiKey, create);

// Actualizar usuario
router.put("/:id", verifyApiKey, verifyToken, update);

// Eliminar usuario
router.delete("/:id", verifyApiKey, verifyToken, remove);

export default router;
