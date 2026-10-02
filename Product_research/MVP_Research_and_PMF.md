---
derives_from: [D3@7fbc47fb, D4@bb7f1ffe, D3b@4248a41d]
---
## 9. MVP Boundaries

Dựa trên định vị "Nền tảng phong cách sống" (Style-first) để test giả thuyết cốt lõi nhanh nhất, ranh giới cho phiên bản MVP đầu tiên được xác định như sau:

**In-Scope (Tính năng cốt lõi bắt buộc để test giả thuyết):**
- **Khám phá Style Palette:** Chọn và duyệt danh mục nội thất được nhóm theo các phong cách thay vì theo công năng (Bàn, Ghế), giải quyết "Nghịch lý sự lựa chọn".
- **Tương tác 3D cốt lõi:** Upload ảnh chụp phòng thật, sau đó kéo thả, thêm, xóa, xoay, và căn chỉnh tỷ lệ các mô hình 3D trên nền ảnh đó.
- **AI Spatial Placement:** Tự động ước lượng depth/scale ban đầu để đồ 3D khớp phối cảnh hơn, kèm manual override khi AI sai hoặc confidence thấp.
- **Dự toán & Link Affiliate:** Hiển thị giỏ hàng tóm tắt dự toán chi phí cho các món đồ đang được "ướm thử" kèm link Affiliate out tới website nhà cung cấp.

**Out-of-Scope (Tính năng tốt nhưng không cần cho MVP):**
- **Cộng đồng / Mạng xã hội:** Tính năng chia sẻ bản thiết kế để user khác vào xem, bình luận, hoặc "clone" lại (sẽ phát triển ở giai đoạn scale để tạo network effect).
- **Kết nối chuyên gia tư vấn (M1 = thu-lead):** M1 chỉ thu lead — nút "Tôi muốn tư vấn" thu thập SĐT/Zalo để đội offline gọi lại follow-up. Chat in-app / matching chuyên gia đầy đủ = M2+ (theo D — "3 mục bỏ ngỏ").
- **Thanh toán trực tiếp (In-app Checkout):** MVP chưa cần xử lý cổng thanh toán, chỉ cần redirect (chuyển hướng) người dùng sang sàn hoặc website của đối tác.
- **Quét không gian AR/LiDAR:** Thay vì dùng camera quét map 3D không gian thực tế (tốn nguồn lực dev), MVP chỉ cần dùng ảnh 2D tĩnh làm background.
- **Style Quiz AI:** Gợi ý phong cách bằng câu hỏi trắc nghiệm (cần tích lũy đủ dữ liệu interaction của khách hàng trước, sẽ triển khai ở phase sau).

**Non-Goals (Ranh giới đỏ — Sản phẩm sẽ KHÔNG làm):**
- **KHÔNG làm phần mềm vẽ kỹ thuật chuyên nghiệp:** Không hướng tới việc thay thế AutoCAD/SketchUp để đo đạc kích thước chính xác đến từng milimet hay xuất bản vẽ thi công cho thợ.
- **KHÔNG làm sàn E-commerce nặng về vận hành:** Không tự quản lý kho bãi, không tự xử lý logistics, giao hàng hay giải quyết đổi trả (Giữ mô hình asset-light).
- **KHÔNG tự sản xuất nội thất:** Không trở thành một thương hiệu bán lẻ nội thất (như IKEA), chỉ đóng vai trò là nền tảng kết nối (Platform/Aggregator).

---

## 10. PRD Skeleton — Workshop 2

> 🔗 **Bản lịch sử:** §10 dưới đây là bản nhúng PRD Skeleton cũ, dừng cập nhật từ 2026-10-02. PRD hiện hành là `Product/PRD.md` v2.0 (flow chuẩn ở §4.2, user story theo epic ở `Product/prd/epics/`). Khi khác nhau, `Product/PRD.md` là chuẩn.

> **Mục tiêu:** Xác định quyết định sản phẩm (Product Decision) ở Tầng 5 (UX & Prototype) — thống nhất **"Cái gì"** và **"Tại sao"**, không đi sâu vào kỹ thuật "Làm thế nào".

---

### 10.1. Problem Statement

> Người trẻ Việt Nam (25–35 tuổi) coi không gian sống là biểu hiện bản sắc cá nhân, nhưng không có công cụ nào giúp họ khám phá gu thẩm mỹ, hình dung phong cách đó trong căn phòng thật, và biết mua gì ở đâu — dẫn đến 2–4 tuần đắn đo cho mỗi quyết định mua nội thất 5–30 triệu VNĐ, tỉ lệ mua nhầm/hối hận cao, hoặc bỏ cuộc hoàn toàn và sống với không gian không ưng ý.

**Tác động kinh tế:**
- Người dùng: Lãng phí trung bình 5–15 triệu VNĐ/lần mua nhầm nội thất + chi phí cơ hội 2–4 tuần research thủ công.
- Thị trường: Ngành nội thất VN ~$9.76 tỷ USD/năm (Mordor) nhưng cực kỳ phân mảnh, tỷ lệ chuyển đổi online thấp vì thiếu trải nghiệm trực quan.

---

### 10.2. Target User

| Thuộc tính | Mô tả |
|---|---|
| **Tên segment** | Young Aesthetes — Người trẻ định hình phong cách sống qua không gian |
| **Độ tuổi** | 25–35 tuổi |
| **Bối cảnh** | Đang hoặc sắp sở hữu nhà/căn hộ đầu tiên tại thành phố lớn (HCM, HN, Đà Nẵng) |
| **Thu nhập** | Trung bình-khá (15–40 triệu VNĐ/tháng) |
| **Hành vi số** | Lướt TikTok, Pinterest, Facebook group "Nghiện Nhà" (500K+ thành viên) hàng ngày để tìm cảm hứng |
| **Tâm lý cốt lõi** | Coi căn phòng là sự kéo dài bản sắc cá nhân — muốn phòng phản ánh "mình là ai", không phải chỉ "có chỗ ngồi" |
| **Rào cản chính** | Có gu thẩm mỹ nhưng không gọi tên được phong cách, không hình dung được đồ trong phòng thật, không biết mua đâu cho đúng |

---

### 10.3. User Stories

#### User Story #1 — Khám phá phong cách (Need #1)
> **As a** người trẻ đang muốn trang trí phòng nhưng chưa biết mình thích phong cách gì,
> **I want** duyệt qua các phong cách nội thất (Japandi, Wabi Sabi, Mid-Century, Scandinavian…) với hình ảnh minh họa trực quan và mô tả ngắn gọn dễ hiểu,
> **so that** tôi có thể gọi tên được gu thẩm mỹ của mình và biết hướng đi cụ thể thay vì mơ hồ lưu ảnh trên Pinterest.

**Acceptance criteria:**
- Hiển thị **2–3 phong cách** nội thất ở M1 (5 phong cách là mục tiêu sau khi validate), mỗi phong cách có ảnh minh họa + mô tả đặc trưng (màu sắc, chất liệu, cảm xúc).
- User có thể chọn 1 phong cách để xem toàn bộ catalog đồ nội thất thuộc phong cách đó.
- Thời gian từ lúc mở app đến lúc chọn được phong cách ≤ 60 giây.

#### User Story #2 — Ướm thử trong phòng thật (Need #2)
> **As a** người đã chọn được phong cách Japandi và muốn xem nó trông như nào trong phòng mình,
> **I want** upload ảnh chụp căn phòng thật, rồi kéo thả các món đồ nội thất 3D (sofa, bàn, kệ, đèn) từ phong cách đó vào ảnh, di chuyển, xoay, thêm và xóa tự do,
> **so that** tôi có thể "sống thử" trực quan với phong cách đã chọn trong chính không gian của mình trước khi bỏ tiền mua bất kỳ thứ gì.

**Acceptance criteria:**
- User upload được ảnh phòng (chụp từ điện thoại hoặc chọn từ thư viện).
- Catalog hiển thị đồ nội thất 3D đã được phân loại theo phong cách đã chọn ở bước trước.
- User có thể: kéo thả đồ vào ảnh, di chuyển vị trí, xoay, phóng to/thu nhỏ, và xóa từng món.
- Render mô hình 3D trên nền ảnh 2D mượt mà (≥ 30fps trên thiết bị tầm trung).

#### User Story #3 — Xem dự toán chi phí (Need #3)
> **As a** người đã phối xong căn phòng với các món đồ Japandi ưng ý,
> **I want** xem tổng chi phí ước tính của tất cả đồ đang đặt trong phòng, kèm thông tin giá và link mua từ nhà cung cấp uy tín,
> **so that** tôi có thể lên ngân sách chính xác và bắt đầu mua sắm ngay mà không phải tự tìm kiếm từng món trên Shopee.

**Acceptance criteria:**
- Hiển thị danh sách tất cả món đồ đã đặt vào phòng, kèm: tên sản phẩm, ảnh thumbnail, giá tham khảo (VNĐ).
- Tổng chi phí ước tính tự động cập nhật khi thêm/xóa đồ.
- Mỗi sản phẩm có nút "Xem chi tiết / Mua" redirect ra website hoặc sàn TMĐT của nhà cung cấp.

#### User Story #4 — AI hỗ trợ đặt đồ thông minh trong không gian (In-scope MVP)
> **As a** người đang kéo thả đồ nội thất vào ảnh chụp phòng thật,
> **I want** AI tự động ước lượng độ sâu (depth) và tỉ lệ (scale) của căn phòng từ ảnh, rồi điều chỉnh kích thước và vị trí món đồ cho khớp với phối cảnh thật, phải trông rất thật để tôi có thể ướm không gian của mình
> **so that** đồ nội thất trông tự nhiên và đúng tỉ lệ trong ảnh, thay vì bị lơ lửng, to quá hoặc nhỏ quá so với không gian thật.

**Acceptance criteria:**
- Khi user upload ảnh phòng, AI phân tích ảnh để tạo depth map (bản đồ độ sâu) cơ bản.
- Khi user kéo thả 1 món đồ vào vị trí trong ảnh, hệ thống tự động scale đồ theo depth tại điểm đó (đồ ở xa nhỏ hơn, đồ ở gần to hơn).
- User có thể **override** (chỉnh tay) kích thước/vị trí nếu AI ước lượng sai (Human-in-the-loop).
- User có thể xoay item **quanh trục Y** (xoay hướng đồ trái/phải để căn cho khớp phòng). KHÔNG hỗ trợ xoay tự do 360° đa trục — đã chốt cắt theo Stress-Test S4 (giữ MVP nhẹ, không thành 3D editor).
- Khi xóa đồ, ảnh nền phía sau được khôi phục bằng **cloud inpainting** (D3); fallback khi kết quả xấu = hiển thị lại ảnh gốc tại vùng bị che.
- Thời gian xử lý depth map ≤ 5 giây cho ảnh độ phân giải điện thoại thông thường.

---

### 10.4. MVP Scope

*(Tham chiếu đầy đủ từ Mục 9 — MVP Boundaries ở trên)*

| Phân loại | Nội dung |
|---|---|
| **In-Scope (Giai đoạn NOW)** | (1) Khám phá theo phong cách (Style Palette), (2) Tương tác 3D cốt lõi (kéo thả, xoay, xóa, manual resize), (3) **AI Spatial Placement** để ước lượng depth/scale ban đầu, (4) Bảng dự toán + Link mua Affiliate |
| **Out-of-Scope (Giai đoạn NEXT/LATER)** | Cộng đồng mạng xã hội, Thanh toán In-app, Quét AR/LiDAR (LATER), **Style Quiz AI** (LATER), AI tự phối toàn bộ phòng thay user (LATER) |
| **Non-Goals** | KHÔNG làm phần mềm kỹ thuật (AutoCAD), KHÔNG làm sàn TMĐT nặng (logistics/kho), KHÔNG tự sản xuất nội thất |

**Scope decision:** *AI Spatial Placement có nằm trong MVP không?*
→ **CÓ.** Đây là điểm khác biệt giúp trải nghiệm "ướm thử" đủ thật và đủ nhanh để tạo niềm tin mua hàng. Rủi ro scope được kiểm soát bằng manual override, confidence fallback, và baseline test Depth Anything V2 trên ảnh phòng Việt Nam trước khi launch.

---

### 10.5. Success Metrics

| Metric | Định nghĩa | Target (3 tháng đầu) | Tại sao đo metric này |
|---|---|---|---|
| **Activation Rate** | % user hoàn thành luồng: Chọn phong cách → Upload ảnh → Đặt ≥ 1 món đồ | ≥ 30% | Đo lường ý định thực sự của user. |
| **Save/Share Rate** | % user lưu lại bản thiết kế sau khi phối đồ | ≥ 20% | Proxy cho "intent to buy". Nằm trong KR1 của OKR Quý 1. |
| **Click-to-Buy Rate** | % user nhấn "Xem chi tiết / Mua" trên ít nhất 1 sản phẩm | ≥ 15% | Đo khả năng sinh doanh thu Affiliate (Lagging metric - KR2). |
| **Return Rate (D7)** | % user quay lại app trong vòng 7 ngày | ≥ 25% | Đo retention, nằm trong KR3 của OKR Quý 1. |

---

### 10.6. Dependencies & Constraints

#### Dependencies (Phụ thuộc bên ngoài)

| Dependency | Mô tả | Rủi ro | Mitigation |
|---|---|---|---|
| **Catalog 3D** | Khởi đầu **16–24 mô hình 3D** nội thất chất lượng khá (2–3 phong cách × ~8 models) — đã chốt giảm scope theo Stress-Test S3 (75 models là quá nặng cho solo founder). 5 phong cách là mục tiêu SAU khi validate. | Tự tạo/curate 3D tốn thời gian + chi phí | Giai đoạn MVP: sử dụng free/paid 3D assets từ Sketchfab, TurboSquid, CGTrader. Về lâu dài: partner với nhà cung cấp để họ cung cấp 3D scan sản phẩm thật |
| **Dữ liệu giá + nguồn mua** | Cần giá tham khảo và link mua thật cho mỗi sản phẩm 3D | Giá biến động, link hết hạn | MVP dùng giá tham khảo (khoảng giá), cập nhật thủ công hàng tháng. Scale: API tự động crawl giá từ đối tác |
| **3D Rendering Engine** | Rendering 3D trên mobile (React Native + Three.js/Expo GL, hoặc native SceneKit/ARCore) phụ thuộc vào GPU thiết bị | Điện thoại cũ render chậm/lag | Set minimum requirement (iPhone 8+ / Android mid-range 2020+), cung cấp fallback 2D preview cho thiết bị yếu |
| **AI Depth Estimation** | Model ước lượng độ sâu từ ảnh 2D (MiDaS / Depth Anything) để đặt đồ khớp phối cảnh | Độ chính xác depth map phụ thuộc chất lượng ảnh, góc chụp | Cho phép user override thủ công (pinch-to-resize), cung cấp hướng dẫn chụp ảnh tối ưu |

#### Constraints (Giới hạn nguồn lực)

| Constraint | Chi tiết |
|---|---|
| **Team size** | Solo founder — 1 người phụ trách cả product, design, development |
| **Timeline** | **M1 (Validation)** cần ship trong 4–6 tuần để kịp validate giả thuyết (theo D5). Đây là mốc M1, KHÔNG phải toàn bộ sản phẩm — MVP thật (M2, có escrow + mobile native) là ~3–4 tháng sau đó |
| **Budget** | Bootstrap, chưa có funding — ưu tiên free/low-cost tools (Three.js miễn phí, hosting trên Vercel/Netlify free tier, AI API dùng free quota) |
| **Platform** | **M1 = Web-first** (theo D5) — tái dùng PoC `WebApp/`, iterate nhanh cho solo founder, không vướng App Store; deploy web/PWA. **Mobile native (iOS + Android qua React Native / Flutter) lùi về M2** — dù user chụp ảnh phòng bằng điện thoại và kéo thả trên touchscreen tự nhiên hơn, web/PWA mobile vẫn đáp ứng được luồng validate ở M1 |
| **Catalog limit** | MVP khởi đầu **2–3 phong cách × ~8 sản phẩm = 16–24 models** (đã chốt giảm từ 75 theo Stress-Test S3). Đủ để test giả thuyết; mở rộng lên 5 phong cách SAU khi validate |

---

### 10.7. Model Selection Rationale (AI-Specific #1)

**Tính năng AI trong MVP:** Spatial Placement — ước lượng độ sâu căn phòng từ ảnh 2D để đặt đồ nội thất khớp phối cảnh + inpainting khi xóa đồ.

| Tiêu chí | Lựa chọn | Lý do |
|---|---|---|
| **Depth Estimation** | **Depth Anything V2** (open-source) hoặc **MiDaS** (Intel) — ở M1-web chạy **server-side/cloud** qua API hosted, cache theo hash ảnh, sau interface `AIGateway.depth()` để M2-mobile swap on-device (D3b) | Depth chỉ tính **1 lần/ảnh lúc upload**, drag chỉ đọc depth map đã có → không cần on-device để mượt. Web không có NPU, in-browser cần WebGPU chưa phổ cập. Depth Anything V2 small đủ chính xác cho use case "scale đồ theo phối cảnh" |
| **Inpainting (xóa đồ)** | **MVP = cloud inpainting qua API hosted trả-theo-lượt** (Replicate hoặc tương đương — D3). Fallback = hiện lại ảnh gốc tại vùng bị che | Đã chốt (D3 + Stress-Test S2): KHÔNG build LaMa tự host trong MVP (200MB, không chạy nổi máy tầm trung). Ảnh gửi lên cloud xử lý và **xóa ngay** (zero-retention). LaMa tự host = nghiên cứu cho hướng on-device tương lai, không phải build MVP |
| **Ranh giới on-device vs cloud?** | M1: **cả depth và inpainting chạy cloud**. Depth tính 1 lần/ảnh lúc upload (không per-frame) → drag không gọi model. Inpainting chỉ chạy khi xóa đồ → cloud cho chất lượng tốt mà không nuôi GPU server | Tiền đề cũ "depth cần real-time mỗi lần drag nên phải on-device" đã được sửa (D3b, 2026-07-24). On-device là hướng M2-mobile / tầm nhìn dài hạn |
| **Tại sao không dùng ARKit/ARCore full?** | Yêu cầu camera live + quét không gian → phức tạp, Out-of-scope MVP. Depth from single image đủ tốt cho "ướm thử" | Giảm ma sát: user chỉ cần 1 ảnh chụp, không cần quét phòng |
| **Trade-off chấp nhận được** | Depth từ ảnh 2D kém chính xác hơn LiDAR/ARKit (~±15-20% sai số) nhưng đủ cho trải nghiệm trực quan. User có thể chỉnh tay (pinch-to-resize) | Human-in-the-loop bù đắp sai số |

---

### 10.8. Data Requirements / Data Source (AI-Specific #2)

| Nguồn dữ liệu | Mục đích | Chủ sở hữu | Cập nhật |
|---|---|---|---|
| **3D Furniture Catalog** | Metadata cho **16–24 mô hình 3D** (tên, phong cách, kích thước thật, giá tham khảo, link mua, file .glb/.gltf) — đã chốt giảm từ 75 (Stress-Test S3) | YourSpace curate từ Sketchfab/CGTrader + đối tác tương lai | Founder thêm thủ công trong MVP |
| **Depth Estimation Model** | Depth Anything V2 Small — ở M1-web gọi qua API hosted server-side (không bundle cùng app); bundle on-device là hướng M2-mobile (D3b) | Open-source (MIT license) | Cập nhật khi có version mới cải thiện accuracy |
| **Style Knowledge Base** | Mô tả chi tiết **2–3 phong cách** nội thất ở M1 (5 phong cách là mục tiêu sau) (đặc trưng, palette, chất liệu). Dùng cho UI hiển thị, không cho AI | YourSpace tự biên soạn | Founder cập nhật khi thêm phong cách mới |
| **User Interaction Logs** | Phong cách nào được chọn, đồ nào hay kéo vào, đồ nào hay bị xóa, tần suất override AI scale → training data tương lai | YourSpace (auto-collected) | Real-time logging |
| **Ảnh phòng user upload** | Ảnh 2D làm background + input cho depth estimation và cloud inpainting (đều chạy cloud ở M1) | User sở hữu | Ảnh **gửi lên cloud lúc upload để tính depth** (1 lần, cache kết quả theo hash ảnh — D3b); khi user xóa đồ, ảnh (hoặc vùng cần xóa) được **gửi lên để inpainting**; xử lý xong **xóa ngay (zero-retention)** — D3. Onboarding phải ghi rõ consent này, KHÔNG dùng câu "không upload ảnh" |

**Lưu ý quan trọng về dữ liệu:**
- AI trong M1: **cả depth estimation (1 lần/ảnh, cache theo hash — D3b) và inpainting đều chạy trên cloud** (API hosted trả-theo-lượt — D3). → Có chi phí API/lượt cho cả hai (KHÁC 0), cần đưa vào COGS. "AI 100% on-device" là tầm nhìn dài hạn, KHÔNG phải MVP.
- Privacy = consent thật: ảnh phòng gửi lên cloud để xử lý và xóa ngay (zero-retention); cần DPIA theo NĐ13. KHÔNG tuyên bố "không upload ảnh" (sai sự thật, rủi ro pháp lý).
- **Không dùng RAG, không fine-tune** ở giai đoạn MVP.
- Chiến lược dài hạn: Tích lũy interaction logs (đồ nào user hay override scale?) → cải thiện heuristic đặt đồ + data cho Style Quiz AI ở phase sau.

---

### 10.9. Fallback UX (AI-Specific #3)

> *"Hãy tưởng tượng AI bị ngáo — bạn sẽ thiết kế gì cho người dùng?"*

#### Nguyên tắc thiết kế Fallback:

1. **Quản trị kỳ vọng** — Cảnh báo trước, không hứa hẹn quá mức.
2. **Human-in-the-loop** — User luôn chốt quyết định cuối cùng.
3. **Handover mượt mà** — Khi AI fail, user không bị "kẹt" mà có đường đi tiếp.

#### Kịch bản Fallback cụ thể:

| # | Tình huống AI fail | Trigger | Hành động hệ thống | UI cho người dùng |
|---|---|---|---|---|
| **F1** | **AI scale đồ sai tỉ lệ** (to/nhỏ quá so với phòng) | User pinch-to-resize ngay sau khi đặt đồ, HOẶC kích thước đồ chênh > 30% so với tỉ lệ kỳ vọng từ depth map | Ghi log `scale_override`, cho phép chỉnh tay tự do | Hiển thị handle resize rõ ràng + tooltip: *"Kéo để chỉnh kích thước cho vừa ý bạn"* |
| **F2** | **AI đặt đồ sai vị trí depth** (đồ lơ lửng, không chạm sàn) | Depth map có confidence thấp tại vùng user thả đồ, HOẶC user di chuyển đồ ngay sau khi thả | Snap đồ xuống "đường sàn" ước lượng gần nhất, cho phép user drag tự do | Hiển thị grid/guideline mờ trên ảnh giúp user căn vị trí. Tooltip: *"Giữ và kéo để đặt đúng chỗ"* |
| **F3** | **Xóa đồ nhưng inpainting xấu** (vùng xóa bị nhòe, artifact) | User xóa item và vùng phía sau bị lỗi thị giác rõ rệt | Fallback: hiển thị lại pixel gốc từ ảnh ban đầu (không dùng inpainting AI) | Tự động reveal ảnh gốc. Nếu user đã đặt nhiều đồ chồng lên → hiện nút *"Khôi phục ảnh gốc"* để reset vùng đó |
| **F4** | **Ảnh upload chất lượng kém** (mờ, góc lạ, quá tối) | Depth estimation trả về confidence < 0.4 trên > 50% diện tích ảnh | Không block user — vẫn cho sử dụng nhưng tắt auto-scale, chuyển sang manual mode | Hiển thị: *"Ảnh hơi khó phân tích — bạn sẽ tự chỉnh kích thước đồ nhé. Mẹo: chụp thẳng, đủ sáng, thấy rõ sàn nhà."* + Nút [Chụp lại] |
| **F5** | **Không lấy được depth** (API depth cloud lỗi hoặc quá chậm) | API depth trả lỗi hoặc > 15 giây | Tắt hoàn toàn AI depth, chuyển sang pure manual mode (user tự resize tất cả) | Hiển thị: *"Hệ thống chưa phân tích được ảnh — bạn có thể tự chỉnh kích thước bằng tay."* Trải nghiệm core (kéo thả, xoay, xóa) vẫn hoạt động 100% |
| **F6** | **User muốn undo thao tác** | User nhấn nút Undo hoặc shake device | Hoàn tác hành động gần nhất (thêm/xóa/di chuyển/resize) | Nút Undo luôn hiển thị. Hỗ trợ multi-undo (≥ 10 bước) |

#### Nguyên tắc bất di bất dịch:

> 🔒 **AI KHÔNG BAO GIỜ tự động thay đổi dữ liệu của user.** AI chỉ đóng vai trò **hỗ trợ** (assist), user là người **chốt** (decide). Cụ thể:
> - AI **gợi ý** scale/vị trí khi thả đồ, nhưng user **luôn có thể override** bằng pinch/drag.
> - AI **KHÔNG** tự động xóa, thêm, hoặc thay đổi đồ mà user đã đặt.
> - AI **KHÔNG** tự động di chuyển layout khi user thêm đồ mới.
> - Khi AI không chắc chắn (low confidence), **chuyển sang manual mode** thay vì đoán bừa.
>
> Mọi hành động thay đổi canvas đều phải có thao tác chủ động từ user (drag, tap, pinch, confirm).

---

### 10.10. Clarity Review Gate

Kiểm tra cuối cùng để đảm bảo PRD đủ rõ ràng:

| Tiêu chí | Kết quả | Ghi chú |
|---|---|---|
| User Stories mô tả **hành vi**, không mô tả giao diện UI? | ✅ | Các story mô tả "tôi muốn kéo thả đồ", "AI tự động scale" (hành vi), không mô tả UI cụ thể |
| Fallback UX chỉ rõ **trigger** và **hành động cụ thể**? | ✅ | 6 kịch bản bao phủ: scale sai, depth sai, inpainting lỗi, ảnh kém, không lấy được depth, undo — mỗi cái có trigger + action rõ ràng |
| Model Selection có **lý do cụ thể**, không chỉ ghi tên model? | ✅ | Giải thích tại sao M1 chạy cả depth (Depth Anything V2, 1 lần/ảnh) lẫn inpainting trên cloud (D3/D3b), tại sao không ARKit full, trade-off sai số chấp nhận được |
| Data Source có **tên nguồn thực tế**? | ✅ | Depth Anything V2 (MIT) qua API hosted server-side cho depth (D3b), Sketchfab/CGTrader cho 3D, cloud inpainting API hosted (Replicate hoặc tương đương) cho xóa đồ — D3 |
| **Kill question:** Engineer đọc User Story + Fallback UX, cần hỏi lại > 3 câu? | ✅ Không | Acceptance criteria có số cụ thể (≤ 5s depth, ≥ 30fps, ±15-20% sai số), Fallback có bảng trigger-action cho cả 6 tình huống |

---

## 11. Workshop 3: Hypothesis & PMF Scorecard

> **Mục tiêu:** Đo lường sự thành công bằng con số, không bằng cảm giác. Mọi tính năng trong PRD đều là một "vụ cá cược" (bet) — workshop này giúp xác định cá cược nào nguy hiểm nhất và cách kiểm chứng nó. *(Tầng 6: Test with Customers)*

---

### 11.1. Bước 1 — RAT (Riskiest Assumption Test)

**Câu hỏi dẫn đường:** *Giả định nào, nếu sai, sẽ khiến toàn bộ dự án sụp đổ — bất kể UX có đẹp đến đâu hay AI có chính xác đến mấy?*

#### Giả định nguy hiểm nhất:

> **"Người dùng sẽ coi trải nghiệm 'sống thử phong cách' trên YourSpace là bước đệm để MUA SẮM THẬT, chứ không phải chỉ là một trò chơi trang trí miễn phí (giống The Sims)."**

#### Phân tích chuỗi hậu quả nếu RAT sai:

```
User chỉ "chơi" kéo thả cho vui, không click mua
        ↓
Click-to-Buy Rate ≈ 0% → Không tạo ra doanh thu affiliate
        ↓
Nhà cung cấp nội thất (Providers) không thấy ROI
        ↓
Providers hủy hợp đồng, rút catalog 3D khỏi nền tảng
        ↓
Catalog trống → User có nhu cầu mua thật không có gì để mua
        ↓
Churn toàn bộ → Mô hình nền tảng sụp đổ
```

**Tại sao đây là giả định nguy hiểm nhất (không phải giả định khác)?**

| Giả định | Mức độ rủi ro | Lý do không phải RAT |
|---|---|---|
| "AI depth estimation đủ chính xác" | Trung bình | Nếu sai → user vẫn chỉnh tay được (Human-in-the-loop). Sản phẩm vẫn hoạt động. |
| "User sẽ upload ảnh phòng thật" | Trung bình | Nếu user ngại upload → có thể cung cấp ảnh phòng mẫu để thử trước. Giải pháp đơn giản. |
| "Catalog 3D đủ đẹp và đa dạng" | Cao, nhưng sửa được | Nếu thiếu → curate thêm từ Sketchfab/CGTrader. Tốn thời gian nhưng không phá mô hình. |
| **"User sẽ mua sau khi thử"** | **CỰC CAO — phá mô hình** | **Nếu sai → KHÔNG CÓ giải pháp kỹ thuật nào cứu được.** Phải pivot toàn bộ value proposition hoặc business model. |

---

### 11.2. Bước 2 — Thiết lập Giả thuyết (Hypothesis)

#### Giả thuyết chính (Primary Hypothesis):

> "Chúng tôi tin rằng **[tính năng panel dự toán chi phí riêng biệt (tách khỏi canvas phối cảnh) — hiển thị tổng chi phí + danh sách đồ kèm nút "Xem chi tiết / Mua" khi user vuốt lên hoặc chuyển sang tab Dự toán]** sẽ giúp **[Young Aesthetes 25–35 tuổi đang trang trí nhà đầu tiên]** đạt được **[chuyển hóa từ hành vi "khám phá/chơi thử" sang hành vi ra quyết định mua sắm thực tế, mà KHÔNG phá vỡ trải nghiệm thẩm mỹ trên canvas]**.
> 
> Chúng tôi sẽ biết mình đúng khi thấy **[Click-to-Buy Rate]** đạt **[≥ 15% trong số user đã hoàn thành ≥ 1 bản phối (đặt ≥ 3 đồ vật vào phòng)]** trong **4 tuần đầu** sau khi ra mắt Prototype."

#### Giả thuyết phụ (Secondary Hypothesis):

> "Chúng tôi tin rằng **[AI Spatial Placement — tự động scale đồ khớp depth/phối cảnh phòng]** sẽ giúp **[Young Aesthetes]** đạt được **[cảm giác "thật" khi ướm thử, đủ tin tưởng để ra quyết định mua]**.
>
> Chúng tôi sẽ biết mình đúng khi thấy **[AI Placement Accuracy — % đồ user KHÔNG cần chỉnh lại sau khi thả]** đạt **[≥ 60%]** và **[Time-to-Value (thời gian từ mở app → đặt đồ đầu tiên)]** đạt **[≤ 3 phút]**."

---

### 11.3. Bước 3 — Aha Moment (Khoảnh khắc nhận ra giá trị)

#### Aha Moment được định nghĩa:

> **Khoảnh khắc user đặt xong món đồ thứ 3 vào ảnh phòng thật, nhìn thấy tổng dự toán chi phí nằm trong ngân sách, và quyết định hành động — nhấn "Xem chi tiết / Mua" hoặc "Tôi muốn tư vấn" để chuyển sang bước hiện thực hóa.**

> **→ Thêm 1 nút CTA phụ "Tôi muốn tư vấn"** bên cạnh nút "Mua" — khi nhấn chỉ thu thập SĐT/Zalo rồi gửi lead cho đội offline. Không cần build chat in-app, nhưng vẫn đo được signal "intent liên hệ tư vấn".

#### Chỉ số hành động (Actionable Metric) cho Aha Moment:

| Metric | Cách đo | Tại sao KHÔNG phải Vanity Metric |
|---|---|---|
| **Aha Conversion Rate** | % user đặt ≥ 3 đồ vào phòng VÀ click ≥ 1 outbound link (Mua/Tư vấn) trong cùng phiên | Đo hành vi có ý định mua, không đo lượt tải hay lượt kéo thả |
| **Repeat Design Rate** | % user tạo bản phối thứ 2 trong vòng 7 ngày | Chứng tỏ user quay lại vì giá trị thật, không phải tò mò lần đầu |
| **Save-then-Return Rate** | % bản phối được lưu mà sau đó user quay lại xem trong vòng 7 ngày | Đo "intent to buy có suy nghĩ" — user lưu → suy nghĩ → quay lại (hành vi mua nội thất cổ điển) |

#### Bẫy Vanity Metric cần tránh:

| ❌ Vanity Metric | Tại sao là bẫy |
|---|---|
| Tổng lượt tải app | Tải xong rồi bỏ = 0 giá trị |
| Tổng số đồ 3D được kéo thả | Kéo thả nhiều = đang chơi game xếp hình, không = muốn mua |
| Thời gian trung bình trong app | Dùng lâu có thể vì UX rối, không phải vì thích sản phẩm |
| Số bản phối được tạo (không kèm click Mua) | Tạo 10 bản nhưng không click Mua lần nào = giải trí thuần túy |

---

### 11.4. Bước 4 — Tín hiệu PMF (PMF Signal)

Nội thất là mua sắm **tần suất thấp** (Low Frequency) — người ta không mua sofa mỗi tuần. Do đó, DAU/WAU không phù hợp làm tín hiệu PMF. Thay vào đó:

#### PMF Signal chính:

| Thước đo | Cách thực hiện | Ngưỡng PMF |
|---|---|---|
| **Sean Ellis Test** | Khảo sát user đã click Mua ≥ 1 lần: *"Bạn sẽ cảm thấy thế nào nếu không thể dùng YourSpace nữa?"* | **≥ 40%** trả lời "Rất thất vọng" |
| **Click-to-Buy Rate** | % user hoàn thành bản phối → click outbound link mua hàng | **≥ 15%** duy trì trong 4 tuần liên tục |
| **Organic Referral Rate** | % user mới đến từ giới thiệu (không qua paid ads) — đo bằng referral code hoặc survey "Bạn biết YourSpace từ đâu?" | **≥ 25%** user mới từ giới thiệu |

#### PMF Signal phụ (Early Warning — tín hiệu sớm):

| Signal | Ý nghĩa |
|---|---|
| User tự chụp ảnh phòng THẬT (không dùng ảnh mẫu) | Intent thật — đang nghiêm túc trang trí phòng mình |
| User lưu bản phối VÀ quay lại xem lại sau ≥ 24 giờ | "Về nhà suy nghĩ" — tín hiệu mua nội thất cổ điển |
| User nhấn "Tôi muốn tư vấn" và để lại SĐT | Cam kết cao nhất — sẵn sàng nói chuyện với người thật |
| User chia sẻ bản phối cho người thân (screenshot/link) | Đang "hỏi ý kiến gia đình" — bước cuối trước khi mua |

---

## 12. Stress-Test bằng AI (AI as a Challenger)

> *Vai trò: **Lead PM tàn nhẫn + Senior AI Engineer hoài nghi.***  
> *Nhiệm vụ: Tìm và phơi bày mọi lỗ hổng. Không khuyến khích. Chỉ tấn công.*
> *Đầu vào: Toàn bộ Workshop 1 (MVP Boundary), Workshop 2 (PRD Skeleton), Workshop 3 (Hypothesis & PMF).*

---

#### 🚨 1. SCOPE CREEP — "In-Scope" nào thực ra là "Nice-to-have"?

| # | Tính năng In-Scope bị nghi ngờ | Phán quyết | Lập luận |
|---|---|---|---|
| **S1** | **AI Spatial Placement (Depth Estimation on-device)** | ⚠️ **MUST-HAVE có rủi ro kỹ thuật cao** | Quyết định sản phẩm hiện tại: AI Spatial Placement là MVP vì nó tạo cảm giác "thật" và giảm ma sát scale thủ công. Rủi ro không nằm ở việc có làm hay không, mà ở mức tự động hóa đến đâu. MVP phải giới hạn scope: AI chỉ gợi ý scale/vị trí ban đầu, user luôn override được, và nếu confidence thấp thì chuyển sang manual mode. |
| **S2** | **Inpainting khi xóa đồ (dù là fallback reveal ảnh gốc)** | ✅ OK nếu chỉ reveal ảnh gốc | Nhưng PRD (mục 10.7) vẫn list LaMa như một lựa chọn. Bạn cần **xóa hẳn LaMa khỏi scope MVP** chứ không phải ghi "hoặc fallback". Mập mờ = scope creep. |
| **S3** | **5 phong cách × 15 sản phẩm = 75 models 3D** | ⚠️ **Quá nhiều cho MVP** | Bạn cần 75 mô hình 3D chất lượng, curate thủ công, gắn metadata (tên, giá, link, phong cách, kích thước thật). Solo founder làm 75 cái = 2–3 tuần chỉ riêng việc curate. **Giảm xuống: 2 phong cách × 8 sản phẩm = 16 models.** Đủ để test giả thuyết. Nếu 16 models mà user vẫn click Mua → validate rồi, thêm sau. |
| **S4** | **Xoay item 360° (User Story #4 Acceptance Criteria)** | ⚠️ **Giảm scope** | Giữ xoay cơ bản để user căn hướng đồ, nhưng không biến nó thành tính năng 3D editor phức tạp. Mục tiêu MVP là đủ thật để ướm thử và click mua, không phải thay thế phần mềm thiết kế. |
| **S5** | **Nút "Tôi muốn tư vấn" + thu thập SĐT/Zalo** | ⚠️ **Scope creep từ Workshop 3** | Tính năng này không có trong PRD ban đầu (Mục 9–10), nhưng Workshop 3 tự thêm vào. Nó tạo ra nghĩa vụ: ai nhận lead? Ai gọi lại? Bạn là solo founder — **bạn sẽ tự gọi điện tư vấn nội thất cho user?** Nếu không có đội offline nhận lead, nút này tạo kỳ vọng rồi gây thất vọng (user để SĐT nhưng không ai gọi lại). **Chỉ giữ nếu bạn cam kết tự gọi lại trong 24h. Nếu không → cắt.** |

---

#### 🤖 2. AI FALLBACK HOLES — Edge cases chưa lường trước

| # | Edge Case | Scenario cụ thể | Tại sao Fallback UX hiện tại KHÔNG cover | Đề xuất |
|---|---|---|---|---|
| **H1** | **Occlusion (che khuất)** | User chụp phòng có bàn thật. Thả ghế 3D "phía sau" bàn → ghế render NỔI LÊN TRÊN bàn. | Fallback UX (F1–F6) không có kịch bản nào xử lý occlusion. Không có trigger, không có UI response. | Onboarding: "Chụp góc phòng trống". Cho user sắp xếp layer (trước/sau) thủ công. |
| **H2** | **Bóng đổ xung đột** | Ảnh ánh sáng từ cửa sổ bên trái. Model 3D bóng từ trên xuống. Hai hướng bóng → phá ảo giác. | Không có trong Fallback. | MVP: tắt bóng đổ hoàn toàn (ambient only). |
| **H3** | **Depth map sai ở vùng gương/kính** | Phòng có gương lớn hoặc cửa kính → depth estimation hiểu reflection là "phòng thứ 2" phía sau → depth map sai hoàn toàn tại vùng đó → item 3D bị scale kỳ quái. | Fallback F4 chỉ cover "ảnh mờ/tối", không cover reflective surfaces — vốn rất phổ biến trong phòng ngủ/phòng khách Việt Nam. | Thêm cảnh báo: "Tránh chụp thẳng vào gương hoặc cửa kính." Hoặc: tự detect vùng depth bất thường (giá trị depth đột ngột nhảy vọt) → đánh dấu là "vùng không tin cậy" → manual mode tại vùng đó. |
| **H4** | **User chụp ảnh phòng ban đêm (thiếu sáng)** | Depth Anything V2 hoạt động kém trên ảnh thiếu sáng (noise cao, contrast thấp). User Việt Nam hay chụp ảnh phòng buổi tối sau giờ làm. | F4 cover "ảnh quá tối" nhưng trigger là "confidence < 0.4 trên > 50% diện tích". Vấn đề: depth model **vẫn có thể trả confidence cao trên ảnh tối** vì model không biết nó đang sai — nó confident nhưng wrong. Trigger dựa vào confidence score là không đủ. | Thêm pre-check trước khi chạy depth: đo brightness trung bình của ảnh. Nếu < threshold → cảnh báo ngay: "Ảnh hơi tối, bật đèn rồi chụp lại nhé!" |
| **H5** | **Cùng 1 ảnh, 2 lần upload → 2 depth map khác nhau** | Depth Anything V2 là deterministic trên cùng input, nhưng nếu user crop ảnh khác nhau hoặc app resize ảnh trước khi feed vào model (do khác tỉ lệ màn hình) → depth map khác → đồ đã đặt bị nhảy scale khi mở lại. | Fallback không cover "inconsistency giữa các session". User đặt 5 đồ, lưu, mở lại → tất cả bị scale sai vì depth map mới khác cũ. | Cache depth map theo ảnh gốc (hash). Khi mở lại bản phối → dùng depth map đã cache, không tính lại. |
| **H6** | **3D model kích thước metadata sai** | Bạn curate model từ Sketchfab — nhưng nhiều model trên đó không có kích thước thật (real-world dimensions). Một cái sofa có thể được model ở scale 1:1 hoặc 1:100. AI auto-scale dựa vào depth + kích thước thật của đồ → nếu metadata sai → scale sai toàn bộ, AI bị "đổ tội oan". | Fallback F1 cover "scale sai" nhưng giả định nguyên nhân là depth estimation sai. Thực tế nguyên nhân có thể là **data catalog bẩn**. Bạn không có validation pipeline cho 3D metadata. | Tạo checklist QA cho mỗi model 3D trước khi thêm vào catalog: verify kích thước thật (cm), verify origin point, verify up-axis. Nếu không pass → không deploy. |

---

#### 📊 3. VANITY METRIC TRAP — Aha Moment có thật sự Actionable?

**Aha Moment hiện tại:** *"User đặt ≥ 3 đồ + thấy tổng chi phí hợp ngân sách + click Mua/Tư vấn."*

**Phê bình:**

| Vấn đề | Chi tiết |
|---|---|
| **"≥ 3 đồ" là ngưỡng tùy tiện** | Tại sao 3 chứ không phải 1 hay 5? Bạn không có dữ liệu nào chứng minh 3 là điểm bùng phát (inflection point). Nếu user đặt 1 cái sofa ưng ý và click Mua ngay → đó cũng là Aha Moment. Ngưỡng 3 có thể khiến bạn bỏ sót những user có intent mua cao nhất (người biết chính xác mình cần gì, chỉ cần 1 item). **Đề xuất: Bỏ ngưỡng số lượng đồ. Aha = "User click outbound link Mua/Tư vấn ≥ 1 lần trong phiên có upload ảnh phòng THẬT."** |
| **"Thấy tổng chi phí hợp ngân sách" — bạn không đo được** | Bạn không hỏi ngân sách user. Bạn không biết "hợp" hay "không hợp". Đây là giả định nằm trong định nghĩa Aha Moment nhưng hoàn toàn không đo được. **Đề xuất: Bỏ điều kiện này. Chỉ đo hành vi (click Mua), không đoán tâm lý (hợp ngân sách).** |
| **Click-to-Buy vẫn có thể là Vanity** | User click "Xem chi tiết" ra Shopee vì **tò mò giá thật** (so với giá tham khảo trên app), không phải vì muốn mua. Đặc biệt nếu giá trên app là "khoảng giá" (ví dụ: 5–8 triệu) → user click ra để xem giá chính xác. Đó là click tò mò, không phải click mua. **Đề xuất: Đo "Click-to-Buy → Dwell time ≥ 30s trên site đối tác" bằng UTM + redirect tracking. Nếu user bounce trong < 10s → không tính là Aha.** |

**Metric thay thế tốt hơn (Leading Indicator):**

> **"% user upload ảnh phòng THẬT (không dùng ảnh mẫu) VÀ click outbound link Mua ≥ 1 lần trong cùng session."**
> 
> Tại sao tốt hơn: Upload ảnh thật = intent thật (đang nghiêm túc trang trí phòng MÌNH). Kết hợp với click Mua = hành vi chuyển đổi rõ ràng. Không phụ thuộc vào ngưỡng số đồ hay giả định về ngân sách.

---

#### 💀 4. HYPOTHESIS WEAKNESS — Giả thuyết nào yếu nhất?

**Giả thuyết yếu nhất: Giả thuyết phụ (Secondary Hypothesis) về AI Spatial Placement.**

| Điểm yếu | Phân tích |
|---|---|
| **Không có baseline để so sánh** | Bạn đặt target "AI Placement Accuracy ≥ 60%". Nhưng bạn chưa từng chạy Depth Anything V2 trên ảnh phòng Việt Nam (thường nhỏ, nhiều đồ, ánh sáng yếu). Bạn không biết baseline hiện tại là bao nhiêu. Có thể nó chỉ đạt 30% trên ảnh phòng thật của target user. **Bạn đang đặt target mà không biết điểm xuất phát.** |
| **Cách invalidate dễ nhất** | Chụp 20 ảnh phòng thật (phòng trọ, chung cư, nhà phố ở HCM/HN) → chạy Depth Anything V2 → đo xem depth map có hợp lý không. Nếu > 50% ảnh cho depth map tệ → **giả thuyết phụ sụp ngay trước khi code 1 dòng.** Đây là experiment có thể làm trong 1 ngày mà bạn chưa làm. |
| **Quan hệ nhân quả chưa chứng minh** | Bạn giả định: AI scale chính xác → user cảm thấy "thật" → user mua. Nhưng có thể user cảm thấy "thật" đơn giản vì ảnh phòng là phòng họ, đồ 3D trông đẹp, và bảng giá hợp lý — **bất kể AI có auto-scale hay không**. Bạn đang gán công cho AI mà chưa kiểm tra liệu manual resize có cho kết quả tương đương không. |
| **Conflict với RAT** | RAT nói: "Rủi ro lớn nhất là user không mua." Hypothesis phụ nói: "AI chính xác sẽ khiến user mua." Nhưng nếu RAT đúng (user chỉ chơi game), thì dù AI có accuracy 100%, user vẫn không mua. **AI accuracy là necessary condition, không phải sufficient condition.** Giả thuyết phụ không thể đứng độc lập — nó phụ thuộc vào giả thuyết chính đúng trước đã. |

**Cách invalidate nhanh nhất (1 tuần, zero code):**

1. Tạo 5 ảnh phòng + ghép thủ công (Photoshop/Canva) đồ nội thất vào — 1 bản "ghép vụng" (sai scale) và 1 bản "ghép đẹp" (đúng scale).
2. Cho 20 người thuộc target segment xem cả 2 bản.
3. Hỏi: "Bạn có click Mua không? Bản nào khiến bạn muốn mua hơn?"
4. Nếu kết quả: không ai muốn mua dù bản "ghép đẹp" → **RAT sai, dừng dự án.**
5. Nếu kết quả: bản "ghép đẹp/đúng scale" tạo purchase intent cao hơn đáng kể → **AI Spatial Placement được giữ là MVP**, nhưng cần đo baseline depth accuracy và thiết kế manual fallback trước khi launch.

---

### 12.5. Tổng kết & Action Items từ Stress-Test

> ✅ **CẬP NHẬT (2026-07-23): Các phán quyết scope của Stress-Test dưới đây giờ là QUYẾT ĐỊNH CHÍNH THỨC, không còn là đề xuất.** Cụ thể (theo Decisions Log D3 & D4):
> - **Cắt xoay 360° → chỉ giữ xoay trục Y** (Action #3 / S4) — ĐÃ CHỐT.
> - **Giảm catalog 75 → 16–24 models (2–3 phong cách × ~8)** (Action #4 / S3) — ĐÃ CHỐT.
> - **Không build LaMa tự host nặng trong MVP; inpainting = cloud API hosted (D3), fallback = reveal ảnh gốc** (Action #5 / S2) — ĐÃ CHỐT. LaMa tự host lùi về nghiên cứu hướng on-device tương lai.
> - AI Spatial Placement (S1) giữ là MUST-HAVE bản "Kreativ-lite" (1 ảnh + Depth Anything V2) **có fallback về đặt đồ thủ công** — spike depth-placement chạy sớm ở M1 (D4).
> - **Bổ sung D3b (2026-07-24):** ở M1-web, depth **chạy server-side/cloud** (1 lần/ảnh, cache theo hash — chính là Action #8), không phải on-device. Nhãn "Depth Estimation on-device" ở S1 phía trên phản ánh bối cảnh lúc stress-test, không còn đúng cho M1.

| # | Action | Loại | Mức ưu tiên | Khi nào |
|---|---|---|---|---|
| 1 | **Chạy experiment Photoshop** (5 ảnh × 2 bản × 20 người) để test RAT + giá trị AI trước khi code | Validation | 🔴 P0 | Tuần 1, TRƯỚC khi code |
| 2 | **Chạy Depth Anything V2 trên 20 ảnh phòng VN thật** để xác định baseline accuracy | Validation | 🔴 P0 | Tuần 1 |
| 3 | Cắt xoay 360° khỏi MVP Acceptance Criteria — chỉ giữ xoay trục Y | Scope | 🟡 P1 | Cập nhật PRD |
| 4 | Giảm catalog từ 75 models → 16 models (2 phong cách × 8 sản phẩm) | Scope | 🟡 P1 | Cập nhật PRD |
| 5 | Xóa hẳn LaMa khỏi PRD — MVP chỉ dùng reveal ảnh gốc khi xóa item 3D | Scope | 🟡 P1 | Cập nhật PRD |
| 6 | Tạo QA checklist cho 3D model metadata (kích thước thật, origin, up-axis) | Data | 🟡 P1 | Trước khi import model |
| 7 | Thêm pre-check brightness cho ảnh upload (trước khi chạy depth estimation) | AI Fallback | 🟡 P1 | Trong dev |
| 8 | Cache depth map theo hash ảnh gốc — không tính lại khi mở bản phối cũ | AI Fallback | 🟡 P1 | Trong dev |
| 9 | Setup UTM tracking + redirect dwell-time measurement cho outbound links | Metric | 🟡 P1 | Trước launch |
| 10 | Sửa Aha Moment: bỏ ngưỡng "≥ 3 đồ", bỏ "hợp ngân sách" → đo "upload ảnh thật + click Mua" | Metric | 🟡 P1 | Cập nhật PRD |
| 11 | Quyết định có giữ nút "Tôi muốn tư vấn" hay không — nếu giữ, cam kết tự gọi lại trong 24h | Scope | 🟢 P2 | Trước launch |
