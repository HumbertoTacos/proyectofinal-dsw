import dotenv from "dotenv";
dotenv.config();

export const verifyApiKey = (req, res, next) => {
  try {
    const apiKeyHeader = req.headers["x-api-key"];

    // Validar presencia
    if (!apiKeyHeader) {
      return res.status(401).json({
        error: "API Key faltante",
      });
    }

    // Sanitizar (eliminar espacios, saltos de línea, etc.)
    const apiKey = String(apiKeyHeader).trim();

    // Permitir lista de API Keys separadas por coma (opcional)
    const validKeys = (process.env.API_KEY || "")
      .split(",")
      .map((k) => k.trim())
      .filter((k) => k.length > 0);

    if (!validKeys.includes(apiKey)) {
      return res.status(401).json({
        error: "API Key inválida",
      });
    }

    next();
  } catch (err) {
    console.error("❌ Error en verifyApiKey:", err);
    return res.status(500).json({
      error: "Error interno al validar API Key",
    });
  }
};
