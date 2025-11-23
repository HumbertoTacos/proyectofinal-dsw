// js/components/CartDrawer.js
import { state, updateCartQty, removeFromCart, cartTotals } from "../state.js";

export function renderCartDrawer() {
  let backdrop = document.getElementById("cart-drawer-backdrop");
  if (backdrop) {
    backdrop.remove();
  }

  backdrop = document.createElement("div");
  backdrop.id = "cart-drawer-backdrop";
  backdrop.className = "cart-drawer-backdrop";

  backdrop.innerHTML = `
    <div class="cart-drawer">
      <div class="cart-drawer-header">
        <strong>Tu carrito</strong>
      </div>
      <div class="cart-drawer-body" id="cart-drawer-body"></div>
      <div class="cart-drawer-footer" id="cart-drawer-footer"></div>
    </div>
  `;

  backdrop.addEventListener("click", (ev) => {
    if (ev.target === backdrop) {
      backdrop.remove();
    }
  });

  document.body.appendChild(backdrop);
  renderDrawerContent();
}

async function renderDrawerContent() {
  const body = document.getElementById("cart-drawer-body");
  const footer = document.getElementById("cart-drawer-footer");

  if (!body || !footer) return;

  if (!state.cart.length) {
    body.innerHTML = `<p class="text-muted">Tu carrito está vacío.</p>`;
    footer.innerHTML = `<button class="nav-btn btn-full" id="btnIrMenu">Ir al menú</button>`;
    document.getElementById("btnIrMenu").onclick = () => {
      window.location.hash = "#/productos";
      document.getElementById("cart-drawer-backdrop")?.remove();
    };
    return;
  }

  const totals = cartTotals();

  body.innerHTML = state.cart
    .map(
      (it) => `
    <div class="cart-drawer-item" data-id="${it.productoId}">
      <div>
        <div>${it.nombre}</div>
        <div class="text-muted">$${it.precio.toFixed(2)} c/u</div>
      </div>
      <div>
        <input type="number" min="1" class="input-qty" value="${it.cantidad}" data-qty="${it.productoId}" />
        <a href="#" class="link" data-remove="${it.productoId}">Quitar</a>
      </div>
    </div>`
    )
    .join("");

  footer.innerHTML = `
    <div class="summary-row">
      <span>Subtotal</span>
      <span>$${totals.subtotal.toFixed(2)}</span>
    </div>
    <div class="summary-row">
      <span>IVA</span>
      <span>$${totals.iva.toFixed(2)}</span>
    </div>
    <div class="summary-row total">
      <span>Total</span>
      <span>$${totals.total.toFixed(2)}</span>
    </div>
    <button class="hero-btn btn-full" id="btnIrCarrito">Ir al carrito</button>
  `;

  body.querySelectorAll("[data-qty]").forEach((input) => {
    input.addEventListener("change", async (ev) => {
      const id = input.getAttribute("data-qty");
      const val = parseInt(ev.target.value, 10) || 1;
      await updateCartQty(id, val);
      renderDrawerContent();
    });
  });

  body.querySelectorAll("[data-remove]").forEach((link) => {
    link.addEventListener("click", async (ev) => {
      ev.preventDefault();
      const id = link.getAttribute("data-remove");
      await removeFromCart(id);
      renderDrawerContent();
    });
  });

  document.getElementById("btnIrCarrito").onclick = () => {
    window.location.hash = "#/carrito";
    document.getElementById("cart-drawer-backdrop")?.remove();
  };
}
