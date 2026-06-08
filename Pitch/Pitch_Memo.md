# PITCH MEMO — YourSpace
**Audience:** Seed VC | **Format:** Sequoia/YC 1-pager | **Date:** 2026-05-05

---

## 1. THE PROBLEM

Thị trường nội thất Việt Nam ($9.76 tỷ USD) đang đối mặt với một nghịch lý: **Dư thừa cảm hứng nhưng bế tắc giao dịch.**

**Transaction Friction (Phía Người dùng):** Người trẻ (25–35 tuổi) lưu hàng trăm video và ảnh trên TikTok, biết rõ phong cách mình thích nhưng lại "tê liệt" khi phải chọn mua giữa hàng nghìn sản phẩm đơn lẻ. Sự quá tải lựa chọn cộng với việc không thể hình dung món đồ trong không gian thực khiến họ mất 2–4 tuần đắn đo cho mỗi quyết định xuống tiền 5–30 triệu VNĐ.

**The Cost of Doubt (Phía Nhãn hàng):** Sự thiếu tự tin của người dùng tạo ra chi phí khổng lồ cho thị trường. Các nhãn hàng mất đến 30% doanh thu tiềm năng do khách bỏ giỏ hàng (cart abandonment) nửa chừng, và phải gánh chịu tỉ lệ hoàn hàng (return rate) cao chỉ vì lý do "mua về kê không hợp".

---

## 2. THE INSIGHT

Vấn đề của e-commerce nội thất không phải là thiếu lựa chọn, mà là "nghịch lý sự lựa chọn": một catalog 10,000 sản phẩm khiến người dùng tê liệt vì sợ mua nhầm đồ lệch tông. Bằng cách **chuyển từ "Product Catalog" sang "Style Palette"**, YourSpace thu hẹp lựa chọn xuống vài chục món đã được curate sẵn theo phong cách (Japandi, Wabi-Sabi...). Người dùng không bị bơi trong biển item, nhưng vẫn nắm 100% quyền tự do mix-match. Curation tạo ra sự tự tin thẩm mỹ — và sự tự tin chính là nút thắt cuối cùng để kích hoạt chốt đơn.

---

## 3. THE SOLUTION

YourSpace là mobile app (React Native + Expo GL) mang đến trải nghiệm **"Zero-friction Visualization"**: cho phép người dùng chụp ảnh phòng thật, chọn phong cách nội thất, rồi tự kéo thả đồ 3D vào ảnh và thấy ngay tổng thể — không cần đăng nhập, không cần quét không gian 3D; đăng nhập chỉ cần khi muốn lưu thiết kế hoặc đặt mua.

Khác với IKEA Place (bơi trong catalog) và AI gen rooms (mất kiểm soát), YourSpace là nền tảng **style-first + user-controlled**. Việc kết nối thẳng đến catalog của nhà cung cấp Việt không chỉ cho phép user mua với giá thật, mà còn biến YourSpace thành một **Visual Sales Channel** cho nhãn hàng: triệt tiêu sự đắn đo, tối ưu hóa Sales Cycle để khách chốt đơn nhanh hơn, và giảm thiểu tối đa tỉ lệ hoàn hàng. Đây là sự khác biệt giữa "AI làm cho bạn" và "bạn làm, AI hỗ trợ".

AI on-device (Depth Anything V2, chạy trên điện thoại tầm trung) tự động ước lượng độ sâu căn phòng từ ảnh 2D và scale đồ đúng phối cảnh — không cần server, zero cost/request, zero latency.

*Sống thử trước. Yêu rồi mới đăng ký.*

---

## 4. WHY NOW

Sự hội tụ của 3 yếu tố trong năm 2025–2026 tạo ra thời cơ chín muồi để phá vỡ cấu trúc e-commerce nội thất truyền thống:

- **Tech Inflection (Điểm bùng phát công nghệ):** Các mô hình AI như *Depth Anything V2* giờ đây đủ nhỏ gọn để chạy on-device trên điện thoại tầm trung. Lần đầu tiên, một startup có thể cung cấp trải nghiệm 3D/AR với zero server cost và zero latency — rào cản tài chính đã giết chết nhiều startup 3D trong quá khứ nay đã biến mất.
- **Behavioral Shift (Hành vi tiêu dùng mới):** Thế hệ 25–35 tuổi (đang bước vào chu kỳ mua nhà đầu tiên) bị định hình bởi TikTok/Reels: họ tiêu thụ cảm hứng không gian với tốc độ chóng mặt, nhưng lại đâm sầm vào rào cản của những catalog 2D tĩnh lỗi thời. Độ vênh giữa cảm hứng và công cụ mua sắm đang ở mức cao nhất.
- **Market Momentum (Động lực thị trường):** Nội thất B2C online tại VN là kênh tăng trưởng nhanh nhất (CAGR 10.39%/năm đến 2031 — theo *Mordor Intelligence*). Tuy nhiên, dòng tiền này đang tắc nghẽn ở khâu chốt đơn vì thị trường thiếu hụt trầm trọng công cụ Visual Commerce (thương mại trực quan).

---

## 5. TRACTION & VALIDATION PLAN

*YourSpace hiện ở giai đoạn Pre-launch. Chúng tôi không pitch số liệu giả định (vanity metrics) mà pitch một cấu trúc Unit Economics có tính phòng thủ cao.*

| Hạng mục | Cơ sở chứng minh (Proof) & Lợi thế cấu trúc |
|---|---|
| **Unit Econ Advantage** | **Identity-Linked Premium:** Bán "không gian Wabi-sabi" (AOV 15tr) thay vì bán "cái ghế" (AOV 2tr) → Aspiration drives basket size. |
| **Margin Protection** | Hiệu ứng sở hữu (IKEA effect) + Visual AR giúp giảm dự kiến 40% tỉ lệ hoàn hàng so với TMĐT truyền thống. |
| **Moat (Phòng thủ)** | 1. **Supplier Lock-in:** Độc quyền 3D catalog của các nhà cung cấp nội địa (OpenAI không có data này).<br>2. **Data:** Aesthetic Identity Graph của người trẻ Việt. |
| **Current Status** | Đã hoàn tất Web PoC (3D drag-drop, transform). Đang build Mobile MVP (React Native + Expo GL) với AI Spatial Placement là tính năng MVP cốt lõi. |
| **RAT (Tháng này)** | Thực thi Riskiest Assumption Test (5 ảnh phòng × 20 users) để đo Click-to-Buy Rate thực tế. |
| **Modeled Metrics** | Commission 8%. Model cho thấy LTV/CAC = 12.5× nếu CAC ≤ 160K. Sẽ có số CAC/AOV thực tế sau RAT. |
| **Market Size** | TAM $9.76B → SAM $300M (B2C online, mid-range) → SOM $1-3M (24 tháng đầu). |

---

## 6. THE ASK: $150,000 USD — "Buy the Confidence"

Vốn Seed dùng cho 18 tháng runway với mục tiêu duy nhất: Chứng minh YourSpace là "điểm chạm" tạo ra sự tự tin giao dịch.

- **Validation:** Hoàn tất RAT và đạt ngưỡng Conversion Rate ≥ 15%.
- **Technology:** Ship mobile MVP trong 3–4 tháng sau funding, bao gồm AI Spatial Placement on-device.
- **Partnership:** Onboard 10 nhà cung cấp nội thất mid-range tại VN để số hóa 3D catalog.

Ngoài vốn: kết nối **3–5 nhà cung cấp nội thất mid-range** tại HCM/HN sẵn sàng pilot catalog 3D — Unknown #2 cần validate song song với RAT.
*YourSpace không bán nội thất. Chúng tôi bán sự tự tin để chi đậm cho bản sắc cá nhân.*

---

*YourSpace · Solo founder · Bootstrap → Seed · [Phạm Việt Anh] · [anhpv2710@gmail.com] · [0855751359]*
