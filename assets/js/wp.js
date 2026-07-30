/* Tiny WordPress REST client ------------------------------------------------
   All methods return plain data and never throw to the caller — on failure
   they resolve to an empty array / null so the UI can fall back gracefully. */
(function () {
  const BASE = window.IOCPR.WP_BASE;

  /* Avoid stale browser/CDN caches of the media list (client-reported missing images). */
  const bust = () => String(Math.floor(Date.now() / 60000)); /* changes every minute */

  async function getOnce(path, params) {
    const url = new URL(BASE + path);
    if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    /* Bust intermediary caches without custom headers (custom headers break WP CORS). */
    url.searchParams.set("_", bust());
    const res = await fetch(url.toString(), {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (!res.ok) throw new Error("HTTP " + res.status);
    return await res.json();
  }

  async function get(path, params, retries = 2) {
    let lastErr;
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await getOnce(path, params);
      } catch (err) {
        lastErr = err;
        if (attempt < retries) await new Promise((r) => setTimeout(r, 300 * (attempt + 1)));
      }
    }
    console.warn("[wp] request failed:", BASE + path, lastErr?.message || lastErr);
    return null;
  }

  /* One in-memory media fetch per page load (still no-store on the network). */
  let mediaAllPromise = null;

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

  /* Slot-only portraits — Home/About slots only; never Gallery, Projects, or hero pools. */
  const isReservedAlt = (name) =>
    /^(lawlady|impact|nilantha(\s+kotikawatta)?|secretary\s+general|anusha\s+ediris(i)?nghe|udaya\s*kumara|udayakumara)$/i.test(
      String(name || "").trim()
    );

  /* Alt flags:
     - hero / Project | hero     → Home hero carousel
     - hero-f1, hero-f2, …       → Home hero, sorted first (f1, f2, …)
     - hero-1, hero-2            → About story carousel only */
  const parseAltMeta = (altText) => {
    const parts = strip(altText || "")
      .split("|")
      .map((s) => s.trim())
      .filter(Boolean);
    const flags = [];
    const nameParts = [];
    let heroRank = 0;
    let homeFeaturedRank = 0;
    let aboutHero = false;

    parts.forEach((p) => {
      const lower = p.toLowerCase();
      if (lower === "home" || lower === "gallery") {
        flags.push(lower);
        return;
      }

      /* About-only: hero-1 / hero-2 */
      const aboutMatch = /^hero-([12])$/i.exec(lower);
      if (aboutMatch) {
        flags.push("hero");
        heroRank = parseInt(aboutMatch[1], 10);
        aboutHero = true;
        return;
      }

      /* Home featured: hero-f1, hero-f2, … */
      const featuredMatch = /^hero-f(\d+)$/i.exec(lower);
      if (featuredMatch) {
        flags.push("hero");
        homeFeaturedRank = parseInt(featuredMatch[1], 10) || 1;
        return;
      }

      /* Plain hero */
      if (/^hero$/i.test(lower)) {
        flags.push("hero");
        return;
      }

      nameParts.push(p);
    });

    const project = normalizeProject(nameParts.join(" "));
    return {
      project,
      flags,
      home: flags.includes("home") || (flags.includes("hero") && !aboutHero),
      hero: flags.includes("hero"),
      heroRank,
      homeFeaturedRank,
      aboutHero,
    };
  };

  const mapMedia = (m) => {
    const rawAlt = strip(m.alt_text || "");
    const meta = parseAltMeta(rawAlt);
    const reserved = isReservedAlt(meta.project);
    return {
      id: m.id,
      src: m.source_url,
      thumb: m.media_details?.sizes?.medium_large?.source_url
        || m.media_details?.sizes?.large?.source_url
        || m.source_url,
      project: meta.project,
      flags: meta.flags,
      home: meta.home && !reserved,
      hero: meta.hero && !reserved,
      heroRank: meta.heroRank || 0,
      homeFeaturedRank: meta.homeFeaturedRank || 0,
      aboutHero: !!meta.aboutHero,
      reserved,
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
      if (mediaAllPromise) return mediaAllPromise;
      mediaAllPromise = (async () => {
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
      })();
      try {
        return await mediaAllPromise;
      } catch (err) {
        mediaAllPromise = null;
        console.warn("[wp] mediaAll failed:", err?.message || err);
        return [];
      }
    },

    /* Gallery images only — excludes reserved slot portraits (lawlady, leaders, …). */
    async mediaForGallery(perPage = 0) {
      const imgs = perPage > 0 ? await this.media(perPage) : await this.mediaAll();
      return imgs.filter((m) => !m.reserved);
    },

    /* Group gallery images by WordPress Alt Text (= project name).
       Returns [{ name, slug, images: [...] }, ...] sorted by name. */
    async mediaByProject() {
      const imgs = await this.mediaAll();
      const map = new Map();
      imgs.forEach((img) => {
        const name = img.project || normalizeProject(img.alt);
        if (!name || img.reserved) return;
        if (/^hero-f\d+$/i.test(name)) return;
        if (/^hero-[12]$/i.test(name)) return;
        const key = name.toLowerCase();
        if (!map.has(key)) {
          map.set(key, { name, slug: key.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""), images: [] });
        }
        map.get(key).images.push(img);
      });
      return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
    },

    /* Images for homepage supporting sections: only | home / | hero (no untagged fallback). */
    async mediaForHome(limit = 24) {
      const imgs = await this.mediaAll();
      const pool = imgs.filter((m) => !m.reserved && (m.home || m.hero));
      const heroes = pool.filter((m) => m.hero);
      const rest = pool.filter((m) => !m.hero);
      return [...heroes, ...rest].slice(0, limit);
    },

    /* Home hero — "| hero" and "hero-f1"… ; excludes About-only hero-1 / hero-2.
       Featured ranks (hero-f1, hero-f2, …) sort to the front. */
    async mediaForHero(limit = 0) {
      const imgs = await this.mediaAll();
      const heroes = imgs
        .filter((m) => m.hero && !m.aboutHero && !m.reserved)
        .sort((a, b) => {
          const fa = a.homeFeaturedRank > 0 ? a.homeFeaturedRank : 999;
          const fb = b.homeFeaturedRank > 0 ? b.homeFeaturedRank : 999;
          if (fa !== fb) return fa - fb;
          return 0;
        });
      return limit > 0 ? heroes.slice(0, limit) : heroes;
    },

    /* Single reserved slot image by exact Alt (e.g. lawlady). */
    async mediaByAlt(alt) {
      const want = String(alt || "").trim().toLowerCase();
      if (!want) return null;
      const imgs = await this.mediaAll();
      return imgs.find((m) => String(m.project || m.alt || "").trim().toLowerCase() === want) || null;
    },

    /* About story carousel — only hero-1 then hero-2. */
    async mediaForAboutHero() {
      const imgs = await this.mediaAll();
      return imgs
        .filter((m) => m.aboutHero)
        .sort((a, b) => (a.heroRank || 99) - (b.heroRank || 99));
    },

    /* A single page's rendered content by slug (optional, for prose pages) */
    async pageBySlug(slug) {
      const data = await get("/wp/v2/pages", { slug, _fields: "id,title,content" });
      if (!Array.isArray(data) || !data.length) return null;
      return { title: strip(data[0].title?.rendered), html: data[0].content?.rendered || "" };
    },
  };
})();
