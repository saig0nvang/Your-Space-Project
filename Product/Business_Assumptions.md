---
derives_from: [D2@499c7e4d, D3@7fbc47fb, D6@b921ed46, D3b@4248a41d]
---
# Tab 1 — ASSUMPTIONS / Giả định đầu vào

> **Luật chơi:** Chỉ điền vào các ô MÀU VÀNG. Các ô khác là công thức và sẽ tự tính.

---

## 1. Product & Pricing / Sản phẩm & Giá

| Chỉ số | Optimistic | Base | Pessimistic | Đơn vị | Ghi chú / Note |
|---|---|---|---|---|---|
| **ARPU — Doanh thu bình quân / đơn hàng** | `2,000,000` | `800,000` | `150,000` | VND | = GMV/đơn × Commission rate. Tự động tính — không điền tay |
| **GMV trung bình / đơn hàng** | `20,000,000` | `10,000,000` | `5,000,000` | VND | Giá 1 món đồ: Pessimistic = đồ nhỏ/phụ kiện, Base = sofa/giường trung cấp, Optimistic = combo phòng cao cấp. Nguồn: Day16 "5–10tr/giao dịch" |
| **Commission rate (tỷ lệ hoa hồng)** | `10%` | `8%` | `3%` | % | Pessimistic: Shopee affiliate 3–5%. Base: đối tác trực tiếp 8%. Optimistic: exclusive partner deal 10%+ |
| **TAM (số người mua tiềm năng/tháng)** | `32,500` | `65,000` | `130,000` | người/tháng | = Thị trường online HCM+HN segment trung cấp ~650 tỷ/tháng ÷ GMV/đơn. **Lưu ý: "TAM" ở bảng vận hành này = số người mua/tháng của segment phục vụ — KHÁC với TAM giá trị $9.76B ở tài liệu Pitch (đừng nhầm hai con số).** |
| **SOM — Đơn hàng mới / tháng** | `700` | `300` | `160` | đơn/tháng | Giới hạn bởi capacity founder (marketing organic). Từ Day16: 5,000–10,000 đơn/24 tháng → base ~300/tháng |
| **→ Adoption rate** | `2.15%` | `0.46%` | `0.12%` | %/tháng | = SOM ÷ TAM. Thấp vì TAM lớn — phản ánh đúng thực tế startup mới |

---

## 2. COGS / Chi phí biến đổi trên mỗi khách hàng

> ⚠️ **Lưu ý quan trọng:** Ở M1, **cả depth (Depth Anything V2, 1 lần/ảnh, cache theo hash — D3b) lẫn inpainting đều chạy trên cloud qua API hosted trả-theo-lượt** (Replicate/tương đương — D3) để ước lượng chiều sâu và xóa đồ cũ trong ảnh phòng thật → **có chi phí API per-request, KHÔNG còn zero-cost**. Hosting dùng Vercel/Netlify free tier. Mô hình vẫn tương đối asset-light nhưng phải tính chi phí API inpainting vào COGS.

| Chi phí | Optimistic | Base | Pessimistic | Đơn vị | Ghi chú / Note |
|---|---|---|---|---|---|
| **API inpainting / tháng** | `100,000` | `500,000` | `1,500,000` | VND/tháng | Cloud inpainting trả-theo-lượt (Replicate/tương đương) để xóa đồ cũ. **Depth cũng chạy cloud từ M1 (D3b) — con số ở hàng này CHƯA tính lượt depth, cần ước lại.** Ước tính = số lượt inpaint × đơn giá/lượt; tăng theo lượng user |
| **Domain và email service / tháng** | `0` | `300,000` | `700,000` | VND/tháng | Vercel/Netlify free tier cho MVP. Tăng khi vượt giới hạn free |
| **Hidden costs (3D asset curation, QA) / tháng** | `0` | `100,000` | `500,000` | VND/tháng | Đừng quên! Curate + QA metadata 3D (kích thước thật, origin point) tốn công |
| **Infrastructure (server/cloud) / tháng** | `200,000` | `300,000` | `500,000` | VND/tháng | Domain, CDN, analytics. Vercel free = $0; con số này là dự phòng khi scale |
| **→ Tổng COGS / tháng** | `300,000` | `1,200,000` | `3,200,000` | VND/tháng | Tổng chi phí vận hành kỹ thuật hàng tháng (đã gồm API inpainting cloud) |

> **📐 Công thức COGS / khách / tháng:**
>
> Các chi phí trên là **fixed cost** — không đổi theo số khách.
> Để phân bổ ra từng khách, chia cho số đơn phát sinh trong tháng:
>
> ```
> Số khách / tháng = TAM × Adoption Rate
>
>   Optimistic:  32,500 × 2.15% ≈ 700 đơn/tháng
>   Base:        65,000 × 0.46% ≈ 300 đơn/tháng
>   Pessimistic: 130,000 × 0.12% ≈ 160 đơn/tháng
>
> COGS / khách / tháng = Tổng COGS/tháng ÷ (TAM × Adoption Rate)
>
>   Optimistic:    300,000 ÷ 700 =    429 VND/khách
>   Base:        1,200,000 ÷ 300 =  4,000 VND/khách
>   Pessimistic: 3,200,000 ÷ 160 = 20,000 VND/khách
> ```

| Chỉ số | Optimistic | Base | Pessimistic | Đơn vị | Ghi chú |
|---|---|---|---|---|---|
| **Số khách/tháng** (= TAM × Adoption Rate) | `700` | `300` | `160` | đơn/tháng | Tham chiếu Mục 1 — không điền tay |
| **→ Tổng COGS / khách / tháng** | `429` | `4,000` | `20,000` | VND/khách | = Tổng COGS/tháng ÷ Số khách/tháng |


---

## 3. Customer Behavior / Hành vi khách hàng

> **📌 Định nghĩa Churn cho YourSpace:**
> Nội thất là **low-frequency purchase** (1–2 lần/năm) — user không mua hàng tháng.
> Do đó, **Churn được đo theo hành vi tháng** (engagement), không phải theo giao dịch:
>
> ✅ **Churn = % user ngưng tương tác với app trong tháng** (không mở app, không xem thiết kế, không thêm đồ)
>
> User vẫn được tính **"active"** (không churn) nếu họ: xem lại bản thiết kế đã lưu, thêm đồ mới vào phòng, khám phá phong cách khác — dù chưa click mua đơn nào.
>
> ❌ **KHÔNG dùng** "không mua đơn trong tháng = churn" — cách này cho kết quả ~95%/tháng, vô nghĩa với nội thất.

| Chỉ số | Optimistic | Base | Pessimistic | Đơn vị | Ghi chú / Note |
|---|---|---|---|---|---|
| **Monthly Behavioral Churn — % user ngưng tương tác app/tháng** | `5.0%` | `8.0%` | `12.0%` | %/tháng | Đo engagement hàng tháng (mở app, xem thiết kế, thêm đồ) — không đo giao dịch. Benchmark: app nội thất SEA ~8–15%/tháng |
| **→ Vòng đời trung bình (tháng)** | `20.0` | `12.5` | `8.3` | tháng | = 1 ÷ Churn Rate |
| **Tần suất mua trung bình** | `2.0` | `1.5` | `1.0` | đơn/năm | Người trẻ mua nhà lần đầu — nhu cầu cao năm 1, giảm sau khi phòng hoàn thiện |
| **→ LTV (Lifetime Value)** | `6,667,000` | `1,250,000` | `103,750` | VND | = ARPU/đơn × Tần suất (đơn/năm) × Vòng đời (năm) |

> **📐 Công thức LTV:**
> ```
> LTV = ARPU/đơn × Tần suất (đơn/năm) × Vòng đời (tháng ÷ 12)
>
> Optimistic:  2,000,000 × 2.0 × (20.0 ÷ 12) = 2,000,000 × 3.333 = 6,667,000 VND
> Base:          800,000 × 1.5 × (12.5 ÷ 12) =   800,000 × 1.563 = 1,250,000 VND
> Pessimistic:   150,000 × 1.0 × ( 8.3 ÷ 12) =   150,000 × 0.692 =   103,750 VND
> ```
>
> **Lưu ý:** LTV base giảm từ ~1.17M → 1.25M (tăng nhẹ do ARPU từ 750k → 800k).
> LTV pessimistic rất thấp (~104k) vì cả 3 yếu tố đều xấu cùng lúc: ARPU thấp + mua thưa + churn nhanh.


---

## 4. Sales & Marketing / Chi phí thu hút khách

> **📌 Chiến lược acquisition của YourSpace:** Organic-first — tận dụng cộng đồng sẵn có (Nghiện Nhà 500K+, TikTok #homedecor). Product visual → dễ viral tự nhiên. Paid ads chỉ dùng để boost bài đã có tương tác tốt.

| Kênh | Optimistic | Base | Pessimistic | Đơn vị | Ghi chú |
|---|---|---|---|---|---|
| TikTok / Instagram organic | `0` | `0` | `0` | VND | Free — founder tự tạo content. Video phối đồ 3D viral tự nhiên |
| Facebook group Nghiện Nhà | `0` | `0` | `0` | VND | Free post. 500K+ members = warm audience sẵn có |
| Canva Pro (thiết kế content) | `0` | `200,000` | `200,000` | VND/tháng | Free plan đủ dùng ở Optimistic |
| Boost post Facebook/Instagram | `0` | `500,000` | `1,000,000` | VND/tháng | Test nhỏ 1–2 bài/tháng có tương tác tốt |
| Micro-influencer nội thất | `0` | `500,000` | `1,000,000` | VND/tháng | Đổi early access lấy review — có thể $0 nếu deal tốt |
| **→ Tổng Marketing Budget / tháng** | `0` | `1,200,000` | `2,200,000` | VND/tháng | Cực thấp nhờ organic-first + product tự viral |

| Chỉ số | Optimistic | Base | Pessimistic | Đơn vị | Ghi chú / Note |
|---|---|---|---|---|---|
| **→ CAC thực tế** | `0` | `4,000` | `13,750` | VND/khách | = Marketing budget ÷ Đơn mới (0÷700, 1.2M÷300, 2.2M÷160) |
| **CAC kể cả thời gian founder** | `50,000` | `100,000` | `200,000` | VND/khách | Nếu quy đổi 2–4h/tuần founder dành cho content ra tiền |

---

## 5. Fixed Costs / Chi phí cố định hàng tháng

> ⚠️ **Solo founder — bootstrap, chưa có funding.** Chi phí thực tế thấp hơn rất nhiều so với startup có team đầy đủ.

| Chi phí | Optimistic | Base | Pessimistic | Đơn vị | Ghi chú / Note |
|---|---|---|---|---|---|
| **Lương founder (self-pay)** | `0` | `10,000,000` | `20,000,000` | VND/tháng | MVP: có thể bằng 0 nếu founder có nguồn thu khác. Pessimistic: founder trả lương đầy đủ |
| **Tools & subscriptions** | `200,000` | `500,000` | `1,000,000` | VND/tháng | Figma Free/Pro, GitHub, Sentry free, Mixpanel free |
| **Marketing & content** | `0` | `1,200,000` | `2,200,000` | VND/tháng | Đã chi tiết ở mục 4 — organic-first, chủ yếu $0 |
| **→ Tổng Fixed Cost / tháng** | `200,000` | `11,700,000` | `23,200,000` | VND/tháng | Solo founder bootstrap thực tế — không có office, không có team |

---

## 6. Initial Investment / Vốn đầu tư ban đầu

| Chỉ số | Optimistic | Base | Pessimistic | Đơn vị | Ghi chú / Note |
|---|---|---|---|---|---|
| **Vốn đầu tư ban đầu (build MVP, setup)** | `5,000,000` | `10,000,000` | `20,000,000` | VND | Chi phí 1 lần: 3D asset purchase, domain, tools setup. MVP ship trong 4–6 tuần (file constraint) |
| **Tiền mặt ban đầu (sau khi đã trừ vốn đầu tư)** | `100,000,000` | `50,000,000` | `20,000,000` | VND | Runway để duy trì fixed cost trong giai đoạn pre-revenue |

---

## 7. Discount Rate / Tỷ suất chiết khấu (cho NPV)

| Chỉ số | Optimistic | Base | Pessimistic | Đơn vị | Ghi chú / Note |
|---|---|---|---|---|---|
| **Annual discount rate (WACC)** | `20.0%` | `20.0%` | `20.0%` | %/năm | Mức kỳ vọng tối thiểu cho dự án AI/marketplace rủi ro tại VN |
| **→ Monthly discount rate** | `1.5%` | `1.5%` | `1.5%` | %/tháng | = (1 + 20%)^(1/12) - 1 ≈ 1.53% |

---

## 8. Decision Note / Ghi chú quyết định

### Tại sao chọn các con số trên?

**YourSpace là nền tảng marketplace/aggregator** kết nối người trẻ Việt (25–35 tuổi) với nhà cung cấp nội thất thông qua trải nghiệm "sống thử phong cách" bằng AI 3D. Doanh thu đến từ **take-rate 8% trên GMV giao dịch thật qua escrow** (không phải affiliate click-out thuần); **subscription/showcase cho nhãn hàng = phase B2B sau**, chưa tính vào base. Do đó:

```
ARPU = GMV/đơn × Commission Rate
     = 10,000,000 VND × 8%
     = 800,000 VND/đơn   (Base case)
```

**Logic bảo vệ trước nhà đầu tư:**

| Chỉ số | Giá trị | Nguồn |
|---|---|---|
| GMV 10 triệu/đơn | Sofa/giường/bàn ăn trung cấp 1 món. Day16 ghi rõ "5–10tr/giao dịch" | Khảo sát giá thị trường nội thất VN 2024 + Day16 Submission |
| Commission 8% | Đối tác trực tiếp (không qua Shopee). Benchmark: sàn nội thất VN 3–10%, Houzz 15% | Benchmark sàn nội thất VN + quốc tế |
| TAM 65,000/tháng | Thị trường online HCM+HN segment trung cấp ~650 tỷ/tháng ÷ 10tr/đơn | Tính từ market size + GMV/đơn |
| SOM 300 đơn/tháng | Giới hạn bởi capacity founder — organic marketing 1 người. Từ Day16: 5,000–10,000 đơn/24 tháng | Day16 Submission — SOM estimate |
| Adoption 0.46%/tháng | = SOM (300) ÷ TAM (65,000). Thấp là đúng — startup mới chiếm phần nhỏ thị trường lớn | Day16 Submission — SOM estimate |
| COGS thấp nhưng ≠ 0 | Depth (Depth Anything V2, 1 lần/ảnh, cache — D3b) + inpainting đều chạy cloud trả-theo-lượt (D3) → có chi phí API/lượt cho cả hai | Day16 PRD — Model Selection Rationale |

**Break-even analysis (Base case):**
```
Doanh thu / tháng = 300 đơn × 800,000 VND    = 240,000,000 VND
Fixed Cost / tháng                            =  11,700,000 VND
COGS / tháng (đã gồm API inpainting)         =   1,200,000 VND
→ Lợi nhuận gộp                              = 227,100,000 VND/tháng

Break-even cần: 11,700,000 ÷ 800,000 ≈ 15 đơn/tháng
→ Cực kỳ dễ đạt — ngay tuần đầu launch nếu có 15 đơn
```

**LTV/CAC (Base case):**
```
LTV = ARPU/đơn × (tần suất/năm × vòng đời/12)
    = 800,000 × (1.5 × 12.5/12)
    = 800,000 × 1.5625
    = 1,250,000 VND

CAC = 100,000 VND (kể cả quy đổi thời gian founder)

LTV/CAC = 1,250,000 ÷ 100,000 = 12.5x ✅ (Benchmark tốt: > 3x)
Payback period = 100,000 ÷ 800,000 = 0.125 tháng (~4 ngày) ✅
```

> **Rủi ro lớn nhất (RAT):** User chỉ "chơi" kéo thả cho vui, không click mua → Click-to-Buy Rate ≈ 0% → không có GMV giao dịch → không có doanh thu take-rate. Cần validate bằng experiment Photoshop (5 ảnh × 20 người) TRƯỚC khi code. *(Day16 Submission, mục 11.1)*