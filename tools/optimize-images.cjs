#!/usr/bin/env node
/**
 * Island Integration — image pipeline
 *
 * Usage (from the repository root):
 *   npm install --no-save sharp        # one-time, dev only
 *   node tools/optimize-images.cjs
 *
 * What it does
 *  1. Caps oversized source JPEGs in place (e.g. 9504px wide -> 2400px).
 *  2. Writes responsive WebP variants next to each source: name-<width>.webp
 *  3. Rebuilds the logo, favicon and touch icon from public/logo-source.png
 *     (only if that file exists) or from the existing public/logo.png.
 *  4. Builds 1200x630 social-share (Open Graph) images in public/og/.
 *
 * It is safe to re-run: files already within their size caps are left alone.
 * Generated variants (*-480.webp etc.) are never used as inputs.
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = path.resolve(__dirname, '..');
const PUB = path.join(ROOT, 'public');

/** [directory, { cap: max width of the JPEG fallback, widths: WebP widths, q: quality }] */
const GROUPS = [
  ['services', { cap: 1200, widths: [480, 960], q: 78 }],
  ['partners', { cap: 640, widths: [320], q: 84, trim: true }],
  ['blog', { cap: 1600, widths: [640, 1200], q: 78 }],
];
const SINGLES = [
  ['about-hero.jpg', { cap: 2400, widths: [800, 1280, 1920, 2400], q: 72 }],
  ['blog-hero-poster.jpg', { cap: 1600, widths: [800, 1487], q: 74 }],
];

const kb = (f) => (fs.statSync(f).size / 1024).toFixed(0) + 'KB';

async function processJpeg(file, { cap, widths, q, trim }) {
  if (trim) {
    // logos ship with large white margins; trim them so they fill their tile
    const t = await sharp(file).trim({ threshold: 14 }).extend({ top: 10, bottom: 10, left: 14, right: 14, background: '#ffffff' }).jpeg({ quality: 92, mozjpeg: true }).toBuffer();
    fs.writeFileSync(file, t);
  }
  const meta = await sharp(file).metadata();
  const base = file.replace(/\.jpe?g$/i, '');
  const before = fs.statSync(file).size;

  // 1. cap the fallback JPEG in place (only when needed)
  if (meta.width > cap || before > 450 * 1024) {
    const buf = await sharp(file)
      .rotate()
      .resize({ width: Math.min(meta.width, cap), withoutEnlargement: true })
      .jpeg({ quality: q + 4, mozjpeg: true, progressive: true })
      .toBuffer();
    if (buf.length < before) fs.writeFileSync(file, buf);
  }

  // 2. responsive WebP variants (never upscale)
  const finalMeta = await sharp(file).metadata();
  const usable = widths.filter((w) => w <= finalMeta.width);
  // also emit the native width when the source sits well between two breakpoints,
  // so high-density screens are not served a needlessly small image
  const top = usable.length ? Math.max(...usable) : 0;
  const list = usable.length ? usable.slice() : [finalMeta.width];
  if (usable.length && finalMeta.width - top > 150) list.push(finalMeta.width);
  for (const w of list) {
    await sharp(file)
      .resize({ width: w, withoutEnlargement: true })
      .webp({ quality: q, effort: 6 })
      .toFile(`${base}-${w}.webp`);
  }
  console.log(
    path.relative(ROOT, file).padEnd(38),
    `${meta.width}px ${(before / 1024).toFixed(0)}KB -> ${finalMeta.width}px ${kb(file)}`,
    '| webp:', list.join(',')
  );
}

async function logos() {
  const src = fs.existsSync(path.join(PUB, 'logo-source.png'))
    ? path.join(PUB, 'logo-source.png')
    : path.join(PUB, 'logo.png');
  const meta = await sharp(src).metadata();
  if (meta.width > 1200) {
    // keep a 1200px master only when the source is huge
    const master = await sharp(src).resize({ width: 1200 }).png({ compressionLevel: 9, palette: true, quality: 90 }).toBuffer();
    fs.writeFileSync(path.join(PUB, 'logo.png'), master);
  }
  const logo = path.join(PUB, 'logo.png');
  for (const w of [240]) {
    await sharp(logo).resize({ width: w }).png({ compressionLevel: 9, palette: true, quality: 90 }).toFile(path.join(PUB, `logo-${w}.png`));
  }
  // icon: the gear-and-rooftops mark (top ~68% of the wordmark lockup)
  const m = await sharp(logo).metadata();
  const markH = Math.round(m.height * 0.69);
  const mark = await sharp(logo).extract({ left: Math.round(m.width * 0.16), top: 0, width: Math.round(m.width * 0.68), height: markH }).toBuffer();
  const icon = async (size, bg, file, opts = {}) => {
    const inner = await sharp(mark)
      .resize({ width: Math.round(size * 0.9), height: Math.round(size * 0.9), fit: 'inside' })
      .toBuffer();
    await sharp({ create: { width: size, height: size, channels: 4, background: bg } })
      .composite([{ input: inner, gravity: 'center' }])
      .png({ compressionLevel: 9, ...opts })
      .toFile(path.join(PUB, file));
  };
  const clear = { r: 255, g: 255, b: 255, alpha: 0 };
  await icon(512, clear, 'icon-512.png');
  await icon(192, clear, 'icon-192.png');
  await icon(32, clear, 'favicon-32.png');
  await icon(180, { r: 255, g: 255, b: 255, alpha: 1 }, 'apple-touch-icon.png');
  console.log('logo + icons written');
}

async function og(name, srcFile, { position = 'attention' } = {}) {
  fs.mkdirSync(path.join(PUB, 'og'), { recursive: true });
  const out = path.join(PUB, 'og', `${name}.jpg`);
  const meta = await sharp(srcFile).metadata();
  const W = 1200, H = 630;
  if (meta.width >= W * 0.9) {
    await sharp(srcFile).resize(W, H, { fit: 'cover', position }).jpeg({ quality: 80, mozjpeg: true }).toFile(out);
  } else {
    // small source: blurred cover backdrop + sharp contained foreground
    const bg = await sharp(srcFile).resize(W, H, { fit: 'cover' }).blur(28).modulate({ brightness: 0.8 }).toBuffer();
    const fg = await sharp(srcFile).resize({ height: Math.round(H * 0.8), width: Math.round(W * 0.8), fit: 'inside' }).toBuffer();
    await sharp(bg).composite([{ input: fg, gravity: 'center' }]).jpeg({ quality: 82, mozjpeg: true }).toFile(out);
  }
  console.log('og/' + name + '.jpg', kb(out));
}

(async () => {
  for (const [dir, cfg] of GROUPS) {
    const d = path.join(PUB, dir);
    for (const f of fs.readdirSync(d).filter((f) => /\.jpe?g$/i.test(f)).sort()) await processJpeg(path.join(d, f), cfg);
  }
  for (const [f, cfg] of SINGLES) await processJpeg(path.join(PUB, f), cfg);
  await logos();
  await og('home', path.join(PUB, 'about-hero.jpg'), { position: 'attention' });
  await og('about', path.join(PUB, 'about-hero.jpg'), { position: 'left' });
  await og('blog', path.join(PUB, 'blog-hero-poster.jpg'), { position: 'centre' });
  await og('ocean-club-core3', path.join(PUB, 'blog/ocean-club-core3.jpg'));
  await og('wireless-access-point', path.join(PUB, 'blog/wireless-access-point.jpg'));
  await og('home-cinema-ideas', path.join(PUB, 'blog/home-cinema-ideas.jpg'));
  await og('smart-home-basics', path.join(PUB, 'blog/smart-home-basics.jpg'));
  await og('tv-wall-mounting', path.join(PUB, 'blog/tv-wall-mounting.jpg'));
  await og('hurricane-season-smart-home', path.join(PUB, 'blog/hurricane-season-smart-home.jpg'));
  await og('backup-power-smart-home', path.join(PUB, 'blog/backup-power-smart-home.jpg'));
  await og('salt-air-humidity-electronics', path.join(PUB, 'blog/salt-air-humidity-electronics.jpg'));
  await og('wifi-concrete-homes', path.join(PUB, 'blog/wifi-concrete-homes.jpg'));
  await og('lighting-control-guide', path.join(PUB, 'blog/lighting-control-guide.jpg'));
  await og('cooling-costs-smart-climate', path.join(PUB, 'blog/cooling-costs-smart-climate.jpg'));
  await og('security-cameras-second-home', path.join(PUB, 'blog/security-cameras-second-home.jpg'));
  await og('outdoor-audio-patio-pool', path.join(PUB, 'blog/outdoor-audio-patio-pool.jpg'));
  await og('new-build-prewire-checklist', path.join(PUB, 'blog/new-build-prewire-checklist.jpg'));
  await og('professional-vs-diy-smart-home', path.join(PUB, 'blog/professional-vs-diy-smart-home.jpg'));
  await og('smart-shades-heat-uv', path.join(PUB, 'blog/smart-shades-heat-uv.jpg'));
})().catch((e) => { console.error(e); process.exit(1); });
