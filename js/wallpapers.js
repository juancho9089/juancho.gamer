/* ===================================
   CONFIG
=================================== */

const USER = "juancho9089";
const REPO = "juancho.gamer";
const BRANCH = "main";
const BASE_PATH = "images";

const gallery = document.getElementById("gallery");
const categoryBar = document.getElementById("categoryBar");
const searchInput = document.getElementById("searchInput");

let categories = [];
let allImages = [];

/* ===================================
   INICIO
=================================== */

init();

async function init(){

  gallery.innerHTML = "Cargando wallpapers...";

  const cached = localStorage.getItem("wallpaperCache");

  if(cached){
    const parsed = JSON.parse(cached);
    categories = parsed.categories;
    allImages = parsed.images;
    createCategoryButtons();
    renderGallery(allImages);
    return;
  }

  await fetchCategories();
}

/* ===================================
   CARGAR CATEGORÍAS
=================================== */

async function fetchCategories(){

  try{

    const res = await fetch(
      `https://api.github.com/repos/${USER}/${REPO}/contents/${BASE_PATH}?ref=${BRANCH}`
    );

    if(!res.ok) throw new Error("GitHub API limit reached");

    const data = await res.json();
    categories = data.filter(item => item.type === "dir");

    await loadAllImages();
    createCategoryButtons();
    renderGallery(allImages);

    localStorage.setItem("wallpaperCache", JSON.stringify({
      categories: categories,
      images: allImages
    }));

  }catch(err){
    gallery.innerHTML = "⚠ GitHub está descansando...";
    console.error(err);
  }
}

/* ===================================
   CARGAR IMÁGENES
=================================== */

async function loadAllImages(){

  allImages = [];

  for(const category of categories){

    const res = await fetch(category.url);
    const files = await res.json();

    const images = files.filter(f => f.type === "file");

    images.forEach(img=>{
      allImages.push({
        name: img.name,
        category: category.name,
        url: `https://raw.githubusercontent.com/${USER}/${REPO}/${BRANCH}/${BASE_PATH}/${category.name}/${img.name}`,
        sha: img.sha
      });
    });
  }

  allImages.sort((a,b)=> b.sha.localeCompare(a.sha));
}

/* ===================================
   BOTONES CATEGORÍA
=================================== */

function createCategoryButtons(){

  categoryBar.innerHTML = "";

  const allBtn = createButton(`TODOS (${allImages.length})`, ()=>{
    renderGallery(allImages);
  });

  const randomBtn = createButton("RANDOM", ()=>{
    const random = allImages[Math.floor(Math.random()*allImages.length)];
    renderGallery([random]);
  });

  categoryBar.appendChild(allBtn);
  categoryBar.appendChild(randomBtn);

  categories.forEach(cat=>{

    const count = allImages.filter(img=>img.category===cat.name).length;

    const btn = createButton(
      `${cat.name.toUpperCase()} (${count})`,
      ()=>{
        const filtered = allImages.filter(img=>img.category===cat.name);
        renderGallery(filtered);
      }
    );

    categoryBar.appendChild(btn);
  });
}

function createButton(text,click){
  const btn=document.createElement("button");
  btn.classList.add("category-btn");
  btn.innerText=text;
  btn.onclick=click;
  return btn;
}

/* ===================================
   RENDER
=================================== */

function renderGallery(images){

  gallery.innerHTML="";

  images.forEach((img,index)=>{

    const isNew = index < 3;

    const card=document.createElement("div");
    card.className="card";

    card.innerHTML=`
      <img src="${img.url}" loading="lazy" class="wall-img">
      ${isNew?'<div class="badge">NEW</div>':''}

      <button class="favorite-btn" data-url="${img.url}">
        <i class="fa-solid fa-heart"></i>
      </button>

      <div class="resolution">...</div>

      <div class="overlay">
        <button class="view-wallpaper" data-url="${img.url}">
          <i class="fa-solid fa-eye"></i>
        </button>

        <button class="download-wallpaper"
          data-url="${img.url}"
          data-name="${img.name}">
          <i class="fa-solid fa-download"></i>
        </button>
      </div>
    `;

    gallery.appendChild(card);

    // Resolución automática
    const imgElement = card.querySelector(".wall-img");
    const resolutionLabel = card.querySelector(".resolution");

    imgElement.onload = function(){
      resolutionLabel.innerText =
        this.naturalWidth + "x" + this.naturalHeight;
    };

    // Favoritos guardados
    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    if(favorites.includes(img.url)){
      card.querySelector(".favorite-btn").classList.add("active");
    }
  });
}

/* ===================================
   DESCARGA FORZADA
=================================== */

document.addEventListener("click", async function(e){

  const downloadBtn = e.target.closest(".download-wallpaper");
  if(downloadBtn){

    const url = downloadBtn.dataset.url;
    const name = downloadBtn.dataset.name;

    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);

    const link=document.createElement("a");
    link.href=blobUrl;
    link.download=name;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.URL.revokeObjectURL(blobUrl);
  }

  // Favoritos
  const favBtn = e.target.closest(".favorite-btn");
  if(favBtn){

    const url = favBtn.dataset.url;
    let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

    if(favorites.includes(url)){
      favorites = favorites.filter(f=>f!==url);
      favBtn.classList.remove("active");
    }else{
      favorites.push(url);
      favBtn.classList.add("active");
    }

    localStorage.setItem("favorites", JSON.stringify(favorites));
  }

  // Fullscreen
  const viewBtn = e.target.closest(".view-wallpaper");
  if(viewBtn){

    const modal = document.getElementById("fullscreenModal");
    const image = document.getElementById("fullscreenImage");

    image.src = viewBtn.dataset.url;
    modal.style.display="flex";
  }
});

/* ===================================
   CERRAR FULLSCREEN
=================================== */

document.getElementById("closeFullscreen").onclick = function(){
  document.getElementById("fullscreenModal").style.display="none";
};

document.getElementById("fullscreenModal").onclick = function(e){
  if(e.target === this){
    this.style.display="none";
  }
};

/* ===================================
   BUSCADOR
=================================== */

if(searchInput){
  searchInput.addEventListener("input",function(){

    const value=this.value.toLowerCase();

    const filtered=allImages.filter(img=>
      img.name.toLowerCase().includes(value)
    );

    renderGallery(filtered);
  });
}