# Island Integration — GitHub Pages Only

You don't need to run anything locally. Just upload this repository to GitHub and it will deploy automatically.

## 1) Create repo
- Name it **Island-Integration** (or change `vite.config.ts` base if you pick a different name).

## 2) Upload
- Click **Add file → Upload files** in your repo on GitHub.
- Drag all files/folders from this zip (keep the structure).
- Commit to the **main** branch.

## 3) Enable Pages
- Repo **Settings → Pages** → set **Source** to **GitHub Actions** (one-time).

## 4) Watch the deploy
- Go to **Actions → Deploy to GitHub Pages** → watch **build** then **deploy** finish.
- Your site will be at: `https://<your-username>.github.io/Island-Integration/`

## Notes
- Logo path is GH Pages safe and theme-aware.
- Book a Consultation uses a `mailto:` link, which works on GitHub Pages.
- To change repo name, update `vite.config.ts` → `base: "/<YOUR_REPO_NAME>/"`.
