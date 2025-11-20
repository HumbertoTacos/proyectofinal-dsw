import dotenv from "dotenv";
dotenv.config();

export const verifyApiKey = (req, res, next) => {
  const apiKey = req.headers["x-api-key"];

  if (!apiKey || apiKey !== process.env.API_KEY) {
    return res.status(401).json({ message: "API Key inválida o faltante" });
  }

  next();
};
