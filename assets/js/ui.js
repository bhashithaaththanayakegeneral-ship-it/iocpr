/* Shared UI: header + footer injection, nav, reveal, counters, lightbox ------
   Header/footer are rendered once here so all 10 pages stay in sync.
   Each page sets <body data-page="about"> to mark its active nav link. */
(function () {
  const ORG = window.IOCPR.ORG;
  const I = (paths) =>
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;

  const ICONS = {
    menu: I('<path d="M3 6h18M3 12h18M3 18h18"/>'),
    close: I('<path d="M18 6 6 18M6 6l12 12"/>'),
    facebook: I('<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>'),
    instagram: I('<rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/>'),
    linkedin: I('<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-9h4v1.5"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>'),
    youtube: I('<path d="M22 12s0-3-.4-4.4a2.8 2.8 0 0 0-2-2C17.8 5.2 12 5.2 12 5.2s-5.8 0-7.6.4a2.8 2.8 0 0 0-2 2C2 9 2 12 2 12s0 3 .4 4.4a2.8 2.8 0 0 0 2 2c1.8.4 7.6.4 7.6.4s5.8 0 7.6-.4a2.8 2.8 0 0 0 2-2C22 15 22 12 22 12z"/><path d="m10 9 5 3-5 3z" fill="currentColor"/>'),
    mail: I('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>'),
    phone: I('<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.6A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.5 2.1L8 9.6a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.8.3 1.7.5 2.6.6a2 2 0 0 1 1.7 2z"/>'),
    pin: I('<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>'),
    arrow: I('<path d="M5 12h14M13 6l6 6-6 6"/>'),
  };

  const NAV = [
    ["index.html", "Home", "home"],
    ["about.html", "About", "about"],
    ["programs.html", "Programs", "programs"],
    ["projects.html", "Projects", "projects"],
    ["impact.html", "Impact", "impact"],
    ["gallery.html", "Gallery", "gallery"],
    ["news.html", "News", "news"],
    ["get-involved.html", "Join Us", "get-involved"],
    ["contact.html", "Contact", "contact"],
  ];

  const active = document.body.dataset.page || "home";
  const link = (href, label, key) =>
    `<a href="${href}" class="${key === active ? "active" : ""}">${label}</a>`;

  /* ---------- Header ---------- */
  const headerHTML = `
    <header class="site-header" id="siteHeader">
      <div class="container nav">
        <a href="index.html" class="brand" aria-label="${ORG.name} home">
          <img src="${ORG.logo}" alt="${ORG.name} logo" />
          <span class="brand__txt"><b>${ORG.name}</b></span>
        </a>
        <nav class="nav-links" aria-label="Primary">${NAV.map((n) => link(...n)).join("")}</nav>
        <div class="nav-cta">
          <a href="donate.html" class="btn btn--accent">Donate</a>
          <button class="nav-toggle" id="navToggle" aria-label="Open menu" aria-expanded="false">${ICONS.menu}</button>
        </div>
      </div>
    </header>
    <div class="nav-backdrop" id="navBackdrop"></div>
    <aside class="drawer" id="drawer" aria-label="Mobile menu">
      <div class="drawer__top">
        <b>${ORG.name}</b>
        <button class="nav-toggle" id="navClose" aria-label="Close menu">${ICONS.close}</button>
      </div>
      ${NAV.map((n) => link(...n)).join("")}
      <a href="donate.html" class="btn btn--accent">Donate Now</a>
    </aside>`;

  /* ---------- Footer ---------- */
  const year = "2026"; // static build date — kept deterministic
  const social = Object.entries(ORG.social)
    .map(([k, url]) => `<a href="${url}" target="_blank" rel="noopener" aria-label="${k}">${ICONS[k] || ""}</a>`)
    .join("");

  const footerHTML = `
    <footer class="site-footer">
      <div class="container footer-grid">
        <div class="footer-brand">
          <img src="${ORG.logo}" alt="${ORG.name}" />
          <p>${ORG.full}. Working to prevent crime, rehabilitate offenders and build safer, more just communities.</p>
          <div class="social">${social}</div>
        </div>
        <div>
          <h4>Explore</h4>
          <ul class="foot-links">
            <li><a href="about.html">About Us</a></li>
            <li><a href="programs.html">Our Programs</a></li>
            <li><a href="projects.html">Projects</a></li>
            <li><a href="impact.html">Our Impact</a></li>
            <li><a href="news.html">News &amp; Highlights</a></li>
          </ul>
        </div>
        <div>
          <h4>Get Involved</h4>
          <ul class="foot-links">
            <li><a href="get-involved.html">Volunteer</a></li>
            <li><a href="donate.html">Donate</a></li>
            <li><a href="get-involved.html">Partner With Us</a></li>
            <li><a href="gallery.html">Gallery</a></li>
            <li><a href="contact.html">Contact</a></li>
          </ul>
        </div>
        <div class="foot-news">
          <h4>Stay Connected</h4>
          <p style="color:#9bb6b0;font-size:.9rem;margin-bottom:14px;">Get updates on our programs and impact.</p>
          <form onsubmit="event.preventDefault(); this.reset(); alert('Thank you for subscribing!');">
            <input type="email" placeholder="Your email address" required aria-label="Email" />
            <button class="btn btn--accent" style="width:100%">Subscribe</button>
          </form>
          <p style="margin-top:16px;color:#9bb6b0;font-size:.88rem;">${ICONS.pin}${ORG.address}</p>
        </div>
      </div>
      <div class="container foot-bottom">
        <span>© ${year} ${ORG.name}. All rights reserved.</span>
        <span>${ORG.full}</span>
      </div>
    </footer>`;

  /* ---------- Mount ---------- */
  const hMount = document.getElementById("site-header");
  const fMount = document.getElementById("site-footer");
  if (hMount) hMount.outerHTML = headerHTML;
  if (fMount) fMount.outerHTML = footerHTML;

  /* expose icons for page scripts */
  window.ICONS = ICONS;

  /* ---------- Behaviours ---------- */
  document.addEventListener("DOMContentLoaded", initBehaviours);
  if (document.readyState !== "loading") initBehaviours();

  let booted = false;
  function initBehaviours() {
    if (booted) return; booted = true;

    // sticky header shadow
    const header = document.getElementById("siteHeader");
    const onScroll = () => header && header.classList.toggle("is-scrolled", window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    // mobile drawer
    const drawer = document.getElementById("drawer");
    const backdrop = document.getElementById("navBackdrop");
    const open = (state) => {
      drawer?.classList.toggle("open", state);
      backdrop?.classList.toggle("open", state);
      document.body.style.overflow = state ? "hidden" : "";
      document.getElementById("navToggle")?.setAttribute("aria-expanded", String(state));
    };
    document.getElementById("navToggle")?.addEventListener("click", () => open(true));
    document.getElementById("navClose")?.addEventListener("click", () => open(false));
    backdrop?.addEventListener("click", () => open(false));
    drawer?.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => open(false)));

    // scroll reveal
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }),
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

    // animated counters
    const counters = document.querySelectorAll("[data-count]");
    if (counters.length) {
      const cio = new IntersectionObserver((entries) => {
        entries.forEach((e) => { if (e.isIntersecting) { animate(e.target); cio.unobserve(e.target); } });
      }, { threshold: 0.5 });
      counters.forEach((c) => cio.observe(c));
    }
    function animate(el) {
      const target = parseFloat(el.dataset.count);
      const suffix = el.dataset.suffix || "";
      const dur = 1500; const start = performance.now();
      const tick = (now) => {
        const p = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        const val = target * eased;
        el.textContent = (target % 1 === 0 ? Math.round(val) : val.toFixed(1)) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }
  }
})();
