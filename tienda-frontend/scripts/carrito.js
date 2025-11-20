
document.addEventListener('DOMContentLoaded', () => {
  ensureAuth();
  cargarCarritos();
});

async function cargarCarritos(){
  try{
    const data = await api('/api/carrito');
    const cont = document.querySelector('#listaCarritos');
    cont.innerHTML = '';
    data.forEach(c => {
      const el = document.createElement('div'); el.className = 'card';
      el.innerHTML = `
        <h3>Carrito <span class="badge">${c.id}</span></h3>
        <div class="grid grid-3" style="margin:8px 0">
          <div>Subtotal: <b>$${Number(c.subtotal||0).toFixed(2)}</b></div>
          <div>IVA: <b>$${Number(c.iva||0).toFixed(2)}</b></div>
          <div>Total: <b>$${Number(c.total||0).toFixed(2)}</b></div>
        </div>
        <details class="muted"><summary>Items (${(c.items||[]).length})</summary>
          <ul>${(c.items||[]).map(it=>`<li>${it.name} × ${it.quantity} — $${it.price}</li>`).join('')}</ul>
        </details>
        <div class="grid grid-2" style="margin-top:8px">
          <button class="button ok" onclick="pagar('${c.id}')">Pagar ahora</button>
          <button class="button danger" onclick="eliminar('${c.id}')">Eliminar</button>
        </div>`;
      cont.appendChild(el);
    });
  }catch(err){ toast('Carritos: '+err.message); }
}

async function pagar(id){
  try{
    await api('/api/carrito/'+id, { method:'PUT', body: JSON.stringify({ pagado: true }) });
    await api('/api/carrito/'+id, { method:'DELETE' });
    toast('Pagado y eliminado'); cargarCarritos();
  }catch(err){ toast('Pagar: '+err.message); }
}

async function eliminar(id){
  if(!confirm('¿Eliminar carrito?')) return;
  try{ await api('/api/carrito/'+id, { method:'DELETE' }); toast('Eliminado'); cargarCarritos(); }
  catch(err){ toast('Eliminar: '+err.message); }
}
