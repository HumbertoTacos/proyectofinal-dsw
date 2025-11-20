
// ====== Productos listado (index) y Admin CRUD ======
document.addEventListener('DOMContentLoaded', () => {
  // If index: render grid of products
  if (document.body.dataset.page === 'home') {
    cargarProductos();
    document.querySelector('#btnCrearCarrito')?.addEventListener('click', crearCarritoDesdeSeleccion);
  }

  // If admin: protections + hooks
  if (document.body.dataset.page === 'admin') {
    ensureAuth(); // require login
    const p = parseJwt(CFG.token) || {};
    if (p.rol !== 'admin') { toast('Acceso solo para admin'); location.href = 'index.html'; return; }
    listarProductosAdmin();
    const form = document.querySelector('#formProducto');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = Object.fromEntries(new FormData(form).entries());
      payload.precio = Number(payload.precio || 0);
      payload.stock = Number(payload.stock || 0);
      try {
        const created = await api('/api/productos', { method: 'POST', body: JSON.stringify(payload) });
        toast('Producto creado: ' + created.nombre);
        form.reset(); listarProductosAdmin();
      } catch (err) { toast('Error: ' + err.message); }
    });
  }
});

async function cargarProductos() {
  try {
    const data = await api('/api/productos');
    const cont = document.querySelector('#gridProductos');
    cont.innerHTML = '';
    data.forEach(p => {
      const card = document.createElement('div'); card.className = 'card product';
      card.innerHTML = `
        <img src="${p.url_img || 'https://picsum.photos/seed/' + (p.id || Math.random()) + '/400/240'}" alt="img">
        <div class="title">${p.nombre} <span class="muted">${p.marca || ''}</span></div>
        <div class="price">$${Number(p.precio || 0).toFixed(2)}</div>
        <div class="muted">IVA: ${(Array.isArray(p.taxes) && p.taxes[0] ? p.taxes[0].rate * 100 : 16)}%</div>
        <div class="grid grid-2">
          <button class="button" onclick="addSeleccion('${p.id}')">Agregar</button>
          <a class="button secondary" target="_blank" href="${p.url_img || '#'}">Ver</a>
        </div>`;
      cont.appendChild(card);
    });
  } catch (err) { toast('Productos: ' + err.message); }
}

function addSeleccion(productoId) {
  const arr = CFG.seleccion || [];
  const found = arr.find(x => x.productoId === productoId);
  if (found) found.cantidad += 1; else arr.push({ productoId, cantidad: 1 });
  CFG.seleccion = arr; toast('Añadido al carrito');
}

async function crearCarritoDesdeSeleccion() {
  try {
    ensureAuth();
    const payload = parseJwt(CFG.token) || {};
    const usuarioId = payload.id; if (!usuarioId) throw new Error('JWT sin id');
    const productos = CFG.seleccion || []; if (!productos.length) throw new Error('Seleccion vacío');
    const data = await api('/api/carrito', { method: 'POST', body: JSON.stringify({ usuarioId, productos }) });
    CFG.seleccion = []; toast('Carrito creado. Total $' + data.total);
    location.href = 'carrito.html';
  } catch (err) { toast('Carrito: ' + err.message); }
}

// ---------- Admin ----------
async function listarProductosAdmin() {
  try {
    const data = await api('/api/productos');
    const tbody = document.querySelector('#tbodyProductos');
    tbody.innerHTML = '';
    data.forEach(p => {
      const tr = document.createElement('tr');
      tr.dataset.id = p.id; // 👈 agrega esto

      tr.innerHTML = `
        <td>${p.nombre}</td>
        <td>${p.marca || ''}</td>
        <td>$${Number(p.precio || 0).toFixed(2)}</td>
        <td>${p.stock || 0}</td>
        <td><a target="_blank" href="${p.url_img || '#'}">Imagen</a></td>
        <td class="grid grid-2">
          <button class="button secondary" onclick="editarProd('${p.id}')">Editar</button>
          <button class="button danger" onclick="eliminarProd('${p.id}')">Eliminar</button>
        </td>`;
      tbody.appendChild(tr);
    });
  } catch (err) { toast('Admin productos: ' + err.message); }
}

async function eliminarProd(id) {
  if (!confirm('Eliminar producto?')) return;
  try { await api('/api/productos/' + id, { method: 'DELETE' }); toast('Eliminado'); listarProductosAdmin(); }
  catch (err) { toast('Error: ' + err.message); }
}

// ====== MODAL EDITAR ======
function editarProd(id) {
  const row = document.querySelector(`#tbodyProductos tr[data-id="${id}"]`);
  const nombre = row.querySelector('td:nth-child(1)').textContent;
  const marca = row.querySelector('td:nth-child(2)').textContent;
  const precio = row.querySelector('td:nth-child(3)').textContent.replace('$', '');
  const stock = row.querySelector('td:nth-child(4)').textContent;
  const modal = document.querySelector('#modalEdit');
  document.querySelector('#editId').value = id;
  document.querySelector('#editNombre').value = nombre;
  document.querySelector('#editMarca').value = marca;
  document.querySelector('#editPrecio').value = precio;
  document.querySelector('#editStock').value = stock;
  document.querySelector('#editImg').value = '';
  modal.style.display = 'flex';
}

function cerrarModal() {
  document.querySelector('#modalEdit').style.display = 'none';
}

document.addEventListener('DOMContentLoaded', () => {
  const formEdit = document.querySelector('#formEdit');
  if (formEdit) {
    formEdit.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = formEdit.editId.value;
      const payload = {
        nombre: formEdit.editNombre.value.trim(),
        marca: formEdit.editMarca.value.trim(),
        precio: Number(formEdit.editPrecio.value || 0),
        stock: Number(formEdit.editStock.value || 0),
        url_img: formEdit.editImg.value.trim()
      };
      try {
        await api('/api/productos/' + id, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
        toast('✅ Producto actualizado');
        cerrarModal();
        listarProductosAdmin();
      } catch (err) {
        toast('Error al actualizar: ' + err.message);
      }
    });
  }
});

