# Client work

Client work is the first section below the hero: four Booz Allen cards, one featured and three beside each other on a wide window, then two one-line notes.

## Sub-features

- `open` reaches the section from the primary nav and shows the `01 — Work` kicker.
- `cards` shows the four titles, the Booz Allen label on each, at most three bullets, and at most five tags.
- `one-liners` shows the AureliaJS note and the Knexus Research note.

## How to get to it (user POV)

- Choose `Work` in the primary navigation.
- Choose `See my work` in the hero. That entry is proved on the hero map.
- Open the URL with the `#work` hash.

## Driving it with verify-portfolio

Preconditions:

- Doctor prints `worth_driving: yes` for this `RUN_ID`.
- The preview serves the prerendered page, so the cards are in the HTML before the click handler for the glow runs.

- **Open.** Choose `Work`. Run `.cursor/skills/verify-portfolio/scripts/drive.mjs client-work --step open`. The hash is `#work`, the heading is `Client work`, the kicker text is `01 — Work`, and the intro names Booz Allen Hamilton without naming a client system.
- **Cards.** On that section, read the four cards. Run `.cursor/skills/verify-portfolio/scripts/drive.mjs client-work --step cards`. The titles are `Planning and reporting UIs, end to end`, `Budget optimizer, brought into the UI`, `A typed API and a cleaner frontend`, and `CI that releases can trust`. Each context label is `Booz Allen`. One card is featured and three are mid. The featured card includes `Shipped a new analysis tool as an MVP`. The words `Defense client` are absent.
- **One-liners.** Read the notes under the cards. Run `.cursor/skills/verify-portfolio/scripts/drive.mjs client-work --step one-liners`. The notes are the AureliaJS-to-React move and the Knexus Research / Naval Research Laboratory line, in that order.

The whole section is `.cursor/skills/verify-portfolio/scripts/drive.mjs client-work`.

## Gotchas

- The em dash in `01 — Work` is U+2014. The step compares the DOM text, not the uppercased rendering from `text-transform`.
- Rampnest, in Side projects, has four highlights. The three-bullet cap is the client-work cards. `scripts/verify-site.mjs` applies that cap to `<section id="work">` only.
- The word `portfolio` is banned for the whole document by `verify-site.mjs`, not by this feature's steps. Run that script when the copy contract is in question.
- Card glow follows the pointer. It is decorative. The proof does not require a hover coordinate.
