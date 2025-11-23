// js/pages/ProfilePage.js
import { state, saveAuth } from "../state.js";
import { apiUpdateUsuario } from "../services/apiClient.js";

export function ProfilePage() {
  const app = document.getElementById("app");

  if (!state.user) {
    app.innerHTML = `
      <section class="center-page">
        <h1>Inicia sesión</h1>
        <p class="text-muted">Necesitas iniciar sesión para ver tu perfil.</p>
        <a href="#/login" class="link">Ir a login</a>
      </section>`;
    return;
  }

  const u = state.user;

  app.innerHTML = `
    <section class="form-card">
      <h1 class="form-title">Mi perfil</h1>
      <p class="form-subtitle">Actualiza tus datos de facturación.</p>

      <form id="profileForm">
        <div class="form-group">
          <label class="label">Nombre completo</label>
          <input type="text" id="nombre" class="input" value="${u.nombre || ""}" />
        </div>

        <div class="form-group">
          <label class="label">Correo electrónico</label>
          <input type="email" id="correo" class="input" value="${u.correo || ""}" disabled />
        </div>

        <div class="form-group">
          <label class="label">Domicilio</label>
          <input type="text" id="domicilio" class="input" value="${u.domicilio || ""}" />
        </div>

        <div class="form-group">
          <label class="label">Código postal</label>
          <input type="text" id="cp" class="input" value="${u.cp || ""}" />
        </div>

        <div class="form-group">
          <label class="label">RFC</label>
          <input type="text" id="rfc" class="input" value="${u.rfc || ""}" />
        </div>

        <div class="form-group">
          <label class="label">Régimen fiscal (616 persona física)</label>
          <input type="text" id="regimen" class="input" value="${u.regimen || "616"}" />
        </div>

        <button type="submit" class="hero-btn btn-full">
          Guardar cambios
        </button>
      </form>
    </section>
  `;

  document.getElementById("profileForm").onsubmit = async (ev) => {
    ev.preventDefault();
    const body = {
      nombre: document.getElementById("nombre").value.trim(),
      domicilio: document.getElementById("domicilio").value.trim(),
      cp: document.getElementById("cp").value.trim(),
      rfc: document.getElementById("rfc").value.trim(),
      regimen: document.getElementById("regimen").value.trim(),
    };

    try {
      await apiUpdateUsuario(u.id, body);
      const newUser = { ...u, ...body };
      saveAuth(state.token, newUser);
      alert("Perfil actualizado correctamente.");
    } catch (err) {
      alert("Error al actualizar perfil: " + err.message);
    }
  };
}
