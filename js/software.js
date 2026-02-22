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

  allSoftware = releases.map((r,index)=>{

    const categoryMatch = r.name.match(/\[(.*?)\]/);
    const category = categoryMatch ? categoryMatch[1].toLowerCase() : "general";

    const asset = r.assets[0];

    return {
      name: r.name.replace(/\[.*?\]/,"").trim(),
      category: category,
      description: r.body || "Sin descripción",
      download: asset?.browser_download_url || "#",
      size: asset ? (asset.size / (1024*1024)).toFixed(1) + " MB" : "",
      date: new Date(r.published_at).toLocaleDateString(),
      image: "images/logo.png",
      isNew: index === 0
    };
  });

  createCategories();
  renderGallery(allSoftware);
}

/* ========================= */
/* CATEGORÍAS */
/* ========================= */

function createCategories(){

  categoryBar.innerHTML = "";

  const categories = [...new Set(allSoftware.map(s=>s.category))];

  createButton("TODOS", "all");

  categories.forEach(cat=>{
    createButton(cat.toUpperCase(), cat);
  });
}

function createButton(text, category){

  const btn = document.createElement("button");
  btn.className="category-btn";
  btn.innerText=text;

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
    if(btn.innerText.toLowerCase()===currentCategory){
      btn.classList.add("active-category");
    }
    if(currentCategory==="all" && btn.innerText==="TODOS"){
      btn.classList.add("active-category");
    }
  });
}

function filterSoftware(){
  if(currentCategory==="all"){
    renderGallery(allSoftware);
  }else{
    const filtered=allSoftware.filter(s=>s.category===currentCategory);
    renderGallery(filtered);
  }
}

/* ========================= */
/* RENDER */
/* ========================= */

function renderGallery(data){

  gallery.innerHTML="";

  data.forEach(software=>{

    const card=document.createElement("div");
    card.className="software-card";

    card.innerHTML=`

      ${software.isNew ? '<div class="badge">NEW</div>' : ''}

      <div class="software-banner">
        <i class="fa-solid fa-microchip"></i>
      </div>

      <div class="software-info">
        <h3>${software.name}</h3>
        <p>Versión • ${software.date}</p>
        <p class="desc">${software.description}</p>
        <p style="font-size:12px;color:#888;">📦 ${software.size}</p>

        <div class="software-buttons">
          <button class="view-btn"
            data-name="${software.name}"
            data-desc="${software.description}"
            data-download="${software.download}">
            <i class="fa-solid fa-eye"></i> Ver
          </button>

          <a href="${software.download}" class="download-btn" target="_blank">
            <i class="fa-solid fa-download"></i>
            <span>Descargar</span>
          </a>
        </div>
      </div>
    `;

    gallery.appendChild(card);
  });
}

/* ========================= */
/* BUSCADOR */
/* ========================= */

searchInput.addEventListener("input", function(){

  const value=this.value.toLowerCase();

  const filtered=allSoftware.filter(s=>
    s.name.toLowerCase().includes(value)
  );

  renderGallery(filtered);
});

/* ========================= */
/* MODAL */
/* ========================= */

document.addEventListener("click", function(e){

  const viewBtn=e.target.closest(".view-btn");

  if(viewBtn){
    document.getElementById("modalTitle").innerText=viewBtn.dataset.name;
    document.getElementById("modalDesc").innerText=viewBtn.dataset.desc;
    document.getElementById("modalDownload").href=viewBtn.dataset.download;
    document.getElementById("softwareModal").style.display="flex";
  }
});

document.getElementById("closeSoftwareModal").onclick=function(){
  document.getElementById("softwareModal").style.display="none";
};

document.getElementById("softwareModal").onclick=function(e){
  if(e.target===this){
    this.style.display="none";
  }
};