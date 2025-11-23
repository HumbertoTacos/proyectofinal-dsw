// js/pages/ProductsPage.js
import { apiGetProductos } from "../services/apiClient.js";
import { renderProductCard, bindProductCardEvents } from "../components/ProductCard.js";
import { state } from "../state.js";

export async function ProductsPage(searchParams) {
  const app = document.getElementById("app");

  if (!state.token) {
    app.innerHTML = `
      <section class="center-page">
        <h1>Inicia sesión para ver el menú 🍿</h1>
        <p class="text-muted">
          Necesitamos tu token JWT para consultar los productos protegidos.
        </p>
        <a class="link" href="#/login">Ir a iniciar sesión</a>
      </section>`;
    return;
  }

  app.innerHTML = `<p>Cargando menú...</p>`;

  try {
    let productos = await apiGetProductos();

    const filtroCat = searchParams?.get("categoria");
    if (filtroCat) {
      productos = productos.filter((p) =>
        (p.categoria || "")
          .toLowerCase()
          .trim()
          .includes(filtroCat.toLowerCase().trim())
      );
    }


    app.innerHTML = `
      <section>
        <h2 class="section-title">Menú de dulcería</h2>
        <p class="section-subtitle">
          Palomitas, dulces, combos, bebidas y coleccionables listos para tu función.
        </p>

        <div class="form-group">
          <input type="text" id="searchInput" class="input" placeholder="Buscar por nombre o categoría..." />
        </div>

        <div class="products-grid" id="gridProductos"></div>
      </section>
    `;

    const grid = document.getElementById("gridProductos");
    const renderList = (list) => {
      if (!list.length) {
        grid.innerHTML = `<p class="text-muted">No hay productos para mostrar.</p>`;
        return;
      }
      grid.innerHTML = list.map((p) => renderProductCard(p)).join("");
      bindProductCardEvents(grid, list);
    };

    renderList(productos);

    document.getElementById("searchInput").addEventListener("input", (ev) => {
      const q = ev.target.value.toLowerCase();
      const filtered = productos.filter(
        (p) =>
          p.nombre.toLowerCase().includes(q) ||
          (p.categoria || "").toLowerCase().includes(q)
      );
      renderList(filtered);
    });
  } catch (err) {
    app.innerHTML = `
      <section class="center-page">
        <h1>Error al cargar productos</h1>
        <p class="text-muted">${err.message}</p>
      </section>`;
  }
}
