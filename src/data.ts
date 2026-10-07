export const profile = {
  name: 'Lawrence M. Bass',
  title: 'Senior Software Engineer',
  email: 'lawmbass1@gmail.com',
  eyebrow: 'Open to senior frontend & full-stack roles',
  headline:
    'I build the React and TypeScript screens behind hard planning and reporting work, plus the APIs and tests that keep them shipping.',
  summary:
    'Senior Software Engineer, 11+ years across React, TypeScript, and Node. I own planning and reporting UIs end to end on a large budget-analysis platform, lead API modernization, and made the Cypress suite reliable enough that releases trust CI.',
  /** Phone-free PDF of the resume (only the phone number was removed). */
  resume: './Lawrence_Bass_Resume.pdf',
}

export type Project = {
  id: string
  title: string
  /** Shown only where it adds information (once for Booz Allen, once for NRL). */
  context?: string
  summary: string
  points?: string[]
  tags: string[]
  note?: string
  size: 'featured' | 'mid' | 'small'
}

export const work = {
  intro:
    'Defense work at Booz Allen Hamilton and, before that, the Naval Research Laboratory. Described in general terms; no client names, data, or code.',
}

export const projects: Project[] = [
  {
    id: 'planning-platform',
    size: 'featured',
    title: 'Planning and reporting UIs, end to end',
    context: 'Booz Allen Hamilton · 2019–present',
    summary:
      'I own the major planning and reporting screens on a React/TypeScript platform for defense readiness and budget analysis.',
    points: [
      'Shipped a new analysis MVP',
      'Built shared charting: combo charts, multi-series toggles, before/after optimization views',
      'Built screens that hide options that don’t apply to what the user picked',
    ],
    tags: ['React', 'TypeScript'],
  },
  {
    id: 'optimizer',
    size: 'mid',
    title: 'Budget optimizer, brought into the UI',
    summary:
      'Brought the data team’s multi-fiscal-year budget optimizer into the planning and reporting screens, and wired the frontend to its Databricks-backed optimization.',
    note: 'The algorithm is the data team’s; the integration and frontend are mine.',
    tags: ['React', 'TypeScript'],
  },
  {
    id: 'modernization',
    size: 'mid',
    title: 'A typed API and a cleaner frontend',
    summary: 'Led the move of core user, profile, planning, and approval flows to a new typed API.',
    points: [
      'Removed legacy search paths; cleaner module structure',
      'Added React error boundaries',
      'Prisma migrations with backwards-compatible upgrades',
      'Consolidated settings endpoints to cut network calls',
    ],
    tags: ['React', 'TypeScript', 'Prisma'],
  },
  {
    id: 'reliability',
    size: 'mid',
    title: 'CI that releases can trust',
    summary:
      'Stabilized the Cypress end-to-end suite, including chronic 503 failures, so a green build means something.',
    points: ['Owned release packages and in-person deployments'],
    tags: ['Cypress', 'CI/CD'],
  },
  {
    id: 'migration',
    size: 'small',
    title: 'AureliaJS to React, in production',
    summary:
      'Ported a production frontend from AureliaJS to React and TypeScript, with Redux and React context for state, and moved search from Solr to Elasticsearch.',
    tags: ['React', 'TypeScript', 'Redux', 'Elasticsearch'],
  },
  {
    id: 'nrl',
    size: 'small',
    title: 'REST APIs and the pipelines that ship them',
    context: 'Naval Research Laboratory, via Knexus Research · 2016–2019',
    summary: 'Node/Express/MongoDB REST APIs, containerized deployments, and GitLab CI/CD.',
    tags: ['Node.js', 'Express', 'MongoDB', 'Docker', 'CI/CD'],
  },
]

/** Exactly the 14 skills from the brief, regrouped so no group has a single item. */
export const skillGroups: { label: string; items: string[] }[] = [
  { label: 'Frontend', items: ['React', 'TypeScript', 'JavaScript', 'Redux'] },
  { label: 'Backend & data', items: ['Node.js', 'Express', 'MongoDB', 'Prisma', 'Elasticsearch', 'Python'] },
  { label: 'Testing & delivery', items: ['Cypress', 'Docker', 'CI/CD', 'Git'] },
]

export type TimelineItem = {
  role: string
  org: string
  dates: string
  detail?: string
}

export const experience: TimelineItem[] = [
  {
    role: 'Senior Software Engineer',
    org: 'Booz Allen Hamilton',
    dates: 'Jul 2019 – Present',
    detail:
      'Planning and reporting UIs, API modernization, and test/release reliability for a defense readiness planning and budget analysis platform.',
  },
  {
    role: 'Software Engineer',
    org: 'Knexus Research (Naval Research Laboratory)',
    dates: 'Jun 2016 – Jul 2019',
    detail: 'Node/Express/MongoDB REST APIs, containerized deployments, and GitLab CI/CD.',
  },
  {
    role: 'Application Developer',
    org: 'IBM',
    dates: 'May 2015 – May 2016',
    detail:
      'Built an internal visitation-request web app, migrated a client site to Drupal, and fixed security and 508 accessibility findings.',
  },
]

export const education = {
  degree: 'B.S. Computer Engineering',
  school: 'Shepherd University',
  dates: 'May 2015',
}

export const training = ['Palantir Foundry', 'Kubernetes', 'C3.ai']
