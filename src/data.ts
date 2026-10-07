export const profile = {
  name: 'Lawrence M. Bass',
  title: 'Senior Software Engineer',
  email: 'lawmbass1@gmail.com',
  eyebrow: 'Open to senior frontend & full-stack roles',
  headline:
    'I build the React and TypeScript screens behind complex planning and reporting work, plus the APIs and tests that keep them shipping.',
  /** The brief's approved summary, word for word. */
  summary:
    'Senior Software Engineer with 11+ years building React/TypeScript web applications and Node APIs. Owns complex reporting and planning UIs end-to-end, modernizes APIs, and hardens CI/test pipelines.',
  /** Phone-free PDF of the resume (only the phone number was removed). */
  resume: './Lawrence_Bass_Resume.pdf',
}

export type Project = {
  id: string
  title: string
  context?: string
  summary: string
  points?: string[]
  tags: string[]
  size: 'featured' | 'mid'
}

export const work = {
  intro:
    'Client work for defense customers at Booz Allen Hamilton, described in general terms. No client names, data, or code.',
  /** Shorter items shown as one-liners under the cards, no tags. */
  oneLiners: [
    'Also at Booz Allen: moved a production app from AureliaJS to React, and its search from Solr to Elasticsearch.',
    'Before that: Node, Express, and MongoDB APIs with GitLab CI/CD pipelines at Knexus Research for the Naval Research Laboratory.',
  ],
}

export const projects: Project[] = [
  {
    id: 'planning-platform',
    size: 'featured',
    title: 'Planning and reporting UIs, end to end',
    context: 'Booz Allen',
    summary:
      'I own the planning and reporting screens on a large budget-planning platform, end to end: the React and TypeScript UI, the API calls behind it, and the tests that guard each release.',
    points: [
      'Shipped a new analysis tool as an MVP',
      'Built shared charting: combo charts, multi-series toggles, before/after optimization views',
      'Built screens that hide options that don’t apply to what the user picked',
    ],
    tags: ['React', 'TypeScript'],
  },
  {
    id: 'optimizer',
    size: 'mid',
    title: 'Budget optimizer, brought into the UI',
    context: 'Booz Allen',
    summary:
      'The data team built the optimization algorithm. I brought it into the product: the UI around it, and the frontend wiring to the Databricks-backed optimization service.',
    tags: ['React', 'TypeScript'],
  },
  {
    id: 'modernization',
    size: 'mid',
    title: 'A typed API and a cleaner frontend',
    context: 'Booz Allen',
    summary: 'Led the move of core user, profile, planning, and approval flows to a new typed API.',
    points: [
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
    context: 'Booz Allen',
    summary:
      'Stabilized the Cypress end-to-end suite, including chronic 503 failures, so a green build means something.',
    points: ['Owned release packages and in-person deployments'],
    tags: ['Cypress', 'CI/CD'],
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
