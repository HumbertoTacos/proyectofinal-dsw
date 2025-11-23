import { db } from "../config/firebase.js";
import Joi from "joi";

// SERVICIOS FACTURAPI
import {
  createFacturapiProduct,
  updateFacturapiProduct,
  deleteFacturapiProduct,
  listFacturapiProducts
} from "../services/facturapiService.js";

import { buscarClaveSAT, buscarUnidadSAT } from "../services/satService.js";
import { detectarIVA } from "../services/ivaService.js";

const collection = db.collection("productos");

// ====================== VALIDACIÓN ==========================

const productoSchema = Joi.object({
  nombre: Joi.string().required(),
  marca: Joi.string().allow(""),
  stock: Joi.number().integer().min(0).default(0),
  precio: Joi.number().min(0).required(),
  id: Joi.string().allow(""),
  categoria: Joi.string().allow(""),
  url_img: Joi.string().uri().allow(""),
  codesay: Joi.string().allow(""),

  // No permitimos que el cliente envíe esto
  product_key: Joi.forbidden(),
  unit_key: Joi.forbidden(),
  tax_rate: Joi.forbidden(),
  tax_included: Joi.forbidden()
});

// ====================== GET ALL ==========================

export async function getAll(req, res) {
  try {
    const snap = await collection.get();
    const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

// ====================== CREATE ==========================

export async function create(req, res) {
  try {
    // ❌ Aquí estaba el error → decía productSchema
    const body = await productoSchema.validateAsync(req.body, { stripUnknown: true });

    const nombre = body.nombre.trim();

    // 1️⃣ Detectar CLAVE SAT (dulcería)
    const product_key = await buscarClaveSAT(nombre);

    // 2️⃣ Detectar UNIDAD SAT
    const unidadSAT = await buscarUnidadSAT(nombre);
    const unit_key = unidadSAT.key;

    // 3️⃣ Detectar IVA automático
    const tax_rate = detectarIVA(nombre);
    const tax_included = true;

    // 4️⃣ Crear producto en Facturapi
    const satProduct = await createFacturapiProduct({
      description: nombre,
      price: body.precio,
      product_key,
      unit_key,
      tax_included,
      taxes: [{ type: "IVA", rate: tax_rate }]
    });

    // 5️⃣ Guardar en Firestore
    const toSave = {
      ...body,
      tax_included,
      tax_rate,
      id_factori: satProduct.id,
      product_key,
      unit_key,
      taxes: satProduct.taxes,
      created_at: new Date().toISOString()
    };

    const ref = await collection.add(toSave);

    res.status(201).json({ id: ref.id, ...toSave });

  } catch (e) {
    console.error("❌ Error al crear producto:", e.message);
    res.status(400).json({ error: e.message });
  }
}

// ====================== UPDATE ==========================

export async function update(req, res) {
  try {
    const id = req.params.id;

    const partial = await productoSchema
      .fork(Object.keys(productoSchema.describe().keys), (s) => s.optional())
      .validateAsync(req.body, { stripUnknown: true });

    const snap = await collection.doc(id).get();
    if (!snap.exists)
      return res.status(404).json({ error: "Producto no encontrado" });

    const current = snap.data();

    // Actualizar también en Facturapi
    if (current.id_factori) {
      await updateFacturapiProduct(current.id_factori, {
        description: partial.nombre || current.nombre,
        price: partial.precio || current.precio,
        product_key: current.product_key,
        unit_key: current.unit_key,
        tax_included: current.tax_included,
        taxes: [{
          type: "IVA",
          rate: current.tax_rate ?? 0.16
        }]
      });
    }

    await collection.doc(id).set(
      { ...partial, updated_at: new Date().toISOString() },
      { merge: true }
    );

    res.json({ message: "Producto actualizado" });

  } catch (e) {
    res.status(400).json({ error: e.message });
  }
}

// ====================== DELETE ==========================

export async function remove(req, res) {
  try {
    const id = req.params.id;

    const snap = await collection.doc(id).get();
    if (!snap.exists)
      return res.status(404).json({ error: "Producto no encontrado" });

    const current = snap.data();

    // Eliminar también en Facturapi
    if (current.id_factori) {
      try {
        await deleteFacturapiProduct(current.id_factori);
      } catch (e) {
        console.error("❌ Error eliminando en Facturapi:", e.message);
      }
    }

    await collection.doc(id).delete();

    res.json({ message: "Producto eliminado" });

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

// ====================== IMPORTAR FACTURAPI ==========================

export async function importar(req, res) {
  try {
    const page = Number(req.query.page || 1);
    const data = await listFacturapiProducts({ page });

    const batch = db.batch();

    (data.data || []).forEach((p) => {
      const ref = collection.doc(p.id);

      batch.set(
        ref,
        {
          id_factori: p.id,
          nombre: p.description,
          precio: p.price,
          taxes: p.taxes,
          product_key: p.product_key,
          unit_key: p.unit_key,
          tax_included: p.tax_included,
          created_from: "facturapi",
          updated_at: new Date().toISOString(),
        },
        { merge: true }
      );
    });

    await batch.commit();

    res.json({ imported: (data.data || []).length, page });

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

// ====================== GET BY ID ==========================

export async function getById(req, res) {
  try {
    const id = req.params.id;
    const snap = await collection.doc(id).get();

    if (!snap.exists)
      return res.status(404).json({ error: "Producto no encontrado" });

    res.json({ id: snap.id, ...snap.data() });

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
