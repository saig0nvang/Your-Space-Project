# Incident Playbook — YourSpace

**Tình huống giả định (Dựa trên Risk Register):**
9h30 sáng. Một Tiktoker đăng video phàn nàn: Tính năng AI của YourSpace tự động đo sai kích thước, khiến họ tin tưởng và mua nhầm chiếc sofa 25 triệu VNĐ không nhét vừa cửa phòng. Video đạt 200 shares trong 30 phút. Đang có tín hiệu viral (Khủng hoảng thuộc vùng KILL ZONE).

> **Lưu ý tài chính (D2):** Khoản hoàn 25tr KHÔNG do founder móc túi. Vì có giao dịch escrow (thuộc M2), tiền được **hoàn ngay từ tài khoản escrow giữ tiền và do SUPPLIER chịu** theo cam kết SLA. YourSpace ưu tiên hoàn cho khách trước để dập khủng hoảng, rồi khấu trừ/đối soát với Supplier sau.

---

## Bước 1: VERIFY (0–5 phút)
*Xác minh đây có thật là lỗi AI của YourSpace không, hay là ảnh photoshop/chiêu trò dìm hàng.*

- **Công cụ:** Truy cập ngay trang quản trị **Supabase Admin Panel** (hoặc DB của YourSpace) và **Sentry Dashboard**.
- **Cách check cụ thể:**
  1. Tìm kiếm `user_id` hoặc thông tin đơn hàng trên Supabase.
  2. Query vào bảng `ar_session_logs` kết hợp `purchase_history`.
  3. Kiểm tra biến `estimated_scale_factor` và `ai_confidence_score` trong log của session mua hàng đó. Nếu log ghi nhận hệ thống thực sự trả về thông số sai (ví dụ: AI báo sofa chiếm 1/3 phòng nhưng thực tế to hơn), thì lỗi là thật.

---

## Bước 2: STOP THE BLEEDING (5–15 phút)
*Tạm dừng tổn thất ngay lập tức mà không làm sập toàn bộ hệ thống.*

- **Quyết định:** **Soft kill** (Chuyển sang chế độ dự phòng).
- **Hành động cụ thể:** Truy cập trang quản trị **Firebase Remote Config** (hoặc hệ thống quản lý config tương đương), đổi cờ `ENABLE_AUTO_DEPTH_SCALE` từ `true` sang `false` và publish.
- **Lý do:** Khi flip cờ này, toàn bộ app YourSpace trên mọi thiết bị sẽ lập tức tắt tính năng "AI Auto-Scale" và chuyển sang chế độ "Manual Mode" (yêu cầu người dùng tự nhập chiều dài tường để scale 3D thủ công). App vẫn hoạt động bình thường 90%, doanh thu không đứt đoạn, nhưng rủi ro đo sai bị triệt tiêu ngay lập tức trong 30 giây mà không cần đợi update App Store.

---

## Bước 3: CUSTOMER COMM (15–30 phút)
*Liên hệ trực tiếp với người dùng bị ảnh hưởng. Sử dụng tiếng nói cá nhân của Founder.*

**Mẫu tin nhắn (DM trực tiếp qua nền tảng khách hàng phàn nàn):**
```text
Chào [Tên khách hàng],

Đây là Việt Anh -- Founder của YourSpace. Mình vừa xem video của bạn và đã tự tay check lại hệ thống.

Việc xảy ra: AI của bên mình đã tính sai độ sâu ảnh phòng của bạn, dẫn đến việc gợi ý sai tỷ lệ chiếc sofa. Lỗi này hoàn toàn thuộc về YourSpace.
Mình đang làm gì: Mình đã tạm tắt tính năng đo tự động trên app với mọi người dùng để kiểm tra lại log.
Cách sửa lỗi: Bên mình sẽ hoàn lại 100% (25 triệu VNĐ) NGAY trong hôm nay và cho người qua thu hồi sofa -- bạn không cần làm bất cứ form từ chối nhận hàng nào. (Khoản này được hoàn ngay từ tài khoản escrow giữ tiền và do nhà cung cấp chịu theo cam kết SLA -- bạn không phải chờ đối soát, cứ nhận tiền trước.)
Mình sẽ gọi bạn trong 24h tới: 0855751359 (Đây là số cá nhân của mình, bạn gọi lúc nào cũng được).

-- Phạm Việt Anh
anhpv2710@gmail.com
```

---

## Bước 4: PUBLIC RESPONSE (Phút thứ 30)
*Phản hồi công khai ngắn gọn trên mạng xã hội.*

**Mẫu bài đăng (Dưới 280 ký tự):**
```text
Chào mọi người — Mình là Việt Anh (Founder YourSpace). Mình đã ghi nhận lỗi AI ước lượng sai tỷ lệ nội thất sáng nay.
Mình đã tắt module AI tự động. App tạm thời hoạt động bằng nhập liệu thủ công để đảm bảo an toàn. Đang liên hệ trực tiếp bạn khách hàng để hoàn 100% tiền. Sẽ update sau 24h.
```
