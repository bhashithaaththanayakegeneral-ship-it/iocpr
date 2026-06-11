/* Loads images from the WordPress media library into [data-gallery],
   with a click-to-zoom lightbox. data-gallery="12" limits the count. */
(function () {
  const mount = document.querySelector("[data-gallery]");
  if (!mount) return;
  const limit = parseInt(mount.dataset.gallery, 10) || 24;

  mount.innerHTML = Array.from({ length: Math.min(limit, 9) })
    .map((_, i) => `<div class="skeleton" style="height:${180 + (i % 3) * 60}px;margin-bottom:16px"></div>`).join("");

  /* lightbox */
  const lb = document.createElement("div");
  lb.className = "lightbox";
  lb.innerHTML = `<button aria-label="Close">${window.ICONS?.close || "✕"}</button><img alt="" />`;
  document.body.appendChild(lb);
  const lbImg = lb.querySelector("img");
  const closeLb = () => { lb.classList.remove("open"); document.body.style.overflow = ""; };
  lb.addEventListener("click", (e) => { if (e.target !== lbImg) closeLb(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeLb(); });

  (async () => {
    const imgs = await window.WP.media(limit);
    if (!imgs.length) {
      mount.innerHTML = `<p class="empty-note">Gallery images are being uploaded. Please check back soon.</p>`;
      return;
    }
    mount.innerHTML = imgs
      .map((m) => `<img src="${m.thumb}" data-full="${m.src}" alt="${m.alt}" loading="lazy" />`)
      .join("");
    mount.querySelectorAll("img").forEach((img) =>
      img.addEventListener("click", () => {
        lbImg.src = img.dataset.full;
        lbImg.alt = img.alt;
        lb.classList.add("open");
        document.body.style.overflow = "hidden";
      })
    );
  })();
})();
