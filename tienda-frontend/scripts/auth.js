
// ====== Auth (login/logout, role helpers) ======
document.addEventListener('DOMContentLoaded', () => {
  fillCfgInputs();
  const info = document.querySelector('#sessionInfo');
  if (CFG.token && info){
    const p = parseJwt(CFG.token)||{};
    info.innerHTML = `Sesion: <b>${p.correo||'—'}</b> | Rol: <span class="badge">${p.rol||'—'}</span>`;
  }
  const form = document.querySelector('#formLogin');
  if (form) {
    form.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const correo = form.correo.value.trim();
      const contrasena = form.contrasena.value;
      try{
        const data = await api('/api/usuarios/login', { method:'POST', body: JSON.stringify({ correo, contrasena }) });
        CFG.token = data.token;
        toast('Login exitoso');
        const next = new URLSearchParams(location.search).get('next') || 'index.html';
        location.href = next;
      }catch(err){ toast('Error: '+err.message); }
    });
  }

  const btnLogout = document.querySelector('#btnLogout');
  if (btnLogout){
    btnLogout.addEventListener('click', ()=>{ CFG.clear(); toast('Sesión cerrada'); setTimeout(()=>location.href='index.html', 600)});
  }
});
