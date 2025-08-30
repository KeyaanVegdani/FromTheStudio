const bgClasses = ['bg-0', 'bg-1', 'bg-2', 'bg-3'];
const dots = document.querySelectorAll('.dot');
const nameLayouts = document.querySelectorAll('.name-layout');
const wrappers = document.querySelectorAll('.image-wrapper');

let currentIndex = 0;
let scrollAccumulator = 0;
let scrollVelocity = 0;
let isTransitioning = false;
let scrollDelta = 0;

const scrollThreshold = 150; // Lower = more sensitive
const tugStrength = 30;
const smoothing = 0.1; // Smaller = smoother

function updateActiveName() {
  nameLayouts.forEach((el, i) => {
    el.classList.toggle('active', i === currentIndex);
  });
}

function updateActiveDot() {
  dots.forEach((dot, i) => {
    dot.classList.toggle('active', i === currentIndex);
  });
}

function updateActiveImage() {
  wrappers.forEach((el, i) => {
    const isActive = i === currentIndex;
    el.classList.toggle('active', isActive);

    if (isActive) {
      el.style.opacity = 1;
    } else {
      el.style.opacity = 0;
      el.style.transform = 'translate(-50%, -50%) scale(0.8)';
    }
  });

  document.body.classList.remove(...bgClasses);
  document.body.classList.add(bgClasses[currentIndex]);

  updateActiveDot();
  updateActiveName();
}

// Tug effect via animation frame loop
function applyTugEffect(progress, snapping = false) {
  const active = wrappers[currentIndex];

  if (snapping) {
    // Snap cleanly to center
    active.style.transform = `translate(-50%, -50%) scale(1)`;
    active.style.opacity = 1;
  } else {
    const tugOffset = progress * tugStrength;
    const scale = 1 - Math.abs(progress) * 0.2;
    const opacity = 1 - Math.abs(progress) * 0.2;

    active.style.transform = `translate(-50%, calc(-50% + ${tugOffset}px)) scale(${scale})`;
    active.style.opacity = opacity;
  }
}

function animate() {
  scrollAccumulator += scrollVelocity;
  scrollVelocity *= (1 - smoothing); // apply friction

  const progress = Math.max(-1, Math.min(1, scrollAccumulator / scrollThreshold));
  applyTugEffect(progress);

  if (!isTransitioning && Math.abs(scrollAccumulator) >= scrollThreshold) {
    isTransitioning = true;

    if (scrollAccumulator > 0) {
      currentIndex = (currentIndex + 1) % wrappers.length;
    } else {
      currentIndex = (currentIndex - 1 + wrappers.length) % wrappers.length;
    }

    scrollAccumulator = 0;
    scrollVelocity = 0;

    updateActiveImage();

    setTimeout(() => {
      isTransitioning = false;
    }, 400);
  }

  // Snap to exact center if idle
if (Math.abs(scrollVelocity) < 0.01 && Math.abs(scrollAccumulator) < 1 && !isTransitioning) {
  applyTugEffect(0, true); // snap to center
}

  requestAnimationFrame(animate);
}

animate();


window.addEventListener('wheel', (e) => {
  if (isTransitioning) return;

  scrollAccumulator += e.deltaY;

  // Calculate tug offset for animation
  const progress = Math.max(-1, Math.min(1, scrollAccumulator / scrollThreshold));
  applyTugEffect(progress);

  if (Math.abs(scrollAccumulator) >= scrollThreshold) {
    isTransitioning = true;

    // Advance index based on scroll direction
    if (scrollAccumulator > 0) {
      currentIndex = (currentIndex + 1) % wrappers.length;
    } else {
      currentIndex = (currentIndex - 1 + wrappers.length) % wrappers.length;
    }

    // Reset for next scroll
    scrollAccumulator = 0;
    scrollVelocity = 0;

    updateActiveImage();

    // Allow new scroll after transition
    setTimeout(() => {
      isTransitioning = false;
    }, 400);
  }
});



// Dot click
dots.forEach(dot => {
  dot.addEventListener('click', () => {
    const index = parseInt(dot.getAttribute('data-index'));
    if (index === currentIndex) return;

    currentIndex = index;
    scrollAccumulator = 0;
    scrollVelocity = 0;
    updateActiveImage();
  });
});

// Name click
nameLayouts.forEach(name => {
  name.addEventListener('click', () => {
    const index = parseInt(name.getAttribute('data-index'));
    if (index === currentIndex) return;

    currentIndex = index;
    scrollAccumulator = 0;
    scrollVelocity = 0;
    updateActiveImage();
  });
});


// Initialize
updateActiveImage();






