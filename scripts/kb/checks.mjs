import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import YAML from 'yaml'
import { blobExists, catBlob, diffBlobs, numstatBlobs, hashObject } from './git.mjs'

export function checkStale(model, cwd) {
  const out = []
  for (const doc of model.docs) {
    if (!doc.deps) continue
    for (const dep of doc.deps) {
      const d = model.decisions.get(dep.id)
      const currentHash = d.hash.slice(0, 8)
      if (currentHash === dep.hash) continue
      const oldAvailable = blobExists(dep.hash, { cwd })
      let patch = ''
      let added = 0
      let removed = 0
      if (oldAvailable) {
        hashObject(d.file, { write: true, cwd })
        patch = diffBlobs(dep.hash, d.hash, { cwd })
        ;({ added, removed } = numstatBlobs(dep.hash, d.hash, { cwd }))
      }
      out.push({
        file: doc.file, id: dep.id, storedHash: dep.hash, currentHash,
        oldAvailable, patch, added, removed,
      })
    }
  }
  return out
}

export function checkUnlinked(model) {
  return model.docs.filter((d) => d.deps === null).map((d) => d.file)
}

export function checkOutdatedRefs(model) {
  const out = []
  for (const doc of model.docs) {
    if (!doc.deps) continue
    for (const dep of doc.deps) {
      const d = model.decisions.get(dep.id)
      if (d.supersededBy) {
        out.push({ file: doc.file, id: dep.id, kind: 'superseded', replacement: [d.supersededBy] })
      } else if (d.amendedBy.length > 0) {
        out.push({ file: doc.file, id: dep.id, kind: 'amended', replacement: [...d.amendedBy] })
      }
    }
  }
  return out
}

export function loadFacts(cwd) {
  const p = join(cwd, 'decisions/facts.yml')
  if (!existsSync(p)) return new Map()
  const raw = YAML.parse(readFileSync(p, 'utf8')) ?? {}
  return new Map(
    Object.entries(raw).map(([key, v]) => [
      key,
      { value: v?.value ?? '', owner: v?.owner ?? null, forbidden: v?.forbidden ?? [] },
    ]),
  )
}

export function checkFacts(model, cwd, facts) {
  const out = []
  if (facts.size === 0) return out
  for (const doc of model.docs) {
    if (!doc.factsCheck) continue
    const lines = readFileSync(join(cwd, doc.file), 'utf8').split('\n')
    lines.forEach((text, i) => {
      for (const [key, fact] of facts) {
        for (const forbidden of fact.forbidden) {
          if (text.includes(forbidden)) {
            out.push({ file: doc.file, line: i + 1, forbidden, key, value: fact.value })
          }
        }
      }
    })
  }
  return out
}
