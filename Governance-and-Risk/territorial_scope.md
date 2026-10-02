---
derives_from: [D3@7fbc47fb, D6@b921ed46, D3b@4248a41d, D10@4b681365]
---
# Đánh giá Phạm vi Pháp lý & Luật AI (Territorial Scope)
*Dự án: YourSpace MVP*

---

## 1. Câu hỏi 1: User EU?
* **Có 1 user EU không?** Mục tiêu của YourSpace tập trung 100% vào phân khúc Young Aesthetes (25-35 tuổi) sinh sống tại các đô thị lớn ở Việt Nam (Hà Nội, TP.HCM, Đà Nẵng). Hiện tại không có user EU.
* **Có kế hoạch mở rộng EU trong 12 tháng tới không?** KHÔNG. MVP và giai đoạn Seed 18 tháng chỉ tập trung chiếm lĩnh thị trường ngách tại Việt Nam, onboard các xưởng/showroom nội thất bản địa.
* **Kết quả:** Đạo luật AI của EU (EU AI Act) / GDPR **KHÔNG** áp dụng. 
*(Ngoại lệ: Nếu có khách du lịch EU vô tình tải app, rủi ro vẫn cực thấp do quy mô chưa đủ để lọt vào tầm ngắm).*

---

## 2. Câu hỏi 2: Dữ liệu Việt Nam?
* **6 loại dữ liệu cá nhân đang xử lý:**
  1. Tên / Username (Định danh cơ bản).
  2. Số điện thoại / Email (Dùng để đăng nhập và liên hệ/tư vấn qua Affiliate).
  3. Hành vi người dùng (Style phong cách được chọn, số lượt click/share/save).
  4. **Hình ảnh không gian phòng thật** (Chứa dữ liệu nhạy cảm về không gian riêng tư của người dùng).
  5. Vị trí thiết bị (IP address, location cơ bản để tối ưu app).
  6. **Ảnh phòng người dùng chủ động đăng công khai lên Nhà hàng xóm** (M2+, D10) — consent riêng.
* **Có chuyển dữ liệu ra nước ngoài không?** 
  - Về AI (cập nhật D3 2026-07-23 + D3b 2026-07-24): ở M1, **cả Depth Anything V2 (tính 1 lần/ảnh, cache theo hash) lẫn Inpainting (xóa đồ cũ) đều chạy trên Cloud API hosted** (Replicate hoặc tương đương) — nghĩa là **hình ảnh phòng CÓ được gửi lên server (có thể xuyên biên giới)** để xử lý rồi xóa ngay. Đây KHÔNG còn là kiến trúc "ảnh không gửi lên server". → **Bắt buộc có DPIA + cơ chế zero-retention** cho luồng ảnh này.
  - Về Hệ thống: Hosting (Vercel) và Database (Supabase/Firebase) được đặt tại các server quốc tế (VD: AWS/GCP region Singapore/Mỹ). Do đó, dữ liệu hệ thống **CÓ** luân chuyển xuyên biên giới.
* **Kết quả:** **CÓ ÁP DỤNG** Nghị định 13/2023/NĐ-CP (Nghị định Bảo vệ dữ liệu cá nhân - PDPD). **CÓ CẦN** lập Hồ sơ đánh giá tác động (DPIA) cho việc xử lý & chuyển ảnh phòng + dữ liệu cá nhân ra nước ngoài, kèm cam kết vendor zero-retention (không lưu trữ/không train trên ảnh user).
* **Nghị định 147/2024/NĐ-CP (hiệu lực 25/12/2024) — khi mở Nhà hàng xóm (M2+, D10):** mạng xã hội phải xác thực người dùng bằng số điện thoại và gỡ nội dung vi phạm trong 24 giờ khi cơ quan quản lý yêu cầu. **Cần luật sư xác nhận** YourSpace có thuộc diện phải xin phép thiết lập mạng xã hội khi mở Nhà hàng xóm hay không.

---

## 3. Câu hỏi 3: Tầng rủi ro theo Luật AI VN (Dự thảo)?
* **Phân loại rủi ro:** Y tế / Giáo dục / Tài chính? (Không) ➝ Tạo content nhầm lẫn, Deepfake? (Không) ➝ Nhóm còn lại ➝ **THẤP**.
* **Câu lập luận:** 
  > YourSpace sử dụng trí tuệ nhân tạo (model Computer Vision tính toán độ sâu không gian) hoàn toàn cho mục đích thương mại giải trí (ướm thử nội thất 3D), không can thiệp vào các quyết định thiết yếu (y tế, tín dụng, nhân sự), và không tạo ra các nội dung giả mạo con người, do đó rủi ro tác động tiêu cực đến an toàn xã hội và quyền con người được xếp vào mức **THẤP**.

---

## 4. Lịch: 5 Mốc Deadline Tuân thủ Pháp lý (Cần đưa vào Notion/Roadmap)

Dựa trên yêu cầu của pháp luật Việt Nam (Đặc biệt là Nghị định 13/2023/NĐ-CP) và tiến độ ra mắt, team cần note 5 deadline sau:

1. **Trước ngày Launch M1 (X tuần sau khi M1 pass — mốc tương đối, không hard-code tháng):** Cập nhật **Chính sách Quyền riêng tư (Privacy Policy) & Terms of Service** rõ ràng ngay màn hình Onboarding. Phải có checkbox đồng ý (Opt-in) + **consent thật** cho việc gửi ảnh phòng lên cloud xử lý & xóa ngay, và thu thập số điện thoại.
2. **Kể từ lúc phát sinh thu thập dữ liệu User đầu tiên + 60 ngày:** Hoàn thành nộp **Hồ sơ Đánh giá tác động xử lý dữ liệu cá nhân** (theo mẫu NĐ 13) lên Cục An ninh mạng (A05 - Bộ Công an).
3. **Kể từ lúc đẩy Database lên Cloud quốc tế + 60 ngày:** Hoàn thành nộp **Hồ sơ Đánh giá tác động chuyển dữ liệu cá nhân ra nước ngoài** (Gửi Cục A05).
4. **Xuyên suốt quá trình vận hành (72 giờ):** Bất cứ khi nào phát hiện sự cố rò rỉ dữ liệu (Data breach), bắt buộc phải có thông báo cho A05 và người dùng trong vòng **72 giờ** kể từ thời điểm phát hiện. Lập kế hoạch (Plan B) sẵn sàng ứng phó sự cố mạng.
5. **Trước khi mở tab Nhà hàng xóm (M2+, D10):** Có ý kiến luật sư về việc xin phép thiết lập mạng xã hội theo Nghị định 147/2024; có consent riêng cho việc đăng ảnh phòng công khai; xác thực người đăng bằng SĐT (OTP); có quy trình gỡ nội dung vi phạm trong 24 giờ khi cơ quan quản lý yêu cầu.
