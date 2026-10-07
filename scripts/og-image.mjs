// Render public/og-image.png (1200x630) from HTML in the site's dark style.
// Run: node scripts/og-image.mjs   (uses Playwright; same lookup as shots.mjs)
import { createRequire } from 'node:module'
import { resolve } from 'node:path'
import { writeFileSync, rmSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
const require = createRequire(import.meta.url)
let pw
try { pw = require('playwright') } catch { try { pw = require('playwright-core') } catch { pw = require(process.env.PW_PATH || '/tmp/pw/node_modules/playwright-core') } }

const font = (pkg, file) => pathToFileURL(resolve('node_modules/@fontsource-variable', pkg, 'files', file)).href
const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face { font-family: SG; src: url(${font('space-grotesk', 'space-grotesk-latin-wght-normal.woff2')}) format('woff2'); font-weight: 300 700; }
@font-face { font-family: IN; src: url(${font('inter', 'inter-latin-wght-normal.woff2')}) format('woff2'); font-weight: 100 900; }
@font-face { font-family: JB; src: url(${font('jetbrains-mono', 'jetbrains-mono-latin-wght-normal.woff2')}) format('woff2'); font-weight: 100 800; }
* { box-sizing: border-box; margin: 0; }
body { width: 1200px; height: 630px; background: #07070d; color: #eeeef6; overflow: hidden; position: relative; font-family: IN, sans-serif; }
.grid { position: absolute; inset: 0;
  background-image: linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px);
  background-size: 56px 56px; -webkit-mask-image: radial-gradient(ellipse 90% 80% at 30% 10%, #000 30%, transparent 80%); }
.orb { position: absolute; border-radius: 50%; filter: blur(90px); }
.a { width: 620px; height: 620px; background: #8b7bff; top: -330px; left: -160px; opacity: 0.42; }
.b { width: 460px; height: 460px; background: #7cf3d6; top: -160px; right: -170px; opacity: 0.22; }
.c { width: 420px; height: 420px; background: #ff6fb5; bottom: -300px; right: 160px; opacity: 0.16; }
.wrap { position: absolute; inset: 0; padding: 78px 84px; display: flex; flex-direction: column; }
.eyebrow { align-self: flex-start; display: inline-flex; align-items: center; gap: 12px; font: 500 22px/1 JB, monospace; color: #7cf3d6;
  padding: 12px 18px; border: 1px solid rgba(124,243,214,0.3); border-radius: 999px; background: rgba(124,243,214,0.07); }
.dot { width: 10px; height: 10px; border-radius: 50%; background: #7cf3d6; box-shadow: 0 0 0 6px rgba(124,243,214,0.15); }
h1 { margin-top: 44px; font: 700 128px/0.95 SG, sans-serif; letter-spacing: -0.045em; }
.grad { background: linear-gradient(100deg, #7cf3d6, #8b7bff 50%, #ff6fb5); -webkit-background-clip: text; background-clip: text; color: transparent; }
.tag { margin-top: 30px; max-width: 900px; font: 600 48px/1.2 SG, sans-serif; letter-spacing: -0.01em; color: #eeeef6; }
.foot { margin-top: auto; display: flex; justify-content: space-between; align-items: center; font: 500 22px/1 JB, monospace; color: #b8b8cd; }
.mark { width: 52px; height: 52px; border-radius: 14px; display: grid; place-items: center; font: 700 22px/1 SG, sans-serif; color: #07070d;
  background: linear-gradient(100deg, #7cf3d6, #8b7bff 50%, #ff6fb5); }
</style></head><body>
<div class="grid"></div><div class="orb a"></div><div class="orb b"></div><div class="orb c"></div>
<div class="wrap">
  <p class="eyebrow"><span class="dot"></span>React · TypeScript · Node</p>
  <h1>Lawrence <span class="grad">M. Bass</span></h1>
  <p class="tag">Senior Software Engineer</p>
  <div class="foot"><span>lawmbass.github.io</span><span class="mark">LB</span></div>
</div></body></html>`

const browser = await pw.chromium.launch({ channel: 'chrome' }).catch(() => pw.chromium.launch())
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 })
// Load from a file:// URL so the local font files are allowed (setContent runs at about:blank).
const tmp = resolve('node_modules/.og-image.html')
writeFileSync(tmp, html)
await page.goto(pathToFileURL(tmp).href, { waitUntil: 'load' })
await page.evaluate(() => document.fonts.ready)
const loaded = await page.evaluate(() => ['SG', 'JB'].map((f) => document.fonts.check(`16px ${f}`)))
if (loaded.includes(false)) throw new Error('fonts not loaded: ' + loaded)
await page.screenshot({ path: 'public/og-image.png', type: 'png' })
await browser.close()
rmSync(tmp)
console.log('wrote public/og-image.png')
