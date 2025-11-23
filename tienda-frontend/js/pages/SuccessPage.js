// js/pages/SuccessPage.js
import { clearCart, state } from "../state.js";

export function SuccessPage() {
  const app = document.getElementById("app");

  const lastCartId = state.carritoId;
  clearCart();

  app.innerHTML = `
    <section class="center-page" style="animation: fadeIn 0.6s;">
      <div style="
        font-size: 3.5rem;
        margin-bottom: 0.5rem;
        color: #22c55e;
      ">✔️</div>

      <h1>¡Pago completado!</h1>

      <p class="text-muted">
        Tu pago ha sido confirmado exitosamente por Stripe.
      </p>

      <p class="text-muted">
        Tu factura CFDI 4.0 ha sido generada por el backend y por Facturapi.
      </p>

      <div style="margin-top:1.5rem;">
        <button class="hero-btn btn-full" id="btnPdf">
          Descargar factura PDF
        </button>
        <br/><br/>
        <button class="hero-btn btn-full" id="btnXml">
          Descargar XML
        </button>
      </div>

      <p class="text-muted" style="margin-top:1.5rem;">
        Si tienes problemas descargando, revisa tu correo.
      </p>

      <button id="btnSeguir" class="hero-btn" style="margin-top:1.5rem;">
        Seguir comprando
      </button>
    </section>
  `;

  document.getElementById("btnPdf").onclick = async () => {
    if (!lastCartId) return alert("No hay factura disponible.");
    try {
      const res = await fetch(`/api/carrito/${lastCartId}/factura/pdf`, {
        method: "GET",
        headers: {
          "x-api-key": "1234",
          Authorization: "Bearer " + state.token,
        },
      });
      if (!res.ok) throw new Error("No se pudo descargar el PDF (" + res.status + ")");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `factura_${lastCartId}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Error al descargar PDF: " + err.message);
    }
  };

  document.getElementById("btnXml").onclick = async () => {
    if (!lastCartId) return alert("No hay XML disponible.");
    try {
      const res = await fetch(`/api/carrito/${lastCartId}/factura/xml`, {
        method: "GET",
        headers: {
          "x-api-key": "1234",
          Authorization: "Bearer " + state.token,
        },
      });
      if (!res.ok) throw new Error("No se pudo descargar el XML (" + res.status + ")");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `factura_${lastCartId}.xml`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Error al descargar XML: " + err.message);
    }
  };

  document.getElementById("btnSeguir").onclick = () => {
    window.location.hash = "#/productos";
  };
}
