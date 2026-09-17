#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { repoRoot, hashObject } from './kb/git.mjs'
import { readFrontmatter, writeFrontmatter } from './kb/frontmatter.mjs'
import { loadModel } from './kb/model.mjs'
import { checkStale, checkUnlinked, checkOutdatedRefs, loadFacts, checkFacts } from './kb/checks.mjs'
import { formatReport, formatErrors } from './kb/report.mjs'

const argv = process.argv.slice(2)
const cmd = argv[0]
const warn = argv.includes('--warn')
const args = argv.slice(1).filter((a) => !a.startsWith('--'))
const cwd = repoRoot()

function finish(code) {
  process.exit(warn && code === 1 ? 0 : code)
}

function modelOrExit() {
  let model
  try {
    model = loadModel(cwd)
  } catch (err) {
    process.stdout.write(formatErrors([`không đọc được YAML: ${err.message}`]))
    process.exit(2)
  }
  if (model.errors.length > 0) {
    process.stdout.write(formatErrors(model.errors))
    process.exit(2)
  }
  return model
}

function cmdCheck() {
  const model = modelOrExit()
  const report = {
    stale: checkStale(model, cwd),
    unlinked: checkUnlinked(model),
    outdated: checkOutdatedRefs(model),
    facts: checkFacts(model, cwd, loadFacts(cwd)),
  }
  process.stdout.write(formatReport(report))
  const dirty = Object.values(report).some((v) => v.length > 0)
  finish(dirty ? 1 : 0)
}

function cmdImpact() {
  const id = args[0]
  const model = modelOrExit()
  if (!id || !model.decisions.has(id)) {
    process.stdout.write(`Không có quyết định nào mang id "${id}".\n`)
    process.exit(2)
  }
  const hits = model.docs.filter((d) => d.deps?.some((x) => x.id === id))
  const d = model.decisions.get(id)
  process.stdout.write(`${id} — ${d.title}\nSửa quyết định này sẽ động tới ${hits.length} tài liệu:\n`)
  for (const h of hits) process.stdout.write(`  ${h.file}\n`)
  process.exit(0)
}

function cmdAck() {
  const [file, ...ids] = args
  const model = modelOrExit()
  if (!file) {
    process.stdout.write('Cú pháp: kb ack <đường-dẫn> [id...]\n')
    process.exit(2)
  }
  const doc = model.docs.find((d) => d.file === file)
  if (!doc) {
    process.stdout.write(`"${file}" không nằm trong tập tài liệu được xét.\n`)
    process.exit(2)
  }
  const targets = ids.length > 0 ? ids : (doc.deps ?? []).map((d) => d.id)
  if (targets.length === 0) {
    process.stdout.write(`${file} chưa có derives_from — truyền kèm id, ví dụ: kb ack ${file} D3 D6\n`)
    process.exit(2)
  }
  const kept = new Map((doc.deps ?? []).map((d) => [d.id, d.hash]))
  for (const id of targets) {
    const d = model.decisions.get(id)
    if (!d) {
      process.stdout.write(`Không có quyết định nào mang id "${id}".\n`)
      process.exit(2)
    }
    hashObject(d.file, { write: true, cwd })
    kept.set(id, d.hash.slice(0, 8))
  }
  const abs = join(cwd, file)
  const text = readFileSync(abs, 'utf8')
  const data = readFrontmatter(text).data ?? {}
  data.derives_from = [...kept].map(([id, hash]) => `${id}@${hash}`)
  writeFileSync(abs, writeFrontmatter(text, data), 'utf8')
  process.stdout.write(`Đã đóng dấu ${file}: ${data.derives_from.join(', ')}\n`)
  process.exit(0)
}

function cmdGraph() {
  const model = modelOrExit()
  const id = (s) => s.replace(/[^A-Za-z0-9]/g, '_')
  const out = ['graph LR']
  for (const d of model.decisions.values()) {
    out.push(`  ${id(d.id)}["${d.id} — ${d.title}"]`)
  }
  for (const doc of model.docs) {
    if (!doc.deps || doc.deps.length === 0) continue
    out.push(`  ${id(doc.file)}("${doc.file}")`)
    for (const dep of doc.deps) out.push(`  ${id(dep.id)} --> ${id(doc.file)}`)
  }
  process.stdout.write(out.join('\n') + '\n')
  process.exit(0)
}

const commands = { check: cmdCheck, impact: cmdImpact, ack: cmdAck, graph: cmdGraph }
const run = commands[cmd]
if (!run) {
  process.stdout.write('Cú pháp: kb <check|impact|ack|graph> [tham số] [--warn]\n')
  process.exit(2)
}
run()
