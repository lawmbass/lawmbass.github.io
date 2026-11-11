# Portfolio verification map

This directory is the maintained source for verifying the user-facing behavior of the Lawrence M. Bass portfolio. Read this index, then use the matching feature file as the recipe.

The page is one prerendered document. The sections are Work, Side projects, Experience, Skills, and Contact. Skills is on the page and out of the primary navigation.

## Baseline preconditions

- From the repo root, `npm ci` once, then `.cursor/skills/verify-portfolio/scripts/launch.mjs`.
- Leave `RUN_ID` at `local` and `PORT` at `4173` unless a second preview is already using them. A second preview gets its own `RUN_ID` and `PORT`.
- There is no database and no seed. The build writes the page into `dist/`.
- Run `.cursor/skills/verify-portfolio/scripts/doctor.mjs` and require `worth_driving: yes`.
- Drive only the preview this run started. Doctor reads that pid. It does not accept an arbitrary URL.
- Playwright comes from the environment (`playwright`, `playwright-core`, or `/tmp/pw/node_modules/playwright-core`). It is not in `package.json`.

## Driving conventions

- Start every recipe from the launched preview. `drive.mjs` loads a fresh page for each step.
- The command is `.cursor/skills/verify-portfolio/scripts/drive.mjs <feature>` or the same command with `--step <id>`.
- Prefer the role, accessible name, and id named in the feature file.
- Treat the command as literal. Keep the feature id and the step id unchanged.
- `node scripts/verify-site.mjs` is the copy, meta, asset, and viewport contract. `node scripts/shots.mjs` is the desktop, phone, and reduced-motion capture. Point `BASE` at the preview and `OUT` at the evidence directory when the files need to survive.
- `node scripts/og-image.mjs` rewrites `public/og-image.png`. A verification run does not execute it.
- Cleanup removes the preview process and the state directory. It does not remove proof files.

## Proof and skip reporting

- Capture the user action and the resulting state, not only the final screen.
- UI proof includes an accessibility snapshot and a screenshot that shows the page title or the person's name.
- The contact copy proof also includes two clipboard reads of `lawmbass1@gmail.com`.
- Record the feature id and the step id on the artifact. `drive.mjs` writes them into `result.json`.
- `pdfText: skipped` on the resume step means the PDF body was not scanned. Do not report that scan as passed.
- Report an unreachable path with the command and the unmet precondition. A different step does not cover it.

## Feature entry contract

Each feature file starts with an H1 and one paragraph, then four H2 sections in this order: `Sub-features`, `How to get to it (user POV)`, `Driving it with verify-portfolio`, and `Gotchas`.

## Features

- [Hero](./hero.md) covers the first screen, the primary navigation, skip link, resume PDF, phone width, and reduced motion.
- [Client work](./client-work.md) covers the four Booz Allen cards and the one-liners.
- [Side projects](./side-projects.md) covers the six products and their live-site links, without opening those sites.
- [Experience and skills](./experience-and-skills.md) covers the timeline, education, training, and the 14-skill toolkit.
- [Contact](./contact.md) covers the contact region, the mailto links, and copying the email address.
