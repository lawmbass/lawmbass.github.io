#!/usr/bin/env node
// Read-only check that the preview started by launch.mjs is worth driving.
// Usage: .cursor/skills/verify-portfolio/scripts/doctor.mjs
import { repoRoot, runDoctor } from './lib.mjs'

const usage = `Usage: .cursor/skills/verify-portfolio/scripts/doctor.mjs

One GET of the preview recorded for RUN_ID, plus a read of its pid.
Prints worth_driving: yes and exits 0 only when the process is the preview
this run started, it owns the port, and the HTML is the prerendered portfolio
with no phone-shaped number. Does not click, type, or write evidence.

Env: RUN_ID, VERIFY_ROOT, PRIVATE_DIGITS (optional; never commit the value).
`

if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(usage)
  process.exit(0)
}

process.chdir(repoRoot)
const result = await runDoctor()
console.log(result.lines.join('\n'))
process.exit(result.ok ? 0 : 1)
