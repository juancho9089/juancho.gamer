/* =========================
   PARTICULAS GAMER
========================= */

const canvas = document.createElement("canvas");
document.body.appendChild(canvas);
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
canvas.style.position = "fixed";
canvas.style.top = "0";
canvas.style.left = "0";
canvas.style.zIndex = "-1";

let particles = [];

class Particle{
  constructor(){
    this.x = Math.random()*canvas.width;
    this.y = Math.random()*canvas.height;
    this.size = Math.random()*2+1;
    this.speedX = Math.random()*0.5-0.25;
    this.speedY = Math.random()*0.5-0.25;
  }

  update(){
    this.x+=this.speedX;
    this.y+=this.speedY;

    if(this.x<0 || this.x>canvas.width) this.speedX*=-1;
    if(this.y<0 || this.y>canvas.height) this.speedY*=-1;
  }

  draw(){
    ctx.fillStyle="#00ffcc";
    ctx.beginPath();
    ctx.arc(this.x,this.y,this.size,0,Math.PI*2);
    ctx.fill();
  }
}

function init(){
  particles=[];
  for(let i=0;i<80;i++){
    particles.push(new Particle());
  }
}

function animate(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  particles.forEach(p=>{
    p.update();
    p.draw();
  });
  requestAnimationFrame(animate);
}

init();
animate();

window.addEventListener("resize",()=>{
  canvas.width=window.innerWidth;
  canvas.height=window.innerHeight;
  init();
});


/* =========================
   CUANDO EL DOM CARGA
========================= */

document.addEventListener("DOMContentLoaded", () => {

  /* ===== MODAL SOFTWARE ===== */

  const modal = document.getElementById("softwareModal");
  const modalImg = document.getElementById("modalImage");
  const modalTitle = document.getElementById("modalTitle");
  const modalDesc = document.getElementById("modalDesc");
  const modalDownload = document.getElementById("modalDownload");
  const closeBtn = document.querySelector(".close");

  if(modal){

    document.querySelectorAll(".software-card").forEach(card => {

      const viewBtn = card.querySelector(".view");
      if(!viewBtn) return;

      viewBtn.addEventListener("click", () => {

        const img = card.querySelector("img").src;
        const title = card.querySelector("h3").innerText;
        const desc = card.querySelector(".desc").innerText;
        const download = card.querySelector("a").href;

        modal.style.display = "flex";
        modalImg.src = img;
        modalTitle.innerText = title;
        modalDesc.innerText = desc;
        modalDownload.href = download;
      });

    });

    if(closeBtn){
      closeBtn.onclick = () => modal.style.display = "none";
    }

    window.onclick = (e) => {
      if(e.target === modal){
        modal.style.display = "none";
      }
    };

  }


  /* ===== EFECTO BOTON DESCARGA ===== */

  document.querySelectorAll(".download-btn").forEach(btn => {

    btn.addEventListener("click", function(){

      const span = this.querySelector("span");
      if(!span) return;

      this.classList.add("downloading");
      span.innerText = "Descargando...";

      setTimeout(() => {
        this.classList.remove("downloading");
        this.classList.add("downloaded");
        span.innerText = "✔ Descargado";

        setTimeout(() => {
          this.classList.remove("downloaded");
          span.innerText = "Descargar";
        }, 1500);

      }, 1500);

    });

  });

});