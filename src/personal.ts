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
  oneLiner: string
  highlights: string[]
  stack: string[]
  live?: string
  featured?: boolean
}

export const sideProjectsIntro =
  'Products I’ve built and shipped outside work, from database to UI. Live links where they’re up.'

export const personalProjects: PersonalProject[] = [
  {
    id: 'dispatch',
    name: 'Dispatch',
    kind: 'Full-stack SaaS · trucking',
    oneLiner:
      'A subscription app for independent truck dispatchers. Click Call for Info on a load and an AI voice agent calls the broker, confirms the details, and pushes for a better rate, then saves the transcript and rate on the load.',
    highlights: [
      'Voice agent places broker calls; verified webhooks feed a parser that reads spoken rates (“three seventy-five”) and separates the agreed rate from counter-offers',
      'Row-level security scoped to each dispatcher, with migration tests and a script that probes the policies',
      'Stripe subscriptions with usage limits, realtime load updates, and route maps; Vitest test suite',
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
      'Clerk sign-in with admin-only product management; motion built with Framer Motion',
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
      'Admin tools for bookings, users, invitations, promo codes, and booking analytics',
    ],
    stack: ['Next.js', 'React', 'MongoDB', 'NextAuth', 'Tailwind CSS'],
    live: 'https://drones.sleepysquid.com',
  },
]
