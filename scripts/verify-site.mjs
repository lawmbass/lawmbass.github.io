// Verify a deployed (or locally previewed) build of the portfolio.
// Usage: BASE=https://lawmbass.github.io/ SHOTS=live-v2 node scripts/verify-site.mjs
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
let pw
try { pw = require('playwright') } catch { try { pw = require('playwright-core') } catch { pw = require(process.env.PW_PATH || '/tmp/pw/node_modules/playwright-core') } }

const BASE = process.env.BASE || 'http://localhost:4173/'
const SHOTS = process.env.SHOTS || 'local-v2'
const out = '/workspace/portfolio-site/shots'
const cb = `cb=${Date.now()}`
const results = []
const check = (name, ok, detail = '') => { results.push({ name, ok: !!ok, detail }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`) }
// US-style phone numbers: (301) 751-6651, 301-751-6651, 301.751.6651, +1 301 751 6651
const PHONE = /(?:\+?1[\s.-]?)?\(?\b\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}\b/g
const BRIEF_SKILLS = ['React', 'TypeScript', 'JavaScript', 'Redux', 'Node.js', 'Express', 'MongoDB', 'Prisma', 'Docker', 'CI/CD', 'Cypress', 'Elasticsearch', 'Python', 'Git']

const res = await fetch(`${BASE}?${cb}`, { headers: { 'cache-control': 'no-cache' } })
const html = await res.text()
check('page returns 200', res.status === 200, `HTTP ${res.status}`)
const text = html.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, ' ').replace(/&#x27;|&#39;/g, "'").replace(/&amp;/g, '&').replace(/\s+/g, ' ')

// Hero
for (const s of [
  'Open to senior frontend &amp; full-stack roles',
  'I build the React and TypeScript screens behind complex planning and reporting work, plus the APIs and tests that keep them shipping.',
  // brief summary, word for word
  'Senior Software Engineer with 11+ years building React/TypeScript web applications and Node APIs. Owns complex reporting and planning UIs end-to-end, modernizes APIs, and hardens CI/test pipelines.',
  'See my work', 'Resume (PDF)',
]) check(`hero copy: ${s.slice(0, 50)}`, html.includes(s))
// Merged experience
const bah = (html.match(/class="card-ctx">Booz Allen</g) || []).length
check('client work: card label is "Booz Allen" on the 4 cards', bah === 4, `${bah}x`)
check('client work: old repeated "Defense client · Booz Allen Hamilton" gone', !html.includes('Defense client · Booz Allen Hamilton'))
check('client work: "new analysis tool as an MVP" present, "portfolio" gone', html.includes('Shipped a new analysis tool as an MVP') && !/portfolio/i.test(text))
check('client work: featured + 3 cards', (html.match(/card work-featured/g) || []).length === 1 && (html.match(/card work-mid/g) || []).length === 3)
check('client work: AureliaJS and NRL are one-liners', html.includes('Also at Booz Allen: moved a production app from AureliaJS to React, and its search from Solr to Elasticsearch.') && html.includes('Before that: Node, Express, and MongoDB APIs with GitLab CI/CD pipelines at Knexus Research for the Naval Research Laboratory.'))
const bullets = [...html.matchAll(/<ul class="card-points">([\s\S]*?)<\/ul>/g)].map((m) => (m[1].match(/<li/g) || []).length)
check('every card has at most 3 bullets', bullets.every((n) => n <= 3), bullets.join(','))
// Section order and numbering
const kickers = [...html.matchAll(/class="kicker">([^<]+)</g)].map((m) => m[1])
check('sections numbered 01-05 in order', JSON.stringify(kickers) === JSON.stringify(['01 — Work', '02 — Side projects', '03 — Experience', '04 — Skills', '05 — Contact']), kickers.join(' | '))
const navLabels = [...html.matchAll(/<nav[\s\S]*?<\/nav>/g)][0]?.[0].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
check('nav labels (v2): Work Projects Experience Contact Resume', navLabels === 'Lawrence M. Bass, back to top Work Projects Experience Contact Resume' || navLabels === 'Work Projects Experience Contact Resume', navLabels)
check('Dispatch hook line', html.includes('Let AI call the broker. You make the call on the load.'))
check('footer copy', /© (<!-- -->)?\d{4}(<!-- -->)? (<!-- -->)?Lawrence M. Bass(<!-- -->)? · Built with React and TypeScript, prerendered for speed\./.test(html))
// Side projects
const pp = [...html.matchAll(/id="pp-([a-z0-9-]+)-t"/g)].map((m) => m[1])
check('side projects in order: Dispatch, Temp Tattoo Studio, SleepySquid', JSON.stringify(pp) === JSON.stringify(['dispatch', 'temp-tattoos', 'sleepysquid-drones']), pp.join(', '))
check('99Problems and Mow Logistics removed', !/99Problems|Mow Logistics/i.test(html))
check('no "code available on request"', !/available on request/i.test(html))
check('no Code ↗ link / no GitHub repo links', !/>\s*Code\s*<span/.test(html) && !/github\.com\/lawmbass\//.test(html))
const tagLists = [...html.matchAll(/<ul class="tags" aria-label="Technologies">([\s\S]*?)<\/ul>/g)].map((m) => (m[1].match(/<li/g) || []).length)
check('every card has at most 5 tags', tagLists.every((n) => n <= 5), tagLists.join(','))
check('IBM line present', html.includes('Built an internal visitation-request web app, migrated a client site to Drupal, and fixed security and 508 accessibility findings.'))
check('contact copy', html.includes('Email is the best way to reach me.') && /Hiring for a .*senior frontend or full-stack.* role\?/.test(html) && !html.includes('Open to Senior'))
// Skills
const skillsDl = html.match(/<dl class="skills"[\s\S]*?<\/dl>/)?.[0] || ''
const skills = [...skillsDl.matchAll(/<li>([^<]+)<\/li>/g)].map((m) => m[1].replace('&amp;', '&'))
check('skills: exactly 14, matching the brief', skills.length === 14 && [...skills].sort().join() === [...BRIEF_SKILLS].sort().join(), `${skills.length}: ${skills.join(', ')}`)
check('no banned skills (Angular, GraphQL, GKE, AWS) on the page', !/\b(Angular|GraphQL|GKE|AWS)\b/.test(text))
// Meta
const meta = (attr, key) => html.match(new RegExp(`<meta ${attr}="${key}" content="([^"]*)"`))?.[1]
const expect = {
  description: 'Lawrence M. Bass, Senior Software Engineer. 11+ years building React/TypeScript apps and Node APIs: planning and reporting UIs, API modernization, reliable CI.',
  ogdesc: 'Senior Software Engineer. 11+ years of React, TypeScript, and Node: complex planning UIs, typed APIs, and CI that releases can trust.',
}
check('meta description', meta('name', 'description') === expect.description)
check('og:description + twitter:description', meta('property', 'og:description') === expect.ogdesc && meta('name', 'twitter:description') === expect.ogdesc)
check('og:url + canonical', meta('property', 'og:url') === 'https://lawmbass.github.io/' && html.includes('<link rel="canonical" href="https://lawmbass.github.io/"'))
check('og:image + twitter:image', meta('property', 'og:image') === 'https://lawmbass.github.io/og-image.png' && meta('name', 'twitter:image') === 'https://lawmbass.github.io/og-image.png')
check('twitter:card summary_large_image', meta('name', 'twitter:card') === 'summary_large_image')
check('og:title', meta('property', 'og:title') === 'Lawrence M. Bass — Senior Software Engineer')
// Assets
const og = await fetch(new URL(`og-image.png?${cb}`, BASE))
const ogBuf = Buffer.from(await og.arrayBuffer())
check('og-image.png: 200 image/png 1200x630', og.status === 200 && og.headers.get('content-type')?.startsWith('image/png') && ogBuf.readUInt32BE(16) === 1200 && ogBuf.readUInt32BE(20) === 630, `${og.status} ${og.headers.get('content-type')} ${ogBuf.readUInt32BE(16)}x${ogBuf.readUInt32BE(20)}`)
const resumeHrefs = [...html.matchAll(/<a[^>]*href="([^"]+)"[^>]*>Resume \(PDF\)<\/a>/g)].map((m) => m[1])
check('Resume (PDF) linked in hero and contact (+ Resume in nav)', resumeHrefs.length === 2 && html.includes('class="nav-resume" href="./Lawrence_Bass_Resume.pdf"'), resumeHrefs.join(', '))
const pdf = await fetch(new URL(`${resumeHrefs[0]}?${cb}`, BASE))
const pdfBuf = Buffer.from(await pdf.arrayBuffer())
check('resume PDF: 200 application/pdf', pdf.status === 200 && pdf.headers.get('content-type')?.includes('application/pdf') && pdfBuf.subarray(0, 5).toString() === '%PDF-', `${pdf.status} ${pdf.headers.get('content-type')} ${pdfBuf.length} bytes`)
const { writeFileSync } = await import('node:fs')
writeFileSync(`/tmp/${SHOTS}-resume.pdf`, pdfBuf)
// Phone numbers in HTML and JS bundles
check('no phone number in HTML', !(html.match(PHONE) || []).length, (html.match(PHONE) || []).join(','))
const bundles = [...html.matchAll(/(?:src|href)="(\.\/assets\/[^"]+\.(?:js|css))"/g)].map((m) => m[1])
let bundleHits = []
for (const b of bundles) { const t = await (await fetch(new URL(`${b}?${cb}`, BASE))).text(); bundleHits.push(...(t.match(PHONE) || []).map((h) => `${b}:${h}`)) }
check(`no phone number in JS/CSS bundles (${bundles.length} files)`, bundleHits.length === 0, bundleHits.join(','))
check('no "751" anywhere in HTML', !html.includes('751'))

// Browser checks
const browser = await pw.chromium.launch({ channel: 'chrome' }).catch(() => pw.chromium.launch())
async function run(name, opts) {
  const ctx = await browser.newContext({ ...opts })
  const page = await ctx.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(e.message))
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })
  await page.goto(`${BASE}?${cb}`, { waitUntil: 'commit' })
  // Sample as early as possible, then again after load + JS.
  const probe = () => page.evaluate(() => {
    const vh = window.innerHeight, bad = []
    for (const el of document.querySelectorAll('body *')) {
      if (el.closest('.bg, .skip, .sr-only') || el.matches('script, style')) continue
      const r = el.getBoundingClientRect()
      if (r.width === 0 || r.height === 0 || r.top >= vh) continue
      let op = 1, blur = false
      for (let n = el; n && n !== document.documentElement; n = n.parentElement) {
        const cs = getComputedStyle(n); op *= parseFloat(cs.opacity); if (/blur/.test(cs.filter)) blur = true
      }
      if (op < 0.99 || blur) bad.push(`${el.tagName.toLowerCase()}.${el.className}: op=${op.toFixed(2)} blur=${blur}`)
    }
    return bad
  })
  await page.waitForSelector('#hero-title')
  const early = await probe()
  await page.waitForLoadState('networkidle')
  const late = await probe()
  check(`${name}: nothing above the fold at opacity<1 or blurred (first paint)`, early.length === 0, early.slice(0, 5).join(' | '))
  check(`${name}: nothing above the fold at opacity<1 or blurred (after load)`, late.length === 0, late.slice(0, 5).join(' | '))
  await page.waitForTimeout(800)
  await page.screenshot({ path: `${out}/${SHOTS}-${name}-hero.png` })
  const h = await page.evaluate(() => document.body.scrollHeight)
  for (let y = 0; y < h; y += 500) { await page.evaluate((y) => window.scrollTo(0, y), y); await page.waitForTimeout(90) }
  await page.waitForTimeout(900)
  await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(300)
  await page.screenshot({ path: `${out}/${SHOTS}-${name}-full.png`, fullPage: true })
  const overflow = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: window.innerWidth, wide: [...document.querySelectorAll('body *')].filter((e) => !e.closest('.bg, nav') && e.getBoundingClientRect().right > window.innerWidth + 1).map((e) => e.tagName + '.' + e.className).slice(0, 5) }))
  check(`${name}: no horizontal overflow`, overflow.sw <= overflow.iw && overflow.wide.length === 0, `scrollWidth=${overflow.sw} innerWidth=${overflow.iw} ${overflow.wide.join(' ')}`)
  const navOk = await page.evaluate(() => { const n = document.querySelector('.topbar nav'); const last = n.querySelector('li:last-child a'); n.scrollLeft = 9999; const r = last.getBoundingClientRect(); return r.right <= window.innerWidth + 1 })
  check(`${name}: all nav items reachable`, navOk)
  check(`${name}: no JS errors`, errors.length === 0, errors.join(' | '))
  const m = await page.evaluate(() => {
    const h = (sel) => [...document.querySelectorAll(sel)].map((e) => { const r = e.getBoundingClientRect(); return [Math.round(r.width * 10) / 10, Math.round(r.height * 10) / 10] })
    const bg = getComputedStyle(document.querySelector('.topbar')).backgroundColor
    const code = getComputedStyle(document.querySelector('.code-card')).display
    return { nav: h('.topbar nav a'), mark: h('.mark')[0], live: h('.pp-link'), email: h('.email-link'), bg, code }
  })
  const minH = (arr) => Math.min(...arr.map((x) => x[1]))
  check(`${name}: tap targets >= 44px (nav, logo, Live site, email link)`, minH(m.nav) >= 44 && m.mark[0] >= 44 && m.mark[1] >= 44 && minH(m.live) >= 44 && minH(m.email) >= 44,
    `nav min h=${minH(m.nav)} logo=${m.mark.join('x')} live min h=${minH(m.live)} email h=${minH(m.email)}`)
  const alpha = Number((m.bg.match(/rgba?\(([^)]+)\)/)?.[1].split(',')[3] ?? '1'))
  check(`${name}: sticky nav background >= 90% opaque`, alpha >= 0.9, m.bg)
  if (opts.viewport.width < 720) check(`${name}: code card hidden on phones`, m.code === 'none', m.code)
  await ctx.close()
}
await run('desktop-1280', { viewport: { width: 1280, height: 800 } })
await run('mobile-390', { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
await run('mobile-360', { viewport: { width: 360, height: 780 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
await run('reduced-motion-390', { viewport: { width: 390, height: 844 }, isMobile: true, reducedMotion: 'reduce' })
await browser.close()
const failed = results.filter((r) => !r.ok)
console.log(`\n${results.length - failed.length}/${results.length} passed`)
process.exit(failed.length ? 1 : 0)
