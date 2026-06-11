/* Renders WordPress posts into [data-news] grids.
   data-news="3" limits the count (home page preview). */
(function () {
  function fmtDate(iso) {
    try {
      return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
    } catch { return ""; }
  }

  function card(post) {
    const img = post.image
      ? `<img src="${post.image}" alt="${post.title}" loading="lazy" />`
      : `<div class="skeleton" style="aspect-ratio:16/10;min-height:0;border-radius:0"></div>`;
    return `
      <a class="feature-card reveal" href="${post.link}" target="_blank" rel="noopener">
        ${img}
        <div class="body">
          <span class="tag">${post.category}</span>
          <h3>${post.title}</h3>
          <p style="color:var(--muted);font-size:.95rem;">${post.excerpt}${post.excerpt.length >= 159 ? "…" : ""}</p>
          <div class="meta">${fmtDate(post.date)}</div>
          <span class="more">Read more ${window.ICONS?.arrow || ""}</span>
        </div>
      </a>`;
  }

  async function render(el) {
    const limit = parseInt(el.dataset.news, 10) || 6;
    el.innerHTML = Array.from({ length: limit })
      .map(() => `<div class="skeleton" style="aspect-ratio:16/12"></div>`).join("");
    const posts = await window.WP.posts(limit);
    if (!posts.length) {
      el.innerHTML = `<p class="empty-note">News updates are being prepared. Please check back soon.</p>`;
      return;
    }
    el.innerHTML = posts.map(card).join("");
    // re-arm reveal for freshly injected cards
    el.querySelectorAll(".reveal").forEach((c, i) => {
      c.dataset.d = String((i % 3) + 1);
      requestAnimationFrame(() => c.classList.add("in"));
    });
  }

  document.querySelectorAll("[data-news]").forEach(render);
})();
