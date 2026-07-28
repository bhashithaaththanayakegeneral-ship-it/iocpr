/* Tiny WordPress REST client ------------------------------------------------
   All methods return plain data and never throw to the caller — on failure
   they resolve to an empty array / null so the UI can fall back gracefully. */
(function () {
  const BASE = window.IOCPR.WP_BASE;

  async function get(path, params) {
    const url = new URL(BASE + path);
    if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    try {
      const res = await fetch(url, { headers: { Accept: "application/json" } });
      if (!res.ok) throw new Error("HTTP " + res.status);
      return await res.json();
    } catch (err) {
      console.warn("[wp] request failed:", url.toString(), err.message);
      return null;
    }
  }

  const decode = (s) => {
    if (!s) return "";
    const t = document.createElement("textarea");
    t.innerHTML = s;
    return t.value;
  };
  const strip = (html) => decode((html || "").replace(/<[^>]*>/g, "")).trim();

  /* Only keep real IOCPR programme photos.
     Drops Woo placeholders, Avada/theme demo stock, and brand logo assets. */
  const isGalleryWorthy = (url) => {
    if (!url) return false;
    // Real IOCPR uploads live under 2026/; theme demo stock is under 2025/
    if (!/\/uploads\/2026\//i.test(url)) return false;
    if (/woocommerce-placeholder/i.test(url)) return false;
    if (/IOCRP-scaled|favicon|logo/i.test(url)) return false;
    return true;
  };

  const normalizeProject = (name) => {
    const raw = strip(name || "");
    if (!raw) return "";
    const cleaned = raw.replace(/^project\s*[:\-–—]\s*/i, "").trim();
    if (!cleaned) return "";
    if (/^(iocpr(\s+gallery)?(\s+image)?|image|photo|untitled)$/i.test(cleaned)) return "";
    if (/^whatsapp image/i.test(cleaned)) return "";
    if (/^img[_\s]?\d+/i.test(cleaned)) return "";
    return cleaned;
  };

  /* Alt format: "Project Name | home | hero"
     First non-flag segment = project name; flags control page placement. */
  const parseAltMeta = (altText) => {
    const parts = strip(altText || "")
      .split("|")
      .map((s) => s.trim())
      .filter(Boolean);
    const flags = [];
    const nameParts = [];
    parts.forEach((p) => {
      const lower = p.toLowerCase();
      if (lower === "home" || lower === "hero" || lower === "gallery") flags.push(lower);
      else nameParts.push(p);
    });
    const project = normalizeProject(nameParts.join(" "));
    return {
      project,
      flags,
      home: flags.includes("home") || flags.includes("hero"),
      hero: flags.includes("hero"),
    };
  };

  const mapMedia = (m) => {
    const rawAlt = strip(m.alt_text || "");
    const meta = parseAltMeta(rawAlt);
    return {
      id: m.id,
      src: m.source_url,
      thumb: m.media_details?.sizes?.medium_large?.source_url
        || m.media_details?.sizes?.large?.source_url
        || m.source_url,
      project: meta.project,
      flags: meta.flags,
      home: meta.home,
      hero: meta.hero,
      alt: meta.project || strip(m.title?.rendered) || "IOCPR gallery image",
      title: strip(m.title?.rendered) || "",
      date: m.date || "",
    };
  };

  window.WP = {
    decode,
    strip,

    /* Latest blog posts with featured image, author and category */
    async posts(perPage = 6) {
      const data = await get("/wp/v2/posts", {
        per_page: perPage,
        _embed: "wp:featuredmedia,wp:term",
        _fields: "id,slug,date,link,title,excerpt,_links,_embedded",
      });
      if (!Array.isArray(data)) return [];
      return data.map((p) => {
        const media = p._embedded?.["wp:featuredmedia"]?.[0];
        const terms = p._embedded?.["wp:term"]?.[0] || [];
        return {
          id: p.id,
          link: p.link,
          date: p.date,
          title: strip(p.title?.rendered),
          excerpt: strip(p.excerpt?.rendered).slice(0, 160),
          image: media?.source_url || null,
          category: terms[0]?.name ? decode(terms[0].name) : "News",
        };
      });
    },

    /* Image media library — used for the gallery.
       Pass perPage=0 (or omit page looping via mediaAll) to fetch every page. */
    async media(perPage = 24, page = 1) {
      const data = await get("/wp/v2/media", {
        per_page: Math.min(Math.max(perPage, 1), 100),
        page,
        media_type: "image",
        _fields: "id,source_url,alt_text,title,media_details,date",
      });
      if (!Array.isArray(data)) return [];
      return data
        .filter((m) => m.source_url && isGalleryWorthy(m.source_url))
        .map(mapMedia);
    },

    /* Fetch every gallery-worthy image across all WP media pages */
    async mediaAll() {
      const all = [];
      const pageSize = 100;
      for (let page = 1; page <= 20; page++) {
        const data = await get("/wp/v2/media", {
          per_page: pageSize,
          page,
          media_type: "image",
          _fields: "id,source_url,alt_text,title,media_details,date",
        });
        if (!Array.isArray(data) || !data.length) break;
        all.push(
          ...data
            .filter((m) => m.source_url && isGalleryWorthy(m.source_url))
            .map(mapMedia)
        );
        if (data.length < pageSize) break;
      }
      return all;
    },

    /* Group gallery images by WordPress Alt Text (= project name).
       Returns [{ name, slug, images: [...] }, ...] sorted by name. */
    async mediaByProject() {
      const imgs = await this.mediaAll();
      const map = new Map();
      imgs.forEach((img) => {
        const name = img.project || normalizeProject(img.alt);
        if (!name) return;
        const key = name.toLowerCase();
        if (!map.has(key)) {
          map.set(key, { name, slug: key.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""), images: [] });
        }
        map.get(key).images.push(img);
      });
      return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
    },

    /* Images for the homepage: prefer | home / | hero tags; else fall back to gallery set. */
    async mediaForHome(limit = 24) {
      const imgs = await this.mediaAll();
      const tagged = imgs.filter((m) => m.home || m.hero);
      const pool = tagged.length ? tagged : imgs;
      const heroes = pool.filter((m) => m.hero);
      const rest = pool.filter((m) => !m.hero);
      return [...heroes, ...rest].slice(0, limit);
    },

    /* A single page's rendered content by slug (optional, for prose pages) */
    async pageBySlug(slug) {
      const data = await get("/wp/v2/pages", { slug, _fields: "id,title,content" });
      if (!Array.isArray(data) || !data.length) return null;
      return { title: strip(data[0].title?.rendered), html: data[0].content?.rendered || "" };
    },
  };
})();
