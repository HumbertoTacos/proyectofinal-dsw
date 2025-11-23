// js/pages/HomePage.js
import { state, addToCart } from "../state.js";
import { apiGetProductos } from "../services/apiClient.js";

export async function HomePage() {
  const app = document.getElementById("app");

  // Mapear categoría -> imagen de fondo
  const categoryImages = {
    "Palomitas": "https://tvazteca.brightspotcdn.com/dims4/default/dc74bae/2147483647/strip/true/crop/800x800+324+0/resize/720x720!/format/webp/quality/90/?url=http%3A%2F%2Ftv-azteca-brightspot.s3.amazonaws.com%2Fc4%2Fe1%2F5cb969084469bedf36906606f8d6%2Flugares-para-probar-palomitas-deliciosas-en-la-cdmx.jpg",
    "Dulces": "https://tltfoods.com/cdn/shop/articles/il_fullxfull.1595703944_ixzw.webp?v=1733916529&width=1100",
    "Combos": "https://www.shutterstock.com/image-photo/pattern-fresh-made-hot-dogs-260nw-2180226409.jpg",
    "Snacks": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS88KjuPBj6GMSBw_xJVeMNkf6Gc4Vz-13SNw&s",
    "Bebidas": "https://i.pinimg.com/736x/0d/46/37/0d4637bdcb7e3dc00b08c51972f7081a.jpg",
    "Coleccionables": "https://i.ytimg.com/vi/NLvWKKzdEh0/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLCuO2IL7QWOnu_i6t-efhmfuVXFnA",
    "Comida": "https://st.depositphotos.com/3275527/4409/i/950/depositphotos_44097111-stock-photo-collage-of-various-fast-food.jpg",
  };

  if (!state.token) {
    app.innerHTML = `
  <section class="hero">
    <div>
      <div class="hero-tagline">
        ⭐ Envío express • 🎬 Listo para maratón de pelis
      </div>
      <h1 class="hero-title">
        Todo lo que compras en el cine,<br/> directo a tu casa.
      </h1>
      <p class="hero-subtitle">
        Inicia sesión para ver nuestro menú de dulcería y combos.
      </p>
      <button class="hero-btn" id="btnLoginPublic">
        Iniciar sesión
      </button>
    </div>

    <div class="hero-card hero-card-big">
      <div class="hero-banner-img" 
        style="background-image:url('https://foods-static-content.cinepolis.com/redesign/MX/menus/atmosfera/combo_nachos_pareja_promotional.png')">
      </div>

      <h3 style="margin-top:1rem;">Combo “Para Compartir”</h3>
      <p class="text-muted">
        2 Palomitas mantequilla + Milky Way + 2 Refrescos grande.
      </p>
      <p style="font-size: 1.3rem; font-weight: 700; margin: 0.5rem 0;">
        $130.00 MXN
      </p>
      <p class="text-muted">
        Facturamos automática y correctamente tus compras con CFDI 4.0.
      </p>
    </div>
  </section>
`;

    document.getElementById("btnLoginPublic").onclick = () => {
      window.location.hash = "#/login";
    };
    return;
  }

  app.innerHTML = `<div class="home-loading">Cargando CineSnack MX...</div>`;

  let productos = [];
  try {
    productos = await apiGetProductos();
  } catch (err) {
    app.innerHTML = `
      <section class="center-page">
        <h1>Error al cargar datos</h1>
        <p class="text-muted">${err.message}</p>
      </section>`;
    return;
  }

  const categorias = {};
  productos.forEach((p) => {
    const cat = p.categoria || "Otros";
    if (!categorias[cat]) categorias[cat] = [];
    categorias[cat].push(p);
  });

  const destacados = productos.slice(0, 5);

  const banners = [
    {
      img: "https://img.freepik.com/foto-gratis/vista-superior-palomitas-maiz-madera-oscura-horizontal_176474-4495.jpg?semt=ais_hybrid&w=740&q=80",
      title: "Palomitas gourmet recién hechas",
      desc: "Sabor mantequilla • Caramelo • Queso • Enchiladas",
      categoria: "Palomitas",
      btn: "Ver palomitas",
    },
    {
      img: "https://voz.ucad.edu.mx/wp-content/uploads/2019/05/dulces.jpg",
      title: "Tus dulces favoritos de cine",
      desc: "Skittles, M&M’s, panditas, gomitas enchiladas y más.",
      categoria: "Dulces",
      btn: "Ver dulces",
    },
    {
      img: "https://i.blogs.es/4fea52/copia-de-portada-doble-78-/1366_521.jpg",
      title: "Combos especiales",
      desc: "Todo para tu noche de pelis sin salir de casa.",
      categoria: "Combos",
      btn: "Ver combos",
    },
  ];

  app.innerHTML = `
    <section class="banner-carousel">
      <div class="carousel-container">
        ${banners
      .map(
        (b, i) => `
          <div class="carousel-slide ${i === 0 ? "active" : ""}"
            style="background-image:url('${b.img}')">
            <div class="carousel-info">
              <h2>${b.title}</h2>
              <p>${b.desc}</p>
              <button class="hero-btn" onclick="window.location.hash='#/productos'">
              ${b.btn}
              </button>

            </div>
          </div>`
      )
      .join("")}
      </div>
      <div class="carousel-indicators">
        ${banners
      .map(
        (_, i) => `
          <div class="indicator ${i === 0 ? "active" : ""}" data-index="${i}"></div>`
      )
      .join("")}
      </div>
    </section>

    <section>
      <h2 class="section-title">Categorías populares</h2>
      <p class="section-subtitle">Descubre lo mejor de nuestra dulcería.</p>

      <div class="category-carousel-wrapper">
        <button class="category-btn left" id="catLeft">❮</button>

        <div class="category-carousel" id="catCarousel">
          ${Object.keys(categorias)
      .map(
        (cat) => `
            <div class="category-card-disney" data-cat="${cat}">
              <div class="category-card-bg"
                style="background-image: url('${categoryImages[cat] || "img/default-cat.jpg"}')"></div>

              <h3>${cat}</h3>
              <p>${categorias[cat].length} productos</p>
            </div>`
      )
      .join("")}
        </div>

        <button class="category-btn right" id="catRight">❯</button>
      </div>
    </section>

    <section>
      <h2 class="section-title">Destacados de hoy</h2>
      <p class="section-subtitle">Los más populares entre nuestros clientes.</p>

      <div class="products-grid">
        ${destacados
      .map(
        (p) => `
          <div class="product-card">
            <div class="product-img"
              style="background-image:url('${p.url_img || "https://images.pexels.com/photos/799155/pexels-photo-799155.jpeg"}')"></div>

            <div class="product-body">
              <div class="product-name">${p.nombre}</div>
              <div class="product-meta">${p.categoria || "Sin categoría"}</div>
              <div class="product-footer">
                <span>$${p.precio}</span>
                <button class="btn-sm" data-id="${p.id}">Agregar</button>
              </div>
            </div>
          </div>`
      )
      .join("")}
      </div>
    </section>
  `;

  startCarousel();

  // Navegar por categoría populares
  document.querySelectorAll("[data-cat]").forEach((el) => {
    el.onclick = () => {
      const cat = el.getAttribute("data-cat");
      window.location.hash = `#/productos?categoria=${encodeURIComponent(cat)}`;
    };
  });

  // ⭐⭐⭐ LISTENER PARA AGREGAR AL CARRITO (DESTACADOS)
  document.querySelectorAll(".btn-sm").forEach((btn) => {
    btn.onclick = () => {
      const id = btn.getAttribute("data-id");
      const producto = productos.find((p) => p.id === id);
      if (!producto) {
        console.error("Producto no encontrado:", id);
        return;
      }
      addToCart(producto);
    };
  });
}

function startCarousel() {
  const slides = document.querySelectorAll(".carousel-slide");
  const indicators = document.querySelectorAll(".indicator");
  if (!slides.length) return;

  let index = 0;
  setInterval(() => {
    slides[index].classList.remove("active");
    indicators[index].classList.remove("active");
    index = (index + 1) % slides.length;
    slides[index].classList.add("active");
    indicators[index].classList.add("active");
  }, 4000);
}

// Carousel de categorías estilo Disney+
setTimeout(() => {
  const catCarousel = document.getElementById("catCarousel");
  const leftBtn = document.getElementById("catLeft");
  const rightBtn = document.getElementById("catRight");

  if (!catCarousel) return;

  leftBtn.onclick = () => {
    catCarousel.scrollBy({ left: -260, behavior: "smooth" });
  };

  rightBtn.onclick = () => {
    catCarousel.scrollBy({ left: 260, behavior: "smooth" });
  };
}, 200);
