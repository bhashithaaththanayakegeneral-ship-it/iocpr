/* Simple i18n (English/Sinhala) -------------------------------------------
   Usage:
   - Add `data-i18n="key.path"` to elements whose text should translate.
   - For attributes (placeholder/aria-label/etc) use:
       data-i18n="key.path" data-i18n-attr="placeholder"
   - Language stored in localStorage key: iocpr_lang ("en" | "si")
*/
(function () {
  const STORAGE_KEY = "iocpr_lang";

  const DICT = {
    en: {
      nav: {
        home: "Home",
        about: "About",
        programs: "Programs",
        projects: "Projects",
        impact: "Impact",
        gallery: "Gallery",
        news: "News",
        join: "Join Us",
        contact: "Contact",
      },
      common: {
        joinUs: "Join Us",
        getInvolved: "Get Involved",
        contactUs: "Contact Us",
        home: "Home",
        language: "Language",
        english: "English",
        sinhala: "සිංහල",
      },
      footer: {
        blurb:
          "International Organization for Crime Prevention and Rehabilitation. Working to prevent crime, rehabilitate offenders and build safer, more just communities.",
        explore: "Explore",
        aboutUs: "About Us",
        ourPrograms: "Our Programs",
        ourImpact: "Our Impact",
        newsHighlights: "News & Highlights",
        getInvolved: "Get Involved",
        volunteer: "Volunteer",
        partner: "Partner With Us",
        stayConnected: "Stay Connected",
        stayConnectedBlurb: "Get updates on our programs and impact.",
        subscribe: "Subscribe",
        subscribeThanks: "Thank you for subscribing!",
        rights: "All rights reserved.",
        email: "Email",
        emailPlaceholder: "Your email address",
      },
      pages: {
        news: {
          title: "News & Highlights — IOCPR",
          crumb: "Home / News",
          eyebrow: "News & Highlights",
          h1: "Stories of prevention, reform and hope.",
          p: "Updates from our programmes, partnerships and the communities we serve.",
        },
      },
    },
    si: {
      nav: {
        home: "මුල් පිටුව",
        about: "අප ගැන",
        programs: "වැඩසටහන්",
        projects: "ව්‍යාපෘති",
        impact: "ඵලදායීතාව",
        gallery: "ගැලරිය",
        news: "පුවත්",
        join: "එකතු වන්න",
        contact: "සම්බන්ධ වන්න",
      },
      common: {
        joinUs: "එකතු වන්න",
        getInvolved: "සම්බන්ධ වන්න",
        contactUs: "අප අමතන්න",
        home: "මුල් පිටුව",
        language: "භාෂාව",
        english: "English",
        sinhala: "සිංහල",
      },
      footer: {
        blurb:
          "අන්තර්ජාතික අපරාධ වැළැක්වීම හා පුනරුත්ථාපනය සඳහා වූ සංවිධානය. අපරාධ වැළැක්වීම, වරදකරුවන් පුනරුත්ථාපනය කිරීම සහ ආරක්ෂිත, සාධාරණ සමාජ ගොඩනැගීම සඳහා කටයුතු කරයි.",
        explore: "අධ්‍යයනය කරන්න",
        aboutUs: "අප ගැන",
        ourPrograms: "අපගේ වැඩසටහන්",
        ourImpact: "අපගේ ඵලදායීතාව",
        newsHighlights: "පුවත් හා විශේෂාංග",
        getInvolved: "සම්බන්ධ වන්න",
        volunteer: "ස්වේච්ඡා සේවකයෙකු වන්න",
        partner: "අප සමඟ හවුල් වන්න",
        stayConnected: "සම්බන්ධව සිටින්න",
        stayConnectedBlurb: "අපගේ වැඩසටහන් හා ඵලදායීතාව පිළිබඳ යාවත්කාලීන තොරතුරු ලබාගන්න.",
        subscribe: "ලියාපදිංචි වන්න",
        subscribeThanks: "ලියාපදිංචි වූ ඔබට ස්තූතියි!",
        rights: "සියලු හිමිකම් ඇවිරිණි.",
        email: "ඊමේල්",
        emailPlaceholder: "ඔබගේ ඊමේල් ලිපිනය",
      },
      pages: {
        news: {
          title: "පුවත් හා විශේෂාංග — IOCPR",
          crumb: "මුල් පිටුව / පුවත්",
          eyebrow: "පුවත් හා විශේෂාංග",
          h1: "වැළැක්වීම, ප්‍රතිසංස්කරණය සහ බලාපොරොත්තුවේ කතා.",
          p: "අපගේ වැඩසටහන්, හවුල්කාරීත්වයන් සහ අප සේවය කරන සමාජයන්ගෙන් යාවත්කාලීන තොරතුරු.",
        },
      },
    },
  };

  function get(obj, path) {
    return path.split(".").reduce((acc, k) => (acc && acc[k] != null ? acc[k] : undefined), obj);
  }

  function getLang() {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === "si" ? "si" : "en";
  }

  function setLang(lang) {
    localStorage.setItem(STORAGE_KEY, lang === "si" ? "si" : "en");
    applyI18n();
    document.dispatchEvent(new CustomEvent("iocpr:lang", { detail: { lang: getLang() } }));
  }

  function t(key) {
    const lang = getLang();
    return get(DICT[lang], key) ?? get(DICT.en, key) ?? null;
  }

  function applyI18n(root = document) {
    const lang = getLang();
    document.documentElement.lang = lang === "si" ? "si" : "en";

    root.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      const attr = el.getAttribute("data-i18n-attr");
      const val = key ? t(key) : null;
      if (!val) return;
      if (attr) el.setAttribute(attr, val);
      else el.textContent = val;
    });

    // update any active language toggles
    root.querySelectorAll("[data-lang-toggle]").forEach((btn) => {
      const btnLang = btn.getAttribute("data-lang-toggle");
      btn.setAttribute("aria-pressed", String(btnLang === lang));
      btn.classList.toggle("active", btnLang === lang);
    });
  }

  window.IOCPR_I18N = { t, getLang, setLang, applyI18n };
})();

