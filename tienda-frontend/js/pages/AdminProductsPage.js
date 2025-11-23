// js/pages/AdminProductsPage.js
import {
  apiGetProductos,
  apiCreateProducto,
  apiUpdateProducto,
  apiDeleteProducto,
} from "../services/apiClient.js";

export async function AdminProductsPage() {
  const app = document.getElementById("app");

  app.innerHTML = `
    <section>
      <h2 class="section-title">Admin de productos</h2>
      <p class="section-subtitle">
        Crea, edita y elimina productos sincronizados con Facturapi.
      </p>

      <div class="admin-layout">
        <div>
          <table class="admin-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th></th>
              </tr>
            </thead>
            <tbody id="adminProductsBody"></tbody>
          </table>
        </div>
        <div class="admin-right">
          <h3>Producto</h3>
          <form id="adminProductForm">
            <input type="hidden" id="prodId" />
            <div class="form-group">
              <label class="label">Nombre</label>
              <input id="prodNombre" class="input" required />
            </div>
            <div class="form-group">
              <label class="label">Precio</label>
              <input id="prodPrecio" class="input" type="number" step="0.01" required />
            </div>
            <div class="form-group">
              <label class="label">Stock</label>
              <input id="prodStock" class="input" type="number" required />
            </div>
            <div class="form-group">
              <label class="label">Categoría</label>
              <input id="prodCategoria" class="input" />
            </div>
            <div class="form-group">
              <label class="label">Marca</label>
              <input id="prodMarca" class="input" />
            </div>
            <div class="form-group">
              <label class="label">URL imagen</label>
              <input id="prodImg" class="input" />
            </div>
            <button type="submit" class="hero-btn btn-full">Guardar</button>
            <button type="button" class="nav-btn btn-full" id="btnNuevo">Nuevo</button>
          </form>
        </div>
      </div>
    </section>
  `;

  const tbody = document.getElementById("adminProductsBody");
  const form = document.getElementById("adminProductForm");

  async function loadProductos() {
    const productos = await apiGetProductos();
    tbody.innerHTML = productos
      .map(
        (p) => `
      <tr data-id="${p.id}">
        <td>${p.nombre}</td>
        <td>${p.categoria || ""}</td>
        <td>$${Number(p.precio).toFixed(2)}</td>
        <td>
          <button class="btn-sm" data-edit="${p.id}">Editar</button>
          <button class="btn-sm" data-del="${p.id}">Eliminar</button>
        </td>
      </tr>`
      )
      .join("");

    tbody.querySelectorAll("[data-edit]").forEach((btn) => {
      btn.onclick = () => {
        const id = btn.getAttribute("data-edit");
        const p = productos.find((x) => x.id === id);
        if (!p) return;
        document.getElementById("prodId").value = p.id;
        document.getElementById("prodNombre").value = p.nombre;
        document.getElementById("prodPrecio").value = p.precio;
        document.getElementById("prodStock").value = p.stock || 0;
        document.getElementById("prodCategoria").value = p.categoria || "";
        document.getElementById("prodMarca").value = p.marca || "";
        document.getElementById("prodImg").value = p.url_img || "";
      };
    });

    tbody.querySelectorAll("[data-del]").forEach((btn) => {
      btn.onclick = async () => {
        const id = btn.getAttribute("data-del");
        if (!confirm("¿Eliminar producto?")) return;
        try {
          await apiDeleteProducto(id);
          await loadProductos();
        } catch (err) {
          alert("Error al eliminar: " + err.message);
        }
      };
    });
  }

  form.onsubmit = async (ev) => {
    ev.preventDefault();
    const id = document.getElementById("prodId").value;
    const body = {
      nombre: document.getElementById("prodNombre").value.trim(),
      precio: Number(document.getElementById("prodPrecio").value),
      stock: Number(document.getElementById("prodStock").value),
      categoria: document.getElementById("prodCategoria").value.trim(),
      marca: document.getElementById("prodMarca").value.trim(),
      url_img: document.getElementById("prodImg").value.trim(),
    };

    try {
      if (id) {
        await apiUpdateProducto(id, body);
      } else {
        await apiCreateProducto(body);
      }
      form.reset();
      document.getElementById("prodId").value = "";
      await loadProductos();
      alert("Producto guardado");
    } catch (err) {
      alert("Error al guardar: " + err.message);
    }
  };

  document.getElementById("btnNuevo").onclick = () => {
    form.reset();
    document.getElementById("prodId").value = "";
  };

  try {
    await loadProductos();
  } catch (err) {
    alert("Error al cargar productos: " + err.message);
  }
}
