# Lawrence M. Bass — Portfolio

Personal portfolio site. Vite + React + TypeScript, plain CSS, self-hosted variable fonts
(Space Grotesk, Inter, JetBrains Mono via @fontsource), no UI libraries, no external requests.

- `npm run dev` — local dev server
- `npm run typecheck` — TypeScript check
- `npm run build` — typecheck, client build, then prerender the page to static HTML (`dist/`)
- `npm run preview` — serve `dist/` locally
- `node scripts/og-image.mjs` — re-render `public/og-image.png` (1200×630) with Playwright
- `BASE=https://lawmbass.github.io/ SHOTS=live-v2 node scripts/verify-site.mjs` — check copy, meta,
  og image, resume PDF, phone-number absence, the 14 skills, first-paint visibility, overflow, and take screenshots

`public/Lawrence_Bass_Resume.pdf` is the resume with only the phone number removed. Keep it phone-free.

The build uses a relative base (`./`), so `dist/` works at a GitHub Pages user-site root or a
project subpath. `.github/workflows/deploy.yml` deploys `dist/` to GitHub Pages on push to `main`
(set Settings → Pages → Source to "GitHub Actions").
