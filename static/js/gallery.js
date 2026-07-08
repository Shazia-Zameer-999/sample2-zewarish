/* gallery.js — gallery filters, lightbox, before/after comparison slider */
document.addEventListener("DOMContentLoaded", () => {
  /* ---------------- Gallery filters ---------------- */
  const filterBtns = document.querySelectorAll(".gallery__filter-btn");
  const galleryItems = document.querySelectorAll(".gallery__item");
  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      const filter = btn.dataset.filter;
      galleryItems.forEach((item) => {
        const match = filter === "All" || item.dataset.category === filter;
        item.style.display = match ? "" : "none";
      });
    });
  });

  /* ---------------- Lightbox ---------------- */
  const lightbox = document.getElementById("lightbox");
  const lightboxSwatch = document.getElementById("lightboxSwatch");
  const lightboxTitle = document.getElementById("lightboxTitle");
  const lightboxCategory = document.getElementById("lightboxCategory");
  let visibleItems = [];
  let currentIndex = 0;

  function openLightbox(index) {
    visibleItems = Array.from(galleryItems).filter((i) => i.style.display !== "none");
    currentIndex = visibleItems.findIndex((i) => i === visibleItems[index]) !== -1 ? index : 0;
    renderLightbox();
    lightbox?.classList.add("is-open");
    document.body.classList.add("lightbox-open");
  }
  function renderLightbox() {
    const item = visibleItems[currentIndex];
    if (!item || !lightboxSwatch) return;
    const swatchNum = item.dataset.lightboxSwatch;
    lightboxSwatch.className = "swatch lightbox__swatch swatch--" + (((parseInt(swatchNum) || 0) % 12) + 1);
    lightboxTitle.textContent = item.dataset.lightboxTitle || "";
    lightboxCategory.textContent = item.dataset.lightboxCategory || "";
  }
  galleryItems.forEach((item, idx) => {
    item.addEventListener("click", () => {
      const all = Array.from(galleryItems).filter((i) => i.style.display !== "none");
      const localIndex = all.indexOf(item);
      visibleItems = all;
      currentIndex = localIndex;
      renderLightbox();
      lightbox?.classList.add("is-open");
      document.body.classList.add("lightbox-open");
    });
  });
  function closeLightbox() {
    lightbox?.classList.remove("is-open");
    document.body.classList.remove("lightbox-open");
  }
  document.getElementById("lightboxClose")?.addEventListener("click", closeLightbox);
  lightbox?.addEventListener("click", (e) => { if (e.target === lightbox) closeLightbox(); });
  document.getElementById("lightboxNext")?.addEventListener("click", () => {
    if (!visibleItems.length) return;
    currentIndex = (currentIndex + 1) % visibleItems.length;
    renderLightbox();
  });
  document.getElementById("lightboxPrev")?.addEventListener("click", () => {
    if (!visibleItems.length) return;
    currentIndex = (currentIndex - 1 + visibleItems.length) % visibleItems.length;
    renderLightbox();
  });
  document.addEventListener("keydown", (e) => {
    if (!lightbox?.classList.contains("is-open")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowRight") document.getElementById("lightboxNext")?.click();
    if (e.key === "ArrowLeft") document.getElementById("lightboxPrev")?.click();
  });

  /* ---------------- Before / After sliders ---------------- */
  document.querySelectorAll(".ba-slider__frame").forEach((frame) => {
    const after = frame.querySelector(".ba-slider__after");
    const handle = frame.querySelector(".ba-slider__handle");
    let dragging = false;

    function setPosition(clientX) {
      const rect = frame.getBoundingClientRect();
      let pct = ((clientX - rect.left) / rect.width) * 100;
      pct = Math.max(0, Math.min(100, pct));
      after.style.clipPath = `inset(0 0 0 ${pct}%)`;
      handle.style.left = pct + "%";
    }
    frame.addEventListener("mousedown", (e) => { dragging = true; setPosition(e.clientX); });
    window.addEventListener("mousemove", (e) => { if (dragging) setPosition(e.clientX); });
    window.addEventListener("mouseup", () => (dragging = false));

    frame.addEventListener("touchstart", (e) => { dragging = true; setPosition(e.touches[0].clientX); }, { passive: true });
    frame.addEventListener("touchmove", (e) => { if (dragging) setPosition(e.touches[0].clientX); }, { passive: true });
    frame.addEventListener("touchend", () => (dragging = false));
  });

  /* ---------------- Testimonials swiper ---------------- */
  if (window.Swiper) {
    new Swiper(".testimonials__swiper", {
      slidesPerView: 1,
      spaceBetween: 24,
      loop: true,
      autoplay: { delay: 4500, disableOnInteraction: false },
      pagination: { el: ".swiper-pagination", clickable: true },
      navigation: { nextEl: ".testimonials__next", prevEl: ".testimonials__prev" },
      breakpoints: {
        768: { slidesPerView: 2 },
        1100: { slidesPerView: 3 },
      },
    });
  }
});
