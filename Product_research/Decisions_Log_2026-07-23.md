# YourSpace — Sổ Quyết Định Định Hướng (2026-07-23)

> Đây là các quyết định founder đã chốt khi review lại tài liệu. Dùng làm nguồn chuẩn để đồng bộ toàn bộ tài liệu (đặt PRD làm "nguồn chân lý", các file khác trỏ về). Đối chiếu với `Doc_Consistency_Audit_2026-07-23.md`.

## D1 — Định vị lõi / khách hàng chính ✅ CHỐT

**Quyết định:** **User-first, two-sided CÓ THỨ TỰ.**
- Khách hàng chính = **người dùng cuối** (người mua nội thất trẻ). Sản phẩm giải nỗi đau của user trước.
- B2B (nhãn hàng/nhà cung cấp) **quan trọng nhưng thứ yếu** — là lớp monetization/mở rộng bật **SAU** khi đã chứng minh nhu cầu user.
- North Star (MVP) = mức độ user hoàn tất phối cảnh & tiến tới quyết định mua.

**Hệ quả cần đồng bộ khi sửa tài liệu:**
- Câu định vị chính phải là "nền tảng giúp NGƯỜI DÙNG thử đặt đồ vào phòng thật để mua đúng" — KHÔNG lấy "Visual Sales Channel cho brand" làm danh từ lõi.
- Gỡ mâu thuẫn "KHÔNG phải app thử nội thất" (`Strategic_Discovery.md:107`) vs "chính là thử đồ" (`README.md:3`) → giữ vế user-facing.
- Drift 1 & 2 (B2B sales-channel, Identity-Linked Premium đẩy AOV) cần đưa về đúng tinh thần user-first: giúp user mua ĐÚNG, không phải chi NHIỀU. (Monetization B2B ghi rõ là phase sau.)

---

## D2 — Mô hình giao dịch ✅ CHỐT

**Quyết định:** **Marketplace + Escrow (giữ tiền trung gian).** Về mô hình sản phẩm là marketplace có escrow; theo D5 escrow **đáp xuống M2** (M1 chỉ affiliate/thu-lead, chưa cầm tiền).
- YourSpace giữ tiền hộ (escrow) → giải ngân cho supplier **khi có xác nhận giao hàng**. Định vị đúng: escrow = **bảo vệ người mua** (hợp D1 user-first).
- **Trách nhiệm bồi hoàn khi có sự cố thuộc về SUPPLIER/B2B**, không phải founder móc túi. Khóa bằng hợp đồng + SLA (phạt supplier, ví dụ 8%).

**Ràng buộc & hệ quả cần đồng bộ:**
- **Pháp lý:** KHÔNG tự giữ tiền trong tài khoản YourSpace. Dùng **cổng thanh toán được cấp phép có hold/escrow** (PayOS/MoMo/VNPay/ngân hàng) để né giấy phép trung gian thanh toán NHNN. YourSpace chỉ điều phối.
- **PRD:** bỏ "Thanh toán In-app" khỏi Out-of-Scope vĩnh viễn → đưa vào scope **M2** (M1 chưa có escrow).
- **Governance:** viết lại RISK 4 (escrow giữ nguyên) và `incident_playbook` — kịch bản "founder tự hoàn 25tr" phải đổi thành "supplier chịu, trừ qua escrow". `Business_Assumptions` cập nhật: doanh thu = **take-rate 8% trên GMV giao dịch thật** (không còn thuần "affiliate click-out").
- **Cảnh báo:** làm MVP nặng thêm đáng kể → phải điều chỉnh D5 (timeline) cho thực tế.
## D3 — AI Inpainting: on-device vs cloud ✅ CHỐT

**Quyết định:** **MVP = cloud inpainting qua API hosted trả-theo-lượt** (Replicate hoặc tương đương), KHÔNG tự nuôi GPU server. Giữ được trải nghiệm "xóa đồ cũ trong phòng thật" (non-negotiable gốc).

**Nuance quan trọng (founder nhấn mạnh):**
- **"100% on-device" vẫn là killer decision / tầm nhìn dài hạn** — mục tiêu privacy khác biệt hóa (moat Shopee khó copy). Chỉ dùng cloud vì HIỆN chưa khả thi kỹ thuật (LaMa 200MB không chạy nổi máy tầm trung). **Revisit khi công nghệ cho phép** (model inpainting nhẹ hơn, NPU mobile mạnh hơn).

**Hệ quả cần đồng bộ:**
- **Gỡ lời hứa "AI 100% on-device / không upload / zero-cost API" khỏi PRD 10.7/10.8, `Business_Assumptions` (API cost ≠ 0), `rules_rails_ritual`, `territorial_scope`** — thay bằng: "MVP: depth on-device, inpainting cloud; ảnh gửi lên xử lý và xóa ngay".
- **Privacy = consent thật:** onboarding phải ghi "ảnh của bạn được gửi lên hệ thống để xử lý và xóa ngay" (KHÔNG dùng câu "không upload ảnh" — đó là tuyên bố sai, dính rủi ro Điều 198). Ghi rõ mục tiêu on-device tương lai.
- **NĐ13:** ảnh phòng lên cloud (có thể xuyên biên giới) → cần DPIA + cơ chế zero-retention. Cập nhật `territorial_scope` theo thực tế cloud.
- **COGS:** thêm chi phí API inpainting/lượt vào mô hình tài chính (không còn = 0).
- `Technical/Inpainting/` (LaMa Refiner tự host) → đánh dấu là **nghiên cứu cho phase sau / hướng on-device tương lai**, không phải build MVP.
## D4 — Scope MVP (AI Spatial Placement + catalog + thao tác) ✅ CHỐT

**Bắc Đẩu:** trải nghiệm kiểu **IKEA Kreativ** (chụp phòng → xóa đồ cũ → đặt đồ 3D đúng scale/phối cảnh). Founder muốn đúng như vậy.

**Quyết định:** **AI Spatial Placement = MUST-HAVE trong MVP**, nhưng làm bản LEAN ("Kreativ-lite") + có FALLBACK:
- **MVP scope thực tế:** **1 ảnh** + **Depth Anything V2** (depth từ ảnh đơn) để auto-scale/đặt đồ đúng phối cảnh; + cloud inpainting (D3) để xóa đồ cũ trong phòng. KHÔNG clone full Kreativ (panorama 5-ảnh/stereo, LiDAR digital twin, relighting) — để phase sau.
- **FALLBACK PLAN (founder yêu cầu ghi rõ):** nếu depth-từ-1-ảnh quá thiếu chính xác trong ràng buộc MVP → **degrade mượt về đặt đồ THỦ CÔNG** (user tự kéo/scale/xoay — đúng bản gốc "user-controlled"). Đây là hedge, không phải thất bại.
- **Decision gate:** làm **technical spike depth-placement SỚM** (tuần đầu). Nếu chất lượng dưới ngưỡng chấp nhận được tới mốc đã định → kích hoạt fallback. (Tránh dồn rủi ro tính năng yếu nhất vào phút chót.)
- **Lưu ý drift:** ý tưởng gốc KHÔNG có AI; đây là **tiến hóa CÓ CHỦ ĐÍCH** do founder chọn theo chuẩn Kreativ, không phải drift vô thức.

**Dọn dẹp kèm (đã duyệt):**
- **Xoay đồ:** cắt 360° → **chỉ trục Y**. Sửa `PRD.md:75` khớp Stress-Test.
- **Catalog MVP:** khởi đầu **~16-24 models (2-3 phong cách × ~8)**, không phải 75. 5 phong cách là mục tiêu SAU khi validate. Cập nhật `PRD:114,127` + `MVP_Research`.

**Hệ quả:** MVP giờ gồm escrow + cloud inpainting + AI depth placement + catalog → **rất nặng cho solo founder** → D5 (timeline) BẮT BUỘC phải thực tế lại.
## D5 — Timeline & artefact "MVP" ✅ CHỐT

**Quyết định:** thay một "MVP" mơ hồ bằng **thang bậc mốc rõ ràng**, validate USER rẻ trước, thêm hạ tầng nặng sau.

| Mốc | Là gì | Thời lượng | Gồm |
|---|---|---|---|
| **M0 — PoC** (ĐÃ CÓ) | `WebApp/` hiện tại → **đổi nhãn "PoC", KHÔNG gọi MVP** | xong | kéo-thả 3D thủ công |
| **M1 — Validation/RAT** | Vòng lõi USER: upload phòng → chọn style → đặt đồ (+ spike depth D4) → xem chi phí → "mua" | **~4-6 tuần** | **Web-first**; catalog 16 models; **CHƯA escrow** (mua = link affiliate / thu lead) |
| **M2 — MVP thật** | Sản phẩm user-first đầy đủ; **escrow (D2) đáp xuống đây** | **~3-4 tháng** (thường sau gọi vốn) | + escrow/thanh toán + onboard supplier + inpainting polish + mobile native |

**Chốt con:**
- **Nền tảng M1 = Web-first** (nhanh iterate solo, tái dùng PoC, không vướng App Store). Mobile native để M2.
- **Escrow hoãn tới M2** — M1 fake bước mua để đo ý định. Nhất quán "user-first, B2B để sau".

**Hệ quả cần đồng bộ:**
- Mọi tài liệu tách rõ **"PoC đã làm" vs "M1 mục tiêu" vs "M2"**; ngừng dùng "MVP" cho cả 3.
- Timeline chính thức: M1 4-6 tuần, M2 3-4 tháng. **Bỏ con số "6 tháng"** (`twitter_pitch:34`) hoặc gộp về M2.
- Bảng effort RICE (7 person-month) phải chia lại theo M1/M2, không dồn hết vào "NOW".
- Pitch phải nói rõ đang ở mốc nào — không để nhà đầu tư tưởng đã có app mobile.
## D6 — Bộ số thị trường & doanh thu ✅ CHỐT

**Đường tài chính:** **Bootstrap trước, gọi vốn sau M1.** Burn thật = **~11.7tr VND/tháng**, tiền mặt 50tr. M1 tự làm giá rẻ để có traction rồi mới pitch seed.

**Bộ số "nguồn sự thật" (quy chuẩn mọi tài liệu theo bảng này):**

| Chỉ số | Giá trị chốt | Ghi chú đồng bộ |
|---|---|---|
| **TAM** | **$9.76B/năm** (tổng ngành nội thất VN, Mordor) | Xóa hẳn $5B khỏi `Needs_and_Moat:44`, `Strategic_Discovery:160` |
| **SAM** | **$300-500M** (B2C online mid-range) | Xóa $2.5B khỏi `Strategic_Discovery:86`, `InvestorPackage:53` |
| **SOM** | **GMV ~$2-4M / 24 tháng** (5.000-10.000 đơn × ~10tr) → commission thực nhận **~$230-320K** (8%) | Đã sửa lỗi toán cũ ("$1-3M commission" là sai). $150M = "GMV mục tiêu dài hạn". *(Cận dưới commission theo 8%×$2M ≈ $160K — founder chốt band cuối.)* |
| **CAC** | **100K VND** | LTV/CAC = 12.5x; xóa câu "12.5x nếu CAC≤160K" (`Pitch_Memo:55`, `Pitch_Script:181`) |
| **Doanh thu** | **Take-rate 8% / GMV** | Subscription/showcase nhãn hàng = phase B2B sau; gỡ khỏi SOM gần hạn (`Strategic_Discovery:87`) |
| **GMV/ARPU base** | **10tr/đơn → ARPU 800K** | "Bán cả không gian" AOV 15tr = upside, không phải base |
| **Burn/runway** | **11.7tr VND/tháng** (bootstrap) | **Toàn bộ risk register tính lại theo burn này**, KHÔNG dùng $8,333/tháng. Kịch bản seed $150k/$8,333 relabel thành "kịch bản M2 sau gọi vốn" |
| **Ngày Launch** | **Tương đối** ("X tuần sau M1 pass") | Bỏ hard-code Tháng 1 & Tháng 5/2026 (`territorial_scope:39`, `document_trail:9,17`) |

---

## ✅ Tóm tắt 6 quyết định
- **D1:** User-first, two-sided có thứ tự (B2B để sau).
- **D2:** Marketplace + Escrow (supplier chịu bồi hoàn; dùng cổng thanh toán được cấp phép) — đáp xuống M2.
- **D3:** MVP cloud inpainting qua API hosted; on-device là tầm nhìn dài hạn; privacy = consent thật.
- **D4:** AI Spatial Placement must-have kiểu "Kreativ-lite" (1 ảnh + Depth Anything V2), có fallback về thủ công; xoay trục Y; catalog 16-24 models.
- **D5:** Thang bậc M0 PoC (đã có) → M1 Validation web-first 4-6 tuần (chưa escrow) → M2 MVP thật 3-4 tháng.
- **D6:** Bootstrap trước; bộ số chuẩn hóa như bảng trên.

## ✅ 3 mục bỏ ngỏ — đã chốt (2026-07-23)
- **Kết nối chuyên gia thiết kế:** M1 = thu-lead (SĐT) để tư vấn follow-up; chat/matching chuyên gia đầy đủ để **M2+**. (Giữ core outcome gốc, nhẹ cho M1.)
- **Need #1 = STYLE-FIRST** ("khám phá / gọi tên phong cách"). Lý do founder: phong cách là pain lớn hơn của nhóm 25-35, và sức hút chính của sản phẩm là các phong cách riêng/đẹp/quốc tế. "Sợ mua nhầm, kê không hợp" (thử phòng thật) = **Need #2**. → PRD & Strategic_Discovery đã đúng; chỉ lật `Needs_and_Moat_Summary`.
- **Twitter pitch:** viết lại **bootstrap-first** ("đang build M1 validation, gọi vốn sau khi có traction"), bỏ ask "$150K seed ngay".

**Bước tiếp:** đồng bộ toàn bộ tài liệu theo sổ này (PRD = nguồn chân lý, các file khác trỏ về; sửa/xóa câu mâu thuẫn). Kế hoạch chi tiết: `Doc_Sync_Plan_2026-07-23.md`.
