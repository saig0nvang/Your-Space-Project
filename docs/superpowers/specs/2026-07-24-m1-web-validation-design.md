---
derives_from: [D3@7fbc47fb, D3b@4248a41d, D4@bb7f1ffe, D5@15cdc73a]
---
# YourSpace M1 — Web Validation — Design Spec

> Ngày: 2026-07-24 · Branch: `m1-build` · Trạng thái: **Draft chờ founder duyệt**
> Nguồn quyết định sản phẩm: `Product_research/Decisions_Log_2026-07-23.md` (D1–D6), `Product/PRD.md`.
> Spec này = nguồn chân lý **kỹ thuật** cho M1. Thiết kế lại từ đầu (không dựa PoC cũ), tổng hợp từ 3 kiến trúc độc lập + nghiên cứu công nghệ (Depth Anything V2 ONNX, Replicate LaMa/SAM, occlusion Three.js, ước lượng FOV/sàn từ 1 ảnh).

---

## 0. Mục tiêu & phi mục tiêu

**Mục tiêu M1:** chứng minh giả thuyết lõi — *người dùng thử đặt đồ nội thất vào ảnh phòng thật của họ → nảy sinh ý định mua*. Web-first, ~4–6 tuần, solo (Claude viết phần lớn code).

**Chỉ số thành công (theo PRD §10.5, OKR Quý 1):**
- Activation (hoàn thành: chọn style → upload → đặt ≥1 món) ≥ 30%
- Save/Share ≥ 30% · Click-to-Buy ≥ 15% · Return D7 ≥ 25%
- AOV base ~10tr (15tr "mua cả không gian" = upside)

**Phi mục tiêu M1 (đẩy sang M2+):** đăng nhập/tài khoản; escrow/thanh toán in-app; mobile native; onboard supplier thật; inventory thật; kết nối chuyên gia đầy đủ (M1 chỉ thu-lead); cộng đồng; AR/LiDAR.

---

## 1. Quyết định nền (chốt trong brainstorm 2026-07-24)

| # | Quyết định |
|---|---|
| Ai code | Claude viết phần lớn, founder review/định hướng → tối ưu stack cho độ tin cậy + dễ bảo trì |
| Persistence | **Stateless, không login.** Save/Share = export PNG (+ optional state trong URL) |
| Catalog | **Model 3D free** (Sketchfab/CGTrader/Poly) + **giá tham khảo thật + link affiliate** tới sản phẩm có sẵn. 16–24 model, **3 phong cách: Japandi · Mid-Century · Bauhaus** (chốt 2026-07-24) |
| Xóa đồ cũ | **CÓ, bản gọn trong M1**: chọn đồ cũ → SAM (cloud) mask → LaMa (cloud) inpaint. Fallback: reveal pixel gốc |
| Depth | **Server-side/cloud cho M1** (1 lần/ảnh, cache theo hash). ⚠️ *Lệch PRD §10.7 "on-device" — xem §15.* On-device = M2/tầm nhìn |
| Platform | Web-first (deploy web/PWA, không App Store ở M1). Mobile native = M2 |

---

## 2. Kiến trúc tổng thể

```
Monorepo (pnpm workspaces)
├── packages/core   ← domain thuần TS, KHÔNG React (tái dùng nguyên vẹn ở M2 mobile)
│     catalog · scene(calibration/placement/occlusion) · pricing · checkout · ai/types · analytics
└── apps/web        ← Next.js (App Router) + React Three Fiber
      ├── client: R3F canvas + UI  (toàn bộ compositing/placement math chạy client)
      └── server: API Routes → AIGateway (proxy AI, giấu key, cache, ratelimit, budget)

External (managed, low-ops):
  Replicate (depth/segment/inpaint)  ·  Supabase (leads + analytics events)
  Upstash Redis (cache + rate limit)  ·  Vercel Blob / R2 (ảnh tạm zero-retention + .glb CDN)
  Deploy: Vercel
```

**Nguyên tắc xuyên suốt:** mọi thứ *đắt hoặc bí mật hoặc sẽ đổi ở M2* (AI, checkout, nguồn catalog) nằm **sau một interface** → M1 dùng adapter đơn giản, M2 thay adapter, consumer không đổi.

---

## 3. Tech stack

| Lớp | Chọn | Lý do |
|---|---|---|
| Repo | Monorepo pnpm: `packages/core` + `apps/web` | Core thuần TS → M2 RN import lại, chỉ viết lại lớp render |
| Framework | **Next.js (App Router) + TypeScript** | API Routes = backend mỏng giấu key; Vercel deploy 1-click |
| 3D | **React Three Fiber + three.js + drei** | Declarative (Claude sửa dễ); `<ContactShadows>`, loaders, gizmo sẵn; shader qua `onBeforeCompile` |
| State | **Zustand** (1 store) | Tối giản, chạy được cả RN (tái dùng M2) |
| Styling | **Tailwind CSS** | Nhanh, nhất quán |
| DB | **Supabase (Postgres)** — M1 chỉ leads + events | Chính là DB M2 lớn lên (users/orders/escrow); không migrate sau |
| Cache/ratelimit | **Upstash Redis** (serverless) | Cache AI theo hash + token-bucket per-IP (stateless) |
| Blob | **Vercel Blob / Cloudflare R2** | Ảnh user zero-retention TTL; `.glb`/thumb CDN |
| AI | **Replicate** (hosted) | Trả theo lượt, không nuôi GPU (D3). Nghiên cứu: LaMa ~$0.0025/lượt |
| Test | **Vitest** + **Playwright** | Unit/integration + e2e |
| Analytics | PostHog (client) hoặc `/api/events`→Supabase | Đo funnel |

---

## 4. Mô hình render/compositing (phần cốt lõi quyết định "wow")

Một scene R3F. Ảnh phòng phẳng làm nền **trong cùng WebGL context** (không overlay CSS — để bóng đổ lên ảnh + occlusion đúng framebuffer). Đồ 3D render đè qua camera ảo khớp phối cảnh ảnh.

**Pipeline calibration (1 lần khi upload):**
1. **FOV camera:** đọc **EXIF** (focal length + sensor) khi có → FOV chính xác. Thiếu EXIF → fallback ~60° dọc / ~65° ngang.
2. **Depth map:** Depth Anything V2 (server-side) → depth *tương đối*.
3. **Fit mặt sàn:** back-project depth thành point cloud → **RANSAC** lấy mặt phẳng ngang (normal hướng lên) = sàn + suy chiều cao camera.

**Insight bền nhất — TÁCH 2 bài toán** (đừng tin depth mét tuyệt đối, vì Depth Anything Small là affine-invariant):
- **Occlusion** chỉ cần *thứ tự* depth → dùng relative depth trực tiếp (rất bền).
- **Scale** cố định bằng **mặt sàn + giả định chiều cao camera ~1.4m**; cho **1 slider "scale/chiều cao máy"** để user hiệu chỉnh sai số hệ thống (hoặc tap 1 vật tham chiếu: cửa/ổ điện).

**Đặt đồ:**
4. Kéo-thả tại pixel (x,y) → **raycast xuống mặt sàn** → world position → đồ **luôn chạm sàn** (không lơ lửng).
5. Đồ có **kích thước thật (mét)** từ catalog + camera intrinsics đúng → foreshortening/scale-theo-khoảng-cách **tự đúng**, không cần scale tay.
6. Xoay **chỉ trục Y** (D4). Override thủ công: kéo/scale/xoay.

**Occlusion shader (đòn bẩy chân thực lớn):** nạp depth map thành **DepthTexture** uniform; trong fragment shader của đồ (inject `onBeforeCompile`): so `cameraDepth(fragment)` vs `sample(photoDepth, screenUV)`; nếu hình học thật ở trước → `discard`. Feather ngưỡng để giảm viền halo. → sofa tự khuất sau quầy/tường/cạnh phòng.

**Grounding (đòn bẩy rẻ & hiệu quả nhất):** `<ContactShadows>` (vệt tối mềm dưới đế đồ) + **exposure match** (tính luminance ảnh → set `toneMappingExposure`) để đồ không "sáng CGI" + ambient tint xấp xỉ màu phòng.

**Thứ tự layer:** `[1] ảnh gốc → [2] patch inpaint (chỗ đã xóa đồ cũ, layer 2D độc lập) → [3] đồ 3D (canvas trong suốt, có occlusion)`.

**Fallback (decision-gate D4):** confidence thấp → bỏ auto-calibrate/auto-scale → **manual mode** (camera mặc định + user tự kéo/scale/xoay-Y, vẫn snap sàn + contact shadow). Luôn chạy 100%.

---

## 5. AI pipeline + AIGateway

| Tác vụ | Model | Chạy đâu | Tần suất |
|---|---|---|---|
| Depth | Depth Anything V2 (Replicate) | **Server**, cache theo SHA-256 ảnh | 1×/ảnh |
| Segmentation | SAM / MobileSAM (click-based) | Server (on-demand) | khi xóa đồ |
| Inpainting | LaMa (Replicate); SDXL-inpaint cho vùng lớn | Server (on-demand), cache theo (hash ảnh+mask) | khi xóa đồ |

**`AIGateway`** — 1 module server bọc TẤT CẢ external AI call (điểm kiểm soát chi phí/lỗi tập trung):

| Cơ chế | Cách làm |
|---|---|
| Giấu key | Key chỉ trong server env; browser gọi `/api/*`, không bao giờ gọi thẳng vendor |
| Cache | Content-addressed (Upstash): depth theo hash ảnh, inpaint theo (hash ảnh+mask). Hit = 0đ |
| Rate limit | Token-bucket per-IP (Upstash) — chống abuse đốt budget (vì stateless) |
| Timeout + retry | Timeout (depth ~20s, inpaint ~30s) + 1 retry backoff cho 5xx/429 |
| Budget cap | Bộ đếm chi/ngày; vượt ngưỡng → **tắt AI mềm** (chuyển manual mode) thay vì cháy túi |
| Idempotency | Dedupe request trùng đang bay (double-click không tính tiền 2 lần) |
| Zero-retention | Ảnh xử lý xong xóa ngay + TTL blob; consent thật ("ảnh gửi lên xử lý & xóa ngay" — D3/NĐ13) |

Trả `Result<T, AIError>` với lỗi có kiểu: `Timeout | RateLimited | BudgetExceeded | VendorError | LowConfidence` → client map từng lỗi sang fallback UX.

---

## 6. Backend / API routes (footprint tối thiểu)

`/api/depth` (ảnh → depth + calibration hints) · `/api/segment` + `/api/inpaint` (hoặc gộp `/api/remove`) · `/api/lead` (→ Supabase) · `/api/events` (analytics). Catalog = static JSON, không endpoint. **Không auth, không session, không user DB.**

---

## 7. Module breakdown (interface rõ)

### `packages/core` (thuần TS — tái dùng M2)
| Module | Làm gì | Interface (pure) |
|---|---|---|
| `catalog` | Type + load + validate | `FurnitureModel{id,name,styleId,dimsM,priceVND,buyUrl,glbUrl,thumb,supplierId?}`, `Style`; `loadCatalog(source)` |
| `catalog/CatalogSource` | **Interface** nguồn | `getModels(): FurnitureModel[]` — M1 `StaticSource`, M2 `SupabaseSource` |
| `scene/SceneCalibration` | Camera+sàn từ depth | `calibrate(depthMap, meta) → {camera, floorPlane, confidence}` |
| `scene/Placement` | Đặt đồ chạm sàn + scale | `placeOnFloor(screenXY, calib, dimsM) → Transform` |
| `scene/Occlusion` | Uniforms occlusion | `buildOcclusionParams(depthMap, calib)` |
| `pricing/Estimator` | Tổng dự toán | `total(items) → {lineItems, totalVND}` |
| `checkout/Checkout` | **Interface** mua | `checkout(cart) → {mode:'affiliate'\|'escrow'}` — M1 `AffiliateCheckout` |
| `ai/types` | DTO + `AIError` union | — |
| `analytics/events` | Schema event có kiểu | `StyleSelected｜PhotoUploaded｜ItemPlaced｜ScaleOverride｜ItemRemoved｜InpaintDone｜BuyClicked｜LeadSubmitted` |

### `apps/web`
UI: `Uploader`(+consent) · `StylePalette` · `CatalogDrawer` · `RoomCanvas`(R3F) · `PlacementController` · `RemovalTool` · `EstimatePanel` · `LeadCapture` · `ExportShare` · `state/store`(Zustand).
Server: `/api/*` → `AIGateway`.

> UI/UX chi tiết (design system, layout, typography, motion) = **pass thiết kế riêng SAU spec này** (founder đã chọn: spec trước → design pass sau).

---

## 8. Data flow qua funnel

```
1. StylePalette → chọn style               [evt style_selected]
2. Uploader → ảnh + consent → /api/depth → calibration (camera/sàn/scale)  [evt photo_uploaded]
3. RoomCanvas: ảnh nền + camera khớp + mặt sàn + occlusion texture + contact shadow
4. CatalogDrawer lọc theo style → kéo-thả → PlacementController
      raycast sàn → auto-scale → chạm sàn → occlusion   [evt item_placed / scale_override]
5. (tùy chọn) RemovalTool: click đồ cũ → /api/remove → patch nền  (fallback reveal gốc)  [evt item_removed]
6. EstimatePanel: cộng giá real-time → CTA "Xem/Mua" → affiliate   [evt buy_clicked]
7. LeadCapture (SĐT tư vấn) → /api/lead  |  ExportShare → PNG      [evt lead_submitted / save_share]
```
Ảnh sống trong bộ nhớ browser (object URL); chỉ lên cloud tạm cho AI rồi xóa. Không state server tồn tại giữa phiên.

---

## 9. Error handling & fallbacks (map PRD F1–F6)

| Tình huống | Xử lý |
|---|---|
| Ảnh kém (mờ/tối/góc lạ) | Confidence thấp → manual mode + tip + nút chụp lại (F4) |
| Depth sai (đồ lơ lửng) | Snap về đường sàn, kéo tự do, guideline grid (F2) |
| Scale sai | Handle resize + log `scale_override` (F1) |
| Inpaint xấu/fail | **Reveal pixel gốc** (giữ ảnh gốc ở client → xóa đồ KHÔNG hard-fail) + nút "Khôi phục" (F3) |
| AI timeout/ratelimit/budget | Session degrade → manual placement, không block |
| `.glb` lỗi/404 | Placeholder box đúng dims + retry; validate catalog lúc build (zod) |
| Thiết bị yếu/không WebGL | Detect → fallback 2D/thông báo; core vẫn chạy (F5) |
| Ảnh quá lớn | Downscale client (~1600px) trước upload |
| Double-click AI | Idempotency dedupe |
| Undo/redo | Command history trong store ≥10 bước (F6) |

Bất biến (PRD): AI chỉ **gợi ý**; mọi thay đổi canvas cần thao tác chủ động của user; low-confidence → manual, không đoán bừa.

---

## 10. Spike tuần 1 — decision gate (LÀM TRƯỚC MỌI THỨ)

**Rủi ro #1:** monocular depth từ 1 ảnh → đặt đồ **chạm sàn + đúng scale + occlusion** đủ tin cậy trên ảnh điện thoại thật. Nếu "gãy" → hỏng chính phép validate.

**Spike (bỏ qua UI, thẳng vào lõi):**
1. Gom **15–20 ảnh phòng VN thật** (sáng/tối, rộng/hẹp, gọn/bừa, có vật tiền cảnh).
2. Dựng tối thiểu: `/api/depth` → `calibrate` → `placeOnFloor` 1 sofa → occlusion shader + contact shadow.
3. Chấm **rubric believability (1–5)** × 5 tiêu chí: scale đúng · chạm sàn · occlusion đúng · ánh sáng hợp lý · không seam.
4. **Ngưỡng pass:** ≥ **70%** ảnh cho placement "tin được" mà không cần chỉnh tay *(founder xác nhận ngưỡng)*.

**Quyết định gate:** pass → giữ nhánh AI auto-place. Fail → **ship manual-first** (mặt sàn + raycast + kéo/scale/xoay tay + contact shadow), AI thành assist qua toggle. Cả hai đường đều ship được M1.

**Rủi ro #2 (thấp hơn, có fallback):** chi phí/chất lượng inpainting — thử 3–4 nhà cung cấp trong spike; fallback reveal-pixel khiến nó không block.

---

## 11. Kỷ luật phạm vi — thứ tự hy sinh nếu quá 4–6 tuần

AI auto-place → **thủ công** · occlusion → **vẽ đè** · xóa-đồ-cũ → **chỉ thêm đồ** *(founder quyết vì là non-negotiable)* · giảm catalog → 1–2 style · bỏ polish save/share.

**Vòng lõi bất khả xâm phạm (giữ tới cùng):** chọn style → upload → đặt ≥1 món → thấy dự toán → click affiliate. Đây là thứ DUY NHẤT chứng minh giả thuyết.

---

## 12. Testing

| Loại | Test gì (ROI cao) | Công cụ |
|---|---|---|
| Unit (ưu tiên) | `packages/core` thuần: `SceneCalibration` (fixture depth→sàn/camera), `Placement` (chạm sàn + scale theo khoảng cách), `Estimator`, zod validate catalog, map `AIError`→fallback | Vitest |
| Integration | API routes + vendor mock: **cache hit → không gọi vendor lần 2**, ratelimit kích hoạt, timeout→lỗi có kiểu, budget cap tắt AI mềm, lead insert | Vitest |
| E2E (ít) | (a) style→upload→đặt→dự toán→click Buy phát event; (b) xóa đồ→fallback reveal; (c) mock depth fail → manual mode vẫn đặt được | Playwright |
| Visual | Golden gallery 20–30 ảnh → snapshot composite → **mắt review mỗi vòng** (bắt regression "độ thật"). KHÔNG auto-test pixel shader (brittle) | manual/board |

CI: typecheck + vitest + lint mỗi commit; Playwright ở PR.

---

## 13. Đường tiến hóa M2 (seam đã cắm sẵn từ M1)

| M2 cần | Cắm vào đâu |
|---|---|
| Mobile native | `packages/core` thuần TS → RN import nguyên vẹn; chỉ viết lại lớp render (R3F→expo-gl) |
| Escrow | `Checkout` là interface từ M1 (Affiliate→Escrow PayOS/MoMo). Cart/EstimatePanel không đổi |
| Onboard supplier | `CatalogSource` interface (Static→Supabase từ portal). Cùng schema |
| Auth/login | Supabase đã sẵn (leads); M2 bật Supabase Auth; store cho phép gắn `userId?` optional |
| Depth on-device | `AIGateway.depth()` là interface; M2 swap adapter NPU; caller không đổi |
| DB | Supabase từ M1 = chính DB M2 lớn lên; không migrate |

---

## 14. Hạ tầng (solo-friendly, bootstrap ~11.7tr/tháng)
Vercel + Supabase + Upstash + Replicate + Vercel Blob/R2. Tất cả managed, pay-as-you-go.

---

## 15. Điểm lệch PRD & mục bỏ ngỏ cần founder

**Lệch PRD có chủ đích:**
- **Depth = server-side cho M1-web** (PRD §10.7 ghi "depth on-device"). Lý do: depth chỉ **1 lần/ảnh** (không real-time mỗi frame như PRD giả định), web không có NPU, in-browser cần WebGPU (chưa phổ cập) + tải ~25MB. **On-device = M2-mobile / tầm nhìn dài hạn**, đã đặt sau interface `AIGateway.depth()` để swap. → *Cần cập nhật 1 dòng ở PRD §10.7 + Decisions_Log D3 cho khớp.*

**Bỏ ngỏ cần founder chốt (không chặn khởi động spike):**
1. ✅ **3 phong cách:** Japandi · Mid-Century · Bauhaus (chốt 2026-07-24).
2. **Đích thực của lead + link affiliate** (Shopee affiliate account? site nhà cung cấp nào? lead về Supabase/email?).
3. **Ngưỡng pass spike** (đề xuất ≥70% ảnh "tin được").
4. Xác nhận đơn giá Replicate thực tế khi có volume (để chốt COGS).

**Bước tiếp sau khi spec được duyệt:** (a) pass UI/UX design; (b) `superpowers:writing-plans` → kế hoạch triển khai; (c) spike tuần 1.
