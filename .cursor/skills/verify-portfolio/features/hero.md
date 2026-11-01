# Hero

The hero is the first screen: Lawrence M. Bass's name, the role, the summary, the code card on a wide window, and the actions See my work, Resume (PDF), and Email me. The sticky bar and the skip link are part of this visit.

## Sub-features

- `land` shows the name, eyebrow, headline, summary, code card, navigation, and footer, with nothing above the fold faded or blurred.
- `see-work` scrolls to Client work from the hero button.
- `back-to-top` returns from Work to the name through the LB mark.
- `skip` moves keyboard focus to Skip to content and activates it.
- `resume` opens the hero Resume (PDF) link and receives a PDF.
- `phone` hides the code card at 390px and keeps Resume inside the viewport.
- `reduced-motion` collapses the background animation and does not mark content `will-reveal`.

## How to get to it (user POV)

- Open the site root.
- Choose `See my work`.
- Choose the `LB` mark, announced as Lawrence M. Bass, back to top.
- Press Tab, then activate `Skip to content`.
- Choose `Resume (PDF)` in the hero, or `Resume` in the bar.
- Choose `Email me` in the hero. The mail client is the destination; verification stops at the href.
- Narrow the window to a phone, or request reduced motion from the system.

## Driving it with verify-portfolio

Preconditions:

- Doctor prints `worth_driving: yes` for this `RUN_ID`.
- The preview base is the URL in the state file, default `http://127.0.0.1:4173/`.

- **Land.** Open the root. Run `.cursor/skills/verify-portfolio/scripts/drive.mjs hero --step land`. The heading `Lawrence M. Bass` is visible, the eyebrow reads `Open to senior frontend & full-stack roles`, the code card figure `Profile summary as a code snippet` is visible, the nav lists Work, Projects, Experience, Contact, and Resume, and the footer names Lawrence M. Bass.
- **See my work.** Choose `See my work`. Run `.cursor/skills/verify-portfolio/scripts/drive.mjs hero --step see-work`. The URL hash is `#work` and the heading `Client work` sits below the sticky bar.
- **Back to top.** From Work, choose the LB mark. Run `.cursor/skills/verify-portfolio/scripts/drive.mjs hero --step back-to-top`. The hash is `#top` and `#hero-title` sits below the sticky bar.
- **Skip link.** Press Tab, then Enter. Run `.cursor/skills/verify-portfolio/scripts/drive.mjs hero --step skip`. The focused control reads `Skip to content`, then the hash is `#main`. `skip-focus.png` shows the focus ring.
- **Resume.** Choose `Resume (PDF)` in the hero. Run `.cursor/skills/verify-portfolio/scripts/drive.mjs hero --step resume`. The browser navigates to the PDF URL and the click's network response is HTTP 200 with `application/pdf`. A second read of that same URL starts with `%PDF`. When `pdftotext` is installed, `pdf_text: clear` means the extracted text had no phone-shaped number.
- **Phone.** Open the root at 390×844. Run `.cursor/skills/verify-portfolio/scripts/drive.mjs hero --step phone`. The code card's computed display is `none`, the name is visible, and the Resume link's box stays inside the viewport after the nav is scrolled.
- **Reduced motion.** Open the root with reduced motion at 390×844. Run `.cursor/skills/verify-portfolio/scripts/drive.mjs hero --step reduced-motion`. `prefers-reduced-motion` matches, the grid animation duration is collapsed, and `.will-reveal` stays absent after a scroll.

The whole feature is `.cursor/skills/verify-portfolio/scripts/drive.mjs hero`.

## Gotchas

- `npm run dev` paints the hero only after JavaScript. Doctor rejects that server because `#root` is empty in the HTML.
- The early first-paint sample, taken before `networkidle`, is `node scripts/verify-site.mjs` (`desktop-1280`, `mobile-390`, `mobile-360`, `reduced-motion-390`). `drive.mjs hero --step land` samples again after hydration.
- The code card is `display: none` below 720px. A phone failure for a missing code card is the desktop step running at the wrong width.
- At 360–400px the nav scrolls inside the bar. The page itself should not grow a horizontal scrollbar. Resume is the last item.
- `Email me` is `mailto:lawmbass1@gmail.com`. Activating it opens the host mail client. The land step asserts the href.
- `pdftotext` missing prints `pdf_text: skipped`. That is not a clean bill of health for the PDF body. The `%PDF` check still ran.
- Chrome's built-in PDF viewer makes Playwright's `response.body()` a short HTML shell. The byte check reads the URL the click opened, which is the file the server sent.
- That viewer also requests `/favicon.ico`. The page links `favicon.svg`, so the ico 404 is the viewer, and the resume step does not count it.
- The background orbs are blurred and partly transparent. They sit in `.bg` and are excluded from the above-the-fold opacity probe. A blurred heading is a failure.
