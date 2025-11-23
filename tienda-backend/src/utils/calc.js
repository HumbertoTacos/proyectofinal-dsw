// ===============================================
// CALCULO DE TOTALES COMPATIBLE CON FACTURAPI
// ===============================================
// Soporta:
//  - Precios con IVA incluido (facturapi default)
//  - Precios sin IVA
//  - IVA 0, 0.08, 0.16
//  - Redondeo por línea conforme a reglas CFDI
// ===============================================

export function calcTotals(items) {
  let subtotal = 0;
  let iva = 0;

  for (const it of items) {
    const price = Number(it.price);
    const qty = Number(it.quantity);
    const rate = typeof it.taxRate === "number" ? it.taxRate : 0.16;
    const taxIncluded = it.tax_included ?? true; // DEFAULT Facturapi

    if (isNaN(price) || isNaN(qty)) {
      console.warn("⚠ calcTotals: precio o cantidad inválidos", it);
      continue;
    }

    // ================================
    // 1. SI EL PRECIO YA TRAE IVA
    // ================================
    if (taxIncluded) {
      const base = price / (1 + rate);
      const lineSubtotal = base * qty;
      const lineIva = (price - base) * qty;

      subtotal += Number(lineSubtotal.toFixed(2));
      iva += Number(lineIva.toFixed(2));
    }

    // ================================
    // 2. SI EL PRECIO NO INCLUYE IVA
    // ================================
    else {
      const lineSubtotal = price * qty;
      const lineIva = lineSubtotal * rate;

      subtotal += Number(lineSubtotal.toFixed(2));
      iva += Number(lineIva.toFixed(2));
    }
  }

  const total = subtotal + iva;

  return {
    subtotal: Number(subtotal.toFixed(2)),
    iva: Number(iva.toFixed(2)),
    total: Number(total.toFixed(2)),
  };
}
