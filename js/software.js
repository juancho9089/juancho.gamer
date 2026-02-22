const USER = "juancho9089";
const REPO = "juancho.gamer";

const gallery = document.getElementById("softwareGallery");

init();

async function init(){

  gallery.innerHTML = "Cargando software...";

  const cached = localStorage.getItem("softwareCache");

  if(cached){
    const parsed = JSON.parse(cached);
    renderSoftware(parsed);
    return;
  }

  try{

    const res = await fetch(
      `https://api.github.com/repos/${USER}/${REPO}/releases`
    );

    const releases = await res.json();

    if(!Array.isArray(releases) || releases.length === 0){
      gallery.innerHTML = "No hay releases disponibles.";
      return;
    }

    localStorage.setItem("softwareCache", JSON.stringify(releases));

    renderSoftware(releases);

  }catch(err){
    console.error(err);
    gallery.innerHTML = "Error cargando software.";
  }
}

function renderSoftware(releases){

  gallery.innerHTML = "";

  releases.forEach((release,index)=>{

    const isNew = index === 0;

    const realAssets = release.assets.filter(asset =>
      !asset.name.toLowerCase().includes("source code")
    );

    if(realAssets.length === 0) return;

    const card = document.createElement("div");
    card.className = "software-card";

    let downloadButtons = "";

    realAssets.forEach((asset,i)=>{
      downloadButtons += `
        <a href="${asset.browser_download_url}"
           class="download-btn"
           target="_blank">
           <i class="fa-solid fa-download"></i>
           <span>${realAssets.length > 1 ? "Parte " + (i+1) : "Descargar"}</span>
        </a>
      `;
    });

    card.innerHTML = `
      ${isNew ? '<div class="badge">NEW</div>' : ''}

      <div class="software-banner">
        <i class="fa-solid fa-microchip"></i>
      </div>

      <div class="software-info">
        <h3>${release.name}</h3>
        <p>Versión ${release.tag_name}</p>

        <p class="desc">
          ${release.body ? release.body : "Nueva versión disponible"}
        </p>

        <div class="software-buttons">
          <button class="view"
            data-title="${release.name}"
            data-desc="${release.body || ''}"
            data-img="images/logo.png">
            <i class="fa-solid fa-eye"></i> Ver
          </button>

          ${downloadButtons}
        </div>
      </div>
    `;

    gallery.appendChild(card);
  });
}

/* MODAL */

document.addEventListener("click", function(e){

  const btn = e.target.closest(".view");
  if(!btn) return;

  const modal = document.getElementById("softwareModal");

  document.getElementById("modalTitle").innerText =
    btn.dataset.title;

  document.getElementById("modalDesc").innerText =
    btn.dataset.desc;

  document.getElementById("modalImage").src =
    btn.dataset.img;

  modal.style.display = "flex";
});

document.querySelector(".close").onclick = function(){
  document.getElementById("softwareModal").style.display="none";
};

window.onclick = function(e){
  const modal = document.getElementById("softwareModal");
  if(e.target === modal){
    modal.style.display="none";
  }
};