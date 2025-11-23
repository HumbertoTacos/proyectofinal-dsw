// js/components/Navbar.js
import { state, clearAuth } from "../state.js";
import { renderCartDrawer } from "./CartDrawer.js";

export function renderNavbar({ onNavigate }) {
  const root = document.getElementById("navbar-root");
  if (!root) return;

  const user = state.user;

  root.innerHTML = `
    <div class="navbar">
      <div class="navbar-left">
        <div class="navbar-logo">🍿</div>
        <div>
          <div class="navbar-title">CineSnack MX</div>
          <div class="text-muted" style="font-size: 0.75rem;">
            Dulcería de cine en línea
          </div>
        </div>
      </div>
      <div class="navbar-nav">
        <a href="#/" class="nav-link">Inicio</a>
        <a href="#/productos" class="nav-link">Menú</a>
        ${user ? `<a href="#/profile" class="nav-link">Mi perfil</a>` : "" }
        ${user?.rol === "admin" ? `<a href="#/admin/productos" class="nav-link">Admin</a>` : ""}

        <div class="cart-icon" id="nav-cart-icon" title="Ver carrito">
          🛒
          ${
            state.cart.length > 0
              ? `<span class="cart-badge">${state.cart.length}</span>`
              : ""
          }
        </div>

        ${
          user
            ? `
          <span class="nav-user">
            ${user.nombre} <span class="badge">${user.rol}</span>
          </span>
          <button class="nav-btn" id="btnLogout">Cerrar sesión</button>
          `
            : `
          <button class="nav-btn nav-btn-primary" id="btnLoginNav">
            Iniciar sesión
          </button>
          `
        }
      </div>
    </div>
  `;

  const btnLoginNav = document.getElementById("btnLoginNav");
  const btnLogout = document.getElementById("btnLogout");
  const cartIcon = document.getElementById("nav-cart-icon");

  if (btnLoginNav) {
    btnLoginNav.onclick = () => {
      window.location.hash = "#/login";
      onNavigate?.();
    };
  }

  if (btnLogout) {
    btnLogout.onclick = () => {
      clearAuth();
      window.location.hash = "#/login";
      onNavigate?.();
    };
  }

  if (cartIcon) {
    cartIcon.onclick = () => {
      renderCartDrawer();
    };
  }
}
