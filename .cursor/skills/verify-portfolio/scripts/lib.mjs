// Shared by launch.mjs, doctor.mjs, drive.mjs, and cleanup.mjs. Not a command.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { setTimeout as sleep } from 'node:timers/promises'

const here = path.dirname(fileURLToPath(import.meta.url))
export const repoRoot = path.resolve(here, '../../../..')

export function paths() {
  const runId = process.env.RUN_ID || 'local'
  const root = process.env.VERIFY_ROOT || path.join('/tmp/verify-portfolio', runId)
  const evidence = process.env.VERIFY_OUT || path.join(root, 'evidence')
  return { runId, root, state: path.join(root, 'state'), evidence, repo: repoRoot }
}

export function stateFile() {
  return path.join(paths().state, 'state.json')
}

export function readState() {
  const file = stateFile()
  if (!fs.existsSync(file)) return null
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

export function writeState(state) {
  fs.mkdirSync(paths().state, { recursive: true })
  fs.writeFileSync(stateFile(), JSON.stringify(state, null, 2) + '\n')
}

export function phoneHits(text) {
  return text.match(/(?:\+?1[\s.-]?)?\(?\b\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}\b/g) || []
}

export function cmdline(pid) {
  try {
    return fs.readFileSync(`/proc/${pid}/cmdline`, 'utf8').replaceAll('\0', ' ').trim()
  } catch {
    return ''
  }
}

export function alive(pid) {
  if (!pid) return false
  try {
    process.kill(pid, 0)
    return true
  } catch (error) {
    return error.code === 'EPERM'
  }
}

function processTree(rootPid) {
  const ppid = new Map()
  for (const dir of fs.readdirSync('/proc')) {
    if (!/^\d+$/.test(dir)) continue
    try {
      const status = fs.readFileSync(`/proc/${dir}/status`, 'utf8')
      const match = status.match(/^PPid:\s+(\d+)/m)
      if (match) ppid.set(Number(dir), Number(match[1]))
    } catch {
      // process exited while we were reading
    }
  }
  const keep = new Set([rootPid])
  let grew = true
  while (grew) {
    grew = false
    for (const [pid, parent] of ppid) {
      if (keep.has(parent) && !keep.has(pid)) {
        keep.add(pid)
        grew = true
      }
    }
  }
  return keep
}

export function listenerPids(port) {
  const hex = port.toString(16).toUpperCase()
  const inodes = new Set()
  for (const file of ['/proc/net/tcp', '/proc/net/tcp6']) {
    let text = ''
    try {
      text = fs.readFileSync(file, 'utf8')
    } catch {
      continue
    }
    for (const line of text.split('\n').slice(1)) {
      const parts = line.trim().split(/\s+/)
      if (parts.length < 10 || parts[3] !== '0A') continue
      const localPort = parts[1].split(':')[1] || ''
      if (localPort.toUpperCase() !== hex) continue
      inodes.add(parts[9])
    }
  }
  if (inodes.size === 0) return []
  const found = []
  for (const dir of fs.readdirSync('/proc')) {
    if (!/^\d+$/.test(dir)) continue
    let fds = []
    try {
      fds = fs.readdirSync(`/proc/${dir}/fd`)
    } catch {
      continue
    }
    for (const fd of fds) {
      let link = ''
      try {
        link = fs.readlinkSync(`/proc/${dir}/fd/${fd}`)
      } catch {
        continue
      }
      const match = link.match(/^socket:\[(\d+)\]$/)
      if (match && inodes.has(match[1])) {
        found.push(Number(dir))
        break
      }
    }
  }
  return found
}

export function pidsMatching(rootPid, allow) {
  const tree = processTree(rootPid)
  const found = []
  for (const pid of tree) {
    if (pid === rootPid) continue
    const command = cmdline(pid)
    if (command && allow(command)) found.push(pid)
  }
  return found
}

export function portOwnedBy(pid, port) {
  const listeners = listenerPids(port)
  if (listeners.length === 0) return { ok: false, listeners }
  const tree = processTree(pid)
  return { ok: listeners.some((lp) => tree.has(lp)), listeners }
}

export function previewCommandOk(command, port) {
  return command.includes('vite/bin/vite.js') && command.includes('preview') && command.includes(String(port))
}

export async function runDoctor() {
  const lines = []
  const add = (key, value) => lines.push(`${key}: ${value}`)
  const state = readState()
  if (!state) {
    add('worth_driving', 'no')
    add('reason', 'no state file; run launch.mjs for this RUN_ID')
    return { ok: false, lines }
  }
  add('base', state.base)
  add('run_id', state.runId)
  const command = cmdline(state.pid)
  const pidAlive = alive(state.pid)
  add('pid', state.pid)
  add('pid_alive', pidAlive ? 'yes' : 'no')
  add('cmdline_ok', pidAlive && previewCommandOk(command, state.port) ? 'yes' : 'no')
  let owned = { ok: false, listeners: [] }
  if (pidAlive) owned = portOwnedBy(state.pid, state.port)
  add('listener_pids', owned.listeners.join(',') || 'none')
  add('port_owned_by_us', owned.ok ? 'yes' : 'no')

  let status = 0
  let contentType = ''
  let html = ''
  let fetchError = ''
  const url = new URL(state.base)
  url.searchParams.set('cb', String(Date.now()))
  try {
    const res = await fetch(url, {
      redirect: 'manual',
      signal: AbortSignal.timeout(5000),
      headers: { 'cache-control': 'no-cache' },
    })
    status = res.status
    contentType = res.headers.get('content-type') || ''
    html = await res.text()
  } catch (error) {
    fetchError = error.message
  }
  add('http_status', fetchError ? `error ${fetchError}` : status)
  add('content_type', contentType || 'none')
  const prerendered = html.includes('id="hero-title"')
    && !/<div id="root">\s*<\/div>/.test(html)
    && !html.includes('/src/main.tsx')
  add('prerendered_hero', prerendered ? 'yes' : 'no')
  const titleOk = html.includes('<title>Lawrence M. Bass — Senior Software Engineer</title>')
  add('title_ok', titleOk ? 'yes' : 'no')
  const canonicalOk = html.includes('<link rel="canonical" href="https://lawmbass.github.io/"')
  add('canonical_ok', canonicalOk ? 'yes' : 'no')
  const hits = phoneHits(html)
  add('phone_hits', hits.length)
  if (process.env.PRIVATE_DIGITS) {
    add('private_digits', html.includes(process.env.PRIVATE_DIGITS) ? 'present' : 'clear')
  } else {
    add('private_digits', 'unset')
  }
  const privateBad = process.env.PRIVATE_DIGITS ? html.includes(process.env.PRIVATE_DIGITS) : false
  const ok = pidAlive
    && previewCommandOk(command, state.port)
    && owned.ok
    && status === 200
    && contentType.includes('text/html')
    && prerendered
    && titleOk
    && canonicalOk
    && hits.length === 0
    && !privateBad
    && !fetchError
  add('worth_driving', ok ? 'yes' : 'no')
  return { ok, lines }
}

function signalGroup(pid, signal) {
  try {
    process.kill(-pid, signal)
    return
  } catch {
    // not a process-group leader; fall through to the pid
  }
  try {
    process.kill(pid, signal)
  } catch {
    // already exited
  }
}

async function waitDead(pid) {
  for (let i = 0; i < 40; i++) {
    if (!alive(pid)) return true
    await sleep(100)
  }
  signalGroup(pid, 'SIGKILL')
  await sleep(200)
  return !alive(pid)
}

export async function stopPid(pid, allow) {
  if (!pid) return { stopped: false, reason: 'no pid' }
  const command = cmdline(pid)
  if (!command) return { stopped: false, reason: 'not running' }
  if (!allow(command)) return { stopped: false, reason: 'refused', command }
  signalGroup(pid, 'SIGTERM')
  const dead = await waitDead(pid)
  return { stopped: dead, reason: dead ? 'stopped' : 'still running', command }
}

export async function stopRecorded() {
  const state = readState()
  const notes = []
  if (!state) {
    notes.push('no instance recorded for this RUN_ID')
    return { ok: true, notes }
  }
  const browserFile = path.join(paths().state, 'browser.pid')
  if (fs.existsSync(browserFile)) {
    const browserPids = fs.readFileSync(browserFile, 'utf8').split(/\s+/).map(Number).filter(Boolean)
    for (const browserPid of browserPids) {
      const browser = await stopPid(browserPid, (command) => /chrome|chromium/i.test(command))
      if (browser.reason === 'refused') {
        notes.push(`refused to kill browser pid ${browserPid}: ${browser.command}`)
        return { ok: false, notes }
      }
      notes.push(browser.reason === 'not running'
        ? `browser pid ${browserPid} was not running`
        : `stopped browser pid ${browserPid}`)
    }
  }
  const preview = await stopPid(state.pid, (command) => previewCommandOk(command, state.port))
  if (preview.reason === 'refused') {
    notes.push(`refused to kill preview pid ${state.pid}: ${preview.command}`)
    return { ok: false, notes }
  }
  if (preview.reason === 'still running') {
    notes.push(`preview pid ${state.pid} did not exit`)
    return { ok: false, notes }
  }
  notes.push(preview.reason === 'not running'
    ? `preview pid ${state.pid} was not running`
    : `stopped preview pid ${state.pid}`)
  fs.rmSync(paths().state, { recursive: true, force: true })
  notes.push(`kept evidence ${paths().evidence}`)
  return { ok: true, notes }
}

export function tail(file, maxLines = 40) {
  if (!fs.existsSync(file)) return ''
  const lines = fs.readFileSync(file, 'utf8').split('\n')
  return lines.slice(-maxLines).join('\n')
}

export function requireVite() {
  const viteBin = path.join(repoRoot, 'node_modules/vite/bin/vite.js')
  if (!fs.existsSync(viteBin)) {
    console.error('node_modules is missing. From the repo root run: npm ci')
    process.exit(1)
  }
  return viteBin
}

export function distIsPrerendered() {
  const file = path.join(repoRoot, 'dist/index.html')
  if (!fs.existsSync(file)) return false
  const html = fs.readFileSync(file, 'utf8')
  return html.includes('id="hero-title"')
    && !/<div id="root">\s*<\/div>/.test(html)
    && !html.includes('/src/main.tsx')
}

export async function importPlaywright() {
  const { createRequire } = await import('node:module')
  const require = createRequire(import.meta.url)
  try {
    return require('playwright')
  } catch {
    try {
      return require('playwright-core')
    } catch {
      return require(process.env.PW_PATH || '/tmp/pw/node_modules/playwright-core')
    }
  }
}

export async function launchBrowser(pw) {
  const args = ['--disable-dev-shm-usage']
  try {
    return await pw.chromium.launch({ channel: 'chrome', args })
  } catch {
    return await pw.chromium.launch({ args })
  }
}
