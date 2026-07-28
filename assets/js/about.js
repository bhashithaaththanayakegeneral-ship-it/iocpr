/* About page — load leadership portraits from WP Alt Text.
   Chairman: "nilantha"
   Secretary General: "Secretary General"
   Senior Advisors: "anusha edirisnghe", "udayakumara" */
(function () {
  const slots = [...document.querySelectorAll("[data-leader-photo]")];
  if (!slots.length || !window.WP?.mediaAll) return;

  const matchers = {
    nilantha: (alt) => /^nilantha$/i.test(alt),
    "secretary-general": (alt) => /^secretary\s+general$/i.test(alt),
    "anusha-edirisnghe": (alt) => /^anusha\s+edirisnghe$/i.test(alt),
    udayakumara: (alt) => /^udayakumara$/i.test(alt),
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
