import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
let pw
try { pw = require('playwright') } catch { try { pw = require('playwright-core') } catch { pw = require(process.env.PW_PATH || '/tmp/pw/node_modules/playwright-core') } }
const browser = await pw.chromium.launch({ channel: 'chrome' }).catch(() => pw.chromium.launch())
const out = process.env.OUT || 'shots'
const errors = []
async function shoot(name, opts, reduced = false) {
  const ctx = await browser.newContext({ ...opts, reducedMotion: reduced ? 'reduce' : 'no-preference' })
  const page = await ctx.newPage()
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') errors.push(`${name}: ${m.text()}`) })
  page.on('pageerror', (e) => errors.push(`${name}: ${e.message}`))
  page.on('request', (r) => { if (!r.url().startsWith('http://localhost')) errors.push(`${name}: EXTERNAL ${r.url()}`) })
  await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' })
  await page.waitForTimeout(1400)
  await page.screenshot({ path: `${out}/${name}-hero.png` })
  // scroll through to trigger reveals, then full page
  const h = await page.evaluate(() => document.body.scrollHeight)
  for (let y = 0; y < h; y += 400) { await page.evaluate((y) => window.scrollTo(0, y), y); await page.waitForTimeout(120) }
  await page.waitForTimeout(1000)
  await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(300)
  await page.screenshot({ path: `${out}/${name}-full.png`, fullPage: true })
  // section shot: personal projects ("Things I've built")
  const built = page.locator('#built')
  if (await built.count()) {
    // hide the sticky header + skip link so they don't overlap the element capture
    await page.evaluate(() => document.querySelectorAll('.topbar, .skip').forEach((el) => (el.style.visibility = 'hidden')))
    await built.screenshot({ path: `${out}/${name}-built.png` })
    await page.evaluate(() => document.querySelectorAll('.topbar, .skip').forEach((el) => (el.style.visibility = '')))
    await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(300)
  }
  const hidden = await page.evaluate(() => [...document.querySelectorAll('.will-reveal:not(.is-in)')].length)
  // keyboard focus check
  await page.keyboard.press('Tab')
  await page.waitForTimeout(400)
  const f1 = await page.evaluate(() => document.activeElement?.textContent?.trim())
  await page.screenshot({ path: `${out}/${name}-focus-skip.png` })
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)
  console.log(name, { hiddenAfterScroll: hidden, firstTab: f1, horizontalOverflow: overflow })
  await ctx.close()
}
await shoot('desktop', { viewport: { width: 1440, height: 900 } })
await shoot('mobile', { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
await shoot('mobile-reduced-motion', { viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true }, true)
console.log('errors/warnings:', errors.length ? errors : 'none')
await browser.close()
