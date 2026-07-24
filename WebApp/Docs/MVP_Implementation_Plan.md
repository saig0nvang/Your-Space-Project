# Dự án YourSpace — Kế hoạch xây PoC (M0) → nền cho M1 Web (Local PC)

> **Nhãn mốc (theo Decisions Log 2026-07-23):** Tài liệu này là kế hoạch dựng **M0 — PoC** (proof of concept, KHÔNG gọi là "MVP"). PoC này là nền tái sử dụng cho **M1 — Validation web-first (~4-6 tuần)**. "MVP thật" chỉ đến ở **M2 (~3-4 tháng)**. Tránh gọi chung mọi mốc là "MVP".

Mục tiêu giai đoạn này (M0 PoC) là xây dựng ngay lập tức lõi tính năng quan trọng nhất: **Tải ảnh, chèn đồ vật 3D, và kéo thả/xoay/phóng to đồ vật** ngay trên Local PC của anh/chị.

Tài nguyên hệ thống hiện tại của máy anh/chị **chưa được cài đặt Node.js**, nhưng đã có sẵn **Python 3.10**. Theo tinh thần "Khởi nghiệp tinh gọn" - thử nghiệm nhanh, em sẽ hạn chế yêu cầu anh/chị phải cài đặt phức tạp.

## Kế hoạch triển khai (Implementation Plan)

### Cấu trúc dự án
Sử dụng kiến trúc Vanilla Javascript (ES Modules) cho tính năng 3D, không dùng Build System nặng (Vite/React) nhằm chạy ngay trên Browser thông qua Local Server của Python.

**Thêm các file sau vào thư mục làm việc hiện tại (`c:/Users/speed/OneDrive/Desktop/YourSpace Project`):**

#### [NEW] `index.html`
- Giao diện người dùng cơ bản nhưng rất hiện đại (UI/UX) với tông màu sang trọng.
- Phần khung làm việc (Canvas) để load Three.js.
- Nút tính năng: Chọn ảnh (`<input file>`) và Chọn vật thể 3D mẫu.
- Map các thư viện Three.js (ES Module) qua CDN gốc.

#### [NEW] `style.css`
- Định dạng giao diện theo chuẩn thiết kế hiện đại (Glassmorphism, Gradient).

#### [NEW] `app.js`
- Quản lý cảnh 3D (Scene, Camera, Renderer).
- Chức năng đọc ảnh local thông qua `FileReader` và dùng ảnh làm hình nền (Background/Texture).
- Kích hoạt cơ chế hiển thị ánh sáng chuẩn để vật chứa đổ khối giả.
- `GLTFLoader`: Đọc các tệp `.glb` trong thư mục.
- `TransformControls`: Thêm thao tác kéo, thả, bấu xoay, thay đổi kích thước vật ở môi trường 3D đè lên 2D.

### Tài nguyên có sẵn đã được em chuẩn bị
- [x] Đã download 2 mô hình 3D mẫu dạng chuẩn Web (Box và Duck - trong file `box.glb` và `duck.glb`) lưu ngay tại thư mục Desktop để giả lập làm đồ nội thất trước khi ta có source nội thất thật.

## Open Questions

- Ở bản thử nghiệm gốc này mình tạm thiết kế chức năng "Upload" để người dùng tải một cái ảnh phòng bất kỳ trong máy tính lên làm nền đúng không ạ? 

## Verification Plan
1. Code đầy đủ các module html, css, js.
2. Dùng lệnh Local Server (`python -m http.server`) để host ứng dụng web.
3. Kiểm tra tính năng Load Texture, Load Model 3D mẫu và thao tác Drag chuột.
