import { test } from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { makeRepo } from './testutil.mjs'
import { hashObject } from './git.mjs'

const KB = fileURLToPath(new URL('../kb.mjs', import.meta.url))

function kb(dir, ...args) {
  const r = spawnSync(process.execPath, [KB, ...args], { cwd: dir, encoding: 'utf8' })
  return { code: r.status, out: r.stdout + r.stderr }
}

function seed(r) {
  r.write('decisions/D6-so-lieu.md',
    '---\nid: D6\ntitle: Bo so thi truong\nstatus: accepted\ndate: 2026-07-23\n---\nTAM 9.76B\n')
  r.commit('seed decision')
  const sha = hashObject('decisions/D6-so-lieu.md', { cwd: r.dir }).slice(0, 8)
  r.write('Pitch/Memo.md', `---\nderives_from: [D6@${sha}]\n---\n# Memo\n`)
  r.commit('seed doc')
  return sha
}

test('check sạch thoát 0', () => {
  const r = makeRepo()
  try {
    seed(r)
    const { code, out } = kb(r.dir, 'check')
    assert.equal(code, 0)
    assert.match(out, /Sạch/)
  } finally { r.cleanup() }
})

test('check có drift thoát 1 và in tên tài liệu', () => {
  const r = makeRepo()
  try {
    seed(r)
    r.write('decisions/D6-so-lieu.md',
      '---\nid: D6\ntitle: Bo so thi truong\nstatus: accepted\ndate: 2026-07-23\n---\nTAM 12B\n')
    r.commit('sua D6')
    const { code, out } = kb(r.dir, 'check')
    assert.equal(code, 1)
    assert.match(out, /Pitch\/Memo\.md/)
  } finally { r.cleanup() }
})

test('--warn ép mã thoát về 0 dù có drift', () => {
  const r = makeRepo()
  try {
    seed(r)
    r.write('decisions/D6-so-lieu.md',
      '---\nid: D6\ntitle: Bo so thi truong\nstatus: accepted\ndate: 2026-07-23\n---\nTAM 12B\n')
    r.commit('sua D6')
    assert.equal(kb(r.dir, 'check', '--warn').code, 0)
  } finally { r.cleanup() }
})

test('lỗi cấu trúc thoát 2', () => {
  const r = makeRepo()
  try {
    seed(r)
    r.write('decisions/D6-trung.md',
      '---\nid: D6\ntitle: Trung\nstatus: accepted\ndate: 2026-08-01\n---\nx\n')
    r.commit('trung id')
    const { code, out } = kb(r.dir, 'check')
    assert.equal(code, 2)
    assert.match(out, /trùng id D6/)
  } finally { r.cleanup() }
})

test('--warn không che lỗi cấu trúc', () => {
  const r = makeRepo()
  try {
    seed(r)
    r.write('decisions/D6-trung.md',
      '---\nid: D6\ntitle: Trung\nstatus: accepted\ndate: 2026-08-01\n---\nx\n')
    r.commit('trung id')
    assert.equal(kb(r.dir, 'check', '--warn').code, 2)
  } finally { r.cleanup() }
})

test('ack cập nhật hash và làm check sạch trở lại', () => {
  const r = makeRepo()
  try {
    seed(r)
    r.write('decisions/D6-so-lieu.md',
      '---\nid: D6\ntitle: Bo so thi truong\nstatus: accepted\ndate: 2026-07-23\n---\nTAM 12B\n')
    r.commit('sua D6')
    assert.equal(kb(r.dir, 'ack', 'Pitch/Memo.md').code, 0)
    const sha = hashObject('decisions/D6-so-lieu.md', { cwd: r.dir }).slice(0, 8)
    assert.match(readFileSync(join(r.dir, 'Pitch/Memo.md'), 'utf8'), new RegExp(`D6@${sha}`))
    assert.equal(kb(r.dir, 'check').code, 0)
  } finally { r.cleanup() }
})

test('ack với id tạo derives_from cho tài liệu chưa vào graph', () => {
  const r = makeRepo()
  try {
    seed(r)
    r.write('README.md', '# Readme\n')
    r.commit('them readme')
    assert.equal(kb(r.dir, 'ack', 'README.md', 'D6').code, 0)
    const sha = hashObject('decisions/D6-so-lieu.md', { cwd: r.dir }).slice(0, 8)
    const text = readFileSync(join(r.dir, 'README.md'), 'utf8')
    assert.match(text, new RegExp(`derives_from: \\[D6@${sha}\\]`))
    assert.match(text, /# Readme/)
  } finally { r.cleanup() }
})

test('impact liệt kê tài liệu phụ thuộc một quyết định', () => {
  const r = makeRepo()
  try {
    seed(r)
    const { code, out } = kb(r.dir, 'impact', 'D6')
    assert.equal(code, 0)
    assert.match(out, /Pitch\/Memo\.md/)
  } finally { r.cleanup() }
})

test('impact với id không tồn tại thoát 2', () => {
  const r = makeRepo()
  try {
    seed(r)
    assert.equal(kb(r.dir, 'impact', 'D99').code, 2)
  } finally { r.cleanup() }
})

test('frontmatter YAML hỏng thoát 2', () => {
  const r = makeRepo()
  try {
    seed(r)
    r.write('Pitch/Memo.md', '---\nderives_from: [D6@aaaaaaaa\n  loi: [[[\n---\n# Memo\n')
    r.commit('yaml hong')
    const { code, out } = kb(r.dir, 'check')
    assert.equal(code, 2)
    assert.match(out, /YAML/)
  } finally { r.cleanup() }
})

test('graph xuất Mermaid', () => {
  const r = makeRepo()
  try {
    seed(r)
    const { code, out } = kb(r.dir, 'graph')
    assert.equal(code, 0)
    assert.match(out, /graph LR/)
    assert.match(out, /D6/)
  } finally { r.cleanup() }
})
