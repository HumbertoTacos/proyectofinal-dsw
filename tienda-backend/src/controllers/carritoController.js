import { db } from "../config/firebase.js";
import Joi from "joi";
import { calcTotals } from "../utils/calc.js";

// *** IMPORTAMOS SERVICIOS DE FACTURAPI ***
import {
  createFacturapiCustomer,
  createFacturapiInvoice,
  retrieveInvoice,
  downloadInvoicePDF,
  downloadInvoiceXML
} from "../services/facturapiService.js";
import { createStripeCheckoutSession } from "../services/stripeService.js";

const collection = db.collection("carrito");
const productosCol = db.collection("productos");
const usuariosCol = db.collection("usuarios");

// ====================== VALIDACIÓN ==========================

const cartSchema = Joi.object({
  usuarioId: Joi.string().required(),
  productos: Joi.array()
    .items(
      Joi.object({
        productoId: Joi.string().required(),
        cantidad: Joi.number().integer().min(1).default(1),
      })
    )
    .min(1)
    .required(),
  pagado: Joi.boolean().default(false),
  id_stripe: Joi.string().allow(""),
  id_factori: Joi.string().allow(""), // ID de factura Facturapi
});

// ====================== CARGAR PRODUCTOS ==========================

async function loadItems(productos) {
  const items = [];
  for (const it of productos) {
    const snap = await productosCol.doc(it.productoId).get();
    if (!snap.exists) continue;
    const prod = snap.data();

    items.push({
      productId: it.productoId,
      facturapiProductId: prod.id_factori || null,
      name: prod.nombre,
      price: Number(prod.precio) || 0,
      quantity: it.cantidad,
      taxRate:
        Array.isArray(prod.taxes) && prod.taxes[0]?.rate != null
          ? Number(prod.taxes[0].rate)
          : 0.16,
    });
  }
  return items;
}

// ====================== GET BY ID ==========================

export async function getById(req, res) {
  try {
    const id = req.params.id;
    const snap = await collection.doc(id).get();

    if (!snap.exists) {
      return res.status(404).json({ error: "Carrito no encontrado" });
    }

    res.json({ id: snap.id, ...snap.data() });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

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
    const body = await cartSchema.validateAsync(req.body, { stripUnknown: true });

    // validar usuario
    const user = await usuariosCol.doc(body.usuarioId).get();
    if (!user.exists)
      return res.status(400).json({ error: "Usuario no encontrado" });

    // cargar productos
    const items = await loadItems(body.productos);
    if (!items.length)
      return res.status(400).json({ error: "Productos no válidos" });

    const totals = calcTotals(
      items.map((x) => ({
        price: x.price,
        quantity: x.quantity,
        taxRate: x.taxRate,
      }))
    );

    const toSave = {
      ...body,
      items,
      subtotal: totals.subtotal,
      iva: totals.iva,
      total: totals.total,
      created_at: new Date().toISOString(),
      id_factori: "", // vacío hasta que se genere la factura
    };

    const ref = await collection.add(toSave);
    res.status(201).json({ id: ref.id, ...toSave });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
}

// ====================== UPDATE (AQUÍ SE CREA LA FACTURA) ==========================

export async function update(req, res) {
  try {
    const id = req.params.id;

    // obtener carrito actual
    const cartRef = collection.doc(id);
    const cartSnap = await cartRef.get();

    if (!cartSnap.exists)
      return res.status(404).json({ error: "Carrito no encontrado" });

    const current = cartSnap.data();

    // validar cambios
    const partial = await cartSchema
      .fork(Object.keys(cartSchema.describe().keys), (s) => s.optional())
      .validateAsync(req.body, { stripUnknown: true });

    let recompute = false;
    if (partial.productos) recompute = true;

    let newData = { ...current, ...partial };

    // Si cambiaron productos, recargar totales
    if (recompute) {
      const items = await loadItems(partial.productos);
      const totals = calcTotals(
        items.map((x) => ({
          price: x.price,
          quantity: x.quantity,
          taxRate: x.taxRate,
        }))
      );

      newData = {
        ...newData,
        items,
        subtotal: totals.subtotal,
        iva: totals.iva,
        total: totals.total,
      };
    }

    // =========================
    // GENERAR FACTURA AQUÍ
    // =========================

    const justPaid =
      newData.pagado === true &&
      (current.pagado === false || current.pagado == null);

    if (justPaid && !current.id_factori) {
      // 1. Obtener usuario
      const userSnap = await usuariosCol.doc(newData.usuarioId).get();
      if (!userSnap.exists)
        return res.status(400).json({ error: "Usuario no encontrado" });

      const user = userSnap.data();

      // 2. Asegurar cliente Facturapi
      let customerId = user.id_factori;

      if (!customerId) {
        const customer = await createFacturapiCustomer({
          email: user.correo,
          legal_name: user.nombre,
        });

        customerId = customer.id;

        await usuariosCol.doc(userSnap.id).set(
          { id_factori: customerId },
          { merge: true }
        );
      }

      // 3. Construir items de factura
      const invoiceItems = (newData.items || []).map((it) => {
        if (it.facturapiProductId) {
          return {
            quantity: it.quantity,
            product: it.facturapiProductId,
          };
        }

        return {
          quantity: it.quantity,
          product: {
            description: it.name,
            price: it.price,
            tax_included: true,
            taxes: [{ type: "IVA", rate: it.taxRate ?? 0.16 }],
          },
        };
      });

      // 4. Crear factura (CORREGIDO con payment_form)
      const invoice = await createFacturapiInvoice({
        customer: customerId,   // ✔ requerido
        items: invoiceItems,
        payment_form: "99"      // ✔ requerido por SAT
      });

      newData.id_factori = invoice.id;
    }

    // Guardar cambios
    await cartRef.set(
      { ...partial, ...newData, updated_at: new Date().toISOString() },
      { merge: true }
    );

    res.json({
      message: "Carrito actualizado",
      id_factori: newData.id_factori || null,
    });
  } catch (e) {
    console.error(e);
    res.status(400).json({ error: e.message });
  }
}

// ====================== DESCARGAR FACTURA PDF ==========================

export async function getFacturaPDF(req, res) {
  try {
    const id = req.params.id;

    const snap = await collection.doc(id).get();
    if (!snap.exists) return res.status(404).json({ error: "Carrito no encontrado" });

    const data = snap.data();
    if (!data.id_factori) {
      return res.status(400).json({ error: "Este carrito no tiene factura generada" });
    }

    const pdf = await downloadInvoicePDF(data.id_factori);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=factura_${id}.pdf`);
    res.send(Buffer.from(pdf));

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

// ====================== DESCARGAR FACTURA XML ==========================

export async function getFacturaXML(req, res) {
  try {
    const id = req.params.id;

    const snap = await collection.doc(id).get();
    if (!snap.exists) return res.status(404).json({ error: "Carrito no encontrado" });

    const data = snap.data();
    if (!data.id_factori) {
      return res.status(400).json({ error: "Este carrito no tiene factura generada" });
    }

    const xml = await downloadInvoiceXML(data.id_factori);

    res.setHeader("Content-Type", "application/xml");
    res.setHeader("Content-Disposition", `attachment; filename=factura_${id}.xml`);
    res.send(xml);

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

// ====================== DELETE ==========================

export async function remove(req, res) {
  try {
    const id = req.params.id;
    await collection.doc(id).delete();
    res.json({ message: "Carrito eliminado" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}


// ====================== FACTURACIÓN DESDE STRIPE WEBHOOK ==========================

export async function generarFacturaDesdeStripe(carritoId) {
  const cartRef = collection.doc(carritoId);
  const cartSnap = await cartRef.get();

  if (!cartSnap.exists) throw new Error("Carrito no encontrado");

  const cart = cartSnap.data();
  if (cart.id_factori) return; // Ya tenía factura

  // Obtener usuario
  const userSnap = await usuariosCol.doc(cart.usuarioId).get();
  if (!userSnap.exists) throw new Error("Usuario no encontrado");

  const user = userSnap.data();

  // Asegurar cliente en Facturapi
  let customerId = user.id_factori;
  if (!customerId) {
    const customer = await createFacturapiCustomer({
      email: user.correo,
      legal_name: user.nombre,
      address: {
        street: user.domicilio || "",
        zip: user.cp || "00000",
        country: "MX"
      }
    });

    customerId = customer.id;

    await usuariosCol.doc(userSnap.id).set(
      { id_factori: customerId },
      { merge: true }
    );
  }

  // Construcción de items para Facturapi
  const invoiceItems = (cart.items || []).map((it) => {
    if (it.facturapiProductId) {
      return {
        quantity: it.quantity,
        product: it.facturapiProductId
      };
    }
    return {
      quantity: it.quantity,
      product: {
        description: it.name,
        price: it.price,
        tax_included: true,
        taxes: [{ type: "IVA", rate: it.taxRate ?? 0.16 }]
      }
    };
  });

  // Crear factura CFDI en Facturapi
  const invoice = await createFacturapiInvoice({
    customer: customerId,
    items: invoiceItems,
    payment_form: "01", // Efectivo (TEST)
    payment_method: "PUE"
  });

  await cartRef.set(
    {
      id_factori: invoice.id,
      updated_at: new Date().toISOString()
    },
    { merge: true }
  );

  return invoice;
}

export async function getCarritoPendiente(req, res) {
  try {
    const userId = req.params.usuarioId;

    const snap = await collection
      .where("usuarioId", "==", userId)
      .where("pagado", "==", false)
      .limit(1)
      .get();

    if (snap.empty) {
      return res.json(null); // No hay carrito pendiente
    }

    const doc = snap.docs[0];
    res.json({ id: doc.id, ...doc.data() });

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
