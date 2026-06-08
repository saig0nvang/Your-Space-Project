# BẢO HIỂM PHÁP LÝ (Document Trail) - YourSpace
*Tình huống giả định & Bài tập Workshop 3*

## 1. Tình huống giả định (Khủng hoảng pháp lý)
**Bối cảnh:** Tháng 10/2026, YourSpace bất ngờ viral. Tuy nhiên, một sự cố lớn xảy ra: một nhà cung cấp API Cloud bị hack, làm rò rỉ hàng nghìn bức ảnh chụp phòng ngủ riêng tư của người dùng YourSpace. Cùng lúc, một hội nhóm "bóc phốt" tố cáo YourSpace vi phạm **Điều 198 (Tội lừa dối khách hàng)** vì quảng cáo "AI hiểu gu thẩm mỹ" nhưng app thi thoảng gợi ý đồ sai lệch hoàn toàn. 

Cục An ninh mạng (A05) và Cơ quan Cảnh sát điều tra mời Founder lên làm việc: *"Anh có biết hệ thống AI của anh đẩy dữ liệu nhạy cảm ra nước ngoài trái phép không? Anh có cố tình lừa dối tính năng AI để gọi vốn và thu tiền Affiliate không?"*

**Mục tiêu hiện tại (Tháng 5/2026):** Xây dựng ngay bộ hồ sơ "Bảo hiểm pháp lý" để nếu ngày đó xảy ra, Founder có bằng chứng văn bản chứng minh mình **ĐÃ THẨM ĐỊNH** rủi ro (Giảm trừ/miễn trách nhiệm hình sự), chứ không phải "biết rõ là sai nhưng vẫn làm" (cố ý làm trái).

---

## 2. Đối chiếu 5 loại hồ sơ (Document Trail)

| # | Loại hồ sơ bảo vệ | Trạng thái hiện tại | Deadline (Nếu CHƯA CÓ) |
|---|---|---|---|
| 1 | **Nhật ký kiểm thử claim AI** <br>*(Chứng minh AI Inpainting & Scale hoạt động đúng như quảng cáo, test độ sai lệch)* | ❌ CHƯA CÓ | Trước khi Launch MVP (Tuần 4/Tháng 5) |
| 2 | **Hồ sơ rà soát điều khoản Vendor** <br>*(Review chính sách quyền riêng tư của Cloud API xử lý Inpainting)* | ❌ CHƯA CÓ | Cuối tuần này |
| 3 | **Nhật ký giám sát giao dịch bất thường** <br>*(Chống fraud click ảo link Affiliate)* | ❌ CHƯA CÓ | Sau khi đạt 1,000 MAU đầu tiên |
| 4 | **DPIA / CTIA đã nộp** <br>*(Hồ sơ Đánh giá tác động chuyển dữ liệu hình ảnh phòng lên Cloud theo NĐ13)* | ❌ CHƯA CÓ | Trong vòng 60 ngày kể từ lúc test luồng data |
| 5 | **Phê duyệt nội dung marketing** <br>*(Biên bản Founder chốt nội dung mkt, không hứa hẹn "100% On-device" nếu đang dùng Cloud)* | ✅ ĐÃ CÓ | [Chiến lược đã đổi trong on_device_strategy.md] |

---

## 3. Chọn TOP 1 ưu tiên
*Trong các ô ❌, rủi ro cao nhất hiện tại là gì?*

**🔥 TOP 1 Ưu tiên:** **Hồ sơ số (4) - DPIA / CTIA (Đánh giá tác động xử lý & chuyển dữ liệu cá nhân).**

**Lý do:** YourSpace vừa quyết định chuyển tính năng AI Inpainting từ On-device (chạy local) sang Cloud API (đẩy lên server) để tối ưu chất lượng. Việc lấy hình ảnh phòng ngủ riêng tư của user đẩy qua biên giới mà không làm hồ sơ đánh giá NĐ13/2023/NĐ-CP là vi phạm luật sờ sờ, nguy cơ bị cấm hoạt động và phạt cực nặng ngay tắp lự nếu bị lộ ảnh.

---

## 4. Hành động 1 tuần (Cho TOP 1)

**Template tài liệu sẽ xây (DPIA/CTIA cho tính năng Cloud Inpainting):**
1. **Sơ đồ luồng dữ liệu:** Ảnh thiết bị user ➝ App YourSpace ➝ API Server (LaMa Refiner) ➝ Trả kết quả ➝ **Cơ chế Xóa lập tức (Zero Retention)**.
2. **Cam kết Vendor:** Tài liệu chứng minh API Endpoint cung cấp dịch vụ inpainting không được phép lưu trữ hoặc dùng ảnh của user YourSpace để train AI của họ.
3. **Cơ chế Opt-in (Consent):** Ảnh chụp màn hình popup yêu cầu user cấp quyền camera/thư viện kèm dòng chữ: *"Ảnh của bạn sẽ được gửi lên hệ thống đám mây để xử lý xóa nền và KHÔNG lưu trữ lại."*

**Phân công thực hiện:**
* **Người chịu trách nhiệm:** Phạm Việt Anh (Founder).
* **Tần suất cập nhật:** 1 lần trước khi Launch MVP + Cập nhật lại ngay lập tức nếu đổi nhà cung cấp Cloud API khác.
