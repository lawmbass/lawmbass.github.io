/**
 * Side projects (Lawrence's own repos).
 * Facts here come only from each repo's shipped code. Each bullet was re-checked against
 * the current main branch before publishing; anything not in the shipped code is cut.
 * - `live` is set only for URLs that returned HTTP 200 when checked.
 * - No code links: never link a private repo.
 * - At most five tags per card, leading with skills from the brief.
 */
export type PersonalProject = {
  id: string
  name: string
  kind: string
  hook?: string
  oneLiner: string
  highlights: string[]
  stack: string[]
  live?: string
  featured?: boolean
}

export const sideProjectsIntro = 'Products I build on my own time. Most of the code is private; live sites are linked.'

export const personalProjects: PersonalProject[] = [
  {
    id: 'rampnest',
    name: 'Rampnest',
    kind: 'Full-stack SaaS · car hauling',
    hook: 'Know what every load is worth before you take it.',
    oneLiner:
      'A dispatch and load tool for car haulers. They find and manage loads: paste a load, see the profit on each truck, and keep the trip, driver pay, and who still owes them.',
    // Checked against lawmbass/rampnest main (2f2498c) on Nov 13, 2026:
    // - README and pages/index.js: paste a load, profit per truck, take/counter/pass, trip profit, driver pay, who owes them
    // - https://rampnest.com returned HTTP 200. The app does not search a load board or book a car.
    // - migrations/029 drops the freight-board and AI-call tables.
    // - migrations/033 drops inspections and shipper texts. Stripe plans live in lib/plans.ts; Mapbox draws the trip.
    highlights: [
      'A hauler pastes a load and sees the profit on each truck, a take, counter, or pass verdict, and the price to counter at.',
      'It keeps count of what each trip made, what each driver is owed, and who still owes them.',
      'Billing on Stripe. Mapbox supplies the road miles, the stop order, and the trip map.',
      'Invite-only driver accounts. Each dispatcher sees only their own loads, enforced with row-level security.',
    ],
    stack: ['Next.js', 'React', 'Supabase/PostgreSQL', 'Stripe', 'Vitest'],
    live: 'https://rampnest.com',
    featured: true,
  },
  {
    id: 'pacing-for-the-cure',
    name: 'Pacing for the Cure',
    kind: 'Nonprofit site rebuild · fundraising',
    oneLiner:
      'A rebuild of the website for Pacing for the Cure, a harness-racing charity that helps people living with multiple sclerosis pay for scooters, wheelchairs, and treatment copays. The old WordPress site moved to Next.js with its posts and URLs kept.',
    // Checked against lawmbass/pacing-for-the-cure main (3d5421b) on Oct 29, 2026:
    // - content/funds.ts: three active funds; lib/donate/designation-search.ts + components/form/DesignationCombobox.tsx
    // - app/api/donate + lib/donate/checkout.ts: Stripe Checkout, test mode unless DONATIONS_LIVE (unset)
    // - lib/donate/receipt.ts + content/sponsorships.ts: fair market value and deductible amount; receipts via Resend
    // - app/admin/*, lib/admin/*: magic-link sign-in, admin/viewer roles; lib/crypto.ts: AES-256-GCM application fields
    // Not live on pacingforthecure.org yet (DNS not moved), so the link is the Vercel deployment.
    highlights: [
      'Donations to three funds through Stripe Checkout, with a searchable fund picker.',
      'Sponsorship packages with emailed receipts that state the fair market value of the benefits and the tax-deductible amount.',
      'Admin dashboard with magic-link sign-in and admin/viewer roles for gifts, sponsors, and aid applications; sensitive application fields are encrypted with AES-256-GCM.',
    ],
    stack: ['Next.js', 'React', 'TypeScript', 'Supabase/PostgreSQL', 'Stripe'],
    live: 'https://pacing-for-the-cure.vercel.app',
  },
  {
    id: 'temp-tattoos',
    name: 'Temp Tattoo Studio',
    kind: 'AI web app · e-commerce',
    oneLiner:
      'A storefront where shoppers describe a temporary tattoo, get an AI-generated design, save favorites, and add it to the cart.',
    highlights: [
      'Text-to-image generation through a serverless proxy, with prompt templates per style',
      'Typed Convex backend; generated images copied into storage for each shopper’s design history',
    ],
    stack: ['React', 'TypeScript', 'Vite', 'Convex', 'Clerk'],
    live: 'https://temp-tattoos.vercel.app',
  },
  {
    id: 'sleepysquid-ai',
    name: 'SleepySquid AI',
    kind: 'Service site + client portal · small business',
    oneLiner:
      'Done-for-you office automation for trades, real estate agents, and property managers in DC, Maryland, and Virginia, with a client portal that reports what the automations did.',
    highlights: [
      'Automation bots post run reports to a single ingest endpoint; client keys are stored only as SHA-256 hashes.',
      'Clients sign in to one shared portal at sleepysquid.com/dashboard to see reports and export them as PDF.',
    ],
    stack: ['Next.js', 'React', 'Supabase/PostgreSQL', 'Resend'],
    live: 'https://ai.sleepysquid.com',
  },
  {
    id: 'sleepysquid-drones',
    name: 'SleepySquid Drones',
    kind: 'Full-stack web app · small business',
    oneLiner:
      'The public site and booking system for an FAA Part 107 drone business, with an admin dashboard for bookings, airspace checks, and incoming mission listings.',
    highlights: [
      'Booking form and admin tools use Google Places address search; admins check airspace for a job location.',
      'A companion Node bot reads DroneBase/Zeitview mission emails, applies admin-set rules, and logs every listing to the dashboard.',
      'Role-based access from one permission map in Next.js middleware; reCAPTCHA, rate limits, and a Content Security Policy.',
    ],
    stack: ['Next.js', 'Supabase/PostgreSQL', 'NextAuth', 'Google Maps Platform', 'Puppeteer'],
    live: 'https://drones.sleepysquid.com',
  },
  {
    id: 'sleepysquid',
    name: 'SleepySquid',
    kind: 'Company site · shared sign-in',
    oneLiner:
      'The hub for SleepySquid’s software, drone, and AI automation services, with one sign-in and one client portal across every SleepySquid site.',
    highlights: [
      'Single sign-on across subdomains with a shared NextAuth session (Google or emailed sign-in link).',
      'Contact form delivers through Resend from a dedicated sending domain.',
    ],
    stack: ['Next.js', 'React', 'NextAuth', 'Resend', 'Vercel'],
    live: 'https://sleepysquid.com',
  },
]
