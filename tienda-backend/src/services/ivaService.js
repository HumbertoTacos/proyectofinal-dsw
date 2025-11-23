// =========================================================
// SISTEMA AVANZADO DE DETECCIÓN DE IVA
// Compatible con SAT, tienda de cine, dulcería y electrónica
// =========================================================

// =============================================
// CATEGORÍAS COMPLETAS
// =============================================

// Alimentos NO procesados → IVA 0%
const alimentosNaturales = [
  "manzana","pera","fruta","verdura","zanahoria","lechuga","jitomate","tomate",
  "papa","cebolla","naranja","limón","banana","plátano","arroz","frijol",
  "avena","trigo","maíz","tortilla","harina","leche","pollo","carne","res",
  "pescado","marisco","atún","agua natural","agua purificada","huevo"
];

// Productos de DULCERÍA de cine → SÍ llevan IVA 16%
const dulceriaCine = [
  "palomita","palomitas","popcorn","snack","gourmet","caramelo","chocolate",
  "sabritas","papas","gomita","gomitas","skittles","m&m","hershey","snickers",
  "bubulubu","dulce","dulces","chicle","malvavisco","mix","caja de dulces",
  "combo","peli combo"
];

// Bebidas → IVA depende
// Gaseosas SI → 16%, Naturales NO → 0%
const bebidasConIVA = [
  "refresco","coca","pepsi","seven","soda","energetica","monster","red bull",
  "fanta","sprite","jugos azucarados","bebida preparada","malteada"
];

const bebidasSinIVA = [
  "agua natural","agua simple","agua mineral natural"
];

// Electrónica → 16%
const electronica = [
  "control","xbox","ps4","ps5","dualsense","mouse","teclado","laptop",
  "computadora","monitor","pantalla","audífono","tv","tablet","cargador",
  "memoria","usb","disco","ssd","hdd"
];

// Servicios exentos
const serviciosExentos = [
  "seguro","colegiatura","transporte","servicio médico","doctor","consulta",
  "funerario","donación"
];

// Ropa/calzado → 16%
const ropaCalzado = [
  "playera","pantalón","tenis","zapato","sudadera","gorra","calcetín"
];

// =============================================
// FUNCIÓN PRINCIPAL
// =============================================

export function detectarIVA(nombreProducto, region = "MX") {
  const name = nombreProducto.toLowerCase();

  // 1️⃣ Alimentos sin procesar → IVA 0%
  if (alimentosNaturales.some(p => name.includes(p))) return 0;

  // 2️⃣ Servicios exentos → IVA 0%
  if (serviciosExentos.some(p => name.includes(p))) return 0;

  // 3️⃣ Bebidas sin IVA
  if (bebidasSinIVA.some(p => name.includes(p))) return 0;

  // 4️⃣ Bebidas azucaradas → IVA 16%
  if (bebidasConIVA.some(p => name.includes(p))) return 0.16;

  // 5️⃣ Dulcería y productos de cine → IVA 16%
  if (dulceriaCine.some(p => name.includes(p))) return 0.16;

  // 6️⃣ Electrónica → IVA 16%
  if (electronica.some(p => name.includes(p))) return 0.16;

  // 7️⃣ Ropa y calzado → IVA 16%
  if (ropaCalzado.some(p => name.includes(p))) return 0.16;

  // 8️⃣ Zona fronteriza (opcional)
  if (region === "FRONTERA") return 0.08;

  // 9️⃣ Fallback inteligente:
  // Si contiene palabras relacionadas a alimentos SIN azúcar
  if (name.includes("natural") || name.includes("orgánico")) return 0;

  // 🔟 Default general: 16%
  return 0.16;
}
