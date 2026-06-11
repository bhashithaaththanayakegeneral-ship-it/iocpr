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

    /* Image media library — used for the gallery */
    async media(perPage = 24, page = 1) {
      const data = await get("/wp/v2/media", {
        per_page: perPage,
        page,
        media_type: "image",
        _fields: "id,source_url,alt_text,title,media_details",
      });
      if (!Array.isArray(data)) return [];
      return data
        .filter((m) => m.source_url && !/woocommerce-placeholder/.test(m.source_url))
        .map((m) => ({
          id: m.id,
          src: m.source_url,
          thumb: m.media_details?.sizes?.medium_large?.source_url
            || m.media_details?.sizes?.large?.source_url
            || m.source_url,
          alt: strip(m.alt_text || m.title?.rendered) || "IOCPR gallery image",
        }));
    },

    /* A single page's rendered content by slug (optional, for prose pages) */
    async pageBySlug(slug) {
      const data = await get("/wp/v2/pages", { slug, _fields: "id,title,content" });
      if (!Array.isArray(data) || !data.length) return null;
      return { title: strip(data[0].title?.rendered), html: data[0].content?.rendered || "" };
    },
  };
})();
