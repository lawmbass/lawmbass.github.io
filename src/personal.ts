/**
 * Personal projects (Lawrence's own GitHub repos).
 * Facts here come only from each repo's code, README and config.
 * - `live` is set only for URLs found in the repo that returned HTTP 200 when checked.
 * - `code` is set only for PUBLIC repos. Never link a private repo.
 */
export type PersonalProject = {
  id: string
  name: string
  kind: string
  oneLiner: string
  highlights: string[]
  stack: string[]
  live?: string
  code?: string
  featured?: boolean
}

export const personalProjects: PersonalProject[] = [
  {
    id: 'dispatch',
    name: 'Dispatch',
    kind: 'Full-stack SaaS · trucking dispatch',
    oneLiner:
      'A dispatch app for small trucking fleets: dispatchers run drivers and loads from a live map, and an AI voice agent calls freight brokers to confirm load details and push for a better rate.',
    highlights: [
      'Retell voice agent places broker calls; HMAC-verified webhooks feed a transcript parser that reads spoken rates (“three seventy-five”, “fifteen hundred”) and separates the agreed rate from counter-offers',
      'Supabase row-level security scoped to each dispatcher, backed by migration tests and a re-runnable script that probes the policies',
      'Stripe subscriptions (Checkout, billing portal, webhooks), realtime load and driver updates, and Mapbox route maps; Vitest suite and GitHub Actions CI for lint, test and build',
    ],
    stack: ['Next.js', 'React', 'Supabase', 'PostgreSQL', 'Stripe', 'Retell AI', 'Mapbox', 'Vitest'],
    live: 'https://dispatch-tawny-tau.vercel.app',
    featured: true,
  },
  {
    id: 'sleepysquid-drones',
    name: 'SleepySquid Drones',
    kind: 'Full-stack web app · drone services',
    oneLiner:
      'The public site and booking system for a drone services business, with a role-based dashboard behind it.',
    highlights: [
      'Admin, client and pilot roles defined in a permission map, with protected routes checked in Next.js middleware against NextAuth sessions',
      'Booking and contact forms protected by reCAPTCHA and per-endpoint rate limits, plus security headers including a Content Security Policy',
      'Admin tools for bookings, users, email invitations, promo codes and booking analytics',
    ],
    stack: ['Next.js', 'React', 'MongoDB', 'Mongoose', 'NextAuth', 'Tailwind CSS'],
    live: 'https://drones.sleepysquid.com',
    code: 'https://github.com/lawmbass/sleepysquid-drones',
  },
  {
    id: 'temp-tattoos',
    name: 'Temp Tattoo Studio',
    kind: 'AI web app · e-commerce',
    oneLiner:
      'A temporary-tattoo storefront where shoppers generate custom designs with AI, save their favorites, and add them to a cart.',
    highlights: [
      'Text-to-image designs through a Vercel serverless proxy to the xAI image API, using style-specific narrative prompt templates',
      'Convex backend with a typed schema, queries, mutations and actions that copy generated images into file storage for design history',
      'Clerk sign-in with admin-only product management; animated UI built with React, TypeScript and Framer Motion',
    ],
    stack: ['React', 'TypeScript', 'Vite', 'Convex', 'Clerk', 'Tailwind CSS', 'Framer Motion'],
    live: 'https://temp-tattoos.vercel.app',
  },
  {
    id: 'mow-logistics',
    name: 'Mow Logistics',
    kind: 'Progressive web app · field operations',
    oneLiner:
      'An installable app for landscaping businesses: clients, scheduling, routes, invoices, and a calculator for switching to electric equipment.',
    highlights: [
      'React 19 and TypeScript with Zustand stores split by domain: clients, schedule, routes, weather, payments and workflow',
      'FullCalendar scheduling, Mapbox route maps, and OpenWeather forecasts that drive weather-aware scheduling',
      'Installable PWA with an auto-updating service worker; Vitest and React Testing Library tests run in a Husky pre-commit hook with lint and build checks',
    ],
    stack: ['React', 'TypeScript', 'Vite', 'Zustand', 'Convex', 'Mapbox', 'Vitest'],
  },
  {
    id: '99problems',
    name: '99Problems',
    kind: 'Web app · community board',
    oneLiner: 'A public board of problems people are working on, where visitors submit, vote on, and report problems.',
    highlights: [
      'Next.js App Router API routes for listing, submitting, voting on and reporting problems',
      'MongoDB data model through Mongoose, with problems ranked by votes',
    ],
    stack: ['Next.js', 'React', 'MongoDB', 'Mongoose', 'Tailwind CSS'],
    live: 'https://99problems.vercel.app',
  },
]
