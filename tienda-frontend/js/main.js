// js/main.js
import { loadStateFromStorage } from "./state.js";
import { renderNavbar } from "./components/Navbar.js";
import { router } from "./router.js";

function renderApp() {
  renderNavbar({
    onNavigate: () => router(),
    onCartClick: () => router(),
  });
  router();
}

function init() {
  loadStateFromStorage();
  renderApp();

  window.addEventListener("hashchange", () => {
    renderApp();
  });

  window.addEventListener("cart:updated", () => {
    renderNavbar({
      onNavigate: () => router(),
      onCartClick: () => router(),
    });
  });
}

init();
