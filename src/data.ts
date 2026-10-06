export const profile = {
  name: 'Lawrence M. Bass',
  title: 'Senior Software Engineer',
  email: 'lawmbass1@gmail.com',
  summary:
    'Senior Software Engineer with 11+ years building React/TypeScript web applications and Node APIs. Owns complex reporting and planning UIs end-to-end, modernizes APIs, and hardens CI/test pipelines.',
}

export type Project = {
  id: string
  title: string
  context: string
  summary: string
  points: string[]
  tags: string[]
  note?: string
}

export const projects: Project[] = [
  {
    id: 'planning-platform',
    title: 'Readiness planning & budget analysis platform',
    context: 'Defense client · Booz Allen Hamilton',
    summary:
      'A React/TypeScript platform for defense readiness planning and budget analysis. I own major planning and reporting UIs end-to-end.',
    points: [
      'Shipped a portfolio-analysis MVP',
      'Built shared charting: combo charts, multi-series toggles, and before/after optimization views',
      'Context-aware screens that hide irrelevant options based on user selections',
    ],
    tags: ['React', 'TypeScript'],
  },
  {
    id: 'optimizer',
    title: 'Budget optimizer integration',
    context: 'Defense client · Booz Allen Hamilton',
    summary:
      'Partnered with the data team to bring a multi-fiscal-year budget optimizer into the planning UIs.',
    points: [
      'Integrated optimizer results into the planning and reporting experience',
      'Wired the frontend to Databricks-backed optimization',
    ],
    note: 'The optimization algorithm was written by the data team; my part was the UI integration and frontend wiring.',
    tags: ['React', 'TypeScript'],
  },
  {
    id: 'modernization',
    title: 'API & frontend modernization',
    context: 'Defense client · Booz Allen Hamilton',
    summary:
      'Led the move of core user, profile, planning, and approval flows to a new typed API, and cleaned up the frontend along the way.',
    points: [
      'Removed legacy search paths and introduced a cleaner module structure',
      'Added React error boundaries',
      'Prisma migration cleanup with backwards-compatible upgrade patterns',
      'Consolidated settings endpoints to cut network calls',
    ],
    tags: ['React', 'TypeScript', 'Prisma'],
  },
  {
    id: 'reliability',
    title: 'Test & release reliability',
    context: 'Defense client · Booz Allen Hamilton',
    summary:
      'Made CI pass/fail results trustworthy for releases, and owned getting releases out the door.',
    points: [
      'Stabilized a Cypress end-to-end suite, including chronic 503 failures',
      'Owned release packages and in-person deployments',
    ],
    tags: ['Cypress', 'CI/CD'],
  },
  {
    id: 'migration',
    title: 'Framework migration',
    context: 'Defense client · Booz Allen Hamilton',
    summary: 'Ported a production frontend from AureliaJS to React/TypeScript.',
    points: [
      'Redux and React context for state management',
      'Moved search from Solr to Elasticsearch',
    ],
    tags: ['React', 'TypeScript', 'Redux', 'Elasticsearch'],
  },
  {
    id: 'nrl',
    title: 'REST APIs & delivery pipelines',
    context: 'Naval Research Laboratory contractor · Knexus Research',
    summary: 'Earlier work building backend services and the pipelines that ship them.',
    points: [
      'Node/Express/MongoDB REST APIs',
      'Containerized deployments',
      'GitLab CI/CD',
    ],
    tags: ['Node.js', 'Express', 'MongoDB', 'Docker', 'CI/CD'],
  },
]

export const skillGroups: { label: string; items: string[] }[] = [
  { label: 'Frontend', items: ['React', 'TypeScript', 'JavaScript', 'Redux'] },
  { label: 'Backend & data', items: ['Node.js', 'Express', 'MongoDB', 'Prisma'] },
  { label: 'Delivery', items: ['Docker', 'CI/CD', 'Git'] },
  { label: 'Testing', items: ['Cypress'] },
  { label: 'Search', items: ['Elasticsearch'] },
  { label: 'Languages', items: ['Python'] },
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
  },
]

export const education = {
  degree: 'B.S. Computer Engineering',
  school: 'Shepherd University',
  dates: 'May 2015',
}

export const training = ['Palantir Foundry', 'Kubernetes', 'C3.ai']
