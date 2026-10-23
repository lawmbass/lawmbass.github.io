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
    id: 'dispatch',
    name: 'Dispatch by SleepySquid',
    kind: 'Full-stack SaaS · trucking',
    hook: 'Let AI call the broker. You make the call on the load.',
    oneLiner:
      'A voice agent for small trucking fleets. It phones the freight broker about a load, pushes for a better rate, and brings the answer back. It never books the load; the dispatcher decides.',
    // Checked against lawmbass/dispatch main (6a0a114) on Oct 7, 2026:
    // - pages/api/calls/webhook.js verifies every Retell webhook with HMAC-SHA256 (fails closed)
    // - migrations/005 scopes RLS per dispatcher (applied on production; verify-rls.mjs 44/44)
    // - Stripe checkout/portal/webhook routes; tests/rateParsing, retellWebhook, rlsMigration
    // CI in GitHub Actions is currently red on main, so the v2 "tests run in GitHub Actions on every push" claim is cut.
    highlights: [
      'Broker calls run on Retell, and every call webhook is checked with an HMAC signature.',
      'Each dispatcher sees only their own loads and calls, enforced in the database with row-level security.',
      'Billing on Stripe; Vitest tests cover the rate parser, webhook signatures, and the row-level security migration.',
      'Live map board for dispatchers, invite-only driver accounts, and load texts to drivers over Twilio.',
    ],
    stack: ['Next.js', 'React', 'Supabase/PostgreSQL', 'Stripe', 'Vitest'],
    live: 'https://dispatch.sleepysquid.com',
    featured: true,
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
