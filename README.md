# Island Integration — GitHub Pages (White Theme Only)

This bundle is ready for GitHub-only testing. No local tooling is required.

## Steps
1) Create a repo (ideally **Island-Integration**).
2) Upload all files/folders from this ZIP and commit to **main**.
3) Settings → **Pages** → Source: **GitHub Actions** (one-time).
4) Actions → watch **Deploy to GitHub Pages** finish.
5) Site URL: `https://<your-username>.github.io/Island-Integration/`

## Logo
- Put your light-on-white version at: `public/logo-light.png`
- The code references `logo-light.png` only (no dark theme).

If your repo name differs, edit `vite.config.ts` → `base: "/<YOUR_REPO_NAME>/"`.
