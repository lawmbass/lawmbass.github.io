---
name: verify-portfolio
description: "Drive the Lawrence M. Bass portfolio, a prerendered Vite + React page, in a browser and prove the hero, client work, side projects, experience, skills, and contact behavior. Use when changing the page, copy, layout, resume, prerender, or the verify-site and shots scripts, and before trusting a GitHub Pages preview."
---

# Verify the Lawrence M. Bass portfolio

The primary surface is one prerendered page. Visitors scroll it, follow in-page links, copy the email address, and open the resume PDF. There is no account, no database, and no API. `npm run dev` (Vite on port 5173) serves an empty `#root` until the client bundle runs. Verification drives the production surface: `npm run build` inlines the React render into `dist/index.html`, and `vite preview` serves that folder the way GitHub Pages serves it.

GitHub Pages updates only when `.github/workflows/deploy.yml` runs on a push to `main`. Merging a pull request publishes the site. Verify against the local preview.

Playwright is not a project dependency. The scripts resolve it the same way as `scripts/verify-site.mjs`: `playwright`, then `playwright-core`, then `PW_PATH` or `/tmp/pw/node_modules/playwright-core`. Install it once per machine:

```bash
npm install --prefix /tmp/pw playwright
```

`google-chrome` is used when it is installed. Otherwise install Playwright's Chromium: `npx --prefix /tmp/pw playwright install chromium`.

## Launch

From the repo root, with dependencies installed:

```bash
npm ci
.cursor/skills/verify-portfolio/scripts/launch.mjs
```

There is no data directory, migration, or seed. A clean checkout has no `dist/`. `launch.mjs` runs `npm run build` (typecheck, client build, SSR bundle, `scripts/prerender.mjs`) and then starts `vite preview`. The preview is usable when `doctor.mjs` would print `worth_driving: yes`: HTTP 200, `text/html`, a prerendered `<h1 id="hero-title">`, the portfolio title, the canonical URL `https://lawmbass.github.io/`, no phone-shaped number in that HTML, and the recorded pid still listening.

`launch.mjs` prints `ready: yes` only after those checks pass. It also prints `base`, `pid`, `evidence`, and `log`.

Environment:

| Variable | Default | Role |
| --- | --- | --- |
| `RUN_ID` | `local` | Names this instance. State and evidence live under `/tmp/verify-portfolio/$RUN_ID` unless overridden. |
| `PORT` | `4173` | Preview port. Vite is started with `--strictPort`, so a taken port fails the launch instead of moving. |
| `HOST` | `127.0.0.1` | Bind address. `base` is `http://$HOST:$PORT/`. |
| `SKIP_BUILD` | unset | `SKIP_BUILD=1` serves the current `dist/` only when that file is already prerendered. It does not skip the server. A stale `dist/` is a stale site. |
| `VERIFY_ROOT` | `/tmp/verify-portfolio/$RUN_ID` | Parent of `state/` and, unless `VERIFY_OUT` is set, `evidence/`. |
| `VERIFY_OUT` | `$VERIFY_ROOT/evidence` | Proof files. Cleanup never deletes this directory. |
| `PRIVATE_DIGITS` | unset | Optional digit string that must not appear in the HTML. Doctor reports `present` or `clear` and does not print the value. Never commit it. |

A second instance needs its own `RUN_ID` and `PORT`. The two processes do not share memory or a database. `scripts/shots.mjs` defaults to `http://localhost:4173/`, so the instance that shots should photograph keeps port 4173. Launch refuses to start when this `RUN_ID` already has a live preview. After a source change, run cleanup, then launch again so the preview is not an old build.

There is no dry-run. `SKIP_BUILD=1` still serves files and still accepts browser traffic. `doctor.mjs` only reads. `drive.mjs`, `scripts/verify-site.mjs`, and `scripts/shots.mjs` always open a browser.

Teardown is `cleanup.mjs` in the next section. Stop the preview you started before leaving the checkout.

## Doctor

```bash
.cursor/skills/verify-portfolio/scripts/doctor.mjs
```

Run this first whenever a drive looks wrong. It GETs the recorded base URL with a cache-busting query and `redirect: manual`, reads `/proc` for the recorded pid, and prints one line per fact. Exit 0 and `worth_driving: yes` means the pid is the `vite preview` this launch started, that process owns the port, and the HTML is the prerendered portfolio. Anything else exits 1. Doctor does not click, type, write screenshots, or start a browser.

Drive nothing when `worth_driving` is `no`. Do not point doctor at an arbitrary URL. `scripts/verify-site.mjs` is the read-only content pass that can take another `BASE`, including `https://lawmbass.github.io/`.

## Drive

Prefer the feature map in `features/` and the drive script. Stable handles are roles, accessible names, and these ids: `#top`, `#hero-title`, `#main`, `#work`, `#side-projects`, `#experience`, `#skills`, `#contact`.

Primary navigation is the landmark named `Primary`:

- `Work` → `#work`
- `Projects` → `#side-projects`
- `Experience` → `#experience`
- `Contact` → `#contact`
- `Resume` → `./Lawrence_Bass_Resume.pdf`

There is no `Skills` link. `#skills` is reached by scrolling past Experience or by opening the hash. The logo link's accessible name is `Lawrence M. Bass, back to top` and its href is `#top`. The first Tab stop is the link `Skip to content` (`href="#main"`).

Headings use a U+2019 apostrophe in `Things I’ve built` and `Where I’ve worked`. Kickers use a U+2014 em dash (`01 — Work` through `05 — Contact`). Experience dates use a U+2013 en dash. The timeline middot is U+00B7. An ASCII apostrophe or hyphen will not match.

`html { scroll-behavior: smooth }` and `scroll-padding-top: 84px`. After a hash click, wait until the target heading's top is below the sticky bar (64px, background `rgba(7, 7, 13, 0.94)`), not merely until `location.hash` changes.

The Copy email button is in the prerendered HTML and does nothing until React hydrates. `drive.mjs` waits for `networkidle` and for a React root key on `#root` before it clicks. The button's accessible name is `Copy email`, then `Copied ✓` plus the polite live text `Email address copied to clipboard`. The copied label lasts two seconds. Read the clipboard and take the result screenshot inside that window.

Clipboard proof grants `clipboard-read` and `clipboard-write` on the preview origin so the page's real `navigator.clipboard.writeText` runs. Do not stub `writeText`, do not call `navigator.clipboard` from the test in place of the button, and do not fulfill routes. A click that navigates to `mailto:` took the failure path in `CopyEmail`. That is a failed copy, not a pass.

Opening the resume in Chrome also requests `/favicon.ico`. The drive ignores that 404. The page icon is `favicon.svg`.

Do not click `mailto:` links (`mailto:lawmbass1@gmail.com`). Assert the href. Do not follow `Live site` links. They are `target="_blank"` `rel="noopener noreferrer"` to other production sites. Assert href, target, and rel, and assert that the drive saw no request to another http(s) origin.

```bash
.cursor/skills/verify-portfolio/scripts/drive.mjs contact
.cursor/skills/verify-portfolio/scripts/drive.mjs contact --step copy
```

One feature, or one `--step`, per invocation. Each step loads a fresh page. Step ids are the sub-feature ids in `features/`. The script exits 1 when doctor is unhealthy, a check fails, the page logs an error, a response is 400 or above, or a request leaves the preview origin (browser-internal `data:`, `blob:`, `chrome:`, and `chrome-extension:` URLs are ignored).

The broad contract, after a content or layout change, is still the existing Playwright script. It checks hero copy, the four Booz Allen cards, side-project order, meta tags, the 1200×630 PNG, the resume PDF bytes, phone-number absence in HTML and JS/CSS bundles, first-paint opacity, overflow, nav reachability, and 44px targets at desktop 1280, phone 390, phone 360, and reduced motion:

```bash
BASE=http://127.0.0.1:4173/ SHOTS="$RUN_ID" OUT="${VERIFY_OUT:-/tmp/verify-portfolio/${RUN_ID:-local}/evidence}/verify-site" \
  node scripts/verify-site.mjs
```

Screenshots of desktop, phone, and reduced motion, including the side-projects section and the skip-link focus ring:

```bash
BASE=http://127.0.0.1:4173/ OUT="${VERIFY_OUT:-/tmp/verify-portfolio/${RUN_ID:-local}/evidence}/shots" \
  node scripts/shots.mjs
```

`shots.mjs` exits 1 on a console or page error, a request to another origin, a missing `#side-projects`, content still hidden after the scroll, a first Tab target other than `Skip to content`, or horizontal overflow. It prints CSS warnings and does not fail on them. Default `BASE` remains `http://localhost:4173/` when the preview was bound so that host answers.

`node scripts/og-image.mjs` rewrites the committed file `public/og-image.png`. Verification does not run it. `verify-site.mjs` fetches the served PNG and checks the IHDR dimensions.

## Evidence

Proof for a drive lands in `$VERIFY_OUT/<feature>/` (default `/tmp/verify-portfolio/local/evidence/<feature>/`):

- `transcript.txt` — every PASS/FAIL line
- `result.json` — feature, base URL, step results, timestamps
- `<step>.png` and `<step>.aria.txt` — viewport after the step, plus the document title, the h1, and the `main` accessibility tree
- `contact/before.png` — Contact in view, button still `Copy email`
- `contact/after.png` — the same view after the click, button reading `Copied ✓`
- `contact/copy.aria.txt` — title, h1, and the contact region while the button reads `Copied`
- `hero/skip-focus.png` — keyboard focus on `Skip to content`
- `hero/resume.png` — the browser after it opened the resume URL. The `%PDF` check is a second read of that URL, because Chrome's viewer replaces the response body with an HTML shell.

`result.json` for the resume step records status, content-type, byte length, and `pdfText`. `pdfText` is `clear` or `present` when `pdftotext` is on `PATH` (the digit string is not written down). `pdfText: skipped` means the phone-free claim for the PDF body was not checked. The `%PDF` magic and `application/pdf` content-type were still checked. `verify-site.mjs` copies the PDF bytes to `/tmp/<SHOTS>-resume.pdf` and does not extract text.

A contact pass is the click, the new button label, the live region, and two clipboard reads of `lawmbass1@gmail.com` (the second after focus leaves the button). A screenshot of the finished page without the click is not that proof.

`verify-site.mjs` writes `<SHOTS>-<viewport>-hero.png` and `<SHOTS>-<viewport>-full.png`. `shots.mjs` writes `<name>-hero.png`, `<name>-full.png`, `<name>-side-projects.png`, and `<name>-focus-skip.png`. Point `OUT` at the evidence directory when those files are the proof. The default `shots/` directory is gitignored.

## Cleanup

```bash
.cursor/skills/verify-portfolio/scripts/cleanup.mjs
```

This kills the preview pid recorded for `RUN_ID`, and a Chrome pid only if `drive.mjs` was interrupted before it closed its browser. A pid is signaled only when `/proc/<pid>/cmdline` is that `vite preview` or Chrome. The state directory is removed. The evidence directory is left in place. `dist/` is left in place. Cleanup does not kill by process name and does not touch another `RUN_ID`.

After cleanup, doctor must print `worth_driving: no`, and the evidence files from the drive must still be on disk.

## Helpers

Shipped scripts are executable. Run them from the repo root. `--help` prints the same usage.

```bash
.cursor/skills/verify-portfolio/scripts/launch.mjs
.cursor/skills/verify-portfolio/scripts/doctor.mjs
.cursor/skills/verify-portfolio/scripts/drive.mjs contact
.cursor/skills/verify-portfolio/scripts/drive.mjs <feature> --step <id>
.cursor/skills/verify-portfolio/scripts/cleanup.mjs
```

Repo scripts the skill builds on:

```bash
node scripts/verify-site.mjs
# BASE defaults to http://localhost:4173/
# SHOTS defaults to local-v2, OUT defaults to shots/
# PRIVATE_DIGITS, if set, must not occur in the HTML and is not printed as a required value

node scripts/shots.mjs
# BASE defaults to http://localhost:4173/
# OUT defaults to shots/

node scripts/og-image.mjs
# writes public/og-image.png; not part of a verification run
```

`scripts/lib.mjs` next to the shipped commands is imported by them. It is not a command.

## Upkeep

When the page or these checks drift, run `/maintain-verification-skill`. It re-reads the feature map and drives the features. Update the map from a failure you reproduced. Do not loosen a journey to make it pass.
