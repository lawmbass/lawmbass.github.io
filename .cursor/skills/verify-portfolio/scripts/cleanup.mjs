#!/usr/bin/env node
// Stop the preview and browser this verification run started. Keep evidence.
// Usage: .cursor/skills/verify-portfolio/scripts/cleanup.mjs
import { paths, repoRoot, stopRecorded } from './lib.mjs'

const usage = `Usage: .cursor/skills/verify-portfolio/scripts/cleanup.mjs

Kills the vite preview pid, and a browser pid only if drive.mjs was interrupted,
for this RUN_ID. A pid is killed only when its command line is that preview or
Chrome. Removes the state directory. Leaves the evidence directory in place.

Env: RUN_ID, VERIFY_ROOT, VERIFY_OUT.
`

if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(usage)
  process.exit(0)
}

process.chdir(repoRoot)
const result = await stopRecorded()
for (const line of result.notes) console.log(line)
console.log(`evidence: ${paths().evidence}`)
process.exit(result.ok ? 0 : 1)
