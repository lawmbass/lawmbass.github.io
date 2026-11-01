#!/usr/bin/env node
// Start the prerendered portfolio preview for verification.
// Usage: .cursor/skills/verify-portfolio/scripts/launch.mjs
import { spawn, spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { setTimeout as sleep } from 'node:timers/promises'
import {
  alive,
  distIsPrerendered,
  paths,
  previewCommandOk,
  readState,
  repoRoot,
  requireVite,
  runDoctor,
  stopRecorded,
  tail,
  writeState,
  cmdline,
} from './lib.mjs'

const usage = `Usage: .cursor/skills/verify-portfolio/scripts/launch.mjs

Builds dist/ (unless SKIP_BUILD=1) and starts vite preview.

Env:
  RUN_ID        instance id (default local)
  PORT          preview port (default 4173)
  HOST          bind address (default 127.0.0.1)
  SKIP_BUILD    1 to serve the existing prerendered dist/
  VERIFY_ROOT   state and evidence parent (default /tmp/verify-portfolio/$RUN_ID)
  VERIFY_OUT    evidence directory (default $VERIFY_ROOT/evidence)

Prints ready: yes only after the same checks as doctor.mjs pass.
Refuses to start when this RUN_ID already has a live preview. Run cleanup.mjs first.
`

if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(usage)
  process.exit(0)
}

process.chdir(repoRoot)
const viteBin = requireVite()
const port = Number(process.env.PORT || 4173)
const host = process.env.HOST || '127.0.0.1'
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  console.error(`PORT must be an integer from 1 to 65535, got ${process.env.PORT}`)
  process.exit(2)
}

const existing = readState()
if (existing && alive(existing.pid) && previewCommandOk(cmdline(existing.pid), existing.port)) {
  console.error(`A preview for RUN_ID=${existing.runId} is already running (pid ${existing.pid}, ${existing.base}).`)
  console.error('Run cleanup.mjs before launching again so the preview is not a stale build.')
  process.exit(1)
}

const dirs = paths()
fs.mkdirSync(dirs.state, { recursive: true })
fs.mkdirSync(dirs.evidence, { recursive: true })

if (process.env.SKIP_BUILD === '1') {
  if (!distIsPrerendered()) {
    console.error('SKIP_BUILD=1 but dist/index.html is not a prerendered portfolio. Run launch without SKIP_BUILD.')
    process.exit(1)
  }
  console.log('SKIP_BUILD=1, using the existing dist/')
} else {
  const build = spawnSync('npm', ['run', 'build'], { cwd: repoRoot, stdio: 'inherit' })
  if (build.status !== 0) process.exit(build.status || 1)
  if (!distIsPrerendered()) {
    console.error('npm run build finished but dist/index.html has no prerendered hero.')
    process.exit(1)
  }
}

const log = path.join(dirs.state, 'preview.log')
const base = `http://${host}:${port}/`
const fd = fs.openSync(log, 'w')
const child = spawn(process.execPath, [viteBin, 'preview', '--host', host, '--port', String(port), '--strictPort'], {
  cwd: repoRoot,
  detached: true,
  stdio: ['ignore', fd, fd],
})
fs.closeSync(fd)
child.unref()

const state = {
  pid: child.pid,
  port,
  host,
  base,
  runId: dirs.runId,
  evidence: dirs.evidence,
  log,
  startedAt: new Date().toISOString(),
}
writeState(state)

let ready = null
for (let i = 0; i < 80; i++) {
  if (!alive(child.pid)) {
    console.error('vite preview exited before it was ready.')
    console.error(tail(log))
    await stopRecorded()
    process.exit(1)
  }
  ready = await runDoctor()
  if (ready.ok) break
  await sleep(250)
}

if (!ready?.ok) {
  console.error('preview stayed unhealthy.')
  if (ready) console.error(ready.lines.join('\n'))
  console.error(tail(log))
  await stopRecorded()
  process.exit(1)
}

console.log(`run_id: ${dirs.runId}`)
console.log(`base: ${base}`)
console.log(`pid: ${child.pid}`)
console.log(`evidence: ${dirs.evidence}`)
console.log(`log: ${log}`)
console.log(ready.lines.join('\n'))
console.log('ready: yes')
