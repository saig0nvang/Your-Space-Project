import { execFileSync } from 'node:child_process'

function git(args, { cwd } = {}) {
  return execFileSync('git', args, {
    cwd,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
    stdio: ['ignore', 'pipe', 'pipe'],
  })
}

export function repoRoot(opts) {
  return git(['rev-parse', '--show-toplevel'], opts).trim()
}

export function lsFiles(pattern, opts) {
  return git(['ls-files', '--', pattern], opts).split('\n').filter(Boolean)
}

export function hashObject(path, { write = false, cwd } = {}) {
  const args = ['hash-object']
  if (write) args.push('-w')
  args.push('--', path)
  return git(args, { cwd }).trim()
}

export function blobExists(sha, opts) {
  try {
    git(['cat-file', '-e', `${sha}^{blob}`], opts)
    return true
  } catch {
    return false
  }
}

export function catBlob(sha, opts) {
  return git(['cat-file', '-p', sha], opts)
}

export function diffBlobs(a, b, opts) {
  return git(['diff', '--no-color', a, b], opts)
}

export function numstatBlobs(a, b, opts) {
  const line = git(['diff', '--numstat', a, b], opts).split('\n').find(Boolean)
  if (!line) return { added: 0, removed: 0 }
  const [added, removed] = line.split('\t')
  return { added: Number(added) || 0, removed: Number(removed) || 0 }
}
