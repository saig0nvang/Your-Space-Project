import YAML from 'yaml'

const FM_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/

export function readFrontmatter(text) {
  const m = FM_RE.exec(text)
  if (!m) return { data: null, body: text }
  return { data: YAML.parse(m[1]) ?? {}, body: text.slice(m[0].length) }
}

export function writeFrontmatter(text, data) {
  const doc = new YAML.Document(data)
  for (const key of ['derives_from', 'amended_by']) {
    const node = doc.get(key, true)
    if (node && Array.isArray(node.items)) node.flow = true
  }
  const yaml = doc.toString({ flowCollectionPadding: false, lineWidth: 0 }).trimEnd()
  const block = `---\n${yaml}\n---\n`
  const m = FM_RE.exec(text)
  return m ? block + text.slice(m[0].length) : block + text
}
