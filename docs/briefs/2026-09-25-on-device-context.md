---
derives_from: [D3@7fbc47fb, D3b@4248a41d]
facts_check: false
---
# Context: thảo luận "100% on-device" — YourSpace

> Brief cho một session hỏi đáp riêng. Tự đủ — không cần đọc lại lịch sử chat trước.
> Soạn 2026-09-25. Mọi khẳng định dưới đây trích từ repo; chỗ nào là suy luận thì ghi rõ.

## 0. Cách làm việc trong session này

- Đây là **thảo luận chiến lược, không phải code**. Không sửa file nào trừ khi founder yêu cầu.
- Founder (solo, Việt Nam) **tự chốt quyết định chiến lược**; muốn được **phản biện thẳng**, kỹ lưỡng, không xuôi theo.
- Quyết định trong `decisions/` là **bất biến**. Nếu thảo luận dẫn tới đổi ý → tạo bản ghi mới
  (ví dụ `D3c`) với `amends:`/`supersedes:`, chạy `pnpm kb:impact D3` trước để thấy tài liệu bị ảnh hưởng.
  Không sửa tại chỗ D3/D3b.

## 1. Sản phẩm trong 3 câu

YourSpace: user chụp **ảnh phòng thật** → chọn phong cách (style-first) → đặt đồ nội thất 3D vào ảnh
đúng scale/phối cảnh, có thể **xóa đồ cũ** trong ảnh → xem dự toán → mua (M1: link affiliate / thu-lead).
Đang build **M1 — web validation** (Next.js, 4–6 tuần, bootstrap burn ~11.7tr VND/tháng).
M2 = mobile native + escrow, sau gọi vốn.

## 2. Quyết định hiện hành

**D3 (2026-07-23)** — `decisions/D3-cloud-inpainting.md`, status `amended`:
- MVP = **cloud inpainting qua API hosted trả-theo-lượt** (Replicate hoặc tương đương), không tự nuôi GPU.
- **"100% on-device" vẫn là killer decision / tầm nhìn dài hạn** — mục tiêu privacy khác biệt hóa
  ("moat Shopee khó copy"). Chỉ dùng cloud vì **hiện chưa khả thi kỹ thuật** (LaMa ~200MB không chạy
  nổi máy tầm trung). **Revisit khi công nghệ cho phép** (model inpainting nhẹ hơn, NPU mobile mạnh hơn).
- Hệ quả bắt buộc: gỡ mọi lời hứa "AI 100% on-device / không upload / zero-cost API";
  privacy = **consent thật** ("ảnh của bạn được gửi lên hệ thống để xử lý và xóa ngay");
  KHÔNG dùng câu "không upload ảnh" (sai sự thật → rủi ro **Điều 198 BLHS**, lừa dối khách hàng);
  ảnh lên cloud (có thể xuyên biên giới) → cần **DPIA + zero-retention theo NĐ13/2023**;
  COGS phải có chi phí API/lượt.

**D3b (2026-07-24)** — `decisions/D3b-depth-server-side.md`, `amends: D3`:
- Depth tính **1 lần/ảnh** (không per-frame) → ở **M1-web depth cũng chạy server-side/cloud**,
  **cache theo hash ảnh**, đặt sau interface `AIGateway.depth()` để **M2-mobile swap sang on-device**.
- Sửa tiền đề cũ "depth phải on-device vì cần real-time mỗi lần drag".

## 3. Lịch sử — vì sao đây là chủ đề nhạy cảm

- Trước D3, tài liệu hứa **"AI chạy 100% on-device, không upload ảnh, API cost = 0"** (PRD 10.7/10.8,
  Business_Assumptions, rules_rails_ritual). `territorial_scope.md` từng **dùng chính điều đó làm căn cứ
  kết luận rủi ro NĐ13 thấp**.
- `Product_research/Doc_Consistency_Audit_2026-07-23.md` gọi đây là mâu thuẫn "sống": nếu thực tế là
  cloud thì **sụp cả 3 trụ** — zero-cost, marketing privacy ("ảnh không rời máy"), và kết luận pháp lý NĐ13.
- Ngày 2026-09-23 đã sync toàn bộ tài liệu theo D3+D3b. Hiện không còn câu nào *tuyên bố* on-device
  cho M1; các chỗ còn chữ "100% on-device" đều ở dạng "là tầm nhìn dài hạn".

## 4. Pipeline AI của M1 — thực tế

Theo spec `docs/superpowers/specs/2026-07-24-m1-web-validation-design.md` §5:

| Tác vụ | Model | Chạy đâu (M1) | Tần suất | Cache |
|---|---|---|---|---|
| Depth | Depth Anything V2 (Replicate) | Server | 1×/ảnh | theo SHA-256 ảnh |
| Segmentation | SAM / MobileSAM (click-based) | Server | khi xóa đồ | — |
| Inpainting | LaMa (Replicate); SDXL-inpaint cho vùng lớn | Server | khi xóa đồ | theo (hash ảnh + mask) |

→ "100% on-device" nghĩa là **cả ba** chạy trên máy user. Lưu ý: **segmentation không có quyết định
nào trong `decisions/`** — nó chỉ xuất hiện trong spec. D3/D3b chỉ nói về inpainting và depth.

## 5. Bằng chứng kỹ thuật đang có trong repo

- **Depth in-browser đã chạy được trong spike**: `apps/web/lib/depth/browserDepth.ts` dùng
  transformers.js + `onnx-community/depth-anything-v2-small` (ONNX), thử WebGPU rồi fallback WASM.
  Comment trong code: *"Cũng là POC cho tầm nhìn on-device (D3)"*. Plan M1 ghi founder **chủ động chọn
  in-browser cho spike** (không cần Replicate token); `serverDepth` vẫn là kiến trúc M1 chính thức.
- Interface đổi adapter đã có: `packages/core/src/ai/types.ts` → `DepthService` (browserDepth | serverDepth).
- Lý do spec không dùng in-browser cho M1: WebGPU chưa phổ cập + tải model ~25MB.
- **Kết quả spike chưa được ghi thành tài liệu** (ngưỡng pass đề xuất ≥70% ảnh "tin được" vẫn là mục
  bỏ ngỏ trong spec §15). Tức là chưa có số đo chất lượng/tốc độ depth in-browser trên máy thật.
- Inpainting on-device: căn cứ duy nhất trong repo là "LaMa ~200MB cần GPU". Các tài liệu nghiên cứu cũ
  được nhắc tới (`Technical/Inpainting/on_device_strategy.md`, `lama_refiner_analysis`) **không còn
  trong repo**. Chưa có đánh giá model inpainting nhẹ nào khác.

## 6. Các góc nhìn cần cân

**Pháp lý / marketing**
- Nói "sẽ 100% on-device" với user hay nhà đầu tư khi chưa có lộ trình kiểm chứng được → có thể bị hiểu
  là hứa hẹn tính năng; ranh giới với Điều 198 nằm ở cách diễn đạt.
- `Governance-and-Risk/document_trail.md`: kịch bản vendor cloud bị hack lộ ảnh phòng ngủ; DPIA là ưu tiên #1.

**Kinh tế**
- Cloud: chi phí biến đổi mỗi lượt (depth + segmentation + inpainting). `Product/Business_Assumptions.md`
  hiện **chưa tính lượt depth** vào COGS. On-device → chi phí AI biến đổi ≈ 0, đổi lại chi phí kỹ thuật
  (tải model, thiết bị yếu, WebGPU).

**Chiến lược / moat**
- D3 gọi privacy on-device là moat. Nhưng moat chính thức trong `Product_research/Strategic_Discovery.md`
  là **Supplier Lock-in + Aesthetic Identity Graph** — privacy on-device **không** nằm trong đó.
  (Suy luận: Identity Graph cần thu dữ liệu hành vi; không mâu thuẫn trực tiếp với ảnh on-device, nhưng
  làm câu chuyện "privacy-first" phức tạp hơn.)
- `Pitch/Pitch_Memo.md` dòng ~41 (Why Now): "Depth Anything V2 giờ đủ nhỏ để chạy on-device trên điện
  thoại tầm trung" — đúng như nhận định xu hướng, nhưng đặt cạnh kiến trúc cloud có thể gây hiểu nhầm.

## 7. Vấn đề đang treo liên quan trực tiếp

1. **"Revisit khi công nghệ cho phép" không có tiêu chí đo được** — không có ngưỡng model size,
   latency, chất lượng, hay tỷ lệ thiết bị hỗ trợ WebGPU/NPU để biết khi nào "đã cho phép".
2. **D3 vs D3b mâu thuẫn về lưu trữ**: D3 yêu cầu "xử lý xong xóa ngay / zero-retention"; D3b cache depth
   theo hash ảnh, spec còn cache inpaint theo (hash ảnh + mask). Cache = giữ dữ liệu suy ra từ ảnh phòng
   riêng tư → DPIA phải khai. Cần chốt: cache chứa gì, TTL bao lâu, có cần consent riêng không.
   (Nếu depth chạy on-device thì phần cache depth phía server biến mất.)
3. **Linter `decisions/facts.yml`**: mục `privacy_claim` cấm chuỗi `"100% on-device"` và
   `"không upload ảnh"`, nhưng chính câu tầm nhìn đúng ("100% on-device là tầm nhìn dài hạn") và câu
   quy tắc ("KHÔNG dùng câu 'không upload ảnh'") bị bắt → 18 báo động giả. Đề xuất đang chờ: bỏ hai
   chuỗi đó khỏi `forbidden`. Kết quả thảo luận có thể đổi cách diễn đạt tầm nhìn → ảnh hưởng quyết định này.
4. Segmentation chưa có quyết định (xem §4).

## 8. Câu hỏi gợi ý mở đầu

- "100% on-device" thực chất là gì với YourSpace: **tầm nhìn sản phẩm, lời hứa marketing, moat, hay
  ràng buộc kiến trúc**? Mỗi loại kéo theo cách viết và nghĩa vụ khác nhau.
- Có nên tách mục tiêu theo từng tác vụ (depth / segmentation / inpainting) thay vì "100%" một cục?
  Depth in-browser đã có POC; inpainting là nút thắt.
- Tiêu chí revisit đo được là gì? Ai/khi nào kiểm tra lại?
- Có nên đưa on-device lên M1 cho riêng depth (dùng lại `browserDepth`) để vừa giảm COGS vừa giảm dữ liệu
  lên cloud — hay giữ server như D3b? Cần số spike nào để quyết?
- Với nhà đầu tư: nói về on-device thế nào để hấp dẫn mà không thành lời hứa chưa có căn cứ?
- Kết quả cuối nên thành bản ghi quyết định mới (D3c?) hay chỉ là ghi chú nghiên cứu?

## 9. File nên đọc khi cần chi tiết

| File | Nội dung |
|---|---|
| `decisions/D3-cloud-inpainting.md`, `decisions/D3b-depth-server-side.md` | Quyết định gốc |
| `decisions/facts.yml` | Linter giá trị chuẩn / bị cấm |
| `docs/superpowers/specs/2026-07-24-m1-web-validation-design.md` §5, §15 | Pipeline AI, AIGateway, mục bỏ ngỏ |
| `docs/superpowers/plans/2026-07-24-m1-spike-and-foundation.md` (dòng ~18–26) | Amendment depth in-browser cho spike |
| `apps/web/lib/depth/browserDepth.ts`, `packages/core/src/ai/types.ts` | POC depth in-browser + interface |
| `Product/PRD.md` §10.7–10.8 | Model selection + data/privacy |
| `Governance-and-Risk/territorial_scope.md`, `document_trail.md`, `rules_rails_ritual.md` | NĐ13, DPIA, quy tắc privacy |
| `Product/Business_Assumptions.md` §2 | COGS |
| `Product_research/Doc_Consistency_Audit_2026-07-23.md` (mục D3) | Vì sao mâu thuẫn này từng nguy hiểm |
