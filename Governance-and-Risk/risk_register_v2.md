# Risk Register v2 — YourSpace (AI-Augmented)
**Ngày lập:** 07/05/2026 | **Người lập:** Phạm Việt Anh (qua AI CRO Audit Lab 4)

### 0. Cơ sở tính toán (Burn Rate)
> **Cập nhật 2026-07-23 (D6):** Đường tài chính thật = **BOOTSTRAP** (tiền mặt ~50tr VND, burn ~11.7tr VND/tháng → runway ~4.3 tháng). Kịch bản Seed $150,000 / burn ~$8,333/tháng dưới đây là **kịch bản M2 sau gọi vốn** — các con số USD chấm điểm bên dưới đọc theo kịch bản seed/M2, ở bootstrap cần quy về thang VND (11.7tr/tháng = 1 tháng runway).

- **Vốn mục tiêu (Seed — kịch bản M2 sau gọi vốn):** $150,000 cho 18 tháng
- **Burn rate trung bình (kịch bản seed/M2):** ~$8,333/tháng
- **Impact scale (kịch bản seed/M2):**
  - Impact 1: < $8,333 (<1 tháng runway)
  - Impact 2: $8,333 – $16,000 (1-2 tháng runway)
  - Impact 3: $25,000 (3 tháng runway)
  - Impact 4: $25,000 – $50,000 (3-6 tháng runway)
  - Impact 5: > $50,000 (>6 tháng runway)

---

## 🔝 TOP 10 RISKS

### RISK 1: AI Spatial Hallucination (KILL ZONE)
- **Type:** Customer-facing
- **If:** Mô hình Depth Anything V2 tính sai độ sâu ảnh 15-20% trong chiến dịch marketing lớn.
- **Then:** 100 khách hàng mua nhầm giường/sofa không nhét vừa phòng. Theo mô hình đã chốt (D2), **phí hoàn hàng do SUPPLIER chịu** (khấu trừ qua escrow + phạt SLA 8%), KHÔNG phải YourSpace đền. Nhưng khách vẫn phốt lên TikTok → đòn reputational.
- **Leading to:** Tổn thất tài chính trực tiếp về YourSpace giảm mạnh (bồi hoàn thuộc supplier); còn lại chủ yếu là chi phí xử lý khủng hoảng PR + tổn hại uy tín/traction. *(Nghĩa vụ bồi hoàn qua escrow thuộc M2; ở M1 web-first bước "mua" là affiliate/thu lead nên chưa phát sinh.)*
- **Likelihood (1-5):** 4 (Rất dễ xảy ra với AI tính toán chiều sâu từ ảnh tĩnh 2D).
- **Impact (1-5):** 3 (Tài chính giảm vì supplier chịu bồi hoàn, nhưng rủi ro REPUTATIONAL vẫn cao). Score: **12**.
- **Mitigation:**
  1. Code chế độ "Manual Fallback" để user tự nhập chiều dài tường nếu AI confidence < 80%.
  2. Hiển thị UI cảnh báo rõ: "AI chỉ mang tính tham khảo kích thước tương đối".
  3. **Ràng buộc hợp đồng + SLA: Supplier chịu 100% phí hoàn hàng** khi lỗi dẫn tới trả hàng, khấu trừ trực tiếp qua escrow (KHÔNG chia 50-50, KHÔNG để founder móc túi).

### RISK 2: OS Update Breaks Local AI
- **Type:** Vendor
- **If:** Apple (iOS 19) hoặc Google tung bản cập nhật hệ điều hành thay đổi quyền truy cập Camera/CoreML.
- **Then:** Mô hình Depth Anything V2 on-device (tính độ sâu) bị crash hàng loạt. App mất tính năng lõi đặt đồ đúng phối cảnh. Phải đập đi xây lại hoặc chạy depth trên cloud server (phát sinh thêm chi phí API/lượt — API cost ≠ 0).
- **Leading to:** $15,000 chi phí dev gấp + $8,000 server cost khẩn cấp = **2.5 tháng runway** (kịch bản seed/M2).
- **Likelihood (1-5):** 3 (Apple thường xuyên xiết chặt quyền camera/AI).
- **Impact (1-5):** 3. Score: **9**.
- **Mitigation:**
  1. **Lưu ý kiến trúc (D3):** Với INPAINTING (xóa đồ cũ), cloud inference qua API hosted (Replicate/AWS) đã là **hướng MVP CHÍNH THỨC**, KHÔNG còn là "fallback" — chấp nhận API cost/lượt để đảm bảo chất lượng. Rủi ro này chỉ còn áp cho phần DEPTH chạy on-device; nếu OS phá depth on-device thì cloud inference cũng là phương án chuyển tạm sẵn có.
  2. Tham gia Apple Developer Beta để test trước các OS update 3 tháng.
  3. Log kỹ các API deprecation warnings trên Expo.

### RISK 3: Camera Privacy App Store Ban
- **Type:** Regulatory
- **If:** Policy của App Store/Play Store hoặc Luật bảo vệ dữ liệu (Nghị định 13 VN / GDPR) quét thấy YourSpace dùng camera VÀ gửi ảnh phòng lên cloud để inpainting (D3) mà không có popup consent giải thích rõ ràng việc xử lý & xóa ảnh.
- **Then:** App bị gỡ khỏi store (delisted) không báo trước. Toàn bộ tiền quảng cáo đang chạy đổ xuống sông.
- **Leading to:** Mất $10,000 tiền Ads + 3 tuần không có doanh thu ($5,000) = **1.8 tháng runway**.
- **Likelihood (1-5):** 4 (Reviewer Apple rất khắt khe với app có chữ "AI" và quyền Camera).
- **Impact (1-5):** 2. Score: **8**.
- **Mitigation:**
  1. Thêm màn hình Onboarding **consent thật** (KHÔNG dùng câu "không upload ảnh" vì sai sự thật → dính rủi ro Điều 198): "Ảnh phòng của bạn được gửi lên hệ thống để xử lý (xóa đồ cũ) và **xóa ngay** sau khi hoàn tất — không lưu trữ, không dùng để train AI." Ghi rõ mục tiêu on-device trong tương lai. Checkbox opt-in bắt buộc.
  2. Bổ sung chính sách bảo mật (Privacy Policy) chuẩn GDPR/NĐ13 + DPIA cho luồng ảnh lên cloud (có thể xuyên biên giới) + cơ chế zero-retention.
  3. Không gắn các SDK analytics bên thứ 3 vào màn hình chụp ảnh.

### RISK 4: Post-Payment Fulfillment Failure (Hết hàng/Chậm thi công)
- **Type:** Customer-facing
- **If:** Khách hàng đã thanh toán/chốt đơn thành công trên YourSpace, nhưng Supplier gặp sự cố (hết nguyên liệu, xưởng quá tải không thi công kịp) hoặc API không đồng bộ tồn kho thời gian thực.
- **Then:** Khách hàng đợi lâu không có hàng, lên mạng bóc phốt YourSpace "lừa đảo chiếm dụng vốn". Nhờ cơ chế escrow (D2), tiền khách chưa được giải ngân cho Supplier → **hoàn trả cho khách được thực hiện NGAY từ tài khoản escrow, và khoản bồi hoàn do SUPPLIER chịu** (không phải founder móc túi). YourSpace chỉ điều phối hoàn tiền + đối soát phạt SLA với Supplier.
- **Leading to:** Vì tiền nằm ở escrow, YourSpace KHÔNG còn phải tự ứng tiền túi. Tổn thất còn lại chủ yếu là chi phí vận hành xử lý sự cố + rủi ro uy tín. *(Escrow thuộc M2 — D5; ở M1 web-first chưa có bước thanh toán/escrow nên kịch bản này áp cho M2.)*
- **Likelihood (1-5):** 4 (Rất phổ biến ở ngành nội thất VN, đặc biệt với các xưởng gia công).
- **Impact (1-5):** 2. Score: **8**.
- **Mitigation:**
  1. **Thanh toán Escrow qua cổng ĐƯỢC CẤP PHÉP (D2):** Dòng tiền từ khách nằm ở **cổng thanh toán có hold/escrow được cấp phép** (PayOS/MoMo/VNPay/ngân hàng) — YourSpace KHÔNG tự giữ tiền để né giấy phép trung gian thanh toán NHNN. CHỈ giải ngân cho Supplier khi có biên bản giao hàng thành công. **Escrow thuộc M2** (sau gọi vốn).
  2. **Ràng buộc SLA trong hợp đồng:** Supplier **chịu trách nhiệm bồi hoàn** và phạt 8% giá trị đơn hàng nếu tự ý hủy đơn hoặc trễ deadline sau khi đã Confirm — khấu trừ trực tiếp qua escrow.
  3. **Quản trị kỳ vọng UX:** Thay vì nút "Mua ngay", đổi thành "Đặt cọc & Chờ Supplier xác nhận (Tối đa 4h)" để tránh việc khách đinh ninh là hàng đã có sẵn.

### RISK 5: Supplier 3D API Lockout
- **Type:** Vendor
- **If:** 3 nhà cung cấp nội thất mid-range lớn nhất lo sợ YourSpace "ăn cắp" model 3D độc quyền nên rút API.
- **Then:** YourSpace thành cái vỏ rỗng. Tỷ lệ chuyển đổi = 0. Buộc phải tự bỏ tiền thuê scan 3D cho 1,000 sản phẩm.
- **Leading to:** $20,000 chi phí thiết kế 3D khẩn cấp + 1 tháng đình trệ = **3 tháng runway**.
- **Likelihood (1-5):** 3 (Các local brand VN rất bảo thủ với data).
- **Impact (1-5):** 3. Score: **9**.
- **Mitigation:**
  1. Mã hóa/Watermark file 3D hiển thị trên web/app để supplier an tâm.
  2. Ký hợp đồng độc quyền API 12 tháng với điều khoản báo trước 60 ngày nếu cắt.
  3. Bắt đầu với các brand nhỏ/xưởng mộc sẵn sàng share data hơn.

### RISK 6: Solo Founder Burnout/Accident
- **Type:** Founder-bandwidth
- **If:** Việt Anh ốm, tai nạn, hoặc kiệt sức phải nghỉ 2 tuần đúng đợt launch MVP.
- **Then:** App dính lỗi checkout (payment gateway bug). Không ai fix được code React Native. User không mua được hàng.
- **Leading to:** Đốt vô ích $5,000 tiền Ads + 1 tháng mất đà tăng trưởng = **1.5 tháng runway**.
- **Likelihood (1-5):** 2 (Rủi ro sức khỏe luôn có).
- **Impact (1-5):** 2. Score: **4**.
- **Mitigation:**
  1. Tự giới hạn giờ làm 60h/tuần, cấm code cuối tuần sát lúc launch.
  2. Thuê 1 part-time dev/freelancer review code và có quyền truy cập repo (dự phòng).
  3. Viết SOP (Standard Operating Procedure) ngắn gọn cách revert bản release cũ trên Vercel/Expo.

### RISK 7: Viral "Ugly Design" Meme
- **Type:** Reputational
- **If:** Một nhóm user cố tình kéo thả nội thất sai tỷ lệ, tạo ra các phòng siêu dị/phản cảm (VD: nhét 5 cái toilet vào phòng ngủ), chụp ảnh kèm watermark YourSpace và đăng X/TikTok chê bai.
- **Then:** YourSpace biến thành trò cười mạng xã hội. Định vị "Aesthetic/Style-first" bị phá hủy. Các Supplier xịn đòi rút tên vì bị ảnh hưởng hình ảnh.
- **Leading to:** Mất 3 Supplier chính (tương ứng ~$15k doanh thu/tháng tiềm năng = **take-rate 8% trên GMV giao dịch thật** từ các supplier này theo mô hình D6, KHÔNG phải phí subscription/showcase) + tốn 1 tháng tái định vị = **2 tháng runway**.
- **Likelihood (1-5):** 3 (Troll internet rất phổ biến với tool AR).
- **Impact (1-5):** 2. Score: **6**.
- **Mitigation:**
  1. Giới hạn số lượng đồ vật 3D kéo thả tối đa (vd: 5 món/phòng).
  2. Thêm rule cảnh báo nếu user kéo đồ nội thất đè lên nhau (Collision detection).
  3. Ẩn watermark YourSpace nếu hệ thống phát hiện tỷ lệ scale phi lý.

### RISK 8: Supabase / Firebase Rate Limit Hit
- **Type:** Vendor
- **If:** Một video viral mang về 50,000 tải app trong 1 ngày. Lượng query database vượt quá Free/Pro Tier của Supabase.
- **Then:** Backend sập hoàn toàn. User mở app thấy màn hình trắng. Cơn bão 1 sao trên App Store kéo app xuống bùn.
- **Leading to:** Đốt cháy cơ hội viral duy nhất, mất $8,000 tiền CAC tích lũy = **1 tháng runway**.
- **Likelihood (1-5):** 3 (Viral đột biến thường gây sập cho indie hacker).
- **Impact (1-5):** 1. Score: **3**.
- **Mitigation:**
  1. Setup Alert qua email/SMS khi DB query chạm ngưỡng 70% limit.
  2. Upgrade thẻ tín dụng sẵn sàng auto-scale tier trên Supabase.
  3. Cache các thông tin ít thay đổi (style palette) ở phía client.

### RISK 9: 3D Copyright Infringement Claim
- **Type:** Regulatory
- **If:** Trong các file 3D Supplier cấp hoặc mua trên mạng, có chứa mẫu ghế bản quyền quốc tế (vd: Eames Lounge Chair) mà YourSpace không có quyền phân phối thương mại.
- **Then:** Hãng nội thất quốc tế gửi Cease & Desist (C&D) letter hoặc report DMCA lên Apple/Google. App bị khóa lập tức.
- **Leading to:** Thuê luật sư IP ($15,000) + xóa data + 1 tháng down = **2.5 tháng runway**.
- **Likelihood (1-5):** 2 (Luật IP ở VN lỏng lẻo nhưng Apple Store thì không).
- **Impact (1-5):** 3. Score: **6**.
- **Mitigation:**
  1. Đưa điều khoản "Supplier tự chịu trách nhiệm bản quyền IP" vào hợp đồng phân phối.
  2. Nếu dùng asset mua ngoài, chỉ mua từ TurboSquid/CGTrader có hóa đơn Royalty-Free bản thương mại.
  3. Xóa ngay lập tức mọi sản phẩm nhận được DMCA report (Takedown policy 24h).

### RISK 10: "Shiny Object" Gen-AI Distraction
- **Type:** Founder-bandwidth
- **If:** Founder lướt Twitter thấy tool Gen-AI "Text-to-3D Room" quá hot, quyết định dừng roadmap AR để build tính năng tạo phòng bằng text.
- **Then:** Mất 2 tháng dev tính năng mới, nhưng tính năng chạy chậm (1 phút/ảnh), khách hàng không mua được hàng thực tế vì đó chỉ là đồ ảo. Bỏ lỡ điểm chạm "Zero-friction" cốt lõi.
- **Leading to:** $16,000 burn rate mất trắng + bỏ lỡ mùa sắm Tết = **2 tháng runway**.
- **Likelihood (1-5):** 4 (Hội chứng FOMO của founder startup AI rất mạnh).
- **Impact (1-5):** 2. Score: **8**.
- **Mitigation:**
  1. Áp dụng kỷ luật "Friday 30' Check": Chỉ làm đúng Roadmap PRD Day 17.
  2. Gắn chặt mọi AI feature với metric "Click-to-Buy Rate". AI sinh ảnh ảo không bán được hàng -> không code.
  3. Thường xuyên đọc lại Pitch Memo: "Giải quyết đắn đo mua sắm, không phải bán cảm hứng ảo".

---
### Kết quả Review Lab 4
**✅ [Pass 7/7 Quality Gate]:**
1. Đã có đủ 10 risks.
2. Đã cover 5 types (Vendor, Customer, Founder, Regulatory, Reputational).
3. Đã có số tháng runway đo lường rõ ràng.
4. AI đã tìm ra >2 risks mà bản thân founder chưa nghĩ tới (Camera Privacy App Store Ban, Viral Ugly Design Meme, 3D Copyright).
5. Top Risks (KILL ZONE) đã có 3 mitigation implement được ngay.
6. Mọi mitigation đều tốn < $500/tháng (đa số $0).
7. Đã cover 2 regulatory risks (Apple Privacy NĐ13 và DMCA Copyright).
