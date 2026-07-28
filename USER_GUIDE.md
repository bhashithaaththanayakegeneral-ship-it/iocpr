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
BMICH 27 July | home | hero
```

---

## 2. Examples

| Alternative Text | Gallery | Projects | Home | Hero slider |
|------------------|---------|----------|------|-------------|
| `Kolonna` | Yes | Community Policing Workshop | No | No |
| `Negombo \| home` | Yes | Crime Prevention Awareness Workshop | Yes | No |
| `BMICH 27 July \| home \| hero` | Yes | Membership Workshop | Yes | Yes |
| *(empty)* | Yes | No | No | No |

### Good project names (keep spelling consistent)

- `BMICH 27 July` *(Special Membership Development Workshop)*
- `Kolonna` *(Community Policing Workshop)*
- `Negombo` *(Crime Prevention Awareness Workshop)*
- `Sambuddha Jayanthi` *(Crime Prevention and Rehabilitation Training Workshop)*
- `BMICH Recognition` *(Grand Recognition Ceremony)*
- `Dehiovita` *(Domestic Violence Prevention Awareness Workshop)*
- `Lakma Medura` *(Crime Prevention Training Workshop)*

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
- Uses photos tagged with `home` for supporting sections
- **Hero slider shows only photos tagged `hero`** (e.g. `Project Name | home | hero`)
- Photos with only `| home` do **not** appear in the hero

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

## 7. Alt text variations (copy-paste)

Use **exactly** one of these in WordPress **Alternative Text**.

### Format
```text
Project Name
Project Name | home
Project Name | home | hero
```

| Alt text | Gallery | Projects | Home | Hero slider |
|----------|---------|----------|------|-------------|
| `Project Name` | Yes | Yes | No | No |
| `Project Name \| home` | Yes | Yes | Yes | Possible |
| `Project Name \| home \| hero` | Yes | Yes | Yes | Preferred |

---

### Special Membership Development Workshop
Card title on the site. For photos, use the short Alt:

```text
BMICH 27 July
BMICH 27 July | home
BMICH 27 July | home | hero
```

### Community Policing Workshop
```text
Kolonna
Kolonna | home
Kolonna | home | hero
```

### Crime Prevention Awareness Workshop
```text
Negombo
Negombo | home
Negombo | home | hero
```

### Crime Prevention and Rehabilitation Training Workshop
```text
Sambuddha Jayanthi
Sambuddha Jayanthi | home
Sambuddha Jayanthi | home | hero
```

### Grand Recognition Ceremony
```text
BMICH Recognition
BMICH Recognition | home
BMICH Recognition | home | hero
```

### Domestic Violence Prevention Awareness Workshop
```text
Dehiovita
Dehiovita | home
Dehiovita | home | hero
```

### Crime Prevention Training Workshop
```text
Lakma Medura
Lakma Medura | home
Lakma Medura | home | hero
```

---

### Which one to use?

| Goal | Use this |
|------|----------|
| Project carousel only (+ Gallery) | `Project Name` |
| Also show on Home | `Project Name \| home` |
| Best photo for Home hero slider | `Project Name \| home \| hero` |

Use `| home | hero` on only **1–2** strongest photos.

---

## 8. Need help?

If photos don’t show after upload:

1. Confirm Alt Text was saved
2. Hard-refresh the website
3. Confirm the file is a normal image (JPG/PNG/WebP)
4. Wait a minute and refresh again (API cache)

For website code / hosting questions, contact the site maintainer.
