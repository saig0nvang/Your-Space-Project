# M1 Spike + Foundation — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dựng nền tái dùng cho M1 và chạy SPIKE depth-placement để trả lời decision-gate D4: *đặt đồ 3D vào ảnh phòng thật từ single-image depth có đủ tin cậy (scale + chạm sàn + occlusion) không?* — pass → giữ auto-placement; fail → fallback thủ công.

**Architecture:** Monorepo pnpm. `packages/core` = domain thuần TS (calibration + placement + pricing, không React, test bằng Vitest). `apps/web` = Next.js (App Router) + React-Three-Fiber. AI (depth) chạy server-side qua Next API route → Replicate, ẩn sau `AIGateway`. Spike dùng `packages/core` + một trang harness render composite trên golden-set ảnh thật để chấm believability.

**Tech Stack:** Next.js (App Router) · TypeScript · React-Three-Fiber + three.js + drei · Zustand · Tailwind · Vitest · Replicate (Depth Anything V2) · pnpm workspaces · Node 20+.

## Global Constraints

- Node ≥ 20, package manager = **pnpm** (workspaces). TypeScript strict.
- **Stateless, không login.** Không DB user trong Plan 1.
- **Depth = 1 lần/ảnh, server-side** (Replicate Depth Anything V2), cache theo SHA-256 ảnh. KHÔNG chạy per-frame.
- **Compositing: TÁCH occlusion (relative depth) khỏi scale (floor plane + chiều cao camera giả định ~1.4m).** KHÔNG tin depth mét tuyệt đối.
- Đồ có kích thước THẬT (mét) từ metadata. Xoay **CHỈ trục Y**.
- **Privacy:** ảnh gửi cloud để xử lý rồi xóa ngay (zero-retention); consent "ảnh gửi lên xử lý và xóa ngay" — KHÔNG dùng câu "không upload ảnh".
- AI key **chỉ ở server env**, ẩn sau `AIGateway`. Browser không gọi thẳng vendor.
- UI theo **`DESIGN.md`** (Fraunces + Instrument Sans; warm-neutral; clay `#B0654A` chỉ ở CTA).
- Nguồn chân lý: `docs/superpowers/specs/2026-07-24-m1-web-validation-design.md`.

> **Amendment 2026-07-24 (spike depth):** Founder chọn chạy depth **IN-BROWSER** cho spike (transformers.js + Depth Anything V2 Small ONNX, WebGPU/WASM) → **KHÔNG cần Replicate token**. Kiến trúc dùng interface `DepthService` với 2 adapter: `browserDepth` (transformers.js — dùng cho spike; cũng là POC cho tầm nhìn on-device D3) và `serverDepth` (/api/depth → Replicate — kiến trúc M1 chính thức, build ở Task 4 nhưng KHÔNG chặn spike). Task 7 dùng `browserDepth`.

---

### Task 0: Monorepo + tooling scaffold

**Files:**
- Create: `package.json`, `pnpm-workspace.yaml`, `tsconfig.base.json`, `.nvmrc`, `.gitignore`
- Create: `packages/core/package.json`, `packages/core/tsconfig.json`, `packages/core/vitest.config.ts`, `packages/core/src/index.ts`
- Create: `apps/web/` (Next.js app), `apps/web/package.json`, `apps/web/tsconfig.json`

**Interfaces:**
- Produces: workspace `@yourspace/core` (importable từ `apps/web`); scripts `pnpm test`, `pnpm dev`.

- [ ] **Step 1:** Tạo `pnpm-workspace.yaml`:
```yaml
packages:
  - "packages/*"
  - "apps/*"
```
- [ ] **Step 2:** Root `package.json` (scripts):
```json
{
  "name": "yourspace",
  "private": true,
  "packageManager": "pnpm@9",
  "scripts": {
    "dev": "pnpm --filter @yourspace/web dev",
    "test": "pnpm -r test",
    "typecheck": "pnpm -r typecheck",
    "lint": "pnpm -r lint"
  }
}
```
- [ ] **Step 3:** `tsconfig.base.json` với `"strict": true`, `"target": "ES2022"`, `"module": "ESNext"`, `"moduleResolution": "Bundler"`, `"paths": { "@yourspace/core": ["packages/core/src/index.ts"] }`.
- [ ] **Step 4:** Scaffold `packages/core` (Vitest): `packages/core/package.json`:
```json
{
  "name": "@yourspace/core",
  "type": "module",
  "main": "src/index.ts",
  "scripts": { "test": "vitest run", "typecheck": "tsc --noEmit" },
  "devDependencies": { "vitest": "^2", "typescript": "^5" }
}
```
- [ ] **Step 5:** Scaffold `apps/web` bằng `pnpm create next-app@latest apps/web --ts --tailwind --app --no-src-dir --import-alias "@/*"` (App Router, Tailwind). Thêm `"@yourspace/core": "workspace:*"` vào deps. Thêm R3F: `pnpm --filter @yourspace/web add three @react-three/fiber @react-three/drei zustand`.
- [ ] **Step 6:** `.nvmrc` = `20`. `.gitignore` thêm `node_modules`, `.next`, `.env*`, `*.local`.
- [ ] **Step 7:** Smoke: một test trivial trong core.
```ts
// packages/core/src/smoke.test.ts
import { expect, test } from "vitest";
test("smoke", () => { expect(1 + 1).toBe(2); });
```
- [ ] **Step 8:** Run: `pnpm install && pnpm test` → PASS; `pnpm dev` serve trang Next mặc định. Commit:
```bash
git add -A && git commit -m "chore: scaffold monorepo (core + web)"
```

---

### Task 1: Core geometry & domain types

**Files:**
- Create: `packages/core/src/geometry.ts`, `packages/core/src/types.ts`
- Modify: `packages/core/src/index.ts` (re-export)

**Interfaces:**
- Produces:
  - `type Vec2 = { x: number; y: number }`, `type Vec3 = { x: number; y: number; z: number }`
  - `type DepthMap = { width: number; height: number; data: Float32Array }` (relative depth, 0..1)
  - `type Plane = { normal: Vec3; d: number }` (mặt phẳng `normal·p + d = 0`)
  - `type CameraModel = { fovYRad: number; aspect: number; heightM: number; pitchRad: number }`
  - `type Calibration = { camera: CameraModel; floor: Plane; confidence: number }`
  - `type FurnitureDims = { widthM: number; heightM: number; depthM: number }`
  - Hàm thuần: `dot(a,b)`, `sub(a,b)`, `normalize(a)`, `scale(a,s)`, `add(a,b)`.

- [ ] **Step 1: Write failing test** `packages/core/src/geometry.test.ts`:
```ts
import { expect, test } from "vitest";
import { dot, normalize, sub } from "./geometry";
test("dot + normalize", () => {
  expect(dot({x:1,y:2,z:3},{x:4,y:5,z:6})).toBe(32);
  const n = normalize({x:0,y:3,z:4});
  expect(n.y).toBeCloseTo(0.6); expect(n.z).toBeCloseTo(0.8);
});
test("sub", () => {
  expect(sub({x:5,y:5,z:5},{x:1,y:2,z:3})).toEqual({x:4,y:3,z:2});
});
```
- [ ] **Step 2:** Run `pnpm --filter @yourspace/core test` → FAIL (module not found).
- [ ] **Step 3:** Implement `geometry.ts` (Vec3 ops) + `types.ts` (các type trên); re-export từ `index.ts`.
```ts
// geometry.ts
export type Vec2 = { x: number; y: number };
export type Vec3 = { x: number; y: number; z: number };
export const dot = (a: Vec3, b: Vec3) => a.x*b.x + a.y*b.y + a.z*b.z;
export const sub = (a: Vec3, b: Vec3): Vec3 => ({x:a.x-b.x, y:a.y-b.y, z:a.z-b.z});
export const add = (a: Vec3, b: Vec3): Vec3 => ({x:a.x+b.x, y:a.y+b.y, z:a.z+b.z});
export const scale = (a: Vec3, s: number): Vec3 => ({x:a.x*s, y:a.y*s, z:a.z*s});
export const normalize = (a: Vec3): Vec3 => { const l = Math.hypot(a.x,a.y,a.z) || 1; return scale(a, 1/l); };
```
- [ ] **Step 4:** Run test → PASS.
- [ ] **Step 5:** Commit: `git commit -am "feat(core): geometry + domain types"`

---

### Task 2: SceneCalibration (pure)

Ước lượng camera + mặt sàn từ depth map. Bản gọn: FOV từ EXIF (nếu có) hoặc default; back-project depth → point cloud; RANSAC fit mặt sàn (điểm nửa dưới ảnh, normal hướng lên); chiều cao camera giả định 1.4m → scale metric.

**Files:**
- Create: `packages/core/src/scene/calibration.ts`, `packages/core/src/scene/calibration.test.ts`
- Create: `packages/core/src/scene/fixtures/synthetic-floor.ts` (depth map tổng hợp của một mặt sàn phẳng đã biết)

**Interfaces:**
- Consumes: `DepthMap`, `CameraModel`, `Plane`, `Vec3` (Task 1).
- Produces: `calibrate(depth: DepthMap, meta: { fovYRad?: number; assumedCameraHeightM?: number }): Calibration`

- [ ] **Step 1: Fixture** — hàm sinh `DepthMap` từ một mặt sàn phẳng đã biết (camera cao 1.4m, pitch xuống 20°, FOV 60°) để test calibrate khôi phục đúng.
```ts
// fixtures/synthetic-floor.ts
import type { DepthMap } from "../../types";
export function syntheticFloor(w=64, h=48): { depth: DepthMap; truth: { heightM: number; pitchRad: number } } {
  const data = new Float32Array(w*h);
  const heightM = 1.4, pitchRad = 20*Math.PI/180, fovY = 60*Math.PI/180;
  for (let j=0;j<h;j++) for (let i=0;i<w;i++){
    const ndcY = (j/h)*2-1;              // -1 top .. 1 bottom
    const ang = pitchRad + ndcY*(fovY/2);
    const dist = ang > 0.01 ? heightM/Math.tan(ang) : 50; // khoảng cách tới điểm sàn
    data[j*w+i] = Math.min(1, dist/10);  // normalize thô về 0..1
  }
  return { depth: { width:w, height:h, data }, truth: { heightM, pitchRad } };
}
```
- [ ] **Step 2: Failing test:**
```ts
import { expect, test } from "vitest";
import { calibrate } from "./calibration";
import { syntheticFloor } from "./fixtures/synthetic-floor";
test("calibrate khôi phục mặt sàn + confidence hợp lý", () => {
  const { depth } = syntheticFloor();
  const c = calibrate(depth, { fovYRad: 60*Math.PI/180, assumedCameraHeightM: 1.4 });
  expect(c.floor.normal.y).toBeGreaterThan(0.9);   // sàn gần như nằm ngang, normal hướng lên
  expect(c.camera.heightM).toBeCloseTo(1.4, 1);
  expect(c.confidence).toBeGreaterThan(0.5);
});
```
- [ ] **Step 3:** Run → FAIL.
- [ ] **Step 4: Implement** `calibrate`: back-project mỗi pixel dùng FOV → tia; nhân depth → điểm 3D; lọc nửa dưới ảnh; **RANSAC** (lấy 3 điểm ngẫu-nhiên-cố-định-seed từ index, dựng plane, đếm inlier trong ngưỡng) → chọn plane nhiều inlier nhất; scale toàn scene để khoảng-cách-camera-tới-sàn = `assumedCameraHeightM`; `confidence` = tỉ lệ inlier. (Randomness: dùng index cố định, KHÔNG `Math.random` — để test tất định.)
- [ ] **Step 5:** Run → PASS.
- [ ] **Step 6:** Commit: `git commit -am "feat(core): SceneCalibration (floor/camera từ depth)"`

---

### Task 3: Placement.placeOnFloor (pure)

Raycast từ con trỏ (pixel) xuống mặt sàn → world position (chạm sàn); scale từ kích thước thật.

**Files:**
- Create: `packages/core/src/scene/placement.ts`, `packages/core/src/scene/placement.test.ts`

**Interfaces:**
- Consumes: `Calibration`, `FurnitureDims`, `Vec2`, `Vec3`, `Plane` (Task 1-2).
- Produces: `type Transform = { position: Vec3; rotationYRad: number; scale: number }`; `placeOnFloor(screenNdc: Vec2, calib: Calibration, dims: FurnitureDims): Transform`

- [ ] **Step 1: Failing test** — con trỏ ở giữa-dưới ảnh → điểm trên sàn phía trước camera, y≈0 (chạm sàn), scale=1 (đồ metric):
```ts
import { expect, test } from "vitest";
import { placeOnFloor } from "./placement";
import { calibrate } from "./calibration";
import { syntheticFloor } from "./fixtures/synthetic-floor";
test("placeOnFloor: đồ chạm sàn (y≈0), trước camera (z<0)", () => {
  const c = calibrate(syntheticFloor().depth, { fovYRad:60*Math.PI/180, assumedCameraHeightM:1.4 });
  const t = placeOnFloor({ x:0, y:-0.4 }, c, { widthM:2, heightM:0.8, depthM:0.9 });
  expect(Math.abs(t.position.y)).toBeLessThan(0.05); // chân đồ trên sàn
  expect(t.position.z).toBeLessThan(0);              // trước camera
  expect(t.scale).toBeCloseTo(1, 2);
});
```
- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3:** Implement: dựng tia từ camera qua NDC (dùng `calib.camera`), giao với `calib.floor` → điểm world; `position` = điểm đó (đáy đồ); `scale` = 1 (đồ đã metric, R3F sẽ chiếu đúng); `rotationYRad` = 0. Nếu tia không giao sàn (nhìn lên) → clamp về xa/`confidence` thấp.
- [ ] **Step 4:** Run → PASS.
- [ ] **Step 5:** Commit: `git commit -am "feat(core): Placement.placeOnFloor (raycast to floor)"`

---

### Task 4: AIGateway + /api/depth (server, Replicate)

**Files:**
- Create: `apps/web/lib/ai/gateway.ts` (server-only), `apps/web/lib/ai/replicate.ts`, `apps/web/app/api/depth/route.ts`
- Create: `apps/web/lib/ai/gateway.test.ts`

**Interfaces:**
- Produces: `AIGateway.depth(imageBytes: Uint8Array, meta): Promise<Result<DepthResult, AIError>>` với `DepthResult = { depth: DepthMap }`, `AIError = { kind: "Timeout"|"RateLimited"|"BudgetExceeded"|"VendorError"|"LowConfidence"; message: string }`. Route `POST /api/depth` nhận multipart ảnh → trả depth JSON.

- [ ] **Step 1: Failing test** (mock Replicate client) — cache: gọi 2 lần cùng ảnh chỉ hit vendor 1 lần; timeout → `Result` lỗi có kiểu:
```ts
import { expect, test, vi } from "vitest";
import { makeGateway } from "./gateway";
test("depth cache theo hash: vendor gọi 1 lần cho ảnh trùng", async () => {
  const vendor = vi.fn().mockResolvedValue({ width:2, height:2, data:new Float32Array([0,0,0,0]) });
  const gw = makeGateway({ runDepth: vendor, cache: new Map() });
  const img = new Uint8Array([1,2,3]);
  await gw.depth(img, {}); await gw.depth(img, {});
  expect(vendor).toHaveBeenCalledTimes(1);
});
```
- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3:** Implement `makeGateway({ runDepth, cache })`: hash ảnh (SHA-256), cache hit → trả cache; miss → `runDepth` với timeout (Promise.race) + 1 retry; map lỗi → `AIError`; ghi cache. `replicate.ts` = adapter thật gọi Depth Anything V2 (đọc key từ `process.env.REPLICATE_API_TOKEN`), chuẩn hóa output về `DepthMap`. Route `route.ts` đọc ảnh, gọi gateway, **không lưu ảnh** (zero-retention), trả JSON.
- [ ] **Step 4:** Run → PASS.
- [ ] **Step 5:** Commit: `git commit -am "feat(web): AIGateway + /api/depth (Replicate, cached, typed errors)"`

---

### Task 5: RoomCanvas render (R3F) — composite 1 model

**Files:**
- Create: `apps/web/components/scene/RoomCanvas.tsx`, `apps/web/components/scene/PlacedModel.tsx`, `apps/web/lib/scene/toThree.ts`
- Create: `apps/web/components/scene/RoomCanvas.test.tsx` (render smoke với @testing-library/react + mock R3F)

**Interfaces:**
- Consumes: `Calibration`, `Transform` (core); một `.glb` URL + `FurnitureDims`.
- Produces: `<RoomCanvas photoUrl calibration items />` render: plane ảnh nền + `PerspectiveCamera` từ `calibration.camera` + mặt sàn + `<ContactShadows>` + model đặt tại `Transform`.

- [ ] **Step 1:** `toThree.ts` — pure: map `CameraModel`→ props `PerspectiveCamera` (fov độ, position/rotation từ heightM/pitch), `Transform`→ props mesh. Test thuần cho hàm map (fovYRad→fov độ):
```ts
import { expect, test } from "vitest";
import { cameraToThree } from "./toThree";
test("fovYRad → fov độ", () => {
  const p = cameraToThree({ fovYRad: Math.PI/3, aspect:1.5, heightM:1.4, pitchRad:0.3 });
  expect(p.fov).toBeCloseTo(60, 1); expect(p.position[1]).toBeCloseTo(1.4, 2);
});
```
- [ ] **Step 2:** Run → FAIL → implement `cameraToThree` → PASS.
- [ ] **Step 3:** Implement `RoomCanvas.tsx` (R3F `<Canvas>`: ảnh nền qua `useTexture` trên plane trước camera hoặc `scene.background`; `<PerspectiveCamera makeDefault>` từ toThree; `<ContactShadows>`; `<PlacedModel>` load `.glb` qua `useGLTF`, đặt theo `Transform`, xoay Y). Style theo `DESIGN.md`.
- [ ] **Step 4:** Render smoke test (mock `@react-three/fiber` Canvas) chỉ kiểm không crash + nhận props.
- [ ] **Step 5:** Commit: `git commit -am "feat(web): RoomCanvas render composite (camera+floor+contact shadow+model)"`

---

### Task 6: OcclusionMaterial (depth-test shader)

Che phần đồ nằm sau vật thật ở tiền cảnh, dùng depth map làm depth texture.

**Files:**
- Create: `apps/web/components/scene/occlusion.ts` (patch material qua `onBeforeCompile`)
- Create: `apps/web/components/scene/occlusion.test.ts` (test hàm map depth→uniform, pure phần tính được)

**Interfaces:**
- Consumes: `DepthMap`, `Calibration`.
- Produces: `applyOcclusion(material, { depthTexture, projectParams }): void` — inject vào fragment shader: so `sceneDepth(screenUV)` vs `fragDepth`, `discard` nếu bị che; feather ngưỡng.

- [ ] **Step 1:** Test phần tính được (pure): `depthMapToTexture(depth)` trả `{ width, height, data: Uint8Array }` đúng kích thước + giá trị normalize.
```ts
import { expect, test } from "vitest";
import { depthMapToTexture } from "./occlusion";
test("depthMapToTexture normalize về 0..255", () => {
  const t = depthMapToTexture({ width:2, height:1, data:new Float32Array([0, 1]) });
  expect(t.data[0]).toBe(0); expect(t.data[t.data.length-1]).toBe(255);
});
```
- [ ] **Step 2:** Run → FAIL → implement `depthMapToTexture` → PASS.
- [ ] **Step 3:** Implement `applyOcclusion` (shader inject). *Lưu ý spike:* phần shader không unit-test được — verify bằng mắt ở Task 7. Feather + bias để giảm halo.
- [ ] **Step 4:** Commit: `git commit -am "feat(web): occlusion material (depth-test discard)"`

---

### Task 7 (SPIKE — decision gate D4): Believability harness + quyết định

> Đây là SPIKE, không phải feature TDD. "Trông thật" không unit-test được → chấm bằng rubric người. Đây là task quyết định auto vs thủ công cho toàn bộ M1.

**Files:**
- Create: `apps/web/app/spike/page.tsx` (harness: chọn ảnh trong golden-set → gọi `/api/depth` → `calibrate` → `placeOnFloor` 1 sofa → `RoomCanvas` + occlusion + contact shadow → nút "chụp composite")
- Create: `apps/web/public/golden/` (15–20 ảnh phòng VN thật: sáng/tối, rộng/hẹp, gọn/bừa, có vật tiền cảnh) + `apps/web/public/golden/sofa.glb` (1 model metric đã biết dims)
- Create: `docs/superpowers/plans/spike-results-2026-mm-dd.md` (điền khi chạy)

**Interfaces:**
- Consumes: tất cả Task 0–6.

- [ ] **Step 1:** Gom **15–20 ảnh phòng thật** vào `public/golden/` + 1 sofa `.glb` metric (dims đã đo).
- [ ] **Step 2:** Dựng `spike/page.tsx`: dropdown ảnh → chạy pipeline → hiển thị composite (sofa đặt giữa-dưới) với occlusion + contact shadow; nút tải composite PNG.
- [ ] **Step 3:** Chạy toàn bộ golden-set. Với mỗi ảnh, chấm **rubric 1–5** × 5 tiêu chí: *scale đúng · chạm sàn · occlusion đúng · ánh sáng hợp lý · không seam*. Ghi vào `spike-results-*.md` (bảng ảnh × tiêu chí).
- [ ] **Step 4:** Tính **pass rate** = % ảnh đạt "tin được" (mọi tiêu chí ≥3, không tiêu chí nào =1). **Ngưỡng: ≥70%** (founder đã đề xuất; xác nhận lại nếu muốn).
- [ ] **Step 5: GATE:**
  - **PASS (≥70%):** auto-placement khả thi → Plan 2 xây full auto flow (occlusion + auto-scale là mặc định, có override).
  - **FAIL (<70%):** kích hoạt **fallback thủ công** → Plan 2 ship manual-first (mặt sàn + raycast + kéo/scale/xoay-Y tay + contact shadow), auto thành assist sau toggle.
  - Ghi quyết định + số liệu + ảnh minh họa vào `spike-results-*.md`. Commit.
- [ ] **Step 6:** Báo founder kết quả gate → cùng chốt hình dạng Plan 2.

---

## Self-Review

**Spec coverage (Plan 1 scope = Spike + Foundation):**
- Monorepo/stack (spec §2,3) → Task 0 ✅
- Compositing tách occlusion/scale (spec §4) → Task 2,3,6 ✅
- Depth server-side + cache + AIGateway (spec §5) → Task 4 ✅
- Render composite + contact shadow (spec §4) → Task 5 ✅
- Spike + decision gate + pass/fail (spec §10) → Task 7 ✅
- *Ngoài Plan 1 (sang Plan 2 sau gate):* style palette, catalog drawer, removal tool (segment+inpaint), estimate/lead/affiliate, export/share, analytics, error/fallback UX đầy đủ, DESIGN.md áp toàn bộ màn. → **Chủ đích hoãn tới sau gate** (đã ghi rõ ở đầu plan).

**Placeholder scan:** không có "TBD/handle edge cases" trần — Task 7 là spike có chủ đích (rubric thay TDD, đã nêu rõ lý do). ✅

**Type consistency:** `DepthMap`, `Calibration`, `Transform`, `CameraModel`, `Plane`, `AIError` dùng nhất quán qua Task 1→7. `calibrate`/`placeOnFloor`/`cameraToThree`/`depthMapToTexture`/`AIGateway.depth` — tên khớp giữa các task. ✅

**Rủi ro đã nêu:** occlusion shader + believability không TDD được → dồn vào Task 7 (spike, chấm mắt) đúng bản chất decision-gate.
