// js/router.js
import { HomePage } from "./pages/HomePage.js";
import { LoginPage } from "./pages/LoginPage.js";
import { RegisterPage } from "./pages/RegisterPage.js";
import { ProductsPage } from "./pages/ProductsPage.js";
import { CartPage } from "./pages/CartPage.js";
import { SuccessPage } from "./pages/SuccessPage.js";
import { CancelPage } from "./pages/CancelPage.js";
import { ProfilePage } from "./pages/ProfilePage.js";
import { AdminProductsPage } from "./pages/AdminProductsPage.js";
import { state } from "./state.js";

export function router() {
  const app = document.getElementById("app");
  app.innerHTML = "";

  const hash = window.location.hash || "#/";
  const [pathPart, queryPart] = hash.split("?");
  const path = pathPart.replace("#", "");
  const searchParams = new URLSearchParams(queryPart || "");

  const requireAuth = (renderFn, roles = []) => {
    if (!state.token || !state.user) {
      window.location.hash = "#/login";
      return;
    }
    if (roles.length && !roles.includes(state.user.rol)) {
      app.innerHTML = `
        <section class="center-page">
          <h1>Acceso restringido</h1>
          <p class="text-muted">No tienes permisos para ver esta página.</p>
          <a href="#/" class="link">Volver al inicio</a>
        </section>`;
      return;
    }
    return renderFn(searchParams);
  };

  switch (true) {
    case path === "/" || path === "":
      return HomePage();

    case path.startsWith("/login"):
      return LoginPage();

    case path.startsWith("/register"):
      return RegisterPage();

    case path.startsWith("/productos"):
      return requireAuth(ProductsPage);

    case path.startsWith("/carrito"):
      return requireAuth(CartPage);

    case path.startsWith("/profile"):
      return requireAuth(ProfilePage);

    case path.startsWith("/admin/productos"):
      return requireAuth(AdminProductsPage, ["admin"]);

    case path.startsWith("/success"):
      return SuccessPage();

    case path.startsWith("/cancel"):
      return CancelPage();

    default:
      app.innerHTML = `
        <section class="center-page">
          <h1>404</h1>
          <p class="text-muted">La página que buscas no existe.</p>
          <a href="#/" class="link">Volver al inicio</a>
        </section>`;
  }
}
