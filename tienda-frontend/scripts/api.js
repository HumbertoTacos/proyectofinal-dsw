
// ====== Config & API helper ======
const CFG = {
  get base(){ return localStorage.getItem('apiBase') || 'http://localhost:3000'; },
  set base(v){ localStorage.setItem('apiBase', v); },
  get key(){ return localStorage.getItem('apiKey') || ''; },
  set key(v){ localStorage.setItem('apiKey', v); },
  get token(){ return localStorage.getItem('jwt') || ''; },
  set token(v){ localStorage.setItem('jwt', v); },
  get seleccion(){ try { return JSON.parse(localStorage.getItem('seleccion')||'[]'); } catch { return [] } },
  set seleccion(v){ localStorage.setItem('seleccion', JSON.stringify(v)); },
  clear(){ localStorage.removeItem('jwt'); }
};

function parseJwt(token){
  try { return JSON.parse(atob(token.split('.')[1])); } catch { return null; }
}

async function api(path, opts={}){
  const url = (CFG.base||'').replace(/\/$/,'') + path;
  const headers = Object.assign({'Content-Type':'application/json'}, opts.headers||{});
  if (CFG.key) headers['x-api-key'] = CFG.key;
  if (CFG.token) headers['Authorization'] = 'Bearer ' + CFG.token;
  const res = await fetch(url, { ...opts, headers });
  const bodyText = await res.text();
  let data; try { data = bodyText ? JSON.parse(bodyText) : {}; } catch { data = { raw: bodyText } }
  if (!res.ok) throw new Error((data && (data.error||data.message)) || ('HTTP '+res.status));
  return data;
}

function toast(msg){
  const el = document.querySelector('.toast'); if(!el) return alert(msg);
  el.textContent = msg; el.classList.add('show');
  setTimeout(()=>el.classList.remove('show'), 3800);
}

function setCfgFromInputs(){
  const elBase = document.querySelector('#apiBase'); const elKey = document.querySelector('#apiKey');
  if (elBase) CFG.base = elBase.value.trim();
  if (elKey) CFG.key = elKey.value.trim();
  toast('Configuración guardada');
}

function fillCfgInputs(){
  const elBase = document.querySelector('#apiBase'); const elKey = document.querySelector('#apiKey');
  if (elBase) elBase.value = CFG.base;
  if (elKey) elKey.value = CFG.key;
}

function ensureAuth(){
  if (!CFG.token) { location.href = 'login.html?next=' + encodeURIComponent(location.pathname); }
}
