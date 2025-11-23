// js/pages/RegisterPage.js
import { apiRegister } from "../services/apiClient.js";

export function RegisterPage() {
  const app = document.getElementById("app");
  app.innerHTML = `
    <section class="form-card">
      <h1 class="form-title">Crear cuenta</h1>
      <p class="form-subtitle">
        Registra tus datos para comenzar a comprar en CineSnack MX.
      </p>

      <form id="registerForm">
        <div class="form-group">
          <label class="label">Nombre completo</label>
          <input type="text" id="nombre" class="input" required />
        </div>

        <div class="form-group">
          <label class="label">Correo electrónico</label>
          <input type="email" id="correo" class="input" required />
        </div>

        <div class="form-group">
          <label class="label">Contraseña</label>
          <input type="password" id="contrasena" class="input" required />
        </div>

        <div class="form-group">
          <label class="label">RFC (opcional)</label>
          <input type="text" id="rfc" class="input" />
        </div>

        <div class="form-group">
          <label class="label">Código postal</label>
          <input type="text" id="cp" class="input" required />
        </div>

        <button type="submit" class="hero-btn btn-full">
          Registrarme
        </button>

        <p class="text-muted" style="margin-top: 1rem; text-align:center;">
          ¿Ya tienes cuenta?
        </p>

        <button id="btnGoLogin" class="nav-btn btn-full">
          Iniciar sesión
        </button>
      </form>
    </section>
  `;

  const form = document.getElementById("registerForm");
  form.onsubmit = async (ev) => {
    ev.preventDefault();

    const body = {
      user_id: crypto.randomUUID().slice(0, 8),
      nombre: document.getElementById("nombre").value.trim(),
      correo: document.getElementById("correo").value.trim(),
      contrasena: document.getElementById("contrasena").value.trim(),
      rfc: document.getElementById("rfc").value.trim(),
      cp: document.getElementById("cp").value.trim(),
      rol: "cliente",
    };

    try {
      await apiRegister(body);
      alert("Usuario registrado correctamente. Ya puedes iniciar sesión.");
      window.location.hash = "#/login";
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  document.getElementById("btnGoLogin").onclick = () => {
    window.location.hash = "#/login";
  };
}
