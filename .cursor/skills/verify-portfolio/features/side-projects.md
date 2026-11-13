# Side projects

Side projects is the section titled Things I’ve built. Six products are listed, each with a live site. The code for those products is not linked from this page.

## Sub-features

- `open` reaches the section from `Projects` and shows the `02 — Side projects` kicker.
- `order` lists Rampnest, Pacing for the Cure, Temp Tattoo Studio, SleepySquid AI, SleepySquid Drones, and SleepySquid, and shows the Rampnest hook.
- `live-links` checks each Live site href, new-tab behavior, and accessible name, and leaves the portfolio.

## How to get to it (user POV)

- Choose `Projects` in the primary navigation.
- Open the URL with the `#side-projects` hash.
- Choose a `Live site` control. That opens someone else's site in a new tab. Verification stops on this page.

## Driving it with verify-portfolio

Preconditions:

- Doctor prints `worth_driving: yes` for this `RUN_ID`.
- The six hrefs below are the ones in the shipped page. A new product is a map change, proved by reading the card, not by deleting an assertion.

- **Open.** Choose `Projects`. Run `.cursor/skills/verify-portfolio/scripts/drive.mjs side-projects --step open`. The hash is `#side-projects` and the heading is `Things I’ve built` (U+2019). The intro says the code is mostly private and the live sites are linked.
- **Order.** Read the six headings top to bottom. Run `.cursor/skills/verify-portfolio/scripts/drive.mjs side-projects --step order`. The ids are `pp-rampnest-t`, `pp-pacing-for-the-cure-t`, `pp-temp-tattoos-t`, `pp-sleepysquid-ai-t`, `pp-sleepysquid-drones-t`, `pp-sleepysquid-t`. Rampnest shows the hook `Know what every load is worth before you take it.` and four highlights.
- **Live links.** Read each Live site control without activating it. Run `.cursor/skills/verify-portfolio/scripts/drive.mjs side-projects --step live-links`. The hrefs are `https://rampnest.com`, `https://pacing-for-the-cure.vercel.app`, `https://temp-tattoos.vercel.app`, `https://ai.sleepysquid.com`, `https://drones.sleepysquid.com`, and `https://sleepysquid.com`. Each has `target="_blank"` and `rel` containing `noopener` and `noreferrer`. Each accessible name includes the product name. No link is named `Code`, no href contains `github.com/lawmbass`, and the drive records no request to another http(s) origin.

The whole section is `.cursor/skills/verify-portfolio/scripts/drive.mjs side-projects`.

## Gotchas

- Activating Live site leaves this portfolio and hits a third-party production site. The proof is the href and the absence of that request.
- The heading apostrophe is U+2019. `Things I've built` with an ASCII apostrophe does not match.
- `scripts/shots.mjs` photographs `#side-projects` after hiding the sticky bar for that one element shot, then puts the bar back. The drive screenshots do not hide the bar.
- At widths of 400px and below, the green `Live` status on the card is `display: none`. The Live site link remains.
- `99Problems` and `Mow Logistics` are removed names. Their presence fails the live-links step.
