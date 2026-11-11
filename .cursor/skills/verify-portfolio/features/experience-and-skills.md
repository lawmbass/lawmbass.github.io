# Experience and skills

Experience is the timeline of three jobs, plus education and training. Skills is the next section, the toolkit of 14 named skills. The primary nav includes Experience and omits Skills so Resume still fits on a 360–390px bar.

## Sub-features

- `experience` shows the three roles, the IBM sentence, the degree, and the three training labels.
- `skills-scroll` reaches Toolkit by scrolling down from Experience.
- `skills-hash` opens `#skills` directly and shows the same three groups.

## How to get to it (user POV)

- Choose `Experience` in the primary navigation.
- Scroll until the Toolkit heading is in view. There is no Skills item to choose.
- Open the URL with the `#experience` hash, or the URL with the `#skills` hash.

## Driving it with verify-portfolio

Preconditions:

- Doctor prints `worth_driving: yes` for this `RUN_ID`.
- The 14 skills are the brief's list. A fifteenth skill fails the step even when the groups still render.

- **Experience.** Choose `Experience`. Run `.cursor/skills/verify-portfolio/scripts/drive.mjs experience-and-skills --step experience`. The heading is `Where I’ve worked` (U+2019). The rows are Senior Software Engineer · Booz Allen Hamilton (`Jul 2019 – Present`), Software Engineer · Knexus Research (Naval Research Laboratory) (`Jun 2016 – Jul 2019`), and Application Developer · IBM (`May 2015 – May 2016`). The IBM paragraph mentions the visitation-request app, Drupal, and 508 findings. Education reads `B.S. Computer Engineering` at Shepherd University. Training lists Palantir Foundry, Kubernetes, and C3.ai.
- **Scroll to skills.** From Experience, scroll until Toolkit is below the sticky bar. Run `.cursor/skills/verify-portfolio/scripts/drive.mjs experience-and-skills --step skills-scroll`. The kicker is `04 — Skills`. The groups are Frontend (React, TypeScript, JavaScript, Redux), Backend & data (Node.js, Express, MongoDB, Prisma, Elasticsearch, Python), and Testing & delivery (Cypress, Docker, CI/CD, Git).
- **Hash entry.** Open `#skills`. Run `.cursor/skills/verify-portfolio/scripts/drive.mjs experience-and-skills --step skills-hash`. The same groups are visible, and the primary nav still has no Skills link.

The whole feature is `.cursor/skills/verify-portfolio/scripts/drive.mjs experience-and-skills`.

## Gotchas

- Choosing a Skills link fails because that link is not in the nav. Scroll or use the hash. Do not add a nav item just to make the step easier to click.
- Dates use U+2013 (`–`). The middot between role and organization is U+00B7 (`·`). The heading apostrophe is U+2019.
- Group labels are visually uppercased and stored in the DOM as `Frontend`, `Backend & data`, and `Testing & delivery`. Compare the DOM text.
- Angular, GraphQL, GKE, and AWS are absent from the toolkit. `verify-site.mjs` also rejects those words anywhere in the visible page text.
