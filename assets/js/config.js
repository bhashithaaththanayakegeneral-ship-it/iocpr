/* Global site configuration ------------------------------------------------
   The WordPress backend powers dynamic sections (News + Gallery) via the
   public REST API. Change WP_BASE to point at a different WordPress install. */
window.IOCPR = {
  WP_BASE: "https://iocpr.online/wp-json",
  /* Contact Form 7 — shortcode hash 8c4c6a1; REST API needs numeric post ID */
  CF7: {
    formId: "3626",
  },
  ORG: {
    name: "IOCPR",
    full: "International Organization for Crime Prevention and Rehabilitation",
    tagline: "A Hand to Reform, A World Without Crime.",
    email: "iocproffice@gmail.com",
    phone: "0770023624 / 0770023654",
    address: "Himbutana, Battaramulla, Sri Lanka",
    logo: "https://iocpr.online/wp-content/uploads/2026/07/IOCRP-scaled-1.png",
    founded: "2025",
    social: {
      facebook: "https://facebook.com/",
      instagram: "https://instagram.com/",
      linkedin: "https://linkedin.com/",
      youtube: "https://www.youtube.com/@iocprofficial",
    },
  },
};
