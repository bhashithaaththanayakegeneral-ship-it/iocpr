# IOCPR Website — User Guide

Guide for updating the public website using the WordPress media library.

The website reads images live from:

`https://iocpr.com/wp-json/wp/v2/media`

You do **not** need to edit website code to add photos. Upload in WordPress, set the **Alternative Text**, and refresh the site.

---

## 1. Alt text format (important)

Use this pattern every time you upload an image:

```text
Project Name | where
```

| Part | Meaning | Required? |
|------|---------|-----------|
| **Project Name** | Groups the photo under that project | Yes (for Projects page) |
| **\| where** | Extra placement flags | Optional |

### Placement flags

| Flag | Meaning |
|------|---------|
| `home` | Can appear on the **Home** page |
| `hero` | Preferred for the **Home hero / large featured** photo |

You can combine flags:

```text
Youth Shield | home | hero
```

---

## 2. Examples

| Alternative Text | Gallery | Projects | Home |
|------------------|---------|----------|------|
| `Youth Shield` | Yes | Youth Shield carousel | No |
| `Youth Shield \| home` | Yes | Youth Shield carousel | Yes |
| `Youth Shield \| home \| hero` | Yes | Youth Shield carousel | Yes (preferred hero) |
| `Safe Communities Initiative \| home` | Yes | That project | Yes |
| *(empty)* | Yes | No | No |

### Good project names (keep spelling consistent)

- `Safe Communities Initiative`
- `Second Chance Skills`
- `Youth Shield`
- `Justice Access Clinics`
- `Community Leaders Academy`
- `Policy & Insight Lab`

Use the **exact same** name for every photo in that project.

---

## 3. How to upload in WordPress

1. Log in to WordPress admin (`wp-admin`).
2. Go to **Media → Add New**.
3. Upload your photo(s).
4. Click the image → find **Alternative Text**.
5. Enter the alt using the format above.
6. Click **Update** / Save.
7. Open the website and hard-refresh (Ctrl/Cmd + Shift + R).

### Editing an existing image

1. **Media → Library**
2. Click the image
3. Change **Alternative Text**
4. Update / Save
5. Refresh the website

---

## 4. Where images appear on the site

### Gallery page (`/gallery`)
- Shows real IOCPR programme photos
- Hides old theme/demo stock images
- Does not require special flags (project name optional)

### Projects page (`/projects`)
- Groups photos by the **project name** (text before `|`)
- Each project shows a **photo carousel** (swipe / prev–next)
- Images with empty or generic alt are **not** listed as a project

### Home page (`/`)
- Uses photos tagged with `home`
- Prefers photos tagged `hero` for the main featured image
- Other `home` photos can fill supporting sections

---

## 5. Recommended upload checklist

For a new project photo:

- [ ] Image is clear and landscape-friendly when possible
- [ ] Alt starts with the correct **project name**
- [ ] Add `| home` if it should also show on the homepage
- [ ] Add `| hero` only for 1–2 best homepage hero images
- [ ] Spelling matches other photos in the same project
- [ ] Saved/updated in WordPress
- [ ] Website refreshed to confirm

---

## 6. Tips

- **One upload, many pages** — set flags in Alt so the same photo can feed Gallery, Projects, and Home.
- **Don’t put long stories in Alt** — keep Alt short (name + flags). Put longer captions in WordPress Caption/Description if needed later.
- **Avoid WhatsApp default names as Alt** — replace titles like `WhatsApp Image 2026-03-18...` with a real project name.
- **Hero images** — pick only the strongest 1–2 photos for `| home | hero`.
- **If a project carousel is empty** — check that several images share the same project name spelling.

---

## 7. Quick copy-paste templates

```text
Youth Shield
Youth Shield | home
Youth Shield | home | hero

Safe Communities Initiative
Safe Communities Initiative | home

Second Chance Skills | home
Justice Access Clinics | home
Community Leaders Academy | home
Policy & Insight Lab | home
```

---

## 8. Need help?

If photos don’t show after upload:

1. Confirm Alt Text was saved
2. Hard-refresh the website
3. Confirm the file is a normal image (JPG/PNG/WebP)
4. Wait a minute and refresh again (API cache)

For website code / hosting questions, contact the site maintainer.
