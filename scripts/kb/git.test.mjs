import { test } from 'node:test'
import assert from 'node:assert/strict'
import { makeRepo } from './testutil.mjs'
import { lsFiles, hashObject, blobExists, catBlob, numstatBlobs } from './git.mjs'

test('lsFiles chỉ trả file được git theo dõi', () => {
  const r = makeRepo()
  try {
    r.write('a.md', 'xin chao\n')
    r.write('b.txt', 'bo qua\n')
    r.commit('init')
    const files = lsFiles('*.md', { cwd: r.dir })
    assert.deepEqual(files, ['a.md'])
  } finally { r.cleanup() }
})

test('hashObject ổn định và blob truy lại được sau khi ghi', () => {
  const r = makeRepo()
  try {
    r.write('a.md', 'noi dung\n')
    const sha = hashObject('a.md', { write: true, cwd: r.dir })
    assert.match(sha, /^[0-9a-f]{40}$/)
    assert.equal(hashObject('a.md', { cwd: r.dir }), sha)
    assert.equal(blobExists(sha.slice(0, 8), { cwd: r.dir }), true)
    assert.equal(catBlob(sha.slice(0, 8), { cwd: r.dir }), 'noi dung\n')
  } finally { r.cleanup() }
})

test('blobExists false cho sha không có trong kho object', () => {
  const r = makeRepo()
  try {
    r.write('a.md', 'x\n')
    r.commit('init')
    assert.equal(blobExists('deadbeef', { cwd: r.dir }), false)
  } finally { r.cleanup() }
})

test('numstatBlobs đếm đúng số dòng thêm/bớt', () => {
  const r = makeRepo()
  try {
    r.write('a.md', 'mot\nhai\n')
    const a = hashObject('a.md', { write: true, cwd: r.dir })
    r.write('a.md', 'mot\nhai sua\nba\n')
    const b = hashObject('a.md', { write: true, cwd: r.dir })
    assert.deepEqual(numstatBlobs(a, b, { cwd: r.dir }), { added: 2, removed: 1 })
  } finally { r.cleanup() }
})
