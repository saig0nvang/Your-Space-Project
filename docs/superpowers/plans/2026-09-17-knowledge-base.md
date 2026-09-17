# Knowledge Base Quyết định ↔ Tài liệu — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dựng hạ tầng phát hiện drift giữa 7 bản ghi quyết định và ~26 tài liệu, để khi một quyết định đổi thì máy chỉ ra chính xác tài liệu nào vừa hết đúng.

**Architecture:** Mỗi quyết định là một file markdown bất biến trong `decisions/`. Mỗi tài liệu khai `derives_from: [D1@<blob>]` trong frontmatter, trong đó `<blob>` là git blob SHA của file quyết định lúc tài liệu được xác nhận khớp lần cuối. `scripts/kb.mjs` so hash hiện tại với hash đã lưu; lệch thì lấy nguyên văn bản cũ ra khỏi kho object của git và in diff thật. Không có cơ sở dữ liệu, không có bước build — toàn bộ trạng thái nằm trong git.

**Tech Stack:** Node 20 ESM (`.mjs`), `node:test`, `node:child_process` gọi git CLI, thư viện `yaml`.

**Spec:** `docs/superpowers/specs/2026-09-17-knowledge-base-design.md`

## Global Constraints

- Node 20.20.2 (`.nvmrc`); mọi file nguồn là ESM `.mjs`.
- pnpm 10.34.5. Phụ thuộc mới duy nhất được phép: `yaml`, cài làm devDependency ở **root** workspace.
- Test dùng `node:test` dựng sẵn trong Node 20. File test đặt tên `*.test.mjs` cạnh file nguồn trong `scripts/kb/`.
- Mã thoát: `0` sạch · `1` có drift hoặc vi phạm · `2` lỗi cấu trúc. Cờ `--warn` ép mọi trường hợp về `0`.
- Hash lưu trong `derives_from` là **8 ký tự đầu** của git blob SHA.
- Mọi chuỗi người đọc in ra màn hình viết bằng **tiếng Việt**.
- Task 1–6 **không được sửa nội dung** bất kỳ tài liệu nào trong `Product/`, `Product_research/`, `Pitch/`, `Governance-and-Risk/`, `README.md`. Task 7–8 chỉ được thêm frontmatter và header đóng băng, không biên tập thân bài.
- Tập tài liệu được xét = `git ls-files '*.md'` trừ: đường dẫn bắt đầu bằng `apps/web/`, bắt đầu bằng `decisions/`, hoặc có basename `CREDITS.md` / `CLAUDE.md`.

## File Structure

| File | Trách nhiệm |
|---|---|
| `scripts/kb/git.mjs` | Bọc git CLI: `lsFiles`, `hashObject`, `blobExists`, `catBlob`, `diffBlobs`, `numstatBlobs`. Nơi duy nhất gọi `execFileSync`. |
| `scripts/kb/frontmatter.mjs` | Đọc/ghi khối frontmatter YAML trong markdown, giữ nguyên thân bài. |
| `scripts/kb/model.mjs` | Nạp `decisions/` và tập tài liệu thành model trong bộ nhớ; kiểm tra cấu trúc (lỗi mã thoát 2). |
| `scripts/kb/checks.mjs` | Bốn phép kiểm tra tạo ra mã thoát 1: stale, chưa vào graph, trỏ tới quyết định lỗi thời, vi phạm `facts.yml`. |
| `scripts/kb/report.mjs` | Định dạng kết quả kiểm tra ra tiếng Việt cho terminal. |
| `scripts/kb.mjs` | CLI: phân tích tham số, gọi lệnh, quyết định mã thoát. |
| `scripts/kb/testutil.mjs` | Dựng repo git tạm trong thư mục temp cho test. |
| `.githooks/pre-commit` | Chạy `kb check --warn` mỗi lần commit. |
| `decisions/` | 7 file quyết định + `facts.yml`. |
| `.claude/skills/sync-decision/SKILL.md` | Skill `/sync-decision`. |

---

### Task 1: Scaffolding + bọc git CLI

**Files:**
- Modify: `package.json` (thêm devDependency `yaml` và 5 script `kb:*`)
- Create: `scripts/kb/git.mjs`
- Create: `scripts/kb/testutil.mjs`
- Test: `scripts/kb/git.test.mjs`

**Interfaces:**
- Consumes: không có.
- Produces:
  - `repoRoot(): string`
  - `lsFiles(pattern: string): string[]` — đường dẫn tương đối gốc repo
  - `hashObject(path: string, opts?: { write?: boolean }): string` — SHA 40 ký tự
  - `blobExists(sha: string): boolean`
  - `catBlob(sha: string): string`
  - `diffBlobs(a: string, b: string): string` — patch dạng text
  - `numstatBlobs(a: string, b: string): { added: number, removed: number }`
  - Từ `testutil.mjs`: `makeRepo(): { dir: string, write(rel, text): void, commit(msg): void, cleanup(): void }`

- [ ] **Step 1: Cài `yaml` và thêm script vào `package.json`**

```bash
pnpm add -w -D yaml
```

Sửa khối `"scripts"` trong `package.json` gốc thành:

```json
  "scripts": {
    "dev": "pnpm --filter web dev",
    "test": "pnpm -r test",
    "typecheck": "pnpm -r typecheck",
    "lint": "pnpm -r lint",
    "kb:check": "node scripts/kb.mjs check",
    "kb:impact": "node scripts/kb.mjs impact",
    "kb:ack": "node scripts/kb.mjs ack",
    "kb:graph": "node scripts/kb.mjs graph",
    "kb:test": "node --test scripts/kb/"
  }
```

- [ ] **Step 2: Viết `scripts/kb/testutil.mjs`**

```js
import { execFileSync } from 'node:child_process'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, dirname } from 'node:path'

export function makeRepo() {
  const dir = mkdtempSync(join(tmpdir(), 'kb-test-'))
  const run = (args) => execFileSync('git', args, { cwd: dir, encoding: 'utf8' })
  run(['init', '-q', '-b', 'main'])
  run(['config', 'user.email', 'test@example.com'])
  run(['config', 'user.name', 'kb test'])
  return {
    dir,
    write(rel, text) {
      const abs = join(dir, rel)
      mkdirSync(dirname(abs), { recursive: true })
      writeFileSync(abs, text, 'utf8')
    },
    commit(msg) {
      run(['add', '-A'])
      run(['commit', '-q', '-m', msg])
    },
    cleanup() {
      rmSync(dir, { recursive: true, force: true })
    },
  }
}
```

- [ ] **Step 3: Viết test thất bại cho `git.mjs`**

Tạo `scripts/kb/git.test.mjs`:

```js
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
```

- [ ] **Step 4: Chạy test, xác nhận FAIL**

Run: `pnpm kb:test`
Expected: FAIL — `Cannot find module './git.mjs'`

- [ ] **Step 5: Viết `scripts/kb/git.mjs`**

Mọi hàm nhận `opts.cwd` để test chạy được trong repo tạm; mặc định là thư mục hiện tại.

```js
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
```

- [ ] **Step 6: Chạy test, xác nhận PASS**

Run: `pnpm kb:test`
Expected: 4 test PASS

- [ ] **Step 7: Commit**

```bash
git add package.json pnpm-lock.yaml scripts/kb/git.mjs scripts/kb/git.test.mjs scripts/kb/testutil.mjs
git commit -m "feat(kb): bọc git CLI cho knowledge base"
```

---

### Task 2: Đọc/ghi frontmatter

**Files:**
- Create: `scripts/kb/frontmatter.mjs`
- Test: `scripts/kb/frontmatter.test.mjs`

**Interfaces:**
- Consumes: gói `yaml` (Task 1).
- Produces:
  - `readFrontmatter(text: string): { data: object | null, body: string }` — `data === null` khi file không có khối frontmatter
  - `writeFrontmatter(text: string, data: object): string` — trả về nội dung file mới, thân bài nguyên vẹn, `derives_from` xuất ở dạng flow `[a, b]`

- [ ] **Step 1: Viết test thất bại**

Tạo `scripts/kb/frontmatter.test.mjs`:

```js
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
```

- [ ] **Step 2: Chạy test, xác nhận FAIL**

Run: `pnpm kb:test`
Expected: FAIL — `Cannot find module './frontmatter.mjs'`

- [ ] **Step 3: Viết `scripts/kb/frontmatter.mjs`**

```js
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
  const yaml = doc.toString({ flowCollectionPadding: false }).trimEnd()
  const block = `---\n${yaml}\n---\n`
  const m = FM_RE.exec(text)
  return m ? block + text.slice(m[0].length) : block + text
}
```

`flowCollectionPadding: false` là bắt buộc: mặc định gói `yaml` xuất mảng flow thành
`[ D1@aaaaaaaa ]` có khoảng trắng trong ngoặc, không khớp định dạng spec `[D1@aaaaaaaa]`.

- [ ] **Step 4: Chạy test, xác nhận PASS**

Run: `pnpm kb:test`
Expected: 10 test PASS (4 của Task 1 + 6 mới)

- [ ] **Step 5: Commit**

```bash
git add scripts/kb/frontmatter.mjs scripts/kb/frontmatter.test.mjs
git commit -m "feat(kb): đọc/ghi frontmatter giữ nguyên thân bài"
```

---

### Task 3: Nạp model + kiểm tra cấu trúc

**Files:**
- Create: `scripts/kb/model.mjs`
- Test: `scripts/kb/model.test.mjs`

**Interfaces:**
- Consumes: `lsFiles`, `hashObject` (Task 1); `readFrontmatter` (Task 2).
- Produces:
  - `DOC_EXCLUDES: (path: string) => boolean`
  - `loadModel(cwd: string): { decisions: Map<string, Decision>, docs: Doc[], errors: string[] }`
  - `Decision = { id, file, title, status, date, supersedes, supersededBy, amends, amendedBy: string[], hash }` — `hash` là SHA 40 ký tự hiện tại của file
  - `Doc = { file, deps: Array<{ id, hash }> | null, factsCheck: boolean }` — `deps === null` nghĩa là **thiếu** `derives_from`; `deps === []` nghĩa là khai tường minh không phụ thuộc

`errors` không rỗng ⇒ CLI thoát mã 2.

- [ ] **Step 1: Viết test thất bại**

Tạo `scripts/kb/model.test.mjs`:

```js
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
```

- [ ] **Step 2: Chạy test, xác nhận FAIL**

Run: `pnpm kb:test`
Expected: FAIL — `Cannot find module './model.mjs'`

- [ ] **Step 3: Viết `scripts/kb/model.mjs`**

```js
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
```

- [ ] **Step 4: Chạy test, xác nhận PASS**

Run: `pnpm kb:test`
Expected: 17 test PASS

- [ ] **Step 5: Commit**

```bash
git add scripts/kb/model.mjs scripts/kb/model.test.mjs
git commit -m "feat(kb): nạp model quyết định/tài liệu + kiểm tra cấu trúc"
```

---

### Task 4: Bốn phép kiểm tra

**Files:**
- Create: `scripts/kb/checks.mjs`
- Test: `scripts/kb/checks.test.mjs`

**Interfaces:**
- Consumes: `loadModel` (Task 3); `blobExists`, `catBlob`, `diffBlobs`, `numstatBlobs` (Task 1).
- Produces:
  - `checkStale(model, cwd): Array<{ file, id, storedHash, currentHash, oldAvailable, patch, added, removed }>`
  - `checkUnlinked(model): string[]`
  - `checkOutdatedRefs(model): Array<{ file, id, kind: 'superseded' | 'amended', replacement: string[] }>`
  - `loadFacts(cwd): Map<string, { value, owner, forbidden: string[] }>` — trả Map rỗng nếu không có `decisions/facts.yml`
  - `checkFacts(model, cwd, facts): Array<{ file, line, forbidden, key, value }>`

`checkFacts` bỏ qua tài liệu có `factsCheck === false`, đọc từ khoá frontmatter `facts_check: false`.
Khoá này là **phần bổ sung so với spec §4.3** (spec chỉ mô tả `derives_from`); spec đã được cập nhật kèm theo. Khoá này tồn tại vì ba tài liệu meta (`Decisions_Log_2026-07-23.md`, `Doc_Sync_Plan_2026-07-23.md`, `Doc_Consistency_Audit_2026-07-23.md`) trích dẫn nguyên văn các giá trị đã bị loại bỏ để nói về chính việc loại bỏ chúng — quét chúng sẽ cho toàn báo động giả.

- [ ] **Step 1: Viết test thất bại**

Tạo `scripts/kb/checks.test.mjs`:

```js
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
```

Dòng 6 chứ không phải 5: `checkFacts` đếm 1-based trên **toàn** file kể cả khối frontmatter,
và fixture có một dòng trống trước dòng chứa chuỗi bị cấm. Đếm cả frontmatter là đúng — báo cáo
in ra `file:line` để nhảy thẳng tới dòng đó trong editor, nên số phải khớp cái editor hiển thị.

- [ ] **Step 2: Chạy test, xác nhận FAIL**

Run: `pnpm kb:test`
Expected: FAIL — `Cannot find module './checks.mjs'`

- [ ] **Step 3: Viết `scripts/kb/checks.mjs`**

```js
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
```

Lưu ý `checkStale` gọi `hashObject(d.file, { write: true })` trước khi diff: bản **mới** của file quyết định có thể chưa được commit, và `git diff` cần cả hai blob nằm trong kho object.

- [ ] **Step 4: Chạy test, xác nhận PASS**

Run: `pnpm kb:test`
Expected: 24 test PASS

- [ ] **Step 5: Commit**

```bash
git add scripts/kb/checks.mjs scripts/kb/checks.test.mjs
git commit -m "feat(kb): bốn phép kiểm tra stale/unlinked/lỗi thời/facts"
```

---

### Task 5: Báo cáo + CLI

**Files:**
- Create: `scripts/kb/report.mjs`
- Create: `scripts/kb.mjs`
- Test: `scripts/kb/cli.test.mjs`

**Interfaces:**
- Consumes: `loadModel` (Task 3); `checkStale`, `checkUnlinked`, `checkOutdatedRefs`, `loadFacts`, `checkFacts` (Task 4); `hashObject` (Task 1); `readFrontmatter`, `writeFrontmatter` (Task 2).
- Produces: 4 lệnh CLI với hợp đồng mã thoát ở Global Constraints. Không module nào khác dùng lại `report.mjs`.

- [ ] **Step 1: Viết test thất bại**

Tạo `scripts/kb/cli.test.mjs`:

```js
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
```

- [ ] **Step 2: Chạy test, xác nhận FAIL**

Run: `pnpm kb:test`
Expected: FAIL — `Cannot find module` cho `../kb.mjs`

- [ ] **Step 3: Viết `scripts/kb/report.mjs`**

```js
export function formatReport({ stale, unlinked, outdated, facts }) {
  const lines = []

  if (stale.length > 0) {
    lines.push(`① Tài liệu đã lỗi thời so với quyết định (${stale.length}):`)
    for (const s of stale) {
      lines.push(`  ${s.file}  ←  ${s.id}  (${s.storedHash} → ${s.currentHash})`)
      if (!s.oldAvailable) {
        lines.push('    không truy được bản cũ trong kho object, coi như lỗi thời toàn phần')
        continue
      }
      lines.push(`    ${s.id} đã đổi: +${s.added} / -${s.removed} dòng`)
      for (const l of s.patch.split('\n')) {
        if (/^[+-]/.test(l) && !/^[+-]{3}/.test(l)) lines.push(`    ${l}`)
      }
    }
    lines.push('')
  }

  if (unlinked.length > 0) {
    lines.push(`② Tài liệu chưa vào graph, thiếu derives_from (${unlinked.length}):`)
    for (const f of unlinked) lines.push(`  ${f}`)
    lines.push('  (khai derives_from: [] nếu tài liệu thực sự không phụ thuộc quyết định nào)')
    lines.push('')
  }

  if (outdated.length > 0) {
    lines.push(`③ Tài liệu trỏ tới quyết định đã có bản mới hơn (${outdated.length}):`)
    for (const o of outdated) {
      const verb = o.kind === 'superseded' ? 'bị thay thế bởi' : 'được bổ sung bởi'
      lines.push(`  ${o.file}  ←  ${o.id} ${verb} ${o.replacement.join(', ')}`)
    }
    lines.push('')
  }

  if (facts.length > 0) {
    lines.push(`④ Vi phạm facts.yml (${facts.length}):`)
    for (const f of facts) {
      lines.push(`  ${f.file}:${f.line}  "${f.forbidden}" đã bị loại bỏ, giá trị đúng là "${f.value}" (${f.key})`)
    }
    lines.push('')
  }

  if (lines.length === 0) return 'Sạch — không có tài liệu lỗi thời hay vi phạm.\n'
  return lines.join('\n')
}

export function formatErrors(errors) {
  return ['Lỗi cấu trúc knowledge base:', ...errors.map((e) => `  ${e}`), ''].join('\n')
}
```

- [ ] **Step 4: Viết `scripts/kb.mjs`**

```js
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
```

- [ ] **Step 5: Chạy test, xác nhận PASS**

Run: `pnpm kb:test`
Expected: 35 test PASS

- [ ] **Step 6: Commit**

```bash
git add scripts/kb.mjs scripts/kb/report.mjs scripts/kb/cli.test.mjs
git commit -m "feat(kb): CLI check/impact/ack/graph + báo cáo tiếng Việt"
```

---

### Task 6: Git hook cảnh báo

**Files:**
- Create: `.githooks/pre-commit`
- Modify: `README.md` (thêm mục hướng dẫn cài hook)

**Interfaces:**
- Consumes: `scripts/kb.mjs` (Task 5).
- Produces: không có API; chỉ là tác dụng phụ lúc commit.

- [ ] **Step 1: Tạo `.githooks/pre-commit`**

```bash
#!/bin/sh
# Cảnh báo, không chặn. Xem docs/superpowers/specs/2026-09-17-knowledge-base-design.md
node scripts/kb.mjs check --warn
exit 0
```

- [ ] **Step 2: Cho phép thực thi và trỏ git vào thư mục hook**

```bash
chmod +x .githooks/pre-commit
git config core.hooksPath .githooks
```

- [ ] **Step 3: Thêm mục setup vào `README.md`**

Chèn vào cuối `README.md`:

```markdown
## Knowledge base

Tài liệu và quyết định được liên kết qua `decisions/` và frontmatter `derives_from`.
Sau khi clone, bật hook cảnh báo drift:

    git config core.hooksPath .githooks

Lệnh thường dùng: `pnpm kb:check` · `pnpm kb:impact D3` · `pnpm kb:ack <file>` · `pnpm kb:graph`.
```

- [ ] **Step 4: Xác nhận hook chạy thật**

```bash
git add .githooks/pre-commit README.md
git commit -m "chore(kb): pre-commit cảnh báo drift, không chặn"
```

Expected: output của `kb check` hiện ra trong log commit, và commit **vẫn thành công**.
Ở thời điểm này `decisions/` chưa tồn tại nên báo cáo sẽ liệt kê toàn bộ tài liệu ở mục ② — đúng như mong đợi.

---

### Task 7: Bootstrap `decisions/`

**Files:**
- Create: `decisions/D1-user-first.md`, `D2-marketplace-escrow.md`, `D3-cloud-inpainting.md`, `D3b-depth-server-side.md`, `D4-kreativ-lite.md`, `D5-milestone-ladder.md`, `D6-market-numbers.md`, `D7-thu-lead-chuyen-gia.md`, `D8-need-style-first.md`, `D9-twitter-bootstrap-first.md`, `decisions/facts.yml`
- Modify: `Product_research/Decisions_Log_2026-07-23.md` (chỉ thêm header đóng băng)
- Modify: `CLAUDE.md` (đổi con trỏ nguồn chân lý)

**Interfaces:**
- Consumes: `scripts/kb.mjs` (Task 5) để xác minh.
- Produces: 10 id quyết định — `D1 D2 D3 D3b D4 D5 D6 D7 D8 D9` — mà Task 8 sẽ trỏ tới.

**Nguồn nội dung:** `Product_research/Decisions_Log_2026-07-23.md`. Chép **nguyên văn**, không biên tập, không tóm tắt.

| File | Lấy từ | Ghi chú |
|---|---|---|
| `D1-user-first.md` | mục `## D1 — Định vị lõi / khách hàng chính` | |
| `D2-marketplace-escrow.md` | mục `## D2 — Mô hình giao dịch` | |
| `D3-cloud-inpainting.md` | mục `## D3 — AI Inpainting: on-device vs cloud`, **bỏ** khối trích dẫn `> **[Cập nhật M1 — 2026-07-24]**` | `status: amended`, `amended_by: [D3b]` |
| `D3b-depth-server-side.md` | đúng khối `[Cập nhật M1 — 2026-07-24]` vừa gỡ ra | `date: 2026-07-24`, `amends: D3` |
| `D4-kreativ-lite.md` | mục `## D4 — Scope MVP` | |
| `D5-milestone-ladder.md` | mục `## D5 — Timeline & artefact "MVP"` | |
| `D6-market-numbers.md` | mục `## D6 — Bộ số thị trường & doanh thu` | |
| `D7-thu-lead-chuyen-gia.md` | gạch đầu dòng "Kết nối chuyên gia thiết kế" trong `## ✅ 3 mục bỏ ngỏ — đã chốt` | |
| `D8-need-style-first.md` | gạch đầu dòng "Need #1 = STYLE-FIRST" cùng mục | |
| `D9-twitter-bootstrap-first.md` | gạch đầu dòng "Twitter pitch" cùng mục | |

D7–D9 là phần mở rộng so với spec §9 bước 1 (vốn chỉ nói 7 file). Ba mục "bỏ ngỏ" này đã được chốt ngày 2026-07-23 và `Doc_Sync_Plan` dùng chúng để điều khiển việc sửa `Needs_and_Moat_Summary`, `twitter_pitch`, `Twitter_Pitch_eval`, `Product_Brief`, `Strategic_Discovery`, `README`. Nếu không nâng chúng thành quyết định hạng nhất thì các cạnh đó không khai được, và chúng sẽ chỉ còn sống trong bản snapshot đóng băng.

Mục `## ✅ Tóm tắt 6 quyết định` **không** tách ra — nó là bản tóm tắt, không phải quyết định độc lập; nó ở lại trong snapshot.

- [ ] **Step 1: Tạo 10 file quyết định**

Mẫu frontmatter (thay giá trị theo bảng trên; `supersedes`/`superseded_by` để `null` cho cả 10 file vì chưa có ca thay thế toàn bộ nào):

```markdown
---
id: D3
title: MVP dùng cloud inpainting qua API hosted
status: amended
date: 2026-07-23
supersedes: null
superseded_by: null
amends: null
amended_by: [D3b]
---

<nguyên văn thân bài mục D3, bỏ khối [Cập nhật M1 — 2026-07-24]>
```

`D3b-depth-server-side.md`:

```markdown
---
id: D3b
title: Depth chạy server-side, cache theo hash ảnh
status: accepted
date: 2026-07-24
supersedes: null
superseded_by: null
amends: D3
amended_by: []
---

<nguyên văn khối [Cập nhật M1 — 2026-07-24] gỡ từ D3>
```

8 file còn lại dùng `status: accepted`, `date: 2026-07-23`, cả bốn trường quan hệ để `null` / `[]`.

- [ ] **Step 2: Kiểm tra cấu trúc đã đúng**

Run: `pnpm kb:check`
Expected: **không** có "Lỗi cấu trúc", tức là cặp `D3.amended_by` ↔ `D3b.amends` và `status` của D3 đã khớp. Báo cáo vẫn liệt kê toàn bộ tài liệu ở mục ② (Task 8 mới xử lý).

Nếu thấy `D3: status là "accepted" nhưng quan hệ cho thấy phải là "amended"` thì sửa `status` của D3 rồi chạy lại.

- [ ] **Step 3: Viết `decisions/facts.yml`**

Rút từ bảng trong D6 (cột "Ghi chú đồng bộ") và các mục 🔴 của `Doc_Sync_Plan_2026-07-23.md`:

```yaml
tam:
  value: "$9.76B/năm"
  owner: D6
  forbidden: ["$5B", "~$5B"]
sam:
  value: "$300-500M"
  owner: D6
  forbidden: ["$2.5B"]
som:
  value: "GMV ~$2-4M / 24 tháng, commission ~$230-320K"
  owner: D6
  forbidden: ["$1-3M commission"]
cac:
  value: "100K VND"
  owner: D6
  forbidden: ["CAC≤160K", "CAC 160K"]
burn:
  value: "11.7tr VND/tháng"
  owner: D6
  forbidden: ["$8,333"]
arpu:
  value: "ARPU 800K, GMV 10tr/đơn"
  owner: D6
  forbidden: []
timeline:
  value: "M1 4-6 tuần, M2 3-4 tháng"
  owner: D5
  forbidden: ["6 tháng"]
privacy_claim:
  value: "ảnh gửi lên xử lý & xóa ngay"
  owner: D3
  forbidden: ["100% on-device", "hoàn toàn on-device", "không upload ảnh", "API cost/tháng = 0"]
rotation:
  value: "chỉ xoay trục Y"
  owner: D4
  forbidden: ["360 độ", "xoay 360"]
catalog:
  value: "16-24 models, 2-3 phong cách"
  owner: D4
  forbidden: ["75 models"]
```

Danh sách `forbidden` ban đầu cố tình hẹp: chỉ những chuỗi mà audit đã xác nhận là sai. Rộng quá sẽ sinh báo động giả và làm founder bỏ qua cả báo cáo.

- [ ] **Step 4: Đóng băng `Decisions_Log_2026-07-23.md`**

Chèn ngay dưới dòng tiêu đề `# YourSpace — Sổ Quyết Định Định Hướng (2026-07-23)`:

```markdown
> **⚠️ SNAPSHOT LỊCH SỬ — không sửa file này nữa.**
> Nguồn chân lý hiện tại là thư mục `decisions/`, mỗi quyết định một file, bất biến.
> Đổi ý = tạo bản ghi mới với `supersedes:` hoặc `amends:`, không sửa tại chỗ.
> File này giữ nguyên trạng thái ngày 2026-07-23 để đối chiếu.
```

Không đụng phần còn lại của file.

- [ ] **Step 5: Đổi con trỏ trong `CLAUDE.md`**

Thay dòng:

```
- **Định hướng sản phẩm:** `Product_research/Decisions_Log_2026-07-23.md` (6 quyết định D1–D6). KHÔNG tự ý đảo ngược.
```

bằng:

```
- **Định hướng sản phẩm:** `decisions/` (D1–D9, mỗi file một quyết định, bất biến). KHÔNG tự ý đảo ngược. Đổi ý = tạo bản ghi mới với `supersedes:`/`amends:`, chạy `pnpm kb:impact <id>` trước để biết tài liệu nào bị ảnh hưởng. `Product_research/Decisions_Log_2026-07-23.md` là snapshot lịch sử, không còn là nguồn chân lý.
```

- [ ] **Step 6: Commit**

Phải commit **trước** Task 8 để blob của các file quyết định nằm trong kho object.

```bash
git add decisions/ Product_research/Decisions_Log_2026-07-23.md CLAUDE.md
git commit -m "feat(kb): tách Decisions_Log thành decisions/ bất biến + facts.yml"
```

---

### Task 8: Gắn `derives_from` cho toàn bộ tài liệu

**Files:**
- Modify: frontmatter của các tài liệu trong bảng dưới. **Chỉ thêm frontmatter, không đụng thân bài.**

**Interfaces:**
- Consumes: 10 id từ Task 7; lệnh `kb ack` từ Task 5.
- Produces: graph hoàn chỉnh — đầu vào cho `kb impact` và skill `/sync-decision`.

**Bản đồ phụ thuộc** — rút từ mục A–F của `Doc_Sync_Plan_2026-07-23.md`:

| Tài liệu | `derives_from` |
|---|---|
| `Product/PRD.md` | D1 D2 D3 D4 D5 D6 D7 |
| `Product/Product_Brief.md` | D1 D3 D4 D7 |
| `Product/Business_Assumptions.md` | D2 D3 D6 |
| `Product/Needs_and_Moat_Summary.md` | D6 D8 |
| `Product_research/Strategic_Discovery.md` | D1 D6 D7 |
| `Product_research/MVP_Research_and_PMF.md` | D3 D4 |
| `Product_research/Roadmap.md` | D4 D5 |
| `Pitch/Pitch_Memo.md` | D1 D3 D5 D6 |
| `Pitch/Pitch_Script.md` | D5 D6 |
| `Pitch/twitter_pitch.md` | D5 D6 D9 |
| `Pitch/Twitter_Pitch_eval.md` | D9 |
| `Pitch/VietAnh_Milestone1_InvestorPackage.md` | D5 D6 |
| `Governance-and-Risk/risk_register.md` | D2 D5 D6 |
| `Governance-and-Risk/risk_register_v2.md` | D2 D3 D5 D6 |
| `Governance-and-Risk/document_trail.md` | D3 D6 |
| `Governance-and-Risk/territorial_scope.md` | D3 D6 |
| `Governance-and-Risk/rules_rails_ritual.md` | D3 |
| `Governance-and-Risk/incident_playbook.md` | D2 |
| `README.md` | D1 D4 D5 D7 |
| `docs/superpowers/specs/2026-07-24-m1-web-validation-design.md` | D3 D3b D4 D5 |
| `docs/superpowers/plans/2026-07-24-m1-spike-and-foundation.md` | D3 D3b D4 D5 |

Cố ý **không** thêm `D3b` vào các tài liệu chỉ ghi `D3`: chúng được viết trước khi D3b tồn tại và thực sự chưa phản ánh nó. `kb check` mục ③ sẽ nêu đúng điều đó — đó là ca kiểm thử thật đầu tiên của cơ chế `amends`.

Tài liệu khai `derives_from: []`:

| Tài liệu | Thêm `facts_check: false`? |
|---|---|
| `DESIGN.md` | không |
| `docs/superpowers/specs/2026-09-17-knowledge-base-design.md` | không |
| `docs/superpowers/plans/2026-09-17-knowledge-base.md` | không |
| `Product_research/Decisions_Log_2026-07-23.md` | **có** |
| `Product_research/Doc_Sync_Plan_2026-07-23.md` | **có** |
| `Product_research/Doc_Consistency_Audit_2026-07-23.md` | **có** |

Ba file cuối trích dẫn nguyên văn các giá trị đã bị loại bỏ để nói về chính việc loại bỏ chúng; quét chúng chỉ sinh báo động giả.

`Doc_Sync_Plan` còn nhắc `WebApp/Docs/MVP_Implementation_Plan.md` và thư mục `Technical/` — **không còn tồn tại** trong repo. Bỏ qua, không tạo lại.

- [ ] **Step 1: Thêm frontmatter với hash tạm**

Với mỗi tài liệu trong bảng đầu, chèn khối frontmatter lên đầu file, dùng `00000000` làm hash tạm. Ví dụ `Governance-and-Risk/incident_playbook.md`:

```markdown
---
derives_from: [D2@00000000]
---
# BẢO HIỂM PHÁP LÝ ...
```

Với 6 tài liệu ở bảng thứ hai:

```markdown
---
derives_from: []
facts_check: false
---
```

(bỏ dòng `facts_check` ở những file ghi "không").

- [ ] **Step 2: Xác nhận không có lỗi cấu trúc**

Run: `pnpm kb:check`
Expected: mã thoát 1 (không phải 2). Mục ② phải **rỗng**. Mục ① liệt kê mọi cặp tài liệu–quyết định với `00000000 → <hash thật>` và ghi "không truy được bản cũ".

- [ ] **Step 3: Đóng dấu hash nền cho từng tài liệu**

```bash
for f in Product/PRD.md Product/Product_Brief.md Product/Business_Assumptions.md \
         Product/Needs_and_Moat_Summary.md Product_research/Strategic_Discovery.md \
         Product_research/MVP_Research_and_PMF.md Product_research/Roadmap.md \
         Pitch/Pitch_Memo.md Pitch/Pitch_Script.md Pitch/twitter_pitch.md \
         Pitch/Twitter_Pitch_eval.md Pitch/VietAnh_Milestone1_InvestorPackage.md \
         Governance-and-Risk/risk_register.md Governance-and-Risk/risk_register_v2.md \
         Governance-and-Risk/document_trail.md Governance-and-Risk/territorial_scope.md \
         Governance-and-Risk/rules_rails_ritual.md Governance-and-Risk/incident_playbook.md \
         README.md \
         docs/superpowers/specs/2026-07-24-m1-web-validation-design.md \
         docs/superpowers/plans/2026-07-24-m1-spike-and-foundation.md ; do
  pnpm kb:ack "$f" || exit 1
done
```

- [ ] **Step 4: Chạy `kb check` lần cuối và đọc kết quả**

Run: `pnpm kb:check`
Expected:
- Mục ① **rỗng** — mọi hash vừa được đóng dấu.
- Mục ② **rỗng** — mọi tài liệu đã vào graph.
- Mục ③ liệt kê các tài liệu trỏ `D3` (Business_Assumptions, MVP_Research, Pitch_Memo, risk_register_v2, document_trail, territorial_scope, rules_rails_ritual, Product_Brief, PRD) kèm ghi chú "được bổ sung bởi D3b".
- Mục ④ liệt kê các dòng chứa chuỗi bị cấm — **đây chính là hàng đợi đồng bộ tồn đọng**.
- Mã thoát 1.

Đây là kết quả đúng, không phải lỗi. Task 8 dừng ở đây; việc sửa nội dung thuộc đợt sync sau.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(kb): gắn derives_from cho toàn bộ tài liệu, đóng dấu hash nền"
```

- [ ] **Step 6: Ghi lại hàng đợi để dùng sau**

```bash
pnpm kb:check > docs/superpowers/plans/2026-09-17-hang-doi-sync.txt || true
pnpm kb:graph > docs/superpowers/plans/2026-09-17-kb-graph.mmd
git add docs/superpowers/plans/
git commit -m "docs(kb): ảnh chụp hàng đợi sync và sơ đồ graph lúc bootstrap"
```

---

### Task 9: Skill `/sync-decision`

**Files:**
- Create: `.claude/skills/sync-decision/SKILL.md`

**Interfaces:**
- Consumes: `kb impact`, `kb check`, `kb ack` (Task 5); graph đã đầy đủ (Task 8).
- Produces: không có API cho code.

- [ ] **Step 1: Viết `.claude/skills/sync-decision/SKILL.md`**

```markdown
---
name: sync-decision
description: Use when a decision record in decisions/ has changed and dependent documents need to be brought back in line - reads the decision diff, edits only the affected documents, and re-stamps their hashes.
---

# Sync Decision

Đồng bộ các tài liệu phụ thuộc sau khi một quyết định trong `decisions/` thay đổi.

## Điều kiện dừng

Skill này **không commit**. Nó dừng lại và giao `git diff` cho founder duyệt.

## Các bước

1. Xác định id quyết định từ tham số. Không có tham số thì chạy `pnpm kb:check` và hỏi
   founder muốn xử lý quyết định nào.

2. Lấy danh sách tài liệu bị ảnh hưởng:

       pnpm kb:impact <id>

3. Lấy nội dung thay đổi của chính quyết định đó. `pnpm kb:check` in sẵn patch dưới mỗi
   mục ①. Đọc patch, xác định **những khẳng định nào vừa đổi** — đó là phạm vi được phép sửa.

4. Với từng tài liệu trong danh sách:
   - Đọc toàn bộ file.
   - Chỉ sửa những đoạn mà patch ở bước 3 làm cho sai. Không biên tập câu chữ khác,
     không "cải thiện" văn phong, không đụng phần không liên quan.
   - Nếu tài liệu vẫn đúng dù quyết định đã đổi, không sửa gì.

5. Đối chiếu `decisions/facts.yml`: mọi số và nhãn vừa sửa phải dùng đúng `value`, và không
   được để lại chuỗi nào trong `forbidden`.

6. Đóng dấu lại từng tài liệu đã xử lý:

       pnpm kb:ack <đường-dẫn>

7. Chạy `pnpm kb:check`. Mục ① và ④ phải sạch cho những tài liệu vừa xử lý.

8. Nếu quyết định cũ đã bị `supersedes`/`amends`, cập nhật `derives_from` của tài liệu để trỏ
   sang bản mới, rồi `kb ack` lại — mục ③ mới hết.

9. Dừng. Báo cáo cho founder: đã sửa file nào, sửa gì, còn gì chưa xử lý được và vì sao.
   Nhắc họ review `git diff` trước khi commit.

## Không làm

- Không commit, không push.
- Không sửa file trong `decisions/` — quyết định là bất biến; đổi ý thì tạo bản ghi mới.
- Không chạy `kb ack` cho tài liệu chưa hề đọc.
```

- [ ] **Step 2: Xác nhận skill nạp được**

Run: `pnpm kb:check`
Expected: chạy bình thường, không bị skill ảnh hưởng.

Mở phiên Claude Code mới, gõ `/sync-decision` — skill phải xuất hiện trong danh sách.

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/sync-decision/SKILL.md
git commit -m "feat(kb): skill /sync-decision đồng bộ tài liệu theo quyết định"
```

---

## Sau khi xong

Chạy `pnpm kb:check`. Kết quả mong đợi: mục ① và ② rỗng, mục ③ và ④ có nội dung — đó là hàng đợi
đồng bộ tồn đọng theo `Doc_Sync_Plan_2026-07-23.md`, giờ đã ở dạng máy sinh và theo dõi được.

Bước kế tiếp (**ngoài phạm vi plan này**): chạy `/sync-decision` lần lượt cho từng quyết định để
xử lý hàng đợi đó.
