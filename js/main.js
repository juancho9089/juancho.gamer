// ===== CANVAS PARTICULAS =====
let canvas = document.getElementById("particles");

if (!canvas) {
  canvas = document.createElement("canvas");
  canvas.id = "particles";
  document.body.appendChild(canvas);
}

const ctx = canvas.getContext("2d");

function resizeCanvas(){
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

resizeCanvas();

let particles = [];

class Particle{
  constructor(){
    this.reset();
  }

  reset(){
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 2 + 1;
    this.speedX = Math.random() * 0.5 - 0.25;
    this.speedY = Math.random() * 0.5 - 0.25;
  }

  update(){
    this.x += this.speedX;
    this.y += this.speedY;

    // Rebote suave
    if(this.x <= 0 || this.x >= canvas.width){
      this.speedX *= -1;
    }
    if(this.y <= 0 || this.y >= canvas.height){
      this.speedY *= -1;
    }
  }

  draw(){
    ctx.fillStyle = "#00ffcc";
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

function initParticles(){
  particles = [];
  for(let i = 0; i < 80; i++){
    particles.push(new Particle());
  }
}

function animate(){
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  particles.forEach(p => {
    p.update();
    p.draw();
  });

  requestAnimationFrame(animate);
}

initParticles();
animate();

window.addEventListener("resize", () => {
  resizeCanvas();
  initParticles();
});