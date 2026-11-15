const USER = "juancho9089";
const REPO = "juancho.gamer";

const gallery = document.getElementById("softwareGallery");
const categoryBar = document.getElementById("softwareCategoryBar");
const searchInput = document.getElementById("softwareSearch");

let allSoftware = [];
let currentCategory = "all";

initSoftware();

async function initSoftware(){

  gallery.innerHTML = "Cargando software...";

  const res = await fetch(`https://api.github.com/repos/${USER}/${REPO}/releases`);
  let releases = await res.json();

  if(!releases.length){
    gallery.innerHTML = "No hay releases disponibles.";
    return;
  }

  /* 🔥 ORDENAR SOLO POR FECHA REAL */
  releases.sort((a,b)=>{
    return new Date(b.published_at) - new Date(a.published_at);
  });

  const latestDate = releases[0].published_at;

  allSoftware = releases.map((r)=>{

    const categoryMatch = r.name.match(/\[(.*?)\]/);
    const category = categoryMatch ? categoryMatch[1].toLowerCase() : "general";

    /* El archivo de descarga es el primero que NO sea imagen; una imagen subida al release se usa de portada */
    const isImage = n => /\.(png|jpe?g|webp|gif)$/i.test(n);
    const imageAsset = r.assets.find(a => isImage(a.name));
    const asset = r.assets.find(a => !isImage(a.name)) || r.assets[0];

    /* Portada: 1) imagen subida al release  2) imagen pegada en la descripción  3) covers/<etiqueta>.png|jpg|webp */
    const bodyImage = (r.body || "").match(/!\[[^\]]*\]\((https?:[^)\s]+)\)/);
    const covers = [];
    if(imageAsset) covers.push(imageAsset.browser_download_url);
    if(bodyImage) covers.push(bodyImage[1]);
    ["png","jpg","webp"].forEach(ext => covers.push(`covers/${r.tag_name}.${ext}`));

    let fileType="other";
    let typeLabel="FILE";

    if(asset){
      if(asset.name.toLowerCase().endsWith(".zip")){
        fileType="zip";
        typeLabel="ZIP";
      }
      else if(asset.name.toLowerCase().endsWith(".exe")){
        fileType="exe";
        typeLabel="EXE";
      }
    }

    return {
      id:r.id,
      name:r.name.replace(/\[.*?\]/,"").trim(),
      category:category,
      description:(r.body || "Sin descripción").replace(/!\[[^\]]*\]\([^)]*\)/g,"").trim() || "Sin descripción",
      covers:covers,
      download:asset?.browser_download_url || "#",
      size:asset ? (asset.size/(1024*1024)).toFixed(1)+" MB" : "",
      date:new Date(r.published_at).toLocaleDateString(),
      fileType:fileType,
      typeLabel:typeLabel,
      isNew:r.published_at === latestDate
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

      <div class="software-banner" style="--h:${coverHue(software.name)}">
        <div class="cover-auto">
          <span class="cover-initials">${coverInitials(software.name)}</span>
          <span class="cover-cat">${getCategoryIcon(software.category)} ${software.category.toUpperCase()}</span>
        </div>
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
    loadCover(card, software.covers);
  });
}

/* PORTADAS: si no hay imagen, queda la portada automática con las iniciales del programa */
function coverInitials(name){
  const words = name.replace(/v?\d+(\.\d+)*$/i,"").split(/[\s_\-]+/).filter(w=>/[a-z0-9]/i.test(w));
  const text = words.length > 1 ? words[0][0] + words[1][0] : (words[0] || name).slice(0,2);
  return text.toUpperCase();
}

function coverHue(name){
  let h = 0;
  for(const c of name) h = (h * 31 + c.charCodeAt(0)) % 360;
  return h;
}

function loadCover(card, covers){
  const banner = card.querySelector(".software-banner");
  const viewBtn = card.querySelector(".view-btn");
  let i = 0;
  (function tryNext(){
    if(!covers || i >= covers.length) return;
    const url = covers[i++];
    const img = new Image();
    img.className = "cover-img";
    img.alt = "";
    img.onload = () => { banner.appendChild(img); banner.classList.add("has-img"); viewBtn.dataset.image = url; };
    img.onerror = tryNext;
    img.src = url;
  })();
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
    document.getElementById("modalDownload").setAttribute("data-url",viewBtn.dataset.download);
    document.getElementById("modalImage").src=viewBtn.dataset.image || "images/logo.png";
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
document.getElementById("modalDownload").addEventListener("click", async function(e){

  e.preventDefault();

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