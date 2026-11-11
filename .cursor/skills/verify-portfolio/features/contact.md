# Contact

Contact is the last section. It offers the email address, a button that copies that address, and a second Resume (PDF) link.

## Sub-features

- `nav` reaches the section from the primary nav and shows the hiring heading.
- `hash` opens `#contact` directly with the button still reading `Copy email`.
- `mailto` checks the address link, the Email me link, and the resume link, without activating them.
- `copy` chooses Copy email and leaves the address on the clipboard.

## How to get to it (user POV)

- Choose `Contact` in the primary navigation.
- Open the URL with the `#contact` hash.
- Choose the address `lawmbass1@gmail.com`, or `Email me`. Both are mailto links.
- Choose `Copy email`.
- Choose `Resume (PDF)` in this section. The file proof lives on the hero map; this section checks that the same href is here.

## Driving it with verify-portfolio

Preconditions:

- Doctor prints `worth_driving: yes` for this `RUN_ID`.
- The browser context may grant clipboard read and write for the preview origin. The page still calls `navigator.clipboard.writeText` itself.
- The address on the page is `lawmbass1@gmail.com`.

- **Nav.** Choose `Contact`. Run `.cursor/skills/verify-portfolio/scripts/drive.mjs contact --step nav`. The hash is `#contact`, the kicker is `05 — Contact`, the heading is `Hiring for a senior frontend or full-stack role?`, and the line `Email is the best way to reach me.` is visible.
- **Hash.** Open `#contact` in a new visit. Run `.cursor/skills/verify-portfolio/scripts/drive.mjs contact --step hash`. The heading is below the sticky bar and the button reads `Copy email`.
- **Mailto.** Read the links. Run `.cursor/skills/verify-portfolio/scripts/drive.mjs contact --step mailto`. The address link and `Email me` both use `mailto:lawmbass1@gmail.com`. The address link is at least 44px tall. `Resume (PDF)` points at `./Lawrence_Bass_Resume.pdf`.
- **Copy.** With the button in view, choose `Copy email`. Run `.cursor/skills/verify-portfolio/scripts/drive.mjs contact --step copy`. `before.png` shows `Copy email`. After the click the button reads `Copied ✓`, the polite live region reads `Email address copied to clipboard`, and the clipboard reads `lawmbass1@gmail.com`. `after.png` and `copy.aria.txt` show that state, including the page title. Focus then moves to the heading and a second clipboard read still returns the same address. The URL stays on the preview and on `#contact`.

The whole feature is `.cursor/skills/verify-portfolio/scripts/drive.mjs contact`.

## Gotchas

- The button is in the static HTML. A click before hydration does nothing and does not show `Copied ✓`. Wait until the client bundle has hydrated.
- The copied label is cleared after two seconds. The result screenshot and the clipboard reads happen inside that window. A later screenshot that says `Copy email` again does not erase a transcript that already recorded `Copied ✓`, and it is not a substitute for `after.png`.
- If clipboard permission is missing, the click handler sets `window.location.href` to the mailto URL. The page leaving the preview is a failed copy.
- Do not click the mailto links. Assert the href.
- The live region is an `sr-only` span inside the button, so the accessible name includes both `Copied ✓` and `Email address copied to clipboard`.
