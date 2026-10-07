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
    name: 'Dispatch',
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
    ],
    stack: ['Next.js', 'React', 'Supabase/PostgreSQL', 'Stripe', 'Vitest'],
    live: 'https://dispatch-tawny-tau.vercel.app',
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
    id: 'sleepysquid-drones',
    name: 'SleepySquid Drones',
    kind: 'Full-stack web app · small business',
    oneLiner:
      'The public site and booking system for a drone services business, with separate dashboards for admins, clients, and pilots.',
    highlights: [
      'Role-based access from one permission map, enforced in Next.js middleware',
      'Booking and contact forms behind reCAPTCHA and per-endpoint rate limits; Content Security Policy and security headers',
    ],
    stack: ['Next.js', 'React', 'MongoDB', 'NextAuth', 'Tailwind CSS'],
    live: 'https://drones.sleepysquid.com',
  },
]
