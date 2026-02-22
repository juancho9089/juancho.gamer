const USER = "juancho9089";
const REPO = "juancho.gamer";
const BRANCH = "main";
const BASE_PATH = "images";

const gallery = document.getElementById("gallery");
const categoryBar = document.getElementById("categoryBar");

let categories = [];
let allImages = [];

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
        url: `https://raw.githubusercontent.com/${USER}/${REPO}/${BRANCH}/${BASE_PATH}/${cat.name}/${img.name}`,
        sha: img.sha
      });
    });
  }

  allImages.sort((a,b)=> b.sha.localeCompare(a.sha));
}

function createCategoryButtons(){

  categoryBar.innerHTML="";

  const allBtn = document.createElement("button");
  allBtn.className="category-btn";
  allBtn.innerText=`TODOS (${allImages.length})`;
  allBtn.onclick=()=>renderGallery(allImages);
  categoryBar.appendChild(allBtn);

  categories.forEach(cat=>{
    const count = allImages.filter(i=>i.category===cat.name).length;
    const btn=document.createElement("button");
    btn.className="category-btn";
    btn.innerText=`${cat.name.toUpperCase()} (${count})`;
    btn.onclick=()=>renderGallery(
      allImages.filter(i=>i.category===cat.name)
    );
    categoryBar.appendChild(btn);
  });
}

function renderGallery(images){

  gallery.innerHTML="";

  images.forEach((img,index)=>{

    const card=document.createElement("div");
    card.className="card";

    card.innerHTML=`
      <img src="${img.url}" loading="lazy" class="wall-img">
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

document.getElementById("closeFullscreen").onclick=function(){
  document.getElementById("fullscreenModal").style.display="none";
};

document.getElementById("fullscreenModal").onclick=function(e){
  if(e.target===this){
    this.style.display="none";
  }
};