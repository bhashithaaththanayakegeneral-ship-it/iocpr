# IOCPR — Website

Modern, responsive website for the **International Organization for Crime Prevention and Rehabilitation (IOCPR)**.

- **Frontend:** plain HTML + CSS + vanilla JavaScript — no build step.
- **Backend (headless CMS):** the existing WordPress site at `https://iocpr.com` via its public REST API.
- **Hosting:** Vercel (static).

> _“A Hand to Reform, A World Without Crime.”_

**Content editors:** see [`USER_GUIDE.md`](USER_GUIDE.md) for how to upload images in WordPress and set Alt Text so photos appear in Gallery, Projects, and Home.

---

## Project structure

```
iocpr-web/
├── USER_GUIDE.md         # How to upload & tag images in WordPress
├── index.html            # Home
├── about.html            # Mission, vision, pillars, values
├── programs.html         # The six core programmes
├── projects.html         # Featured initiatives
├── impact.html           # How impact is measured
├── gallery.html          # Live photo gallery (WordPress media)
├── news.html             # Live news feed (WordPress posts)
├── get-involved.html     # Volunteer / partner / fundraise
├── donate.html           # Donation form
├── contact.html          # Contact form + map
├── 404.html              # Not-found page
├── vercel.json           # Clean URLs, caching & security headers
└── assets/
    ├── css/styles.css    # Full design system
    └── js/
        ├── config.js     # Site config + WordPress base URL
        ├── wp.js         # WordPress REST client (posts, media, pages)
        ├── ui.js         # Shared header/footer, nav, reveal, counters
        ├── news.js       # Renders posts into [data-news] grids
        ├── gallery.js    # Renders media into the [data-gallery] masonry + lightbox
        └── forms.js      # Contact / volunteer / donate form handling
```

The header and footer are injected by `ui.js` into the `#site-header` / `#site-footer`
placeholders, so the navigation stays consistent across every page — edit it in one place.

---

## How the WordPress backend is used

Dynamic sections load live from WordPress so the team can manage them in `wp-admin`:

| Section | Source endpoint |
|---------|-----------------|
| News & Highlights | `GET /wp-json/wp/v2/posts` |
| Gallery | `GET /wp-json/wp/v2/media?media_type=image` |
| (optional) page prose | `GET /wp-json/wp/v2/pages?slug=…` |

All requests are read-only and fail gracefully — if the API is unreachable the
section shows a friendly placeholder instead of breaking the page.

To point the site at a different WordPress install, edit one line in
[`assets/js/config.js`](assets/js/config.js):

```js
WP_BASE: "https://iocpr.com/wp-json",
```

### CORS
The IOCPR WordPress install already sends CORS headers, so the browser can fetch
the REST API cross-origin. If you move to a WordPress host that blocks this, add
to the theme's `functions.php`:

```php
add_action('rest_api_init', function () {
  remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
  add_filter('rest_pre_serve_request', function ($value) {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET');
    return $value;
  });
});
```

---

## Run locally

No build needed — just serve the folder over HTTP (opening `file://` will block `fetch`):

```bash
cd iocpr-web
python3 -m http.server 5500
# then open http://localhost:5500
```

---

## Deploy to Vercel

1. Push this folder to a Git repository (GitHub/GitLab/Bitbucket).
2. In Vercel, **New Project → Import** the repo.
3. Framework preset: **Other**. Leave build command empty; output directory `.`.
4. Deploy. `vercel.json` enables clean URLs (`/about` instead of `/about.html`),
   long-term caching for assets, and basic security headers.

Or from the CLI:

```bash
npm i -g vercel
vercel        # preview
vercel --prod # production
```

---

## Forms

`forms.js` currently shows a confirmation client-side (no data is sent yet). To make
the contact / volunteer / donate forms deliver real submissions, wire the `submit`
handler in [`assets/js/forms.js`](assets/js/forms.js) to one of:

- a WordPress form plugin REST endpoint (Contact Form 7, WPForms, Fluent Forms), or
- a serverless function / form service (Vercel Functions, Formspree, etc.).

For real donations, connect the donate form to a payment provider (Stripe, PayHere, etc.).
