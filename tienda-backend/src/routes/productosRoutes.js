import { Router } from "express";
import { 
  getAll,
  getById,  
  create,
  update,
  remove,
  importar
} from "../controllers/productosController.js";


import { verifyToken } from "../middlewares/authMiddleware.js";
import { verifyApiKey } from "../middlewares/apiKeyMiddleware.js";

const router = Router();

// ===================== PRODUCTOS CRUD =====================



// Listar productos
router.get("/", verifyApiKey, verifyToken, getAll);
router.get("/:id", getById);

// Crear producto
router.post("/", verifyApiKey, verifyToken, create);

// Importar productos desde Facturapi (antes de /:id para evitar conflictos)
router.post("/importar", verifyApiKey, verifyToken, importar);

// Actualizar producto
router.put("/:id", verifyApiKey, verifyToken, update);

// Eliminar producto
router.delete("/:id", verifyApiKey, verifyToken, remove);

export default router;
