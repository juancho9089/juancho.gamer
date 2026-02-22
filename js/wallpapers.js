const USER = "juancho9089";
const REPO = "juancho.gamer";
const BRANCH = "main";
const BASE_PATH = "images";

const gallery = document.getElementById("gallery");
const categoryBar = document.getElementById("categoryBar");

let categories = [];
let allImages = [];

/* =========================
   CARGAR CATEGORÍAS
========================= */

async function fetchCategories() {

  gallery.innerHTML = "Cargando wallpapers...";

  const res = await fetch(
    `https://api.github.com/repos/${USER}/${REPO}/contents/${BASE_PATH}?ref=${BRANCH}`
  );

  const data = await res.json();

  categories = data.filter(item => item.type === "dir");

  await loadAllImages();
  createCategoryButtons();
}

/* =========================
   CARGAR TODAS LAS IMÁGENES
========================= */

async function loadAllImages() {

  allImages = [];

  for (const category of categories) {

    const res = await fetch(category.url);
    const files = await res.json();

    const images = files.filter(f => f.type === "file");

    images.forEach(img => {

      allImages.push({
        name: img.name,
        category: category.name,
        url: `https://raw.githubusercontent.com/${USER}/${REPO}/${BRANCH}/${BASE_PATH}/${category.name}/${img.name}`,
        sha: img.sha
      });

    });
  }

  // Ordenar por más reciente
  allImages.sort((a, b) => b.sha.localeCompare(a.sha));

  renderGallery(allImages);
}

/* =========================
   CREAR BOTONES CATEGORÍA
========================= */

function createCategoryButtons() {

  categoryBar.innerHTML = "";

  // TODOS
  const allBtn = createButton(`TODOS (${allImages.length})`, () => {
    renderGallery(allImages);
  });
  categoryBar.appendChild(allBtn);

  // RANDOM
  const randomBtn = createButton("RANDOM", () => {
    const random = allImages[Math.floor(Math.random() * allImages.length)];
    renderGallery([random]);
  });
  categoryBar.appendChild(randomBtn);

  // CATEGORÍAS
  categories.forEach(cat => {

    const count = allImages.filter(img => img.category === cat.name).length;

    const btn = createButton(
      `${cat.name.toUpperCase()} (${count})`,
      () => {
        const filtered = allImages.filter(img => img.category === cat.name);
        renderGallery(filtered);
      }
    );

    categoryBar.appendChild(btn);
  });
}

function createButton(text, onClick) {
  const btn = document.createElement("button");
  btn.classList.add("category-btn");
  btn.innerText = text;
  btn.onclick = onClick;
  return btn;
}

/* =========================
   RENDER GALERÍA
========================= */

function renderGallery(images) {

  gallery.style.opacity = "0";

  setTimeout(() => {

    gallery.innerHTML = "";

    images.forEach((img, index) => {

      const isNew = index < 3;

      const card = document.createElement("div");
      card.className = "card";

      card.innerHTML = `
        <img src="${img.url}" loading="lazy">
        ${isNew ? '<div class="badge">NEW</div>' : ''}
        <div class="overlay">
          <button class="download-wallpaper"
                  data-url="${img.url}"
                  data-name="${img.name}">
            <i class="fa-solid fa-download"></i> Descargar
          </button>
        </div>
      `;

      gallery.appendChild(card);
    });

    gallery.style.opacity = "1";

  }, 200);
}

/* =========================
   DESCARGA FORZADA
========================= */

document.addEventListener("click", async function(e){

  const btn = e.target.closest(".download-wallpaper");

  if(!btn) return;

  const url = btn.dataset.url;
  const name = btn.dataset.name;

  btn.innerHTML = "Descargando...";

  try{

    const response = await fetch(url);
    const blob = await response.blob();

    const blobUrl = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = name;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.URL.revokeObjectURL(blobUrl);

    btn.innerHTML = "✔ Descargado";

    setTimeout(()=>{
      btn.innerHTML = `<i class="fa-solid fa-download"></i> Descargar`;
    },1500);

  }catch(err){
    btn.innerHTML = "Error";
    console.error(err);
  }

});

/* =========================
   INICIAR
========================= */

fetchCategories();