# Island Integration — GitHub Pages Starter

## Dev
```bash
npm ci
npm run dev
```

## Build
```bash
npm run build
npm run preview
```

## Deploy to GitHub Pages
1. Replace `YOUR_REPO_NAME` in `vite.config.ts` with your repo name.
2. Commit and push to `main`.
3. In GitHub, go to **Settings → Pages** and set **Source** to "GitHub Actions".

### Logo
- Put your logo file at `public/logo.png`.
- Code uses `${import.meta.env.BASE_URL}logo.png` so paths work on GitHub Pages.
