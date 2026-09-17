import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFrontmatter, writeFrontmatter } from './frontmatter.mjs'

test('readFrontmatter trả null khi không có khối frontmatter', () => {
  const { data, body } = readFrontmatter('# Tieu de\n\nnoi dung\n')
  assert.equal(data, null)
  assert.equal(body, '# Tieu de\n\nnoi dung\n')
})

test('readFrontmatter tách được data và body', () => {
  const src = '---\nderives_from: [D1@aaaaaaaa, D6@bbbbbbbb]\n---\n# Tieu de\n'
  const { data, body } = readFrontmatter(src)
  assert.deepEqual(data.derives_from, ['D1@aaaaaaaa', 'D6@bbbbbbbb'])
  assert.equal(body, '# Tieu de\n')
})

test('writeFrontmatter thêm khối mới mà không đụng thân bài', () => {
  const out = writeFrontmatter('# Tieu de\n\nnoi dung\n', { derives_from: ['D1@aaaaaaaa'] })
  assert.equal(out, '---\nderives_from: [D1@aaaaaaaa]\n---\n# Tieu de\n\nnoi dung\n')
})

test('writeFrontmatter thay khối cũ, giữ nguyên thân bài', () => {
  const src = '---\nderives_from: [D1@aaaaaaaa]\n---\n# Tieu de\n'
  const out = writeFrontmatter(src, { derives_from: ['D1@cccccccc'] })
  assert.equal(out, '---\nderives_from: [D1@cccccccc]\n---\n# Tieu de\n')
})

test('writeFrontmatter giữ các khoá khác và thứ tự của chúng', () => {
  const src = '---\nid: D3\ntitle: Cloud inpainting\n---\nthan bai\n'
  const { data } = readFrontmatter(src)
  data.status = 'amended'
  const out = writeFrontmatter(src, data)
  assert.equal(out, '---\nid: D3\ntitle: Cloud inpainting\nstatus: amended\n---\nthan bai\n')
})

test('body giữ nguyên khi có CRLF ở khối frontmatter', () => {
  const { data, body } = readFrontmatter('---\r\nid: D1\r\n---\r\nthan bai\n')
  assert.equal(data.id, 'D1')
  assert.equal(body, 'than bai\n')
})
