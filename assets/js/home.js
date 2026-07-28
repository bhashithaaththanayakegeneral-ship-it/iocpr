/* Home page — rectangular hero photo frame with swipe / prev-next.
   Prefers images tagged "| home" / "| hero"; falls back to gallery. */
(function () {
  const esc = (s) =>
    String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/"/g, "&quot;");

  function initFrame(root, imgs) {
    if (!root || !imgs.length) return;
    const track = root.querySelector("[data-hero-track]");
    const dotsWrap = root.querySelector("[data-hero-dots]");
    if (!track) return;

    const slides = imgs.slice(0, 10);
    track.innerHTML = slides
      .map(
        (img, i) =>
          `<figure class="hero-frame__slide${i === 0 ? " is-active" : ""}">
            <img src="${esc(img.src || img.thumb)}" alt="${esc(img.alt)}" decoding="async" ${i === 0 ? 'fetchpriority="high"' : 'loading="lazy"'} draggable="false" />
          </figure>`
      )
      .join("");

    if (slides.length < 2) {
      root.classList.add("hero-frame--single");
      if (dotsWrap) dotsWrap.hidden = true;
      return;
    }

    root.classList.remove("hero-frame--single");
    if (dotsWrap) {
      dotsWrap.hidden = false;
      dotsWrap.innerHTML = slides
        .map((_, i) => `<button type="button" class="hero-frame__dot${i === 0 ? " is-active" : ""}" data-go="${i}" aria-label="Go to photo ${i + 1}"></button>`)
        .join("");
    }

    const slideEls = [...track.querySelectorAll(".hero-frame__slide")];
    const dots = dotsWrap ? [...dotsWrap.querySelectorAll(".hero-frame__dot")] : [];
    let index = 0;
    let timer = null;
    let dragging = false;
    let startX = 0;
    let deltaX = 0;
    let width = root.clientWidth || 1;

    const go = (next, animate = true) => {
      index = ((next % slideEls.length) + slideEls.length) % slideEls.length;
      track.style.transition = animate ? "transform .4s cubic-bezier(.22, 1, .36, 1)" : "none";
      track.style.transform = `translate3d(${-index * 100}%, 0, 0)`;
      dots.forEach((d, i) => d.classList.toggle("is-active", i === index));
    };

    const next = () => go(index + 1);
    const prev = () => go(index - 1);
    const restart = () => {
      clearInterval(timer);
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      timer = setInterval(next, 5000);
    };

    root.querySelector(".hero-frame__btn--next")?.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      next();
      restart();
    });
    root.querySelector(".hero-frame__btn--prev")?.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      prev();
      restart();
    });
    dots.forEach((d) =>
      d.addEventListener("click", (e) => {
        e.preventDefault();
        go(parseInt(d.dataset.go, 10) || 0);
        restart();
      })
    );

    const onStart = (x) => {
      dragging = true;
      startX = x;
      deltaX = 0;
      width = root.clientWidth || 1;
      track.style.transition = "none";
      clearInterval(timer);
    };
    const onMove = (x) => {
      if (!dragging) return;
      deltaX = x - startX;
      track.style.transform = `translate3d(${-index * 100 + (deltaX / width) * 100}%, 0, 0)`;
    };
    const onEnd = () => {
      if (!dragging) return;
      dragging = false;
      const threshold = width * 0.18;
      if (deltaX <= -threshold) go(index + 1);
      else if (deltaX >= threshold) go(index - 1);
      else go(index);
      deltaX = 0;
      restart();
    };

    root.addEventListener("touchstart", (e) => onStart(e.touches[0].clientX), { passive: true });
    root.addEventListener("touchmove", (e) => onMove(e.touches[0].clientX), { passive: true });
    root.addEventListener("touchend", onEnd, { passive: true });
    root.addEventListener("touchcancel", onEnd, { passive: true });

    root.addEventListener("pointerdown", (e) => {
      if (e.pointerType === "touch" || e.button !== 0) return;
      if (e.target.closest(".hero-frame__btn, .hero-frame__dot")) return;
      root.setPointerCapture(e.pointerId);
      onStart(e.clientX);
    });
    root.addEventListener("pointermove", (e) => {
      if (e.pointerType === "touch") return;
      onMove(e.clientX);
    });
    root.addEventListener("pointerup", (e) => {
      if (e.pointerType === "touch") return;
      onEnd();
    });
    root.addEventListener("pointercancel", onEnd);
    window.addEventListener("resize", () => go(index, false));

    go(0, false);
    restart();
  }

  async function boot() {
    const frame = document.querySelector("[data-hero-frame]");
    if (!frame || !window.WP?.mediaForHome) return;
    const imgs = await window.WP.mediaForHome(12);
    if (!imgs.length) return;
    const heroes = imgs.filter((m) => m.hero);
    initFrame(frame, heroes.length ? heroes : imgs);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
