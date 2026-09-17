import { test } from 'node:test'
import assert from 'node:assert/strict'
import { makeRepo } from './testutil.mjs'
import { hashObject } from './git.mjs'
import { loadModel } from './model.mjs'
import { checkStale, checkUnlinked, checkOutdatedRefs, loadFacts, checkFacts } from './checks.mjs'

function seedAcked(r) {
  r.write('decisions/D6-so-lieu.md',
    '---\nid: D6\ntitle: Bo so thi truong\nstatus: accepted\ndate: 2026-07-23\n---\nTAM 9.76B\n')
  r.commit('seed decision')
  const sha = hashObject('decisions/D6-so-lieu.md', { cwd: r.dir }).slice(0, 8)
  r.write('Pitch/Memo.md', `---\nderives_from: [D6@${sha}]\n---\n# Memo\nTAM 9.76B\n`)
  r.commit('seed doc')
  return sha
}

test('không lệch hash thì không có tài liệu stale', () => {
  const r = makeRepo()
  try {
    seedAcked(r)
    assert.deepEqual(checkStale(loadModel(r.dir), r.dir), [])
  } finally { r.cleanup() }
})

test('sửa quyết định làm tài liệu stale và patch chứa dòng đã đổi', () => {
  const r = makeRepo()
  try {
    seedAcked(r)
    r.write('decisions/D6-so-lieu.md',
      '---\nid: D6\ntitle: Bo so thi truong\nstatus: accepted\ndate: 2026-07-23\n---\nTAM 12B\n')
    r.commit('sua D6')
    const stale = checkStale(loadModel(r.dir), r.dir)
    assert.equal(stale.length, 1)
    assert.equal(stale[0].file, 'Pitch/Memo.md')
    assert.equal(stale[0].id, 'D6')
    assert.equal(stale[0].oldAvailable, true)
    assert.match(stale[0].patch, /-TAM 9\.76B/)
    assert.match(stale[0].patch, /\+TAM 12B/)
    assert.equal(stale[0].added, 1)
    assert.equal(stale[0].removed, 1)
  } finally { r.cleanup() }
})

test('oldAvailable false khi blob cũ không có trong kho object', () => {
  const r = makeRepo()
  try {
    seedAcked(r)
    r.write('Pitch/Memo.md', '---\nderives_from: [D6@deadbeef]\n---\n# Memo\n')
    r.commit('hash la')
    const stale = checkStale(loadModel(r.dir), r.dir)
    assert.equal(stale[0].oldAvailable, false)
    assert.equal(stale[0].patch, '')
  } finally { r.cleanup() }
})

test('checkUnlinked chỉ bắt tài liệu thiếu derives_from', () => {
  const r = makeRepo()
  try {
    seedAcked(r)
    r.write('README.md', '# Readme\n')
    r.write('DESIGN.md', '---\nderives_from: []\n---\n# Design\n')
    r.commit('them doc')
    assert.deepEqual(checkUnlinked(loadModel(r.dir)), ['README.md'])
  } finally { r.cleanup() }
})

test('checkOutdatedRefs bắt tài liệu trỏ vào quyết định đã bị bổ sung dù hash không đổi', () => {
  const r = makeRepo()
  try {
    r.write('decisions/D3-cloud.md',
      '---\nid: D3\ntitle: Cloud\nstatus: amended\ndate: 2026-07-23\namended_by: [D3b]\n---\nthan bai\n')
    r.write('decisions/D3b-depth.md',
      '---\nid: D3b\ntitle: Depth\nstatus: accepted\ndate: 2026-07-24\namends: D3\n---\nthan bai\n')
    r.commit('seed')
    const sha = hashObject('decisions/D3-cloud.md', { cwd: r.dir }).slice(0, 8)
    r.write('Product/PRD.md', `---\nderives_from: [D3@${sha}]\n---\n# PRD\n`)
    r.commit('doc')
    const model = loadModel(r.dir)
    assert.deepEqual(checkStale(model, r.dir), [])
    const out = checkOutdatedRefs(model)
    assert.deepEqual(out, [{ file: 'Product/PRD.md', id: 'D3', kind: 'amended', replacement: ['D3b'] }])
  } finally { r.cleanup() }
})

test('checkFacts báo file và số dòng của chuỗi bị cấm', () => {
  const r = makeRepo()
  try {
    seedAcked(r)
    r.write('decisions/facts.yml',
      'tam:\n  value: "$9.76B"\n  owner: D6\n  forbidden: ["$5B"]\n')
    r.write('Pitch/Memo.md', '---\nderives_from: []\n---\n# Memo\n\nthi truong $5B mot nam\n')
    r.commit('facts')
    const model = loadModel(r.dir)
    const hits = checkFacts(model, r.dir, loadFacts(r.dir))
    assert.equal(hits.length, 1)
    assert.equal(hits[0].file, 'Pitch/Memo.md')
    assert.equal(hits[0].line, 6)
    assert.equal(hits[0].forbidden, '$5B')
    assert.equal(hits[0].value, '$9.76B')
  } finally { r.cleanup() }
})

test('checkFacts bỏ qua tài liệu có facts_check: false', () => {
  const r = makeRepo()
  try {
    seedAcked(r)
    r.write('decisions/facts.yml',
      'tam:\n  value: "$9.76B"\n  owner: D6\n  forbidden: ["$5B"]\n')
    r.write('Product_research/Audit.md',
      '---\nderives_from: []\nfacts_check: false\n---\nban cu ghi $5B\n')
    r.commit('facts')
    const model = loadModel(r.dir)
    assert.deepEqual(checkFacts(model, r.dir, loadFacts(r.dir)), [])
  } finally { r.cleanup() }
})
