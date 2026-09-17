import { test } from 'node:test'
import assert from 'node:assert/strict'
import { makeRepo } from './testutil.mjs'
import { loadModel } from './model.mjs'

function seed(r, { d3Extra = '', d3bExtra = '' } = {}) {
  r.write('decisions/D3-cloud.md',
    `---\nid: D3\ntitle: Cloud inpainting\nstatus: amended\ndate: 2026-07-23\namended_by: [D3b]\n---\nthan bai D3\n${d3Extra}`)
  r.write('decisions/D3b-depth.md',
    `---\nid: D3b\ntitle: Depth server-side\nstatus: accepted\ndate: 2026-07-24\namends: D3\n---\nthan bai D3b\n${d3bExtra}`)
  r.write('Product/PRD.md', '---\nderives_from: [D3@aaaaaaaa]\n---\n# PRD\n')
  r.commit('seed')
}

test('nạp được quyết định và tài liệu, không lỗi cấu trúc', () => {
  const r = makeRepo()
  try {
    seed(r)
    const m = loadModel(r.dir)
    assert.deepEqual(m.errors, [])
    assert.equal(m.decisions.size, 2)
    assert.equal(m.decisions.get('D3').amendedBy[0], 'D3b')
    assert.equal(m.decisions.get('D3b').amends, 'D3')
    const prd = m.docs.find((d) => d.file === 'Product/PRD.md')
    assert.deepEqual(prd.deps, [{ id: 'D3', hash: 'aaaaaaaa' }])
  } finally { r.cleanup() }
})

test('deps null khi thiếu derives_from, [] khi khai tường minh', () => {
  const r = makeRepo()
  try {
    seed(r)
    r.write('README.md', '# Readme\n')
    r.write('DESIGN.md', '---\nderives_from: []\n---\n# Design\n')
    r.commit('them doc')
    const m = loadModel(r.dir)
    assert.equal(m.docs.find((d) => d.file === 'README.md').deps, null)
    assert.deepEqual(m.docs.find((d) => d.file === 'DESIGN.md').deps, [])
  } finally { r.cleanup() }
})

test('loại trừ apps/web, decisions/, CREDITS.md, CLAUDE.md khỏi tập tài liệu', () => {
  const r = makeRepo()
  try {
    seed(r)
    r.write('apps/web/README.md', '# web\n')
    r.write('CLAUDE.md', '# claude\n')
    r.write('Assets/CREDITS.md', '# credits\n')
    r.commit('them file bi loai')
    const files = loadModel(r.dir).docs.map((d) => d.file)
    assert.deepEqual(files, ['Product/PRD.md'])
  } finally { r.cleanup() }
})

test('lỗi cấu trúc: trùng id', () => {
  const r = makeRepo()
  try {
    seed(r)
    r.write('decisions/D3-trung.md', '---\nid: D3\ntitle: Trung\nstatus: accepted\ndate: 2026-08-01\n---\nx\n')
    r.commit('trung id')
    assert.match(loadModel(r.dir).errors.join('\n'), /trùng id D3/)
  } finally { r.cleanup() }
})

test('lỗi cấu trúc: derives_from trỏ id không tồn tại', () => {
  const r = makeRepo()
  try {
    seed(r)
    r.write('Product/PRD.md', '---\nderives_from: [D9@aaaaaaaa]\n---\n# PRD\n')
    r.commit('id la')
    assert.match(loadModel(r.dir).errors.join('\n'), /D9/)
  } finally { r.cleanup() }
})

test('lỗi cấu trúc: hai đầu cạnh lệch nhau', () => {
  const r = makeRepo()
  try {
    seed(r)
    r.write('decisions/D3-cloud.md',
      '---\nid: D3\ntitle: Cloud inpainting\nstatus: accepted\ndate: 2026-07-23\n---\nthan bai D3\n')
    r.commit('go amended_by')
    const errs = loadModel(r.dir).errors.join('\n')
    assert.match(errs, /D3b/)
    assert.match(errs, /amend/)
  } finally { r.cleanup() }
})

test('lỗi cấu trúc: status không khớp quan hệ', () => {
  const r = makeRepo()
  try {
    seed(r)
    r.write('decisions/D3-cloud.md',
      '---\nid: D3\ntitle: Cloud inpainting\nstatus: accepted\ndate: 2026-07-23\namended_by: [D3b]\n---\nthan bai D3\n')
    r.commit('sai status')
    assert.match(loadModel(r.dir).errors.join('\n'), /status/)
  } finally { r.cleanup() }
})
