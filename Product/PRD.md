## 10. PRD Skeleton — Workshop 2

> **Mục tiêu:** Xác định quyết định sản phẩm (Product Decision) ở Tầng 5 (UX & Prototype) — thống nhất **"Cái gì"** và **"Tại sao"**, không đi sâu vào kỹ thuật "Làm thế nào".

---

### 10.0. Milestone Map

> **Quy ước quan trọng:** Trừ khi nói rõ khác, **PRD này mô tả scope của M1** (web validation). Các tính năng thuộc M2 được đánh dấu rõ.

| Milestone | Tên | Thời lượng | Phạm vi cốt lõi |
|---|---|---|---|
| **M0** | PoC (đã có) | — | WebApp prototype đã dựng. **KHÔNG gọi là "MVP"** — chỉ để kiểm chứng kỹ thuật đặt đồ + depth. |
| **M1** | Web Validation | 4–6 tuần | Style Palette + ướm thử trong ảnh phòng (AI Spatial Placement kiểu Kreativ-lite) + dự toán. **Mua = link affiliate / thu-lead**, CHƯA có escrow/thanh toán trong app. |
| **M2** | Mobile | 3–4 tháng | App mobile đầy đủ + **escrow qua cổng thanh toán được cấp phép** (supplier chịu bồi hoàn) + kết nối chuyên gia đầy đủ. |

---

### 10.1. Problem Statement

> Người trẻ Việt Nam (25–35 tuổi) coi không gian sống là biểu hiện bản sắc cá nhân, nhưng không có công cụ nào giúp họ khám phá gu thẩm mỹ, hình dung phong cách đó trong căn phòng thật, và biết mua gì ở đâu — dẫn đến 2–4 tuần đắn đo cho mỗi quyết định mua nội thất 5–30 triệu VNĐ, tỉ lệ mua nhầm/hối hận cao, hoặc bỏ cuộc hoàn toàn và sống với không gian không ưng ý.

**Tác động kinh tế:**
- Người dùng: Lãng phí 5–15 triệu VNĐ/lần mua nhầm nội thất + chi phí cơ hội 2–4 tuần research thủ công. Dư thừa cảm hứng nhưng bế tắc giao dịch.
- Thị trường: Ngành nội thất VN đạt $9.76 tỷ USD, nhưng các nhãn hàng đang gánh chịu "The Cost of Doubt" — mất đến 30% doanh thu tiềm năng do khách bỏ giỏ hàng nửa chừng và chi phí cực lớn từ tỉ lệ hoàn hàng cao.

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
- Ứng dụng tư duy "Style Palette": M1 hiển thị **2–3 phong cách** nội thất (5 phong cách là mục tiêu sau) thay vì hiển thị sản phẩm lẻ. Mỗi phong cách có ảnh minh họa + mô tả đặc trưng (màu sắc, chất liệu, cảm xúc).
- User có thể chọn 1 phong cách để xem các món đồ đã được curate sẵn theo phong cách đó (triệt tiêu sự đắn đo so với việc bơi trong Product Catalog).
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
- Mỗi sản phẩm có nút "Xem chi tiết / Mua" redirect ra website hoặc sàn TMĐT của nhà cung cấp (M1: link affiliate; thanh toán/escrow trong app thuộc M2).
- **Nhánh thu-lead tư vấn (M1):** user có thể để lại SĐT/thông tin liên hệ để được tư vấn follow-up (kết nối chuyên gia). M1 chỉ thu lead; kết nối chuyên gia đầy đủ (chat/booking) triển khai ở M2+.

#### User Story #4 — AI hỗ trợ đặt đồ thông minh (In-scope MVP)
> **As a** người đang kéo thả đồ nội thất vào ảnh chụp phòng thật,
> **I want** AI tự động ước lượng độ sâu (depth) và tỉ lệ (scale) của căn phòng từ ảnh, rồi điều chỉnh kích thước và vị trí món đồ cho khớp với phối cảnh thật,
> **so that** đồ nội thất trông tự nhiên và đúng tỉ lệ trong ảnh mà tôi không phải tự thu phóng thủ công bằng tay.

*(Lưu ý: Đây là tính năng MVP cốt lõi nhưng phải có manual override rõ ràng. AI hỗ trợ scale/vị trí ban đầu; user luôn là người quyết định cuối cùng).*

**Acceptance criteria:**
- Khi user upload ảnh phòng, AI phân tích ảnh để tạo depth map (bản đồ độ sâu) cơ bản.
- Khi user kéo thả 1 món đồ vào vị trí trong ảnh, hệ thống tự động scale đồ theo depth tại điểm đó (đồ ở xa nhỏ hơn, đồ ở gần to hơn).
- User có thể **override** (chỉnh tay) kích thước/vị trí nếu AI ước lượng sai (Human-in-the-loop).
- User có thể xoay item quanh trục Y (xoay ngang để đổi hướng đồ); MVP không hỗ trợ xoay tự do 360° đa trục
- Khi xóa đồ, ảnh nền phía sau được khôi phục hợp lý (inpainting cơ bản hoặc hiển thị lại ảnh gốc).
- Thời gian xử lý depth map ≤ 5 giây cho ảnh độ phân giải điện thoại thông thường.

---

### 10.4. MVP Scope

*(Tham chiếu đầy đủ từ Mục 9 — MVP Boundaries ở trên)*

| Phân loại | Nội dung |
|---|---|
| **In-Scope (M1)** | (1) Khám phá theo "Style Palette", (2) Tương tác 3D cốt lõi (kéo thả, xoay trục Y, xóa, manual resize), (3) **AI Spatial Placement kiểu "Kreativ-lite"** (1 ảnh + Depth Anything V2) để ước lượng depth/scale ban đầu, **có fallback đặt đồ thủ công**, (4) Bảng dự toán + Link mua Affiliate + **thu-lead tư vấn** |
| **M2 (NEXT)** | **Thanh toán/escrow qua cổng thanh toán được cấp phép** (supplier chịu bồi hoàn), Kết nối chuyên gia đầy đủ, App mobile native |
| **Out-of-Scope (LATER)** | Cộng đồng/mạng xã hội, Quét AR/LiDAR, **Style Quiz AI**, AI tự phối toàn bộ phòng thay user |
| **Non-Goals** | KHÔNG làm phần mềm kỹ thuật (AutoCAD), KHÔNG làm sàn TMĐT nặng (logistics/kho), KHÔNG tự sản xuất nội thất |

**Scope decision:** *AI Spatial Placement có nằm trong M1 không?*
→ **CÓ — must-have, nhưng làm kiểu "Kreativ-lite":** chỉ cần **1 ảnh + Depth Anything V2** (không dựng 3D toàn phòng), luôn kèm **fallback đặt đồ thủ công**. Đây là điểm khác biệt cốt lõi giúp trải nghiệm "ướm thử" đủ thật và đủ nhanh. Rủi ro kỹ thuật được kiểm soát bằng human-in-the-loop: user luôn có thể manual resize/drag nếu depth estimation sai, và hệ thống tự chuyển sang manual mode khi confidence thấp.
→ **Decision gate:** chạy **spike ngay tuần đầu M1** để xác nhận chất lượng depth/scale đủ dùng; nếu spike thất bại, hạ AI xuống nhánh phụ và ship trước luồng đặt đồ thủ công.

---

### 10.5. Success Metrics

| Metric | Định nghĩa | Target (3 tháng đầu) | Tại sao đo metric này |
|---|---|---|---|
| **Activation Rate** | % user hoàn thành luồng: Chọn phong cách → Upload ảnh → Đặt ≥ 1 món đồ | ≥ 30% | Đo lường ý định thực sự của user. |
| **Save/Share Rate** | % user lưu lại bản thiết kế sau khi phối đồ | ≥ 30% | Proxy cho "intent to buy" (Theo KR1 - OKR Quý 1). |
| **Click-to-Buy Rate** | % user nhấn "Xem chi tiết / Mua" trên ít nhất 1 sản phẩm | ≥ 15% | Metric cốt lõi sinh doanh thu Affiliate (Theo KR2 - OKR Quý 1). |
| **Average Order Value (AOV)** | Giá trị trung bình của giỏ hàng khi user click Mua | Base ~10 tr VNĐ (mục tiêu M1) | 15 tr VNĐ ("mua cả không gian" — hiệu ứng Identity-Linked Premium) là **upside**, không phải con số cam kết. |
| **Return Rate (D7)** | % user quay lại app trong vòng 7 ngày | ≥ 25% | Đo retention (Theo KR3 - OKR Quý 1). |

---

### 10.6. Dependencies & Constraints

#### Dependencies (Phụ thuộc bên ngoài)

| Dependency | Mô tả | Rủi ro | Mitigation |
|---|---|---|---|
| **Catalog 3D** | M1 cần **16–24 mô hình 3D** nội thất chất lượng khá, phân bổ cho **2–3 phong cách** (5 phong cách là mục tiêu sau) | Tự tạo 3D tốn thời gian + chi phí | M1: dùng 3D assets từ Sketchfab/CGTrader. Scale: Onboard nhà cung cấp VN để số hóa 3D, tạo ra hào nước phòng thủ "Supplier Lock-in" |
| **Dữ liệu giá + nguồn mua** | Cần giá tham khảo và link mua thật cho mỗi sản phẩm 3D | Giá biến động, link hết hạn | MVP dùng giá tham khảo (khoảng giá), cập nhật thủ công hàng tháng. Scale: API tự động crawl giá từ đối tác |
| **3D Rendering Engine** | Rendering 3D trên mobile (React Native + Three.js/Expo GL, hoặc native SceneKit/ARCore) phụ thuộc vào GPU thiết bị | Điện thoại cũ render chậm/lag | Set minimum requirement (iPhone 8+ / Android mid-range 2020+), cung cấp fallback 2D preview cho thiết bị yếu |
| **AI Depth Estimation** | Model ước lượng độ sâu từ ảnh 2D (MiDaS / Depth Anything) để đặt đồ khớp phối cảnh | Độ chính xác depth map phụ thuộc chất lượng ảnh, góc chụp | Cho phép user override thủ công (pinch-to-resize), cung cấp hướng dẫn chụp ảnh tối ưu |

#### Constraints (Giới hạn nguồn lực)

| Constraint | Chi tiết |
|---|---|
| **Team size** | Solo founder — 1 người phụ trách cả product, design, development |
| **Timeline** | **M1** cần ship trong 4–6 tuần để kịp validate giả thuyết (M2 mobile: 3–4 tháng sau đó) |
| **Budget** | **Bootstrap-first**: burn ~11.7 triệu VNĐ/tháng. Sau khi M1 pass, cân nhắc gọi vốn để mở rộng M2 (không phụ thuộc vào việc gọi được seed ngay) |
| **Platform** | **M1 = Web-first** (tái dùng PoC `WebApp/`, deploy web/PWA, không qua App Store) để solo iterate nhanh. **Mobile native (iOS+Android) = M2** — trải nghiệm chụp ảnh/kéo thả touchscreen tự nhiên hơn, làm sau khi M1 validate |
| **Catalog limit** | M1 chỉ cần **2–3 phong cách × 8 sản phẩm ≈ 16–24 models**. Không cần cover tất cả phong cách và sản phẩm (5 phong cách là mục tiêu sau) |

---

### 10.7. Model Selection Rationale (AI-Specific #1)

**Tính năng AI trong M1:** Spatial Placement — ước lượng độ sâu căn phòng từ ảnh 2D (**depth on-device**) để đặt đồ nội thất khớp phối cảnh + inpainting khi xóa đồ (**cloud inpainting qua API hosted, trả theo lượt**).

> **Ranh giới on-device vs cloud (D3):** Depth estimation chạy **on-device** (real-time, mỗi lần drag). Inpainting chạy **cloud** (API hosted, chỉ gọi khi user xóa đồ). **"100% on-device" là tầm nhìn dài hạn, KHÔNG phải M1.** Privacy được đảm bảo bằng **consent thật**: "ảnh gửi lên xử lý và xóa ngay" — KHÔNG dùng câu "không upload ảnh".

| Tiêu chí | Lựa chọn | Lý do |
|---|---|---|
| **Depth Estimation** | **Depth Anything V2** (open-source, chạy **on-device**) hoặc **MiDaS** (Intel) | Chạy local trên điện thoại (không cần API call) → zero latency cho thao tác drag. Depth Anything V2 small (~25MB) đủ chính xác cho use case "scale đồ theo phối cảnh" |
| **Inpainting (xóa đồ)** | **Cloud inpainting** (API hosted, ví dụ LaMa/Replicate/AWS), trả theo lượt. Kèm **fallback đơn giản** (reveal lại pixel gốc tại vùng bị che) | **LaMa ~200MB cần GPU → KHÔNG chạy on-device được**, nên inpainting chất lượng cao đặt trên cloud. Inpainting chỉ gọi khi user **xóa đồ** (không phải mỗi frame) nên độ trễ/chi phí API chấp nhận được. Fallback không cần AI: lưu ảnh gốc → khi xóa item → reveal lại pixel gốc phía dưới |
| **Depth on-device vs inpainting cloud?** | Depth cần real-time (mỗi lần drag) → **on-device** bắt buộc cho UX mượt. Inpainting chỉ chạy khi xóa đồ, tần suất thấp → **cloud** hợp lý, không phá vỡ trải nghiệm | Tách đúng ranh giới: cái gì cần real-time thì on-device, cái gì nặng & thưa thì cloud |
| **Tại sao không dùng ARKit/ARCore full?** | Yêu cầu camera live + quét không gian → phức tạp, Out-of-scope MVP. Depth from single image đủ tốt cho "ướm thử" | Giảm ma sát: user chỉ cần 1 ảnh chụp, không cần quét phòng |
| **Trade-off chấp nhận được** | Depth từ ảnh 2D kém chính xác hơn LiDAR/ARKit (~±15-20% sai số) nhưng đủ cho trải nghiệm trực quan. User có thể chỉnh tay (pinch-to-resize) | Human-in-the-loop bù đắp sai số |

---

### 10.8. Data Requirements / Data Source (AI-Specific #2)

| Nguồn dữ liệu | Mục đích | Chủ sở hữu | Cập nhật |
|---|---|---|---|
| **3D Furniture Catalog** | Metadata cho **16–24 mô hình 3D** (tên, phong cách, kích thước thật, giá tham khảo, link mua, file .glb/.gltf) | YourSpace curate từ Sketchfab/CGTrader + đối tác tương lai | Founder thêm thủ công trong M1 |
| **Depth Estimation Model** | Model weights cho Depth Anything V2 Small (~25MB), bundle cùng app | Open-source (MIT license) | Cập nhật khi có version mới cải thiện accuracy |
| **Style Knowledge Base** | Mô tả chi tiết **2–3 phong cách** nội thất (đặc trưng, palette, chất liệu) cho M1; 5 phong cách là mục tiêu sau. Dùng cho UI hiển thị, không cho AI | YourSpace tự biên soạn | Founder cập nhật khi thêm phong cách mới |
| **User Interaction Logs** | Phong cách nào được chọn, đồ nào hay kéo vào, đồ nào hay bị xóa, tần suất override AI scale → training data tương lai | YourSpace (auto-collected) | Real-time logging |
| **Ảnh phòng user upload** | Ảnh 2D làm background + input cho depth (on-device) và inpainting (cloud) | User sở hữu | Depth xử lý on-device; khi user xóa đồ, vùng ảnh liên quan **gửi lên server cloud để inpainting rồi xóa ngay** (zero-retention). Có **consent thật** trước khi gửi: "ảnh được gửi lên xử lý và xóa ngay" |

**Lưu ý quan trọng về dữ liệu:**
- AI trong M1 **tách ranh giới**: depth estimation chạy **on-device**; inpainting (xóa đồ) chạy **cloud** (API hosted) → có **chi phí API theo lượt** cho mỗi lần inpainting. **"100% on-device" là tầm nhìn dài hạn, không phải M1** (LaMa ~200MB cần GPU nên chưa chạy on-device được).
- Privacy: dùng **consent thật** ("ảnh gửi lên xử lý và xóa ngay", zero-retention) — KHÔNG dùng câu "không upload ảnh".
- **Không dùng RAG, không fine-tune** ở giai đoạn M1.
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
| **F5** | **Thiết bị quá yếu** (không chạy được depth model on-device) | GPU không hỗ trợ hoặc inference > 15 giây | Tắt hoàn toàn AI depth, chuyển sang pure manual mode (user tự resize tất cả) | Hiển thị: *"Thiết bị của bạn chưa hỗ trợ đặt đồ tự động — bạn có thể tự chỉnh kích thước bằng tay."* Trải nghiệm core (kéo thả, xoay, xóa) vẫn hoạt động 100% |
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
| Fallback UX chỉ rõ **trigger** và **hành động cụ thể**? | ✅ | 6 kịch bản bao phủ: scale sai, depth sai, inpainting lỗi, ảnh kém, device yếu, undo — mỗi cái có trigger + action rõ ràng |
| Model Selection có **lý do cụ thể**, không chỉ ghi tên model? | ✅ | Giải thích tại sao depth on-device (Depth Anything V2) còn inpainting cloud (LaMa ~200MB cần GPU), tại sao không ARKit full, trade-off sai số chấp nhận được |
| Data Source có **tên nguồn thực tế**? | ✅ | Depth Anything V2 (MIT) on-device, Sketchfab/CGTrader cho 3D, cloud inpainting (LaMa/API hosted) cho xóa đồ |
| **Kill question:** Engineer đọc User Story + Fallback UX, cần hỏi lại > 3 câu? | ✅ Không | Acceptance criteria có số cụ thể (≤ 5s depth, ≥ 30fps, ±15-20% sai số), Fallback có bảng trigger-action cho cả 6 tình huống |
