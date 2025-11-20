import { db } from "../config/firebase.js";
import Joi from "joi";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/jwtUtils.js";

const collection = db.collection("usuarios");

const userSchema = Joi.object({
  user_id: Joi.string().required(),
  nombre: Joi.string().min(2).required(),
  contrasena: Joi.string().min(6).required(),
  correo: Joi.string().email().required(),
  rol: Joi.string().valid("admin", "cliente").default("cliente"),
  domicilio: Joi.string().allow(""),
  id_factori: Joi.string().allow(""),
});

export async function getAll(req, res) {
  try {
    const snap = await collection.get();
    const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

export async function create(req, res) {
  try {
    const body = await userSchema.validateAsync(req.body, { stripUnknown: true });
    const hashed = await bcrypt.hash(body.contrasena, 10);
    const toSave = { ...body, contrasena: hashed, created_at: new Date().toISOString() };
    const ref = await collection.add(toSave);
    res.status(201).json({ id: ref.id, ...toSave });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
}

export async function update(req, res) {
  try {
    const id = req.params.id;
    const partialSchema = userSchema.fork(Object.keys(userSchema.describe().keys), (s) =>
      s.optional()
    );
    const data = await partialSchema.validateAsync(req.body, { stripUnknown: true });
    if (data.contrasena) data.contrasena = await bcrypt.hash(data.contrasena, 10);
    await collection.doc(id).set(data, { merge: true });
    res.json({ message: "Usuario actualizado" });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
}

export async function remove(req, res) {
  try {
    const id = req.params.id;
    await collection.doc(id).delete();
    res.json({ message: "Usuario eliminado" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

// ---------------------- NUEVO LOGIN ----------------------
export async function login(req, res) {
  const { correo, contrasena } = req.body;

  try {
    const snapshot = await collection.where("correo", "==", correo).get();
    if (snapshot.empty) return res.status(404).json({ error: "Usuario no encontrado" });

    const userDoc = snapshot.docs[0];
    const user = userDoc.data();

    const esValida = await bcrypt.compare(contrasena, user.contrasena);
    if (!esValida) return res.status(401).json({ error: "Contraseña incorrecta" });

    const token = generateToken({ id: userDoc.id, ...user });
    res.json({ message: "Inicio de sesión exitoso", token });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
