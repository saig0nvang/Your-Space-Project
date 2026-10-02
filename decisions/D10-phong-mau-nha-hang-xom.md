---
id: D10
title: Thiết kế có sẵn gồm Phòng mẫu và cộng đồng Nhà hàng xóm
status: accepted
date: 2026-10-02
supersedes: null
superseded_by: null
amends: null
amended_by: []
---

**Quyết định:** Ngoài luồng thử đồ trong ảnh phòng của chính mình, YourSpace có mục **Thiết kế có sẵn** với hai tab:

- **Phòng mẫu** — không gian do YourSpace tuyển chọn và dựng.
- **Nhà hàng xóm** — không gian do người dùng tự đăng lên.

Nguồn chuẩn của flow: `Product/PRD.md` §4.2 và artifact "Hành trình YourSpace".

**Chi tiết đã chốt (founder, 2026-10-02):**

- **Dùng làm mẫu rẽ hai nhánh**, áp dụng cho cả hai tab:
  - *Dùng cả không gian* — cho nhà cùng layout (ví dụ hai căn hộ giống nhau). Tạo bản sao ảnh phòng và cách bày của người đăng vào Phòng của tôi để chỉnh tiếp. Bản gốc không bị đổi.
  - *Lấy bộ món* — đưa các món người đăng đã dùng vào khay; người dùng tự đặt vào ảnh phòng của mình.
- **Mua từ thiết kế:** mua lẻ hoặc mua cả bộ. Mua cả bộ = **một lần thanh toán, hệ thống tách đơn theo nhà cung cấp**. Mua xong quay về đúng tab đang xem.
- **Đăng nhập:** dùng app, thử phòng và lưu trên máy **không cần đăng nhập**. Đăng nhập là xác minh SĐT bằng OTP, chỉ ở ba chỗ: thanh toán, đặt lịch chuyên gia, và **đăng thiết kế lên Nhà hàng xóm**.
- **Người đăng không được chia hoa hồng.** Phần thưởng của họ là lượt thả tim, lượt dùng làm mẫu và việc ghi nguồn trên mọi bản dùng lại.
- **Thả tim** trên thiết kế cộng đồng; thả tim cũng lưu thiết kế vào tab Yêu thích.
- **Kiểm duyệt hậu kiểm:** thiết kế hiện ngay khi đăng; khi đủ vài lượt báo cáo từ các tài khoản khác nhau thì ẩn chờ xem xét, rồi khôi phục hoặc gỡ hẳn. Yêu cầu từ cơ quan quản lý thì gỡ trong 24 giờ.
- **Đồ cũ trong ảnh:** người dùng chạm để chọn vật thể cần xóa, như IKEA Kreativ. Không tự xóa.
- **Tên tab:** chọn "Phòng mẫu" / "Nhà hàng xóm". Không dùng các tên ngụ ý có kiến trúc sư tuyển chọn (ví dụ "Architect's choice") khi không có kiến trúc sư thật tham gia — đó là tuyên bố sai, cùng loại rủi ro với câu "100% on-device" ở D3.

**Lý do:**

- Tạo vòng lan truyền: một thiết kế được đăng là nội dung để người khác dùng làm mẫu, mỗi bản dùng lại có thể được đăng tiếp.
- Hợp thị trường căn hộ Việt Nam: nhiều người trẻ sống trong các khối căn hộ cùng layout, nên "dùng cả không gian" của hàng xóm dùng được ngay.
- Giữ đúng D1 (user-first): cộng đồng phục vụ người dùng tìm gu và mua đúng; không chia hoa hồng để tránh biến người đăng thành kênh bán hàng.

**Mốc:** thuộc **M2 trở đi**. Không đưa vào M1 (D5: M1 là web validation 4–6 tuần, chưa có tài khoản).

**Hệ quả cần đồng bộ:**

- `Product/PRD.md` và `Product/prd/epics/` — epic Thiết kế có sẵn, epic Đăng lên Nhà hàng xóm.
- `docs/superpowers/specs/2026-09-25-m2-mobile-app-design.md` — thêm nhóm màn Thiết kế có sẵn, đăng thiết kế, dùng làm mẫu; gộp dọn phòng vào canvas đặt đồ; bổ sung điểm đăng nhập.
- `Governance-and-Risk/territorial_scope.md` — ảnh phòng được **công khai** khi đăng: consent riêng theo NĐ13; Nghị định 147/2024 (gỡ nội dung vi phạm trong 24 giờ khi có yêu cầu, xác thực người dùng mạng xã hội bằng SĐT). **Cần luật sư xác nhận YourSpace có thuộc diện phải xin phép thiết lập mạng xã hội không.**
- `Governance-and-Risk/risk_register_v2.md` — rủi ro mới cần founder chấm điểm: pháp lý mạng xã hội, nội dung xấu trước khi bị báo cáo, tab cộng đồng trống lúc đầu, "cùng layout" nhưng khác kích thước.
- Pitch và `DESIGN.md` — câu về đăng nhập phải khớp quy tắc ở trên.
