import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];

    // ================= VALIDAR HEADER =================
    if (!authHeader) {
      return res.status(403).json({
        error: "No se proporcionó encabezado Authorization",
      });
    }

    // Esperado: "Bearer token-aquí"
    const parts = authHeader.split(" ");

    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return res.status(400).json({
        error: "Formato de Authorization incorrecto. Uso esperado: Bearer <token>",
      });
    }

    let token = parts[1];

    // Sanitizar token
    token = token.trim();

    if (!token) {
      return res.status(403).json({
        error: "Token vacío o no proporcionado",
      });
    }

    // ================= VERIFICAR TOKEN =================
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Guardar datos del usuario para las rutas
    req.user = decoded;

    next();

  } catch (error) {
    console.error("❌ Error en verifyToken:", error.message);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        error: "Token expirado",
      });
    }

    return res.status(401).json({
      error: "Token inválido",
    });
  }
};
