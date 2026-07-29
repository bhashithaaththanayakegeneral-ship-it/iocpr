/* Projects page — fixed project cards (title + description)
   with a swipeable image carousel. WP Alt Text / altKey fills each
   carousel (e.g. "Kolonna" or "BMICH 27 July | home | hero"). */
(function () {
  const mount = document.querySelector("[data-projects]");
  if (!mount) return;

  const esc = (s) =>
    String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/"/g, "&quot;");

  const PROJECTS = [
    {
      name: "Special Membership Development Workshop",
      altKey: "BMICH 27 July",
      tag: "Membership",
      blurb:
        "A special membership development workshop at the Bandaranaike Memorial International Conference Hall (BMICH), Colombo — strengthening IOCPR’s shared mission of crime prevention and rehabilitation.",
      meta: "27 July 2026 · BMICH, Colombo, Sri Lanka",
    },
    {
      name: "Community Policing Workshop",
      altKey: "Kolonna",
      tag: "Prevention",
      blurb:
        "Workshop conducted with a focus on community policing in the Kolonna Police Division, Ratnapura District.",
      meta: "Kolonna Police Division · Ratnapura District",
    },
    {
      name: "Crime Prevention Awareness Workshop",
      altKey: "Negombo",
      tag: "Prevention",
      blurb:
        "Crime prevention awareness workshop conducted in the Negombo Police Division, Sri Lanka.",
      meta: "Negombo Police Division · Sri Lanka",
    },
    {
      name: "Crime Prevention and Rehabilitation Training Workshop",
      altKey: "Sambuddha Jayanthi",
      tag: "Training",
      blurb:
        "Crime prevention and rehabilitation training workshop held at the Sambuddha Jayanthi Mandiraya, Colombo, Sri Lanka.",
      meta: "Sambuddha Jayanthi Mandiraya · Colombo, Sri Lanka",
    },
    {
      name: "Grand Recognition Ceremony",
      altKey: "BMICH Recognition",
      tag: "Recognition",
      blurb:
        "Grand Recognition Ceremony honouring distinguished professionals in the fields of criminology and law, held at the Bandaranaike Memorial International Conference Hall (BMICH), Colombo, Sri Lanka.",
      meta: "BMICH · Colombo, Sri Lanka",
    },
    {
      name: "Domestic Violence Prevention Awareness Workshop",
      altKey: "Dehiovita",
      tag: "Prevention",
      blurb:
        "Domestic violence prevention awareness workshop conducted to raise awareness among the plantation community in Dehiovita, Kegalle District, Sri Lanka.",
      meta: "Dehiovita · Kegalle District, Sri Lanka",
    },
    {
      name: "Crime Prevention Training Workshop",
      altKey: "Lakma Medura",
      tag: "Training",
      blurb:
        "Crime prevention training workshop held at the Mihiaka Medura Hall, Bandaranaike Memorial International Conference Hall (BMICH), Colombo, Sri Lanka.",
      meta: "Mihiaka Medura Hall, BMICH · Colombo, Sri Lanka",
    },
  ];

  function carouselHTML(project) {
    const imgs = project.images || [];
    if (!imgs.length) {
      return `<div class="carousel carousel--empty" aria-hidden="true"></div>`;
    }
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
    return `
      <article class="project-card reveal" data-d="${(i % 3) + 1}">
        ${carouselHTML(project)}
        <div class="body">
          <span class="tag">${esc(project.tag)}</span>
          <h3>${esc(project.name)}</h3>
          <p>${esc(project.blurb)}</p>
          <div class="meta">${esc(project.meta)}</div>
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
    window.addEventListener("resize", () => go(index, false));

    go(0, false);
    restart();
  }

  function matchKey(name) {
    return String(name || "")
      .toLowerCase()
      .replace(/&/g, "and")
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
  }

  /* Fixed cards: only images whose Alt project name matches the card.
     No leftovers — unmatched alts (e.g. lawlady) are not spread across projects. */
  function buildProjects(groups) {
    const byName = new Map();
    (groups || []).forEach((g) => {
      const key = matchKey(g.name);
      if (key) byName.set(key, g.images || []);
    });

    return PROJECTS.map((meta) => {
      const keys = [meta.altKey, meta.name].filter(Boolean).map(matchKey);
      const imgs =
        keys.map((k) => byName.get(k)).find((list) => list && list.length) || [];
      return {
        ...meta,
        images: [...imgs],
      };
    });
  }

  mount.className = "grid grid-3 projects-grid";
  mount.innerHTML = PROJECTS.map(
    () => `<div class="skeleton" style="aspect-ratio:3/4;border-radius:var(--radius)"></div>`
  ).join("");

  (async () => {
    const groups = await window.WP.mediaByProject();
    const projects = buildProjects(groups);

    mount.innerHTML = projects.map(cardHTML).join("");
    mount.querySelectorAll("[data-carousel]").forEach(initCarousel);
    mount.querySelectorAll(".reveal").forEach((el) => {
      requestAnimationFrame(() => el.classList.add("in"));
    });
  })();
})();
