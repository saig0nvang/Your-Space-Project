import { execFileSync } from 'node:child_process'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, dirname } from 'node:path'

export function makeRepo() {
  const dir = mkdtempSync(join(tmpdir(), 'kb-test-'))
  const run = (args) => execFileSync('git', args, { cwd: dir, encoding: 'utf8' })
  run(['init', '-q', '-b', 'main'])
  run(['config', 'user.email', 'test@example.com'])
  run(['config', 'user.name', 'kb test'])
  return {
    dir,
    write(rel, text) {
      const abs = join(dir, rel)
      mkdirSync(dirname(abs), { recursive: true })
      writeFileSync(abs, text, 'utf8')
    },
    commit(msg) {
      run(['add', '-A'])
      run(['commit', '-q', '-m', msg])
    },
    cleanup() {
      rmSync(dir, { recursive: true, force: true })
    },
  }
}
