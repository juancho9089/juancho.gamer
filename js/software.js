const USER = "juancho9089";
const REPO = "juancho.gamer";

const gallery = document.getElementById("softwareGallery");

init();

async function init(){

  gallery.innerHTML = "Cargando software...";

  const res = await fetch(
    `https://api.github.com/repos/${USER}/${REPO}/releases`
  );

  const releases = await res.json();

  renderSoftware(releases);
}

function renderSoftware(releases){

  gallery.innerHTML = "";

  releases.forEach((release,index)=>{

    const isNew = index === 0;

    if(!release.assets || release.assets.length === 0) return;

    const zipAssets = release.assets.filter(a =>
      a.name.endsWith(".zip") || a.name.endsWith(".rar")
    );

    if(zipAssets.length === 0) return;

    const isMultipart = zipAssets.length > 1;

    const card = document.createElement("div");
    card.className = "software-card";

    let downloadButtons = "";

    zipAssets.forEach((asset,i)=>{
      downloadButtons += `
        <a href="${asset.browser_download_url}" 
           class="download-btn" 
           target="_blank">
           <i class="fa-solid fa-download"></i>
           <span>${isMultipart ? "Parte " + (i+1) : "Descargar"}</span>
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

        ${isMultipart ? 
          `<p style="color:#ffcc00;font-size:13px;margin-top:10px;">
            ⚠ Este archivo está dividido en ${zipAssets.length} partes.
            Descarga todas y extrae la Parte 1.
          </p>` : ''
        }

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

/* ========================== */
/* MODAL */
/* ========================== */

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