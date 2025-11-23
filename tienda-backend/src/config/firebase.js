import admin from "firebase-admin";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

// ========================================================
// VALIDAR VARIABLES DE ENTORNO NECESARIAS
// ========================================================
const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
const projectId = process.env.FIREBASE_PROJECT_ID;

if (!credPath) {
  throw new Error("❌ Falta GOOGLE_APPLICATION_CREDENTIALS en .env");
}

if (!fs.existsSync(credPath)) {
  throw new Error(`❌ No se encontró archivo de credenciales en: ${credPath}`);
}

if (!projectId) {
  throw new Error("❌ Falta FIREBASE_PROJECT_ID en .env");
}

// ========================================================
// LEER CREDENCIALES DESDE EL JSON
// ========================================================
const serviceAccount = JSON.parse(fs.readFileSync(credPath, "utf8"));

// ========================================================
// INICIALIZAR FIREBASE ADMIN
// ========================================================
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId,
  });
}

// ========================================================
// EXPORTAR FIRESTORE
// ========================================================
export const db = admin.firestore();

// Opcional pero recomendado
db.settings({
  ignoreUndefinedProperties: true, // evita errores por campos undefined
});
