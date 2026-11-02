# Island Integration website

Static site for <https://www.island-integration.com>, published with GitHub Pages
(custom domain in `CNAME`). No build step, no framework, no third-party scripts or fonts:
edit an HTML file and commit.

## Structure

| Path | Purpose |
| --- | --- |
| `index.html`, `about.html`, `blog.html`, `404.html` | Main pages |
| `posts/*.html` | Blog articles (URLs are indexed; do not rename without a redirect) |
| `assets/css/site.css` | The whole design system. Colours, type and spacing are tokens at the top |
| `assets/js/site.js` | Mobile menu, scroll reveal, hero video, contact form |
| `public/` | Images, logo, icons, hero video, social-share images (`public/og/`) |
| `sitemap.xml`, `robots.txt` | Search engine files |
| `tools/optimize-images.cjs` | Resizes images and builds WebP/icon/social images |

## Common tasks

**Add a blog post**
1. Copy an existing file in `posts/` and edit the title, description, canonical URL, Open Graph tags,
   JSON-LD (`datePublished`), the article text and the cover image.
2. Add a card for it in `blog.html` (copy an existing `<article class="post-card">`).
3. Add its URL to `sitemap.xml`.

**Add or replace an image**
1. Put the original JPEG in the right `public/` folder.
2. Run `npm install --no-save sharp` once, then `node tools/optimize-images.cjs`.
   It caps the JPEG, writes `name-480.webp`-style variants and a 1200x630 social image.
3. Reference it with `<picture>` like the existing images, always with `width`, `height` and `alt`.
   Never commit multi-megabyte originals; keep them outside the repository.

**Change the header, footer or phone/email**
The header and footer are repeated in each HTML file. Search for the old value across the repository
and change every occurrence. The phone number and email also appear in the JSON-LD on `index.html`.

## Contact form
GitHub Pages has no server, so the form builds an email in the visitor's mail app (`mailto:`).
To receive submissions without relying on the visitor's mail app, connect a form service
(for example Formspree, Basin or Web3Forms): create an account, then point the form's `action`
at the endpoint they give you. This needs your account, so it is not set up here.

## Quality checklist before publishing
- Every page has a unique `<title>`, `<meta name="description">`, canonical URL and one `<h1>`.
- Every image has `alt`, `width` and `height`.
- `sitemap.xml` lists every indexable page.
- Test on a phone-width window and with the keyboard only (Tab / Enter / Esc).
