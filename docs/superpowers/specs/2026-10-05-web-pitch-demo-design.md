---
derives_from: [D3@57ec90a0, D3b@4248a41d, D4@bb7f1ffe, D5@15cdc73a, D7@96011236, D8@4efe52c0, D11@2f9e46cb]
---
# YourSpace — Demo web cho pitch: vòng lõi M1 với AI thật — Design Spec

> Ngày: 2026-10-05 · Branch: `demo/web-pitch` (tách từ `m1-build`) · Trạng thái: **đã triển khai trên `demo/web-pitch` (2026-10-05)**
> Nguồn: PRD v2.0 §4.2 và §5 (E01, E03, E04, E05, E07) · spec M1 `2026-07-24-m1-web-validation-design.md` §4, §5, §7, §9 ·
> spike `docs/spikes/2026-10-04-ai-pipeline-real-photos.md` · research `docs/research/2026-10-04-mock-thanh-chuc-nang-that.md`.

## 0. Mục tiêu & phi mục tiêu

**Mục tiêu:** một bản web chạy được trong trình duyệt (máy tính và điện thoại) để **pitch và cho người dùng thử**: đi trọn vòng P0 của PRD — chọn phong cách → tải ảnh phòng → xác nhận đường chân trời → xóa đồ cũ → đặt nhiều món 3D → thấy dự toán → bấm Mua. Phần khớp đồ và xóa đồ là **AI thật**, không giả lập.

**Phi mục tiêu:** tài khoản, Phòng của tôi, lưu và chia sẻ, Nhà hàng xóm (D10), chuyên gia, thanh toán, sự kiện analytics (E11), trang `/capture` đọc cảm biến (đang WIP trên `m1-build`), deploy production. Không đổi quyết định nào trong `decisions/`.

**Lệch có chủ đích so với spec M1 (chỉ cho demo, không phải quyết định mới):**
- Depth chạy **trong trình duyệt** thay vì server (D3b). Vẫn đặt sau interface `DepthService` của `packages/core` để đổi sang server mà không sửa UI.
- Segmentation (SlimSAM) chạy **trong trình duyệt** thay vì server (spec M1 §5), cùng lý do và cùng cách cách ly.
- Inpainting dùng LaMa ONNX tự host trên server (D11, amend D3) thay vì API hosted trả theo lượt qua Replicate.

## 1. Màn và điều hướng

UI dùng token màu, chữ, khoảng cách của `design-system/yourspace/MASTER.md` (hướng A · Phòng trưng bày), chuyển thành CSS variables cho web. Không đưa thêm quyết định thị giác mới. Font tiêu đề Bricolage Grotesque qua `next/font` (phải có subset `vietnamese`, kiểm trước khi dùng), chữ giao diện dùng font hệ thống. Chỉ theme sáng.

| Route | Màn | Nội dung |
|---|---|---|
| `/` | Mở đầu | Hai cửa vào: **Thử phòng** (→ `/thu-phong`) và **Khám phá phong cách** (→ `/phong-cach`). |
| `/phong-cach` | Danh sách phong cách | 3 phong cách: Japandi, Mid-Century, Bauhaus (D8 / spec M1). |
| `/phong-cach/[id]` | Chi tiết phong cách | Đặc trưng, màu, chất liệu, món tiêu biểu kèm giá; nút chính **Thử trong phòng của bạn** (mang theo phong cách đã chọn). |
| `/thu-phong` | Chọn ảnh & hiểu phòng | Bước 1: tải ảnh lên (`<input type="file" accept="image/*">`; trên điện thoại tự có lựa chọn chụp) hoặc chọn một ảnh mẫu, kèm consent. Bước 2: kéo đường chân trời cho khớp ảnh, chọn tư thế chụp **Đứng** (1,5 m) / **Ngồi** (1,1 m). Nút chính **Bắt đầu bày**. |
| `/chinh-sua` | Trình chỉnh sửa | Canvas ảnh + đồ 3D; khay đồ lọc theo phong cách (đổi được phong cách); công cụ **Xóa đồ**; Hoàn tác; thanh dự toán luôn hiện ở đáy. |
| sheet trong `/chinh-sua` | Sheet mua | Danh sách món nhóm theo nhà cung cấp; Mua từng món hoặc **Mua cả bộ**; bấm Mua → form để lại SĐT (§5). |

Trạng thái phiên (ảnh, camera, các món đã đặt, vùng đã xóa, lịch sử hoàn tác) nằm trong một store Zustand, chỉ trong bộ nhớ. Tải lại trang thì mất — chấp nhận cho demo.

## 2. Lõi khớp đồ vào ảnh

### 2.1. Camera và tỷ lệ
- Camera từ `solveCameraFromHorizon({ horizonNdcY, aspect, fovYRad, heightM })` (đã có, `packages/core/src/scene/horizon.ts`).
- `aspect` = tỷ lệ thật của ảnh. Canvas giữ đúng tỷ lệ này (không ép 4:3 như `/spike`).
- `fovYRad`: nếu ảnh còn EXIF `FocalLengthIn35mmFilm` thì đổi ra FOV dọc theo hướng ảnh; không có thì 60°. Hàm thuần `fovFromExif35mm(focal35, aspect, orientation)` trong `packages/core`.
- `heightM`: 1,5 m (Đứng) hoặc 1,1 m (Ngồi). Spike chỉ ra tỷ lệ phụ thuộc gần như tuyến tính vào chiều cao máy, nên hỏi tư thế rẻ hơn mọi model.
- Đường chân trời mặc định đặt ở giữa ảnh. Người dùng kéo để chỉnh, có chú thích ngắn "đường ngang tầm mắt khi chụp".

### 2.2. Ảnh vẽ trong cảnh WebGL
Ảnh phòng được vẽ bằng một quad toàn màn hình trong canvas R3F (không còn là `<img>` CSS nằm dưới). Lý do: lượt che khuất cần ghi độ sâu cùng một framebuffer, và ánh sáng lấy mẫu từ chính texture ảnh.

### 2.3. Che khuất bằng depth
- `DepthService` (interface đã có trong `packages/core`) có một cài đặt trong trình duyệt: Depth Anything V2 Small qua transformers.js, chạy trong **Web Worker** (WebGPU nếu có, không thì WASM). Dùng lại `apps/web/lib/depth/browserDepth.ts`, chuyển vào worker.
- Depth là tương đối (disparity). Hàm thuần mới `fitDepthToFloor(depthMap, camera) → { toMetres(disparity) }` trong `packages/core/src/scene/occlusion.ts`: lấy mẫu dải dưới đường chân trời, với mỗi điểm tính khoảng cách sàn thật theo camera (giao tia–mặt sàn), khớp `1/z = a·disparity + b` bằng RANSAC tất định (như spike và `calibrate`). Trả `confidence` = tỷ lệ inlier.
- Lượt vẽ: (1) quad ảnh ghi màu; (2) quad toàn màn hình ghi **chỉ độ sâu** (`colorWrite=false`, `gl_FragDepth` từ khoảng cách mét đã đổi sang depth của camera ảo); (3) vẽ đồ 3D với depth test bình thường. Đồ thật gần hơn sẽ che đồ mới. Dung sai 5% khoảng cách như spike.
- **Tính lại depth sau mỗi lần xóa đồ**, trên ảnh đã lấp (spike: dùng depth ảnh gốc làm 25% pixel sofa bị che sai, so với 10%).
- `confidence` thấp hơn ngưỡng (đặt 0,3 ban đầu) hoặc depth lỗi/quá 20 giây → tắt che khuất, vẫn đặt đồ bình thường, chip báo "Chưa tính được chiều sâu · đồ sẽ luôn nằm trên" (F5).

### 2.4. Bóng và ánh sáng
- Một mặt sàn vô hình (`ShadowMaterial`, opacity khoảng 0,35) hứng bóng của một đèn hướng; cộng `ContactShadows` (drei) cho bóng tiếp xúc.
- Đo ảnh thu nhỏ (64 px): độ sáng tuyến tính trung bình và màu trung bình. Từ đó đặt cường độ và màu của đèn môi trường và đèn hướng, cùng `toneMappingExposure` (công thức phơi sáng như spike: `clamp((L/0,18)^0,6; 0,25; 1,8)`). Hàm thuần `lightingFromImageStats(stats)` trong `packages/core`.
- Environment map: texture ảnh qua `PMREMGenerator` để vật liệu có phản chiếu nhẹ.
- Hướng đèn chính cố định: từ trên, phía sau camera, lệch một bên. Không ước lượng hướng sáng trong demo.

### 2.5. Thao tác với món
- Chọn món trong khay → chạm lên sàn để đặt (`placeOnFloor`). Chạm phía trên đường chân trời → chip "Chạm vào sàn, thấp hơn đường chân trời".
- Kéo món để di chuyển (raycast xuống mặt sàn y=0, tức F2: món luôn bám sàn).
- Món đang chọn có thanh tác vụ (MASTER.md · Thanh tác vụ của món): **Mua** | Nhân bản · **Bỏ**, và thước **xoay trục Y** (hít vào 0°, ±45°, ±90° khi thả trong ±5°). Panel đáy hiện tên, giá, "rộng × sâu × cao cm".
- **Cỡ từng món — đổi 2026-10-07 theo yêu cầu người dùng, lệch quyết định founder 2026-10-04 trong MASTER.md (cần founder xác nhận):** món đang chọn có thanh **Cỡ** 50–150% (mặc định 100% = kích thước thật); khi khác 100% panel ghi "Đang hiển thị …% — kích thước thật vẫn là số đo ở trên". F1 ở mức phòng vẫn giữ: nút **Chỉnh cỡ phòng** có thanh **Tầm mắt** (đường chân trời, hiện nét đứt trên ảnh khi mở) và **Độ cao máy** (0,8–2,0 m) — tầm mắt đặt sai là nguyên nhân hay gặp nhất khiến đồ to bất thường.
- Hoàn tác / Làm lại nhiều bước cho mọi thao tác trên canvas, kể cả xóa đồ cũ (F6).
- Sau lần đặt đầu, chip: "Đã căn theo mặt sàn · kéo để chỉnh".

## 3. Xóa đồ cũ

### 3.1. Chạm chọn (trong trình duyệt)
- SlimSAM (`Xenova/slimsam-77-uniform`) qua transformers.js, trong Web Worker. Mã hóa ảnh **một lần** khi vào chế độ Xóa đồ (hiện tiến trình); mỗi lần chạm chỉ chạy decoder.
- Chạm = thêm điểm dương. Công tắc **Thêm / Bớt**; ở chế độ Bớt chạm = điểm âm. Lấy mask **lớn nhất** trong 3 mask đầu ra (spike: ưu tiên mask lớn cứu thêm 11/65 món).
- Mask luôn hiện ra để xem trước (phủ màu bán trong suốt + viền). Chọn được nhiều món; danh sách món đã chọn có nút bỏ từng món.
- Nút chính **Xóa** gửi một lượt cho mọi món đã chọn.

### 3.2. Lấp (LaMa tự host — D11)
- Client: gộp mask của mọi món đã chọn **và mọi vùng đã xóa trước đó**, nới 1,2% cạnh dài ảnh, nới thêm 2,5% chiều cao ảnh xuống dưới với món có đáy ở nửa dưới ảnh. Hàm thuần `prepareEraseMask(masks, imageSize)` trong `packages/core`.
- Luôn lấp từ **ảnh gốc** với mặt nạ gộp (PRD E5-US2), không lấp chồng lên ảnh đã lấp — tránh "bóng ma".
- Ảnh gửi lên thu về cạnh dài ≤ 1024 px (`LAMA_MAX_SIDE`, `apps/web/lib/erase.ts`). Kết quả được dán lại chỉ trong vùng mask (viền mềm) lên ảnh làm việc.
- Route `POST /api/ai/inpaint` (Next.js, `runtime = "nodejs"`, `serverExternalPackages: ["onnxruntime-node", "sharp"]`): nhận ảnh + mask PNG, chạy **LaMa ONNX tự host trên CPU của chính server app** (D11, amend D3 — không còn gọi Replicate hay bất kỳ nhà cung cấp thứ ba nào) qua `createLocalLama` (`apps/web/lib/server/lamaLocal.ts`, dùng `onnxruntime-node` + `sharp`). `packages/core/src/ai/gateway.ts` có `makeCachedCall<I, O>` dùng chung cho depth và inpaint (cache tuỳ chọn; route inpaint **không cache** — câu đồng thuận nói ảnh "được xóa ngay sau đó"), `InpaintService` trong `ai/types.ts`. Model `lama_fp32.onnx` (Carve/LaMa-ONNX, ~208 MB) tải bằng `pnpm --filter web fetch:lama`, đường dẫn `LAMA_MODEL_PATH` (mặc định `apps/web/.models/`, git-ignored) — model file chưa có thì route trả `503` kèm hướng dẫn tải, hiện nguyên văn cho người dùng (thông điệp vận hành).
- Giới hạn trong bộ nhớ: 30 lượt / IP / giờ, trả lỗi có kiểu khi vượt. Suy luận chạy **tuần tự** (hàng đợi promise trong `lamaLocal.ts`) — một `InferenceSession` CPU dùng chung giữa các lượt, không chạy song song.
- **Kiểm soát đầu vào** (theo audit bảo mật 2026-10-05; phần ngân sách/chi phí theo lượt của bản Replicate không còn áp dụng — tự host không tính tiền theo lượt):
  - Đọc kích thước ảnh từ header **trước khi giải mã**: từ chối nếu cạnh dài > 2048 px hoặc mask khác kích thước ảnh. Kiểm loại file bằng magic bytes, không tin `Content-Type`.
  - Route AI **không bao giờ nhận URL**, chỉ nhận dữ liệu ảnh và mask, nên không có bề mặt SSRF.
  - Không ghi ảnh hay mask vào log. Log chỉ có kind lỗi có kiểu (`AIError["kind"]`) và 200 ký tự đầu message gốc. Không secret nào mang tiền tố `NEXT_PUBLIC_*`.
- Sau khi lấp: thanh so sánh **Trước / Sau** (giữ để xem ảnh gốc). Kết quả xấu → Hoàn tác, hoặc chọn vùng nhỏ hơn rồi xóa lại (F3). Lỗi mạng/timeout → giữ nguyên ảnh, chip lỗi, cho thử lại.
- Sau mỗi lượt lấp thành công: chạy lại depth (§2.3).

### 3.3. Consent
Trước lần tải ảnh đầu tiên: "Ảnh được gửi lên hệ thống để xử lý và xóa ngay sau đó." (đúng câu của PRD). Không nói hay ngụ ý ảnh không rời khỏi máy.

## 4. Dữ liệu

- **Phong cách, nhà cung cấp, món:** chép từ `apps/mobile/src/data/catalog.ts` sang `apps/web/lib/catalog.ts`, ghi rõ là dữ liệu mẫu, giá mẫu. Kiểu theo `FurnitureModel` của spec M1 §7 (`id, name, styleId, dimsM, priceVND, glbUrl, thumb, supplierId`).
- **Mô hình 3D:** đang có 4 (sofa Khronos, bàn trà tròn, ghế nhung, đèn sàn). Thêm 8–10 mô hình **CC0** (Poly Haven, Khronos glTF Sample Assets) để mỗi phong cách có ≥ 4 món ở các loại khác nhau (ghế/sofa, bàn, kệ/tủ, đèn, cây/trang trí). Nén bằng gltf-transform (meshopt + resize texture ≤ 1024), mục tiêu ≤ 2 MB/món. Ghi nguồn và giấy phép từng mô hình trong `apps/web/public/models/CREDITS.md`. Kích thước `dimsM` đo từ chính mô hình; mô hình có gốc ở tâm mặt đáy, mặt trước +Z.
- **Ảnh mẫu:** dùng lại `apps/web/public/golden/rooms/` (nguồn ở `CREDITS.md`). Chọn trước 4–6 ảnh làm "ảnh mẫu" trên `/thu-phong`, ưu tiên ảnh xóa đồ và đặt đồ ra đẹp; trên màn ghi rõ đây là ảnh mẫu.
- **Dự toán:** hàm thuần `estimate(items, catalog) → { groups: [{ supplier, lines, subtotalVND }], totalVND }` trong `packages/core/src/pricing/`.

## 5. Mua (M1: thu lead)

- Sheet mua mở từ thanh dự toán: món nhóm theo nhà cung cấp, mỗi món có nút Mua, cuối sheet nút chính **Mua cả bộ · {tổng}**.
- Chưa có link affiliate thật nên mọi nút Mua dẫn tới form **Để lại số điện thoại để nhà cung cấp gọi lại** (tên, SĐT Việt Nam được kiểm định dạng). Gửi → màn cảm ơn → nút **Quay lại phòng** về đúng trình chỉnh sửa (PRD: về đúng nơi xuất phát).
- **Demo không gửi lead đi đâu và không lưu**; ghi rõ dòng nhỏ "Bản demo · thông tin không được gửi đi".

## 6. Cấu trúc code

```
packages/core/src/
  scene/occlusion.ts        fitDepthToFloor            (+ test)
  scene/exif-fov.ts         fovFromExif35mm            (+ test)
  scene/lighting.ts         lightingFromImageStats     (+ test)
  mask/erase-mask.ts        prepareEraseMask, union, dilate, bbox  (+ test)
  pricing/estimate.ts       estimate                   (+ test)
  ai/gateway.ts             makeCachedCall (tổng quát hóa makeCachedDepth)  (+ test)
  ai/types.ts               + InpaintService, InpaintResult
  catalog/types.ts          FurnitureModel, Style, Supplier
apps/web/
  app/page.tsx, app/phong-cach/…, app/thu-phong/page.tsx, app/chinh-sua/page.tsx
  app/api/ai/inpaint/route.ts            AIGateway + Replicate LaMa + giới hạn lượt
  components/editor/  RoomScene (R3F: quad ảnh, lượt depth, đồ, bóng, đèn) · FurnitureItem · ItemHandles ·
                      HorizonOverlay · EraseTool · BeforeAfter · Tray · EstimateBar · BuySheet · LeadForm · Chip
  lib/workers/        depth.worker.ts · sam.worker.ts  (transformers.js)
  lib/ai/             depthClient.ts · samClient.ts · inpaintClient.ts
  lib/catalog.ts · lib/store.ts (Zustand + lịch sử hoàn tác)
  public/models/ (GLB + CREDITS.md)
```

Mỗi file một việc; component canvas không gọi model trực tiếp mà qua `lib/ai/*`. Trang `/spike`, `/capture`, `/sensor-test` giữ nguyên.

## 7. Xử lý lỗi (theo PRD F1–F6)

| Mã | Tình huống | Hành vi trong demo |
|---|---|---|
| F1 | Tỷ lệ sai | Nút Chỉnh cỡ phòng (chiều cao máy) trong trình chỉnh sửa; không có tỷ lệ từng món |
| F2 | Đặt lơ lửng | Món luôn bám mặt sàn khi đặt và kéo |
| F3 | Xóa ra xấu | Hoàn tác; chọn vùng nhỏ hơn rồi xóa lại; xem Trước/Sau |
| F4 | Ảnh khó (không thấy sàn) | Không chặn; nếu `confidence` depth thấp thì tắt che khuất và báo bằng chip |
| F5 | Depth lỗi / chậm | Tắt che khuất sau 20 giây hoặc khi lỗi; đặt đồ vẫn chạy |
| F6 | Hoàn tác | Hoàn tác / Làm lại nhiều bước trên canvas |
| — | Model trình duyệt tải chậm lần đầu | Thanh tiến trình kèm dung lượng; cache của trình duyệt cho lần sau |
| — | Replicate lỗi / hết lượt | Chip lỗi có nút thử lại; ảnh không đổi |

## 8. Kiểm thử

- **TDD** cho mọi hàm thuần mới trong `packages/core` (vitest, như các test hiện có): `fitDepthToFloor` trên depth tổng hợp từ một camera biết trước (phải khôi phục khoảng cách sàn sai số < 5%), có nhiễu và có vật thể nổi; `prepareEraseMask` (gộp, nới, nới xuống); `fovFromExif35mm`; `lightingFromImageStats`; `estimate`.
- **Route inpaint:** test với Replicate được giả lập — đúng đầu vào, cache, timeout ra `AIError`, giới hạn lượt. Thêm: N request song song khi ngân sách chỉ còn K lượt thì đúng K lượt gọi vendor, phần còn lại ra `BudgetExceeded`; lượt lỗi được hoàn ngân sách; ảnh vượt 2048 px hoặc mask lệch kích thước bị từ chối trước khi giải mã.
- **Kiểm tay:** đi trọn vòng P0 trên 4–6 ảnh mẫu và ít nhất một ảnh chụp bằng điện thoại thật, trên Chrome máy tính và Safari/Chrome điện thoại.
- `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm --filter web build` đều phải qua.

## 9. Rủi ro đã biết

1. **SlimSAM chưa được đo.** Spike đo SAM ViT-B (47,7% đạt sau 1 chạm). SlimSAM là bản nén, có thể kém hơn. Nếu kém rõ khi kiểm tay, phương án là chạy encoder SAM ViT-B trên server và decoder trong trình duyệt (research §2.9) — việc của vòng sau.
2. **Xóa đồ lớn hay xấu** (spike: 30,6% vùng đồ lớn dùng được). Khi pitch dùng ảnh mẫu đã chọn, ghi rõ là ảnh mẫu; với ảnh người dùng, F3 là đường chính.
3. **Ảnh điện thoại thật và ảnh tối** cho kết quả đặt đồ kém trong spike (0/4, 0/5). Demo không giải được phần này; hỏi tư thế chụp và nút Chỉnh cỡ phòng là cách giảm.
4. **Dung lượng tải lần đầu:** Depth Anything V2 Small (~25 MB) và SlimSAM (~40 MB) tải về trình duyệt; trên 4G có thể mất nửa phút. Tải nền ngay khi vào `/thu-phong`.
5. Thời gian lưu ảnh của Replicate cần kiểm trước khi đưa demo cho người ngoài, để câu consent "xóa ngay" đúng sự thật.
