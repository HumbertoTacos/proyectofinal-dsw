// js/pages/LoginPage.js
import { apiLogin, apiGetCarritoPendiente } from "../services/apiClient.js";
import { saveAuth, setCart, state } from "../state.js";

export function LoginPage() {
  const app = document.getElementById("app");

  app.innerHTML = `
    <section class="form-card">
      <h1 class="form-title">Iniciar sesión</h1>
      <p class="form-subtitle">
        Usa tu correo y contraseña registrados para acceder a CineSnack MX.
      </p>

      <form id="loginForm">
        <div class="form-group">
          <label class="label">Correo electrónico</label>
          <input type="email" id="correo" class="input" required />
        </div>

        <div class="form-group">
          <label class="label">Contraseña</label>
          <input type="password" id="contrasena" class="input" required />
        </div>

        <button type="submit" class="hero-btn btn-full">
          Entrar
        </button>
      </form>

      <p class="text-muted" style="margin-top: 1rem; text-align:center;">
        ¿No tienes cuenta aún?
      </p>

      <button id="btnGoRegister" 
        class="nav-btn nav-btn-primary btn-full" 
        style="margin-top:0.5rem;">
        Crear cuenta
      </button>
    </section>
  `;

  const form = document.getElementById("loginForm");
  form.onsubmit = async (ev) => {
    ev.preventDefault();

    const correo = document.getElementById("correo").value.trim();
    const contrasena = document.getElementById("contrasena").value.trim();

    try {
      const data = await apiLogin(correo, contrasena);
      saveAuth(data.token, data.usuario);

      // carrito pendiente
      const pendiente = await apiGetCarritoPendiente(data.usuario.id);
      if (pendiente && pendiente.items) {
        state.carritoId = pendiente.id;
        localStorage.setItem("cineSnack.cartId", pendiente.id);

        const itemsPlain = pendiente.items.map((it) => ({
          productoId: it.productId,
          nombre: it.name,
          precio: it.price,
          cantidad: it.quantity,
        }));

        setCart(itemsPlain, pendiente.id);
        window.dispatchEvent(new CustomEvent("cart:updated"));
      }

      alert("Inicio de sesión exitoso");
      window.location.hash = "#/";
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const btnGoRegister = document.getElementById("btnGoRegister");
  btnGoRegister.onclick = () => {
    window.location.hash = "#/register";
  };
}
