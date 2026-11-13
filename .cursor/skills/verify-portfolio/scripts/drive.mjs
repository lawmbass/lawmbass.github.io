#!/usr/bin/env node
// Drive one portfolio feature in the preview launch.mjs started.
// Usage: .cursor/skills/verify-portfolio/scripts/drive.mjs <feature> [--step <id>]
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import {
  importPlaywright,
  launchBrowser,
  paths,
  phoneHits,
  pidsMatching,
  readState,
  repoRoot,
  runDoctor,
} from './lib.mjs'

const USAGE = `Usage: .cursor/skills/verify-portfolio/scripts/drive.mjs <feature> [--step <id>]

Features and steps:
  hero                      land, see-work, back-to-top, skip, resume, phone, reduced-motion
  client-work               open, cards, one-liners
  side-projects             open, order, live-links
  experience-and-skills     experience, skills-scroll, skills-hash
  contact                   nav, hash, mailto, copy

The preview must already be running (launch.mjs, then doctor.mjs).
Evidence is written under $VERIFY_OUT/<feature>/ and is not deleted by cleanup.mjs.
`

const EMAIL = 'lawmbass1@gmail.com'
const HERO_H2 = 'Where I\u2019ve worked'
const SIDE_H2 = 'Things I\u2019ve built'
const JOBS = [
  ['Senior Software Engineer', 'Booz Allen Hamilton', 'Jul 2019 \u2013 Present'],
  ['Software Engineer', 'Knexus Research (Naval Research Laboratory)', 'Jun 2016 \u2013 Jul 2019'],
  ['Application Developer', 'IBM', 'May 2015 \u2013 May 2016'],
]
const SKILL_GROUPS = [
  ['Frontend', ['React', 'TypeScript', 'JavaScript', 'Redux']],
  ['Backend & data', ['Node.js', 'Express', 'MongoDB', 'Prisma', 'Elasticsearch', 'Python']],
  ['Testing & delivery', ['Cypress', 'Docker', 'CI/CD', 'Git']],
]
const LIVE = [
  ['rampnest', 'Rampnest', 'https://rampnest.com'],
  ['pacing-for-the-cure', 'Pacing for the Cure', 'https://pacing-for-the-cure.vercel.app'],
  ['temp-tattoos', 'Temp Tattoo Studio', 'https://temp-tattoos.vercel.app'],
  ['sleepysquid-ai', 'SleepySquid AI', 'https://ai.sleepysquid.com'],
  ['sleepysquid-drones', 'SleepySquid Drones', 'https://drones.sleepysquid.com'],
  ['sleepysquid', 'SleepySquid', 'https://sleepysquid.com'],
]
const WORK_TITLES = [
  'Planning and reporting UIs, end to end',
  'Budget optimizer, brought into the UI',
  'A typed API and a cleaner frontend',
  'CI that releases can trust',
]
const ONE_LINERS = [
  'Also at Booz Allen: moved a production app from AureliaJS to React, and its search from Solr to Elasticsearch.',
  'Before that: Node, Express, and MongoDB APIs with GitLab CI/CD pipelines at Knexus Research for the Naval Research Laboratory.',
]

const transcript = []
function check(name, ok, detail = '') {
  const line = `${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' \u2014 ' + detail : ''}`
  transcript.push(line)
  console.log(line)
  if (!ok) throw new Error(line)
}

function allowedRequest(url, origin) {
  return url.startsWith(origin)
    || url.startsWith('data:')
    || url.startsWith('blob:')
    || url.startsWith('chrome-extension:')
    || url.startsWith('chrome:')
    || url.startsWith('about:')
}

async function openPage(browser, origin, opts) {
  const context = await browser.newContext({
    viewport: { width: opts.width || 1280, height: opts.height || 900 },
    deviceScaleFactor: opts.mobile ? 2 : 1,
    isMobile: !!opts.mobile,
    hasTouch: !!opts.mobile,
    reducedMotion: opts.reducedMotion || 'no-preference',
  })
  await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin })
  const page = await context.newPage()
  page.setDefaultTimeout(15000)
  const problems = { console: [], external: [], http: [] }
  page.on('pageerror', (error) => problems.console.push(error.message))
  page.on('console', (message) => {
    if (message.type() !== 'error') return
    // Chrome's PDF viewer asks for /favicon.ico. The page links favicon.svg.
    if ((message.location()?.url || '').endsWith('/favicon.ico')) return
    problems.console.push(message.text())
  })
  page.on('request', (request) => {
    const url = request.url()
    if (!allowedRequest(url, origin)) problems.external.push(url)
  })
  page.on('response', (response) => {
    if (response.status() >= 400 && !response.url().endsWith('/favicon.ico')) {
      problems.http.push(`${response.status()} ${response.url()}`)
    }
  })
  return { context, page, problems }
}

async function gotoApp(page, url) {
  await page.goto(url, { waitUntil: 'networkidle', timeout: 20000 })
  await page.waitForFunction(() => {
    const root = document.getElementById('root')
    if (!root) return false
    return Object.keys(root).some((key) => key.startsWith('__reactContainer') || key.startsWith('__reactFiber'))
  })
  await page.evaluate(() => new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(resolve))
  }))
}

async function visibleBelowBar(page, selector) {
  try {
    await page.waitForFunction((sel) => {
      const el = document.querySelector(sel)
      const bar = document.querySelector('.topbar')
      if (!el || !bar) return false
      const top = el.getBoundingClientRect().top
      const barBottom = bar.getBoundingClientRect().bottom
      return top >= barBottom - 1 && top < window.innerHeight - 8
    }, selector)
  } catch {
    check(`visible below the top bar: ${selector}`, false, page.url())
  }
}

async function hashIs(page, hash) {
  try {
    await page.waitForFunction((expected) => location.hash === expected, hash)
  } catch {
    check(`url hash is ${hash}`, false, page.url())
  }
}

function durationSeconds(value) {
  const match = /^([\d.eE+-]+)(ms|s)$/.exec(String(value).trim())
  if (!match) return Number.NaN
  const amount = Number(match[1])
  return match[2] === 'ms' ? amount / 1000 : amount
}

async function textOf(locator) {
  return locator.evaluate((el) => (el.textContent || '').trim())
}

async function noOverflow(page) {
  const box = await page.evaluate(() => ({
    sw: document.documentElement.scrollWidth,
    iw: window.innerWidth,
  }))
  check('no horizontal overflow', box.sw <= box.iw, `scrollWidth=${box.sw} innerWidth=${box.iw}`)
}

async function aboveFoldClear(page, label) {
  const bad = await page.evaluate(() => {
    const vh = window.innerHeight
    const found = []
    for (const el of document.querySelectorAll('body *')) {
      if (el.closest('.bg, .skip, .sr-only') || el.matches('script, style')) continue
      const rect = el.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0 || rect.top >= vh) continue
      let opacity = 1
      let blur = false
      for (let node = el; node && node !== document.documentElement; node = node.parentElement) {
        const style = getComputedStyle(node)
        opacity *= Number.parseFloat(style.opacity)
        if (/blur/.test(style.filter)) blur = true
      }
      if (opacity < 0.99 || blur) found.push(`${el.tagName.toLowerCase()}.${el.className}: op=${opacity.toFixed(2)} blur=${blur}`)
    }
    return found
  })
  check(`nothing above the fold is faded or blurred (${label})`, bad.length === 0, bad.slice(0, 5).join(' | '))
}

async function navTapTargets(page) {
  const nav = page.getByRole('navigation', { name: 'Primary' })
  const heights = await nav.getByRole('link').evaluateAll((els) => els.map((el) => el.getBoundingClientRect().height))
  check('nav links are at least 44px tall', heights.length === 5 && heights.every((height) => height >= 44), heights.join(','))
  const logo = await page.getByRole('link', { name: 'Lawrence M. Bass, back to top' }).boundingBox()
  check('logo is at least 44px', !!logo && logo.width >= 44 && logo.height >= 44, logo ? `${logo.width}x${logo.height}` : 'missing')
}

async function capture(page, dir, id) {
  const png = path.join(dir, `${id}.png`)
  await page.screenshot({ path: png })
  const size = fs.statSync(png).size
  check(`screenshot ${id}.png`, size > 5000, `${size} bytes`)
  const title = await page.title()
  const h1 = await page.getByRole('heading', { level: 1 }).innerText()
  check('page title and name are present', title === 'Lawrence M. Bass \u2014 Senior Software Engineer' && h1.includes('Lawrence') && h1.includes('Bass'), title)
  let aria = ''
  if (typeof page.locator('main').ariaSnapshot === 'function') aria = await page.locator('main').ariaSnapshot()
  else aria = 'aria snapshot unavailable in this Playwright build'
  fs.writeFileSync(path.join(dir, `${id}.aria.txt`), `title: ${title}\nh1: ${h1.replaceAll('\n', ' | ')}\n---\n${aria}\n`)
}

function assertClean(problems) {
  check('no page or console errors', problems.console.length === 0, problems.console.join(' | '))
  check('no requests to another origin', problems.external.length === 0, problems.external.join(' | '))
  check('no HTTP errors', problems.http.length === 0, problems.http.join(' | '))
}

async function heroLand({ page, base }) {
  await gotoApp(page, base)
  await page.getByRole('heading', { level: 1, name: 'Lawrence M. Bass' }).waitFor()
  const eyebrow = await page.locator('.eyebrow').innerText()
  check('eyebrow', eyebrow.includes('Open to senior frontend & full-stack roles'), eyebrow)
  await page.getByText('I build the React and TypeScript screens behind complex planning and reporting work, plus the APIs and tests that keep them shipping.').waitFor()
  await page.getByText('Senior Software Engineer with 11+ years building React/TypeScript web applications and Node APIs. Owns complex reporting and planning UIs end-to-end, modernizes APIs, and hardens CI/test pipelines.').waitFor()
  check('code card visible', await page.getByRole('figure', { name: 'Profile summary as a code snippet' }).isVisible())
  const mailto = await page.locator('#top').getByRole('link', { name: 'Email me' }).getAttribute('href')
  check('hero Email me is a mailto link', mailto === `mailto:${EMAIL}`, mailto || '')
  const resume = await page.locator('.topbar').getByRole('link', { name: 'Resume', exact: true }).getAttribute('href')
  check('nav Resume points at the PDF', resume === './Lawrence_Bass_Resume.pdf', resume || '')
  const nav = page.getByRole('navigation', { name: 'Primary' })
  for (const label of ['Work', 'Projects', 'Experience', 'Contact']) {
    check(`nav has ${label}`, await nav.getByRole('link', { name: label, exact: true }).count() === 1)
  }
  check('nav has no Skills link', await nav.getByRole('link', { name: 'Skills', exact: true }).count() === 0)
  const footer = await page.locator('footer').innerText()
  check('footer names the site', footer.includes('Lawrence M. Bass') && footer.includes('Built with React and TypeScript, prerendered for speed.'))
  const duration = await page.locator('.bg-grid').evaluate((el) => getComputedStyle(el).animationDuration)
  check('background grid animates', durationSeconds(duration) === 30, duration)
  const bg = await page.locator('.topbar').evaluate((el) => getComputedStyle(el).backgroundColor)
  const alpha = Number((bg.match(/rgba?\(([^)]+)\)/)?.[1].split(',')[3] ?? '1'))
  check('sticky nav background is at least 90% opaque', alpha >= 0.9, bg)
  await navTapTargets(page)
  await noOverflow(page)
  await aboveFoldClear(page, 'after hydration')
}

async function heroSeeWork({ page, base }) {
  await gotoApp(page, base)
  await page.getByRole('link', { name: 'See my work' }).click()
  await hashIs(page, '#work')
  await visibleBelowBar(page, '#work-title')
  check('work heading', await textOf(page.locator('#work-title')) === 'Client work')
}

async function heroBackToTop({ page, base }) {
  await gotoApp(page, base)
  await page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: 'Work', exact: true }).click()
  await hashIs(page, '#work')
  await page.getByRole('link', { name: 'Lawrence M. Bass, back to top' }).click()
  await hashIs(page, '#top')
  await visibleBelowBar(page, '#hero-title')
}

async function heroSkip({ page, base, dir }) {
  await gotoApp(page, base)
  await page.keyboard.press('Tab')
  const active = await page.evaluate(() => document.activeElement?.textContent?.trim())
  check('first Tab lands on Skip to content', active === 'Skip to content', active || '')
  await page.screenshot({ path: path.join(dir, 'skip-focus.png') })
  await page.keyboard.press('Enter')
  await hashIs(page, '#main')
  check('hero heading still in view', await page.locator('#hero-title').isVisible())
}

async function heroResume({ page, base, dir, result }) {
  await gotoApp(page, base)
  const link = page.locator('#top').getByRole('link', { name: 'Resume (PDF)' })
  check('hero Resume (PDF) href', (await link.getAttribute('href')) === './Lawrence_Bass_Resume.pdf')
  const responsePromise = page.waitForResponse((res) => res.url().includes('Lawrence_Bass_Resume.pdf') && res.request().method() === 'GET' && res.status() === 200)
  await link.click()
  const res = await responsePromise
  await page.waitForURL(/Lawrence_Bass_Resume\.pdf/)
  const type = res.headers()['content-type'] || ''
  check('resume HTTP 200', res.status() === 200, String(res.status()))
  check('resume content-type is a PDF', type.includes('application/pdf'), type)
  check('browser opened the resume URL', page.url().includes('Lawrence_Bass_Resume.pdf'), page.url())
  // Chrome's PDF viewer replaces response.body() with a small HTML shell. Read the
  // same URL the click opened; that is the file the server sent.
  const fetched = await fetch(new URL('Lawrence_Bass_Resume.pdf', base))
  const buf = Buffer.from(await fetched.arrayBuffer())
  const fetchedType = fetched.headers.get('content-type') || ''
  check('served resume is a PDF', fetched.status === 200 && fetchedType.includes('application/pdf') && buf.subarray(0, 5).toString() === '%PDF-', `${fetched.status} ${fetchedType} ${buf.length} bytes`)
  const extracted = spawnSync('pdftotext', ['-', '-'], { input: buf, encoding: 'utf8' })
  let pdfText = 'skipped'
  if (extracted.error?.code === 'ENOENT') pdfText = 'skipped'
  else if (extracted.status !== 0) check('pdftotext reads the resume', false, (extracted.stderr || '').slice(0, 180))
  else {
    const hits = phoneHits(extracted.stdout)
    pdfText = hits.length === 0 ? 'clear' : 'present'
    check('resume text has no phone-shaped number', hits.length === 0, `hits ${hits.length}`)
  }
  result.extra.resume = { status: res.status(), contentType: type, bytes: buf.length, pdfText }
  console.log(`pdf_text: ${pdfText}`)
  await page.screenshot({ path: path.join(dir, 'resume.png') }).catch(() => {})
}

async function heroPhone({ page, base }) {
  await gotoApp(page, base)
  await page.getByRole('heading', { level: 1, name: 'Lawrence M. Bass' }).waitFor()
  const display = await page.locator('.code-card').evaluate((el) => getComputedStyle(el).display)
  check('code card is hidden at 390px', display === 'none', display)
  check('hero heading is visible on a phone', await page.locator('#hero-title').isVisible())
  const navOk = await page.evaluate(() => {
    const nav = document.querySelector('.topbar nav')
    const last = nav.querySelector('li:last-child a')
    nav.scrollLeft = 9999
    const rect = last.getBoundingClientRect()
    return rect.width > 0 && rect.right <= window.innerWidth + 1
  })
  check('Resume stays inside the phone viewport', navOk)
  await navTapTargets(page)
  await noOverflow(page)
  await aboveFoldClear(page, 'phone')
}

async function heroReduced({ page, base }) {
  await gotoApp(page, base)
  const matches = await page.evaluate(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  check('prefers-reduced-motion matches', matches)
  const duration = await page.locator('.bg-grid').evaluate((el) => getComputedStyle(el).animationDuration)
  check('background animation duration is collapsed', durationSeconds(duration) < 0.05, duration)
  await page.evaluate(async () => {
    const height = document.body.scrollHeight
    for (let y = 0; y < height; y += 400) window.scrollTo(0, y)
  })
  const revealed = await page.locator('.will-reveal').count()
  check('reduced motion never marks content will-reveal', revealed === 0, String(revealed))
  await page.evaluate(() => window.scrollTo(0, 0))
  await aboveFoldClear(page, 'reduced motion')
}

async function openSection(page, base, label, hash, headingSelector, headingText) {
  await gotoApp(page, base)
  await page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: label, exact: true }).click()
  await hashIs(page, hash)
  await visibleBelowBar(page, headingSelector)
  check(`${label} heading`, await textOf(page.locator(headingSelector)) === headingText, await textOf(page.locator(headingSelector)))
}

async function clientOpen(session) {
  await openSection(session.page, session.base, 'Work', '#work', '#work-title', 'Client work')
  check('work kicker', await textOf(session.page.locator('#work .kicker')) === '01 \u2014 Work')
  const intro = await session.page.locator('#work .section-sub').innerText()
  check('work intro', intro.includes('Client work for defense customers at Booz Allen Hamilton'))
}

async function clientCards({ page, base }) {
  await openSection(page, base, 'Work', '#work', '#work-title', 'Client work')
  const contexts = await page.locator('#work .card-ctx').allTextContents()
  check('four Booz Allen labels', contexts.length === 4 && contexts.every((item) => item.trim() === 'Booz Allen'), contexts.join(' | '))
  check('one featured card', await page.locator('#work .work-featured').count() === 1)
  check('three mid cards', await page.locator('#work .work-mid').count() === 3)
  for (const title of WORK_TITLES) check(`card ${title}`, await page.locator('#work').getByRole('heading', { name: title }).count() === 1)
  const bullets = await page.locator('#work .card-points').evaluateAll((lists) => lists.map((list) => list.querySelectorAll('li').length))
  check('each client-work list has at most 3 bullets', bullets.every((count) => count <= 3), bullets.join(','))
  const tags = await page.locator('#work .tags').evaluateAll((lists) => lists.map((list) => list.querySelectorAll('li').length))
  check('each client-work card has at most 5 tags', tags.every((count) => count <= 5), tags.join(','))
  const workText = await page.locator('#work').innerText()
  check('MVP sentence is present', workText.includes('Shipped a new analysis tool as an MVP'))
  check('old client label is absent', !workText.includes('Defense client'))
}

async function clientLines({ page, base }) {
  await openSection(page, base, 'Work', '#work', '#work-title', 'Client work')
  const items = await page.locator('#work .one-liners li').allTextContents()
  check('two one-liners', items.length === 2 && ONE_LINERS.every((line, index) => items[index].includes(line)), items.join(' || '))
}

async function sideOpen(session) {
  await openSection(session.page, session.base, 'Projects', '#side-projects', '#side-title', SIDE_H2)
  check('side-project kicker', await textOf(session.page.locator('#side-projects .kicker')) === '02 \u2014 Side projects')
  const intro = await session.page.locator('#side-projects .section-sub').innerText()
  check('side-project intro', intro.includes('Products I build on my own time'))
}

async function sideOrder({ page, base }) {
  await openSection(page, base, 'Projects', '#side-projects', '#side-title', SIDE_H2)
  const ids = await page.locator('#side-projects h3').evaluateAll((heads) => heads.map((head) => head.id))
  const expected = LIVE.map(([id]) => `pp-${id}-t`)
  check('side projects stay in source order', JSON.stringify(ids) === JSON.stringify(expected), ids.join(','))
  for (const [, name] of LIVE) check(`heading ${name}`, await page.locator('#side-projects').getByRole('heading', { name, exact: true }).count() === 1)
  check('Rampnest hook', (await page.locator('#side-projects').innerText()).includes('Know what every load is worth before you take it.'))
  const rampnestBullets = await page.locator('article', { has: page.locator('#pp-rampnest-t') }).locator('.card-points li').count()
  check('Rampnest shows its four highlights', rampnestBullets === 4, String(rampnestBullets))
}

async function sideLinks({ page, base }) {
  await openSection(page, base, 'Projects', '#side-projects', '#side-title', SIDE_H2)
  const links = page.locator('#side-projects a.pp-link-live')
  check('six live-site links', await links.count() === 6)
  for (const [id, name, href] of LIVE) {
    const link = page.locator('article', { has: page.locator(`#pp-${id}-t`) }).getByRole('link', { name: /Live site/ })
    check(`${name} href`, (await link.getAttribute('href')) === href, (await link.getAttribute('href')) || '')
    check(`${name} opens in a new tab`, (await link.getAttribute('target')) === '_blank')
    const rel = (await link.getAttribute('rel')) || ''
    check(`${name} rel`, rel.includes('noopener') && rel.includes('noreferrer'), rel)
    const accessible = await link.evaluate((el) => el.innerText)
    check(`${name} names itself for assistive tech`, accessible.includes(name), accessible.replaceAll('\n', ' '))
  }
  check('no Code link', await page.getByRole('link', { name: /^Code\b/ }).count() === 0)
  const hrefs = await page.locator('a').evaluateAll((els) => els.map((el) => el.getAttribute('href') || ''))
  check('no GitHub repo links', hrefs.every((href) => !href.includes('github.com/lawmbass')))
  const height = Math.min(...await links.evaluateAll((els) => els.map((el) => el.getBoundingClientRect().height)))
  check('Live site tap targets are at least 44px', height >= 44, String(height))
  const region = await page.locator('#side-projects').innerText()
  check('removed project names stay off the page', !/99Problems|Mow Logistics/i.test(region))
}

async function experienceOpen({ page, base }) {
  await openSection(page, base, 'Experience', '#experience', '#exp-title', HERO_H2)
  check('experience kicker', await textOf(page.locator('#experience .kicker')) === '03 \u2014 Experience')
  for (const [role, org, dates] of JOBS) {
    check(`role ${org}`, await page.locator('#experience').getByRole('heading', { name: `${role} \u00b7 ${org}` }).count() === 1)
    check(`dates ${org}`, (await page.locator('#experience').innerText()).includes(dates))
  }
  const body = await page.locator('#experience').innerText()
  check('IBM sentence', body.includes('Built an internal visitation-request web app, migrated a client site to Drupal, and fixed security and 508 accessibility findings.'))
  check('education', body.includes('B.S. Computer Engineering') && body.includes('Shepherd University'))
  for (const item of ['Palantir Foundry', 'Kubernetes', 'C3.ai']) check(`training ${item}`, body.includes(item))
}

async function skillsFromScroll({ page, base }) {
  await openSection(page, base, 'Experience', '#experience', '#exp-title', HERO_H2)
  await page.locator('#skills-title').scrollIntoViewIfNeeded()
  await visibleBelowBar(page, '#skills-title')
  await assertSkills(page)
}

async function skillsFromHash({ page, base }) {
  await gotoApp(page, `${base}#skills`)
  await hashIs(page, '#skills')
  await visibleBelowBar(page, '#skills-title')
  check('nav still has no Skills link', await page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: 'Skills', exact: true }).count() === 0)
  await assertSkills(page)
}

async function assertSkills(page) {
  check('skills kicker', await textOf(page.locator('#skills .kicker')) === '04 \u2014 Skills')
  check('skills heading', await textOf(page.locator('#skills-title')) === 'Toolkit')
  const groups = await page.locator('#skills .skill-group').evaluateAll((nodes) => nodes.map((node) => ({
    label: node.querySelector('dt')?.textContent?.trim(),
    items: [...node.querySelectorAll('li')].map((item) => item.textContent.trim()),
  })))
  check('three skill groups', JSON.stringify(groups) === JSON.stringify(SKILL_GROUPS.map(([label, items]) => ({ label, items }))), JSON.stringify(groups))
  const flat = groups.flatMap((group) => group.items)
  check('14 skills', flat.length === 14, flat.join(', '))
  const banned = flat.filter((item) => ['Angular', 'GraphQL', 'GKE', 'AWS'].includes(item))
  check('banned skills are absent from the toolkit', banned.length === 0, banned.join(','))
}

async function contactNav(session) {
  await openSection(session.page, session.base, 'Contact', '#contact', '#contact-title', 'Hiring for a senior frontend or full-stack role?')
  check('contact kicker', await textOf(session.page.locator('#contact .kicker')) === '05 \u2014 Contact')
  check('contact subcopy', (await session.page.locator('#contact .section-sub').innerText()).includes('Email is the best way to reach me.'))
}

async function contactHash({ page, base }) {
  await gotoApp(page, `${base}#contact`)
  await hashIs(page, '#contact')
  await visibleBelowBar(page, '#contact-title')
  const label = await textOf(page.locator('#contact').getByRole('button'))
  check('a fresh visit shows Copy email', label.includes('Copy email') && !label.includes('Copied'), label)
}

async function contactMailto({ page, base }) {
  await openSection(page, base, 'Contact', '#contact', '#contact-title', 'Hiring for a senior frontend or full-stack role?')
  const email = page.locator('#contact').getByRole('link', { name: EMAIL })
  check('email link href', (await email.getAttribute('href')) === `mailto:${EMAIL}`)
  const box = await email.boundingBox()
  check('email link is at least 44px tall', !!box && box.height >= 44, box ? String(box.height) : 'missing')
  const emailMe = await page.locator('#contact').getByRole('link', { name: 'Email me' }).getAttribute('href')
  check('contact Email me is mailto', emailMe === `mailto:${EMAIL}`, emailMe || '')
  const resume = await page.locator('#contact').getByRole('link', { name: 'Resume (PDF)' }).getAttribute('href')
  check('contact Resume (PDF) href', resume === './Lawrence_Bass_Resume.pdf', resume || '')
}

async function contactCopy({ page, base, dir, result }) {
  await openSection(page, base, 'Contact', '#contact', '#contact-title', 'Hiring for a senior frontend or full-stack role?')
  const button = page.locator('#contact').getByRole('button', { name: 'Copy email' })
  await button.scrollIntoViewIfNeeded()
  check('button reads Copy email', (await button.innerText()).includes('Copy email'))
  const before = path.join(dir, 'before.png')
  await page.screenshot({ path: before })
  check('before screenshot', fs.statSync(before).size > 5000, `${fs.statSync(before).size} bytes`)
  await button.click()
  const copied = page.locator('#contact').getByRole('button', { name: /Copied/ })
  await copied.waitFor()
  const live = await page.locator('#contact [aria-live="polite"]').evaluate((el) => (el.textContent || '').trim())
  check('live region announces the copy', live === 'Email address copied to clipboard', live)
  await page.bringToFront()
  let clipError = ''
  let first = ''
  try {
    first = await page.evaluate(async () => navigator.clipboard.readText())
  } catch (error) {
    clipError = error.message
  }
  check('clipboard holds the email', clipError === '' && first === EMAIL, clipError || first)
  const after = path.join(dir, 'after.png')
  await page.screenshot({ path: after })
  check('after screenshot', fs.statSync(after).size > 5000, `${fs.statSync(after).size} bytes`)
  const title = await page.title()
  const h1 = await page.getByRole('heading', { level: 1 }).innerText()
  const aria = typeof page.locator('#contact').ariaSnapshot === 'function'
    ? await page.locator('#contact').ariaSnapshot()
    : 'aria snapshot unavailable in this Playwright build'
  fs.writeFileSync(path.join(dir, 'copy.aria.txt'), `title: ${title}\nh1: ${h1.replaceAll('\n', ' | ')}\n---\n${aria}\n`)
  check('snapshot identifies the portfolio and the copied button', title === 'Lawrence M. Bass \u2014 Senior Software Engineer' && h1.includes('Lawrence') && aria.includes('Copied'), title)
  check('still on the contact section', page.url().startsWith(base) && page.url().includes('#contact'), page.url())
  await page.locator('#contact-title').click()
  let second = ''
  try {
    second = await page.evaluate(async () => navigator.clipboard.readText())
  } catch (error) {
    clipError = error.message
  }
  check('clipboard still holds the email after leaving the button', clipError === '' && second === EMAIL, clipError || second)
  result.extra.contact = { button: 'Copied', live, clipboard: first === EMAIL && second === EMAIL }
}

const CATALOG = {
  hero: [
    { id: 'land', run: heroLand },
    { id: 'see-work', run: heroSeeWork },
    { id: 'back-to-top', run: heroBackToTop },
    { id: 'skip', run: heroSkip },
    { id: 'resume', run: heroResume },
    { id: 'phone', width: 390, height: 844, mobile: true, run: heroPhone },
    { id: 'reduced-motion', width: 390, height: 844, mobile: true, reducedMotion: 'reduce', run: heroReduced },
  ],
  'client-work': [
    { id: 'open', run: clientOpen },
    { id: 'cards', run: clientCards },
    { id: 'one-liners', run: clientLines },
  ],
  'side-projects': [
    { id: 'open', run: sideOpen },
    { id: 'order', run: sideOrder },
    { id: 'live-links', run: sideLinks },
  ],
  'experience-and-skills': [
    { id: 'experience', run: experienceOpen },
    { id: 'skills-scroll', run: skillsFromScroll },
    { id: 'skills-hash', run: skillsFromHash },
  ],
  contact: [
    { id: 'nav', run: contactNav },
    { id: 'hash', run: contactHash },
    { id: 'mailto', run: contactMailto },
    { id: 'copy', run: contactCopy },
  ],
}

function printUsage() {
  console.log(USAGE)
}

const args = process.argv.slice(2).filter((arg) => arg !== '--')
if (args.includes('--help') || args.includes('-h') || args.length === 0) {
  printUsage()
  process.exit(args.length === 0 ? 2 : 0)
}
const feature = args[0]
const stepFlag = args.indexOf('--step')
const onlyStep = stepFlag === -1 ? null : args[stepFlag + 1]
if (!CATALOG[feature] || (stepFlag !== -1 && !onlyStep)) {
  printUsage()
  process.exit(2)
}
const selected = CATALOG[feature].filter((step) => !onlyStep || step.id === onlyStep)
if (selected.length === 0) {
  console.error(`Unknown step ${onlyStep} for ${feature}`)
  printUsage()
  process.exit(2)
}

process.chdir(repoRoot)
const doctor = await runDoctor()
if (!doctor.ok) {
  console.log(doctor.lines.join('\n'))
  console.error('doctor failed; not driving')
  process.exit(1)
}
const state = readState()
const origin = new URL(state.base).origin
const dir = path.join(paths().evidence, feature)
fs.mkdirSync(dir, { recursive: true })
const result = {
  feature,
  base: state.base,
  startedAt: new Date().toISOString(),
  ok: false,
  steps: {},
  extra: {},
}

let pw
try {
  pw = await importPlaywright()
} catch (error) {
  console.error('Playwright is not installed. These scripts load it from the environment, not from package.json.')
  console.error('npm install --prefix /tmp/pw playwright')
  console.error('google-chrome is used when it is on PATH; otherwise: npx --prefix /tmp/pw playwright install chromium')
  console.error(error.message)
  process.exit(1)
}

const browser = await launchBrowser(pw)
const browserPidFile = path.join(paths().state, 'browser.pid')
const chromePids = pidsMatching(process.pid, (command) => /chrome|chromium/i.test(command))
if (chromePids.length) fs.writeFileSync(browserPidFile, `${chromePids.join('\n')}\n`)

try {
  for (const step of selected) {
    console.log(`\n== ${feature} / ${step.id}`)
    const session = await openPage(browser, origin, step)
    const ctx = { ...session, base: state.base, origin, dir, result }
    try {
      await step.run(ctx)
      if (step.id !== 'resume' && step.id !== 'copy') await capture(session.page, dir, step.id)
      assertClean(session.problems)
      result.steps[step.id] = 'pass'
    } catch (error) {
      result.steps[step.id] = 'fail'
      result.error = error.message
      const failure = path.join(dir, `${step.id}-failure.png`)
      await session.page.screenshot({ path: failure }).catch(() => {})
      if (session.problems.console.length || session.problems.external.length || session.problems.http.length) {
        result.problems = session.problems
      }
      throw error
    } finally {
      await session.context.close()
    }
  }
  result.ok = true
} catch (error) {
  if (!String(error.message).startsWith('FAIL')) console.error(error.message)
} finally {
  result.finishedAt = new Date().toISOString()
  fs.writeFileSync(path.join(dir, 'result.json'), JSON.stringify(result, null, 2) + '\n')
  fs.writeFileSync(path.join(dir, 'transcript.txt'), transcript.join('\n') + '\n')
  await browser.close()
  fs.rmSync(browserPidFile, { force: true })
}

console.log(`\nevidence: ${dir}`)
process.exit(result.ok ? 0 : 1)
