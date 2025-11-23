import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

// ===========================================
// VALIDAR QUE JWT_SECRET EXISTA
// ===========================================
if (!process.env.JWT_SECRET) {
  console.error("❌ ERROR FATAL: Falta JWT_SECRET en el archivo .env");
  throw new Error("JWT_SECRET no definido");
}

// ===========================================
// GENERAR TOKEN DE ACCESO (1 hora)
// ===========================================

export const generateToken = (user) => {
  try {
    // Sanitizar y limitar qué datos mandamos al token
    const payload = {
      id: user.id,
      nombre: user.nombre,
      correo: user.correo,
      rol: user.rol || "cliente",
    };

    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h", // 1 hora → estándar
      algorithm: "HS256",
    });

  } catch (err) {
    console.error("❌ Error generando token:", err.message);
    throw new Error("Error al generar token");
  }
};

// ===========================================
// OPCIONAL: GENERAR REFRESH TOKEN (7 días)
// ===========================================

export const generateRefreshToken = (user) => {
  try {
    const payload = {
      id: user.id,
      rol: user.rol || "cliente",
    };

    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "7d",
      algorithm: "HS256",
    });

  } catch (err) {
    console.error("❌ Error generando refresh token:", err.message);
    throw new Error("Error al generar refresh token");
  }
};

// ===========================================
// OPCIONAL: VALIDAR/DECODIFICAR TOKEN
// ===========================================

export const verifyTokenInternal = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    console.error("❌ Token inválido en verifyTokenInternal:", err.message);
    return null;
  }
};
