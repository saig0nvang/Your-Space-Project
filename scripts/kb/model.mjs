import { readFileSync } from 'node:fs'
import { join, basename } from 'node:path'
import { lsFiles, hashObject } from './git.mjs'
import { readFrontmatter } from './frontmatter.mjs'

export function DOC_EXCLUDES(file) {
  if (file.startsWith('apps/web/')) return true
  if (file.startsWith('decisions/')) return true
  const base = basename(file)
  return base === 'CREDITS.md' || base === 'CLAUDE.md'
}

function asArray(v) {
  if (v === undefined || v === null) return []
  return Array.isArray(v) ? v : [v]
}

function loadDecisions(cwd, errors) {
  const decisions = new Map()
  for (const file of lsFiles('decisions/*.md', { cwd })) {
    const { data } = readFrontmatter(readFileSync(join(cwd, file), 'utf8'))
    if (!data || !data.id) {
      errors.push(`${file}: thiếu frontmatter hoặc thiếu khoá id`)
      continue
    }
    if (decisions.has(data.id)) {
      errors.push(`${file} và ${decisions.get(data.id).file}: trùng id ${data.id}`)
      continue
    }
    decisions.set(data.id, {
      id: data.id,
      file,
      title: data.title ?? data.id,
      status: data.status ?? 'accepted',
      date: data.date ?? null,
      supersedes: data.supersedes ?? null,
      supersededBy: data.superseded_by ?? null,
      amends: data.amends ?? null,
      amendedBy: asArray(data.amended_by),
      hash: hashObject(file, { cwd }),
    })
  }
  return decisions
}

function validateEdges(decisions, errors) {
  const get = (id) => decisions.get(id)
  for (const d of decisions.values()) {
    if (d.supersedes) {
      const t = get(d.supersedes)
      if (!t) errors.push(`${d.file}: supersedes trỏ tới ${d.supersedes} không tồn tại`)
      else if (t.supersededBy !== d.id)
        errors.push(`${d.id} khai supersedes ${t.id}, nhưng ${t.id} không khai superseded_by ${d.id}`)
    }
    if (d.supersededBy) {
      const t = get(d.supersededBy)
      if (!t) errors.push(`${d.file}: superseded_by trỏ tới ${d.supersededBy} không tồn tại`)
      else if (t.supersedes !== d.id)
        errors.push(`${d.id} khai superseded_by ${t.id}, nhưng ${t.id} không khai supersedes ${d.id}`)
    }
    if (d.amends) {
      const t = get(d.amends)
      if (!t) errors.push(`${d.file}: amends trỏ tới ${d.amends} không tồn tại`)
      else if (!t.amendedBy.includes(d.id))
        errors.push(`${d.id} khai amends ${t.id}, nhưng ${t.id} không khai amended_by chứa ${d.id}`)
    }
    for (const id of d.amendedBy) {
      const t = get(id)
      if (!t) errors.push(`${d.file}: amended_by trỏ tới ${id} không tồn tại`)
      else if (t.amends !== d.id)
        errors.push(`${d.id} khai amended_by chứa ${id}, nhưng ${id} không khai amends ${d.id}`)
    }

    const expected = d.supersededBy ? 'superseded' : d.amendedBy.length > 0 ? 'amended' : 'accepted'
    if (d.status !== expected)
      errors.push(`${d.id}: status là "${d.status}" nhưng quan hệ cho thấy phải là "${expected}"`)
  }
}

function parseDep(raw, file, decisions, errors) {
  const m = /^([A-Za-z0-9]+)@([0-9a-f]{8})$/.exec(String(raw).trim())
  if (!m) {
    errors.push(`${file}: derives_from "${raw}" sai định dạng, cần dạng D3@a1b2c3d4`)
    return null
  }
  const [, id, hash] = m
  if (!decisions.has(id)) {
    errors.push(`${file}: derives_from trỏ tới quyết định ${id} không tồn tại`)
    return null
  }
  return { id, hash }
}

export function loadModel(cwd = process.cwd()) {
  const errors = []
  const decisions = loadDecisions(cwd, errors)
  validateEdges(decisions, errors)

  const docs = []
  for (const file of lsFiles('*.md', { cwd })) {
    if (DOC_EXCLUDES(file)) continue
    const text = readFileSync(join(cwd, file), 'utf8')
    const { data } = readFrontmatter(text)
    const raw = data?.derives_from
    const deps =
      raw === undefined || raw === null
        ? null
        : asArray(raw)
            .map((x) => parseDep(x, file, decisions, errors))
            .filter(Boolean)
    docs.push({ file, deps, factsCheck: data?.facts_check !== false })
  }

  return { decisions, docs, errors }
}
