
// ====== Navbar and shared UI ======
document.addEventListener('DOMContentLoaded', () => {
  const nav = document.querySelector('#navbar');
  if (nav){
    nav.innerHTML = `
      <div class="inner container">
        <a class="logo" href="index.html"><img src="assets/logo.svg" alt="logo" height="28"></a>
        <div class="search">
          <input id="apiBase" placeholder="http://localhost:3000"/>
          <input id="apiKey" placeholder="API Key (x-api-key)"/>
          <button class="button" id="btnSaveCfg">Guardar</button>
        </div>
        <div class="navlinks">
          <a href="admin.html">Admin</a>
          <a href="carrito.html">Carrito 🛒</a>
          <a href="login.html">Login</a>
        </div>
      </div>`;
    fillCfgInputs();
    nav.querySelector('#btnSaveCfg').addEventListener('click', setCfgFromInputs);
  }
  // Show badge count
  const sel = CFG.seleccion || [];
  const linkCarrito = document.querySelector('.navlinks a[href="carrito.html"]');
  if (linkCarrito && sel.length) linkCarrito.innerHTML = `Carrito 🛒 <span class="badge">${sel.reduce((a,b)=>a+(b.cantidad||1),0)}</span>`;
});
