# Demo web cho pitch — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dựng trong `apps/web` một bản demo chạy trên trình duyệt đi trọn vòng P0 của PRD — chọn phong cách → tải ảnh phòng → xác nhận đường chân trời → xóa đồ cũ → đặt nhiều món 3D → dự toán → bấm Mua (thu lead) — với AI thật: depth + chạm chọn trong trình duyệt, xóa đồ bằng LaMa trên Replicate.

**Architecture:** Hàm thuần (che khuất, mask, ánh sáng, EXIF→FOV, dự toán, lịch sử hoàn tác, gateway AI) nằm trong `packages/core`, viết TDD bằng vitest. `apps/web` (Next.js 16 App Router, Turbopack) chứa UI, store Zustand, hai Web Worker chạy transformers.js (Depth Anything V2 Small, SlimSAM), cảnh R3F vẽ ảnh phòng + lượt ghi độ sâu để che khuất + đồ 3D + bóng, và một route `/api/ai/inpaint` gọi Replicate. Spec: `docs/superpowers/specs/2026-10-05-web-pitch-demo-design.md`.

**Tech Stack:** Next.js 16.2 · React 19.2 · TypeScript 5 · Tailwind 4 · three 0.185 / @react-three/fiber 9 / @react-three/drei 10 · zustand 5 · @huggingface/transformers 4.2 · vitest 2 · exifr · @phosphor-icons/react · @gltf-transform 4 + meshoptimizer (script dựng mô hình) · Replicate HTTP API.

## Global Constraints

- Mọi lệnh chạy từ gốc repo `/home/khiemdm/orca/Your-Space-Project`, nhánh `demo/web-pitch`. Package manager: `pnpm` (10.34.5).
- `apps/web` dùng **Next.js 16** — API khác bản cũ. Trước khi viết route/page, đọc hướng dẫn trong `apps/web/node_modules/next/dist/docs/` (theo `apps/web/AGENTS.md`). `params` và `searchParams` của page là **Promise**.
- `packages/core` bật `noUncheckedIndexedAccess`: truy cập mảng phải dùng `?? giá trị` hoặc `!` có lý do.
- UI theo `design-system/yourspace/MASTER.md` (hướng A · Phòng trưng bày): đen là màu hành động, vàng đồng `#A16207` chỉ cho giá/điểm nhấn, tối đa **một nút chính mỗi màn**, nút viên thuốc, không bóng trang trí. Chỉ theme sáng. Không thêm quyết định thị giác mới.
- Font tiêu đề: Bricolage Grotesque qua `next/font/google` với `subsets: ["latin", "vietnamese"]` (đã kiểm: có subset `vietnamese`). Chữ giao diện: font hệ thống.
- **Không có tỷ lệ cho từng món** (founder 2026-10-04, MASTER.md). F1 = nút "Chỉnh cỡ phòng" (chiều cao máy 0,8–2,0 m).
- Câu consent bắt buộc, đúng nguyên văn: **"Ảnh được gửi lên hệ thống để xử lý và xóa ngay sau đó."** Không viết câu nào ngụ ý ảnh không rời khỏi máy.
- Dữ liệu catalog là mẫu: luôn ghi "giá mẫu" / "Bản demo". Lead **không gửi đi, không lưu**.
- Token `REPLICATE_API_TOKEN` chỉ đọc ở server (`process.env`), không bao giờ có `NEXT_PUBLIC_`.
- Mô hình LaMa: `allenhooo/lama`, version `cdac78a1bec5b23c07fd29692fb70baa513ea403a39e643c48ec5edadb15fe72`, input `{ image: uri, mask: uri }`, output `uri` (PNG). Data URI dùng được cho file < 1 MB. Replicate tự xóa input/output của prediction tạo qua API sau 1 giờ.
- Model trình duyệt: `onnx-community/depth-anything-v2-small` (depth), `Xenova/slimsam-77-uniform` (SAM). `device: "webgpu"` nếu `navigator.gpu` có, không thì `"wasm"`.
- Ảnh làm việc: cạnh dài ≤ 1600 px, JPEG.
- Commit sau mỗi task, message tiếng Việt kiểu `feat(core): …`, kết thúc bằng dòng `Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>`.
- Trang `/spike`, `/capture`, `/sensor-test` giữ nguyên.

## File Structure

```
packages/core/src/
  catalog/types.ts            StyleId, Category, Style, Supplier, FurnitureModel
  pricing/estimate.ts         estimate()                               (+ .test.ts)
  scene/exif-fov.ts           fovYFromFocal35()                         (+ .test.ts)
  scene/occlusion.ts          floorViewZ, fitDepthToFloor, viewZFromDisparity, buildOccluderDepth (+ .test.ts)
  scene/lighting.ts           imageStats, lightingFromImageStats        (+ .test.ts)
  mask/mask.ts                Mask, unionMasks, dilateMask, extendDown, maskBBox, prepareEraseMask, cropSquare (+ .test.ts)
  editor/history.ts           History<T>, createHistory, commit, replace, begin, end, undo, redo (+ .test.ts)
  lead/phone.ts               normalizeVnPhone                          (+ .test.ts)
  ai/gateway.ts               + makeCachedCall (makeCachedDepth thành lớp mỏng) (+ test)
  ai/types.ts                 + InpaintResult, InpaintService
  index.ts                    export thêm các module trên
apps/web/
  package.json, vitest.config.ts
  scripts/build-models.mjs    tải + tối ưu GLB, sinh lib/models.json + public/models/CREDITS.md
  app/globals.css, app/layout.tsx
  app/page.tsx                Mở đầu (trang dev cũ chuyển sang app/dev/page.tsx)
  app/phong-cach/page.tsx, app/phong-cach/[id]/page.tsx
  app/thu-phong/page.tsx + components/try-room/TryRoom.tsx
  app/chinh-sua/page.tsx
  app/api/ai/inpaint/route.ts
  components/ui/            Button.tsx, Chip.tsx, Sheet.tsx
  components/try-room/      TryRoom.tsx, HorizonOverlay.tsx
  components/editor/        RoomScene.tsx, EditorStage.tsx, Tray.tsx, ItemPanel.tsx, EstimateBar.tsx,
                            TopBar.tsx, RoomScalePopover.tsx, EraseTool.tsx, MaskOverlay.tsx, BuySheet.tsx, LeadForm.tsx
  lib/catalog.ts, lib/models.json, lib/format.ts, lib/image.ts, lib/store.ts, lib/erase.ts
  lib/hooks/                useSceneDepth.ts, usePhotoLighting.ts
  lib/workers/              rpc.ts, depth.worker.ts, sam.worker.ts
  lib/ai/                   depthClient.ts, samClient.ts, inpaintClient.ts
  lib/server/               replicateLama.ts, rateLimit.ts, inpaintHandler.ts (+ .test.ts mỗi file)
  public/models/*.glb + CREDITS.md, public/styles/*.jpg + CREDITS.md
```

---

### Task 1: Core — kiểu catalog và dự toán

**Files:**
- Create: `packages/core/src/catalog/types.ts`
- Create: `packages/core/src/pricing/estimate.ts`
- Test: `packages/core/src/pricing/estimate.test.ts`
- Modify: `packages/core/src/index.ts`

**Interfaces:**
- Consumes: `FurnitureDims` từ `packages/core/src/types.ts`.
- Produces:
  - `type StyleId = "japandi" | "mid-century" | "bauhaus"`
  - `type Category = "sofa" | "chair" | "table" | "shelf" | "lamp" | "plant"`
  - `type Style = { id: StyleId; name: string; summary: string; traits: { colors: string; materials: string; mood: string }; photo: string; photoCredit: string }`
  - `type Supplier = { id: string; name: string; deliveryMinDays: number; deliveryMaxDays: number }`
  - `type FurnitureModel = { id: string; name: string; styleId: StyleId; category: Category; supplierId: string; priceVND: number; dimsM: FurnitureDims; glbUrl: string; material: string; baseYawRad: number }`
  - `estimate(productIds: readonly string[], models: readonly FurnitureModel[], suppliers: readonly Supplier[]): Estimate` với `Estimate = { groups: EstimateGroup[]; totalVND: number; itemCount: number }`, `EstimateGroup = { supplier: Supplier; lines: EstimateLine[]; subtotalVND: number }`, `EstimateLine = { model: FurnitureModel; qty: number; lineVND: number }`.

- [ ] **Step 1: Viết kiểu catalog**

`packages/core/src/catalog/types.ts`:

```ts
import type { FurnitureDims } from "../types";

export type StyleId = "japandi" | "mid-century" | "bauhaus";
export type Category = "sofa" | "chair" | "table" | "shelf" | "lamp" | "plant";

export type Style = {
  id: StyleId;
  name: string;
  summary: string;
  traits: { colors: string; materials: string; mood: string };
  /** Ảnh tâm trạng phong cách (đường dẫn public). */
  photo: string;
  photoCredit: string;
};

export type Supplier = {
  id: string;
  name: string;
  deliveryMinDays: number;
  deliveryMaxDays: number;
};

/** Một món có mô hình 3D, kích thước thật (mét) đo từ chính mô hình. */
export type FurnitureModel = {
  id: string;
  name: string;
  styleId: StyleId;
  category: Category;
  supplierId: string;
  priceVND: number;
  dimsM: FurnitureDims;
  glbUrl: string;
  material: string;
  /** Xoay thêm để mặt trước món hướng về máy ảnh khi rotationY = 0. */
  baseYawRad: number;
};
```

- [ ] **Step 2: Viết test thất bại cho `estimate`**

`packages/core/src/pricing/estimate.test.ts`:

```ts
import { expect, test } from "vitest";
import type { FurnitureModel, Supplier } from "../catalog/types";
import { estimate } from "./estimate";

const dims = { widthM: 1, heightM: 1, depthM: 1 };
const model = (id: string, supplierId: string, priceVND: number): FurnitureModel => ({
  id, name: id, styleId: "japandi", category: "sofa", supplierId, priceVND, dimsM: dims,
  glbUrl: `/models/${id}.glb`, material: "", baseYawRad: 0,
});
const suppliers: Supplier[] = [
  { id: "a", name: "Xưởng A", deliveryMinDays: 1, deliveryMaxDays: 2 },
  { id: "b", name: "Xưởng B", deliveryMinDays: 3, deliveryMaxDays: 4 },
];
const models = [model("sofa", "a", 10_000_000), model("ban", "b", 2_000_000), model("ke", "a", 3_000_000)];

test("không có món → tổng 0, không nhóm", () => {
  expect(estimate([], models, suppliers)).toEqual({ groups: [], totalVND: 0, itemCount: 0 });
});

test("cùng món đặt 2 lần → qty 2, cộng tiền", () => {
  const e = estimate(["sofa", "sofa"], models, suppliers);
  expect(e.groups).toHaveLength(1);
  expect(e.groups[0]?.lines[0]?.qty).toBe(2);
  expect(e.groups[0]?.lines[0]?.lineVND).toBe(20_000_000);
  expect(e.totalVND).toBe(20_000_000);
  expect(e.itemCount).toBe(2);
});

test("nhóm theo nhà cung cấp, theo thứ tự xuất hiện đầu tiên", () => {
  const e = estimate(["ban", "sofa", "ke"], models, suppliers);
  expect(e.groups.map((g) => g.supplier.id)).toEqual(["b", "a"]);
  expect(e.groups[1]?.lines.map((l) => l.model.id)).toEqual(["sofa", "ke"]);
  expect(e.groups[1]?.subtotalVND).toBe(13_000_000);
  expect(e.totalVND).toBe(15_000_000);
});

test("id không có trong catalog bị bỏ qua", () => {
  const e = estimate(["khong-co", "ban"], models, suppliers);
  expect(e.itemCount).toBe(1);
  expect(e.totalVND).toBe(2_000_000);
});
```

- [ ] **Step 2b: Chạy để thấy thất bại**

Run: `pnpm --filter @yourspace/core test -- estimate`
Expected: FAIL — `Failed to resolve import "./estimate"`.

- [ ] **Step 3: Cài đặt**

`packages/core/src/pricing/estimate.ts`:

```ts
import type { FurnitureModel, Supplier } from "../catalog/types";

export type EstimateLine = { model: FurnitureModel; qty: number; lineVND: number };
export type EstimateGroup = { supplier: Supplier; lines: EstimateLine[]; subtotalVND: number };
export type Estimate = { groups: EstimateGroup[]; totalVND: number; itemCount: number };

/**
 * Dự toán: gộp số lượng theo món, nhóm theo nhà cung cấp (giữ thứ tự xuất hiện đầu tiên).
 * Món không có trong catalog hoặc nhà cung cấp không tồn tại bị bỏ qua.
 */
export function estimate(
  productIds: readonly string[],
  models: readonly FurnitureModel[],
  suppliers: readonly Supplier[],
): Estimate {
  const byId = new Map(models.map((m) => [m.id, m]));
  const supplierById = new Map(suppliers.map((s) => [s.id, s]));
  const groups = new Map<string, EstimateGroup>();

  for (const id of productIds) {
    const model = byId.get(id);
    const supplier = model ? supplierById.get(model.supplierId) : undefined;
    if (!model || !supplier) continue;
    let group = groups.get(supplier.id);
    if (!group) {
      group = { supplier, lines: [], subtotalVND: 0 };
      groups.set(supplier.id, group);
    }
    let line = group.lines.find((l) => l.model.id === id);
    if (!line) {
      line = { model, qty: 0, lineVND: 0 };
      group.lines.push(line);
    }
    line.qty += 1;
    line.lineVND += model.priceVND;
    group.subtotalVND += model.priceVND;
  }

  const list = [...groups.values()];
  return {
    groups: list,
    totalVND: list.reduce((s, g) => s + g.subtotalVND, 0),
    itemCount: list.reduce((s, g) => s + g.lines.reduce((n, l) => n + l.qty, 0), 0),
  };
}
```

Thêm vào cuối `packages/core/src/index.ts`:

```ts
export * from "./catalog/types";
export * from "./pricing/estimate";
```

- [ ] **Step 4: Chạy test**

Run: `pnpm --filter @yourspace/core test && pnpm --filter @yourspace/core typecheck`
Expected: PASS toàn bộ (20 test cũ + 4 test mới), typecheck không lỗi.

- [ ] **Step 5: Commit**

```bash
git add packages/core/src/catalog packages/core/src/pricing packages/core/src/index.ts
git commit -m "feat(core): kiểu catalog và dự toán theo nhà cung cấp

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: Core — FOV từ EXIF

**Files:**
- Create: `packages/core/src/scene/exif-fov.ts`
- Test: `packages/core/src/scene/exif-fov.test.ts`
- Modify: `packages/core/src/index.ts`

**Interfaces:**
- Produces: `fovYFromFocal35(focal35mm: number | null | undefined, aspect: number): number | null` — FOV dọc (radian) từ tiêu cự tương đương 35 mm và tỷ lệ ảnh **sau khi xoay đúng chiều** (`width / height`). `null` nếu tiêu cự thiếu hoặc ngoài (8, 300) mm.

- [ ] **Step 1: Test thất bại**

`packages/core/src/scene/exif-fov.test.ts`:

```ts
import { expect, test } from "vitest";
import { fovYFromFocal35 } from "./exif-fov";

const deg = (r: number) => (r * 180) / Math.PI;

test("26 mm, ảnh dọc 3:4 → FOV dọc ≈ 67,3°", () => {
  expect(deg(fovYFromFocal35(26, 3 / 4)!)).toBeCloseTo(67.3, 0);
});

test("26 mm, ảnh ngang 4:3 → FOV dọc ≈ 53,1°", () => {
  expect(deg(fovYFromFocal35(26, 4 / 3)!)).toBeCloseTo(53.1, 0);
});

test("thiếu hoặc vô lý → null", () => {
  expect(fovYFromFocal35(undefined, 1)).toBeNull();
  expect(fovYFromFocal35(null, 1)).toBeNull();
  expect(fovYFromFocal35(0, 1)).toBeNull();
  expect(fovYFromFocal35(500, 1)).toBeNull();
});
```

Run: `pnpm --filter @yourspace/core test -- exif-fov` → FAIL (không tìm thấy module).

- [ ] **Step 2: Cài đặt**

`packages/core/src/scene/exif-fov.ts`:

```ts
/** Đường chéo khung 35 mm (36 × 24 mm). */
const DIAG_35 = Math.hypot(36, 24);

/**
 * FOV dọc từ tiêu cự tương đương 35 mm (EXIF FocalLengthIn35mmFormat).
 * Tiêu cự tương đương giữ nguyên góc nhìn theo ĐƯỜNG CHÉO, nên chiều cao cảm biến tương đương
 * = đường chéo 35 mm / √(1 + aspect²) với aspect = rộng / cao của ảnh đã xoay đúng chiều.
 */
export function fovYFromFocal35(focal35mm: number | null | undefined, aspect: number): number | null {
  if (focal35mm == null || !(focal35mm > 8) || !(focal35mm < 300) || !(aspect > 0)) return null;
  const heightMm = DIAG_35 / Math.sqrt(1 + aspect * aspect);
  return 2 * Math.atan(heightMm / (2 * focal35mm));
}
```

Thêm vào `packages/core/src/index.ts`: `export * from "./scene/exif-fov";`

- [ ] **Step 3: Chạy test**

Run: `pnpm --filter @yourspace/core test -- exif-fov`
Expected: PASS 3 test.

- [ ] **Step 4: Commit**

```bash
git add packages/core/src/scene/exif-fov.ts packages/core/src/scene/exif-fov.test.ts packages/core/src/index.ts
git commit -m "feat(core): FOV dọc từ tiêu cự EXIF tương đương 35 mm

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: Core — khớp depth theo mặt sàn và ảnh độ sâu che khuất

**Files:**
- Create: `packages/core/src/scene/occlusion.ts`
- Test: `packages/core/src/scene/occlusion.test.ts`
- Modify: `packages/core/src/index.ts`

**Interfaces:**
- Consumes: `CameraModel`, `DepthMap` (`packages/core/src/types.ts`), `pixelRayDir(nx, ny, fovYRad, aspect)` (`scene/ray.ts`). Quy ước camera giống `scene/fixtures/synthetic-floor.ts`: camera ở gốc nhìn −Z, nghiêng xuống `pitchRad`, cao `heightM`; mặt sàn trong không gian camera là `n·X + heightM = 0` với `n = (0, cos p, sin p)`.
- Produces:
  - `type DisparityMap = DepthMap` — **giá trị LỚN = GẦN**, chuẩn hoá 0..1, hàng 0 là đỉnh ảnh (đầu ra thô của Depth Anything).
  - `type FloorFit = { a: number; b: number; confidence: number; samples: number }` — mô hình `1/z = a·disparity + b`.
  - `floorViewZ(nx: number, ny: number, cam: CameraModel): number | null` — độ sâu view-space (mét, dương) của mặt sàn tại NDC.
  - `fitDepthToFloor(disp: DisparityMap, cam: CameraModel): FloorFit`
  - `viewZFromDisparity(fit: FloorFit, disparity: number): number | null`
  - `buildOccluderDepth(disp: DisparityMap, fit: FloorFit, cam: CameraModel, opts?: { floorTolerance?: number; margin?: number; maxZ?: number }): Float32Array` — cùng kích thước `disp`; mỗi pixel là z (mét) **đã cộng dung sai** của vật thật đứng trước sàn, `0` = không che.

- [ ] **Step 1: Test thất bại**

`packages/core/src/scene/occlusion.test.ts`:

```ts
import { expect, test } from "vitest";
import type { CameraModel } from "../types";
import {
  buildOccluderDepth,
  fitDepthToFloor,
  floorViewZ,
  viewZFromDisparity,
  type DisparityMap,
} from "./occlusion";

const W = 64;
const H = 48;
const cam: CameraModel = { fovYRad: (60 * Math.PI) / 180, aspect: W / H, heightM: 1.4, pitchRad: (20 * Math.PI) / 180 };
const TRUE_A = 2;
const TRUE_B = 0.05;
const ndc = (i: number, j: number) => ({ nx: ((i + 0.5) / W) * 2 - 1, ny: 1 - ((j + 0.5) / H) * 2 });
const inBox = (i: number, j: number) => i >= 20 && i < 30 && j >= 30 && j < 40;

/** Disparity tổng hợp: sàn đúng mô hình 1/z = a·d + b; trên chân trời là tường xa; một hộp gần hơn sàn. */
function synthetic(): DisparityMap {
  const data = new Float32Array(W * H);
  for (let j = 0; j < H; j++) {
    for (let i = 0; i < W; i++) {
      const { nx, ny } = ndc(i, j);
      const zf = floorViewZ(nx, ny, cam);
      let d = 0.01;
      if (zf !== null) d = (1 / zf - TRUE_B) / TRUE_A;
      if (inBox(i, j) && zf !== null) d = (1 / (zf * 0.6) - TRUE_B) / TRUE_A; // vật cách máy 60% khoảng tới sàn
      data[j * W + i] = d;
    }
  }
  return { width: W, height: H, data };
}

test("floorViewZ: tia giữa ảnh chạm sàn ở z = h / sin(pitch)", () => {
  expect(floorViewZ(0, 0, cam)).toBeCloseTo(1.4 / Math.sin(cam.pitchRad), 3);
  expect(floorViewZ(0, 0.99, cam)).toBeNull(); // trên chân trời
});

test("fitDepthToFloor khôi phục a, b dù có vật thể lẫn vào", () => {
  const fit = fitDepthToFloor(synthetic(), cam);
  expect(fit.a).toBeCloseTo(TRUE_A, 1);
  expect(fit.b).toBeCloseTo(TRUE_B, 1);
  expect(fit.confidence).toBeGreaterThan(0.5);
});

test("viewZFromDisparity trên pixel sàn sai số < 5%", () => {
  const disp = synthetic();
  const fit = fitDepthToFloor(disp, cam);
  const i = 10, j = 44;
  const { nx, ny } = ndc(i, j);
  const zf = floorViewZ(nx, ny, cam)!;
  const z = viewZFromDisparity(fit, disp.data[j * W + i]!)!;
  expect(Math.abs(z - zf) / zf).toBeLessThan(0.05);
});

test("buildOccluderDepth: sàn = 0, hộp > 0 và gần hơn sàn", () => {
  const disp = synthetic();
  const fit = fitDepthToFloor(disp, cam);
  const occ = buildOccluderDepth(disp, fit, cam);
  expect(occ[44 * W + 10]).toBe(0);
  const i = 25, j = 35;
  const zBox = occ[j * W + i]!;
  const { nx, ny } = ndc(i, j);
  expect(zBox).toBeGreaterThan(0);
  expect(zBox).toBeLessThan(floorViewZ(nx, ny, cam)!);
});

test("quá ít điểm sàn → confidence 0", () => {
  const flat: DisparityMap = { width: 4, height: 2, data: new Float32Array(8).fill(0.5) };
  const up: CameraModel = { ...cam, pitchRad: -0.5 }; // nhìn lên: không tia nào chạm sàn
  expect(fitDepthToFloor(flat, up).confidence).toBe(0);
});
```

Run: `pnpm --filter @yourspace/core test -- occlusion` → FAIL (không tìm thấy module).

- [ ] **Step 2: Cài đặt**

`packages/core/src/scene/occlusion.ts`:

```ts
import type { CameraModel, DepthMap } from "../types";
import { pixelRayDir } from "./ray";

/** Disparity tương đối của Depth Anything: giá trị LỚN = GẦN, chuẩn hoá 0..1, hàng 0 = đỉnh ảnh. */
export type DisparityMap = DepthMap;

/** Mô hình 1/z = a·disparity + b (z view-space, mét). */
export type FloorFit = { a: number; b: number; confidence: number; samples: number };

const MAX_FLOOR_Z = 30;
const INLIER_TOL = 0.08;
const STRIDES = [1, 7, 13, 31, 61, 127];

/** Độ sâu view-space (mét, dương theo trục nhìn) của mặt sàn tại NDC; null nếu tia không chạm sàn phía trước. */
export function floorViewZ(nx: number, ny: number, cam: CameraModel): number | null {
  const dir = pixelRayDir(nx, ny, cam.fovYRad, cam.aspect);
  const denom = Math.cos(cam.pitchRad) * dir.y + Math.sin(cam.pitchRad) * dir.z;
  if (denom > -1e-4) return null;
  const t = -cam.heightM / denom;
  return t * -dir.z;
}

type Pt = { x: number; y: number };

function countInliers(pts: readonly Pt[], a: number, b: number): number {
  let n = 0;
  for (const p of pts) if (Math.abs(a * p.x + b - p.y) <= INLIER_TOL * p.y) n++;
  return n;
}

function leastSquares(pts: readonly Pt[]): { a: number; b: number } | null {
  const n = pts.length;
  if (n < 2) return null;
  let sx = 0, sy = 0, sxx = 0, sxy = 0;
  for (const p of pts) { sx += p.x; sy += p.y; sxx += p.x * p.x; sxy += p.x * p.y; }
  const den = n * sxx - sx * sx;
  if (Math.abs(den) < 1e-12) return null;
  const a = (n * sxy - sx * sy) / den;
  return { a, b: (sy - a * sx) / n };
}

/**
 * Khớp disparity tương đối với khoảng cách sàn mà camera dự đoán: với mỗi pixel có tia chạm sàn,
 * cặp (disparity, 1/z_sàn) phải nằm trên một đường thẳng nếu pixel đó đúng là sàn. RANSAC tất định
 * (bộ đôi chỉ số theo bước nguyên tố, như `calibrate`) để bỏ tường, đồ đạc; rồi bình phương tối thiểu trên inlier.
 */
export function fitDepthToFloor(disp: DisparityMap, cam: CameraModel): FloorFit {
  const { width: w, height: h, data } = disp;
  const stepX = Math.max(1, Math.floor(w / 64));
  const stepY = Math.max(1, Math.floor(h / 48));
  const pts: Pt[] = [];
  for (let j = 0; j < h; j += stepY) {
    for (let i = 0; i < w; i += stepX) {
      const d = data[j * w + i] ?? 0;
      if (d <= 0) continue;
      const zf = floorViewZ(((i + 0.5) / w) * 2 - 1, 1 - ((j + 0.5) / h) * 2, cam);
      if (zf === null || zf > MAX_FLOOR_Z) continue;
      pts.push({ x: d, y: 1 / zf });
    }
  }
  const n = pts.length;
  if (n < 12) return { a: 0, b: 0, confidence: 0, samples: n };

  let best = { a: 0, b: 0, inliers: 0 };
  const startStep = Math.max(1, Math.floor(n / 32));
  for (const s of STRIDES) {
    for (let start = 0; start < n; start += startStep) {
      const p = pts[start]!;
      const q = pts[(start + s * 5 + 3) % n]!;
      if (Math.abs(q.x - p.x) < 1e-3) continue;
      const a = (q.y - p.y) / (q.x - p.x);
      if (a <= 0) continue;
      const b = p.y - a * p.x;
      const inliers = countInliers(pts, a, b);
      if (inliers > best.inliers) best = { a, b, inliers };
    }
  }
  if (best.inliers === 0) return { a: 0, b: 0, confidence: 0, samples: n };

  const inlierPts = pts.filter((p) => Math.abs(best.a * p.x + best.b - p.y) <= INLIER_TOL * p.y);
  const refit = leastSquares(inlierPts);
  const { a, b } = refit && refit.a > 0 ? refit : best;
  return { a, b, confidence: countInliers(pts, a, b) / n, samples: n };
}

export function viewZFromDisparity(fit: FloorFit, disparity: number): number | null {
  const inv = fit.a * disparity + fit.b;
  return inv > 1e-3 ? 1 / inv : null;
}

/**
 * Ảnh độ sâu cho lượt che khuất. Pixel có z ≥ (1 − floorTolerance)·z_sàn được coi là chính mặt sàn
 * (hoặc sau sàn) → 0, để chân đồ không bị sàn cắt. Pixel còn lại là vật thật trước sàn: trả z·(1 + margin)
 * — đồ mới chỉ bị che khi cảnh thật gần hơn quá `margin` (spike dùng 5%).
 */
export function buildOccluderDepth(
  disp: DisparityMap,
  fit: FloorFit,
  cam: CameraModel,
  opts: { floorTolerance?: number; margin?: number; maxZ?: number } = {},
): Float32Array {
  const tol = opts.floorTolerance ?? 0.08;
  const margin = opts.margin ?? 0.05;
  const maxZ = opts.maxZ ?? 40;
  const { width: w, height: h, data } = disp;
  const out = new Float32Array(w * h);
  for (let j = 0; j < h; j++) {
    for (let i = 0; i < w; i++) {
      const k = j * w + i;
      const z = viewZFromDisparity(fit, data[k] ?? 0);
      if (z === null || z > maxZ) continue;
      const zf = floorViewZ(((i + 0.5) / w) * 2 - 1, 1 - ((j + 0.5) / h) * 2, cam);
      if (zf !== null && z >= zf * (1 - tol)) continue;
      out[k] = z * (1 + margin);
    }
  }
  return out;
}
```

Thêm vào `packages/core/src/index.ts`: `export * from "./scene/occlusion";`

- [ ] **Step 3: Chạy test**

Run: `pnpm --filter @yourspace/core test -- occlusion`
Expected: PASS 5 test. Nếu `fitDepthToFloor` lệch a/b: in `fit` ra, kiểm lại dấu `denom` trong `floorViewZ` so với `synthetic-floor.ts` (phải trùng quy ước), không nới ngưỡng test.

- [ ] **Step 4: Commit**

```bash
git add packages/core/src/scene/occlusion.ts packages/core/src/scene/occlusion.test.ts packages/core/src/index.ts
git commit -m "feat(core): khớp depth tương đối theo mặt sàn + ảnh độ sâu che khuất

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 4: Core — đo ảnh để đặt ánh sáng

**Files:**
- Create: `packages/core/src/scene/lighting.ts`
- Test: `packages/core/src/scene/lighting.test.ts`
- Modify: `packages/core/src/index.ts`

**Interfaces:**
- Produces:
  - `type ImageStats = { meanLuminance: number; meanColor: { r: number; g: number; b: number } }` (tuyến tính 0..1)
  - `imageStats(rgba: Uint8ClampedArray | Uint8Array, width: number, height: number): ImageStats`
  - `type PhotoLighting = { exposure: number; ambientIntensity: number; keyIntensity: number; color: { r: number; g: number; b: number } }`
  - `lightingFromImageStats(s: ImageStats): PhotoLighting`

- [ ] **Step 1: Test thất bại**

`packages/core/src/scene/lighting.test.ts`:

```ts
import { expect, test } from "vitest";
import { imageStats, lightingFromImageStats } from "./lighting";

const solid = (r: number, g: number, b: number, n = 16) => {
  const px = new Uint8ClampedArray(n * 4);
  for (let i = 0; i < n; i++) px.set([r, g, b, 255], i * 4);
  return imageStats(px, n, 1);
};

test("xám 18% (sRGB 118) → exposure ≈ 1", () => {
  expect(lightingFromImageStats(solid(118, 118, 118)).exposure).toBeCloseTo(1, 1);
});

test("ảnh đen → exposure kẹp 0,25; ảnh trắng → kẹp 1,8", () => {
  expect(lightingFromImageStats(solid(0, 0, 0)).exposure).toBe(0.25);
  expect(lightingFromImageStats(solid(255, 255, 255)).exposure).toBe(1.8);
});

test("ảnh ấm → đèn ấm (r > b); ảnh trung tính → đèn trắng", () => {
  const warm = lightingFromImageStats(solid(200, 150, 100)).color;
  expect(warm.r).toBeGreaterThan(warm.b);
  const grey = lightingFromImageStats(solid(128, 128, 128)).color;
  expect(grey).toEqual({ r: 1, g: 1, b: 1 });
});
```

Run: `pnpm --filter @yourspace/core test -- lighting` → FAIL.

- [ ] **Step 2: Cài đặt**

`packages/core/src/scene/lighting.ts`:

```ts
export type ImageStats = { meanLuminance: number; meanColor: { r: number; g: number; b: number } };
export type PhotoLighting = {
  exposure: number;
  ambientIntensity: number;
  keyIntensity: number;
  color: { r: number; g: number; b: number };
};

const toLinear = (c8: number): number => {
  const c = c8 / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};

/** Độ sáng và màu trung bình TUYẾN TÍNH của ảnh RGBA (bỏ pixel trong suốt). */
export function imageStats(rgba: Uint8ClampedArray | Uint8Array, width: number, height: number): ImageStats {
  let r = 0, g = 0, b = 0, n = 0;
  for (let k = 0; k < width * height; k++) {
    if ((rgba[k * 4 + 3] ?? 0) === 0) continue;
    r += toLinear(rgba[k * 4] ?? 0);
    g += toLinear(rgba[k * 4 + 1] ?? 0);
    b += toLinear(rgba[k * 4 + 2] ?? 0);
    n++;
  }
  if (n === 0) return { meanLuminance: 0, meanColor: { r: 0, g: 0, b: 0 } };
  const meanColor = { r: r / n, g: g / n, b: b / n };
  return { meanLuminance: 0.2126 * meanColor.r + 0.7152 * meanColor.g + 0.0722 * meanColor.b, meanColor };
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/**
 * Ánh sáng cho đồ 3D theo ảnh phòng. Phơi sáng như spike: clamp((L / 0,18)^0,6; 0,25; 1,8).
 * Màu đèn = màu trung bình chuẩn hoá theo kênh lớn nhất, pha 50% với trắng để không nhuộm quá tay.
 */
export function lightingFromImageStats(s: ImageStats): PhotoLighting {
  const exposure = clamp((s.meanLuminance / 0.18) ** 0.6, 0.25, 1.8);
  const max = Math.max(s.meanColor.r, s.meanColor.g, s.meanColor.b);
  const tint = (c: number) => (max > 0 ? Math.round((0.5 + 0.5 * (c / max)) * 1000) / 1000 : 1);
  return {
    exposure,
    ambientIntensity: 0.8,
    keyIntensity: 1.6,
    color: { r: tint(s.meanColor.r), g: tint(s.meanColor.g), b: tint(s.meanColor.b) },
  };
}
```

Thêm vào `packages/core/src/index.ts`: `export * from "./scene/lighting";`

- [ ] **Step 3: Chạy test**

Run: `pnpm --filter @yourspace/core test -- lighting` → PASS 3 test.

- [ ] **Step 4: Commit**

```bash
git add packages/core/src/scene/lighting.ts packages/core/src/scene/lighting.test.ts packages/core/src/index.ts
git commit -m "feat(core): đo độ sáng, màu ảnh để đặt ánh sáng cho đồ 3D

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 5: Core — xử lý mask xóa đồ

**Files:**
- Create: `packages/core/src/mask/mask.ts`
- Test: `packages/core/src/mask/mask.test.ts`
- Modify: `packages/core/src/index.ts`

**Interfaces:**
- Produces:
  - `type Mask = { width: number; height: number; data: Uint8Array }` (1 = chọn, row-major, hàng 0 = đỉnh ảnh)
  - `type Rect = { x: number; y: number; w: number; h: number }`
  - `emptyMask(width: number, height: number): Mask`
  - `unionMasks(masks: readonly Mask[]): Mask` — ném lỗi nếu rỗng hoặc khác kích thước
  - `dilateMask(m: Mask, r: number): Mask` — nới vuông bán kính `r` px
  - `extendDown(m: Mask, px: number): Mask` — kéo mỗi pixel đã chọn xuống thêm `px` hàng
  - `maskBBox(m: Mask): Rect | null`, `maskArea(m: Mask): number`
  - `prepareEraseMask(objects: readonly Mask[], previous: Mask | null): Mask` — nới 1,2% cạnh dài; món có đáy ở nửa dưới ảnh kéo thêm 2,5% chiều cao xuống; gộp với vùng đã xóa trước
  - `cropSquare(bbox: Rect, width: number, height: number): Rect` — ô vuông cạnh `clamp(2·max(w,h), 512, min(W,H))` quanh tâm bbox, kẹp trong ảnh; bbox không vừa thì trả cả ảnh

- [ ] **Step 1: Test thất bại**

`packages/core/src/mask/mask.test.ts`:

```ts
import { expect, test } from "vitest";
import {
  cropSquare, dilateMask, emptyMask, extendDown, maskArea, maskBBox, prepareEraseMask, unionMasks, type Mask,
} from "./mask";

const withPixels = (w: number, h: number, pts: Array<[number, number]>): Mask => {
  const m = emptyMask(w, h);
  for (const [x, y] of pts) m.data[y * w + x] = 1;
  return m;
};

test("unionMasks gộp, sai kích thước thì ném lỗi", () => {
  const u = unionMasks([withPixels(4, 4, [[0, 0]]), withPixels(4, 4, [[3, 3]])]);
  expect(maskArea(u)).toBe(2);
  expect(() => unionMasks([emptyMask(4, 4), emptyMask(5, 4)])).toThrow();
  expect(() => unionMasks([])).toThrow();
});

test("dilateMask nới vuông bán kính r", () => {
  expect(maskArea(dilateMask(withPixels(9, 9, [[4, 4]]), 1))).toBe(9);
  expect(maskArea(dilateMask(withPixels(9, 9, [[0, 0]]), 2))).toBe(9); // bị cắt ở góc
});

test("extendDown kéo xuống, không vượt đáy", () => {
  const m = extendDown(withPixels(3, 5, [[1, 2]]), 5);
  expect(maskBBox(m)).toEqual({ x: 1, y: 2, w: 1, h: 3 });
});

test("maskBBox của mask rỗng là null", () => {
  expect(maskBBox(emptyMask(3, 3))).toBeNull();
});

test("prepareEraseMask: nới + kéo bóng cho món ở nửa dưới, gộp vùng cũ", () => {
  const W = 200, H = 100;
  const low = withPixels(W, H, [[50, 80]]); // nửa dưới
  const high = withPixels(W, H, [[150, 10]]); // nửa trên
  const prev = withPixels(W, H, [[0, 0]]);
  const m = prepareEraseMask([low, high], prev);
  // r = round(0,012·200) = 2; kéo xuống round(0,025·100) = 3 (rồi nới, nên vẫn tới đáy vùng nới)
  const lowBox = maskBBox(unionMasks([prepareEraseMask([low], null)]))!;
  expect(lowBox.y + lowBox.h).toBe(80 + 2 + 3 + 1);
  const highBox = maskBBox(prepareEraseMask([high], null))!;
  expect(highBox.h).toBe(5); // chỉ nới, không kéo
  expect(m.data[0]).toBe(1);
});

test("cropSquare: ô 512 quanh bbox nhỏ, kẹp trong ảnh; bbox quá lớn → cả ảnh", () => {
  expect(cropSquare({ x: 10, y: 10, w: 20, h: 20 }, 1600, 1200)).toEqual({ x: 0, y: 0, w: 512, h: 512 });
  expect(cropSquare({ x: 700, y: 500, w: 100, h: 100 }, 1600, 1200)).toEqual({ x: 494, y: 294, w: 512, h: 512 });
  expect(cropSquare({ x: 0, y: 0, w: 1500, h: 100 }, 1600, 1200)).toEqual({ x: 0, y: 0, w: 1600, h: 1200 });
});
```

Run: `pnpm --filter @yourspace/core test -- mask` → FAIL.

- [ ] **Step 2: Cài đặt**

`packages/core/src/mask/mask.ts`:

```ts
export type Mask = { width: number; height: number; data: Uint8Array };
export type Rect = { x: number; y: number; w: number; h: number };

export function emptyMask(width: number, height: number): Mask {
  return { width, height, data: new Uint8Array(width * height) };
}

export function unionMasks(masks: readonly Mask[]): Mask {
  const first = masks[0];
  if (!first) throw new Error("unionMasks: danh sách rỗng");
  const out = emptyMask(first.width, first.height);
  for (const m of masks) {
    if (m.width !== first.width || m.height !== first.height) throw new Error("unionMasks: khác kích thước");
    for (let k = 0; k < m.data.length; k++) if (m.data[k]) out.data[k] = 1;
  }
  return out;
}

/** Nới vuông bán kính r: tách hai lượt ngang rồi dọc (max theo cửa sổ). */
export function dilateMask(m: Mask, r: number): Mask {
  if (r <= 0) return { ...m, data: m.data.slice() };
  const { width: w, height: h } = m;
  const tmp = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (!m.data[y * w + x]) continue;
      for (let dx = Math.max(0, x - r); dx <= Math.min(w - 1, x + r); dx++) tmp[y * w + dx] = 1;
    }
  }
  const out = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (!tmp[y * w + x]) continue;
      for (let dy = Math.max(0, y - r); dy <= Math.min(h - 1, y + r); dy++) out[dy * w + x] = 1;
    }
  }
  return { width: w, height: h, data: out };
}

export function extendDown(m: Mask, px: number): Mask {
  const { width: w, height: h } = m;
  const out = m.data.slice();
  for (let x = 0; x < w; x++) {
    let remaining = 0;
    for (let y = 0; y < h; y++) {
      if (m.data[y * w + x]) remaining = px;
      else if (remaining > 0) { out[y * w + x] = 1; remaining--; }
    }
  }
  return { width: w, height: h, data: out };
}

export function maskArea(m: Mask): number {
  let n = 0;
  for (let k = 0; k < m.data.length; k++) if (m.data[k]) n++;
  return n;
}

export function maskBBox(m: Mask): Rect | null {
  let x0 = Infinity, y0 = Infinity, x1 = -1, y1 = -1;
  for (let y = 0; y < m.height; y++) {
    for (let x = 0; x < m.width; x++) {
      if (!m.data[y * m.width + x]) continue;
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
      if (y < y0) y0 = y;
      if (y > y1) y1 = y;
    }
  }
  return x1 < 0 ? null : { x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1 };
}

/**
 * Mask gửi đi lấp (quy tắc của spike): nới 1,2% cạnh dài; món có đáy ở nửa dưới ảnh kéo thêm
 * 2,5% chiều cao xuống để ăn bóng tiếp xúc; gộp với vùng đã xóa trước (luôn lấp lại từ ảnh gốc).
 */
export function prepareEraseMask(objects: readonly Mask[], previous: Mask | null): Mask {
  const parts: Mask[] = previous ? [previous] : [];
  for (const obj of objects) {
    const box = maskBBox(obj);
    if (!box) continue;
    const r = Math.round(0.012 * Math.max(obj.width, obj.height));
    const shadow = box.y + box.h > obj.height / 2 ? Math.round(0.025 * obj.height) : 0;
    parts.push(dilateMask(shadow > 0 ? extendDown(obj, shadow) : obj, r));
  }
  const first = objects[0] ?? previous;
  if (parts.length === 0) {
    if (!first) throw new Error("prepareEraseMask: không có mask");
    return emptyMask(first.width, first.height);
  }
  return unionMasks(parts);
}

export function cropSquare(bbox: Rect, width: number, height: number): Rect {
  const side = Math.min(Math.max(2 * Math.max(bbox.w, bbox.h), 512), Math.min(width, height));
  if (bbox.w > side || bbox.h > side) return { x: 0, y: 0, w: width, h: height };
  const cx = bbox.x + bbox.w / 2;
  const cy = bbox.y + bbox.h / 2;
  const x = Math.round(Math.min(Math.max(cx - side / 2, 0), width - side));
  const y = Math.round(Math.min(Math.max(cy - side / 2, 0), height - side));
  return { x, y, w: side, h: side };
}
```

Thêm vào `packages/core/src/index.ts`: `export * from "./mask/mask";`

- [ ] **Step 3: Chạy test**

Run: `pnpm --filter @yourspace/core test -- mask` → PASS 6 test. Test `prepareEraseMask` tính: kéo xuống 3 hàng (y 81..83) rồi nới 2 → đáy ở hàng 85 → `y + h = 86 = 80 + 2 + 3 + 1`.

- [ ] **Step 4: Commit**

```bash
git add packages/core/src/mask packages/core/src/index.ts
git commit -m "feat(core): xử lý mask xóa đồ (gộp, nới, kéo bóng, ô cắt)

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 6: Core — lịch sử hoàn tác và chuẩn hoá SĐT

**Files:**
- Create: `packages/core/src/editor/history.ts`, `packages/core/src/lead/phone.ts`
- Test: `packages/core/src/editor/history.test.ts`, `packages/core/src/lead/phone.test.ts`
- Modify: `packages/core/src/index.ts`

**Interfaces:**
- Produces:
  - `type History<T> = { past: T[]; present: T; future: T[]; checkpoint: T | null }`
  - `createHistory<T>(initial: T): History<T>`
  - `commit<T>(h: History<T>, next: T): History<T>` — đẩy `present` vào `past` (giữ tối đa 50), xoá `future`
  - `replace<T>(h: History<T>, next: T): History<T>` — đổi `present`, không tạo bước
  - `begin<T>(h: History<T>): History<T>` — ghi `checkpoint = present`
  - `end<T>(h: History<T>): History<T>` — nếu `present` khác `checkpoint` thì đẩy checkpoint thành một bước
  - `undo<T>`, `redo<T>`, `canUndo<T>(h): boolean`, `canRedo<T>(h): boolean`
  - `normalizeVnPhone(input: string): string | null` — bỏ khoảng trắng/dấu chấm/gạch, `+84` → `0`; hợp lệ khi khớp `^0(3|5|7|8|9)\d{8}$`

- [ ] **Step 1: Test thất bại**

`packages/core/src/editor/history.test.ts`:

```ts
import { expect, test } from "vitest";
import { begin, canRedo, canUndo, commit, createHistory, end, redo, replace, undo } from "./history";

test("commit / undo / redo", () => {
  let h = createHistory(0);
  h = commit(h, 1);
  h = commit(h, 2);
  expect(h.present).toBe(2);
  h = undo(h);
  expect(h.present).toBe(1);
  expect(canRedo(h)).toBe(true);
  h = redo(h);
  expect(h.present).toBe(2);
  h = commit(undo(h), 9);
  expect(canRedo(h)).toBe(false);
});

test("undo khi rỗng không đổi gì", () => {
  const h = createHistory("a");
  expect(undo(h)).toBe(h);
  expect(canUndo(h)).toBe(false);
});

test("begin / replace nhiều lần / end = một bước", () => {
  let h = createHistory(0);
  h = begin(h);
  h = replace(h, 1);
  h = replace(h, 2);
  h = end(h);
  expect(h.past).toEqual([0]);
  expect(undo(h).present).toBe(0);
});

test("end khi không đổi gì thì không tạo bước", () => {
  const h = end(begin(createHistory(5)));
  expect(h.past).toEqual([]);
  expect(h.checkpoint).toBeNull();
});

test("giữ tối đa 50 bước", () => {
  let h = createHistory(0);
  for (let i = 1; i <= 60; i++) h = commit(h, i);
  expect(h.past).toHaveLength(50);
  expect(h.past[0]).toBe(10);
});
```

`packages/core/src/lead/phone.test.ts`:

```ts
import { expect, test } from "vitest";
import { normalizeVnPhone } from "./phone";

test("chuẩn hoá số di động Việt Nam", () => {
  expect(normalizeVnPhone("0912 345 678")).toBe("0912345678");
  expect(normalizeVnPhone("+84 912.345.678")).toBe("0912345678");
  expect(normalizeVnPhone("84-912-345-678")).toBe("0912345678");
});

test("sai định dạng → null", () => {
  expect(normalizeVnPhone("012345678")).toBeNull();
  expect(normalizeVnPhone("0212345678")).toBeNull();
  expect(normalizeVnPhone("abc")).toBeNull();
});
```

Run: `pnpm --filter @yourspace/core test -- history phone` → FAIL.

- [ ] **Step 2: Cài đặt**

`packages/core/src/editor/history.ts`:

```ts
export type History<T> = { past: T[]; present: T; future: T[]; checkpoint: T | null };

const LIMIT = 50;

export const createHistory = <T>(initial: T): History<T> => ({ past: [], present: initial, future: [], checkpoint: null });

export function commit<T>(h: History<T>, next: T): History<T> {
  return { past: [...h.past, h.present].slice(-LIMIT), present: next, future: [], checkpoint: null };
}

export function replace<T>(h: History<T>, next: T): History<T> {
  return { ...h, present: next };
}

export function begin<T>(h: History<T>): History<T> {
  return { ...h, checkpoint: h.present };
}

export function end<T>(h: History<T>): History<T> {
  if (h.checkpoint === null || h.checkpoint === h.present) return { ...h, checkpoint: null };
  return { past: [...h.past, h.checkpoint].slice(-LIMIT), present: h.present, future: [], checkpoint: null };
}

export function undo<T>(h: History<T>): History<T> {
  const prev = h.past[h.past.length - 1];
  if (h.past.length === 0 || prev === undefined) return h;
  return { past: h.past.slice(0, -1), present: prev, future: [h.present, ...h.future], checkpoint: null };
}

export function redo<T>(h: History<T>): History<T> {
  const next = h.future[0];
  if (h.future.length === 0 || next === undefined) return h;
  return { past: [...h.past, h.present], present: next, future: h.future.slice(1), checkpoint: null };
}

export const canUndo = <T>(h: History<T>): boolean => h.past.length > 0;
export const canRedo = <T>(h: History<T>): boolean => h.future.length > 0;
```

`packages/core/src/lead/phone.ts`:

```ts
/** Số di động Việt Nam về dạng 0xxxxxxxxx; null nếu không hợp lệ. */
export function normalizeVnPhone(input: string): string | null {
  let s = input.replace(/[\s.\-()]/g, "");
  if (s.startsWith("+84")) s = "0" + s.slice(3);
  else if (s.startsWith("84") && s.length === 11) s = "0" + s.slice(2);
  return /^0(3|5|7|8|9)\d{8}$/.test(s) ? s : null;
}
```

Thêm vào `packages/core/src/index.ts`:

```ts
export * from "./editor/history";
export * from "./lead/phone";
```

- [ ] **Step 3: Chạy test**

Run: `pnpm --filter @yourspace/core test -- history phone` → PASS 7 test.

- [ ] **Step 4: Commit**

```bash
git add packages/core/src/editor packages/core/src/lead packages/core/src/index.ts
git commit -m "feat(core): lịch sử hoàn tác có gom bước + chuẩn hoá SĐT Việt Nam

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 7: Core — tổng quát hoá AIGateway

**Files:**
- Modify: `packages/core/src/ai/gateway.ts`, `packages/core/src/ai/types.ts`
- Test: `packages/core/src/ai/gateway.test.ts` (thêm test, giữ test cũ)

**Interfaces:**
- Produces:
  - `makeCachedCall<I, O>(opts: { run: (input: I) => Promise<O>; cache: Map<string, O>; keyOf: (input: I) => string; timeoutMs?: number; label?: string }): (input: I) => Promise<Result<O, AIError>>`
  - `makeCachedDepth<I>` giữ nguyên chữ ký, gọi `makeCachedCall` với `label: "depth"`.
  - `type InpaintResult = { png: Uint8Array }`, `interface InpaintService<I> { inpaint(input: I): Promise<Result<InpaintResult, AIError>> }`

- [ ] **Step 1: Thêm test thất bại** (cuối `packages/core/src/ai/gateway.test.ts`; sửa dòng import đầu file thành `import { makeCachedCall, makeCachedDepth } from "./gateway";`)

```ts
test("makeCachedCall: kiểu đầu ra tuỳ ý, cache theo key", async () => {
  const run = vi.fn().mockResolvedValue(new Uint8Array([7]));
  const call = makeCachedCall<{ k: string }, Uint8Array>({ run, cache: new Map(), keyOf: (i) => i.k });
  const a = await call({ k: "x" });
  await call({ k: "x" });
  expect(run).toHaveBeenCalledTimes(1);
  expect(a.ok && a.value[0]).toBe(7);
});

test("makeCachedCall: lỗi không vào cache, thông báo timeout theo label", async () => {
  const call = makeCachedCall<string, number>({
    run: () => new Promise<number>(() => {}), cache: new Map(), keyOf: (s) => s, timeoutMs: 10, label: "inpaint",
  });
  const r = await call("k");
  expect(r.ok).toBe(false);
  if (!r.ok) expect(r.error).toEqual({ kind: "Timeout", message: "inpaint timed out" });
});
```

Run: `pnpm --filter @yourspace/core test -- gateway` → FAIL (`makeCachedCall` không được export).

- [ ] **Step 2: Cài đặt**

Thay phần dưới `withTimeout` của `packages/core/src/ai/gateway.ts` (từ `function toAIError` tới hết file) bằng:

```ts
function toAIError(e: unknown, label: string): AIError {
  if (e instanceof TimeoutError) return { kind: "Timeout", message: `${label} timed out` };
  const message = e instanceof Error ? e.message : String(e);
  if (/rate|429/i.test(message)) return { kind: "RateLimited", message };
  return { kind: "VendorError", message };
}

/**
 * Bọc một lời gọi vendor với: cache theo key (content-addressed), timeout tuỳ chọn,
 * và ánh xạ lỗi sang AIError có kiểu. Lỗi không vào cache. Thuần & test được.
 */
export function makeCachedCall<I, O>(opts: {
  run: (input: I) => Promise<O>;
  cache: Map<string, O>;
  keyOf: (input: I) => string;
  timeoutMs?: number;
  label?: string;
}): (input: I) => Promise<Result<O, AIError>> {
  const label = opts.label ?? "ai";
  return async (input: I): Promise<Result<O, AIError>> => {
    const key = opts.keyOf(input);
    const cached = opts.cache.get(key);
    if (cached !== undefined) return { ok: true, value: cached };
    try {
      const value = opts.timeoutMs ? await withTimeout(opts.run(input), opts.timeoutMs) : await opts.run(input);
      opts.cache.set(key, value);
      return { ok: true, value };
    } catch (e) {
      return { ok: false, error: toAIError(e, label) };
    }
  };
}

/** Lớp mỏng cho depth (giữ API cũ). */
export function makeCachedDepth<I>(opts: {
  run: DepthRun<I>;
  cache: Map<string, DepthResult>;
  keyOf: (input: I) => string;
  timeoutMs?: number;
}): (input: I) => Promise<Result<DepthResult, AIError>> {
  return makeCachedCall<I, DepthResult>({ ...opts, label: "depth" });
}
```

Thêm vào cuối `packages/core/src/ai/types.ts`:

```ts
export type InpaintResult = { png: Uint8Array };

/** Interface đổi được adapter xóa đồ: Replicate LaMa (M1) hoặc on-device sau này (D3). */
export interface InpaintService<I> {
  inpaint(input: I): Promise<Result<InpaintResult, AIError>>;
}
```

- [ ] **Step 3: Chạy toàn bộ test core**

Run: `pnpm --filter @yourspace/core test && pnpm --filter @yourspace/core typecheck`
Expected: PASS hết (test cũ của `makeCachedDepth` vẫn qua).

- [ ] **Step 4: Commit**

```bash
git add packages/core/src/ai
git commit -m "refactor(core): AIGateway dùng chung cho depth và inpaint (makeCachedCall)

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 8: Web — mô hình 3D, ảnh phong cách, catalog

**Files:**
- Create: `apps/web/scripts/build-models.mjs`
- Create (sinh ra): `apps/web/public/models/*.glb`, `apps/web/public/models/CREDITS.md`, `apps/web/lib/models.json`
- Create: `apps/web/public/styles/{japandi,mid-century,bauhaus}.jpg` (chép), `apps/web/public/styles/CREDITS.md`
- Create: `apps/web/lib/catalog.ts`, `apps/web/lib/format.ts`
- Modify: `apps/web/package.json` (devDependencies + script)

**Interfaces:**
- Consumes: `Style`, `Supplier`, `FurnitureModel`, `StyleId` từ `@yourspace/core`.
- Produces (`apps/web/lib/catalog.ts`):
  - `STYLES: Style[]`, `SUPPLIERS: Supplier[]`, `MODELS: FurnitureModel[]`
  - `styleById(id: string): Style | undefined`, `modelById(id: string): FurnitureModel | undefined`
  - `modelsOfStyle(id: StyleId): FurnitureModel[]`
  - `SAMPLE_ROOMS: { url: string; label: string }[]`
  - `CATEGORY_LABEL: Record<Category, string>`
- Produces (`apps/web/lib/format.ts`): `formatVND(n: number): string` → `"12.400.000 ₫"`; `formatDimsCm(d: FurnitureDims): string` → `"rộng 220 × sâu 88 × cao 72 cm"`.
- `lib/models.json`: `Record<string, { file: string; dimsM: { widthM: number; heightM: number; depthM: number }; credit: string }>`

- [ ] **Step 1: Cài công cụ dựng mô hình**

```bash
pnpm --filter web add -D @gltf-transform/core@^4 @gltf-transform/extensions@^4 @gltf-transform/functions@^4 meshoptimizer
```

Thêm vào `apps/web/package.json` → `scripts`: `"build:models": "node scripts/build-models.mjs"`.

- [ ] **Step 2: Viết script**

`apps/web/scripts/build-models.mjs`:

```js
// Tải mô hình CC0 / CC-BY (Poly Haven, Khronos glTF Sample Assets), tối ưu (dedup, prune, weld, meshopt),
// đặt gốc ở tâm mặt đáy, rồi ghi public/models/<id>.glb + lib/models.json (kích thước thật) + CREDITS.md.
// Chạy lại được: bỏ qua bước tải nếu file nguồn đã có trong thư mục tạm.
import { mkdir, writeFile, readFile, access } from "node:fs/promises";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { center, dedup, getBounds, meshopt, prune, weld } from "@gltf-transform/functions";
import { MeshoptDecoder, MeshoptEncoder } from "meshoptimizer";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = join(ROOT, "public/models");
const TMP = join(tmpdir(), "yourspace-models");

/** id trong catalog → nguồn. */
const SOURCES = [
  { id: "sofa-nhung-xanh", khronos: "GlamVelvetSofa" },
  { id: "ghe-nhung-cam", khronos: "SheenChair" },
  { id: "den-san-xoan", khronos: "LightsPunctualLamp" },
  { id: "sofa-vai-be", polyhaven: "sofa_03" },
  { id: "sofa-ni-xam", polyhaven: "sofa_02" },
  { id: "ban-tra-tron-thep", polyhaven: "coffee_table_round_01" },
  { id: "tu-go-thap", polyhaven: "modern_wooden_cabinet" },
  { id: "ban-canh-go", polyhaven: "side_table_01" },
  { id: "cay-xanh-chau-gom", polyhaven: "potted_plant_01" },
  { id: "cay-xanh-chau-cao", polyhaven: "potted_plant_02" },
  { id: "ghe-lounge-oc-cho", polyhaven: "mid_century_lounge_chair" },
  { id: "ban-tra-oc-cho", polyhaven: "modern_coffee_table_01" },
  { id: "tu-co-dien", polyhaven: "vintage_cabinet_01" },
  { id: "ghe-banh-khung-thep", polyhaven: "modern_arm_chair_01" },
  { id: "ke-thep-den", polyhaven: "steel_frame_shelves_03" },
  { id: "ban-tra-cong-nghiep", polyhaven: "industrial_coffee_table" },
];

const exists = (p) => access(p).then(() => true, () => false);

async function download(url, dest) {
  if (await exists(dest)) return;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Tải ${url} thất bại: ${res.status}`);
  await mkdir(dirname(dest), { recursive: true });
  await writeFile(dest, Buffer.from(await res.arrayBuffer()));
}

async function fetchPolyHaven(id) {
  const files = await (await fetch(`https://api.polyhaven.com/files/${id}`)).json();
  const gltf = files.gltf["1k"].gltf;
  const dir = join(TMP, id);
  await download(gltf.url, join(dir, `${id}.gltf`));
  for (const [rel, f] of Object.entries(gltf.include)) await download(f.url, join(dir, rel));
  const info = await (await fetch(`https://api.polyhaven.com/info/${id}`)).json();
  const authors = Object.keys(info.authors ?? {}).join(", ");
  return { path: join(dir, `${id}.gltf`), credit: `"${info.name}" — ${authors}, Poly Haven (CC0)` };
}

async function fetchKhronos(name) {
  const base = `https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/${name}`;
  const path = join(TMP, `${name}.glb`);
  await download(`${base}/glTF-Binary/${name}.glb`, path);
  const meta = await (await fetch(`${base}/metadata.json`)).json();
  const legal = (meta.legal ?? []).map((l) => `${l.artist} (${l.license})`).join("; ");
  return { path, credit: `"${name}" — ${legal}, Khronos glTF Sample Assets` };
}

await MeshoptEncoder.ready;
await MeshoptDecoder.ready;
const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ "meshopt.encoder": MeshoptEncoder, "meshopt.decoder": MeshoptDecoder });

await mkdir(OUT_DIR, { recursive: true });
const manifest = {};
const credits = [];

for (const src of SOURCES) {
  const { path, credit } = src.polyhaven ? await fetchPolyHaven(src.polyhaven) : await fetchKhronos(src.khronos);
  const doc = await io.read(path);
  await doc.transform(dedup(), prune(), weld(), center({ pivot: "below" }), meshopt({ encoder: MeshoptEncoder }));
  const scene = doc.getRoot().getDefaultScene() ?? doc.getRoot().listScenes()[0];
  const { min, max } = getBounds(scene);
  const file = `/models/${src.id}.glb`;
  await writeFile(join(OUT_DIR, `${src.id}.glb`), await io.writeBinary(doc));
  const r = (v) => Math.round(v * 1000) / 1000;
  manifest[src.id] = {
    file,
    dimsM: { widthM: r(max[0] - min[0]), heightM: r(max[1] - min[1]), depthM: r(max[2] - min[2]) },
    credit,
  };
  credits.push(`- \`${src.id}.glb\` — ${credit}`);
  console.log(`✓ ${src.id}`, manifest[src.id].dimsM);
}

await writeFile(join(ROOT, "lib/models.json"), JSON.stringify(manifest, null, 2) + "\n");
await writeFile(
  join(OUT_DIR, "CREDITS.md"),
  `# Mô hình 3D — nguồn và giấy phép\n\nSinh bởi \`pnpm --filter web build:models\`. Mô hình CC-BY phải giữ ghi công khi phân phối.\n\n${credits.join("\n")}\n`,
);
```

- [ ] **Step 3: Chạy script và kiểm kết quả**

Run: `pnpm --filter web build:models && ls -la apps/web/public/models && cat apps/web/lib/models.json`
Expected: 16 file `.glb`, phần lớn ≤ 2 MB (texture Poly Haven bản 1k); `models.json` có 16 mục, kích thước thật hợp lý (sofa rộng 1,8–2,4 m; bàn trà cao 0,3–0,5 m; cây 0,4–1,6 m). Mục nào lệch xa (ví dụ đơn vị cm) thì ghi chú vào `CREDITS.md` và **bỏ món đó khỏi `SOURCES`**, không chỉnh tay kích thước.

- [ ] **Step 4: Chép ảnh phong cách**

```bash
mkdir -p apps/web/public/styles
cp apps/mobile/assets/styles/{japandi,mid-century,bauhaus}.jpg apps/web/public/styles/
```

`apps/web/public/styles/CREDITS.md`:

```md
# Ảnh phong cách — nguồn

Ảnh tâm trạng phong cách, không phải món đang bán. Chép từ `apps/mobile/assets/styles/` (Pexels, Unsplash — giấy phép dùng tự do).

- `japandi.jpg` — Puscas Adryan, Unsplash (ảnh dựng 3D)
- `mid-century.jpg` — Stephen Leonardi, Pexels
- `bauhaus.jpg` — Ksenia Chernaya, Pexels
```

- [ ] **Step 5: Viết `format.ts` và `catalog.ts`**

`apps/web/lib/format.ts`:

```ts
import type { FurnitureDims } from "@yourspace/core";

const vnd = new Intl.NumberFormat("vi-VN");

export const formatVND = (n: number): string => `${vnd.format(n)} ₫`;

export const formatDimsCm = (d: FurnitureDims): string =>
  `rộng ${Math.round(d.widthM * 100)} × sâu ${Math.round(d.depthM * 100)} × cao ${Math.round(d.heightM * 100)} cm`;
```

`apps/web/lib/catalog.ts`:

```ts
// Catalog MẪU cho bản demo: tên, nhà cung cấp, giá là dữ liệu mẫu (phong cách, nhà cung cấp lấy theo
// apps/mobile/src/data/catalog.ts). Kích thước đo từ chính mô hình (lib/models.json, sinh bởi scripts/build-models.mjs).
import type { Category, FurnitureModel, Style, StyleId, Supplier } from "@yourspace/core";
import models from "./models.json";

type ModelEntry = { file: string; dimsM: { widthM: number; heightM: number; depthM: number }; credit: string };
const MODEL_FILES = models as Record<string, ModelEntry>;

export const STYLES: Style[] = [
  {
    id: "japandi",
    name: "Japandi",
    summary: "Gỗ sáng, đường nét gọn, nhiều khoảng thở.",
    traits: { colors: "Be, xám ấm, trắng ngà", materials: "Gỗ sồi, gỗ tần bì, mây, vải lanh", mood: "Tĩnh, mộc, gọn gàng" },
    photo: "/styles/japandi.jpg",
    photoCredit: "Puscas Adryan, Unsplash",
  },
  {
    id: "mid-century",
    name: "Mid-Century",
    summary: "Gỗ óc chó, chân thon, đường cong mềm.",
    traits: { colors: "Nâu óc chó, cam đất, vàng mù tạt, xanh lục", materials: "Gỗ óc chó, nhung, đồng", mood: "Ấm, hoài cổ, có điểm nhấn" },
    photo: "/styles/mid-century.jpg",
    photoCredit: "Stephen Leonardi, Pexels",
  },
  {
    id: "bauhaus",
    name: "Bauhaus",
    summary: "Hình khối rõ, thép uốn, đen trắng dứt khoát.",
    traits: { colors: "Đen, trắng, ánh thép", materials: "Thép mạ crôm, kính, da", mood: "Rõ ràng, công năng, cá tính" },
    photo: "/styles/bauhaus.jpg",
    photoCredit: "Ksenia Chernaya, Pexels",
  },
];

export const SUPPLIERS: Supplier[] = [
  { id: "sup-a", name: "Xưởng gỗ A", deliveryMinDays: 5, deliveryMaxDays: 7 },
  { id: "sup-b", name: "Xưởng đèn B", deliveryMinDays: 2, deliveryMaxDays: 3 },
  { id: "sup-c", name: "Xưởng sofa C", deliveryMinDays: 7, deliveryMaxDays: 10 },
  { id: "sup-d", name: "Xưởng thép D", deliveryMinDays: 4, deliveryMaxDays: 6 },
  { id: "sup-e", name: "Nhà vườn E", deliveryMinDays: 1, deliveryMaxDays: 2 },
];

export const CATEGORY_LABEL: Record<Category, string> = {
  sofa: "Sofa", chair: "Ghế", table: "Bàn", shelf: "Tủ, kệ", lamp: "Đèn", plant: "Cây",
};

type Entry = Omit<FurnitureModel, "dimsM" | "glbUrl" | "baseYawRad"> & { baseYawRad?: number };

const ENTRIES: Entry[] = [
  { id: "sofa-vai-be", name: "Sofa vải be ba chỗ", styleId: "japandi", category: "sofa", supplierId: "sup-c", priceVND: 12_400_000, material: "Khung gỗ, bọc vải màu be" },
  { id: "tu-go-thap", name: "Tủ gỗ thấp", styleId: "japandi", category: "shelf", supplierId: "sup-a", priceVND: 7_800_000, material: "Gỗ tự nhiên, dầu lau" },
  { id: "ban-canh-go", name: "Bàn cạnh gỗ", styleId: "japandi", category: "table", supplierId: "sup-a", priceVND: 1_900_000, material: "Gỗ tự nhiên" },
  { id: "cay-xanh-chau-gom", name: "Cây xanh chậu gốm", styleId: "japandi", category: "plant", supplierId: "sup-e", priceVND: 650_000, material: "Cây thật, chậu gốm" },
  { id: "den-san-xoan", name: "Đèn sàn thân xoắn", styleId: "japandi", category: "lamp", supplierId: "sup-b", priceVND: 3_400_000, material: "Thân kim loại giả đồng, chao giấy" },
  { id: "sofa-nhung-xanh", name: "Sofa nhung", styleId: "mid-century", category: "sofa", supplierId: "sup-c", priceVND: 18_900_000, material: "Bọc nhung, chân kim loại" },
  { id: "ghe-lounge-oc-cho", name: "Ghế lounge gỗ óc chó", styleId: "mid-century", category: "chair", supplierId: "sup-c", priceVND: 9_500_000, material: "Gỗ óc chó, nệm da" },
  { id: "ghe-nhung-cam", name: "Ghế nhung", styleId: "mid-century", category: "chair", supplierId: "sup-c", priceVND: 5_900_000, material: "Bọc nhung, chân gỗ sẫm" },
  { id: "ban-tra-oc-cho", name: "Bàn trà gỗ óc chó", styleId: "mid-century", category: "table", supplierId: "sup-a", priceVND: 4_200_000, material: "Gỗ óc chó" },
  { id: "tu-co-dien", name: "Tủ cổ điển", styleId: "mid-century", category: "shelf", supplierId: "sup-a", priceVND: 8_600_000, material: "Gỗ sẫm màu" },
  { id: "sofa-ni-xam", name: "Sofa nỉ", styleId: "bauhaus", category: "sofa", supplierId: "sup-c", priceVND: 14_200_000, material: "Bọc nỉ, khung thép" },
  { id: "ghe-banh-khung-thep", name: "Ghế bành khung thép", styleId: "bauhaus", category: "chair", supplierId: "sup-d", priceVND: 6_800_000, material: "Khung thép, nệm bọc" },
  { id: "ban-tra-tron-thep", name: "Bàn trà tròn chân thép", styleId: "bauhaus", category: "table", supplierId: "sup-d", priceVND: 4_600_000, material: "Mặt tròn, chân thép uốn" },
  { id: "ban-tra-cong-nghiep", name: "Bàn trà khung thép", styleId: "bauhaus", category: "table", supplierId: "sup-d", priceVND: 3_500_000, material: "Khung thép, mặt gỗ" },
  { id: "ke-thep-den", name: "Kệ khung thép", styleId: "bauhaus", category: "shelf", supplierId: "sup-d", priceVND: 3_900_000, material: "Khung thép sơn" },
  { id: "cay-xanh-chau-cao", name: "Cây xanh chậu cao", styleId: "bauhaus", category: "plant", supplierId: "sup-e", priceVND: 790_000, material: "Cây thật, chậu cao" },
];

export const MODELS: FurnitureModel[] = ENTRIES.flatMap((e) => {
  const f = MODEL_FILES[e.id];
  if (!f) return []; // món bị loại ở bước dựng mô hình
  return [{ ...e, dimsM: f.dimsM, glbUrl: f.file, baseYawRad: e.baseYawRad ?? 0 }];
});

const modelMap = new Map(MODELS.map((m) => [m.id, m]));
export const modelById = (id: string): FurnitureModel | undefined => modelMap.get(id);
export const styleById = (id: string): Style | undefined => STYLES.find((s) => s.id === id);
export const modelsOfStyle = (id: StyleId): FurnitureModel[] => MODELS.filter((m) => m.styleId === id);

/** Ảnh mẫu cho /thu-phong (bộ golden, nguồn ở public/golden/CREDITS.md); ưu tiên ảnh "tin được" ở cả hai chế độ trong spike 2026-10-04. */
export const SAMPLE_ROOMS: { url: string; label: string }[] = [1, 2, 3, 5, 12, 14].map((n) => ({
  url: `/golden/rooms/room-${String(n).padStart(2, "0")}.jpg`,
  label: `Ảnh mẫu ${n}`,
}));
```

- [ ] **Step 6: Typecheck**

Run: `pnpm --filter web typecheck`
Expected: không lỗi (JSON import được nhờ `resolveJsonModule`).

- [ ] **Step 7: Commit**

```bash
git add apps/web/scripts apps/web/public/models apps/web/public/styles apps/web/lib/models.json apps/web/lib/catalog.ts apps/web/lib/format.ts apps/web/package.json pnpm-lock.yaml
git commit -m "feat(web): 16 mô hình 3D CC0/CC-BY đã tối ưu + catalog mẫu 3 phong cách

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 9: Web — nền giao diện, trang Mở đầu và Phong cách

**Files:**
- Modify: `apps/web/app/globals.css`, `apps/web/app/layout.tsx`, `apps/web/app/page.tsx`, `apps/web/package.json`
- Create: `apps/web/app/dev/page.tsx` (nội dung `page.tsx` cũ)
- Create: `apps/web/components/ui/Button.tsx`, `apps/web/components/ui/Chip.tsx`, `apps/web/components/ui/Sheet.tsx`
- Create: `apps/web/app/phong-cach/page.tsx`, `apps/web/app/phong-cach/[id]/page.tsx`

**Interfaces:**
- Consumes: `STYLES`, `styleById`, `modelsOfStyle`, `CATEGORY_LABEL` (Task 8), `formatVND`, `formatDimsCm`.
- Produces:
  - `Button` props: `{ variant?: "primary" | "secondary" | "text"; full?: boolean; href?: string } & ButtonHTMLAttributes<HTMLButtonElement>` — có `href` thì render `next/link`.
  - `Chip` props: `{ children: ReactNode; tone?: "dark" | "light" }`
  - `Sheet` props: `{ open: boolean; onClose: () => void; title: string; children: ReactNode }`
  - Lớp Tailwind theo token: `bg-background`, `text-foreground`, `bg-card`, `bg-muted`, `text-muted-foreground`, `bg-accent`, `text-on-accent`, `text-accent-text`, `text-destructive-text`, `border-border`, `border-border-strong`, `font-display`, `rounded-pill`, `rounded-md2` (14px), `rounded-lg2` (20px), `rounded-xl2` (28px).

- [ ] **Step 1: Cài icon**

```bash
pnpm --filter web add @phosphor-icons/react
```

- [ ] **Step 2: Token và font**

Thay toàn bộ `apps/web/app/globals.css`:

```css
@import "tailwindcss";

/* Token theo design-system/yourspace/MASTER.md (hướng A · Phòng trưng bày), theme sáng. */
:root {
  --background: #ffffff;
  --foreground: #171717;
  --card: #ffffff;
  --muted: #f4f4f5;
  --muted-foreground: #52525b;
  --accent: #171717;
  --on-accent: #ffffff;
  --accent-text: #a16207;
  --destructive: #dc2626;
  --destructive-text: #b91c1c;
  --border: #e5e5e5;
  --border-strong: #8a8a8a;
  --ring: #171717;
  /* destructiveText của theme ngược màu, cho chữ "Bỏ" trên thanh tác vụ nền đen (MASTER.md) */
  --destructive-on-accent: #fca5a5;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-on-accent: var(--on-accent);
  --color-accent-text: var(--accent-text);
  --color-destructive: var(--destructive);
  --color-destructive-text: var(--destructive-text);
  --color-border: var(--border);
  --color-border-strong: var(--border-strong);
  --color-ring: var(--ring);
  --color-destructive-on-accent: var(--destructive-on-accent);
  --font-display: var(--font-bricolage);
  --font-sans: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  --radius-md2: 14px;
  --radius-lg2: 20px;
  --radius-xl2: 28px;
  --radius-pill: 999px;
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: var(--font-sans);
}

.tabular { font-variant-numeric: tabular-nums; }
```

Thay toàn bộ `apps/web/app/layout.tsx`:

```tsx
import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin", "vietnamese"],
  weight: ["700", "800"],
});

export const metadata: Metadata = {
  title: "YourSpace — Thử đồ trong chính căn phòng của bạn",
  description: "Bản demo: đặt đồ nội thất 3D vào ảnh phòng thật, thấy tổng tiền rồi mới mua.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#ffffff" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" className={`${bricolage.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
```

- [ ] **Step 3: Chuyển trang dev cũ**

```bash
mkdir -p apps/web/app/dev && git mv apps/web/app/page.tsx apps/web/app/dev/page.tsx
```

Trong `apps/web/app/dev/page.tsx`, đổi tên hàm `export default function Home()` thành `export default function DevIndex()`. Không đổi gì khác.

- [ ] **Step 4: Thành phần UI dùng chung**

`apps/web/components/ui/Button.tsx`:

```tsx
import Link from "next/link";
import type { ButtonHTMLAttributes } from "react";

type Props = { variant?: "primary" | "secondary" | "text"; full?: boolean; href?: string } & ButtonHTMLAttributes<HTMLButtonElement>;

const base = "inline-flex items-center justify-center gap-2 font-semibold text-[17px] leading-[22px] transition-opacity active:opacity-85 disabled:opacity-40 disabled:pointer-events-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";
const variants = {
  primary: "bg-accent text-on-accent rounded-pill px-6 min-h-[54px]",
  secondary: "border-[1.5px] border-foreground text-foreground rounded-pill px-6 min-h-[44px]",
  text: "text-foreground min-h-[44px] px-2",
};

/** Nút theo MASTER.md. Tối đa MỘT nút `primary` mỗi màn. */
export function Button({ variant = "primary", full, href, className = "", children, ...rest }: Props) {
  const cls = `${base} ${variants[variant]} ${full ? "w-full" : ""} ${className}`;
  if (href) return <Link href={href} className={cls}>{children}</Link>;
  return <button type="button" className={cls} {...rest}>{children}</button>;
}
```

`apps/web/components/ui/Chip.tsx`:

```tsx
import type { ReactNode } from "react";

/** Chip AI / thông báo nổi trên ảnh (viên thuốc, có bóng vì nằm trên ảnh). */
export function Chip({ children, tone = "dark" }: { children: ReactNode; tone?: "dark" | "light" }) {
  const cls = tone === "dark" ? "bg-accent text-on-accent" : "bg-card text-foreground";
  return (
    <div role="status" className={`${cls} rounded-pill px-4 py-2 text-[13px] leading-[18px] font-semibold shadow-[0_4px_12px_rgba(0,0,0,0.15)]`}>
      {children}
    </div>
  );
}
```

`apps/web/components/ui/Sheet.tsx`:

```tsx
"use client";
import { X } from "@phosphor-icons/react";
import type { ReactNode } from "react";

export function Sheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button type="button" aria-label="Đóng" className="absolute inset-0 bg-black/50" onClick={onClose} />
      <section role="dialog" aria-modal="true" aria-label={title} className="relative w-full max-w-xl max-h-[85vh] overflow-y-auto bg-card rounded-t-lg2 p-6 shadow-[0_-10px_30px_rgba(0,0,0,0.1)]">
        <header className="flex items-center justify-between mb-4">
          <h2 className="text-[20px] leading-[25px] font-semibold">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Đóng" className="size-11 inline-flex items-center justify-center rounded-pill bg-muted">
            <X size={20} />
          </button>
        </header>
        {children}
      </section>
    </div>
  );
}
```

- [ ] **Step 5: Trang Mở đầu**

Thay `apps/web/app/page.tsx` (file mới sau khi đã `git mv`):

```tsx
import Image from "next/image";
import { Button } from "@/components/ui/Button";

export default function Home() {
  return (
    <main className="flex-1 flex flex-col">
      <div className="relative h-[52vh] min-h-[320px] w-full">
        <Image src="/styles/japandi.jpg" alt="Phòng khách sáng kiểu Japandi" fill priority className="object-cover" sizes="100vw" />
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/55 to-transparent" />
        <h1 className="absolute left-[22px] right-[22px] bottom-12 font-display font-extrabold text-white text-[44px] leading-[48px] tracking-[-1.5px] max-w-xl">
          Thử đồ trong chính căn phòng của bạn
        </h1>
      </div>
      <section className="relative -mt-7 flex-1 bg-background rounded-t-xl2 px-[22px] pt-8 pb-10 flex flex-col gap-6 max-w-xl w-full mx-auto">
        <p className="text-[17px] leading-[22px] text-muted-foreground">
          Chụp phòng, xóa đồ cũ, đặt đồ 3D đúng tỷ lệ và thấy tổng tiền trước khi mua.
        </p>
        <div className="flex flex-col gap-3">
          <Button href="/thu-phong" full>Thử phòng</Button>
          <Button href="/phong-cach" variant="secondary" full>Khám phá phong cách</Button>
        </div>
        <p className="text-[12px] leading-4 text-muted-foreground">Bản demo · giá và nhà cung cấp là dữ liệu mẫu.</p>
      </section>
    </main>
  );
}
```

- [ ] **Step 6: Trang Phong cách**

`apps/web/app/phong-cach/page.tsx`:

```tsx
import Image from "next/image";
import Link from "next/link";
import { STYLES } from "@/lib/catalog";

export default function StylesPage() {
  return (
    <main className="flex-1 w-full max-w-xl mx-auto px-4 py-8 flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <Link href="/" className="text-[15px] text-muted-foreground">← YourSpace</Link>
        <h1 className="font-display font-extrabold text-[34px] leading-[40px] tracking-[-1px]">Chọn phong cách</h1>
      </header>
      {STYLES.map((s) => (
        <Link key={s.id} href={`/phong-cach/${s.id}`} className="flex flex-col gap-3">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md2 bg-muted">
            <Image src={s.photo} alt={`Ảnh tâm trạng phong cách ${s.name}`} fill className="object-cover" sizes="(max-width: 640px) 100vw, 576px" />
          </div>
          <h2 className="font-display font-bold text-[28px] leading-[34px] tracking-[-0.6px]">{s.name}</h2>
          <p className="text-[15px] leading-5 text-muted-foreground">{s.summary}</p>
        </Link>
      ))}
    </main>
  );
}
```

`apps/web/app/phong-cach/[id]/page.tsx`:

```tsx
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { CATEGORY_LABEL, STYLES, modelsOfStyle, styleById } from "@/lib/catalog";
import { formatDimsCm, formatVND } from "@/lib/format";

export function generateStaticParams() {
  return STYLES.map((s) => ({ id: s.id }));
}

export default async function StylePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const style = styleById(id);
  if (!style) notFound();
  const items = modelsOfStyle(style.id);
  return (
    <main className="flex-1 flex flex-col pb-28">
      <div className="relative h-[50vh] min-h-[300px] w-full">
        <Image src={style.photo} alt={`Ảnh tâm trạng phong cách ${style.name}`} fill priority className="object-cover" sizes="100vw" />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/55 to-transparent" />
        <Link href="/phong-cach" aria-label="Quay lại" className="absolute top-4 left-4 size-11 rounded-pill bg-card inline-flex items-center justify-center shadow-[0_4px_10px_rgba(0,0,0,0.1)]">←</Link>
        <h1 className="absolute left-[22px] bottom-12 font-display font-extrabold text-white text-[44px] leading-[48px] tracking-[-1.5px]">{style.name}</h1>
      </div>
      <section className="relative -mt-7 bg-background rounded-t-xl2 px-[22px] pt-8 flex flex-col gap-6 max-w-xl w-full mx-auto">
        <p className="text-[17px] leading-[22px]">{style.summary}</p>
        <dl className="grid grid-cols-[96px_1fr] gap-y-2 text-[15px] leading-5">
          <dt className="text-muted-foreground">Màu</dt><dd>{style.traits.colors}</dd>
          <dt className="text-muted-foreground">Chất liệu</dt><dd>{style.traits.materials}</dd>
          <dt className="text-muted-foreground">Cảm giác</dt><dd>{style.traits.mood}</dd>
        </dl>
        <h2 className="text-[20px] leading-[25px] font-semibold">Món tiêu biểu</h2>
        <ul className="flex flex-col divide-y divide-border">
          {items.map((m) => (
            <li key={m.id} className="py-3 flex items-baseline justify-between gap-4">
              <div>
                <p className="text-[15px] leading-5 font-semibold">{m.name}</p>
                <p className="text-[13px] leading-[18px] text-muted-foreground tabular">{CATEGORY_LABEL[m.category]} · {formatDimsCm(m.dimsM)}</p>
              </div>
              <p className="text-[15px] font-semibold text-accent-text tabular whitespace-nowrap">{formatVND(m.priceVND)}</p>
            </li>
          ))}
        </ul>
        <p className="text-[12px] leading-4 text-muted-foreground">Giá mẫu. Ảnh: {style.photoCredit}.</p>
      </section>
      <div className="fixed inset-x-0 bottom-0 p-4 bg-background/95 border-t border-border">
        <div className="max-w-xl mx-auto"><Button href={`/thu-phong?style=${style.id}`} full>Thử trong phòng của bạn</Button></div>
      </div>
    </main>
  );
}
```

- [ ] **Step 7: Kiểm**

Run: `pnpm --filter web typecheck && pnpm --filter web lint && pnpm --filter web build`
Expected: không lỗi; route mới `/`, `/phong-cach`, `/phong-cach/[id]` (3 trang tĩnh), `/dev`.
Rồi `pnpm --filter web dev`, mở `http://localhost:3000`, `/phong-cach`, `/phong-cach/japandi`: tiêu đề Bricolage hiển thị đúng dấu ("Thử đồ trong chính căn phòng của bạn"), giá màu vàng đồng, một nút chính mỗi màn.

- [ ] **Step 8: Commit**

```bash
git add apps/web/app apps/web/components apps/web/package.json pnpm-lock.yaml
git commit -m "feat(web): token hệ A, trang Mở đầu và Phong cách

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 10: Web — store, chuẩn bị ảnh, màn Thử phòng

**Files:**
- Modify: `apps/web/package.json` (thêm `exifr`)
- Create: `apps/web/lib/image.ts`, `apps/web/lib/store.ts`
- Create: `apps/web/app/thu-phong/page.tsx`, `apps/web/components/try-room/TryRoom.tsx`, `apps/web/components/try-room/HorizonOverlay.tsx`

**Interfaces:**
- Consumes: `fovYFromFocal35` (Task 2), `createHistory`, `commit`, `replace`, `begin`, `end`, `undo`, `redo`, `History`, `Mask`, `DisparityMap`, `StyleId`, `solveCameraFromHorizon`, `CameraModel` từ `@yourspace/core`; `SAMPLE_ROOMS`, `STYLES` (Task 8); `Button` (Task 9).
- Produces (`lib/image.ts`):
  - `type PreparedPhoto = { url: string; width: number; height: number; focal35: number | null }`
  - `preparePhoto(src: Blob): Promise<PreparedPhoto>`
  - `loadImage(url: string): Promise<HTMLImageElement>`
  - `canvasToBlob(c: HTMLCanvasElement, type: string, quality?: number): Promise<Blob>`
  - `readPixels(url: string, maxSide: number): Promise<{ data: Uint8ClampedArray; width: number; height: number }>`
- Produces (`lib/store.ts`): hook `useEditor` (Zustand) với state/actions đúng như dưới; kiểu `PlacedItem`, `EditorDoc`, `CameraSetup`, `DepthState`, `Notice`; hàm `cameraOf(setup: CameraSetup, aspect: number): CameraModel`.

- [ ] **Step 1: Cài exifr**

```bash
pnpm --filter web add exifr
```

- [ ] **Step 2: `lib/image.ts`**

```ts
"use client";
import exifr from "exifr";

export type PreparedPhoto = { url: string; width: number; height: number; focal35: number | null };

const MAX_SIDE = 1600;

export function canvasToBlob(c: HTMLCanvasElement, type: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => c.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob thất bại"))), type, quality));
}

export function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Không mở được ảnh ${url}`));
    img.src = url;
  });
}

/** Xoay đúng chiều theo EXIF, thu về cạnh dài ≤ 1600 px, JPEG; giữ tiêu cự tương đương 35 mm nếu có. */
export async function preparePhoto(src: Blob): Promise<PreparedPhoto> {
  const exif = (await exifr.parse(src, ["FocalLengthIn35mmFormat"]).catch(() => null)) as { FocalLengthIn35mmFormat?: number } | null;
  const bitmap = await createImageBitmap(src, { imageOrientation: "from-image" });
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  const blob = await canvasToBlob(canvas, "image/jpeg", 0.9);
  return { url: URL.createObjectURL(blob), width, height, focal35: exif?.FocalLengthIn35mmFormat ?? null };
}

/** Điểm ảnh RGBA của ảnh thu nhỏ (cạnh dài ≤ maxSide) — để đo sáng. */
export async function readPixels(url: string, maxSide: number): Promise<{ data: Uint8ClampedArray; width: number; height: number }> {
  const img = await loadImage(url);
  const s = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
  const width = Math.max(1, Math.round(img.naturalWidth * s));
  const height = Math.max(1, Math.round(img.naturalHeight * s));
  const c = document.createElement("canvas");
  c.width = width;
  c.height = height;
  const ctx = c.getContext("2d")!;
  ctx.drawImage(img, 0, 0, width, height);
  return { data: ctx.getImageData(0, 0, width, height).data, width, height };
}
```

- [ ] **Step 3: `lib/store.ts`**

```ts
"use client";
import {
  begin, commit, createHistory, end, redo, replace, solveCameraFromHorizon, undo,
  type CameraModel, type DisparityMap, type History, type Mask, type StyleId,
} from "@yourspace/core";
import { create } from "zustand";
import type { PreparedPhoto } from "./image";

export type PlacedItem = { uid: string; productId: string; x: number; z: number; rotationYRad: number };
/** Phần nằm trong lịch sử hoàn tác. `workingUrl` = ảnh sau các lần xóa; `eraseMask` = mọi vùng đã xóa (lấp lại từ ảnh gốc). */
export type EditorDoc = { items: PlacedItem[]; workingUrl: string; eraseMask: Mask | null };
export type CameraSetup = { horizonNdcY: number; heightM: number; fovYRad: number };
export type DepthState = { status: "idle" | "running" | "ready" | "failed"; forUrl: string | null; disparity: DisparityMap | null };
export type Notice = { id: number; text: string };

export const cameraOf = (s: CameraSetup, aspect: number): CameraModel =>
  solveCameraFromHorizon({ horizonNdcY: s.horizonNdcY, aspect, fovYRad: s.fovYRad, heightM: s.heightM });

type State = {
  styleId: StyleId;
  photo: PreparedPhoto | null;
  setup: CameraSetup | null;
  history: History<EditorDoc> | null;
  selectedUid: string | null;
  armedProductId: string | null;
  depth: DepthState;
  notice: Notice | null;
  setStyle: (id: StyleId) => void;
  setPhoto: (p: PreparedPhoto) => void;
  startEditing: (setup: CameraSetup) => void;
  setCameraHeight: (heightM: number) => void;
  arm: (productId: string | null) => void;
  select: (uid: string | null) => void;
  placeItem: (productId: string, x: number, z: number) => void;
  beginGesture: () => void;
  moveItem: (uid: string, x: number, z: number) => void;
  rotateItem: (uid: string, rad: number) => void;
  endGesture: () => void;
  duplicateItem: (uid: string) => void;
  removeItem: (uid: string) => void;
  applyErase: (workingUrl: string, mask: Mask) => void;
  undo: () => void;
  redo: () => void;
  setDepth: (d: DepthState) => void;
  notify: (text: string) => void;
};

const IDLE_DEPTH: DepthState = { status: "idle", forUrl: null, disparity: null };

export const useEditor = create<State>()((set, get) => {
  /** Sửa `present.items` theo một gesture (không tạo bước; bước tạo ở endGesture). */
  const patchItems = (fn: (items: PlacedItem[]) => PlacedItem[]) => {
    const h = get().history;
    if (h) set({ history: replace(h, { ...h.present, items: fn(h.present.items) }) });
  };
  const commitItems = (fn: (items: PlacedItem[]) => PlacedItem[]) => {
    const h = get().history;
    if (h) set({ history: commit(h, { ...h.present, items: fn(h.present.items) }) });
  };

  return {
    styleId: "japandi",
    photo: null,
    setup: null,
    history: null,
    selectedUid: null,
    armedProductId: null,
    depth: IDLE_DEPTH,
    notice: null,
    setStyle: (styleId) => set({ styleId }),
    setPhoto: (photo) => set({ photo, setup: null, history: null, selectedUid: null, armedProductId: null, depth: IDLE_DEPTH }),
    startEditing: (setup) => {
      const photo = get().photo;
      if (!photo) return;
      set({ setup, history: createHistory<EditorDoc>({ items: [], workingUrl: photo.url, eraseMask: null }), selectedUid: null });
    },
    setCameraHeight: (heightM) => {
      const s = get().setup;
      if (s) set({ setup: { ...s, heightM } });
    },
    arm: (armedProductId) => set({ armedProductId, selectedUid: null }),
    select: (selectedUid) => set({ selectedUid }),
    placeItem: (productId, x, z) => {
      const uid = crypto.randomUUID();
      commitItems((items) => [...items, { uid, productId, x, z, rotationYRad: 0 }]);
      set({ selectedUid: uid, armedProductId: null });
    },
    beginGesture: () => {
      const h = get().history;
      if (h) set({ history: begin(h) });
    },
    moveItem: (uid, x, z) => patchItems((items) => items.map((i) => (i.uid === uid ? { ...i, x, z } : i))),
    rotateItem: (uid, rad) => patchItems((items) => items.map((i) => (i.uid === uid ? { ...i, rotationYRad: rad } : i))),
    endGesture: () => {
      const h = get().history;
      if (h) set({ history: end(h) });
    },
    duplicateItem: (uid) => {
      const src = get().history?.present.items.find((i) => i.uid === uid);
      if (!src) return;
      const copy = { ...src, uid: crypto.randomUUID(), x: src.x + 0.4 };
      commitItems((items) => [...items, copy]);
      set({ selectedUid: copy.uid });
    },
    removeItem: (uid) => {
      commitItems((items) => items.filter((i) => i.uid !== uid));
      set({ selectedUid: null });
    },
    applyErase: (workingUrl, mask) => {
      const h = get().history;
      if (h) set({ history: commit(h, { ...h.present, workingUrl, eraseMask: mask }) });
    },
    undo: () => {
      const h = get().history;
      if (h) set({ history: undo(h), selectedUid: null });
    },
    redo: () => {
      const h = get().history;
      if (h) set({ history: redo(h), selectedUid: null });
    },
    setDepth: (depth) => set({ depth }),
    notify: (text) => set({ notice: { id: Date.now(), text } }),
  };
});
```

- [ ] **Step 4: Đường chân trời kéo được**

`apps/web/components/try-room/HorizonOverlay.tsx`:

```tsx
"use client";
import { useRef } from "react";

/** Đường chân trời kéo dọc trên ảnh. `value` là NDC y (−1 đáy … +1 đỉnh), kẹp [−0,94; 0,94] như HorizonLine của spike. */
export function HorizonOverlay({ value, onChange }: { value: number; onChange: (ndcY: number) => void }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const toNdc = (clientY: number) => {
    const r = boxRef.current!.getBoundingClientRect();
    return Math.min(0.94, Math.max(-0.94, 1 - ((clientY - r.top) / r.height) * 2));
  };
  const topPct = ((1 - value) / 2) * 100;
  return (
    <div
      ref={boxRef}
      className="absolute inset-0 touch-none cursor-ns-resize"
      onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); onChange(toNdc(e.clientY)); }}
      onPointerMove={(e) => { if (e.buttons) onChange(toNdc(e.clientY)); }}
    >
      <div className="absolute inset-x-0 border-t-2 border-dashed border-white shadow-[0_1px_2px_rgba(0,0,0,0.6)]" style={{ top: `${topPct}%` }}>
        <span className="absolute right-3 -top-9 bg-accent text-on-accent rounded-pill px-3 py-1 text-[12px] font-semibold">
          Kéo tới ngang tầm mắt
        </span>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Màn Thử phòng**

`apps/web/app/thu-phong/page.tsx`:

```tsx
import { TryRoom } from "@/components/try-room/TryRoom";
import { STYLES } from "@/lib/catalog";
import type { StyleId } from "@yourspace/core";

export default async function TryRoomPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { style } = await searchParams;
  const initialStyle = STYLES.find((s) => s.id === style)?.id ?? null;
  return <TryRoom initialStyle={initialStyle as StyleId | null} />;
}
```

`apps/web/components/try-room/TryRoom.tsx`:

```tsx
"use client";
import { fovYFromFocal35, type StyleId } from "@yourspace/core";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { SAMPLE_ROOMS } from "@/lib/catalog";
import { preparePhoto } from "@/lib/image";
import { useEditor } from "@/lib/store";
import { HorizonOverlay } from "./HorizonOverlay";

const DEFAULT_FOV = (60 * Math.PI) / 180;
const POSTURES = [{ label: "Đứng", heightM: 1.5 }, { label: "Ngồi", heightM: 1.1 }] as const;

export function TryRoom({ initialStyle }: { initialStyle: StyleId | null }) {
  const router = useRouter();
  const { photo, setPhoto, setStyle, startEditing } = useEditor();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [horizon, setHorizon] = useState(0);
  const [heightM, setHeightM] = useState<number>(POSTURES[0].heightM);

  useEffect(() => {
    if (initialStyle) setStyle(initialStyle);
  }, [initialStyle, setStyle]);

  async function choose(blob: Blob) {
    setBusy(true);
    setError(null);
    try {
      setPhoto(await preparePhoto(blob));
    } catch {
      setError("Không mở được ảnh này. Thử một ảnh JPEG hoặc PNG khác.");
    } finally {
      setBusy(false);
    }
  }

  function start() {
    if (!photo) return;
    const fovYRad = fovYFromFocal35(photo.focal35, photo.width / photo.height) ?? DEFAULT_FOV;
    startEditing({ horizonNdcY: horizon, heightM, fovYRad });
    router.push("/chinh-sua");
  }

  if (!photo) {
    return (
      <main className="flex-1 w-full max-w-xl mx-auto px-4 py-8 flex flex-col gap-6">
        <Link href="/" className="text-[15px] text-muted-foreground">← YourSpace</Link>
        <h1 className="font-display font-extrabold text-[34px] leading-[40px] tracking-[-1px]">Ảnh căn phòng của bạn</h1>
        <p className="text-[15px] leading-5 text-muted-foreground">
          Đứng ở góc phòng, cầm máy ngang tầm mắt, thấy được sàn. Ảnh được gửi lên hệ thống để xử lý và xóa ngay sau đó.
        </p>
        <label className="inline-flex items-center justify-center bg-accent text-on-accent rounded-pill px-6 min-h-[54px] text-[17px] font-semibold cursor-pointer has-[:disabled]:opacity-40">
          {busy ? "Đang mở ảnh…" : "Chọn hoặc chụp ảnh phòng"}
          <input type="file" accept="image/*" className="sr-only" disabled={busy}
            onChange={(e) => { const f = e.target.files?.[0]; if (f) void choose(f); }} />
        </label>
        {error && <p className="text-[15px] text-destructive-text" role="alert">⚠ {error}</p>}
        <h2 className="text-[17px] font-semibold mt-2">Hoặc dùng ảnh mẫu</h2>
        <div className="grid grid-cols-3 gap-2">
          {SAMPLE_ROOMS.map((r) => (
            <button key={r.url} type="button" disabled={busy} aria-label={r.label}
              onClick={async () => void choose(await (await fetch(r.url)).blob())}
              className="relative aspect-[4/3] overflow-hidden rounded-md2 bg-muted">
              <Image src={r.url} alt={r.label} fill className="object-cover" sizes="33vw" />
            </button>
          ))}
        </div>
        <p className="text-[12px] text-muted-foreground">Ảnh mẫu là ảnh phòng có sẵn để thử nhanh, không phải phòng của người dùng.</p>
      </main>
    );
  }

  return (
    <main className="flex-1 w-full max-w-xl mx-auto px-4 py-6 flex flex-col gap-4">
      <Button variant="text" className="self-start" onClick={() => useEditor.setState({ photo: null })}>← Chọn ảnh khác</Button>
      <h1 className="font-display font-bold text-[28px] leading-[34px] tracking-[-0.6px]">Kéo đường ngang tầm mắt</h1>
      <p className="text-[15px] leading-5 text-muted-foreground">Đặt đường nét đứt ở độ cao mắt bạn lúc chụp — thường là nơi các đường của tường và sàn hội tụ.</p>
      <div className="relative w-full overflow-hidden rounded-md2 bg-muted" style={{ aspectRatio: `${photo.width} / ${photo.height}` }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photo.url} alt="Ảnh phòng của bạn" className="absolute inset-0 size-full object-cover" />
        <HorizonOverlay value={horizon} onChange={setHorizon} />
      </div>
      <fieldset className="flex flex-col gap-2">
        <legend className="text-[15px] font-semibold mb-2">Lúc chụp bạn đang</legend>
        <div className="inline-flex bg-muted rounded-pill p-1 self-start">
          {POSTURES.map((p) => (
            <button key={p.label} type="button" aria-pressed={heightM === p.heightM} onClick={() => setHeightM(p.heightM)}
              className={`min-h-[44px] px-5 rounded-pill text-[15px] font-semibold ${heightM === p.heightM ? "bg-accent text-on-accent" : "text-foreground"}`}>
              {p.label}
            </button>
          ))}
        </div>
      </fieldset>
      <Button full onClick={start}>Bắt đầu bày</Button>
    </main>
  );
}
```

- [ ] **Step 6: Kiểm**

Run: `pnpm --filter web typecheck && pnpm --filter web lint`
Expected: không lỗi. Chạy `pnpm --filter web dev`, mở `/thu-phong?style=bauhaus`: chọn ảnh mẫu → thấy ảnh + đường nét đứt kéo được (chuột và cảm ứng), đổi Đứng/Ngồi; bấm "Bắt đầu bày" → chuyển `/chinh-sua` (trang 404 lúc này là đúng). Tải một ảnh điện thoại dọc: ảnh hiện đúng chiều.

- [ ] **Step 7: Commit**

```bash
git add apps/web/lib/image.ts apps/web/lib/store.ts apps/web/app/thu-phong apps/web/components/try-room apps/web/package.json pnpm-lock.yaml
git commit -m "feat(web): store trình chỉnh sửa, chuẩn bị ảnh (EXIF, 1600 px), màn Thử phòng

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 11: Web — Worker depth và SAM trong trình duyệt

**Files:**
- Create: `apps/web/lib/workers/rpc.ts`, `apps/web/lib/workers/depth.worker.ts`, `apps/web/lib/workers/sam.worker.ts`
- Create: `apps/web/lib/ai/depthClient.ts`, `apps/web/lib/ai/samClient.ts`
- Modify: `apps/web/app/dev/page.tsx` (thêm liên kết trang thử worker), Create: `apps/web/app/dev/ai/page.tsx`

**Interfaces:**
- Consumes: `makeCachedCall`, `DisparityMap`, `Mask` từ `@yourspace/core`.
- Produces:
  - `rpc.ts`: `createRpcClient(make: () => Worker): { call<T>(method: string, args: unknown): Promise<T>; onProgress(fn: (p: ModelProgress) => void): () => void }`; `serveRpc(handlers: Record<string, (args: any) => Promise<RpcResult>>): void`; `type RpcResult = { value: unknown; transfer?: Transferable[] }`; `type ModelProgress = { file: string; loaded: number; total: number }`; `postProgress(p: ModelProgress): void` (gọi trong worker).
  - `depthClient.ts`: `warmupDepth(): Promise<void>`, `getDisparity(url: string): Promise<Result<DisparityMap, AIError>>` (timeout 20 s, cache theo url), `onDepthProgress(fn): () => void`.
  - `samClient.ts`: `warmupSam(): Promise<void>`, `encodeImage(url: string): Promise<{ width: number; height: number }>`, `decodePoints(points: SamPoint[]): Promise<Mask>`, `type SamPoint = { x: number; y: number; positive: boolean }` (x, y chuẩn hoá 0..1 theo ảnh), `onSamProgress(fn): () => void`.

- [ ] **Step 1: RPC**

`apps/web/lib/workers/rpc.ts`:

```ts
export type ModelProgress = { file: string; loaded: number; total: number };
export type RpcResult = { value: unknown; transfer?: Transferable[] };
type Req = { id: number; method: string; args: unknown };
type Res = { id: number; ok: true; value: unknown } | { id: number; ok: false; error: string } | { progress: ModelProgress };

export function createRpcClient(make: () => Worker) {
  let worker: Worker | null = null;
  let seq = 0;
  const pending = new Map<number, { resolve: (v: unknown) => void; reject: (e: Error) => void }>();
  const listeners = new Set<(p: ModelProgress) => void>();

  const get = () => {
    if (worker) return worker;
    worker = make();
    worker.onmessage = (e: MessageEvent<Res>) => {
      const m = e.data;
      if ("progress" in m) { listeners.forEach((fn) => fn(m.progress)); return; }
      const p = pending.get(m.id);
      if (!p) return;
      pending.delete(m.id);
      if (m.ok) p.resolve(m.value); else p.reject(new Error(m.error));
    };
    worker.onerror = (e) => {
      pending.forEach((p) => p.reject(new Error(e.message || "Worker lỗi")));
      pending.clear();
    };
    return worker;
  };

  return {
    call<T>(method: string, args: unknown): Promise<T> {
      const id = ++seq;
      return new Promise<T>((resolve, reject) => {
        pending.set(id, { resolve: resolve as (v: unknown) => void, reject });
        get().postMessage({ id, method, args } satisfies Req);
      });
    },
    onProgress(fn: (p: ModelProgress) => void) {
      listeners.add(fn);
      return () => { listeners.delete(fn); };
    },
  };
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export function serveRpc(handlers: Record<string, (args: any) => Promise<RpcResult>>): void {
  self.onmessage = async (e: MessageEvent<Req>) => {
    const { id, method, args } = e.data;
    const h = handlers[method];
    try {
      if (!h) throw new Error(`Không có phương thức ${method}`);
      const { value, transfer } = await h(args);
      (self as unknown as Worker).postMessage({ id, ok: true, value } satisfies Res, transfer ?? []);
    } catch (err) {
      (self as unknown as Worker).postMessage({ id, ok: false, error: err instanceof Error ? err.message : String(err) } satisfies Res);
    }
  };
}

export function postProgress(p: ModelProgress): void {
  (self as unknown as Worker).postMessage({ progress: p } satisfies Res);
}

/** transformers.js gọi progress_callback với nhiều kiểu sự kiện; chỉ chuyển sự kiện có byte. */
export function forwardProgress(e: { status?: string; file?: string; loaded?: number; total?: number }): void {
  if (e.status === "progress" && e.file && e.total) postProgress({ file: e.file, loaded: e.loaded ?? 0, total: e.total });
}

export const pickDevice = (): "webgpu" | "wasm" => ("gpu" in self.navigator ? "webgpu" : "wasm");
```

- [ ] **Step 2: Worker depth**

`apps/web/lib/workers/depth.worker.ts`:

```ts
import { pipeline } from "@huggingface/transformers";
import { forwardProgress, pickDevice, serveRpc } from "./rpc";

const MODEL = "onnx-community/depth-anything-v2-small";
type Estimator = (input: string) => Promise<{ predicted_depth: { data: Float32Array; dims: number[] } }>;
let estimator: Promise<Estimator> | null = null;

const load = () =>
  (estimator ??= pipeline("depth-estimation", MODEL, { device: pickDevice(), progress_callback: forwardProgress }) as unknown as Promise<Estimator>);

serveRpc({
  async warmup() {
    await load();
    return { value: true };
  },
  /** Disparity chuẩn hoá 0..1 (1 = gần nhất) — đúng quy ước DisparityMap của core. */
  async disparity({ url }: { url: string }) {
    const out = await (await load())(url);
    const t = out.predicted_depth;
    const h = t.dims[t.dims.length - 2] ?? 0;
    const w = t.dims[t.dims.length - 1] ?? 0;
    let mn = Infinity, mx = -Infinity;
    for (const v of t.data) { if (v < mn) mn = v; if (v > mx) mx = v; }
    const range = mx - mn || 1;
    const data = new Float32Array(w * h);
    for (let i = 0; i < w * h; i++) data[i] = ((t.data[i] ?? mn) - mn) / range;
    return { value: { width: w, height: h, data }, transfer: [data.buffer] };
  },
});
```

- [ ] **Step 3: Worker SAM**

`apps/web/lib/workers/sam.worker.ts`:

```ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { AutoProcessor, RawImage, SamModel, Tensor } from "@huggingface/transformers";
import { forwardProgress, pickDevice, serveRpc } from "./rpc";

const MODEL = "Xenova/slimsam-77-uniform";
let loaded: Promise<{ model: any; processor: any }> | null = null;
let current: { inputs: any; embeddings: any } | null = null;

const load = () =>
  (loaded ??= (async () => {
    const model = await SamModel.from_pretrained(MODEL, { device: pickDevice(), progress_callback: forwardProgress });
    const processor = await AutoProcessor.from_pretrained(MODEL, { progress_callback: forwardProgress });
    return { model, processor };
  })());

serveRpc({
  async warmup() {
    await load();
    return { value: true };
  },
  /** Mã hoá ảnh MỘT lần; các lần chạm sau chỉ chạy decoder. */
  async encode({ url }: { url: string }) {
    const { model, processor } = await load();
    const image = await RawImage.read(url);
    const inputs = await processor(image);
    const embeddings = await model.get_image_embeddings(inputs);
    current = { inputs, embeddings };
    return { value: { width: image.width, height: image.height } };
  },
  /** points: x, y chuẩn hoá 0..1. Trả mask LỚN NHẤT trong 3 mask (spike: ưu tiên mask lớn cứu thêm 11/65 món). */
  async decode({ points }: { points: { x: number; y: number; positive: boolean }[] }) {
    if (!current) throw new Error("Chưa mã hoá ảnh");
    const { model, processor } = await load();
    const [rh, rw] = current.inputs.reshaped_input_sizes[0] as [number, number];
    const input_points = new Tensor("float32", Float32Array.from(points.flatMap((p) => [p.x * rw, p.y * rh])), [1, 1, points.length, 2]);
    const input_labels = new Tensor("int64", BigInt64Array.from(points.map((p) => BigInt(p.positive ? 1 : 0))), [1, 1, points.length]);
    const outputs = await model({ ...current.embeddings, input_points, input_labels });
    const masks = await processor.post_process_masks(outputs.pred_masks, current.inputs.original_sizes, current.inputs.reshaped_input_sizes);
    const m = masks[0] as { dims: number[]; data: Uint8Array };
    const channels = m.dims[1] ?? 1;
    const H = m.dims[2] ?? 0;
    const W = m.dims[3] ?? 0;
    const size = W * H;
    let best = 0, bestArea = -1;
    for (let c = 0; c < channels; c++) {
      let area = 0;
      for (let k = c * size; k < (c + 1) * size; k++) if (m.data[k]) area++;
      if (area > bestArea) { bestArea = area; best = c; }
    }
    const data = new Uint8Array(size);
    for (let k = 0; k < size; k++) data[k] = m.data[best * size + k] ? 1 : 0;
    return { value: { width: W, height: H, data }, transfer: [data.buffer] };
  },
});
```

- [ ] **Step 4: Client**

`apps/web/lib/ai/depthClient.ts`:

```ts
"use client";
import { makeCachedCall, type DisparityMap } from "@yourspace/core";
import { createRpcClient, type ModelProgress } from "@/lib/workers/rpc";

const rpc = createRpcClient(() => new Worker(new URL("../workers/depth.worker.ts", import.meta.url), { type: "module" }));
let warm: Promise<void> | null = null;

/** Tải model (≈25 MB lần đầu, sau đó cache trình duyệt). Không có timeout vì phụ thuộc mạng. */
export const warmupDepth = (): Promise<void> => (warm ??= rpc.call<boolean>("warmup", {}).then(() => undefined));
export const onDepthProgress = (fn: (p: ModelProgress) => void) => rpc.onProgress(fn);

/** Gọi SAU warmupDepth: timeout 20 s chỉ tính phần suy luận (F5). */
export const getDisparity = makeCachedCall<string, DisparityMap>({
  run: (url) => rpc.call<DisparityMap>("disparity", { url }),
  cache: new Map(),
  keyOf: (url) => url,
  timeoutMs: 20_000,
  label: "depth",
});
```

`apps/web/lib/ai/samClient.ts`:

```ts
"use client";
import type { Mask } from "@yourspace/core";
import { createRpcClient, type ModelProgress } from "@/lib/workers/rpc";

export type SamPoint = { x: number; y: number; positive: boolean };

const rpc = createRpcClient(() => new Worker(new URL("../workers/sam.worker.ts", import.meta.url), { type: "module" }));
let warm: Promise<void> | null = null;

export const warmupSam = (): Promise<void> => (warm ??= rpc.call<boolean>("warmup", {}).then(() => undefined));
export const onSamProgress = (fn: (p: ModelProgress) => void) => rpc.onProgress(fn);
export const encodeImage = (url: string) => rpc.call<{ width: number; height: number }>("encode", { url });
export const decodePoints = (points: SamPoint[]) => rpc.call<Mask>("decode", { points });
```

- [ ] **Step 5: Trang thử worker (dev)**

`apps/web/app/dev/ai/page.tsx`:

```tsx
"use client";
import { maskArea } from "@yourspace/core";
import { useState } from "react";
import { getDisparity, warmupDepth } from "@/lib/ai/depthClient";
import { decodePoints, encodeImage, warmupSam } from "@/lib/ai/samClient";

const URL_ = "/golden/rooms/room-01.jpg";

export default function DevAI() {
  const [log, setLog] = useState<string[]>([]);
  const add = (s: string) => setLog((l) => [...l, `${new Date().toLocaleTimeString()} ${s}`]);
  async function run() {
    add("depth: tải model…"); await warmupDepth();
    const t0 = performance.now(); const d = await getDisparity(URL_);
    add(d.ok ? `depth ${d.value.width}×${d.value.height} trong ${Math.round(performance.now() - t0)} ms` : `depth lỗi ${d.error.kind}`);
    add("sam: tải model…"); await warmupSam();
    const t1 = performance.now(); const size = await encodeImage(URL_);
    add(`sam encode ${size.width}×${size.height} trong ${Math.round(performance.now() - t1)} ms`);
    const t2 = performance.now(); const m = await decodePoints([{ x: 0.5, y: 0.7, positive: true }]);
    add(`sam decode ${m.width}×${m.height}, diện tích ${maskArea(m)} px trong ${Math.round(performance.now() - t2)} ms`);
  }
  return (
    <main className="p-6 flex flex-col gap-3">
      <button type="button" className="self-start bg-accent text-on-accent rounded-pill px-6 min-h-11" onClick={() => void run()}>Chạy thử</button>
      <pre className="text-[13px] whitespace-pre-wrap">{log.join("\n")}</pre>
    </main>
  );
}
```

Thêm vào danh sách liên kết trong `apps/web/app/dev/page.tsx` một liên kết tới `/dev/ai` theo cùng kiểu với các liên kết đang có.

- [ ] **Step 6: Kiểm**

Run: `pnpm --filter web typecheck && pnpm --filter web lint && pnpm --filter web build`
Expected: build qua (Turbopack tách worker thành chunk riêng). Nếu build báo lỗi resolve `onnxruntime-node` hoặc `sharp` từ worker: thêm vào `apps/web/next.config.ts` →

```ts
const nextConfig: NextConfig = {
  turbopack: { resolveAlias: { "onnxruntime-node": { browser: "./lib/empty.ts" }, sharp: { browser: "./lib/empty.ts" } } },
};
```

kèm `apps/web/lib/empty.ts` chứa `export {};`, rồi build lại.
Chạy `pnpm --filter web dev`, mở `/dev/ai` trên Chrome máy tính, bấm "Chạy thử": log có đủ 4 dòng depth/sam, `diện tích` > 0. Ghi thời gian vào mô tả commit.

- [ ] **Step 7: Commit**

```bash
git add apps/web/lib/workers apps/web/lib/ai apps/web/app/dev
git add apps/web/next.config.ts apps/web/lib/empty.ts   # chỉ khi đã phải thêm alias ở Step 6
git commit -m "feat(web): worker depth (Depth Anything V2 Small) và SAM (SlimSAM) trong trình duyệt

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 12: Web — cảnh R3F và đặt đồ trong trình chỉnh sửa

**Files:**
- Create: `apps/web/components/editor/RoomScene.tsx`, `apps/web/components/editor/EditorStage.tsx`, `apps/web/components/editor/Tray.tsx`
- Create: `apps/web/app/chinh-sua/page.tsx`

**Interfaces:**
- Consumes: `useEditor`, `cameraOf`, `PlacedItem` (Task 10); `modelById`, `modelsOfStyle`, `STYLES`, `CATEGORY_LABEL` (Task 8); `formatVND`; `placeOnFloor`, `cameraToThree`, `Calibration`, `CameraModel`, `FurnitureModel`, `PhotoLighting` từ `@yourspace/core`; `Chip` (Task 9).
- Produces:
  - `RoomScene` props: `{ photoUrl: string; aspect: number; camera: CameraModel; items: PlacedItem[]; selectedUid: string | null; occluder: { data: Float32Array; width: number; height: number } | null; lighting: PhotoLighting; onItemPointerDown: (uid: string, pointer: { x: number; y: number }) => void }`
  - `EditorStage` props: `{ mode: "place" | "erase"; occluder: RoomScene["occluder"]; lighting: PhotoLighting; showOriginal: boolean; onErasePoint: (p: { x: number; y: number }) => void; children?: ReactNode }` (children = lớp phủ, ví dụ mask)
  - `DEFAULT_LIGHTING: PhotoLighting` (export từ `RoomScene.tsx`) = `{ exposure: 1, ambientIntensity: 0.8, keyIntensity: 1.6, color: { r: 1, g: 1, b: 1 } }`
  - `floorCalib(camera: CameraModel): Calibration` (export từ `EditorStage.tsx`)

- [ ] **Step 1: `RoomScene.tsx`**

```tsx
"use client";
import { ContactShadows, Line, PerspectiveCamera, useGLTF } from "@react-three/drei";
import { Canvas, useLoader, useThree } from "@react-three/fiber";
import { cameraToThree, type CameraModel, type FurnitureModel, type PhotoLighting } from "@yourspace/core";
import { Suspense, useEffect, useMemo } from "react";
import * as THREE from "three";
import { modelById } from "@/lib/catalog";
import type { PlacedItem } from "@/lib/store";

export const DEFAULT_LIGHTING: PhotoLighting = { exposure: 1, ambientIntensity: 0.8, keyIntensity: 1.6, color: { r: 1, g: 1, b: 1 } };
const NEAR = 0.05;
const FAR = 100;

type Occluder = { data: Float32Array; width: number; height: number } | null;

/** Ảnh phòng vẽ thẳng ra màn hình, giữ nguyên điểm ảnh (texture NoColorSpace, không tone map, không ghi độ sâu). */
function BackgroundQuad({ texture }: { texture: THREE.Texture }) {
  const material = useMemo(
    () => new THREE.ShaderMaterial({
      uniforms: { map: { value: texture } },
      vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }",
      fragmentShader: "uniform sampler2D map; varying vec2 vUv; void main(){ gl_FragColor = texture2D(map, vUv); }",
      depthTest: false,
      depthWrite: false,
      toneMapped: false,
    }),
    [texture],
  );
  return (
    <mesh frustumCulled={false} renderOrder={-2} material={material}>
      <planeGeometry args={[2, 2]} />
    </mesh>
  );
}

/** Lượt chỉ ghi độ sâu của vật thật (z mét → depth của camera ảo); pixel 0 bị bỏ. depthTest phải bật (depthFunc Always) thì GL mới ghi độ sâu. */
function OccluderQuad({ occluder }: { occluder: NonNullable<Occluder> }) {
  const material = useMemo(() => {
    const tex = new THREE.DataTexture(occluder.data, occluder.width, occluder.height, THREE.RedFormat, THREE.FloatType);
    tex.minFilter = THREE.NearestFilter;
    tex.magFilter = THREE.NearestFilter;
    tex.needsUpdate = true;
    return new THREE.ShaderMaterial({
      glslVersion: THREE.GLSL3,
      uniforms: { depthMap: { value: tex }, near: { value: NEAR }, far: { value: FAR } },
      vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }",
      fragmentShader: `uniform sampler2D depthMap; uniform float near; uniform float far; varying vec2 vUv;
        void main(){
          float z = texture2D(depthMap, vec2(vUv.x, 1.0 - vUv.y)).r;
          if (z <= 0.0) discard;
          float ndc = (far + near) / (far - near) - (2.0 * far * near) / ((far - near) * z);
          gl_FragDepth = clamp(ndc * 0.5 + 0.5, 0.0, 1.0);
          gl_FragColor = vec4(0.0);
        }`,
      colorWrite: false,
      depthWrite: true,
      depthTest: true,
      depthFunc: THREE.AlwaysDepth,
    });
  }, [occluder]);
  useEffect(() => () => { (material.uniforms.depthMap!.value as THREE.Texture).dispose(); material.dispose(); }, [material]);
  return (
    <mesh frustumCulled={false} renderOrder={-1} material={material}>
      <planeGeometry args={[2, 2]} />
    </mesh>
  );
}

function Lights({ lighting, envTexture }: { lighting: PhotoLighting; envTexture: THREE.Texture }) {
  const { gl, scene } = useThree();
  const target = useMemo(() => new THREE.Object3D(), []);
  useEffect(() => {
    gl.toneMappingExposure = lighting.exposure;
  }, [gl, lighting.exposure]);
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const rt = pmrem.fromEquirectangular(envTexture);
    scene.environment = rt.texture;
    scene.environmentIntensity = 0.5;
    return () => { scene.environment = null; rt.dispose(); pmrem.dispose(); };
  }, [gl, scene, envTexture]);
  const color = new THREE.Color(lighting.color.r, lighting.color.g, lighting.color.b);
  return (
    <>
      <hemisphereLight args={[color, "#555555", lighting.ambientIntensity]} />
      <primitive object={target} position={[0, 0, -4]} />
      <directionalLight
        castShadow color={color} intensity={lighting.keyIntensity} position={[2.5, 6, 3]} target={target}
        shadow-mapSize={[2048, 2048]} shadow-camera-left={-8} shadow-camera-right={8} shadow-camera-top={8}
        shadow-camera-bottom={-8} shadow-camera-near={0.5} shadow-camera-far={30} shadow-bias={-0.0005} shadow-radius={4}
      />
    </>
  );
}

function Furniture({ item, model, selected, onPointerDown }: {
  item: PlacedItem; model: FurnitureModel; selected: boolean; onPointerDown: (uid: string, pointer: { x: number; y: number }) => void;
}) {
  const { scene } = useGLTF(model.glbUrl);
  const object = useMemo(() => {
    const c = scene.clone(true);
    const lights: THREE.Object3D[] = [];
    c.traverse((o) => {
      if ((o as THREE.Light).isLight) lights.push(o);
      const mesh = o as THREE.Mesh;
      if (mesh.isMesh) { mesh.castShadow = true; mesh.receiveShadow = true; }
    });
    lights.forEach((l) => l.parent?.remove(l)); // đèn nhúng trong GLB (mô hình đèn) không được chiếu cảnh
    return c;
  }, [scene]);
  const { widthM: w, depthM: d } = model.dimsM;
  const outline = useMemo<[number, number, number][]>(
    () => [[-w / 2, 0.01, -d / 2], [w / 2, 0.01, -d / 2], [w / 2, 0.01, d / 2], [-w / 2, 0.01, d / 2], [-w / 2, 0.01, -d / 2]],
    [w, d],
  );
  return (
    <group
      position={[item.x, 0, item.z]}
      rotation={[0, item.rotationYRad + model.baseYawRad, 0]}
      onPointerDown={(e) => { e.stopPropagation(); onPointerDown(item.uid, { x: e.pointer.x, y: e.pointer.y }); }}
    >
      <primitive object={object} />
      {selected && <Line points={outline} color="white" lineWidth={2} />}
    </group>
  );
}

function Scene(props: Omit<Parameters<typeof RoomScene>[0], "aspect">) {
  const loaded = useLoader(THREE.TextureLoader, props.photoUrl);
  const { background, env } = useMemo(() => {
    const background = loaded.clone();
    background.colorSpace = THREE.NoColorSpace;
    background.needsUpdate = true;
    const env = loaded.clone();
    env.colorSpace = THREE.SRGBColorSpace;
    env.mapping = THREE.EquirectangularReflectionMapping;
    env.needsUpdate = true;
    return { background, env };
  }, [loaded]);
  const cam = cameraToThree(props.camera);
  return (
    <>
      <PerspectiveCamera makeDefault fov={cam.fovDeg} near={NEAR} far={FAR} position={cam.position} rotation={[cam.rotationXRad, 0, 0]} />
      <BackgroundQuad texture={background} />
      {props.occluder && <OccluderQuad occluder={props.occluder} />}
      <Lights lighting={props.lighting} envTexture={env} />
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.001, -5]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <shadowMaterial opacity={0.35} />
      </mesh>
      <ContactShadows position={[0, 0.005, -5]} scale={20} far={1.5} blur={2.5} opacity={0.5} resolution={1024} />
      {props.items.map((item) => {
        const model = modelById(item.productId);
        return model ? (
          <Furniture key={item.uid} item={item} model={model} selected={item.uid === props.selectedUid} onPointerDown={props.onItemPointerDown} />
        ) : null;
      })}
    </>
  );
}

/** Canvas đúng tỷ lệ ảnh: ảnh phòng → (độ sâu vật thật) → đồ 3D + bóng, camera ảo trùng camera ảnh. */
export function RoomScene(props: {
  photoUrl: string; aspect: number; camera: CameraModel; items: PlacedItem[]; selectedUid: string | null;
  occluder: Occluder; lighting: PhotoLighting; onItemPointerDown: (uid: string, pointer: { x: number; y: number }) => void;
}) {
  return (
    <Canvas shadows dpr={[1, 2]} gl={{ antialias: true }} style={{ position: "absolute", inset: 0 }}>
      <Suspense fallback={null}>
        <Scene {...props} />
      </Suspense>
    </Canvas>
  );
}
```

- [ ] **Step 2: `EditorStage.tsx`** (khung ảnh + xử lý chạm/kéo)

```tsx
"use client";
import { placeOnFloor, type Calibration, type CameraModel, type PhotoLighting } from "@yourspace/core";
import { useRef, type PointerEvent, type ReactNode } from "react";
import { modelById } from "@/lib/catalog";
import { cameraOf, useEditor } from "@/lib/store";
import { RoomScene } from "./RoomScene";

export const floorCalib = (camera: CameraModel): Calibration => ({
  camera,
  floor: { normal: { x: 0, y: 1, z: 0 }, d: 0 },
  confidence: 1,
});

type Occluder = Parameters<typeof RoomScene>[0]["occluder"];

export function EditorStage({ mode, occluder, lighting, showOriginal, onErasePoint, children }: {
  mode: "place" | "erase"; occluder: Occluder; lighting: PhotoLighting; showOriginal: boolean;
  onErasePoint: (p: { x: number; y: number }) => void; children?: ReactNode;
}) {
  const { photo, setup, history, selectedUid, armedProductId } = useEditor();
  const s = useEditor.getState;
  const boxRef = useRef<HTMLDivElement>(null);
  const hitItem = useRef(false);
  const drag = useRef<{ uid: string; dx: number; dz: number } | null>(null);
  if (!photo || !setup || !history) return null;
  const aspect = photo.width / photo.height;
  const camera = cameraOf(setup, aspect);
  const calib = floorCalib(camera);

  const toNdc = (e: PointerEvent) => {
    const r = boxRef.current!.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * 2 - 1, y: 1 - ((e.clientY - r.top) / r.height) * 2 };
  };
  const floorAt = (ndc: { x: number; y: number }) => placeOnFloor(ndc, calib, { widthM: 0, heightM: 0, depthM: 0 }).position;

  function onItemPointerDown(uid: string, pointer: { x: number; y: number }) {
    if (mode !== "place") return;
    hitItem.current = true;
    const item = s().history?.present.items.find((i) => i.uid === uid);
    if (!item) return;
    const p = floorAt(pointer);
    drag.current = { uid, dx: item.x - p.x, dz: item.z - p.z };
    s().select(uid);
    s().beginGesture();
  }

  function onPointerDown(e: PointerEvent<HTMLDivElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    const ndc = toNdc(e);
    if (mode === "erase") {
      onErasePoint({ x: (ndc.x + 1) / 2, y: (1 - ndc.y) / 2 });
      return;
    }
    if (hitItem.current) { hitItem.current = false; return; } // R3F đã xử lý (chạy trước, vì lắng nghe ở phần tử con)
    const productId = s().armedProductId;
    if (!productId) { s().select(null); return; }
    if (ndc.y >= setup!.horizonNdcY) { s().notify("Chạm vào sàn, thấp hơn đường ngang tầm mắt"); return; }
    if (!modelById(productId)) return;
    const p = floorAt(ndc);
    const first = (s().history?.present.items.length ?? 0) === 0;
    s().placeItem(productId, p.x, p.z);
    if (first) s().notify("Đã căn theo mặt sàn · kéo để chỉnh");
  }

  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    const d = drag.current;
    if (!d) return;
    const ndc = toNdc(e);
    if (ndc.y >= setup!.horizonNdcY - 0.01) return; // không kéo món lên trên chân trời (F2: luôn bám sàn)
    const p = floorAt(ndc);
    s().moveItem(d.uid, p.x + d.dx, p.z + d.dz);
  }

  function onPointerUp() {
    if (drag.current) { drag.current = null; s().endGesture(); }
  }

  return (
    <div
      ref={boxRef}
      className={`relative overflow-hidden bg-muted touch-none select-none ${armedProductId || mode === "erase" ? "cursor-crosshair" : ""}`}
      style={{ aspectRatio: `${photo.width} / ${photo.height}`, width: `min(100%, calc(62vh * ${aspect}))` }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <RoomScene
        photoUrl={showOriginal ? photo.url : history.present.workingUrl}
        aspect={aspect}
        camera={camera}
        items={mode === "erase" ? [] : history.present.items}
        selectedUid={selectedUid}
        occluder={occluder}
        lighting={lighting}
        onItemPointerDown={onItemPointerDown}
      />
      {children}
    </div>
  );
}
```

Khung luôn giữ đúng tỷ lệ ảnh (`aspectRatio` + `width: min(100%, 62vh × aspect)`) — **bắt buộc**, vì camera ảo giả định canvas cùng tỷ lệ với ảnh. Trang cha đặt khung trong một div `flex justify-center`.

- [ ] **Step 3: `Tray.tsx`**

```tsx
"use client";
import type { StyleId } from "@yourspace/core";
import { CATEGORY_LABEL, STYLES, modelsOfStyle } from "@/lib/catalog";
import { formatVND } from "@/lib/format";
import { useEditor } from "@/lib/store";

/** Khay đồ lọc theo phong cách. Chạm một món để "cầm", rồi chạm lên sàn trong ảnh để đặt. */
export function Tray() {
  const { styleId, setStyle, armedProductId, arm } = useEditor();
  const items = modelsOfStyle(styleId);
  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2 overflow-x-auto" role="tablist" aria-label="Phong cách">
        {STYLES.map((s) => (
          <button key={s.id} type="button" role="tab" aria-selected={s.id === styleId} onClick={() => setStyle(s.id as StyleId)}
            className={`shrink-0 min-h-[44px] px-4 rounded-pill text-[15px] font-semibold ${s.id === styleId ? "bg-accent text-on-accent" : "bg-muted"}`}>
            {s.name}
          </button>
        ))}
      </div>
      <ul className="flex gap-2 overflow-x-auto pb-1">
        {items.map((m) => {
          const armed = m.id === armedProductId;
          return (
            <li key={m.id} className="shrink-0">
              <button type="button" aria-pressed={armed} onClick={() => arm(armed ? null : m.id)}
                className={`w-[132px] min-h-[88px] text-left rounded-md2 p-3 flex flex-col justify-between ${armed ? "bg-accent text-on-accent" : "bg-card border border-border"}`}>
                <span className="text-[12px] leading-4 opacity-80">{CATEGORY_LABEL[m.category]}</span>
                <span className="text-[15px] leading-5 font-semibold">{m.name}</span>
                <span className={`text-[13px] font-semibold tabular ${armed ? "" : "text-accent-text"}`}>{formatVND(m.priceVND)}</span>
              </button>
            </li>
          );
        })}
      </ul>
      <p className="text-[13px] text-muted-foreground min-h-[18px]">
        {armedProductId ? "Chạm lên sàn trong ảnh để đặt món." : "Chọn một món, rồi chạm lên sàn để đặt."}
      </p>
    </div>
  );
}
```

Ô món chưa chọn dùng nền `card` có viền thay vì `muted`, vì giá vàng đồng trên `muted` chỉ đạt 4,48:1 (MASTER.md cấm).

- [ ] **Step 4: Trang `/chinh-sua` (bản đặt đồ)**

`apps/web/app/chinh-sua/page.tsx`:

```tsx
"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { DEFAULT_LIGHTING } from "@/components/editor/RoomScene";
import { EditorStage } from "@/components/editor/EditorStage";
import { Tray } from "@/components/editor/Tray";
import { Chip } from "@/components/ui/Chip";
import { useEditor } from "@/lib/store";

export default function EditorPage() {
  const router = useRouter();
  const { photo, history, notice } = useEditor();
  useEffect(() => {
    if (!photo || !history) router.replace("/thu-phong");
  }, [photo, history, router]);
  if (!photo || !history) return null;
  return (
    <main className="flex-1 flex flex-col">
      <div className="relative flex justify-center bg-black">
        <EditorStage mode="place" occluder={null} lighting={DEFAULT_LIGHTING} showOriginal={false} onErasePoint={() => {}} />
        {notice && <div className="absolute top-3 inset-x-0 flex justify-center pointer-events-none"><Chip key={notice.id}>{notice.text}</Chip></div>}
      </div>
      <section className="w-full max-w-xl mx-auto px-4 py-4">
        <Tray />
      </section>
    </main>
  );
}
```

- [ ] **Step 5: Kiểm tay**

Run: `pnpm --filter web typecheck && pnpm --filter web lint`, rồi `pnpm --filter web dev`.
Đi `/thu-phong` → ảnh mẫu 1 → kéo chân trời → "Bắt đầu bày". Kiểm:
1. Ảnh hiện đúng màu (so với `/thu-phong`), canvas đúng tỷ lệ ảnh.
2. Chọn "Sofa vải be ba chỗ" → chạm sàn → sofa xuất hiện chạm sàn, có bóng; chip "Đã căn theo mặt sàn · kéo để chỉnh".
3. Chạm phía trên đường chân trời → chip nhắc.
4. Kéo sofa → món trượt trên sàn, to nhỏ theo xa gần.
5. Đặt từng món của cả 3 phong cách: mặt trước có hướng về máy không. Món nào quay lưng/ngang thì đặt `baseYawRad` cho món đó trong `ENTRIES` (`Math.PI`, `Math.PI / 2` hoặc `-Math.PI / 2`) và kiểm lại.
6. Mô hình đèn không làm cả cảnh sáng lên (đèn nhúng đã bị gỡ).

- [ ] **Step 6: Commit**

```bash
git add apps/web/components/editor apps/web/app/chinh-sua apps/web/lib/catalog.ts
git commit -m "feat(web): cảnh R3F khớp camera ảnh + đặt và kéo đồ trên mặt sàn

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 13: Web — che khuất, ánh sáng theo ảnh, thanh món, dự toán, hoàn tác, cỡ phòng

**Files:**
- Create: `apps/web/lib/hooks/useSceneDepth.ts`, `apps/web/lib/hooks/usePhotoLighting.ts`
- Create: `apps/web/components/editor/ItemPanel.tsx`, `apps/web/components/editor/EstimateBar.tsx`, `apps/web/components/editor/TopBar.tsx`, `apps/web/components/editor/RoomScalePopover.tsx`
- Modify: `apps/web/app/chinh-sua/page.tsx`

**Interfaces:**
- Consumes: `warmupDepth`, `getDisparity`, `onDepthProgress` (Task 11); `fitDepthToFloor`, `buildOccluderDepth`, `imageStats`, `lightingFromImageStats`, `estimate`, `canUndo`, `canRedo` từ `@yourspace/core`; `readPixels` (Task 10); `MODELS`, `SUPPLIERS`, `modelById` (Task 8); `formatVND`, `formatDimsCm`; `DEFAULT_LIGHTING` (Task 12).
- Produces:
  - `useSceneDepth(): { occluder: { data: Float32Array; width: number; height: number } | null; status: DepthState["status"]; progress: number | null }` — `progress` 0..1 khi đang tải model.
  - `usePhotoLighting(url: string): PhotoLighting`
  - `ItemPanel` props: `{ onBuy: (productIds: string[]) => void }`
  - `EstimateBar` props: `{ onOpen: () => void }`
  - `TopBar` props: `{ mode: "place" | "erase"; onModeChange: (m: "place" | "erase") => void }`
  - `ROOM_HEIGHT_RANGE = { min: 0.8, max: 2.0 }` (export từ `RoomScalePopover.tsx`)

- [ ] **Step 1: `useSceneDepth.ts`**

```ts
"use client";
import { buildOccluderDepth, fitDepthToFloor } from "@yourspace/core";
import { useEffect, useMemo, useState } from "react";
import { getDisparity, onDepthProgress, warmupDepth } from "@/lib/ai/depthClient";
import { cameraOf, useEditor } from "@/lib/store";

const MIN_CONFIDENCE = 0.3;

/** Chạy depth cho ảnh đang sửa (lại sau mỗi lần xóa), khớp theo mặt sàn, dựng ảnh độ sâu che khuất. */
export function useSceneDepth() {
  const { photo, setup, history, depth, setDepth, notify } = useEditor();
  const [progress, setProgress] = useState<number | null>(null);
  const url = history?.present.workingUrl ?? null;

  useEffect(() => onDepthProgress((p) => setProgress(p.total ? p.loaded / p.total : null)), []);

  useEffect(() => {
    if (!url) return;
    let cancelled = false;
    (async () => {
      setDepth({ status: "running", forUrl: url, disparity: null });
      await warmupDepth();
      const r = await getDisparity(url);
      if (cancelled) return;
      setProgress(null);
      if (!r.ok) {
        setDepth({ status: "failed", forUrl: url, disparity: null });
        notify("Chưa tính được chiều sâu · đồ sẽ luôn nằm trên");
        return;
      }
      setDepth({ status: "ready", forUrl: url, disparity: r.value });
    })();
    return () => { cancelled = true; };
  }, [url, setDepth, notify]);

  const occluder = useMemo(() => {
    if (!photo || !setup || depth.status !== "ready" || !depth.disparity || depth.forUrl !== url) return null;
    const camera = cameraOf(setup, photo.width / photo.height);
    const fit = fitDepthToFloor(depth.disparity, camera);
    if (fit.confidence < MIN_CONFIDENCE) return null;
    return { data: buildOccluderDepth(depth.disparity, fit, camera), width: depth.disparity.width, height: depth.disparity.height };
  }, [photo, setup, depth, url]);

  // F4: depth chạy được nhưng không khớp nổi mặt sàn (ảnh không thấy sàn, cận cảnh…).
  useEffect(() => {
    if (depth.status === "ready" && occluder === null) notify("Ảnh khó phân tích chiều sâu · đồ sẽ luôn nằm trên");
  }, [depth.status, occluder, notify]);

  return { occluder, status: depth.status, progress };
}
```


- [ ] **Step 2: `usePhotoLighting.ts`**

```ts
"use client";
import { imageStats, lightingFromImageStats, type PhotoLighting } from "@yourspace/core";
import { useEffect, useState } from "react";
import { DEFAULT_LIGHTING } from "@/components/editor/RoomScene";
import { readPixels } from "@/lib/image";

export function usePhotoLighting(url: string | null): PhotoLighting {
  const [lighting, setLighting] = useState<PhotoLighting>(DEFAULT_LIGHTING);
  useEffect(() => {
    if (!url) return;
    let cancelled = false;
    readPixels(url, 64)
      .then(({ data, width, height }) => { if (!cancelled) setLighting(lightingFromImageStats(imageStats(data, width, height))); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [url]);
  return lighting;
}
```

- [ ] **Step 3: `ItemPanel.tsx`** (thanh tác vụ + thước xoay; không có tỷ lệ)

```tsx
"use client";
import { Copy, ShoppingBag, Trash } from "@phosphor-icons/react";
import { modelById } from "@/lib/catalog";
import { formatDimsCm, formatVND } from "@/lib/format";
import { useEditor } from "@/lib/store";

const SNAPS = [-180, -135, -90, -45, 0, 45, 90, 135, 180];
const snap = (deg: number) => SNAPS.find((a) => Math.abs(a - deg) <= 5) ?? deg;

export function ItemPanel({ onBuy }: { onBuy: (productIds: string[]) => void }) {
  const { history, selectedUid, select, rotateItem, beginGesture, endGesture, duplicateItem, removeItem } = useEditor();
  const item = history?.present.items.find((i) => i.uid === selectedUid);
  const model = item ? modelById(item.productId) : undefined;
  if (!item || !model) return null;
  const deg = Math.round((item.rotationYRad * 180) / Math.PI);
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[17px] leading-[22px] font-semibold">{model.name}</p>
          <p className="text-[15px] font-semibold text-accent-text tabular">{formatVND(model.priceVND)}</p>
          <p className="text-[13px] text-muted-foreground tabular">{formatDimsCm(model.dimsM)}</p>
        </div>
        <button type="button" className="min-h-[44px] px-3 font-semibold" onClick={() => select(null)}>Xong</button>
      </div>
      <label className="flex items-center gap-3 text-[13px] font-semibold">
        <span className="w-12">Xoay</span>
        <input type="range" min={-180} max={180} step={1} value={deg} className="flex-1 accent-foreground h-11"
          onPointerDown={beginGesture}
          onPointerUp={(e) => { rotateItem(item.uid, (snap(Number(e.currentTarget.value)) * Math.PI) / 180); endGesture(); }}
          onKeyUp={endGesture} onKeyDown={beginGesture}
          onChange={(e) => rotateItem(item.uid, (Number(e.target.value) * Math.PI) / 180)} />
        <span className="w-12 text-right tabular">{deg}°</span>
      </label>
      <div className="inline-flex self-start items-stretch bg-accent text-on-accent rounded-pill px-2 shadow-[0_10px_20px_rgba(0,0,0,0.1)]">
        <button type="button" className="w-[58px] h-[52px] flex flex-col items-center justify-center text-[11px] font-semibold" onClick={() => onBuy([model.id])}>
          <ShoppingBag size={20} />Mua
        </button>
        <span className="w-px my-3 bg-on-accent/25" aria-hidden />
        <button type="button" className="w-[58px] h-[52px] flex flex-col items-center justify-center text-[11px] font-semibold" onClick={() => duplicateItem(item.uid)}>
          <Copy size={20} />Nhân bản
        </button>
        <button type="button" className="w-[58px] h-[52px] flex flex-col items-center justify-center text-[11px] font-semibold text-destructive-on-accent" onClick={() => removeItem(item.uid)}>
          <Trash size={20} />Bỏ
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: `EstimateBar.tsx`**

```tsx
"use client";
import { estimate } from "@yourspace/core";
import { Button } from "@/components/ui/Button";
import { MODELS, SUPPLIERS } from "@/lib/catalog";
import { formatVND } from "@/lib/format";
import { useEditor } from "@/lib/store";

/** Thanh dự toán luôn hiện ở đáy. Nút chính duy nhất của màn trình chỉnh sửa. */
export function EstimateBar({ onOpen }: { onOpen: () => void }) {
  const items = useEditor((s) => s.history?.present.items ?? []);
  const e = estimate(items.map((i) => i.productId), MODELS, SUPPLIERS);
  return (
    <div className="sticky bottom-0 inset-x-0 bg-background border-t border-border px-4 py-3">
      <div className="max-w-xl mx-auto flex items-center justify-between gap-4">
        <div>
          <p className="text-[13px] text-muted-foreground">{e.itemCount} món · giá mẫu</p>
          <p className="font-display font-bold text-[22px] leading-7 tabular">{formatVND(e.totalVND)}</p>
        </div>
        <Button onClick={onOpen} disabled={e.itemCount === 0}>Xem & mua</Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: `RoomScalePopover.tsx` và `TopBar.tsx`**

`apps/web/components/editor/RoomScalePopover.tsx`:

```tsx
"use client";
import { useEditor } from "@/lib/store";

export const ROOM_HEIGHT_RANGE = { min: 0.8, max: 2.0 };

/** F1 ở mức phòng: đổi chiều cao máy → mọi món cùng to/nhỏ theo (không có tỷ lệ từng món — MASTER.md). */
export function RoomScalePopover({ onClose }: { onClose: () => void }) {
  const { setup, setCameraHeight } = useEditor();
  if (!setup) return null;
  return (
    <div className="absolute right-4 top-14 z-20 w-72 bg-card rounded-md2 p-4 shadow-[0_10px_24px_rgba(0,0,0,0.12)] flex flex-col gap-3">
      <p className="text-[15px] font-semibold">Đồ trông to hoặc nhỏ quá?</p>
      <p className="text-[13px] text-muted-foreground">Chỉnh độ cao máy lúc chụp. Mọi món đổi cỡ cùng lúc, kích thước thật giữ nguyên.</p>
      <input type="range" aria-label="Độ cao máy" min={ROOM_HEIGHT_RANGE.min} max={ROOM_HEIGHT_RANGE.max} step={0.05} value={setup.heightM}
        className="accent-foreground h-11" onChange={(e) => setCameraHeight(Number(e.target.value))} />
      <div className="flex items-center justify-between text-[13px] tabular">
        <span>Máy cao {setup.heightM.toFixed(2)} m</span>
        <button type="button" className="min-h-[44px] font-semibold" onClick={onClose}>Xong</button>
      </div>
    </div>
  );
}
```

`apps/web/components/editor/TopBar.tsx`:

```tsx
"use client";
import { ArrowClockwise, ArrowCounterClockwise, ArrowLeft, Ruler } from "@phosphor-icons/react";
import { canRedo, canUndo } from "@yourspace/core";
import Link from "next/link";
import { useState } from "react";
import { useEditor } from "@/lib/store";
import { RoomScalePopover } from "./RoomScalePopover";

const round = "size-11 inline-flex items-center justify-center rounded-pill bg-card disabled:opacity-40";

export function TopBar({ mode, onModeChange }: { mode: "place" | "erase"; onModeChange: (m: "place" | "erase") => void }) {
  const { history, undo, redo } = useEditor();
  const [scaleOpen, setScaleOpen] = useState(false);
  return (
    <div className="relative flex items-center justify-between gap-2 px-4 py-2 bg-background border-b border-border">
      <Link href="/thu-phong" aria-label="Về chọn ảnh" className={round}><ArrowLeft size={20} /></Link>
      <div className="inline-flex bg-muted rounded-pill p-1" role="tablist" aria-label="Chế độ">
        {(["place", "erase"] as const).map((m) => (
          <button key={m} type="button" role="tab" aria-selected={mode === m} onClick={() => onModeChange(m)}
            className={`min-h-[40px] px-4 rounded-pill text-[15px] font-semibold ${mode === m ? "bg-accent text-on-accent" : ""}`}>
            {m === "place" ? "Bày đồ" : "Xóa đồ"}
          </button>
        ))}
      </div>
      <div className="flex gap-1">
        <button type="button" aria-label="Hoàn tác" className={round} disabled={!history || !canUndo(history)} onClick={undo}><ArrowCounterClockwise size={20} /></button>
        <button type="button" aria-label="Làm lại" className={round} disabled={!history || !canRedo(history)} onClick={redo}><ArrowClockwise size={20} /></button>
        <button type="button" aria-label="Chỉnh cỡ phòng" aria-expanded={scaleOpen} className={round} onClick={() => setScaleOpen((o) => !o)}><Ruler size={20} /></button>
      </div>
      {scaleOpen && <RoomScalePopover onClose={() => setScaleOpen(false)} />}
    </div>
  );
}
```

- [ ] **Step 6: Ghép vào trang**

Thay `apps/web/app/chinh-sua/page.tsx`:

```tsx
"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { EditorStage } from "@/components/editor/EditorStage";
import { EstimateBar } from "@/components/editor/EstimateBar";
import { ItemPanel } from "@/components/editor/ItemPanel";
import { TopBar } from "@/components/editor/TopBar";
import { Tray } from "@/components/editor/Tray";
import { Chip } from "@/components/ui/Chip";
import { useSceneDepth } from "@/lib/hooks/useSceneDepth";
import { usePhotoLighting } from "@/lib/hooks/usePhotoLighting";
import { useEditor } from "@/lib/store";

export default function EditorPage() {
  const router = useRouter();
  const { photo, history, notice, selectedUid } = useEditor();
  const [mode, setMode] = useState<"place" | "erase">("place");
  const [buyIds, setBuyIds] = useState<string[] | null>(null);
  const { occluder, status, progress } = useSceneDepth();
  const lighting = usePhotoLighting(history?.present.workingUrl ?? null);

  useEffect(() => {
    if (!photo || !history) router.replace("/thu-phong");
  }, [photo, history, router]);
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => useEditor.setState({ notice: null }), 3500);
    return () => clearTimeout(t);
  }, [notice]);
  if (!photo || !history) return null;

  const allIds = history.present.items.map((i) => i.productId);
  return (
    <main className="flex-1 flex flex-col">
      <TopBar mode={mode} onModeChange={setMode} />
      <div className="relative flex justify-center bg-black">
        <EditorStage mode={mode} occluder={occluder} lighting={lighting} showOriginal={false} onErasePoint={() => {}} />
        <div className="absolute top-3 inset-x-0 flex flex-col items-center gap-2 pointer-events-none">
          {status === "running" && <Chip tone="light">{progress !== null ? `Đang tải mô hình chiều sâu ${Math.round(progress * 100)}%` : "Đang tính chiều sâu…"}</Chip>}
          {notice && <Chip key={notice.id}>{notice.text}</Chip>}
        </div>
      </div>
      <section className="w-full max-w-xl mx-auto px-4 py-4 flex-1">
        {selectedUid ? <ItemPanel onBuy={setBuyIds} /> : <Tray />}
      </section>
      <EstimateBar onOpen={() => setBuyIds(allIds)} />
      {/* BuySheet gắn ở Task 16; tạm giữ state buyIds để không đổi chữ ký ItemPanel / EstimateBar */}
      {buyIds && null}
    </main>
  );
}
```

Thông báo tự ẩn sau 3,5 s; `useEditor.setState` gọi trong callback của timer nên không vi phạm luật set-state-in-effect.

- [ ] **Step 7: Kiểm tay**

Run: `pnpm --filter web typecheck && pnpm --filter web lint`, rồi `pnpm --filter web dev`.
1. Vào trình chỉnh sửa: chip "Đang tải mô hình chiều sâu …%" rồi biến mất.
2. Ảnh mẫu 1 (có sofa thật ở tiền cảnh nếu có, hoặc đồ đứng gần): đặt món **sau** một món đồ thật → phần bị đồ thật che phải khuất; chân món chạm sàn không bị cắt.
3. Ảnh tối (room-06 hoặc room-09): đồ tối theo ảnh (exposure < 1); ảnh sáng: đồ sáng hơn.
4. Chọn món → panel: xoay; thả gần 0°/±45°/±90° thì hít vào; Nhân bản; Bỏ. Hoàn tác/Làm lại từng bước: kéo một lần = một bước, xoay một lần = một bước.
5. Nút thước → kéo độ cao máy: mọi món đổi cỡ cùng lúc.
6. Thanh dự toán đổi theo số món, giá vàng đồng chỉ ở danh sách/panel, tổng dùng Bricolage.

- [ ] **Step 8: Commit**

```bash
git add apps/web/lib/hooks apps/web/components/editor apps/web/app/chinh-sua
git commit -m "feat(web): che khuất theo depth, ánh sáng theo ảnh, thanh món, dự toán, hoàn tác, cỡ phòng

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 14: Web — route xóa đồ gọi Replicate LaMa

**Files:**
- Modify: `apps/web/package.json` (vitest + script test), Create: `apps/web/vitest.config.ts`
- Create: `apps/web/lib/server/replicateLama.ts`, `apps/web/lib/server/rateLimit.ts`, `apps/web/lib/server/inpaintHandler.ts`
- Test: `apps/web/lib/server/replicateLama.test.ts`, `apps/web/lib/server/rateLimit.test.ts`, `apps/web/lib/server/inpaintHandler.test.ts`
- Create: `apps/web/app/api/ai/inpaint/route.ts`, `apps/web/.env.example`

**Interfaces:**
- Consumes: `makeCachedCall`, `AIError` từ `@yourspace/core`.
- Produces:
  - `LAMA_VERSION: string`; `runLama(input: { image: string; mask: string }, deps: { token: string; fetchFn?: typeof fetch; pollIntervalMs?: number; sleep?: (ms: number) => Promise<void> }): Promise<string>` — trả URL ảnh kết quả.
  - `createRateLimiter(opts: { limit: number; windowMs: number; now?: () => number }): { take(key: string): boolean }`
  - `createInpaintHandler(deps: { lama: (i: { image: string; mask: string }) => Promise<string>; fetchOutput: (url: string) => Promise<Uint8Array>; limiter: { take(k: string): boolean }; timeoutMs: number }): (req: Request) => Promise<Response>`
  - HTTP: `POST /api/ai/inpaint`, `multipart/form-data` với `image` (JPEG) và `mask` (PNG, trắng = xóa), mỗi file ≤ 3 MB. Thành công: `200 image/png`. Lỗi: JSON `{ error: AIError }` với 400 (đầu vào), 429 (`BudgetExceeded` hoặc `RateLimited`), 502 (`VendorError`), 503 (chưa cấu hình token), 504 (`Timeout`).

- [ ] **Step 1: Bộ test cho web**

```bash
pnpm --filter web add -D vitest@^2.1.0
```

Thêm `"test": "vitest run"` vào `scripts` của `apps/web/package.json`.

`apps/web/vitest.config.ts`:

```ts
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./", import.meta.url)) } },
  test: { include: ["lib/**/*.test.ts"], environment: "node" },
});
```

- [ ] **Step 2: Test thất bại**

`apps/web/lib/server/rateLimit.test.ts`:

```ts
import { expect, test } from "vitest";
import { createRateLimiter } from "./rateLimit";

test("giới hạn theo key trong cửa sổ trượt", () => {
  let t = 0;
  const rl = createRateLimiter({ limit: 2, windowMs: 1000, now: () => t });
  expect(rl.take("a")).toBe(true);
  expect(rl.take("a")).toBe(true);
  expect(rl.take("a")).toBe(false);
  expect(rl.take("b")).toBe(true);
  t = 1001;
  expect(rl.take("a")).toBe(true);
});
```

`apps/web/lib/server/replicateLama.test.ts`:

```ts
import { expect, test, vi } from "vitest";
import { LAMA_VERSION, runLama } from "./replicateLama";

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
const input = { image: "data:image/jpeg;base64,AA==", mask: "data:image/png;base64,AA==" };

test("xong ngay nhờ Prefer: wait", async () => {
  const fetchFn = vi.fn().mockResolvedValue(json({ id: "p1", status: "succeeded", output: "https://x/out.png" }, 201));
  await expect(runLama(input, { token: "t", fetchFn })).resolves.toBe("https://x/out.png");
  const [url, init] = fetchFn.mock.calls[0]!;
  expect(url).toBe("https://api.replicate.com/v1/predictions");
  expect(init.headers.Authorization).toBe("Bearer t");
  expect(init.headers.Prefer).toBe("wait=60");
  expect(JSON.parse(init.body)).toEqual({ version: LAMA_VERSION, input });
});

test("chưa xong thì hỏi lại urls.get tới khi xong", async () => {
  const fetchFn = vi.fn()
    .mockResolvedValueOnce(json({ id: "p1", status: "processing", urls: { get: "https://api/p1" } }, 201))
    .mockResolvedValueOnce(json({ id: "p1", status: "processing", urls: { get: "https://api/p1" } }))
    .mockResolvedValueOnce(json({ id: "p1", status: "succeeded", output: ["https://x/o.png"] }));
  const sleep = vi.fn().mockResolvedValue(undefined);
  await expect(runLama(input, { token: "t", fetchFn, sleep })).resolves.toBe("https://x/o.png");
  expect(fetchFn.mock.calls[1]![0]).toBe("https://api/p1");
  expect(sleep).toHaveBeenCalledTimes(2);
});

test("failed → ném lỗi có thông báo của Replicate", async () => {
  const fetchFn = vi.fn().mockResolvedValue(json({ id: "p1", status: "failed", error: "CUDA OOM" }, 201));
  await expect(runLama(input, { token: "t", fetchFn })).rejects.toThrow("CUDA OOM");
});

test("HTTP 429 → lỗi có '429' để gateway ánh xạ RateLimited", async () => {
  const fetchFn = vi.fn().mockResolvedValue(new Response("slow down", { status: 429 }));
  await expect(runLama(input, { token: "t", fetchFn })).rejects.toThrow(/429/);
});
```

`apps/web/lib/server/inpaintHandler.test.ts`:

```ts
import { expect, test, vi } from "vitest";
import { createInpaintHandler } from "./inpaintHandler";

const req = (fields: Record<string, Blob>, ip = "1.1.1.1") => {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.set(k, v, k);
  return new Request("http://localhost/api/ai/inpaint", { method: "POST", body: fd, headers: { "x-forwarded-for": ip } });
};
const img = () => new Blob([new Uint8Array([1, 2, 3])], { type: "image/jpeg" });
const mask = () => new Blob([new Uint8Array([4, 5])], { type: "image/png" });
const deps = () => ({
  lama: vi.fn().mockResolvedValue("https://x/out.png"),
  fetchOutput: vi.fn().mockResolvedValue(new Uint8Array([9, 9])),
  limiter: { take: vi.fn().mockReturnValue(true) },
  timeoutMs: 1000,
});

test("thành công: trả PNG, gửi data URI; lần 2 cùng ảnh+mask dùng cache", async () => {
  const d = deps();
  const handle = createInpaintHandler(d);
  const res = await handle(req({ image: img(), mask: mask() }));
  expect(res.status).toBe(200);
  expect(res.headers.get("content-type")).toBe("image/png");
  expect(new Uint8Array(await res.arrayBuffer())).toEqual(new Uint8Array([9, 9]));
  expect(d.lama.mock.calls[0]![0].image).toBe("data:image/jpeg;base64,AQID");
  await handle(req({ image: img(), mask: mask() }));
  expect(d.lama).toHaveBeenCalledTimes(1);
});

test("thiếu mask → 400", async () => {
  const res = await createInpaintHandler(deps())(req({ image: img() }));
  expect(res.status).toBe(400);
});

test("vượt giới hạn lượt → 429 BudgetExceeded", async () => {
  const d = deps();
  d.limiter.take.mockReturnValue(false);
  const res = await createInpaintHandler(d)(req({ image: img(), mask: mask() }));
  expect(res.status).toBe(429);
  expect((await res.json()).error.kind).toBe("BudgetExceeded");
});

test("vendor lỗi → 502 VendorError", async () => {
  const d = deps();
  d.lama.mockRejectedValue(new Error("boom"));
  const res = await createInpaintHandler(d)(req({ image: img(), mask: mask() }));
  expect(res.status).toBe(502);
  expect((await res.json()).error.kind).toBe("VendorError");
});
```

Run: `pnpm --filter web test` → FAIL (thiếu module).

- [ ] **Step 3: Cài đặt**

`apps/web/lib/server/rateLimit.ts`:

```ts
/** Giới hạn lượt trong bộ nhớ, cửa sổ trượt. Đủ cho demo một tiến trình; mất khi khởi động lại. */
export function createRateLimiter(opts: { limit: number; windowMs: number; now?: () => number }) {
  const now = opts.now ?? Date.now;
  const hits = new Map<string, number[]>();
  return {
    take(key: string): boolean {
      const t = now();
      const recent = (hits.get(key) ?? []).filter((x) => t - x < opts.windowMs);
      if (recent.length >= opts.limit) { hits.set(key, recent); return false; }
      recent.push(t);
      hits.set(key, recent);
      return true;
    },
  };
}
```

`apps/web/lib/server/replicateLama.ts`:

```ts
/** LaMa trên Replicate (allenhooo/lama). Input image + mask (URI), output URI ảnh PNG. */
export const LAMA_VERSION = "cdac78a1bec5b23c07fd29692fb70baa513ea403a39e643c48ec5edadb15fe72";

type Prediction = {
  id: string;
  status: "starting" | "processing" | "succeeded" | "failed" | "canceled";
  output?: string | string[] | null;
  error?: string | null;
  urls?: { get?: string };
};

export async function runLama(
  input: { image: string; mask: string },
  deps: { token: string; fetchFn?: typeof fetch; pollIntervalMs?: number; sleep?: (ms: number) => Promise<void> },
): Promise<string> {
  const fetchFn = deps.fetchFn ?? fetch;
  const sleep = deps.sleep ?? ((ms: number) => new Promise<void>((r) => setTimeout(r, ms)));
  const headers = { Authorization: `Bearer ${deps.token}`, "Content-Type": "application/json", Prefer: "wait=60" };

  const read = async (res: Response): Promise<Prediction> => {
    if (!res.ok) throw new Error(`Replicate ${res.status}: ${await res.text()}`);
    return (await res.json()) as Prediction;
  };

  let p = await read(await fetchFn("https://api.replicate.com/v1/predictions", {
    method: "POST", headers, body: JSON.stringify({ version: LAMA_VERSION, input }),
  }));
  while (p.status === "starting" || p.status === "processing") {
    if (!p.urls?.get) throw new Error("Replicate không trả urls.get");
    await sleep(deps.pollIntervalMs ?? 1000);
    p = await read(await fetchFn(p.urls.get, { headers: { Authorization: `Bearer ${deps.token}` } }));
  }
  if (p.status !== "succeeded") throw new Error(p.error ?? `Replicate ${p.status}`);
  const out = Array.isArray(p.output) ? p.output[0] : p.output;
  if (!out) throw new Error("Replicate không trả ảnh");
  return out;
}
```

`apps/web/lib/server/inpaintHandler.ts`:

```ts
import { createHash } from "node:crypto";
import { makeCachedCall, type AIError } from "@yourspace/core";

const MAX_BYTES = 3_000_000;
const STATUS: Record<AIError["kind"], number> = { Timeout: 504, RateLimited: 429, BudgetExceeded: 429, VendorError: 502, LowConfidence: 422 };

const fail = (status: number, error: AIError) => Response.json({ error }, { status });

type Deps = {
  lama: (i: { image: string; mask: string }) => Promise<string>;
  fetchOutput: (url: string) => Promise<Uint8Array>;
  limiter: { take(k: string): boolean };
  timeoutMs: number;
};

export function createInpaintHandler(deps: Deps): (req: Request) => Promise<Response> {
  const call = makeCachedCall<{ key: string; image: string; mask: string }, Uint8Array>({
    run: async ({ image, mask }) => deps.fetchOutput(await deps.lama({ image, mask })),
    cache: new Map(),
    keyOf: (i) => i.key,
    timeoutMs: deps.timeoutMs,
    label: "inpaint",
  });

  return async (req) => {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
    if (!deps.limiter.take(ip)) return fail(429, { kind: "BudgetExceeded", message: "Bạn đã dùng hết lượt xóa thử trong giờ này." });

    const form = await req.formData().catch(() => null);
    const image = form?.get("image");
    const mask = form?.get("mask");
    if (!(image instanceof Blob) || !(mask instanceof Blob)) return fail(400, { kind: "VendorError", message: "Thiếu ảnh hoặc mask." });
    if (image.size > MAX_BYTES || mask.size > MAX_BYTES) return fail(400, { kind: "VendorError", message: "Ảnh quá lớn." });

    const imageBytes = Buffer.from(await image.arrayBuffer());
    const maskBytes = Buffer.from(await mask.arrayBuffer());
    const key = createHash("sha256").update(imageBytes).update(maskBytes).digest("hex");
    const r = await call({
      key,
      image: `data:${image.type || "image/jpeg"};base64,${imageBytes.toString("base64")}`,
      mask: `data:${mask.type || "image/png"};base64,${maskBytes.toString("base64")}`,
    });
    if (!r.ok) return fail(STATUS[r.error.kind], r.error);
    return new Response(new Uint8Array(r.value), { headers: { "content-type": "image/png", "cache-control": "no-store" } });
  };
}
```

`apps/web/app/api/ai/inpaint/route.ts`:

```ts
import { createInpaintHandler } from "@/lib/server/inpaintHandler";
import { createRateLimiter } from "@/lib/server/rateLimit";
import { runLama } from "@/lib/server/replicateLama";

let handler: ((req: Request) => Promise<Response>) | null = null;

function getHandler() {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) return null;
  handler ??= createInpaintHandler({
    lama: (input) => runLama(input, { token }),
    fetchOutput: async (url) => {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Tải kết quả thất bại ${res.status}`);
      return new Uint8Array(await res.arrayBuffer());
    },
    limiter: createRateLimiter({ limit: 30, windowMs: 60 * 60 * 1000 }),
    timeoutMs: 60_000,
  });
  return handler;
}

export async function POST(req: Request) {
  const h = getHandler();
  if (!h) return Response.json({ error: { kind: "VendorError", message: "Chưa cấu hình REPLICATE_API_TOKEN" } }, { status: 503 });
  return h(req);
}
```

`apps/web/.env.example`:

```
# Token Replicate cho xóa đồ (LaMa). Chép file này thành .env.local rồi điền. Không commit .env.local.
REPLICATE_API_TOKEN=
```

Kiểm `apps/web/.gitignore` có dòng `.env*` hoặc `.env*.local`; nếu `.env*` đang chặn cả `.env.example` thì thêm dòng `!.env.example`.

- [ ] **Step 4: Chạy test và build**

Run: `pnpm --filter web test && pnpm --filter web typecheck && pnpm --filter web lint && pnpm --filter web build`
Expected: 9 test PASS; build có route `ƒ /api/ai/inpaint`.

- [ ] **Step 5: Thử thật (cần token)**

Với `REPLICATE_API_TOKEN` trong `apps/web/.env.local`, chạy `pnpm --filter web dev` rồi:

```bash
cd /home/khiemdm/orca/Your-Space-Project
python3 - <<'PY'
from PIL import Image, ImageDraw
im = Image.open("apps/web/public/golden/rooms/room-01.jpg").convert("RGB").resize((512, 384)); im.save("/tmp/ys-img.jpg", quality=90)
m = Image.new("L", im.size, 0); ImageDraw.Draw(m).rectangle([200, 200, 320, 330], fill=255); m.save("/tmp/ys-mask.png")
PY
curl -s -o /tmp/ys-out.png -w "%{http_code} %{content_type}\n" -F image=@/tmp/ys-img.jpg -F mask=@/tmp/ys-mask.png http://localhost:3000/api/ai/inpaint
```

Expected: `200 image/png`; mở `/tmp/ys-out.png` thấy vùng chữ nhật đã được lấp. Không có token: `503`. (Nếu máy không có Pillow: `pip install pillow` trong một venv tạm, hoặc bỏ qua bước này và kiểm ở Task 15.)

- [ ] **Step 6: Commit**

```bash
git add apps/web/vitest.config.ts apps/web/lib/server apps/web/app/api apps/web/.env.example apps/web/.gitignore apps/web/package.json pnpm-lock.yaml
git commit -m "feat(web): route /api/ai/inpaint gọi LaMa trên Replicate (cache, timeout, giới hạn lượt)

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 15: Web — công cụ Xóa đồ

**Files:**
- Create: `apps/web/lib/ai/inpaintClient.ts`, `apps/web/lib/erase.ts`
- Create: `apps/web/components/editor/EraseTool.tsx`, `apps/web/components/editor/MaskOverlay.tsx`
- Modify: `apps/web/app/chinh-sua/page.tsx`

**Interfaces:**
- Consumes: `warmupSam`, `encodeImage`, `decodePoints`, `onSamProgress`, `SamPoint` (Task 11); `prepareEraseMask`, `maskBBox`, `cropSquare`, `Mask`, `Result`, `AIError` từ `@yourspace/core`; `loadImage`, `canvasToBlob` (Task 10); `useEditor` (`applyErase`, `history`, `photo`, `notify`); `EditorStage` (`onErasePoint`, `children`, `showOriginal`).
- Produces:
  - `inpaint(image: Blob, mask: Blob): Promise<Result<Blob, AIError>>`
  - `eraseWithLama(originalUrl: string, mask: Mask): Promise<Result<string, AIError>>` — URL ảnh làm việc mới (object URL)
  - `type EraseObject = { points: SamPoint[]; mask: Mask | null }`
  - `useEraseSession(active: boolean): { status: "loading" | "encoding" | "ready" | "erasing"; progress: number | null; objects: EraseObject[]; mode: "add" | "remove"; setMode(m): void; addPoint(p: { x: number; y: number }): Promise<void>; nextObject(): void; removeObject(i: number): void; erase(): Promise<void> }` (export từ `EraseTool.tsx`)
  - `EraseTool` props: `{ session: ReturnType<typeof useEraseSession>; onHoldOriginal: (hold: boolean) => void }`
  - `MaskOverlay` props: `{ objects: EraseObject[]; activeIndex: number }`

- [ ] **Step 1: `inpaintClient.ts`**

```ts
"use client";
import type { AIError, Result } from "@yourspace/core";

export async function inpaint(image: Blob, mask: Blob): Promise<Result<Blob, AIError>> {
  const fd = new FormData();
  fd.set("image", image, "image.jpg");
  fd.set("mask", mask, "mask.png");
  try {
    const res = await fetch("/api/ai/inpaint", { method: "POST", body: fd });
    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as { error?: AIError } | null;
      return { ok: false, error: body?.error ?? { kind: "VendorError", message: `HTTP ${res.status}` } };
    }
    return { ok: true, value: await res.blob() };
  } catch {
    return { ok: false, error: { kind: "VendorError", message: "Mất kết nối mạng" } };
  }
}
```

- [ ] **Step 2: `lib/erase.ts`** (cắt ô, gửi, dán lại có viền mềm)

```ts
"use client";
import { cropSquare, maskBBox, type AIError, type Mask, type Result } from "@yourspace/core";
import { inpaint } from "@/lib/ai/inpaintClient";
import { canvasToBlob, loadImage } from "@/lib/image";

const canvas = (w: number, h: number) => {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
};

/** Mask (1 = xóa) → canvas trắng/đen cùng kích thước. */
function maskCanvas(mask: Mask): HTMLCanvasElement {
  const c = canvas(mask.width, mask.height);
  const ctx = c.getContext("2d")!;
  const img = ctx.createImageData(mask.width, mask.height);
  for (let k = 0; k < mask.data.length; k++) {
    const v = mask.data[k] ? 255 : 0;
    img.data[k * 4] = v; img.data[k * 4 + 1] = v; img.data[k * 4 + 2] = v; img.data[k * 4 + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  return c;
}

/**
 * Lấp từ ẢNH GỐC với mask gộp (E5-US2): cắt ô vuông quanh mask (spike), gửi LaMa, dán kết quả chỉ trong mask
 * với viền mềm 2 px lên ảnh gốc. Trả URL ảnh làm việc mới.
 */
export async function eraseWithLama(originalUrl: string, mask: Mask): Promise<Result<string, AIError>> {
  const original = await loadImage(originalUrl);
  const W = original.naturalWidth;
  const H = original.naturalHeight;
  const bbox = maskBBox(mask);
  if (!bbox) return { ok: false, error: { kind: "VendorError", message: "Chưa chọn vùng nào" } };
  const rect = cropSquare(bbox, W, H);
  const fullMask = maskCanvas(mask);

  const imgCrop = canvas(rect.w, rect.h);
  imgCrop.getContext("2d")!.drawImage(original, rect.x, rect.y, rect.w, rect.h, 0, 0, rect.w, rect.h);
  const maskCrop = canvas(rect.w, rect.h);
  maskCrop.getContext("2d")!.drawImage(fullMask, rect.x, rect.y, rect.w, rect.h, 0, 0, rect.w, rect.h);

  const r = await inpaint(await canvasToBlob(imgCrop, "image/jpeg", 0.92), await canvasToBlob(maskCrop, "image/png"));
  if (!r.ok) return r;

  const filledUrl = URL.createObjectURL(r.value);
  const filled = await loadImage(filledUrl).finally(() => URL.revokeObjectURL(filledUrl));

  // Mảnh vá = kết quả LaMa (kéo về đúng kích thước ô) chỉ giữ trong mask đã làm mềm viền.
  const patch = canvas(rect.w, rect.h);
  const pctx = patch.getContext("2d")!;
  pctx.drawImage(filled, 0, 0, rect.w, rect.h);
  const alpha = canvas(rect.w, rect.h);
  const actx = alpha.getContext("2d")!;
  actx.filter = "blur(2px)";
  actx.drawImage(maskCrop, 0, 0);
  const a = actx.getImageData(0, 0, rect.w, rect.h);
  for (let k = 0; k < a.data.length; k += 4) a.data[k + 3] = a.data[k] ?? 0; // độ sáng mask → alpha
  actx.putImageData(a, 0, 0);
  pctx.globalCompositeOperation = "destination-in";
  pctx.drawImage(alpha, 0, 0);

  const out = canvas(W, H);
  const octx = out.getContext("2d")!;
  octx.drawImage(original, 0, 0);
  octx.drawImage(patch, rect.x, rect.y);
  return { ok: true, value: URL.createObjectURL(await canvasToBlob(out, "image/jpeg", 0.92)) };
}
```

- [ ] **Step 3: `MaskOverlay.tsx`**

```tsx
"use client";
import { useEffect, useRef } from "react";
import type { EraseObject } from "./EraseTool";

/** Vẽ mọi vùng đang chọn lên trên ảnh: món đang chọn trắng 45%, món khác trắng 28%; kèm chấm điểm chạm. */
export function MaskOverlay({ objects, activeIndex }: { objects: EraseObject[]; activeIndex: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const first = objects.find((o) => o.mask)?.mask;
  useEffect(() => {
    const c = ref.current;
    if (!c || !first) return;
    c.width = first.width;
    c.height = first.height;
    const ctx = c.getContext("2d")!;
    const img = ctx.createImageData(first.width, first.height);
    objects.forEach((o, idx) => {
      if (!o.mask) return;
      const alpha = idx === activeIndex ? 115 : 72;
      for (let k = 0; k < o.mask.data.length; k++) {
        if (!o.mask.data[k]) continue;
        img.data[k * 4] = 255; img.data[k * 4 + 1] = 255; img.data[k * 4 + 2] = 255;
        img.data[k * 4 + 3] = Math.max(img.data[k * 4 + 3] ?? 0, alpha);
      }
    });
    ctx.putImageData(img, 0, 0);
  }, [objects, activeIndex, first]);
  return (
    <div className="absolute inset-0 pointer-events-none">
      {first && <canvas ref={ref} className="absolute inset-0 size-full" />}
      {objects.flatMap((o, idx) => o.points.map((p, j) => (
        <span key={`${idx}-${j}`} aria-hidden
          className={`absolute -translate-x-1/2 -translate-y-1/2 size-5 rounded-full border-2 border-white text-[12px] leading-4 text-center font-bold ${p.positive ? "bg-accent text-on-accent" : "bg-destructive text-white"}`}
          style={{ left: `${p.x * 100}%`, top: `${p.y * 100}%` }}>{p.positive ? "+" : "−"}</span>
      )))}
    </div>
  );
}
```

- [ ] **Step 4: `EraseTool.tsx`** (phiên xóa + panel)

```tsx
"use client";
import { prepareEraseMask, type Mask } from "@yourspace/core";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { decodePoints, encodeImage, onSamProgress, warmupSam, type SamPoint } from "@/lib/ai/samClient";
import { eraseWithLama } from "@/lib/erase";
import { useEditor } from "@/lib/store";

export type EraseObject = { points: SamPoint[]; mask: Mask | null };

const ERROR_TEXT: Record<string, string> = {
  BudgetExceeded: "Hết lượt xóa thử trong giờ này",
  RateLimited: "Dịch vụ đang bận, thử lại sau ít phút",
  Timeout: "Xóa quá lâu, thử lại với vùng nhỏ hơn",
};

export function useEraseSession(active: boolean) {
  const { history, photo, applyErase, notify } = useEditor();
  const workingUrl = history?.present.workingUrl ?? null;
  const [status, setStatus] = useState<"loading" | "encoding" | "ready" | "erasing">("loading");
  const [progress, setProgress] = useState<number | null>(null);
  const [objects, setObjects] = useState<EraseObject[]>([]);
  const [mode, setMode] = useState<"add" | "remove">("add");

  useEffect(() => onSamProgress((p) => setProgress(p.total ? p.loaded / p.total : null)), []);

  useEffect(() => {
    if (!active || !workingUrl) return;
    let cancelled = false;
    (async () => {
      setStatus("loading");
      await warmupSam();
      if (cancelled) return;
      setProgress(null);
      setStatus("encoding");
      await encodeImage(workingUrl); // chọn trên đúng ảnh người dùng đang thấy
      if (!cancelled) { setObjects([]); setStatus("ready"); }
    })().catch(() => { if (!cancelled) notify("Không tải được công cụ chọn đồ · thử tải lại trang"); });
    return () => { cancelled = true; };
  }, [active, workingUrl, notify]);

  const addPoint = useCallback(async (p: { x: number; y: number }) => {
    if (status !== "ready") return;
    const positive = mode === "add";
    const list = objects.length === 0 ? [{ points: [], mask: null }] : objects;
    const idx = list.length - 1;
    const current = list[idx]!;
    if (!positive && current.points.length === 0) return; // điểm Bớt cần một món đang chọn
    const points = [...current.points, { ...p, positive }];
    const mask = await decodePoints(points);
    setObjects([...list.slice(0, idx), { points, mask }]);
  }, [status, mode, objects]);

  const nextObject = () => setObjects((o) => (o.length && o[o.length - 1]!.mask ? [...o, { points: [], mask: null }] : o));
  const removeObject = (i: number) => setObjects((o) => o.filter((_, k) => k !== i));

  const erase = useCallback(async () => {
    const masks = objects.flatMap((o) => (o.mask ? [o.mask] : []));
    if (!photo || masks.length === 0) return;
    setStatus("erasing");
    const union = prepareEraseMask(masks, history?.present.eraseMask ?? null);
    const r = await eraseWithLama(photo.url, union);
    if (!r.ok) {
      notify(ERROR_TEXT[r.error.kind] ?? "Xóa chưa được · thử lại hoặc chọn vùng nhỏ hơn");
      setStatus("ready");
      return;
    }
    applyErase(r.value, union); // workingUrl đổi → depth và SAM tự chạy lại
    notify("Đã xóa · giữ nút Trước để so sánh");
  }, [objects, photo, history, applyErase, notify]);

  return { status, progress, objects, mode, setMode, addPoint, nextObject, removeObject, erase };
}

export function EraseTool({ session, onHoldOriginal }: { session: ReturnType<typeof useEraseSession>; onHoldOriginal: (hold: boolean) => void }) {
  const { status, progress, objects, mode, setMode, nextObject, removeObject, erase } = session;
  const selected = objects.filter((o) => o.mask).length;
  if (status === "loading" || status === "encoding") {
    return (
      <p className="text-[15px] text-muted-foreground" role="status">
        {status === "loading" ? `Đang tải công cụ chọn đồ${progress !== null ? ` ${Math.round(progress * 100)}%` : "…"}` : "Đang chuẩn bị ảnh để chạm chọn…"}
      </p>
    );
  }
  return (
    <div className="flex flex-col gap-3">
      <p className="text-[15px] leading-5">Chạm vào món đồ cũ muốn xóa. Vùng trắng là vùng sẽ xóa — chạm thêm để sửa.</p>
      <div className="flex items-center gap-2 flex-wrap">
        <div className="inline-flex bg-muted rounded-pill p-1">
          {(["add", "remove"] as const).map((m) => (
            <button key={m} type="button" aria-pressed={mode === m} onClick={() => setMode(m)}
              className={`min-h-[40px] px-4 rounded-pill text-[15px] font-semibold ${mode === m ? "bg-accent text-on-accent" : ""}`}>
              {m === "add" ? "Thêm" : "Bớt"}
            </button>
          ))}
        </div>
        <Button variant="secondary" onClick={nextObject} disabled={!objects.length || !objects[objects.length - 1]!.mask}>Chọn món khác</Button>
        <button type="button" className="min-h-[44px] px-3 rounded-pill bg-muted text-[15px] font-semibold"
          onPointerDown={() => onHoldOriginal(true)} onPointerUp={() => onHoldOriginal(false)} onPointerLeave={() => onHoldOriginal(false)}>
          Trước
        </button>
      </div>
      {objects.length > 0 && (
        <ul className="flex gap-2 flex-wrap">
          {objects.map((o, i) => o.mask && (
            <li key={i}><button type="button" onClick={() => removeObject(i)} className="min-h-[36px] px-3 rounded-pill bg-muted text-[13px] font-semibold">Món {i + 1} ×</button></li>
          ))}
        </ul>
      )}
      <Button full onClick={() => void erase()} disabled={selected === 0 || status === "erasing"}>
        {status === "erasing" ? "Đang xóa…" : selected ? `Xóa ${selected} món` : "Chọn món để xóa"}
      </Button>
      <p className="text-[12px] text-muted-foreground">Ảnh được gửi lên hệ thống để xử lý và xóa ngay sau đó. Kết quả chưa ưng: bấm Hoàn tác hoặc chọn vùng nhỏ hơn.</p>
    </div>
  );
}
```

Lưu ý ở chế độ Xóa đồ, `EstimateBar` vẫn hiện nút chính "Xem & mua" → màn có hai nút chính. Ở Step 5 **ẩn `EstimateBar` khi `mode === "erase"`**.

- [ ] **Step 5: Ghép vào trang**

Trong `apps/web/app/chinh-sua/page.tsx`:
1. Import `EraseTool`, `useEraseSession`, `MaskOverlay`.
2. Thêm state: `const [holdOriginal, setHoldOriginal] = useState(false);` và `const erase = useEraseSession(mode === "erase");`
3. Đổi `EditorStage`:

```tsx
        <EditorStage mode={mode} occluder={occluder} lighting={lighting} showOriginal={holdOriginal}
          onErasePoint={(p) => void erase.addPoint(p)}>
          {mode === "erase" && <MaskOverlay objects={erase.objects} activeIndex={erase.objects.length - 1} />}
        </EditorStage>
```

4. Phần dưới khung ảnh:

```tsx
      <section className="w-full max-w-xl mx-auto px-4 py-4 flex-1">
        {mode === "erase" ? <EraseTool session={erase} onHoldOriginal={setHoldOriginal} /> : selectedUid ? <ItemPanel onBuy={setBuyIds} /> : <Tray />}
      </section>
      {mode === "place" && <EstimateBar onOpen={() => setBuyIds(allIds)} />}
```

- [ ] **Step 6: Kiểm tay** (cần `REPLICATE_API_TOKEN`)

`pnpm --filter web typecheck && pnpm --filter web lint`, rồi `pnpm --filter web dev`:
1. Bấm "Xóa đồ": chip tiến trình tải model, rồi "Chạm vào món đồ cũ…".
2. Chạm vào một ghế/bàn: vùng trắng phủ đúng món (hoặc gần đúng). Chế độ Bớt: chạm vào phần lấn → vùng co lại. "Chọn món khác" → chọn món thứ hai.
3. "Xóa 2 món": sau vài giây ảnh đổi, chip "Đã xóa…". Giữ "Trước" → thấy ảnh gốc, thả ra → ảnh đã xóa.
4. Sang "Bày đồ", đặt sofa vào chỗ vừa xóa: không bị "bóng ma" của đồ cũ che (depth đã chạy lại trên ảnh mới).
5. Hoàn tác → ảnh quay về trước khi xóa; Làm lại → ảnh đã xóa.
6. Xóa thêm một món nữa ở lần sau: các vùng xóa trước vẫn sạch (lấp lại từ ảnh gốc với mask gộp).
7. Tắt mạng (DevTools → Offline) rồi Xóa: chip lỗi, ảnh giữ nguyên.
Ghi lại vào mô tả commit: SlimSAM chọn đúng món sau 1 chạm khoảng bao nhiêu / 10 món thử (để so với spike 47,7% của SAM ViT-B — spec §9 rủi ro 1).

- [ ] **Step 7: Commit**

```bash
git add apps/web/lib/ai/inpaintClient.ts apps/web/lib/erase.ts apps/web/components/editor apps/web/app/chinh-sua
git commit -m "feat(web): xóa đồ cũ — chạm chọn bằng SlimSAM, lấp bằng LaMa, so sánh trước/sau

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 16: Web — sheet mua và thu lead

**Files:**
- Create: `apps/web/components/editor/BuySheet.tsx`, `apps/web/components/editor/LeadForm.tsx`
- Modify: `apps/web/app/chinh-sua/page.tsx`

**Interfaces:**
- Consumes: `Sheet`, `Button` (Task 9); `estimate`, `normalizeVnPhone` từ `@yourspace/core`; `MODELS`, `SUPPLIERS` (Task 8); `formatVND`.
- Produces:
  - `BuySheet` props: `{ productIds: string[] | null; onClose: () => void }` — `null` = đóng.
  - `LeadForm` props: `{ productIds: string[]; totalVND: number; onDone: () => void }`

- [ ] **Step 1: `LeadForm.tsx`**

```tsx
"use client";
import { normalizeVnPhone } from "@yourspace/core";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { formatVND } from "@/lib/format";

/** M1: chưa có link affiliate thật → để lại SĐT. Bản demo KHÔNG gửi, KHÔNG lưu. */
export function LeadForm({ productIds, totalVND, onDone }: { productIds: string[]; totalVND: number; onDone: () => void }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-[17px] leading-[22px]">Cảm ơn {name.trim() || "bạn"}. Nhà cung cấp sẽ gọi lại để xác nhận {productIds.length} món, tổng {formatVND(totalVND)}.</p>
        <p className="text-[13px] text-muted-foreground">Bản demo · thông tin không được gửi đi.</p>
        <Button full onClick={onDone}>Quay lại phòng</Button>
      </div>
    );
  }
  return (
    <form className="flex flex-col gap-4" noValidate onSubmit={(e) => {
      e.preventDefault();
      if (!normalizeVnPhone(phone)) { setError("Số điện thoại chưa đúng. Nhập số di động 10 số, ví dụ 0912 345 678."); return; }
      setError(null);
      setSent(true);
    }}>
      <label className="flex flex-col gap-1">
        <span className="text-[15px] font-semibold">Tên của bạn</span>
        <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name"
          className="min-h-11 px-4 py-3 rounded-[8px] border border-border-strong text-[17px] focus:outline-2 focus:outline-ring" />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-[15px] font-semibold">Số điện thoại</span>
        <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" autoComplete="tel" aria-invalid={!!error}
          className="min-h-11 px-4 py-3 rounded-[8px] border border-border-strong text-[17px] focus:outline-2 focus:outline-ring" />
        {error && <span className="text-[13px] text-destructive-text" role="alert">⚠ {error}</span>}
      </label>
      <Button full type="submit">Để lại số để được gọi lại</Button>
      <p className="text-[12px] text-muted-foreground">Bản demo · thông tin không được gửi đi.</p>
    </form>
  );
}
```

`Button` mặc định `type="button"` rồi mới trải `...rest`, nên `type="submit"` truyền vào sẽ ghi đè — đúng ý.

- [ ] **Step 2: `BuySheet.tsx`**

```tsx
"use client";
import { estimate } from "@yourspace/core";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Sheet";
import { MODELS, SUPPLIERS } from "@/lib/catalog";
import { formatVND } from "@/lib/format";
import { LeadForm } from "./LeadForm";

export function BuySheet({ productIds, onClose }: { productIds: string[] | null; onClose: () => void }) {
  const [leadFor, setLeadFor] = useState<string[] | null>(null);
  if (!productIds) return null;
  const e = estimate(productIds, MODELS, SUPPLIERS);
  const lead = leadFor ? estimate(leadFor, MODELS, SUPPLIERS) : null;
  const close = () => { setLeadFor(null); onClose(); };
  return (
    <Sheet open title={leadFor ? "Để lại số điện thoại" : "Mua đồ trong phòng"} onClose={close}>
      {lead && leadFor ? (
        <LeadForm productIds={leadFor} totalVND={lead.totalVND} onDone={close} />
      ) : (
        <div className="flex flex-col gap-6">
          {e.groups.map((g) => (
            <section key={g.supplier.id} className="flex flex-col gap-2">
              <h3 className="text-[15px] font-semibold">{g.supplier.name} · giao {g.supplier.deliveryMinDays}–{g.supplier.deliveryMaxDays} ngày</h3>
              <ul className="flex flex-col divide-y divide-border">
                {g.lines.map((l) => (
                  <li key={l.model.id} className="py-2 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[15px] font-semibold">{l.model.name}{l.qty > 1 ? ` × ${l.qty}` : ""}</p>
                      <p className="text-[15px] font-semibold text-accent-text tabular">{formatVND(l.lineVND)}</p>
                    </div>
                    <Button variant="secondary" onClick={() => setLeadFor(Array(l.qty).fill(l.model.id))}>Mua</Button>
                  </li>
                ))}
              </ul>
            </section>
          ))}
          <Button full onClick={() => setLeadFor(productIds)}>Mua cả bộ · {formatVND(e.totalVND)}</Button>
          <p className="text-[12px] text-muted-foreground">Giá mẫu. Một lần đặt cho nhiều nhà cung cấp; mỗi nhà cung cấp gọi lại riêng.</p>
        </div>
      )}
    </Sheet>
  );
}
```

- [ ] **Step 3: Ghép vào trang**

Trong `apps/web/app/chinh-sua/page.tsx`: import `BuySheet`, thay dòng `{buyIds && null}` (và chú thích phía trên nó) bằng:

```tsx
      <BuySheet productIds={buyIds} onClose={() => setBuyIds(null)} />
```

- [ ] **Step 4: Kiểm tay**

`pnpm --filter web typecheck && pnpm --filter web lint`, `pnpm --filter web dev`:
1. Đặt 3 món của 2 nhà cung cấp → "Xem & mua": hai nhóm, tổng đúng bằng thanh dự toán.
2. "Mua" một món → form; nhập `0212345678` → báo lỗi có icon; nhập `0912 345 678` → cảm ơn + "Bản demo · thông tin không được gửi đi" → "Quay lại phòng" về đúng trình chỉnh sửa, món vẫn còn.
3. Từ panel món, nút "Mua" mở sheet chỉ có món đó.
4. DevTools → Network: không có request nào khi gửi form.

- [ ] **Step 5: Commit**

```bash
git add apps/web/components/editor/BuySheet.tsx apps/web/components/editor/LeadForm.tsx apps/web/app/chinh-sua/page.tsx
git commit -m "feat(web): sheet mua lẻ / cả bộ theo nhà cung cấp + form để lại SĐT (demo, không gửi)

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 17: Kiểm toàn bộ, chọn ảnh mẫu, tài liệu chạy

**Files:**
- Modify: `apps/web/README.md`, `apps/web/lib/catalog.ts` (`SAMPLE_ROOMS`, `baseYawRad` nếu cần), `docs/superpowers/specs/2026-10-05-web-pitch-demo-design.md` (dòng trạng thái)

- [ ] **Step 1: Kiểm máy**

Run: `pnpm test && pnpm typecheck && pnpm lint && pnpm --filter web build`
Expected: mọi test core + web PASS, typecheck/lint sạch, build qua. Lỗi lint `react-hooks/*` (set-state-in-effect, refs, immutability): sửa theo hướng dẫn của rule (setState trong callback bất đồng bộ, không đọc `ref.current` khi render, không sửa giá trị trả về từ hook — clone rồi sửa bản clone), không tắt rule.

- [ ] **Step 2: Đi trọn vòng P0 trên 6 ảnh mẫu**

Với mỗi ảnh trong `SAMPLE_ROOMS`: Thử phòng → chân trời → xóa 1 món → đặt sofa vào chỗ vừa xóa + 2 món khác → dự toán → Mua cả bộ → lead. Ghi bảng kết quả (xóa sạch? đặt đồ tin được? che khuất đúng?) vào mô tả commit. Ảnh nào xóa ra xấu rõ thì thay bằng ảnh khác trong `public/golden/rooms/` (room-01…14), giữ 6 ảnh.

- [ ] **Step 3: Ảnh điện thoại thật**

Mở dev server từ điện thoại (`pnpm --filter web dev -- --hostname 0.0.0.0`, truy cập qua IP LAN; nếu trình duyệt điện thoại chặn WebGPU/WASM threads trên HTTP thì dùng `scripts/https-proxy.mjs` có sẵn trong repo). Chụp một phòng thật, đi trọn vòng. Ghi: thời gian tải model lần đầu trên 4G/Wi-Fi, có lỗi bộ nhớ không.

- [ ] **Step 4: README**

Thêm vào đầu `apps/web/README.md`:

```md
# YourSpace — demo web (pitch)

Vòng lõi M1: Phong cách → Thử phòng (ảnh + chân trời) → Trình chỉnh sửa (xóa đồ, đặt đồ 3D, dự toán) → Mua (để lại SĐT).
Spec: `docs/superpowers/specs/2026-10-05-web-pitch-demo-design.md`.

## Chạy

    pnpm install
    cp apps/web/.env.example apps/web/.env.local   # điền REPLICATE_API_TOKEN để dùng Xóa đồ
    pnpm dev                                        # http://localhost:3000

- Depth (Depth Anything V2 Small) và chạm chọn (SlimSAM) chạy trong trình duyệt; lần đầu tải ~65 MB model.
- Xóa đồ gọi LaMa trên Replicate qua `/api/ai/inpaint` (giới hạn 30 lượt/IP/giờ).
- Dựng lại mô hình 3D: `pnpm --filter web build:models`. Nguồn và giấy phép: `public/models/CREDITS.md`.
- Trang thử nghiệm cũ: `/dev`.

Bản demo: giá, nhà cung cấp là dữ liệu mẫu; form SĐT không gửi đi đâu.
```

- [ ] **Step 5: Cập nhật trạng thái spec**

Trong dòng trạng thái đầu spec, đổi `**người dùng đã duyệt thiết kế trong brainstorm**` thành `**đã triển khai trên `demo/web-pitch` (2026-10-…)**` với ngày thật.

- [ ] **Step 6: Commit**

```bash
git add apps/web/README.md apps/web/lib/catalog.ts docs/superpowers/specs/2026-10-05-web-pitch-demo-design.md
git commit -m "docs(web): hướng dẫn chạy demo pitch + kết quả kiểm trên ảnh mẫu và điện thoại

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

## Self-review (đã chạy khi viết kế hoạch)

**Độ phủ spec:**
§1 màn & điều hướng → Task 9, 10, 12–16 · §2.1 camera/EXIF/tư thế → Task 2, 10 · §2.2 ảnh trong WebGL → Task 12 · §2.3 che khuất + tính lại sau xóa + F5 → Task 3, 11, 13, 15 · §2.4 bóng & ánh sáng → Task 4, 12, 13 · §2.5 thao tác món, không tỷ lệ từng món, cỡ phòng → Task 12, 13 · §3.1 chạm chọn SlimSAM → Task 11, 15 · §3.2 lấp cloud, mask gộp từ ảnh gốc, giới hạn lượt, trước/sau → Task 5, 7, 14, 15 · §3.3 consent → Task 10, 15 · §4 dữ liệu & mô hình → Task 1, 8 · §5 mua/lead → Task 6, 16 · §7 F1–F6 → Task 13, 15 · §8 kiểm thử → mọi task + Task 17 · §9 rủi ro → Task 15 Step 6, Task 17.

**Kiểu thống nhất:** `PlacedItem`/`EditorDoc`/`CameraSetup` (Task 10) dùng ở 12–16; `DisparityMap`/`FloorFit` (Task 3) ở 11, 13; `Mask` (Task 5) ở 11, 15; `SamPoint` (Task 11) ở 15; `PhotoLighting` (Task 4) ở 12, 13; `makeCachedCall` (Task 7) ở 11, 14.
