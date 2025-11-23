// js/pages/CartPage.js
import { state, updateCartQty, removeFromCart, cartTotals } from "../state.js";
import { apiCrearCarrito, apiCrearCheckoutStripe } from "../services/apiClient.js";

export function CartPage() {
  const app = document.getElementById("app");

  if (!state.user) {
    app.innerHTML = `
      <section class="center-page">
        <h1>Tu carrito está vacío 🛒</h1>
        <p class="text-muted">
          Inicia sesión y agrega productos al carrito para continuar.
        </p>
        <a href="#/productos" class="link">Ver menú de productos</a>
      </section>`;
    return;
  }

  if (!state.cart.length) {
    app.innerHTML = `
      <section class="center-page">
        <h1>Tu carrito está vacío 🛒</h1>
        <a href="#/productos" class="link">Ir al menú</a>
      </section>`;
    return;
  }

  const totals = cartTotals();

  app.innerHTML = `
    <section class="cart-layout">
      <div class="cart-card">
        <h2>Carrito de compras</h2>
        <p class="text-muted">
          Revisa cantidades antes de pagar. La factura CFDI se genera automáticamente al confirmar el pago.
        </p>

        <div id="cartItems">
          ${state.cart
            .map(
              (it) => `
            <div class="cart-item" data-id="${it.productoId}">
              <div>
                <strong>${it.nombre}</strong>
                <div class="text-muted">$${it.precio.toFixed(2)} MXN c/u</div>
              </div>
              <div>
                <input type="number" min="1"
                  class="input-qty"
                  value="${it.cantidad}"
                  data-qty="${it.productoId}"
                />
              </div>
              <div class="text-right">
                $${(it.precio * it.cantidad).toFixed(2)}
                <br/>
                <a href="#" class="link" data-remove="${it.productoId}">Quitar</a>
              </div>
            </div>`
            )
            .join("")}
        </div>
      </div>

      <div class="summary-card">
        <h3>Resumen</h3>
        <div class="summary-row">
          <span>Subtotal</span>
          <span>$${totals.subtotal.toFixed(2)}</span>
        </div>
        <div class="summary-row">
          <span>IVA (16%)</span>
          <span>$${totals.iva.toFixed(2)}</span>
        </div>
        <div class="summary-row total">
          <span>Total</span>
          <span>$${totals.total.toFixed(2)}</span>
        </div>

        <button class="hero-btn btn-full" id="btnPagar">
          Proceder al pago con tarjeta
        </button>

        <p class="text-muted" style="margin-top: 0.75rem;">
          Al completar el pago en Stripe se marcará el carrito como pagado y se
          generará automáticamente la factura CFDI 4.0 en Facturapi.
        </p>
      </div>
    </section>
  `;

  document.querySelectorAll("[data-qty]").forEach((input) => {
    input.addEventListener("change", async (ev) => {
      const id = input.getAttribute("data-qty");
      const val = parseInt(ev.target.value, 10) || 1;
      await updateCartQty(id, val);
      CartPage();
    });
  });

  document.querySelectorAll("[data-remove]").forEach((link) => {
    link.addEventListener("click", async (ev) => {
      ev.preventDefault();
      const id = link.getAttribute("data-remove");
      await removeFromCart(id);
      CartPage();
    });
  });

  document.getElementById("btnPagar").onclick = async () => {
    try {
      if (!state.carritoId) {
        const carrito = await apiCrearCarrito();
        state.carritoId = carrito.id;
      }
      const checkout = await apiCrearCheckoutStripe(state.carritoId);
      window.location.href = checkout.url;
    } catch (err) {
      alert("Error al crear pago: " + err.message);
    }
  };
}
