/* About page — load leadership portraits from WP Alt Text.
   Chairman: "nilantha" or "Nilantha Kotikawatta"
   Secretary General: "Secretary General"
   Senior Advisors: "anusha edirisnghe", "udayakumara" */
(function () {
  const slots = [...document.querySelectorAll("[data-leader-photo]")];
  if (!slots.length || !window.WP?.mediaAll) return;

  const norm = (s) => String(s || "").trim().toLowerCase().replace(/\s+/g, " ");

  const matchers = {
    nilantha: (alt) => /^(nilantha(\s+kotikawatta)?|nilantha\s+kotikawatta)$/i.test(norm(alt)),
    "secretary-general": (alt) => /^secretary\s+general$/i.test(norm(alt)),
    "anusha-edirisnghe": (alt) => /^anusha\s+ediris(i)?nghe$/i.test(norm(alt)),
    udayakumara: (alt) => /^(udaya\s*kumara|udayakumara)$/i.test(norm(alt)),
  };

  WP.mediaAll().then((items) => {
    const list = items || [];
    slots.forEach((img) => {
      const key = img.getAttribute("data-leader-photo");
      const test = matchers[key];
      if (!test) return;
      const hit = list.find((m) => test(String(m.alt || "").trim()));
      if (!hit?.src) return;
      const next = hit.thumb || hit.src;
      if (img.src !== next) img.src = next;
    });
  });
})();
