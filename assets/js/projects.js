/* Projects page — groups WP media by Alt Text (project name) and
   renders each project with a swipeable image carousel.
   Convention: in WordPress Media, set Alternative Text = project name
   (e.g. "Safe Communities Initiative"). Same alt = same project. */
(function () {
  const mount = document.querySelector("[data-projects]");
  if (!mount) return;

  const esc = (s) =>
    String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/"/g, "&quot;");

  const FALLBACK_META = [
    {
      name: "Safe Communities Initiative",
      tag: "Prevention",
      blurb: "Neighbourhood awareness drives that bring residents, schools and local authorities together to reduce crime at its source.",
      meta: "Ongoing · Battaramulla & surrounds",
    },
    {
      name: "Second Chance Skills",
      tag: "Rehabilitation",
      blurb: "Vocational training and mentorship that prepare reformed individuals for employment and independent living.",
      meta: "Ongoing · National",
    },
    {
      name: "Youth Shield",
      tag: "Youth",
      blurb: "Mentoring and safe spaces that protect at-risk young people and open doors to education and opportunity.",
      meta: "Launching 2026",
    },
    {
      name: "Justice Access Clinics",
      tag: "Legal Aid",
      blurb: "Free legal guidance and human-rights support for those who cannot otherwise afford representation.",
      meta: "Pilot phase",
    },
    {
      name: "Community Leaders Academy",
      tag: "Leadership",
      blurb: "Training local champions to sustain prevention and reform work within their own communities.",
      meta: "Ongoing",
    },
    {
      name: "Policy & Insight Lab",
      tag: "Research",
      blurb: "Research partnerships that turn community evidence into fairer, more effective crime policy.",
      meta: "Ongoing",
    },
  ];

  function carouselHTML(project) {
    const imgs = project.images || [];
    const multi = imgs.length > 1;
    const slides = imgs
      .map(
        (img, i) =>
          `<figure class="carousel__slide">
            <img src="${esc(img.thumb || img.src)}" data-full="${esc(img.src)}" alt="${esc(img.alt || project.name)}" draggable="false" loading="${i === 0 ? "eager" : "lazy"}" />
          </figure>`
      )
      .join("");
    const dots = multi
      ? `<div class="carousel__dots" role="tablist" aria-label="Slides">${imgs
          .map((_, i) => `<button type="button" class="carousel__dot${i === 0 ? " is-active" : ""}" data-go="${i}" aria-label="Go to image ${i + 1}"></button>`)
          .join("")}</div>`
      : "";
    const controls = multi
      ? `<button type="button" class="carousel__btn carousel__btn--prev" aria-label="Previous image">
           <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
         </button>
         <button type="button" class="carousel__btn carousel__btn--next" aria-label="Next image">
           <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>
         </button>`
      : "";

    return `
      <div class="carousel${multi ? " carousel--multi" : ""}" data-carousel data-count="${imgs.length}">
        <div class="carousel__viewport">
          <div class="carousel__track">${slides}</div>
        </div>
        ${controls}
        ${dots}
        ${multi ? `<span class="carousel__count"><b data-carousel-index>1</b> / ${imgs.length}</span>` : ""}
      </div>`;
  }

  function cardHTML(project, i) {
    const count = project.images?.length || 0;
    const tag = project.tag
      ? `<span class="tag">${esc(project.tag)}</span>`
      : `<span class="tag">${count} photo${count === 1 ? "" : "s"}</span>`;
    const blurb = project.blurb
      ? `<p>${esc(project.blurb)}</p>`
      : `<p>Photos from the <strong>${esc(project.name)}</strong> project.</p>`;
    const meta = project.meta
      ? `<div class="meta">${esc(project.meta)}</div>`
      : `<div class="meta">${count} image${count === 1 ? "" : "s"} from the field</div>`;

    return `
      <article class="project-card reveal" data-d="${(i % 3) + 1}">
        ${carouselHTML(project)}
        <div class="body">
          ${tag}
          <h3>${esc(project.name)}</h3>
          ${blurb}
          ${meta}
        </div>
      </article>`;
  }

  function initCarousel(root) {
    const track = root.querySelector(".carousel__track");
    const slides = [...root.querySelectorAll(".carousel__slide")];
    if (!track || slides.length < 2) return;

    const dots = [...root.querySelectorAll(".carousel__dot")];
    const indexEl = root.querySelector("[data-carousel-index]");
    let index = 0;
    let timer = null;
    let dragging = false;
    let startX = 0;
    let deltaX = 0;
    let width = root.clientWidth || 1;

    const measure = () => {
      width = root.clientWidth || 1;
      go(index, false);
    };

    const go = (next, animate = true) => {
      index = ((next % slides.length) + slides.length) % slides.length;
      track.style.transition = animate ? "transform .4s cubic-bezier(.22, 1, .36, 1)" : "none";
      track.style.transform = `translate3d(${-index * 100}%, 0, 0)`;
      dots.forEach((d, i) => d.classList.toggle("is-active", i === index));
      if (indexEl) indexEl.textContent = String(index + 1);
    };

    const next = () => go(index + 1);
    const prev = () => go(index - 1);

    const restart = () => {
      clearInterval(timer);
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      timer = setInterval(next, 5500);
    };

    root.querySelector(".carousel__btn--next")?.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      next();
      restart();
    });
    root.querySelector(".carousel__btn--prev")?.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      prev();
      restart();
    });
    dots.forEach((d) =>
      d.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        go(parseInt(d.dataset.go, 10) || 0);
        restart();
      })
    );

    const onStart = (clientX) => {
      dragging = true;
      startX = clientX;
      deltaX = 0;
      width = root.clientWidth || 1;
      track.style.transition = "none";
      clearInterval(timer);
    };

    const onMove = (clientX) => {
      if (!dragging) return;
      deltaX = clientX - startX;
      const pct = (deltaX / width) * 100;
      track.style.transform = `translate3d(${-index * 100 + pct}%, 0, 0)`;
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

    /* Touch swipe */
    root.addEventListener(
      "touchstart",
      (e) => onStart(e.touches[0].clientX),
      { passive: true }
    );
    root.addEventListener(
      "touchmove",
      (e) => onMove(e.touches[0].clientX),
      { passive: true }
    );
    root.addEventListener("touchend", onEnd, { passive: true });
    root.addEventListener("touchcancel", onEnd, { passive: true });

    /* Mouse / trackpad drag */
    root.addEventListener("pointerdown", (e) => {
      if (e.pointerType === "touch") return;
      if (e.button !== 0) return;
      if (e.target.closest(".carousel__btn, .carousel__dot")) return;
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

    window.addEventListener("resize", measure);
    go(0, false);
    restart();
  }

  /* Spread gallery images across fallback projects so each has a swipeable set. */
  function buildFallbackProjects(allImages) {
    const imgs = allImages.length
      ? allImages
      : [
          {
            thumb: "https://iocpr.com/wp-content/uploads/2026/03/WhatsApp-Image-2026-03-18-at-20.56.37.jpeg",
            src: "https://iocpr.com/wp-content/uploads/2026/03/WhatsApp-Image-2026-03-18-at-20.56.37.jpeg",
            alt: "IOCPR",
          },
        ];

    return FALLBACK_META.map((meta, i) => {
      const chunk = [];
      for (let n = i; n < imgs.length; n += FALLBACK_META.length) chunk.push(imgs[n]);
      if (!chunk.length) chunk.push(imgs[i % imgs.length]);
      return { ...meta, images: chunk };
    });
  }

  mount.innerHTML = Array.from({ length: 6 })
    .map(() => `<div class="skeleton" style="aspect-ratio:4/5;border-radius:var(--radius)"></div>`)
    .join("");

  (async () => {
    const groups = await window.WP.mediaByProject();
    let projects;

    if (groups.length) {
      projects = groups.map((g) => ({ name: g.name, images: g.images }));
    } else {
      const all = (await window.WP.mediaAll?.()) || [];
      projects = buildFallbackProjects(all);
    }

    mount.className = "grid grid-3";
    mount.innerHTML = projects.map(cardHTML).join("");

    mount.querySelectorAll("[data-carousel]").forEach(initCarousel);
    mount.querySelectorAll(".reveal").forEach((el) => {
      requestAnimationFrame(() => el.classList.add("in"));
    });
  })();
})();
