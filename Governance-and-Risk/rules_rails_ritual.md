# 3 R's Startup Governance — YourSpace

**Mục tiêu:** Áp dụng framework "phanh Brembo" (Day 21) cho YourSpace để ngăn chặn rủi ro làm cạn runway, đặc biệt tập trung vào rủi ro "ảo giác không gian" (Spatial Hallucination) của AI gây hoàn hàng và rủi ro bảo mật dữ liệu.

---

## 1. R1 — RULES (Quy định an toàn AI)
*1 trang Notion nội bộ dành cho Founder & Team. Cập nhật khi có thay đổi.*

### ❌ KHÔNG được làm (Cấm)
- **Rò rỉ dữ liệu người dùng:** Tuyệt đối KHÔNG upload ảnh chụp phòng/không gian thực của khách hàng lên các công cụ LLM public (ChatGPT, Claude bản miễn phí/cá nhân) để test prompt hay debug thuật toán.
- **Lộ tài sản của Supplier:** KHÔNG hardcode API Keys hoặc bộ dữ liệu 3D Model độc quyền của các nhà cung cấp nội thất vào mã nguồn hở hoặc chia sẻ qua các kênh không bảo mật.

### ✅ Được làm (Giải pháp thay thế)
- **Xử lý hình ảnh:** Tuân thủ triệt để kiến trúc **AI on-device**. Mô hình Depth Anything V2 phải xử lý ảnh trực tiếp trên điện thoại khách hàng, không lưu trữ ảnh gốc trên server.
- **Phân tích dữ liệu nội bộ:** Nếu cần phân tích data hành vi hoặc debug, CHỈ sử dụng môi trường bảo mật (như OpenAI Enterprise, Claude for Work) hoặc các công cụ local đã được setup tính năng "Do not train on my data".

### ⚠️ Hậu quả vi phạm
- Vi phạm bảo mật data Supplier → Mất đối tác độc quyền (Supplier Lock-in bị phá vỡ), đứt gãy nguồn cung.
- Việc nhân sự vi phạm Rule bảo mật sẽ dẫn đến cảnh cáo lần 1 (1-1 talk), lần 2 buộc thôi việc.

---

## 2. R2 — RAILS (Rào cản kỹ thuật)
*Hệ thống công cụ rẻ tiền tự động chặn lỗi và lưu vết.*

- **Ngăn chặn lộ Secrets (Cost: $0):**
  - Triển khai `git-secrets` và GitHub pre-commit hooks.
  - Hệ thống tự động báo lỗi và từ chối mọi commit có chứa API keys hoặc token truy cập kho 3D của đối tác.
- **Bắt buộc Code Review trước khi Merge/Deploy (Cost: $0):**
  - Thiết lập tính năng GitHub branch protection cho nhánh `main`/`prod`.
  - Yêu cầu bắt buộc phải có ít nhất 1 người review (Pull Request) trước khi merge, đặc biệt là các thay đổi liên quan đến thuật toán nhận diện không gian (Depth Anything) hoặc cập nhật model.
- **Cơ chế Fallback / Soft Kill AI (Cost: $0):**
  - **Rủi ro:** Mô hình AI Depth Anything V2 ước lượng sai độ sâu (do phòng quá tối, thiếu ánh sáng, tường trơn), làm sai tỷ lệ đồ nội thất 3D.
  - **Rail (Rào cản UX):** Lập trình sẵn chế độ **Manual Mode**. Khi AI confidence score trả về thấp, hệ thống tuyệt đối không "đoán bừa". App phải tự động chuyển (fallback) ngay sang chế độ cảnh báo và yêu cầu người dùng tự nhập chiều dài tường để scale thủ công. (Ưu tiên UX an toàn thay vì cố tỏ ra thông minh mà làm khách mua nhầm đồ).

---

## 3. R3 — RITUAL (Nghi thức vận hành)
*Thói quen định kỳ của Founder để đối phó trực diện với rủi ro.*

- **Customer Friday (30 phút mỗi Thứ 6):**
  - Founder (Việt Anh) trực tiếp gọi cho 1 người dùng đã "chốt đơn" qua YourSpace trong tuần.
  - *Câu hỏi trọng tâm (Không hỏi chung chung):* "Quá trình ướm thử đồ 3D bằng AI có bao giờ bị sai tỷ lệ kích thước so với thực tế không? Món đồ bạn nhận về kê vào phòng có vừa khít như trên app hiển thị không?"
- **War Game (60 phút mỗi Quý):**
  - Giả lập tình huống khủng hoảng sinh tử (Crisis Simulation): *"Một Tiktoker nổi tiếng review app YourSpace, nói rằng AI đo sai khiến họ mua nhầm chiếc sofa 25 triệu VNĐ không nhét vừa cửa phòng. Video đạt 500K views. Nhà cung cấp phẫn nộ đòi rút catalog."*
  - *Luyện tập phản xạ (Trong 30 phút đầu):* 
    1. **Verify:** Check log xem kích thước AI gen ra cho user đó là bao nhiêu. 
    2. **Stop the Bleeding:** Kích hoạt Env Var tắt tính năng Auto-Scale bằng AI trên toàn app, chuyển 100% user sang Manual Mode. 
    3. **Communicate:** Founder dùng email cá nhân nhắn tin trực tiếp với Tiktoker để nhận lỗi và bồi thường ngay lập tức (không cần điền form).
