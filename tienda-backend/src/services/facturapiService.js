import axios from "axios";

const BASE_URL = "https://www.facturapi.io/v2";

// ==========================================================
// CLIENTE AXIOS CONFIGURADO
// ==========================================================
export const facturapi = axios.create({
  baseURL: BASE_URL,
  headers: {
    Authorization: `Bearer ${process.env.FACTURAPI_KEY}`,
    "Content-Type": "application/json",
  },
});

// ==========================================================
// MANEJO CENTRALIZADO DE ERRORES FACTURAPI
// ==========================================================
function handleFacturapiError(error) {
  if (error.response) {
    console.error("❌ Facturapi respondió con error:", error.response.data);
    throw new Error(error.response.data.message || "Error en Facturapi");
  }
  console.error("❌ Error de conexión con Facturapi:", error.message);
  throw new Error("No se pudo conectar con Facturapi");
}

// ==========================================================
// ===============   PRODUCTOS FACTURAPI   ===================
// ==========================================================

// Crear producto
export async function createFacturapiProduct(params) {
  try {
    const { data } = await facturapi.post("/products", params);
    return data;
  } catch (err) {
    handleFacturapiError(err);
  }
}

// Listar productos
export async function listFacturapiProducts({ page = 1, q = "" } = {}) {
  try {
    const { data } = await facturapi.get("/products", { params: { page, q } });
    return data;
  } catch (err) {
    handleFacturapiError(err);
  }
}

// Obtener producto por ID
export async function retrieveFacturapiProduct(id) {
  try {
    const { data } = await facturapi.get(`/products/${id}`);
    return data;
  } catch (err) {
    handleFacturapiError(err);
  }
}

// Actualizar producto
export async function updateFacturapiProduct(id, params) {
  try {
    const { data } = await facturapi.put(`/products/${id}`, params);
    return data;
  } catch (err) {
    handleFacturapiError(err);
  }
}

// Eliminar producto
export async function deleteFacturapiProduct(id) {
  try {
    const { data } = await facturapi.delete(`/products/${id}`);
    return data;
  } catch (err) {
    handleFacturapiError(err);
  }
}

// ==========================================================
// ===============   CLIENTES FACTURAPI   ====================
// ==========================================================

// Crear cliente
export async function createFacturapiCustomer(params) {
  try {
    const { data } = await facturapi.post("/customers", params);
    return data;
  } catch (err) {
    handleFacturapiError(err);
  }
}

// Listar clientes
export async function listFacturapiCustomers({ page = 1, q = "" } = {}) {
  try {
    const { data } = await facturapi.get("/customers", { params: { page, q } });
    return data;
  } catch (err) {
    handleFacturapiError(err);
  }
}

// Obtener cliente
export async function retrieveFacturapiCustomer(id) {
  try {
    const { data } = await facturapi.get(`/customers/${id}`);
    return data;
  } catch (err) {
    handleFacturapiError(err);
  }
}

// Actualizar cliente
export async function updateFacturapiCustomer(id, params) {
  try {
    const { data } = await facturapi.put(`/customers/${id}`, params);
    return data;
  } catch (err) {
    handleFacturapiError(err);
  }
}

// Eliminar cliente
export async function deleteFacturapiCustomer(id) {
  try {
    const { data } = await facturapi.delete(`/customers/${id}`);
    return data;
  } catch (err) {
    handleFacturapiError(err);
  }
}

// ==========================================================
// ==================   FACTURAS   ==========================
// ==========================================================

// Crear factura CFDI
export async function createFacturapiInvoice(params) {
  try {
    const { data } = await facturapi.post("/invoices", params);
    return data;
  } catch (err) {
    handleFacturapiError(err);
  }
}

// Obtener factura
export async function retrieveInvoice(id) {
  try {
    const { data } = await facturapi.get(`/invoices/${id}`);
    return data;
  } catch (err) {
    handleFacturapiError(err);
  }
}

// Descargar factura PDF
export async function downloadInvoicePDF(id) {
  try {
    const { data } = await facturapi.get(`/invoices/${id}/pdf`, {
      responseType: "arraybuffer",
    });
    return data;
  } catch (err) {
    handleFacturapiError(err);
  }
}

// Descargar factura XML
export async function downloadInvoiceXML(id) {
  try {
    const { data } = await facturapi.get(`/invoices/${id}/xml`);
    return data;
  } catch (err) {
    handleFacturapiError(err);
  }
}

// Cancelar factura
export async function cancelFacturapiInvoice(id, params) {
  try {
    const { data } = await facturapi.post(`/invoices/${id}/cancel`, params);
    return data;
  } catch (err) {
    handleFacturapiError(err);
  }
}

// ==========================================================
// ==================   RECIBOS / PAGOS  =====================
// ==========================================================

// Registrar pago (Recibo)
export async function createPayment(params) {
  try {
    const { data } = await facturapi.post("/payments", params);
    return data;
  } catch (err) {
    handleFacturapiError(err);
  }
}

// Obtener un pago
export async function retrievePayment(id) {
  try {
    const { data } = await facturapi.get(`/payments/${id}`);
    return data;
  } catch (err) {
    handleFacturapiError(err);
  }
}

// Listar pagos
export async function listPayments({ page = 1 } = {}) {
  try {
    const { data } = await facturapi.get("/payments", { params: { page } });
    return data;
  } catch (err) {
    handleFacturapiError(err);
  }
}
