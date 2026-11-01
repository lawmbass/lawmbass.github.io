import { createRequire } from 'node:module'
import { mkdirSync } from 'node:fs'
const require = createRequire(import.meta.url)
let pw
try { pw = require('playwright') } catch { try { pw = require('playwright-core') } catch { pw = require(process.env.PW_PATH || '/tmp/pw/node_modules/playwright-core') } }
const browser = await pw.chromium.launch({ channel: 'chrome' }).catch(() => pw.chromium.launch())
const BASE = process.env.BASE || 'http://localhost:4173/'
const origin = new URL(BASE).origin
const out = process.env.OUT || 'shots'
mkdirSync(out, { recursive: true })
const errors = []
const warnings = []
async function shoot(name, opts, reduced = false) {
  const ctx = await browser.newContext({ ...opts, reducedMotion: reduced ? 'reduce' : 'no-preference' })
  const page = await ctx.newPage()
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(`${name}: ${m.text()}`)
    else if (m.type() === 'warning') warnings.push(`${name}: ${m.text()}`)
  })
  page.on('pageerror', (e) => errors.push(`${name}: ${e.message}`))
  page.on('request', (r) => {
    const url = r.url()
    if (url.startsWith(origin) || url.startsWith('data:') || url.startsWith('blob:')) return
    errors.push(`${name}: EXTERNAL ${url}`)
  })
  await page.goto(BASE, { waitUntil: 'networkidle' })
  await page.waitForTimeout(1400)
  await page.screenshot({ path: `${out}/${name}-hero.png` })
  // scroll through to trigger reveals, then full page
  const h = await page.evaluate(() => document.body.scrollHeight)
  for (let y = 0; y < h; y += 400) { await page.evaluate((y) => window.scrollTo(0, y), y); await page.waitForTimeout(120) }
  await page.waitForTimeout(1000)
  await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(300)
  await page.screenshot({ path: `${out}/${name}-full.png`, fullPage: true })
  // section shot: side projects ("Things I've built")
  const built = page.locator('#side-projects')
  const sideCount = await built.count()
  if (sideCount === 1) {
    // hide the sticky header + skip link so they don't overlap the element capture
    await page.evaluate(() => document.querySelectorAll('.topbar, .skip').forEach((el) => (el.style.visibility = 'hidden')))
    await built.screenshot({ path: `${out}/${name}-side-projects.png` })
    await page.evaluate(() => document.querySelectorAll('.topbar, .skip').forEach((el) => (el.style.visibility = '')))
    await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(300)
  } else {
    errors.push(`${name}: #side-projects count ${sideCount}`)
  }
  const hidden = await page.evaluate(() => [...document.querySelectorAll('.will-reveal:not(.is-in)')].length)
  if (hidden !== 0) errors.push(`${name}: hiddenAfterScroll ${hidden}`)
  // keyboard focus check
  await page.keyboard.press('Tab')
  await page.waitForTimeout(400)
  const f1 = await page.evaluate(() => document.activeElement?.textContent?.trim())
  if (f1 !== 'Skip to content') errors.push(`${name}: firstTab ${f1}`)
  await page.screenshot({ path: `${out}/${name}-focus-skip.png` })
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)
  if (overflow) errors.push(`${name}: horizontalOverflow`)
  console.log(name, { hiddenAfterScroll: hidden, firstTab: f1, horizontalOverflow: overflow, sideProjects: sideCount })
  await ctx.close()
}
await shoot('desktop', { viewport: { width: 1440, height: 900 } })
await shoot('mobile', { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
await shoot('mobile-reduced-motion', { viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true }, true)
console.log('warnings:', warnings.length ? warnings : 'none')
console.log('errors:', errors.length ? errors : 'none')
await browser.close()
if (errors.length) process.exit(1)
