// js/components/ProductCard.js
import { addToCart } from "../state.js";

export function renderProductCard(producto) {
  const imgUrl =
    producto.url_img ||
    "https://images.pexels.com/photos/799155/pexels-photo-799155.jpeg";

  return `
    <article class="product-card">
      <div class="product-img" style="background-image:url('${imgUrl}')"></div>
      <div class="product-body">
        <div class="product-name">${producto.nombre}</div>
        <div class="product-meta">
          ${producto.categoria || "Dulcería de cine"}
        </div>
        <div class="product-footer">
          <span>$${Number(producto.precio).toFixed(2)} MXN</span>
          <button class="btn-sm" data-add="${producto.id}">
            Agregar
          </button>
        </div>
      </div>
    </article>
  `;
}

export function bindProductCardEvents(container, productos) {
  container.addEventListener("click", async (ev) => {
    const btn = ev.target.closest("[data-add]");
    if (!btn) return;
    const id = btn.getAttribute("data-add");
    const prod = productos.find((p) => p.id === id);
    if (!prod) return;
    try {
      await addToCart(prod);
      alert("Producto agregado al carrito");
    } catch (err) {
      alert("Error agregando al carrito: " + err.message);
    }
  });
}
