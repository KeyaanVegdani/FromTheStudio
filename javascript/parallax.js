window.addEventListener("scroll", () => {
  const scrollY = window.scrollY;

  document.querySelectorAll(".collage-item").forEach((img) => {
    const speed = parseFloat(img.dataset.speed) || 1;
    img.style.transform = `translateY(${scrollY * (speed - 1)}px)`;
  });
});
