---
derives_from: [D4@bb7f1ffe, D5@15cdc73a]
---
# Phân tích Giá trị & Roadmap MVP (Day 20)

Tài liệu này tổng hợp kết quả phân tích độ ưu tiên tính năng (RICE, Ma trận Value-Effort) và Roadmap triển khai của YourSpace MVP, phục vụ cho việc trình bày chiến lược sản phẩm với VC.

---

## 1. Bảng chấm điểm RICE (Giả định Reach = 10,000 users/quý)

| Tính năng | Reach (User/quý) | Impact (0.25-3) | Confidence (%) | Effort (Person-month) | RICE Score |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1. Khám phá "Style Palette"**<br>*(Curated catalog phân loại theo phong cách)* | 10,000<br>*(100% user mở app đều dùng)* | 2 (High) | 100% | 1 | **20,000** |
| **2. Tương tác 3D cốt lõi**<br>*(Upload ảnh, kéo thả, xoay, xóa 3D)* | 7,000<br>*(70% qua phễu onboarding)* | 3 (Massive) | 100%<br>*(Tech React Native/GL đã rõ)*| 2 | **10,500** |
| **3. Dự toán chi phí & Link Mua**<br>*(Hiển thị giá + redirect Affiliate)* | 3,000<br>*(30% chốt được bản thiết kế)*| 3 (Massive) | 100% | 1 | **9,000** |
| **4. AI Spatial Placement**<br>*("Kreativ-lite": 1 ảnh + Depth Anything V2 on-device auto-scale; **spike có fallback về đặt đồ thủ công**)*| 7,000<br>*(70% qua phễu onboarding)* | 3 (Massive) | 80%<br>*(Rủi ro sai số depth từ AI → có fallback thủ công)* | **M1 spike: ~1**<br>*(+ M2 harden: ~2)* | **5,600** |
| **5. Style Quiz AI**<br>*(AI Chat/Quiz để tìm phong cách)* | 10,000<br>*(Out-of-scope MVP)* | 1 (Medium) | 50%<br>*(Chưa có data khách hàng training)*| 4 | **1,250** |

### ⚠️ Phân bổ Effort theo mốc M1/M2 (KHÔNG dồn ~7 person-month vào NOW)

Tổng effort các tính năng in-scope ≈ 7 person-month. Theo D5 (M0 PoC đã có → M1 web 4–6 tuần → M2 3–4 tháng), effort được **chia theo mốc**, không nhồi hết vào NOW/M1:

| Tính năng | M1 (Validation web, 4–6 tuần) | M2 (MVP thật, 3–4 tháng) |
| :--- | :--- | :--- |
| 1. Khám phá Style Palette | ~1 pm (catalog 16–24 models) | polish + mở rộng phong cách |
| 2. Tương tác 3D cốt lõi | ~2 pm (tái dùng PoC `WebApp/`, web-first) | mobile native |
| 3. Dự toán & Link | ~1 pm (link affiliate / thu lead, **chưa escrow**) | + escrow/thanh toán (D2) |
| 4. AI Spatial Placement | **~1 pm — spike Kreativ-lite CÓ FALLBACK** | ~2 pm harden (ảnh tối, gương/kính, cache depth, QA metadata) |
| **Tổng theo mốc** | **~5 pm gọn cho M1** | **~2+ pm cho M2 (thường sau gọi vốn)** |

> **Lưu ý:** M1 fake bước mua (link affiliate / thu-lead), escrow lùi về M2 (D2/D5). AI Spatial Placement ở M1 chỉ là **spike có fallback về đặt đồ thủ công** — nếu depth-từ-1-ảnh dưới ngưỡng thì degrade mượt về manual, không block M1.

---

## 2. Ma trận 2x2 Value-Effort

*(Lưu ý: Trục Value trong ma trận tỷ lệ thuận với `Reach × Impact × Confidence`)*

```mermaid
quadrantChart
    title 2x2 Value-Effort Matrix - YourSpace MVP
    x-axis Low Effort --> High Effort
    y-axis Low Value --> High Value
    quadrant-1 STRATEGIC BET
    quadrant-2 QUICK WIN
    quadrant-3 FILL-INS
    quadrant-4 NON-STARTER
    Khám phá Style Palette: [0.16, 0.95]
    Tương tác 3D cốt lõi: [0.33, 0.98]
    Dự toán & Link Mua: [0.16, 0.50]
    AI Spatial Placement M1 spike: [0.40, 0.80]
    Style Quiz AI: [0.85, 0.15]
```

*(Lưu ý: AI Spatial Placement được vẽ ở vị trí effort M1-spike (~1 pm, có fallback), KHÔNG phải khối "Strategic Bet" nặng — phần harden effort cao đẩy sang M2.)*

### Đúc kết Quyết định Sản phẩm:
1. 🏆 **1 Quick Win (Làm trước): Khám phá Style Palette & Bảng Dự toán** (Effort thấp, Value cao, trực tiếp sinh doanh thu).
2. 🧪 **AI Spatial Placement = SPIKE CÓ FALLBACK trong M1 (không phải khối Strategic Bet lớn):** Làm bản "Kreativ-lite" (1 ảnh + Depth Anything V2) ở tuần đầu M1; nếu chất lượng dưới ngưỡng → **degrade mượt về đặt đồ thủ công** (user tự kéo/scale/xoay trục Y). Đây là hedge có chủ đích, không dồn rủi ro/effort lớn vào M1. Phần harden (ảnh tối, gương/kính, cache depth, QA metadata) đẩy sang M2/NEXT.
3. 🚫 **1 Non-starter (Bỏ thẳng): Style Quiz AI** (Rủi ro data cao, không khả thi trong giai đoạn MVP bootstrap).

---

## 3. 🚀 YOURSPACE PRODUCT ROADMAP (Now/Next/Later)

### 🟢 NOW (≈ M1 — Validation web-first, 4–6 tuần; escrow CHƯA có)
*Tập trung vào giải quyết sự đắn đo cốt lõi và validate USER rẻ trước (mua = link affiliate / thu-lead). Effort M1 ~5 person-month, không dồn hết 7 pm vào đây.*

* **Vấn đề 1: "Nghịch lý sự lựa chọn" khiến người dùng tê liệt.** 
Khách hàng bơi trong biển hàng chục nghìn sản phẩm đơn lẻ trên sàn TMĐT nhưng không biết kết hợp sao cho đúng gu, dẫn đến chần chừ không dám mua.
*(→ Giải quyết qua: Khám phá Style Palette)*
* **Vấn đề 2: Sự thiếu tự tin vì không thể hình dung không gian thật.**
Người mua không dám xuống tiền vì sợ món đồ đắt đỏ khi kê vào phòng mình trông sẽ lạc lõng, sai tông màu.
*(→ Giải quyết qua: Tương tác 3D cốt lõi trên ảnh 2D + **spike AI Spatial Placement "Kreativ-lite" (1 ảnh + Depth Anything V2) CÓ FALLBACK về đặt đồ thủ công** — chạy sớm tuần đầu M1, nếu depth dưới ngưỡng thì degrade mượt về manual, không block M1)*
* **Vấn đề 3: Đứt gãy giao dịch ở bước ra quyết định cuối cùng.**
Người dùng ưng ý không gian nhưng mù mờ về ngân sách thực tế và không có điểm chạm tin cậy để mua chính xác món đồ vừa phối.
*(→ Giải quyết qua: Bảng dự toán tự động & Link mua Affiliate)*

### 🟡 NEXT (≈ M2 — MVP thật, 3–4 tháng, thường sau gọi vốn)
*Xây dựng hào nước phòng thủ công nghệ (Moat), harden AI, thêm escrow/thanh toán (D2) và nâng cấp trải nghiệm Zero-friction. Effort M2 ~2+ person-month cho riêng phần AI harden.*

* **Vấn đề 1: AI Spatial Placement cần được harden sau khi launch MVP.**
MVP đã có auto-scale theo depth, nhưng cần tăng độ ổn định trên ảnh phòng Việt Nam: phòng tối, gương/kính, metadata model 3D bẩn, thiết bị yếu.
*(→ Giải quyết qua: accuracy benchmark, confidence fallback, cache depth map, QA pipeline cho 3D metadata)*
* **Vấn đề 2: Khan hiếm nguồn dữ liệu sản phẩm 3D bản địa.**
Dữ liệu 3D ban đầu chỉ là hàng mẫu chung chung, chưa phải hàng thật đang được bán bởi các nhãn hàng Việt Nam, làm giảm tỷ lệ chốt sale đơn giá cao.
*(→ Giải quyết qua: Mở rộng B2B Supplier Lock-in)*

### 🔴 LATER (Tầm nhìn dài hạn)
*Chuyển đổi sang trải nghiệm cá nhân hóa tuyệt đối (Done-for-you).*

* **Vấn đề 1: Khách hàng muốn hệ thống tự "đọc vị" gu thẩm mỹ.**
Tệp người dùng bận rộn muốn có một trợ lý AI thông minh tự động hiểu gu của họ từ số 0 (chỉ qua vài câu hỏi) và tự mix-match toàn bộ không gian thay vì họ phải tự tìm kiếm.
*(→ Giải quyết qua: Style Quiz AI & Gen-AI Agent)*
* **Vấn đề 2: Giới hạn góc nhìn của hình ảnh 2D tĩnh.**
Hình ảnh chụp một góc phòng không thỏa mãn được khát khao "bước đi" trong không gian tương lai từ nhiều góc độ đối với các căn nhà đang thi công phần thô.
*(→ Giải quyết qua: Tích hợp AR/LiDAR 3D scanning)*

---

## 4. 🎯 OKR Quý 1 (Focus cho giai đoạn NOW)

*Bộ mục tiêu này được thiết kế để trình bày với Investor, chứng minh team tập trung vào Outcome (kết quả kinh doanh/hành vi) thay vì Output (số lượng tính năng).*

**🔥 OBJECTIVE:** 
**Chứng minh YourSpace là "điểm chạm" triệt tiêu hoàn toàn sự đắn đo khi mua sắm nội thất của người trẻ.**
*(Định tính, truyền cảm hứng, trực tiếp giải quyết 3 Vấn đề ở cột NOW).*

**📈 KEY RESULTS:**
* **KR1 (Leading - User Behavior):** Tỷ lệ người dùng tải app hoàn thành việc ướm thử đồ và lưu lại bản thiết kế căn phòng (Save/Share Rate) đạt **30%**.
  *(Đo lường ý định thực sự, dự báo tỷ lệ chuyển đổi).*
* **KR2 (Lagging - Business Metric):** Tỷ lệ người dùng nhấp vào liên kết "Mua hàng/Nhận tư vấn" (Click-to-Buy Rate) trên tổng số người đã lưu bản thiết kế đạt **15%**.
  *(Đo lường trực tiếp khả năng sinh doanh thu Affiliate/Lead generation).*
* **KR3 (Quality - Retention):** Tỷ lệ người dùng quay lại tiếp tục chỉnh sửa không gian hoặc tạo thiết kế mới trong vòng 7 ngày (D7 Retention) đạt **25%**.
  *(Đo lường giá trị cốt lõi: app có thực sự hữu ích hay người dùng chỉ tò mò dùng 1 lần rồi xóa).*

---

## 5. 🛡️ Risk Management & Critical Path (Giai đoạn NOW)

*Tài liệu phòng thủ (Defensibility) cuối cùng trong Investor Package, chứng minh khả năng execution và quản trị rủi ro của Founder trong 30 ngày tới.*

### A. 3 External Dependencies (Nguy cơ có thể "giết" dự án trong 30 ngày tới)

**1. Hosting & Deploy Web/PWA (M1 = web-first, KHÔNG qua App Store)**
* **Bối cảnh (D5):** M1 là **web-first** — deploy web/PWA qua Vercel, KHÔNG submit App Store/Play Store ở M1. Nhờ vậy rủi ro "app bị reject" của Apple/Google **không nằm trên critical path của M1**; quy trình duyệt store lùi về M2 (mobile native).
* **Worst-case scenario:** Build/deploy web lỗi sát ngày ra mắt (config Vercel sai, PWA không cài được trên iOS Safari, hoặc lỗi crash bộ nhớ khi render 3D trên trình duyệt mobile của user).
* **Plan B:** Giữ web app chạy như một trang responsive thường (không bắt buộc cài PWA) để user vẫn trải nghiệm 3D trực tiếp trên Safari/Chrome mobile; hạ cấu hình render 3D cho thiết bị yếu.
* **Cost:** $0 (Vercel Free) + 1–2 ngày rà soát cấu hình.
* **Lưu ý:** Submit App Store & Play Store là công việc của **M2** (mobile native), không phải M1.

**2. Bản quyền Mô hình 3D (Sketchfab / CGTrader License)**
* **Worst-case scenario:** Bị report vi phạm bản quyền do dùng nhầm mô hình 3D dán nhãn "Non-commercial" (phi thương mại) vào một app có gắn link affiliate kiếm tiền, dẫn đến việc bị gỡ app và phạt tiền.
* **Plan B:** Lọc lại toàn bộ catalog, mua đứt license "Royalty Free" cho khoảng 20 mô hình 3D thiết yếu nhất để đảm bảo an toàn pháp lý tuyệt đối cho phiên bản MVP.
* **Cost:** ~$200 USD + 2 ngày rà soát lại dữ liệu.

**3. Giới hạn băng thông Cloud (Cloud Bandwidth Limits)**
* **Worst-case scenario:** App bất ngờ viral, lượng user tải hàng nghìn file mô hình 3D (5-10MB/file) làm vượt giới hạn băng thông miễn phí của Firebase/Vercel, gây sập server diện rộng ngay ngày ra mắt.
* **Plan B:** Nén ép toàn bộ file 3D (áp dụng định dạng `.glb` với thuật toán Draco) xuống mức < 1MB và định tuyến luồng tải file qua hệ thống Cloudflare CDN caching.
* **Cost:** $20/tháng (Cloudflare Pro) + 1 ngày cấu hình hệ thống.

---

### B. Critical Path (Chuỗi công việc cốt lõi cho NOW)

Dưới đây là 6 Tasks chính cho cột NOW. Những task được **Highlight màu cam** chính là **Critical Path** (Chuỗi công việc dài nhất và rủi ro cao nhất, sự chậm trễ của chúng sẽ làm trễ toàn bộ dự án).

```mermaid
graph TD
    T1["Task 1: Tuyển chọn & Tối ưu 16–24 mô hình 3D (2–3 phong cách)"]
    T2["Task 2: Build UI Khám phá Style Palette"]
    T3["Task 3: Build Tương tác 3D cốt lõi"]
    T4["Task 4: Gắn Bảng giá & Link Affiliate"]
    T5["Task 5: Test Memory Leak trên trình duyệt/thiết bị thật"]
    T6["Task 6: Deploy Web/PWA (Vercel) — M1, KHÔNG qua App Store"]

    T1 -->|Blocking| T3
    T1 -->|Blocking| T4
    T2 -->|Blocking| T3
    T3 -->|Blocking| T5
    T4 -->|Blocking| T5
    T5 -->|Blocking| T6

    %% Định dạng Critical Path
    style T1 fill:#f96,stroke:#333,stroke-width:2px,color:#000
    style T3 fill:#f96,stroke:#333,stroke-width:2px,color:#000
    style T5 fill:#f96,stroke:#333,stroke-width:2px,color:#000
    style T6 fill:#f96,stroke:#333,stroke-width:2px,color:#000
    
    style T2 fill:#fff,stroke:#333,stroke-width:1px,stroke-dasharray: 5 5
    style T4 fill:#fff,stroke:#333,stroke-width:1px,stroke-dasharray: 5 5
```

**Phân tích Critical Path:**
`[T1] Chuẩn bị Data 3D` → `[T3] Build tính năng Kéo thả 3D` → `[T5] Tối ưu hóa Memory Leak` → `[T6] Deploy Web/PWA`.
*Lý do:* Không có mô hình 3D thì không thể code tính năng kéo thả. Có tính năng kéo thả xong thì rủi ro cao nhất nằm ở việc vỡ bộ nhớ khi render 3D trên trình duyệt/thiết bị mobile. Vượt qua bài test này mới có thể deploy web/PWA cho user. Ở M1 (web-first, D5) bước cuối là **deploy web/PWA qua Vercel, KHÔNG submit App Store/Play Store** — submission mobile native thuộc M2. Các task UI và Data Affiliate có thể làm song song và không nằm trên đường cản trở chính.
