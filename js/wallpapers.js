const USER = "juancho9089";
const REPO = "juancho.gamer";
const BRANCH = "main";
const BASE_PATH = "images";

const gallery = document.getElementById("gallery");
const categoryBar = document.getElementById("categoryBar");

let categories = [];
let allImages = [];

async function fetchCategories() {
  const res = await fetch(
    `https://api.github.com/repos/${USER}/${REPO}/contents/${BASE_PATH}?ref=${BRANCH}`
  );
  const data = await res.json();

  categories = data.filter(item => item.type === "dir");
  createCategoryButtons();
  loadAllImages();
}

async function loadAllImages() {
  allImages = [];
  gallery.innerHTML = "Cargando...";

  for (const category of categories) {
    const res = await fetch(category.url);
    const files = await res.json();

    const images = files.filter(f => f.type === "file");
    images.forEach(img => {
      allImages.push({
        name: img.name,
        category: category.name,
        url: `https://raw.githubusercontent.com/${USER}/${REPO}/${BRANCH}/${BASE_PATH}/${category.name}/${img.name}`
      });
    });
  }

  renderGallery(allImages);
}

function createCategoryButtons() {
  categoryBar.innerHTML = "";

  const allBtn = createButton("TODOS", () => renderGallery(allImages));
  const randomBtn = createButton("RANDOM", () => {
    const random = allImages[Math.floor(Math.random() * allImages.length)];
    renderGallery([random]);
  });

  categoryBar.appendChild(allBtn);
  categoryBar.appendChild(randomBtn);

  categories.forEach(cat => {
    const btn = createButton(cat.name.toUpperCase(), () => {
      const filtered = allImages.filter(img => img.category === cat.name);
      renderGallery(filtered);
    });
    categoryBar.appendChild(btn);
  });
}

function createButton(text, onClick) {
  const btn = document.createElement("button");
  btn.innerText = text;
  btn.classList.add("category-btn");
  btn.onclick = onClick;
  return btn;
}

function renderGallery(images) {
  gallery.innerHTML = "";

  images.forEach(img => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <img src="${img.url}">
      <div class="overlay">
        <a href="${img.url}" download="${img.name}" class="download-btn">
          <i class="fa-solid fa-download"></i> Descargar
        </a>
      </div>
    `;

    gallery.appendChild(card);
  });
}

fetchCategories();