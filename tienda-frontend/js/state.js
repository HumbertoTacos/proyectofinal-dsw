// js/state.js
import { apiCrearCarrito, apiActualizarCarrito, apiEliminarCarrito } from "./services/apiClient.js";

export const state = {
  user: null,
  token: null,
  cart: [],
  carritoId: null,
};

const TOKEN_KEY = "cineSnack.token";
const USER_KEY = "cineSnack.user";
const CART_KEY = "cineSnack.cart";
const CART_ID_KEY = "cineSnack.cartId";

export function loadStateFromStorage() {
  const token = localStorage.getItem(TOKEN_KEY);
  const user = localStorage.getItem(USER_KEY);
  const cart = localStorage.getItem(CART_KEY);
  const carritoId = localStorage.getItem(CART_ID_KEY);

  if (token && user) {
    state.token = token;
    state.user = JSON.parse(user);
  }
  if (cart) {
    state.cart = JSON.parse(cart);
  }
  if (carritoId) {
    state.carritoId = carritoId;
  }
}

export function saveAuth(token, user) {
  state.token = token;
  state.user = user;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearCart() {
  state.cart = [];
  state.carritoId = null;
  localStorage.removeItem(CART_KEY);
  localStorage.removeItem(CART_ID_KEY);
  window.dispatchEvent(new CustomEvent("cart:updated"));
}

export function clearAuth() {
  clearCart();
  state.token = null;
  state.user = null;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function setCart(cartItems, carritoId = null) {
  state.cart = cartItems;
  if (carritoId) {
    state.carritoId = carritoId;
    localStorage.setItem(CART_ID_KEY, carritoId);
  }
  localStorage.setItem(CART_KEY, JSON.stringify(cartItems));
}

export function cartTotals() {
  let subtotal = 0;
  state.cart.forEach((it) => {
    subtotal += it.precio * it.cantidad;
  });
  const iva = subtotal * 0.16;
  const total = subtotal + iva;
  return { subtotal, iva, total };
}

async function syncCartWithBackend() {
  if (!state.carritoId) return;
  const totals = cartTotals();
  await apiActualizarCarrito(state.carritoId, {
    productos: state.cart.map((p) => ({
      productoId: p.productoId,
      cantidad: p.cantidad,
    })),
    subtotal: totals.subtotal,
    iva: totals.iva,
    total: totals.total,
  });
}

export async function addToCart(producto) {
  const existing = state.cart.find((it) => it.productoId === producto.id);
  if (existing) {
    existing.cantidad += 1;
  } else {
    state.cart.push({
      productoId: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      cantidad: 1,
    });
  }

  if (!state.carritoId) {
    const carrito = await apiCrearCarrito();
    state.carritoId = carrito.id;
    localStorage.setItem(CART_ID_KEY, carrito.id);
  } else {
    await syncCartWithBackend();
  }

  setCart(state.cart, state.carritoId);
  window.dispatchEvent(new CustomEvent("cart:updated"));
}

export async function updateCartQty(productoId, cantidad) {
  const item = state.cart.find((it) => it.productoId === productoId);
  if (!item) return;
  item.cantidad = Math.max(1, cantidad);
  await syncCartWithBackend();
  setCart(state.cart, state.carritoId);
  window.dispatchEvent(new CustomEvent("cart:updated"));
}

export async function removeFromCart(productoId) {
  state.cart = state.cart.filter((it) => it.productoId !== productoId);

  if (!state.cart.length && state.carritoId) {
    try {
      await apiEliminarCarrito(state.carritoId);
    } catch (err) {
      console.error("Error eliminando carrito remoto", err);
    }
    state.carritoId = null;
    localStorage.removeItem(CART_ID_KEY);
  } else {
    await syncCartWithBackend();
  }

  setCart(state.cart, state.carritoId);
  window.dispatchEvent(new CustomEvent("cart:updated"));
}
