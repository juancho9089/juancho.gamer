const USER = "juancho9089";
const REPO = "juancho.gamer";
const BRANCH = "main";
const BASE_PATH = "images";

const gallery = document.getElementById("gallery");
const categoryBar = document.getElementById("categoryBar");
const searchInput = document.getElementById("searchInput");
const showFavoritesBtn = document.getElementById("showFavoritesBtn");

let categories = [];
let allImages = [];
let currentCategory = "all";

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

async function fetchCategories(){

  const res = await fetch(
    `https://api.github.com/repos/${USER}/${REPO}/contents/${BASE_PATH}?ref=${BRANCH}`
  );

  const data = await res.json();
  categories = data.filter(item => item.type === "dir");

  await loadImages();

  localStorage.setItem("wallpaperCache", JSON.stringify({
    categories,
    images: allImages
  }));

  createCategoryButtons();
  renderGallery(allImages);
}

async function loadImages(){

  allImages = [];

  for(const cat of categories){

    const res = await fetch(cat.url);
    const files = await res.json();

    files.filter(f=>f.type==="file").forEach(img=>{
      allImages.push({
        name: img.name,
        category: cat.name,
        url: `https://cdn.jsdelivr.net/gh/${USER}/${REPO}@${BRANCH}/${BASE_PATH}/${cat.name}/${img.name}`,
        sha: img.sha
      });
    });
  }

  allImages.sort((a,b)=> b.sha.localeCompare(a.sha));
}

/* ========================= */
/* CATEGORÍAS PRO */
/* ========================= */

function createCategoryButtons(){

  categoryBar.innerHTML="";

  const customOrder = ["anime","dark","games","autos"];

  categories.sort((a,b)=>{
    const indexA = customOrder.indexOf(a.name);
    const indexB = customOrder.indexOf(b.name);

    if(indexA === -1 && indexB === -1) return 0;
    if(indexA === -1) return -1;
    if(indexB === -1) return 1;

    return indexA - indexB;
  });

  createButton("🌍 TODOS", "all", allImages.length);

  categories.forEach(cat=>{
    const count = allImages.filter(i=>i.category===cat.name).length;
    const icon = getCategoryIcon(cat.name);
    createButton(`${icon} ${cat.name.toUpperCase()}`, cat.name, count);
  });
}

function getCategoryIcon(name){

  const n = name.toLowerCase();

  // Detectores inteligentes
  if(n.includes("anime")) return "🔥";
  if(n.includes("dark") || n.includes("black")) return "🌑";
  if(n.includes("game") || n.includes("gaming")) return "🎮";
  if(n.includes("auto") || n.includes("car") || n.includes("vehicle")) return "🚗";
  if(n.includes("nature") || n.includes("forest") || n.includes("landscape")) return "🌿";
  if(n.includes("space") || n.includes("galaxy") || n.includes("universe")) return "🌌";
  if(n.includes("tech") || n.includes("cyber") || n.includes("code")) return "💻";
  if(n.includes("wall")) return "🖼️";
  if(n.includes("sport")) return "⚽";
  if(n.includes("movie") || n.includes("cinema")) return "🎬";
  if(n.includes("music")) return "🎵";
  if(n.includes("random")) return "🎲";

  // Icono por defecto
  return "📁";
}

function createButton(text, category, count){

  const btn = document.createElement("button");
  btn.className="category-btn";
  btn.innerText=`${text} (${count})`;

  if(category === currentCategory){
    btn.classList.add("active-category");
  }

  btn.onclick=()=>{
    currentCategory = category;
    updateActiveCategory();
    filterByCategory(category);
  };

  categoryBar.appendChild(btn);
}

function updateActiveCategory(){
  document.querySelectorAll(".category-btn").forEach(btn=>{
    btn.classList.remove("active-category");
  });

  document.querySelectorAll(".category-btn").forEach(btn=>{
    if(
      (currentCategory==="all" && btn.innerText.includes("TODOS")) ||
      btn.innerText.toLowerCase().includes(currentCategory)
    ){
      btn.classList.add("active-category");
    }
  });
}

function filterByCategory(category){

  gallery.classList.add("fade-out");

  setTimeout(()=>{

    if(category==="all"){
      renderGallery(allImages);
    }else{
      const filtered = allImages.filter(i=>i.category===category);
      renderGallery(filtered);
    }

    gallery.classList.remove("fade-out");
    gallery.classList.add("fade-in");

    setTimeout(()=>{
      gallery.classList.remove("fade-in");
    },300);

  },200);
}

/* ========================= */
/* RENDER */
/* ========================= */

function renderGallery(images){

  gallery.innerHTML="";

  images.forEach((img,index)=>{

    const showNew = currentCategory==="all" && index < 3;
    const isFeatured = currentCategory!=="all" && index === 0;

    const card=document.createElement("div");
    card.className="card";

    if(isFeatured){
      card.classList.add("featured");
    }

    card.innerHTML=`
      <img src="${img.url}" loading="lazy" class="wall-img">

      ${showNew ? '<div class="badge">NEW</div>' : ''}

      <button class="favorite-btn" data-url="${img.url}">
        <i class="fa-solid fa-heart"></i>
      </button>

      <div class="resolution">...</div>

      <div class="overlay">
        <button class="view-wallpaper" data-url="${img.url}">
          <i class="fa-solid fa-eye"></i> Ver
        </button>

        <button class="download-wallpaper"
          data-url="${img.url}"
          data-name="${img.name}">
          <i class="fa-solid fa-download"></i> Descargar
        </button>
      </div>
    `;

    gallery.appendChild(card);

    const imgElement = card.querySelector(".wall-img");
    const resolutionLabel = card.querySelector(".resolution");

    function setResolution(){

      const width = imgElement.naturalWidth;
      let label = "";
      let className = "";

      if(width >= 3840){
        label="4K"; className="res-4k";
      }else if(width >= 2560){
        label="2K"; className="res-2k";
      }else if(width >= 1920){
        label="1080p"; className="res-1080";
      }else{
        label="HD"; className="res-hd";
      }

      resolutionLabel.innerText = label;
      resolutionLabel.classList.add(className);
    }

    if(imgElement.complete){
      setResolution();
    }else{
      imgElement.onload=setResolution;
    }

    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    if(favorites.includes(img.url)){
      card.querySelector(".favorite-btn").classList.add("active");
    }
  });
}

/* ========================= */
/* EVENTOS */
/* ========================= */

document.addEventListener("click", async function(e){

  const downloadBtn = e.target.closest(".download-wallpaper");
  if(downloadBtn){

    const url = downloadBtn.dataset.url;
    const name = downloadBtn.dataset.name;

    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);

    const link=document.createElement("a");
    link.href=blobUrl;
    link.download=name;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(blobUrl);
  }

  const favBtn = e.target.closest(".favorite-btn");
  if(favBtn){

    const url = favBtn.dataset.url;
    let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

    if(favorites.includes(url)){
      favorites=favorites.filter(f=>f!==url);
      favBtn.classList.remove("active");
    }else{
      favorites.push(url);
      favBtn.classList.add("active");
    }

    localStorage.setItem("favorites", JSON.stringify(favorites));
  }

  const viewBtn = e.target.closest(".view-wallpaper");
  if(viewBtn){
    document.getElementById("fullscreenImage").src=viewBtn.dataset.url;
    document.getElementById("fullscreenModal").style.display="flex";
  }
});

/* FULLSCREEN */
document.getElementById("closeFullscreen").onclick=function(){
  document.getElementById("fullscreenModal").style.display="none";
};

document.getElementById("fullscreenModal").onclick=function(e){
  if(e.target===this){
    this.style.display="none";
  }
};

/* BUSCADOR */
if(searchInput){
  searchInput.addEventListener("input",function(){

    const value=this.value.toLowerCase();

    const filtered=allImages.filter(img=>
      img.name.toLowerCase().includes(value)
    );

    renderGallery(filtered);
  });
}

/* FAVORITOS */
if(showFavoritesBtn){
  showFavoritesBtn.addEventListener("click",function(){

    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];

    const filtered = allImages.filter(img =>
      favorites.includes(img.url)
    );

    renderGallery(filtered);
  });
}