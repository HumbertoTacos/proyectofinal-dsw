import { Router } from "express";
import {
  getAll,
  create,
  update,
  remove,
  getById,
  getFacturaPDF,
  getFacturaXML,
  getCarritoPendiente   
} from "../controllers/carritoController.js";


import { verifyToken } from "../middlewares/authMiddleware.js";
import { verifyApiKey } from "../middlewares/apiKeyMiddleware.js";

const router = Router();

// ===================== CARRITO CRUD =====================

// Obtener todos los carritos
router.get("/", verifyApiKey, verifyToken, getAll);

// Obtener un carrito por ID
router.get("/:id", verifyApiKey, verifyToken, getById);

// Crear carrito
router.post("/", verifyApiKey, verifyToken, create);

// Actualizar carrito (aquí se genera factura al poner pagado:true)
router.put("/:id", verifyApiKey, verifyToken, update);

// Eliminar carrito
router.delete("/:id", verifyApiKey, verifyToken, remove);

// ===================== FACTURAS =====================

// Descargar factura en PDF
router.get("/:id/factura/pdf", verifyApiKey, verifyToken, getFacturaPDF);

// Descargar factura en XML
router.get("/:id/factura/xml", verifyApiKey, verifyToken, getFacturaXML);

// Dentro de carritoRoutes.js:
router.get("/pendiente/:usuarioId", verifyApiKey, verifyToken, getCarritoPendiente);






export default router;
