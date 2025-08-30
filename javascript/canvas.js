const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let W = window.innerWidth;
let H = window.innerHeight;
canvas.width = W;
canvas.height = H;

const imageCount = 28;
const images = [];
const imageObjects = [];

let draggingImage = null;
let dragOffset = { x: 0, y: 0 };

let scale = 1;
let offset = { x: 0, y: 0 };

let isPanning = false;
let lastMouse = { x: 0, y: 0 };

function screenToWorld(x, y) {
  return {
    x: (x - offset.x) / scale,
    y: (y - offset.y) / scale
  };
}

// Load all images named Quote1.svg to Quote28.svg
for (let i = 1; i <= imageCount; i++) {
  const img = new Image();
  img.src = `../assets/quotes/Quote${i}.svg`;
  images.push(img);
}

let loadedCount = 0;
images.forEach(img => {
  img.onload = () => {
    loadedCount++;
    if (loadedCount === imageCount) {
      initImages();
      draw();
    }
  };
  img.onerror = () => {
    console.warn(`Failed to load image ../assets/quotes/Quote${images.indexOf(img) + 1}.svg`);
    loadedCount++;
    if (loadedCount === imageCount) {
      initImages();
      draw();
    }
  }
});

function initImages() {
  let centerX = 0;
  let centerY = 0;

  images.forEach((img) => {
    const x = W / 2 + (Math.random() * 300 - 150);
    const y = H / 2 + (Math.random() * 300 - 150);
    centerX += x;
    centerY += y;

    imageObjects.push({
      image: img,
      x,
      y,
      width: img.width,
      height: img.height
    });
  });

  // Average center of all images
  centerX /= imageObjects.length;
  centerY /= imageObjects.length;

  // Set offset to center view on pile
  offset.x = W / 2 - centerX * scale;
  offset.y = H / 2 - centerY * scale;
}

function drawGrid(spacing = 50, color = "#ccc") {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 0.5;

  const startX = -offset.x / scale;
  const endX = startX + W / scale;
  const startY = -offset.y / scale;
  const endY = startY + H / scale;

  for (let x = Math.floor(startX / spacing) * spacing; x < endX; x += spacing) {
    ctx.beginPath();
    ctx.moveTo(x, startY);
    ctx.lineTo(x, endY);
    ctx.stroke();
  }

  for (let y = Math.floor(startY / spacing) * spacing; y < endY; y += spacing) {
    ctx.beginPath();
    ctx.moveTo(startX, y);
    ctx.lineTo(endX, y);
    ctx.stroke();
  }

  ctx.restore();
}

function draw() {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.setTransform(scale, 0, 0, scale, offset.x, offset.y);

  drawGrid();

  imageObjects.forEach(obj => {
    ctx.drawImage(obj.image, obj.x, obj.y);
  });
}

function getImageUnderMouse(x, y) {
  const world = screenToWorld(x, y);
  for (let i = imageObjects.length - 1; i >= 0; i--) {
    const obj = imageObjects[i];
    if (
      world.x >= obj.x &&
      world.x <= obj.x + obj.width &&
      world.y >= obj.y &&
      world.y <= obj.y + obj.height
    ) {
      return { obj, index: i, world };
    }
  }
  return null;
}

canvas.addEventListener("mousedown", (e) => {
  if (e.button !== 0) return;

  const result = getImageUnderMouse(e.clientX, e.clientY);
  if (result) {
    draggingImage = result.obj;
    dragOffset.x = result.world.x - draggingImage.x;
    dragOffset.y = result.world.y - draggingImage.y;

    imageObjects.splice(result.index, 1);
    imageObjects.push(draggingImage);
  } else {
    isPanning = true;
    lastMouse = { x: e.clientX, y: e.clientY };
  }
});

canvas.addEventListener("mousemove", (e) => {
  if (isPanning) {
    const dx = e.clientX - lastMouse.x;
    const dy = e.clientY - lastMouse.y;
    offset.x += dx;
    offset.y += dy;
    lastMouse = { x: e.clientX, y: e.clientY };
    draw();
    return;
  }

  if (draggingImage) {
    const world = screenToWorld(e.clientX, e.clientY);
    draggingImage.x = world.x - dragOffset.x;
    draggingImage.y = world.y - dragOffset.y;
    draw();
  }
});

canvas.addEventListener("mouseup", () => {
  draggingImage = null;
  isPanning = false;
});

canvas.addEventListener("mouseleave", () => {
  draggingImage = null;
  isPanning = false;
});

canvas.addEventListener("wheel", (e) => {
  e.preventDefault();
  const mouse = { x: e.clientX, y: e.clientY };
  const zoom = e.deltaY < 0 ? 1.1 : 0.9;
  const worldPos = screenToWorld(mouse.x, mouse.y);

  scale *= zoom;
  scale = Math.max(0.2, Math.min(scale, 5));

  const newScreenPos = {
    x: worldPos.x * scale + offset.x,
    y: worldPos.y * scale + offset.y
  };

  offset.x += mouse.x - newScreenPos.x;
  offset.y += mouse.y - newScreenPos.y;

  draw();
});

window.addEventListener("resize", () => {
  W = window.innerWidth;
  H = window.innerHeight;
  canvas.width = W;
  canvas.height = H;
  draw();
});

canvas.addEventListener("contextmenu", e => e.preventDefault());

const zoomInBtn = document.getElementById("zoom-in");
const zoomOutBtn = document.getElementById("zoom-out");

function zoomAtPoint(factor, centerX, centerY) {
  const worldPos = screenToWorld(centerX, centerY);
  scale *= factor;
  scale = Math.max(0.2, Math.min(scale, 5));

  const newScreenPos = {
    x: worldPos.x * scale + offset.x,
    y: worldPos.y * scale + offset.y
  };

  offset.x += centerX - newScreenPos.x;
  offset.y += centerY - newScreenPos.y;
  draw();
}

zoomInBtn.addEventListener("click", () => {
  zoomAtPoint(1.2, W / 2, H / 2);
});

zoomOutBtn.addEventListener("click", () => {
  zoomAtPoint(0.8, W / 2, H / 2);
});
