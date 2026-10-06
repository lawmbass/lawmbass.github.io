// Inline the server-rendered markup into dist/index.html so content is visible
// immediately (and without JS), then remove the temporary SSR bundle.
import { readFileSync, writeFileSync, rmSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const dist = resolve('dist')
const ssrDir = resolve('dist-ssr')
const { render } = await import(pathToFileURL(resolve(ssrDir, 'entry-server.js')).href)
const html = readFileSync(resolve(dist, 'index.html'), 'utf8')
import { readdirSync } from 'node:fs'
const preloads = readdirSync(resolve(dist, 'assets'))
  .filter((f) => /^(space-grotesk|inter)-latin-wght-normal-.*\.woff2$/.test(f))
  .map((f) => `<link rel="preload" href="./assets/${f}" as="font" type="font/woff2" crossorigin />`)
  .join('\n    ')
const out = html
  .replace('</title>', `</title>\n    ${preloads}`)
  .replace('<div id="root"></div>', `<div id="root">${render()}</div>`)
if (out === html) throw new Error('root placeholder not found')
writeFileSync(resolve(dist, 'index.html'), out)
rmSync(ssrDir, { recursive: true, force: true })
console.log('prerendered dist/index.html')
