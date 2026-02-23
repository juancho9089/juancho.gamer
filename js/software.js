const USER = "juancho9089";
const REPO = "juancho.gamer";

const gallery = document.getElementById("softwareGallery");
const categoryBar = document.getElementById("softwareCategoryBar");
const searchInput = document.getElementById("softwareSearch");

let allSoftware = [];
let currentCategory = "all";

init();

async function init(){

  gallery.innerHTML = "Cargando software...";

  const res = await fetch(`https://api.github.com/repos/${USER}/${REPO}/releases`);
  const releases = await res.json();

  if(!releases.length){
    gallery.innerHTML = "No hay releases disponibles.";
    return;
  }

  /* ORDEN REAL POR VERSION */
  releases.sort((a,b)=>{
    const getV = name=>{
      const m = name.match(/v?(\d+(\.\d+)?)/i);
      return m ? parseFloat(m[1]) : 0;
    };
    return getV(b.name) - getV(a.name);
  });

  allSoftware = releases.map((r,index)=>{

    const categoryMatch = r.name.match(/\[(.*?)\]/);
    const category = categoryMatch ? categoryMatch[1].toLowerCase() : "general";

    const asset = r.assets[0];

    let fileType="other";
    let typeLabel="FILE";

    if(asset){
      if(asset.name.endsWith(".zip")){
        fileType="zip";
        typeLabel="ZIP";
      }
      else if(asset.name.endsWith(".exe")){
        fileType="exe";
        typeLabel="EXE";
      }
    }

    return {
      id:r.id,
      name:r.name.replace(/\[.*?\]/,"").trim(),
      category:category,
      description:r.body || "Sin descripción",
      download:asset?.browser_download_url || "#",
      size:asset ? (asset.size/(1024*1024)).toFixed(1)+" MB" : "",
      date:new Date(r.published_at).toLocaleDateString(),
      fileType:fileType,
      typeLabel:typeLabel,
      isNew:index===0
    };
  });

  createCategories();
  renderGallery(allSoftware);
}

/* ICONOS AUTOMATICOS */
function getCategoryIcon(name){
  const icons={
    general:"📦",
    utilidad:"🛠",
    juego:"🎮",
    autos:"🚗",
    editor:"✏",
    sistema:"💻"
  };
  return icons[name] || "💾";
}

/* CATEGORIAS */
function createCategories(){

  categoryBar.innerHTML="";

  const categories=[...new Set(allSoftware.map(s=>s.category))];

  const favorites=JSON.parse(localStorage.getItem("softwareFavorites"))||[];

  createButton("🌍 TODOS", "all", allSoftware.length);
  createButton("⭐ FAVORITOS", "favorites", favorites.length);

  categories.forEach(cat=>{
    const count=allSoftware.filter(s=>s.category===cat).length;
    createButton(`${getCategoryIcon(cat)} ${cat.toUpperCase()}`, cat, count);
  });

  updateActive();
}

function createButton(text, category, count){

  const btn=document.createElement("button");
  btn.className="category-btn";
  btn.innerText=`${text} (${count})`;

  btn.onclick=()=>{
    currentCategory=category;
    filterSoftware();
    updateActive();
  };

  categoryBar.appendChild(btn);
}

function updateActive(){
  document.querySelectorAll(".category-btn").forEach(btn=>{
    btn.classList.remove("active-category");

    if(btn.innerText.toLowerCase().includes(currentCategory) ||
      (currentCategory==="all" && btn.innerText.includes("TODOS"))){
      btn.classList.add("active-category");
    }
  });
}

function filterSoftware(){

  if(currentCategory==="all"){
    renderGallery(allSoftware);
  }
  else if(currentCategory==="favorites"){
    const favorites=JSON.parse(localStorage.getItem("softwareFavorites"))||[];
    renderGallery(allSoftware.filter(s=>favorites.includes(s.id)));
  }
  else{
    renderGallery(allSoftware.filter(s=>s.category===currentCategory));
  }
}

/* RENDER */
function renderGallery(data){

  gallery.innerHTML="";

  data.forEach(software=>{

    const favorites=JSON.parse(localStorage.getItem("softwareFavorites"))||[];
    const isFav=favorites.includes(software.id);

    const card=document.createElement("div");
    card.className="software-card";

    card.innerHTML=`

      ${software.isNew?'<div class="badge">NEW</div>':''}

      <button class="software-favorite ${isFav?'active':''}" 
        data-id="${software.id}">
        <i class="fa-solid fa-heart"></i>
      </button>

      <div class="software-banner">
        <i class="fa-solid fa-microchip"></i>
      </div>

      <div class="software-info">
        <h3>${software.name}</h3>
        <p>Versión • ${software.date}</p>
        <p class="desc">${software.description}</p>
        <p style="font-size:12px;color:#888;">📦 ${software.size}</p>

        <div class="file-type type-${software.fileType}">
          ${software.typeLabel}
        </div>

        <div class="software-buttons">
          <button class="view-btn"
            data-name="${software.name}"
            data-desc="${software.description}"
            data-download="${software.download}">
            <i class="fa-solid fa-eye"></i> Ver
          </button>

          <a href="${software.download}" class="download-btn">
            <i class="fa-solid fa-download"></i>
            <span>Descargar</span>
          </a>
        </div>
      </div>
    `;

    gallery.appendChild(card);
  });
}

/* BUSCADOR */
searchInput.addEventListener("input",function(){
  const value=this.value.toLowerCase();
  renderGallery(allSoftware.filter(s=>s.name.toLowerCase().includes(value)));
});

/* EVENTOS */
document.addEventListener("click", function(e){

  const favBtn=e.target.closest(".software-favorite");
  if(favBtn){
    let favorites=JSON.parse(localStorage.getItem("softwareFavorites"))||[];
    const id=parseInt(favBtn.dataset.id);

    if(favorites.includes(id)){
      favorites=favorites.filter(f=>f!==id);
      favBtn.classList.remove("active");
    }else{
      favorites.push(id);
      favBtn.classList.add("active");
    }

    localStorage.setItem("softwareFavorites",JSON.stringify(favorites));
    createCategories();
  }

  const viewBtn=e.target.closest(".view-btn");
  if(viewBtn){
    document.getElementById("modalTitle").innerText=viewBtn.dataset.name;
    document.getElementById("modalDesc").innerText=viewBtn.dataset.desc;
    document.getElementById("modalDownload").href=viewBtn.dataset.download;
    document.getElementById("modalImage").src="images/logo.png";
    document.getElementById("softwareModal").style.display="flex";
  }
});

/* CERRAR MODAL */
document.getElementById("closeSoftwareModal").onclick=function(){
  document.getElementById("softwareModal").style.display="none";
};

document.getElementById("softwareModal").onclick=function(e){
  if(e.target===this){
    this.style.display="none";
  }
};

/* DESCARGAR DESDE MODAL SIN PAGINA BLANCA */
document.getElementById("modalDownload").addEventListener("click", async function(){

  const url = this.getAttribute("data-url");

  if(!url) return;

  const response = await fetch(url);
  const blob = await response.blob();
  const blobUrl = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = url.split("/").pop();

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(blobUrl);
});