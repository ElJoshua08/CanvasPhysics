console.log("reload");

const canvasContainer = document.querySelector(".canvas_container");

const canvas = document.getElementById("canvas1");
const context = canvas.getContext("2d");

// Elementos
const createParticleContainer = document.querySelector(".container");
const createParticleButton = document.querySelector(".create_particle_button");
const setParticlePositionContainer = document.querySelector(
  ".canvas_particle_preview"
);
const showCreateParticleContainerButton = document.querySelector(".up");
const toggleGravity = document.querySelector(".gravity")
const toggleFriction = document.querySelector(".friction")

// Particle preview
const particle_preview = document.querySelector(".particle_preview")

const radius_range = document.getElementById("radius")
const color_selector = document.getElementById("fillColor")

// Change preview particle
radius_range.addEventListener("change", (e) => {
  const value = e.target.value;

  console.log("changed", value, particle_preview)

  particle_preview.style.width = 2 * parseInt(value) + "px"
  particle_preview.style.height = 2 * parseInt(value) + "px"
  particle_preview.style.borderRadius = "50%"
})

fillColor.addEventListener("change", (e) => {
  const value = e.target.value;



  particle_preview.style.backgroundColor = value
})


// Show container when click
showCreateParticleContainerButton.addEventListener("click", (e) => {
  e.preventDefault();
  createParticleContainer.classList.toggle("active");
  showCreateParticleContainerButton.classList.toggle("active");
});

// Create particle on createParticleButton click
createParticleButton.addEventListener("click", handleCreateParticle);

function handleCreateParticle() {
  setParticlePositionContainer.classList.add("active");
}

setParticlePositionContainer.addEventListener("click", (e) => {
  const radius = document.getElementById("radius").value;
  const friction = document.getElementById("friction").value;
  const color = document.getElementById("fillColor").value;

  console.log(radius);

  let canvasRect = e.target.getBoundingClientRect()

  particles.push(
    new Particle(
      { x: e.clientX - canvasRect.left, y: e.clientY - canvasRect.top },
      Number.parseInt(radius),
      Number.parseInt(friction),
      color,
      "black",
      true,
      true,
      1
    )
  );

  console.log(particles);

  setParticlePositionContainer.classList.remove("active");
});

toggleGravity.addEventListener("click", (e) => {
  simulation.gravity = e.target.checked

  particles.forEach((particle) =>  {
    particle.setGravity(simulation.gravity)
  })
})

toggleFriction.addEventListener("change", (e) => {
  simulation.friction = e.target.checked

  particles.forEach((particle) => {
    particle.setFriction(simulation.friction)
  })
})


canvas.width = canvasContainer.clientWidth;
canvas.height = canvasContainer.clientHeight;

const perfectFrameTime = 1000 / 60;
let deltaTime = 0;
let lastTimestamp = 0;

const particles = [];

const Gravity = {
  x: 0,
  y: 0.14,
};

const simulation = {
  gravity: true,
  friction: true,
};

const mouse = {
  x: undefined,
  y: undefined,
};

//Utils
// Función para calcular el producto escalar de dos vectores
function dotProduct(vector1, vector2) {
  return vector1.x * vector2.x + vector1.y * vector2.y;
}

// Función para restar dos vectores
function calculateDistance(p1, p2) {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function normalizeVector(vector) {
  const length = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
  if (length !== 0) {
    return { x: vector.x / length, y: vector.y / length };
  }
  return { x: 0, y: 0 };
}

function calculateElasticBounce(p1, p2) {
  console.log(p1, p2);
  const v1 = { x: p1.vel.x, y: p1.vel.y };
  const v2 = { x: p2.vel.x, y: p2.vel.y };

  const d = normalizeVector({ x: p2.pos.x - p1.pos.x, y: p2.pos.y - p1.pos.y });

  const v1_parallel = {
    x: d.x * dotProduct(v1, d),
    y: d.y * dotProduct(v1, d),
  };

  const v1_perpendicular = {
    x: v1.x - v1_parallel.x,
    y: v1.y - v1_parallel.y,
  };

  const v2_parallel = {
    x: d.x * dotProduct(v2, d),
    y: d.y * dotProduct(v2, d),
  };

  const v2_perpendicular = {
    x: v2.x - v2_parallel.x,
    y: v2.y - v2_parallel.y,
  };

  // Calculate new velocities after collision
  const v1_final_parallel = v2_parallel;
  const v2_final_parallel = v1_parallel;

  const v1_final = {
    x: v1_final_parallel.x + v1_perpendicular.x,
    y: v1_final_parallel.y + v1_perpendicular.y,
  };

  const v2_final = {
    x: v2_final_parallel.x + v2_perpendicular.x,
    y: v2_final_parallel.y + v2_perpendicular.y,
  };

  p1.vel.x = v1_final.x;
  p1.vel.y = v1_final.y;
  p2.vel.x = v2_final.x;
  p2.vel.y = v2_final.y;
}

window.addEventListener("resize", (e) => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

class Particle {
  constructor(
    pos,
    radius,
    friction,
    fillColor,
    strokeColor,
    fill,
    stroke,
    strokeWidth
  ) {
    this.pos = pos || { x: 100, y: 100 };
    this.vel = { x: 0, y: 0 };
    this.radius = radius || 10;
    this.hasGravity = simulation.gravity;
    this.hasFriction = simulation.friction;
    this.friction = friction || 0.01;
    this.fillColor = fillColor || "#000";
    this.strokeColor = strokeColor || "#fff";
    this.fill = fill || true;
    this.stroke = stroke || false;
    this.strokeWidth = strokeWidth || 1;
    this.canTouchGround = true;
    this.canTouchWall = true;
    this.lastPos = { x: undefined, y: undefined };
    this.canLaunch = false;
  }

  ballClick(mouse) {
    return (
      mouse.x > this.pos.x - this.radius &&
      mouse.x < this.pos.x + this.radius &&
      mouse.y > this.pos.y - this.radius &&
      mouse.y < this.pos.y + this.radius
    );
  }

  setGravity(bool) {
    this.hasGravity = bool;
  }

  setFriction(bool) {
    this.hasFriction = bool;
  }

  getHasGravity() {
    return this.hasGravity;
  }

  setLaunch(bool) {
    this.canLaunch = bool;
    if (bool) console.log("preparing to launch");
  }

  getCanLaunch() {
    return this.canLaunch;
  }

  isTouchingGround() {
    return (
      this.pos.y + this.radius > canvas.height || this.pos.y - this.radius < 0
    );
  }

  isTouchingWall() {
    return (
      this.pos.x + this.radius > canvas.width || this.pos.x - this.radius < 0
    );
  }

  bounce(axis, e) {
    if (axis == "vertical") {
      this.vel.y = this.vel.y * -1 * e;
    }
    if (axis == "horizontal") {
      this.vel.x = this.vel.x * -1 * e;
    }
  }

  setLastPos(pos) {
    this.lastPos.x = pos.x;
    this.lastPos.y = pos.y;
  }

  launch() {
    // We calculate the angle
    let x = this.pos.x;
    let y = this.pos.y;
    let dx = this.lastPos.x - x;
    let dy = this.lastPos.y - y;
    let angle = Math.atan2(dy, dx);

    // We clamp the angle between 0 and 360
    angle = (angle + 2 * Math.PI) % (2 * Math.PI);

    // Whe calculate the distance and clamp it between 0 and 275
    let distance = Math.floor(Math.sqrt(dx * dx + dy * dy));
    distance > 275 ? (distance = 275) : distance;

    // We get the opposite angle (to get the launch angle)
    let oppositeAngle = (2 * Math.PI - (Math.PI - angle)) % (Math.PI * 2);

    // We calculate the speed from the distance
    let speed = distance / 6;

    // We set the vel to the angle
    this.vel.x += Math.cos(oppositeAngle) * speed;
    this.vel.y += Math.sin(oppositeAngle) * speed;

    console.log(
      angle * (180 / Math.PI),
      oppositeAngle * (180 / Math.PI),
      distance
    );

    this.canLaunch = false;
    this.lastPos = {};
  }

  update(deltaTime) {
    if (this.isTouchingGround() && this.canTouchGround) {
      if (Math.abs(this.vel.y) < Math.abs(Gravity.y * 1.08)) {
        this.pos.y = canvas.height - this.radius;
        this.vel.y = -this.vel.y * 0.7; // Rebote elástico en la dirección vertical
      } else {
        this.vel.y *= -0.7; // Rebote elástico en la dirección vertical
      }
      this.pos.y += this.vel.y * deltaTime;
    }

    if (this.isTouchingWall()) {
      if (Math.abs(this.vel.x) < Math.abs(Gravity.x * 1.08)) {
        this.vel.x = -this.vel.x * 0.7; // Rebote elástico en la dirección horizontal
      } else {
        this.vel.x *= -0.7; // Rebote elástico en la dirección horizontal
      }
      this.pos.x += this.vel.x * deltaTime;
    }

    // Aplicar la fuerza de fricción
    if (this.hasFriction) {
      this.vel.x -= this.vel.x * this.friction;
      this.vel.y -= this.vel.y * this.friction;
    }

    if (this.hasGravity) {
      this.vel.x += Gravity.x * deltaTime;
      this.vel.y += Gravity.y * deltaTime;
    }

    // Limitar la velocidad para evitar que la bola rebote indefinidamente
    const maxSpeed = 25;
    const speed = Math.sqrt(this.vel.x * this.vel.x + this.vel.y * this.vel.y);
    if (speed > maxSpeed) {
      const factor = maxSpeed / speed;
      this.vel.x *= factor;
      this.vel.y *= factor;
    }

    this.pos.x += this.vel.x * deltaTime;
    this.pos.y += this.vel.y * deltaTime;
  }

  draw() {
    context.beginPath();
    
    context.fillStyle = this.fillColor;
    context.strokeStyle = this.strokeColor;
    context.lineWidth = this.strokeWidth;

    context.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI * 2);

    this.fill ? context.fill() : "";
    this.stroke ? context.stroke() : "";
  }
}

function handlePartciles(deltaTime) {
  particles.forEach((particle) => {
    particle.update(deltaTime);
    particle.draw();
  });

  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      let particle1 = particles[i];
      let particle2 = particles[j];

      let dx = particle2.pos.x - particle1.pos.x;
      let dy = particle2.pos.y - particle1.pos.y;

      let distance = Math.sqrt(dx * dx + dy * dy);
      let totalRadius = particle1.radius + particle2.radius;

      if (distance <= totalRadius) {
        // Calcula las nuevas posiciones para evitar la superposición
        const overlap = totalRadius - distance;
        const adjustX = (dx / distance) * (overlap / 2);
        const adjustY = (dy / distance) * (overlap / 2);

        particle1.pos.x -= adjustX;
        particle1.pos.y -= adjustY;
        particle2.pos.x += adjustX;
        particle2.pos.y += adjustY;

        // Calcula los nuevos vectores de velocidad después del choque
        calculateElasticBounce(particle1, particle2);
      }
    }
  }
}

canvas.addEventListener("mousedown", (e) => {
  let canvasRect = canvas.getBoundingClientRect();
  mouse.x = e.clientX - canvasRect.left;
  mouse.y = e.clientY - canvasRect.top;

  particles.forEach((particle) => {
    if (particle.ballClick(mouse)) {
      particle.setLaunch(true);
    }
  });
});

canvas.addEventListener("mouseup", (e) => {
  let canvasRect = canvas.getBoundingClientRect();
  mouse.x = e.clientX - canvasRect.left;
  mouse.y = e.clientY - canvasRect.top;

  particles.forEach((particle) => {
    if (particle.getCanLaunch() && !particle.ballClick(mouse)) {
      particle.setLastPos(mouse);
      particle.launch();
    }
  });
});

window.addEventListener("keydown", (e) => {
  if (e.code == "Space") {
    particle.setGravity(!particle.getHasGravity());
  }
});

function start() {
  requestAnimationFrame(animate);
}

function animate(timestamp) {
  requestAnimationFrame(animate);
  context.clearRect(0, 0, canvas.width, canvas.height);

  deltaTime = (timestamp - lastTimestamp) / perfectFrameTime;
  lastTimestamp = timestamp;

  handlePartciles(deltaTime);
}

start();
