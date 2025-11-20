import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const generateToken = (user) => {
  const payload = {
    id: user.id,
    nombre: user.nombre,
    correo: user.correo,
    rol: user.rol,
  };

  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
};
