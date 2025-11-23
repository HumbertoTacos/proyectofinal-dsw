import { db } from "../config/firebase.js";
import Joi from "joi";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/jwtUtils.js";

// Servicios Facturapi
import {
  createFacturapiCustomer,
  updateFacturapiCustomer,
  deleteFacturapiCustomer
} from "../services/facturapiService.js";

const collection = db.collection("usuarios");

// ================= VALIDACIÓN =================

const userSchema = Joi.object({
  user_id: Joi.string().required(),
  nombre: Joi.string().min(2).required(),
  contrasena: Joi.string().min(6).required(),
  correo: Joi.string().email().required(),
  rol: Joi.string().valid("admin", "cliente").default("cliente"),

  domicilio: Joi.string().allow(""),       // Calle
  cp: Joi.string().allow(""),              // Código postal (nuevo)
  rfc: Joi.string().allow(""),             // RFC opcional
  regimen: Joi.string().allow(""),         // Régimen fiscal opcional

  id_factori: Joi.string().allow("")       // ID cliente Facturapi
});

// ================= GET ALL =================

export async function getAll(req, res) {
  try {
    const snap = await collection.get();
    const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

// ================= CREATE (REGISTRO CLIENTE + FACTURAPI) =================

export async function create(req, res) {
  try {
    const body = await userSchema.validateAsync(req.body, { stripUnknown: true });

    const hashed = await bcrypt.hash(body.contrasena, 10);

    let facturapiId = "";

    // ================= CREAR CLIENTE EN FACTURAPI =================
    try {
      const customer = await createFacturapiCustomer({
        email: body.correo,
        legal_name: body.nombre,

        // RFC opcional
        tax_id: body.rfc || undefined,

        // Si no manda régimen → "601" (general)
        tax_system: body.regimen || "601",

        address: {
          zip: body.cp || "00000",          // ZIP obligatorio
          street: body.domicilio || ""      // Calle opcional
        }
      });

      facturapiId = customer.id;

    } catch (err) {
      console.error("❌ Error creando cliente en Facturapi:", err.message);
      // No rompemos flujo — usuario se crea localmente de todas formas
    }

    const toSave = {
      ...body,
      contrasena: hashed,
      id_factori: facturapiId,
      created_at: new Date().toISOString()
    };

    const ref = await collection.add(toSave);
    res.status(201).json({ id: ref.id, ...toSave });

  } catch (e) {
    res.status(400).json({ error: e.message });
  }
}

// ================= UPDATE =================

export async function update(req, res) {
  try {
    const id = req.params.id;

    const partialSchema = userSchema.fork(
      Object.keys(userSchema.describe().keys),
      (s) => s.optional()
    );

    const data = await partialSchema.validateAsync(req.body, { stripUnknown: true });

    const snap = await collection.doc(id).get();
    if (!snap.exists)
      return res.status(404).json({ error: "Usuario no encontrado" });

    const current = snap.data();

    if (data.contrasena)
      data.contrasena = await bcrypt.hash(data.contrasena, 10);

    // ========== Actualizar también en Facturapi ==========
    if (current.id_factori) {
      try {
        await updateFacturapiCustomer(current.id_factori, {
          email: data.correo || current.correo,
          legal_name: data.nombre || current.nombre,

          tax_id: data.rfc || current.rfc || undefined,
          tax_system: data.regimen || current.regimen || "601",

          address: {
            zip: data.cp || current.cp || "00000",
            street: data.domicilio || current.domicilio || ""
          }
        });
      } catch (err) {
        console.error("❌ Error actualizando Facturapi:", err.message);
      }
    }

    await collection.doc(id).set(
      { ...data, updated_at: new Date().toISOString() },
      { merge: true }
    );

    res.json({ message: "Usuario actualizado" });

  } catch (e) {
    res.status(400).json({ error: e.message });
  }
}

// ================= DELETE =================

export async function remove(req, res) {
  try {
    const id = req.params.id;
    const snap = await collection.doc(id).get();

    if (!snap.exists)
      return res.status(404).json({ error: "Usuario no encontrado" });

    const user = snap.data();

    // ⚠ No intentar borrar cliente en Facturapi si ya tiene facturas
    if (user.id_factori) {
      console.warn("⚠ Usuario tiene facturas. Solo se elimina localmente.");
    }

    // Eliminar solo en Firestore
    await collection.doc(id).delete();

    res.json({ message: "Usuario eliminado localmente (Facturapi conserva historial)" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}


// ================= LOGIN =================

export async function login(req, res) {
  const { correo, contrasena } = req.body;

  try {
    const snapshot = await collection.where("correo", "==", correo).get();
    if (snapshot.empty)
      return res.status(404).json({ error: "Usuario no encontrado" });

    const userDoc = snapshot.docs[0];
    const user = userDoc.data();

    const esValida = await bcrypt.compare(contrasena, user.contrasena);
    if (!esValida)
      return res.status(401).json({ error: "Contraseña incorrecta" });

    const token = generateToken({ id: userDoc.id, ...user });

    res.json({
      message: "Inicio de sesión exitoso",
      token,
      usuario: { id: userDoc.id, ...user }
    });

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

// ================= GET BY ID =================

export async function getById(req, res) {
  try {
    const id = req.params.id;
    const snap = await collection.doc(id).get();

    if (!snap.exists) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json({ id: snap.id, ...snap.data() });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
