# YourSpace — Audit Nhất Quán Tài Liệu & Drift Ý Tưởng

> Ngày: 2026-07-23 · Phạm vi: 30 tài liệu (Product, Product_research, Pitch, Governance-and-Risk, Technical, README, WebApp/Docs)
> Phương pháp: trích 319 khẳng định theo 12 chiều, đối chiếu chéo + đo drift so với ý tưởng gốc (`Archive/Your space.txt`).
> Kết quả thô: **83 mâu thuẫn + 55 điểm trôi lệch** (≈40 mâu thuẫn + 17 drift ở mức nghiêm trọng).

---

## 0. Kết luận nhanh

- Tài liệu **không mâu thuẫn ngẫu nhiên** — 83 mâu thuẫn dồn về **6 quyết định gốc chưa chốt**. Chốt xong 6 cái này, phần lớn mâu thuẫn tự biến mất.
- Sản phẩm đã **trôi khỏi ý tưởng gốc theo 4 hướng ở tầng giá trị** (xem Mục 2). Đây là câu hỏi "bạn có muốn thế không", không phải lỗi tài liệu.
- Nhiều **con số nền tảng cho pitch mâu thuẫn nhau tới 2–150 lần** (TAM/SAM/SOM, timeline, burn, CAC) → rủi ro mất uy tín ngay tại bàn gọi vốn.

---

## 1. Mốc ý tưởng gốc (baseline — từ `Archive/Your space.txt`)

**Ý tưởng lõi:** Người dùng chụp ảnh **chính phòng mình** → chọn đồ **theo phong cách** → kéo thả vào ảnh → xem giá/chi phí → **tư vấn hoặc mua**. Bản chất: *"thử đặt đồ vào không gian thật trước khi mua"* để giảm nỗi sợ mua nhầm, kê không hợp.

**Non-negotiables gốc:**
1. Bắt đầu từ **ảnh phòng thật** của user (không phải phòng mẫu/render).
2. **Style-first**: chọn theo phong cách, không lướt hàng nghìn SKU.
3. **User-controlled**: user tự kéo thả, xoay, và tự chọn vật thể gốc trong ảnh để **giữ hay xóa**.
4. **Purchase-oriented**: mỗi phối cảnh dẫn tới giá → tư vấn hoặc mua.
5. **Phổ cập/giáo dục phong cách** (giải nỗi đau "biết đẹp nhưng không gọi tên được" — Wabi Sabi, Mid-Century).
6. **Minh bạch giá & nguồn hàng** → giúp user sở hữu "hàng hiệu" với **giá tối ưu** (chống hớ).
7. Giúp người trẻ **thể hiện gu riêng**, tránh không gian đại trà.

> Ghi chú: bản gốc **KHÔNG** có: AI Spatial Placement, moat/TAM/SAM/SOM, escrow/marketplace, "bán cả không gian để đẩy AOV". Đây đều là lớp ghép về sau.

---

## 2. 4 hướng ĐÃ TRÔI khỏi ý tưởng gốc (tầng giá trị — bạn phải quyết)

### Drift 1 — Từ "công cụ cho NGƯỜI DÙNG" → "kênh bán hàng cho NHÃN HÀNG (B2B)"
- **Gốc:** giá trị đặt user làm trung tâm (giảm nỗi sợ, phổ cập phong cách, mua đúng giá). Lợi ích doanh nghiệp chỉ là hệ quả phụ.
- **Nay:** định vị chủ đạo thành *"Visual Sales Channel"*, moat *"Supplier Lock-in + Aesthetic Identity Graph"*, câu chốt *"bán sự tự tin để chi đậm cho bản sắc"* (`Pitch_Memo.md:69`, `Strategic_Discovery.md:62-77`).

### Drift 2 — Từ "giúp user trả ÍT hơn" → "khiến user chi NHIỀU hơn"
- **Gốc:** sở hữu hàng hiệu **giá tối ưu**, minh bạch giá, chống bất cân xứng thông tin.
- **Nay:** *"Identity-Linked Premium"* — bán "không gian Wabi-sabi" AOV 15tr thay vì "cái ghế" 2tr, *"aspiration drives basket size"* (`Pitch_Memo.md:50`, `InvestorPackage:107`). Đảo ngược đúng non-negotiable #6.

### Drift 3 — Từ "kéo thả THỦ CÔNG, user tự làm 100%" → "AI Spatial Placement là điểm khác biệt cốt lõi"
- **Gốc:** MVP Feature là kéo-thả tay, user tự chỉnh vị trí/góc độ. Không có AI.
- **Nay:** AI Spatial Placement (Depth Anything V2 ước lượng depth/scale) là "tính năng MVP cốt lõi" và trục kể chuyện "Why Now" — **dù chính `MVP_Research:396` tự nhận đây là giả thuyết YẾU NHẤT, rủi ro kỹ thuật cao, chưa có baseline.**

### Drift 4 — "Kết nối chuyên gia thiết kế" (core outcome gốc) đã bị bỏ khỏi luồng lõi
- **Gốc:** bước 5 = "tư vấn **hoặc** mua"; "tìm được chuyên gia thiết kế đúng gu" là một core outcome.
- **Nay:** `Strategic_Discovery.md:136` xếp "Chat với tư vấn viên" vào Out-of-Scope; `README.md:52` bước cuối chỉ còn "mua/lưu/tìm hiểu sản phẩm". Không có dòng doanh thu nào gắn với tư vấn.

> **Câu hỏi tầng giá trị:** YourSpace bạn muốn xây là **công cụ trao quyền cho người dùng** (đúng bản gốc) hay **cỗ máy bán hàng B2B tối ưu conversion/AOV** (hướng tài liệu đang trôi tới)? Hai hướng này kéo mọi thứ phía sau về hai phía khác nhau.

---

## 3. "Xương sống quyết định" — 6 fork chốt là gỡ phần lớn mâu thuẫn

| # | Quyết định gốc | Hai nhánh đang cãi nhau | Số mâu thuẫn nghiêm trọng phụ thuộc |
|---|---|---|---|
| **D1** | **Product noun / khách hàng lõi** | Nền tảng lifestyle cho user  ⟷  Visual Sales Channel cho brand | vision (2) + lan sang metric/moat/pitch |
| **D2** | **Mô hình giao dịch** | Affiliate link-out (không cầm tiền)  ⟷  Marketplace + Escrow (cầm tiền, chịu fulfillment) | ~8 (solution, features, business_model, risks) |
| **D3** | **Inpainting/AI chạy ở đâu** | 100% on-device (zero-cost + privacy)  ⟷  Cloud API (GPU server, upload ảnh) | ~7 (solution, mvp_scope, tech, risks) |
| **D4** | **AI Spatial Placement có trong MVP không** | Core-MVP "must-have"  ⟷  Đẩy sang NEXT (giữ MVP thủ công như gốc) | mvp_scope, tech, roadmap, risks |
| **D5** | **Timeline & artefact "MVP"** | 4-6 tuần / 3-4 tháng / 6 tháng; Web PoC ⟷ Mobile RN | roadmap (3) + hầu hết bảng effort |
| **D6** | **Bộ số thị trường & doanh thu** | TAM/SAM/SOM/CAC/burn/affiliate-vs-subscription | ~10 (market_moat, financials) |

### D1 — Product noun (vision)
Tài liệu gọi sản phẩm bằng ≥5 danh từ khác phạm trù: "lifestyle platform" (`Strategic_Discovery.md:104`), "Visual Sales Channel" (`Pitch_Memo.md:26`), "marketplace/aggregator" (`Business_Assumptions.md:148`), "mobile app Zero-friction Visualization" (`Pitch_Memo.md:24`). Nặng nhất: `Strategic_Discovery.md:107` tuyên bố **"KHÔNG phải app thử nội thất"** trong khi `README.md:3` + risk_register định nghĩa lõi **CHÍNH LÀ** "thử đặt đồ vào phòng".
→ **Chốt:** một câu định vị duy nhất; cái còn lại là hệ quả phụ.

### D2 — Mô hình giao dịch
- Affiliate: `PRD.md:62,88` (redirect ra sàn, "Thanh toán In-app" = Out-of-scope), `Pitch_Script.md:173` ("không lưu kho, không bán trực tiếp, hoa hồng 8%").
- Marketplace/escrow: `risk_register_v2.md:54-64` (escrow, "Đặt cọc & Chờ Supplier", phạt SLA 8%), `incident_playbook.md:39` (founder tự hoàn 25tr, thu hồi sofa).
- Hệ quả: take-rate 8% (~800k/đơn) nhưng risk_register giả định gánh 30% hoàn hàng (~6tr/đơn) → **1 đơn lỗi xóa lãi 7.5 đơn tốt.**
→ **Chốt:** MVP cầm tiền hay chỉ đẩy link? Rồi viết lại một trong hai khối (PRD ⟷ Governance).

### D3 — AI on-device vs cloud
- On-device: `PRD.md:153-157` ("hoàn toàn on-device, không upload, không chi phí API"), `Business_Assumptions.md:25-31` ("API cost/tháng = 0"), `rules_rails_ritual.md:15`, `territorial_scope.md:22` (dùng làm căn cứ "NĐ13 rủi ro thấp").
- Cloud: `Technical/Inpainting/integration_architecture.md:51-53` + `on_device_strategy.md` (LaMa 200MB **không khả thi** trên máy 4-6GB → chọn cloud), `document_trail.md:30,37` ("**vừa quyết định** chuyển Inpainting sang Cloud API").
→ Đây là mâu thuẫn "sống": nếu cloud thì **sụp cả 3 trụ**: zero-cost, privacy marketing ("ảnh không rời máy"), và kết luận pháp lý NĐ13. Kèm câu hỏi con: MVP có LaMa không hay chỉ "reveal ảnh gốc" (Stress-Test S5 bảo xóa hẳn LaMa)?
→ **Chốt PRD 10.7/10.8 làm nguồn chuẩn duy nhất, các file khác trỏ về.**

### D4 — AI Spatial Placement & scope MVP thủ công
Ngoài chuyện on-device, còn: catalog **16 vs 50-80 vs 75 models** (`MVP_Research:351` vs `PRD:114,127`); xoay **360° vs chỉ trục Y** (Stress-Test đã bảo cắt 360° nhưng `PRD:75` chưa sửa); **xóa vật thể GỐC trong ảnh** — non-negotiable gốc — bị `integration_architecture.md:138` đẩy sang NEXT.
→ **Chốt:** MVP có AI depth hay quay về kéo-thả thủ công như bản gốc? Catalog bao nhiêu models?

### D5 — Timeline & artefact
Ship MVP: **4-6 tuần** (`PRD:124`) vs **3-4 tháng** (`Pitch_Memo:65`) vs **6 tháng** (`twitter_pitch:34`). Effort bảng RICE = **7 person-month** cho cột NOW nhưng team = **solo founder, 4-6 tuần** → bất khả thi toán học (≥3× thời gian). "MVP" đang chỉ 3 thứ: mobile RN (chưa build), web PoC (đã có), prototype vanilla-JS local.
→ **Chốt:** tách rõ "PoC đã làm" vs "MVP mục tiêu"; một con số timeline chính thức.

### D6 — Bộ số (credibility killers cho pitch) — xem Mục 4.

---

## 4. Con số cần quy về MỘT nguồn sự thật

| Chỉ số | Các giá trị đang tồn tại | Nguồn |
|---|---|---|
| **TAM (giá trị)** | $9.76B ⟷ ~$5B (lệch ~2×, mâu thuẫn **ngay trong** `Strategic_Discovery`) | `PRD:13`, `Pitch_Memo:8` vs `Needs_and_Moat:44`, `Strategic_Discovery:160` |
| **TAM (định nghĩa)** | $9.76B/năm (giá trị) ⟷ 65,000 người mua/tháng (segment) — khác đơn vị | `Strategic_Discovery:85` vs `Business_Assumptions:14` |
| **SAM** | $300M ⟷ $300-500M ⟷ $2.5B (lệch 5-8×) | `Pitch_Memo:56` vs `Pitch_Script:155` vs `Strategic_Discovery:86` |
| **SOM** | $1-3M (24 tháng) ⟷ $150M (dài hạn) — lệch 50-150×, trộn commission vs GMV | `Pitch_Memo:56` vs `InvestorPackage:54` |
| **CAC** | 4,000 ⟷ 100,000 ⟷ 160,000 VND (câu "LTV/CAC 12.5x nếu CAC≤160K" **sai toán**: 160K → 7.8x) | `Business_Assumptions:185` vs `Pitch_Memo:55` |
| **Burn/runway** | 11.7tr VND/tháng (bootstrap) ⟷ $8,333/tháng (Seed $150k) — lệch ~17×, **làm sai cả thang chấm rủi ro** | `Business_Assumptions:122` vs `risk_register_v2:5` |
| **Doanh thu** | Chỉ affiliate ("không subscription") ⟷ affiliate + subscription nhãn hàng | `Business_Assumptions:148` vs `Strategic_Discovery:87` |
| **ARPU/GMV** | GMV 10tr (1 món) ⟷ AOV 15tr (cả không gian) — hai giả định không thể cùng đúng | `Business_Assumptions:11` vs `Pitch_Memo:50` |
| **Ngày Launch** | Tháng 1 ⟷ Tháng 5/2026 (cả hai **đã trôi qua** so với hôm nay 23/07/2026) | `territorial_scope:39` vs `document_trail:9,17` |

---

## 5. Trình tự khuyến nghị

1. **Quyết tầng giá trị trước (Mục 2):** user-tool hay B2B sales-channel? Cái này định hướng D1.
2. **Chốt D2 & D3** (giao dịch + AI location) — hai fork này gỡ nhiều mâu thuẫn nhất và có hệ quả pháp lý/tài chính.
3. **Chốt D4 & D5** (scope MVP + timeline) theo nguồn lực thật (solo, budget nhỏ).
4. **Quy chuẩn bộ số D6** — chọn 1 giá trị mỗi dòng, propagate ra mọi file.
5. **Đồng bộ tài liệu:** đặt PRD làm "nguồn chân lý", các file khác trỏ về; xóa/sửa câu mâu thuẫn.

Sau khi đồng bộ tài liệu xong mới nên bước sang phase code.

---

## Phụ lục — thống kê mâu thuẫn theo chiều

| Chiều | Mâu thuẫn (high) | Drift (high) |
|---|---|---|
| vision | 5 (2) | 6 (3) |
| target_user | 4 (0) | 3 |
| problem | 5 (2) | 4 |
| solution | 8 (4) | 5 |
| mvp_scope | 6 (4) | 5 |
| features | 8 (5) | 6 |
| business_model | 6 (3) | 4 |
| market_moat | 9 (4) | 4 |
| tech_approach | 7 (4) | 4 |
| roadmap | 7 (3) | 4 |
| risks_scope | 8 (3) | 5 |
| financials | 10 (6) | 5 |
| **Tổng** | **83 (40)** | **55 (17)** |
