// js/pages/CancelPage.js
export function CancelPage() {
  const app = document.getElementById("app");
  app.innerHTML = `
    <section class="center-page">
      <h1>Pago cancelado ❌</h1>
      <p class="text-muted">
        No se realizó ningún cargo. Puedes revisar tu carrito y volver a intentar el pago.
      </p>
      <a href="#/carrito" class="link">Volver al carrito</a>
    </section>
  `;
}
