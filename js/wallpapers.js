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

  // 🔥 CACHE LOCAL (anti F5 loco)
  const cached = localStorage.getItem("wallpaperCache");

  if(cached){
    const parsed = JSON.parse(cached);

    categories = parsed.categories;
    allImages = parsed.images;

    createCategoryButtons();
    renderGallery(allImages);

    console.log("⚡ Cargado desde cache local");
    return;
  }

  await fetchCategories();
}

/* ===================================
   CARGAR CATEGORÍAS (API)
=================================== */

async function fetchCategories(){

  try{

    const res = await fetch(
      `https://api.github.com/repos/${USER}/${REPO}/contents/${BASE_PATH}?ref=${BRANCH}`
    );

    if(!res.ok){
      throw new Error("GitHub API limit reached");
    }

    const data = await res.json();
    categories = data.filter(item => item.type === "dir");

    await loadAllImages();
    createCategoryButtons();
    renderGallery(allImages);

    // 🔥 GUARDAR EN CACHE
    localStorage.setItem("wallpaperCache", JSON.stringify({
      categories: categories,
      images: allImages
    }));

    console.log("🚀 Cargado desde GitHub y guardado en cache");

  }catch(err){

    gallery.innerHTML = `
      <div style="color:#00ffcc; font-size:18px;">
        ⚠ GitHub está descansando...<br>
        Intenta recargar en unos minutos.
      </div>
    `;

    console.error("Error:", err);
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

    images.forEach(img => {

      allImages.push({
        name: img.name,
        category: category.name,
        url: `https://raw.githubusercontent.com/${USER}/${REPO}/${BRANCH}/${BASE_PATH}/${category.name}/${img.name}`,
        sha: img.sha
      });

    });
  }

  // 🔥 Ordenar por más reciente
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
   RENDER GALERÍA
=================================== */

function renderGallery(images){

  gallery.style.opacity="0";

  setTimeout(()=>{

    gallery.innerHTML="";

    images.forEach((img,index)=>{

      const isNew = index < 3;

      const card=document.createElement("div");
      card.className="card";

      card.innerHTML=`
        <img src="${img.url}" loading="lazy">
        ${isNew?'<div class="badge">NEW</div>':''}
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

    gallery.style.opacity="1";

  },200);
}

/* ===================================
   DESCARGA FORZADA
=================================== */

document.addEventListener("click",function(e){

  const btn=e.target.closest(".download-wallpaper");
  if(!btn)return;

  const url=btn.dataset.url;
  const name=btn.dataset.name;

  const link=document.createElement("a");
  link.href=url;
  link.download=name;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});

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

/* ===================================
   BOTÓN DE EMERGENCIA (LIMPIAR CACHE)
=================================== */

window.clearWallpaperCache = function(){
  localStorage.removeItem("wallpaperCache");
  console.log("🧹 Cache limpiado");
};