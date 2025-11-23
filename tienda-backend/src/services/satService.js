import { facturapi } from "./facturapiService.js";

/* ============================================================
   SISTEMA SAT ESPECIALIZADO PARA DULCERÍA DE CINE
   Cobertura:
   - Palomitas (todas las variaciones posibles)
   - Dulces, gomitas, caramelos, paletas
   - Chocolates, barras, bombones
   - Papas, frituras, nachos, snacks salados
   - Bebidas (refrescos, agua, energéticas, jugos)
   - Combos, cajas, packs especiales
   - Vasos, cubetas, palomeras y souvenirs de cine
   ============================================================ */

/* ============================================================
   1. PATRONES DE UNIDADES (expresiones regulares)
   ============================================================ */

const patronesUnidad = [
  // Litros
  { regex: /\b\d+(\.\d+)?\s*(l|lt|litro|litros)\b/i, unidad: "LTR" },
  { regex: /\b\d+(\.\d+)?\s*(lts|ltrs|lit)\b/i, unidad: "LTR" },

  // Mililitros
  { regex: /\b\d+(\.\d+)?\s*(ml|mililitro|mililitros)\b/i, unidad: "MLT" },
  { regex: /\b\d+(\.\d+)?\s*(cc)\b/i, unidad: "MLT" },

  // Paquetes / packs / combos
  { regex: /\bpaquete\b/i, unidad: "XPK" },
  { regex: /\bpack\b/i, unidad: "XPK" },
  { regex: /\bcombo\b/i, unidad: "XPK" },
  { regex: /\bcaja\b/i, unidad: "XPK" },
  { regex: /\bcaja\s+premium\b/i, unidad: "XPK" },
  { regex: /\bbox\b/i, unidad: "XPK" }
];

/* ============================================================
   2. REGLAS POR PALABRAS CLAVE (DULCERÍA DE CINE)
   ============================================================ */

const unidadPorPalabras = [
  // ========================================================
  // Palomitas
  // ========================================================
  {
    palabras: [
      "palomita","palomitas","palomitas grandes","palomitas chicas","palomitas medianas",
      "palomitas jumbo","palomitas extra grandes","palomitas tamaño familiar",
      "palomitas tamaño cine","palomitas sabor mantequilla","palomitas mantequilla",
      "palomitas acarameladas","palomitas caramelo","palomitas sabor caramelo",
      "palomitas de caramelo","palomitas queso","palomitas sabor queso",
      "palomitas enchiladas","palomitas picantes","palomitas extra queso",
      "palomitas mixtas","palomitas dulces","palomitas saladas",
      "palomitas dulce y salado","palomitas gourmet","palomitas bbq",
      "palomitas chocolate","palomitas sabor chocolate","balde de palomitas",
      "balde palomitas","balde cine","cubeta palomitas","cubeta de palomitas",
      "palomitas mantequilla grande","palomitas mantequilla jumbo"
    ],
    unidad: "H87"  // Pieza (una orden de palomitas)
  },

  // ========================================================
  // Dulces y golosinas
  // ========================================================
  {
    palabras: [
      "dulce","dulces","golosina","golosinas","dulces surtidos","surtido de dulces",
      "mix de dulces","mix dulce","mix de golosinas","bolsa de dulces",
      "bolsita de dulces","dulces variados","paleta","paletas","paleta de caramelo",
      "paleta acidita","paleta enchilada","paleta rellena","paletas surtidas",
      "caramelo","caramelos","caramelos suaves","caramelos duros","caramelos masticables",
      "gomita","gomitas","gomitas enchiladas","gomitas ácidas","gomitas acidas",
      "gomitas de osito","gomitas de ositos","gomitas de fruta","gomitas de mango",
      "gomitas gusano","gomitas gusanos","gomitas de corazón","gomitas de cola",
      "panditas","panditas acidos","panditas ácidos","skittles","m&m","m & m",
      "lunetas","mix gomitas","mix panditas","mix caramelo",
      "chicle","chicles","chicle sin azúcar","chicle con azúcar"
    ],
    unidad: "H87"
  },

  // ========================================================
  // Chocolates
  // ========================================================
  {
    palabras: [
      "chocolate","chocolates","barra de chocolate","barra chocolate","barras de chocolate",
      "chocolate de leche","chocolate blanco","chocolate amargo","chocolate con almendras",
      "chocolate relleno","chocolate relleno de caramelo","chocolate relleno de cacahuate",
      "chocolate crunchy","chocolate crispy","snickers","milky way","kitkat","kit kat",
      "crunch","turín","turin","ferrero","ferrero rocher","ferrero collection","hershey",
      "hershey's","milo","bombón de chocolate","bombones de chocolate"
    ],
    unidad: "H87"
  },

  // ========================================================
  // Snacks / Botanas saladas
  // ========================================================
  {
    palabras: [
      "papas","papitas","papas fritas","papas a la francesa","frituras","fritura",
      "botana","botanas","snack","snacks","papas adobadas","papas queso","papas jalapeño",
      "papas limon","papas limón","sabritas","sabritas adobadas","ruffles","doritos",
      "doritos nacho","doritos flaming hot","cheetos","cheetos flamin hot","rancheritos",
      "chips","chip","nachos","nachos con queso","nachos especiales","nachos supreme",
      "totopos","totopos con queso","totopos con salsa","pretzels","palitos salados",
      "snack mix","mix de botanas","mix snacks"
    ],
    unidad: "H87"
  },

  // ========================================================
  // Bebidas (refrescos, aguas, jugos, energéticas)
  // ========================================================
  {
    palabras: [
      "refresco","refrescos","refresco grande","refresco mediano","refresco chico",
      "refresco jumbo","refresco 600 ml","refresco 400 ml","refresco 1l","refresco 1.5l",
      "coca","coca cola","coca-cola","coca light","coca zero","coca sin azúcar",
      "pepsi","pepsi cola","sprite","fanta","manzanita","manzanita sol","soda",
      "sodas","cola","bebida gaseosa","bebida azucarada","bebida sabor cola",
      "bebida sabor naranja","bebida sabor limón","lima limón","lima-limón"
    ],
    unidad: "LTR"
  },
  {
    palabras: [
      "agua","agua natural","agua simple","agua purificada","agua mineral",
      "botella de agua","botella agua","agua embotellada","garrafón chico",
      "garrafon chico","garrafón pequeño"
    ],
    unidad: "LTR"
  },
  {
    palabras: [
      "bebida energetica","bebida energética","bebida energy","energy drink",
      "energética","red bull","monster","vive100","vive 100","boost","burn"
    ],
    unidad: "LTR"
  },
  {
    palabras: [
      "jugo","jugos","jugo de naranja","jugo de manzana","jugo de durazno",
      "jugo de mango","jugo natural","néctar","nectar"
    ],
    unidad: "LTR"
  },

  // ========================================================
  // Combos / Cajas / Packs
  // ========================================================
  {
    palabras: [
      "combo","combo cine","combo palomitas","combo familiar","combo grande",
      "combo mediano","combo chico","combo pareja","combo romántico","combo romantico",
      "combo gamer","combo noche de pelis","combo movie night","combo especial",
      "combo 2 personas","combo 3 personas","combo individual","combo premium",
      "combo deluxe","combo kids","combo infantil","combo niño","combo niña",
      "movie night box","movie box","cinebox","peli box","pelibox","box de snacks",
      "box de dulces","caja premium","caja de dulces","caja temática","caja tematica",
      "caja temática de cine","caja de cine","kit cine","kit de cine"
    ],
    unidad: "XPK"
  },

  // ========================================================
  // Envases temáticos / Souvenirs
  // ========================================================
  {
    palabras: [
      "cubeta","cubeta de palomitas","cubeta coleccionable","cubeta cine",
      "cubeta cinemex","cubeta cinepolis","palomera","palomera coleccionable",
      "palomera especial","palomera edición especial","palomera edición limitada",
      "balde de palomitas","balde cine","vaso","vaso gigante","vaso jumbo",
      "vaso coleccionable","vaso souvenir","vaso edición especial","vaso edición limitada",
      "vaso de personaje","vaso de película","vaso marvel","vaso disney",
      "envase","envase grande","envase chico","souvenir","souvenir de cine",
      "souvenir película","souvenir personaje","figura coleccionable"
    ],
    unidad: "H87"
  }
];

/* ============================================================
   DETECCIÓN DE UNIDAD SAT (dulcería)
   ============================================================ */

export async function buscarUnidadSAT(nombreProducto) {
  const text = nombreProducto.toLowerCase();

  // 1️⃣ Intento por regex (medidas exactas como 600 ml, 1.5 l, etc.)
  for (const p of patronesUnidad) {
    if (p.regex.test(text)) {
      return { key: p.unidad, name: "Detectado por patrón de medida" };
    }
  }

  // 2️⃣ Intento por categorías de palabras clave
  for (const regla of unidadPorPalabras) {
    if (regla.palabras.some(p => text.includes(p))) {
      return { key: regla.unidad, name: "Categoría dulcería de cine" };
    }
  }

  // 3️⃣ Intento por catálogo SAT (consulta remota a Facturapi)
  try {
    const { data } = await facturapi.get("/catalogs/units", {
      params: { q: nombreProducto }
    });
    if (data.data?.length > 0) {
      return data.data[0]; // Primera sugerencia SAT
    }
  } catch (_) {
    // Silencioso, usamos fallback
  }

  // 4️⃣ Fallback → pieza genérica (orden de producto)
  return { key: "H87", name: "Pieza (fallback dulcería)" };
}

/* ============================================================
   3. CLAVES PRODUCTO SAT — DULCERÍA DE CINE
   ============================================================ */

const clavesManual = [
  // ===================== PALOMITAS =========================
  {
    palabras: [
      "palomita","palomitas","palomitas grandes","palomitas chicas","palomitas medianas",
      "palomitas jumbo","palomitas extra grandes","palomitas tamaño cine","palomitas tamaño familiar",
      "popcorn","pop corn","palomitas gourmet","palomitas mantequilla","palomitas con mantequilla",
      "palomitas sabor mantequilla","palomitas acarameladas","palomitas caramelo",
      "palomitas sabor caramelo","palomitas de caramelo","palomitas queso","palomitas con queso",
      "palomitas sabor queso","palomitas enchiladas","palomitas picantes","palomitas mixtas",
      "palomitas dulces","palomitas saladas","palomitas dulce y salado","balde de palomitas",
      "cubeta de palomitas","palomitas bbq","palomitas chocolate","palomitas sabor chocolate"
    ],
    clave: "50192100" // Palomitas / productos de maíz inflado
  },

  // =================== DULCES / GOLOSINAS ==================
  {
    palabras: [
      "dulce","dulces","golosina","golosinas","caramelo","caramelos","caramelos suaves",
      "caramelos duros","caramelos masticables","paleta","paletas","paleta de caramelo",
      "paleta acidita","paleta enchilada","paleta rellena","paletas surtidas","chupeta",
      "chupetas","chupa pop","gomita","gomitas","gomitas enchiladas","gomitas acidas",
      "gomitas ácidas","gomitas de osito","gomitas de ositos","ositos de goma","panditas",
      "panditas acidos","panditas ácidos","skittles","m&m","m & m","lunetas","mix de dulces",
      "surtido de dulces","bolsa de dulces","bolsita de dulces","mix de golosinas","mix dulce",
      "chicle","chicles","chicle sin azúcar","chicle con azúcar"
    ],
    clave: "50161815" // Dulces en general
  },

  // ======================== CHOCOLATES =====================
  {
    palabras: [
      "chocolate","chocolates","barra de chocolate","barras de chocolate",
      "chocolate de leche","chocolate blanco","chocolate amargo","chocolate con almendras",
      "chocolate relleno","chocolate relleno de caramelo","chocolate relleno de cacahuate",
      "snickers","milky way","kitkat","kit kat","crunch","turín","turin","ferrero",
      "ferrero rocher","ferrero collection","hershey","hershey's","milo","bombón de chocolate",
      "bombones de chocolate"
    ],
    clave: "50161500" // Chocolates
  },

  // ================== SNACKS / BOTANAS SALADAS =============
  {
    palabras: [
      "papas","papitas","papas fritas","papas a la francesa","frituras","fritura",
      "botana","botanas","snack","snacks","papas adobadas","papas queso","papas jalapeño",
      "papas limon","papas limón","sabritas","sabritas adobadas","ruffles","doritos",
      "doritos nacho","doritos flaming hot","cheetos","cheetos flamin hot","rancheritos",
      "chips","chip","nachos","nachos con queso","nachos especiales","nachos supreme",
      "totopos","totopos con queso","totopos con salsa","pretzels","palitos salados",
      "snack mix","mix de botanas","mix snacks"
    ],
    clave: "50193101" // Snacks / botanas
  },

  // ========================== BEBIDAS ======================
  {
    palabras: [
      "refresco","refrescos","refresco grande","refresco mediano","refresco chico",
      "refresco jumbo","refresco 600 ml","refresco 400 ml","refresco 1l","refresco 1.5l",
      "coca","coca cola","coca-cola","coca light","coca zero","coca sin azúcar",
      "pepsi","pepsi cola","sprite","fanta","manzanita","manzanita sol","soda","sodas",
      "cola","bebida gaseosa","bebida azucarada","bebida saborizada"
    ],
    clave: "50202306" // Refrescos / gaseosas
  },
  {
    palabras: [
      "agua","agua natural","agua simple","agua purificada","agua mineral",
      "botella de agua","botella agua","agua embotellada","garrafón","garrafon"
    ],
    clave: "50202301" // Agua embotellada
  },
  {
    palabras: [
      "bebida energetica","bebida energética","energética","bebida energy",
      "energy drink","red bull","monster","vive100","vive 100","boost","burn"
    ],
    clave: "50202300" // Otras bebidas no alcohólicas
  },

  // ========================== COMBOS =======================
  {
    palabras: [
      "combo","combo cine","combo palomitas","combo familiar","combo grande",
      "combo mediano","combo chico","combo pareja","combo romántico","combo romantico",
      "combo gamer","combo noche de pelis","combo movie night","combo especial",
      "combo 2 personas","combo 3 personas","combo individual","combo premium",
      "combo deluxe","combo kids","combo infantil","combo niño","combo niña",
      "movie night box","movie box","cinebox","peli box","pelibox","box de snacks",
      "box de dulces","caja premium","caja de dulces","caja temática","caja tematica",
      "caja temática de cine","caja de cine","kit cine","kit de cine"
    ],
    clave: "48111103" // Paquetes / combos (agrupados)
  },

  // ===================== ARTÍCULOS DE CINE =================
  {
    palabras: [
      "cubeta","cubeta de palomitas","cubeta coleccionable","cubeta cine",
      "cubeta cinemex","cubeta cinepolis","palomera","palomera coleccionable",
      "palomera especial","palomera edición especial","palomera edición limitada",
      "balde de palomitas","balde cine","vaso","vaso gigante","vaso jumbo","vaso coleccionable",
      "vaso souvenir","vaso edición especial","vaso edición limitada","vaso de personaje",
      "vaso de película","vaso marvel","vaso disney","envase","envase grande","envase chico",
      "souvenir","souvenir de cine","souvenir película","souvenir personaje","figura coleccionable"
    ],
    clave: "49101600" // Artículos plásticos / souvenirs
  }
];

/* ============================================================
   DETECCIÓN DE CLAVE PRODUCTO SAT
   ============================================================ */

export async function buscarClaveSAT(nombreProducto) {
  const texto = nombreProducto.toLowerCase();

  // 1️⃣ Coincidencia directa con nuestro diccionario de dulcería
  for (const item of clavesManual) {
    if (item.palabras.some(p => texto.includes(p))) {
      return item.clave;
    }
  }

  // 2️⃣ Intento de búsqueda en catálogo SAT vía Facturapi
  try {
    // Truco: usar sólo una palabra clave principal para mejorar resultados
    const palabras = texto.split(/\s+/).filter(Boolean);
    const palabraClave = palabras.find(w =>
      ["palomita","palomitas","dulce","gomita","chocolate","papas","snack","refresco","agua","combo","vaso","cubeta","palomera"].includes(w)
    ) || palabras[0];

    const { data } = await facturapi.get("/catalogs/products", {
      params: { q: palabraClave }
    });

    if (data.data?.length > 0) {
      // Nos quedamos con el primer match sugerido por SAT
      return data.data[0].key;
    }
  } catch (e) {
    console.error("❌ Error al buscar Clave SAT:", e.response?.data || e.message);
  }

  // 3️⃣ Fallback: clave genérica de dulces / snacks de cine
  return "50192100"; // Palomitas genéricas (mejor que 01010101)
}
