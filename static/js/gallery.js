/* gallery.js — gallery filters, lightbox, wishlist, before/after comparison slider */
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
  const lightboxMedia = document.getElementById("lightboxMedia");
  const lightboxImage = document.getElementById("lightboxImage");
  const lightboxSwatch = document.getElementById("lightboxSwatch");
  const lightboxTitle = document.getElementById("lightboxTitle");
  const lightboxCategory = document.getElementById("lightboxCategory");
  const lightboxPrice = document.getElementById("lightboxPrice");
  const lightboxSku = document.getElementById("lightboxSku");
  const lightboxDescription = document.getElementById("lightboxDescription");
  
  let visibleItems = [];
  let currentIndex = 0;

  function openLightbox(item) {
    visibleItems = Array.from(galleryItems).filter((i) => i.style.display !== "none");
    currentIndex = visibleItems.indexOf(item);
    if (currentIndex === -1) currentIndex = 0;
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

    if (lightboxPrice) lightboxPrice.textContent = item.dataset.price || "";
    if (lightboxSku) lightboxSku.textContent = item.dataset.sku ? "SKU " + item.dataset.sku : "";
    if (lightboxDescription) lightboxDescription.textContent = item.dataset.description || "";

    if (lightboxImage && lightboxMedia) {
      const imgSrc = item.dataset.image || "";
      lightboxMedia.classList.remove("img-fallback");
      if (imgSrc) {
        lightboxImage.src = imgSrc;
        lightboxImage.alt = item.dataset.name || "";
      } else {
        lightboxImage.removeAttribute("src");
        lightboxMedia.classList.add("img-fallback");
      }
    }

    // Dynamic state application for lightbox Save Button
    const lightboxSaveBtn = document.getElementById("lightboxSaveBtn");
    if (lightboxSaveBtn) {
      const id = item.dataset.id;
      lightboxSaveBtn.classList.toggle("is-saved", isSaved(id));
      lightboxSaveBtn.dataset.currentId = id || ""; 
    }
  }

  lightboxImage?.addEventListener("error", () => {
    if (lightboxImage.getAttribute("src")) {
      lightboxMedia?.classList.add("img-fallback");
    }
  });

  // ---- Global Event Delegation for ALL Wishlist Actions ----
  // This approach is immune to DOM hydration, clones, or external UI scripts
  document.body.addEventListener("click", (e) => {
    
    // 1. Grid Card Save Event
    const gridSaveBtn = e.target.closest("[data-save-btn]");
    if (gridSaveBtn) {
      // Ensure we are inside the gallery grid
      const galleryGrid = document.getElementById("galleryGrid");
      if (!galleryGrid || !galleryGrid.contains(gridSaveBtn)) return;
      
      e.preventDefault();
      e.stopPropagation();
      
      const item = gridSaveBtn.closest(".gallery__item");
      const id = item?.dataset.id;
      if (!id) return;

      const nowSaved = toggleWishlist(id);
      gridSaveBtn.classList.toggle("is-saved", nowSaved);
      
      // Keep lightbox heart synced if it's currently open
      const lightboxSaveBtn = document.getElementById("lightboxSaveBtn");
      if (lightboxSaveBtn && lightboxSaveBtn.dataset.currentId === id) {
        lightboxSaveBtn.classList.toggle("is-saved", nowSaved);
      }
      
      showToast(nowSaved ? "♡ Added to your wishlist" : "Removed from wishlist");
      updateWishlistCount();
      return;
    }

    // 2. Lightbox Save Event
    const lightboxSaveBtnClick = e.target.closest("#lightboxSaveBtn");
    if (lightboxSaveBtnClick) {
      e.preventDefault();
      const id = lightboxSaveBtnClick.dataset.currentId;
      if (!id) {
        console.error("[Zeverish Debug] Lightbox save clicked, but no dataset ID found.");
        return;
      }
      
      const nowSaved = toggleWishlist(id);
      lightboxSaveBtnClick.classList.toggle("is-saved", nowSaved);

      // Keep underlying grid card synced
      const cardBtn = document.querySelector(`.gallery__item[data-id="${id}"] [data-save-btn]`);
      if (cardBtn) cardBtn.classList.toggle("is-saved", nowSaved);

      showToast(nowSaved ? "♡ Added to your wishlist" : "Removed from wishlist");
      updateWishlistCount();
      return;
    }
    
    // 3. Grid Card Open Lightbox Event
    const itemClick = e.target.closest(".gallery__item");
    if (itemClick) {
      const galleryGrid = document.getElementById("galleryGrid");
      // Ignore clicks if they originated from the wishlist drawer or weren't in the main grid
      if (galleryGrid && galleryGrid.contains(itemClick)) {
        openLightbox(itemClick);
      }
    }
  });


  /* ---------------- Lightbox Navigation & Close ---------------- */
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

  let touchStartX = 0;
  lightbox?.addEventListener("touchstart", (e) => {
    touchStartX = e.changedTouches[0].clientX;
  }, { passive: true });
  
  lightbox?.addEventListener("touchend", (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) < 40) return; 
    if (dx < 0) document.getElementById("lightboxNext")?.click();
    else document.getElementById("lightboxPrev")?.click();
  }, { passive: true });

  /* ---------------- Wishlist (localStorage) Core ---------------- */
  const WISHLIST_KEY = "zeverish_wishlist";

  function getWishlist() {
    try {
      const stored = JSON.parse(localStorage.getItem(WISHLIST_KEY));
      return (Array.isArray(stored) ? stored : []).map(String);
    } catch {
      return [];
    }
  }
  
  function isSaved(id) {
    if (!id) return false;
    return getWishlist().includes(String(id));
  }
  
  function toggleWishlist(id) {
    if (!id) return false;
    const strId = String(id);
    let list = getWishlist();
    
    if (list.includes(strId)) {
      list = list.filter((x) => x !== strId);
    } else {
      list.push(strId);
    }
    
    try {
      localStorage.setItem(WISHLIST_KEY, JSON.stringify(list));
      console.log(`[Storage Debug] Saved successfully:`, list);
    } catch (e) {
      console.error("[Storage Debug] Write failed, check browser permissions:", e);
    }
    return list.includes(strId);
  }

  function refreshSavedState() {
    document.querySelectorAll(".gallery__item").forEach((item) => {
      const id = item.dataset.id;
      if (!id) return;
      const btn = item.querySelector("[data-save-btn]");
      if (btn) btn.classList.toggle("is-saved", isSaved(id));
    });
  }
  
  refreshSavedState();

  const galleryGrid = document.getElementById("galleryGrid");
  if (galleryGrid) {
    new MutationObserver(refreshSavedState).observe(galleryGrid, {
      childList: true,
      subtree: true,
    });
  }

  /* ---------------- Toast ---------------- */
  let toastTimer = null;
  function showToast(message) {
    const toast = document.getElementById("toast");
    if (!toast) return;
    toast.innerHTML = message;
    toast.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 3200);
  }

  /* ---------------- Order on Instagram ---------------- */
  function buildOrderMessage(item) {
    return `Hi Zeverish,\n\nI would like to order this jewellery.\n\nProduct: ${item.dataset.name || ""}\nSKU: ${item.dataset.sku || ""}\nPrice: ₹${item.dataset.price || ""}\nProduct Link: https://zeverish.com/product/${item.dataset.slug || ""}\n\nPlease let me know the availability.`;
  }

  async function orderOnInstagram(item) {
    if (!item) return;
    const message = buildOrderMessage(item);
    try {
      await navigator.clipboard.writeText(message);
      showToast("✓ Product details copied.<br>Simply paste them into Instagram.");
    } catch {
      showToast("Couldn't copy automatically — please note the product details manually.");
    }
    const igUser = document.getElementById("lightbox")?.dataset.instagramUser || "zeverish_official";
    window.open(`https://ig.me/m/${igUser}`, "_blank", "noopener");
  }

  document.getElementById("lightboxOrderBtn")?.addEventListener("click", () => {
    orderOnInstagram(visibleItems[currentIndex]);
  });

  /* ---------------- Wishlist Drawer ---------------- */
  const wishlistToggle = document.getElementById("wishlistToggle");
  const wishlistDrawer = document.getElementById("wishlistDrawer");
  const wishlistOverlay = document.getElementById("wishlistOverlay");
  const wishlistClose = document.getElementById("wishlistClose");
  const wishlistBody = document.getElementById("wishlistBody");
  const wishlistCount = document.getElementById("wishlistCount");

  function updateWishlistCount() {
    const count = getWishlist().length;
    if (!wishlistCount) return;
    wishlistCount.textContent = count;
    wishlistCount.classList.toggle("is-empty", count === 0);
  }

function renderWishlistDrawer() {
    if (!wishlistBody) return;
    const ids = getWishlist();

    if (!ids.length) {
      wishlistBody.innerHTML = `
        <div class="wishlist-drawer__empty">
          <i class="fa-regular fa-heart"></i>
          Nothing saved yet.<br>Tap the heart on any piece to save it here.
        </div>`;
      return;
    }

    const cards = ids
      .map((id) => document.querySelector(`.gallery__item[data-id="${id}"]`))
      .filter(Boolean)
      .map((item) => {
        // Fetch the image source from the dataset
        const imgSrc = item.dataset.image || "";
        
        return `
          <div class="wishlist-card" data-id="${item.dataset.id}">
            <div class="wishlist-card__swatch">
              <img src="${imgSrc}" alt="${item.dataset.name || ""}" style="width: 100%; height: 100%; object-fit: cover; border-radius: inherit;">
            </div>
            <div class="wishlist-card__info">
              <span class="wishlist-card__cat">${item.dataset.category || ""}</span>
              <p class="wishlist-card__name">${item.dataset.name || ""}</p>
              <span class="wishlist-card__price">${item.dataset.price || ""}</span>
              <div class="wishlist-card__actions">
                <button class="wishlist-card__order" data-drawer-order>Order</button>
                <button class="wishlist-card__remove" data-drawer-remove>Remove</button>
              </div>
            </div>
          </div>`;
      });

    wishlistBody.innerHTML = cards.join("");
  }

  function openWishlistDrawer() {
    renderWishlistDrawer();
    wishlistDrawer?.classList.add("is-open");
    wishlistOverlay?.classList.add("is-open");
  }
  
  function closeWishlistDrawer() {
    wishlistDrawer?.classList.remove("is-open");
    wishlistOverlay?.classList.remove("is-open");
  }

  wishlistToggle?.addEventListener("click", openWishlistDrawer);
  wishlistClose?.addEventListener("click", closeWishlistDrawer);
  wishlistOverlay?.addEventListener("click", closeWishlistDrawer);

  wishlistBody?.addEventListener("click", (e) => {
    const card = e.target.closest(".wishlist-card");
    if (!card) return;
    const id = card.dataset.id;

    if (e.target.closest("[data-drawer-remove]")) {
      toggleWishlist(id);
      const gridBtn = document.querySelector(`.gallery__item[data-id="${id}"] [data-save-btn]`);
      if (gridBtn) gridBtn.classList.remove("is-saved");
      
      const lightboxSaveBtn = document.getElementById("lightboxSaveBtn");
      if (lightboxSaveBtn?.dataset.currentId === id) lightboxSaveBtn.classList.remove("is-saved");
      
      renderWishlistDrawer();
      updateWishlistCount();
      showToast("Removed from wishlist");
    }

    if (e.target.closest("[data-drawer-order]")) {
      const item = document.querySelector(`.gallery__item[data-id="${id}"]`);
      orderOnInstagram(item);
    }
  });

  updateWishlistCount();

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

  /* ---------------- Testimonials Swiper ---------------- */
  if (window.Swiper) {
    const swiperEl = document.querySelector(".testimonials__swiper");
    if (swiperEl) {
      const testimonialSwiper = new Swiper(swiperEl, {
        slidesPerView: 1,
        spaceBetween: 28,
        speed: 700,
        loop: true,
        grabCursor: true,
        centeredSlides: false,
        watchOverflow: true,
        observer: true,
        observeParents: true,
        preloadImages: true,
        autoplay: { delay: 4500, disableOnInteraction: false, pauseOnMouseEnter: true },
        navigation: {
          nextEl: swiperEl.querySelector(".testimonials__next"),
          prevEl: swiperEl.querySelector(".testimonials__prev"),
          disabledClass: "swiper-button-disabled"
        },
        pagination: {
          el: swiperEl.querySelector(".swiper-pagination"),
          clickable: true,
          dynamicBullets: true
        },
        keyboard: { enabled: true, onlyInViewport: true },
        breakpoints: {
          0: { slidesPerView: 1, spaceBetween: 18 },
          640: { slidesPerView: 1, spaceBetween: 22 },
          768: { slidesPerView: 2, spaceBetween: 24 },
          1100: { slidesPerView: 3, spaceBetween: 30 }
        }
      });
      swiperEl.querySelector(".testimonials__next")?.addEventListener("click", (e) => {
        e.preventDefault();
        testimonialSwiper.slideNext();
      });
      swiperEl.querySelector(".testimonials__prev")?.addEventListener("click", (e) => {
        e.preventDefault();
        testimonialSwiper.slidePrev();
      });
      window.addEventListener("resize", () => testimonialSwiper.update());
    }
  }
});