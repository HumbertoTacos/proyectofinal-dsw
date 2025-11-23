// js/services/apiClient.js
import { state } from "../state.js";

const BASE_URL = "/api";
const API_KEY = "1234";

function buildHeaders(needsAuth = false) {
  const headers = {
    "x-api-key": API_KEY,
    "Content-Type": "application/json",
  };
  if (needsAuth && state.token) {
    headers["Authorization"] = "Bearer " + state.token;
  }
  return headers;
}

async function handleResponse(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data.error || data.message || `Error en la petición (${res.status})`;
    throw new Error(msg);
  }
  return data;
}

// ===== AUTH =====
export async function apiLogin(correo, contrasena) {
  const res = await fetch(`${BASE_URL}/usuarios/login`, {
    method: "POST",
    headers: buildHeaders(false),
    body: JSON.stringify({ correo, contrasena }),
  });
  return handleResponse(res);
}

export async function apiRegister(body) {
  const res = await fetch(`${BASE_URL}/usuarios`, {
    method: "POST",
    headers: buildHeaders(false),
    body: JSON.stringify(body),
  });
  return handleResponse(res);
}

export async function apiUpdateUsuario(id, body) {
  const res = await fetch(`${BASE_URL}/usuarios/${id}`, {
    method: "PUT",
    headers: buildHeaders(true),
    body: JSON.stringify(body),
  });
  return handleResponse(res);
}

// ===== PRODUCTOS =====
export async function apiGetProductos() {
  const res = await fetch(`${BASE_URL}/productos`, {
    headers: buildHeaders(true),
  });
  return handleResponse(res);
}

export async function apiCreateProducto(body) {
  const res = await fetch(`${BASE_URL}/productos`, {
    method: "POST",
    headers: buildHeaders(true),
    body: JSON.stringify(body),
  });
  return handleResponse(res);
}

export async function apiUpdateProducto(id, body) {
  const res = await fetch(`${BASE_URL}/productos/${id}`, {
    method: "PUT",
    headers: buildHeaders(true),
    body: JSON.stringify(body),
  });
  return handleResponse(res);
}

export async function apiDeleteProducto(id) {
  const res = await fetch(`${BASE_URL}/productos/${id}`, {
    method: "DELETE",
    headers: buildHeaders(true),
  });
  return handleResponse(res);
}

// ===== CARRITO =====
export async function apiGetCarritoPendiente(usuarioId) {
  const res = await fetch(`${BASE_URL}/carrito/pendiente/${usuarioId}`, {
    headers: buildHeaders(true),
  });
  if (res.status === 404) {
    return null;
  }
  return handleResponse(res);
}

export async function apiCrearCarrito() {
  if (!state.user) throw new Error("Usuario no autenticado");

  const body = {
    usuarioId: state.user.id,
    productos: state.cart.map((it) => ({
      productoId: it.productoId,
      cantidad: it.cantidad,
    })),
    pagado: false,
  };

  const res = await fetch(`${BASE_URL}/carrito`, {
    method: "POST",
    headers: buildHeaders(true),
    body: JSON.stringify(body),
  });
  return handleResponse(res);
}

export async function apiActualizarCarrito(id, body) {
  const res = await fetch(`${BASE_URL}/carrito/${id}`, {
    method: "PUT",
    headers: buildHeaders(true),
    body: JSON.stringify(body),
  });
  return handleResponse(res);
}

export async function apiEliminarCarrito(id) {
  const res = await fetch(`${BASE_URL}/carrito/${id}`, {
    method: "DELETE",
    headers: buildHeaders(true),
  });
  return handleResponse(res);
}

export async function apiCrearCheckoutStripe(carritoId) {
  const res = await fetch(`${BASE_URL}/stripe/checkout`, {
    method: "POST",
    headers: buildHeaders(true),
    body: JSON.stringify({ carritoId }),
  });
  return handleResponse(res);
}
