# YourSpace — Kế Hoạch Đồng Bộ Tài Liệu (chờ duyệt)

> Mục tiêu: sửa toàn bộ tài liệu cho khớp `Decisions_Log_2026-07-23.md` (D1-D6). **PRD = nguồn chân lý**, các file khác trỏ về.
> Trạng thái: **CHƯA THỰC THI** — chờ founder duyệt. Line number là tham chiếu từ audit, khi sửa sẽ đọc lại file theo nội dung.
> Quy ước: 🔴 = xóa/thay claim sai · 🟡 = viết lại cho khớp · 🟢 = thêm mới · ⚠️ = mục bỏ ngỏ cần bạn quyết.

---

## ✅ 3 mục bỏ ngỏ — ĐÃ CHỐT

1. **Kết nối chuyên gia:** M1 = thu-lead (SĐT) tư vấn follow-up; đầy đủ ở M2+.
2. **Need #1 = STYLE-FIRST** (khám phá phong cách). "Sợ mua nhầm/kê không hợp" = Need #2. → PRD & Strategic_Discovery đã đúng; **chỉ lật `Needs_and_Moat_Summary:7-11`** (đang để "sợ mua nhầm" là #1 → đổi thành #2, style lên #1).
3. **Twitter pitch:** viết lại **bootstrap-first**, bỏ ask "$150K seed ngay".

---

## A. Product/ (lõi — sửa trước, kỹ nhất)

### PRD.md (NGUỒN CHÂN LÝ)
- 🟢 Thêm mục đầu "Milestone map": M0 PoC (đã có) / M1 web validation 4-6 tuần / M2 mobile 3-4 tháng. Ghi rõ **PRD này mô tả scope M1 trừ khi nói khác** (D5).
- 🔴 Mục 10.7/10.8: xóa "AI chạy 100% on-device", "không upload ảnh", "API cost=0" → thay: **MVP dùng cloud inpainting (API hosted); depth on-device; ảnh gửi lên xử lý & xóa ngay; on-device là tầm nhìn dài hạn** (D3).
- 🟡 AI Spatial Placement: giữ must-have nhưng ghi rõ **"Kreativ-lite": 1 ảnh + Depth Anything V2**, kèm **fallback thủ công** + decision gate spike tuần đầu (D4).
- 🔴 Dòng 75: xoay "360 độ" → **chỉ trục Y** (D4).
- 🟡 Dòng 114,127: catalog → **16-24 models, 2-3 phong cách** (5 là mục tiêu sau) (D4).
- 🔴 Dòng 138: "LaMa nhẹ chạy on-device" → sửa tiền đề kỹ thuật: **LaMa ~200MB cần GPU → chạy cloud** (D3).
- 🟡 Out-of-Scope: "Thanh toán In-app" → chuyển thành **"M2: escrow qua cổng thanh toán được cấp phép"** (không còn "out" vĩnh viễn, mà là M2) (D2/D5).
- 🟡 Bộ số (nếu xuất hiện): TAM $9.76B, CAC 100K, ARPU 800K, burn 11.7tr — khớp D6.
- ⚠️ User flow bước cuối: thêm nhánh thu-lead tư vấn (theo mục bỏ ngỏ #1).

### Product_Brief.md
- 🔴 Dòng 10-11: "tự động tái tạo phòng thành mô hình 3D" → **đặt đồ 3D lên ảnh 2D + depth (không dựng 3D phòng)** (D3/D4).
- 🟡 Reframe giá trị **user-first** (D1); "chọn vật thể gốc giữ/xóa" giữ là non-negotiable (qua cloud inpainting).
- ⚠️ "Tìm chuyên gia thiết kế" (dòng 36): theo quyết định mục bỏ ngỏ #1.

### Business_Assumptions.md
- 🟡 Dòng 148: "marketplace/aggregator, doanh thu affiliate (không phải subscription)" → **doanh thu = take-rate 8% trên GMV qua escrow**; subscription nhãn hàng = **phase B2B sau** (D2/D6).
- 🔴 Dòng 25-31: COGS "API cost=0" → **thêm chi phí API inpainting/lượt** (D3).
- 🟢 Giữ burn 11.7tr, tiền mặt 50tr, GMV 10tr/ARPU 800K làm chuẩn (D6); CAC = 100K (D6).

### Needs_and_Moat_Summary.md
- 🔴 Dòng 44: TAM "~$5B" → **$9.76B** (D6).
- 🟡 Đánh số Need theo mục bỏ ngỏ #2.
- 🟡 Moat: giữ trung thực (không copy = giả thuyết đang kiểm chứng), khớp Strategic_Discovery.

---

## B. Product_research/

### Strategic_Discovery.md
- 🔴 Dòng 107: "KHÔNG phải app thử nội thất" → **viết lại**: YourSpace LÀ công cụ thử-đồ-trong-phòng-thật, style-first, cho user (D1). Bỏ mâu thuẫn tự phủ định.
- 🟡 Dòng 74: "Visual Sales Channel" B2B → **hạ xuống lớp phụ**, user-first là chính (D1).
- 🔴 Dòng 160: TAM ~$5B → $9.76B; dòng 86: SAM $2.5B → **$300-500M**; dòng 87: SOM $150M → **"GMV mục tiêu dài hạn"** (tách khỏi SOM); bỏ subscription khỏi SOM gần hạn (D6).
- 🟡 Dòng 115: giữ self-assessment moat trung thực (dùng để chỉnh pitch, không xóa).
- ⚠️ Dòng 136: "chat tư vấn Out-of-scope" theo mục bỏ ngỏ #1.

### MVP_Research_and_PMF.md
- 🟢 Các Stress-Test (cắt 360°, cắt/hoãn LaMa nặng, giảm catalog) **giờ thành chính thức** — đối chiếu để PRD khớp (D4).
- 🔴 Dòng 177-178: "AI hoàn toàn on-device" → cloud inpainting (D3).

### Roadmap.md
- 🟡 Dòng 9-15: chia lại effort theo **M1 vs M2** (không dồn 7 person-month vào NOW) (D5).
- 🟡 Dòng 41: AI Spatial Placement giữ trong M1 nhưng là **spike có fallback** (D4), không phải "Strategic Bet" khối lớn.

---

## C. Pitch/

### Pitch_Memo.md
- 🟡 Danh từ định vị → **user-first** nhất quán (D1).
- 🔴 Dòng 34: "AI on-device, zero cost, không server" → **cloud MVP + on-device là tầm nhìn** (D3).
- 🟢 SAM $300M / SOM $1-3M (dòng 56) **giữ nguyên — đã khớp D6** ✅.
- 🟡 Dòng 65: timeline "3-4 tháng" → theo ladder M1/M2 (D5).
- 🟡 Dòng 50: "Identity-Linked Premium AOV 15tr" → **đổi thành upside**, không phải core; khớp user-first "mua đúng" (Drift 2/D6).
- 🔴 Dòng 55: CAC 160K → **100K**, sửa câu LTV/CAC 12.5x cho đúng toán (D6).

### Pitch_Script.md
- 🔴 Dòng 88: speaker note "$5B" → **$9.76B / SAM $300-500M** (D6).
- 🟡 Dòng 224,230: "đối thủ không thể copy" → **"moat là giả thuyết đang kiểm chứng qua onboarding supplier + data"** (khớp self-assessment) (Drift/market_moat).
- 🟡 Dòng 253: "build full MVP 4-6 tuần" → làm rõ đó là **M1** (D5).

### twitter_pitch.md
- ⚠️ Viết lại theo mục bỏ ngỏ #3 (bootstrap-first). Dòng 34: bỏ "6 tháng / $150K seed" nếu chốt bootstrap.

### Twitter_Pitch_eval.md
- 🟡 Cập nhật theo bản twitter_pitch mới.

### VietAnh_Milestone1_InvestorPackage.md
- 🔴 Dòng 53: SAM $2.5B → $300-500M; dòng 54: SOM $150M → GMV dài hạn (D6).
- 🟡 Dòng 89: TAM "65,000 người/tháng" → **ghi rõ là chỉ số adoption của segment**, phân biệt với TAM $9.76B (giá trị); nêu cầu nối (D6).
- 🔴 Dòng 101-103: CAC/LTV → 100K, 12.5x (D6).
- 🟢 Dòng 64-70: bước cuối "dự toán + link affiliate" **giữ — khớp M1 chưa escrow** ✅.

---

## D. Governance-and-Risk/

### risk_register.md
- 🔴 Dòng 18: "YourSpace gánh 30% hoàn hàng" → **supplier chịu bồi hoàn** (D2).
- 🟡 Burn → 11.7tr (bootstrap), thang Impact tính lại (D6). Kịch bản seed $150k = "M2 sau gọi vốn".
- 🟡 Dòng 45: rủi ro "màn hình thanh toán crash" → **gắn vào M2** (escrow ở M2) (D2/D5).

### risk_register_v2.md
- 🟡 Dòng 54-64 (RISK4 escrow): **giữ escrow** nhưng ghi rõ **supplier chịu hoàn** + **thuộc M2** + dùng cổng cấp phép (D2).
- 🟡 Dòng 38: fallback cloud AWS/Replicate → **đây là hướng MVP chính thức** (D3), không còn "fallback".
- 🔴 Dòng 50 (RISK3): onboarding "không upload ảnh" → **consent thật "gửi lên xử lý & xóa ngay"** (D3).
- 🟡 Dòng 94: "MRR $15k" → khớp mô hình doanh thu take-rate (D6).

### document_trail.md
- 🟢 Chốt "chuyển inpainting sang cloud" là **quyết định chính thức** (D3), không còn là kịch bản.
- 🟡 Dòng 9,17: ngày Launch → **tương đối** ("X tuần sau M1 pass") (D6).

### territorial_scope.md
- 🔴 Dòng 22: "Depth on-device → ảnh không gửi server" → **inpainting cloud → ảnh CÓ lên server, cần DPIA + zero-retention** (D3).
- 🟡 Dòng 39: Launch "Tháng 1" → tương đối (D6).

### rules_rails_ritual.md
- 🔴 Dòng 15: "on-device, không lưu ảnh server" → **cloud MVP + honest consent + mục tiêu on-device tương lai** (D3).

### incident_playbook.md
- 🔴 Dòng 39: "founder tự bỏ 25tr hoàn" → **supplier chịu, trừ qua escrow** (D2).

---

## E. README & WebApp/

### README.md
- 🟡 Giữ định vị user-first; AI Spatial Placement → Kreativ-lite (D4). Bỏ ngụ ý on-device tuyệt đối.
- 🟡 MVP Scope (45-58): làm rõ **đây là M1** (D5).
- ⚠️ Bước cuối (52): nhánh tư vấn theo mục bỏ ngỏ #1.

### WebApp/Docs/MVP_Implementation_Plan.md
- 🟡 Đổi nhãn rõ: đây là **M0 PoC / hoặc kế hoạch M1 web** (D5); gỡ nhập nhằng "MVP".

---

## F. Technical/

### Inpainting/ (integration_architecture, lama_refiner_analysis, on_device_strategy, README, log)
- 🟡 Ghi header rõ: **`integration_architecture` (cloud) = hướng MVP chính thức** (D3); **`on_device_strategy` = nghiên cứu cho tầm nhìn on-device tương lai** (D3), không phải build ngay.

### Segmentation/
- 🟢 Ghi chú: hỗ trợ inpainting/erase, phục vụ M2; không đổi code trong phase này.

---

## Thứ tự thực thi đề xuất
1. Bạn chốt 3 mục ⚠️ ở đầu.
2. Sửa **PRD** trước (nguồn chân lý).
3. Sửa Product/ → Product_research/ → Pitch/ → Governance/ → README/WebApp → Technical/ (mỗi cụm một agent, chạy song song, review qua git diff).
4. Kiểm tra chéo lần cuối: chạy lại audit rút gọn để xác nhận mâu thuẫn đã hết.

**Ước lượng:** ~20 file, phần lớn là sửa câu/số theo checklist trên. Git tree sạch → review `git diff` toàn bộ trước khi commit.
