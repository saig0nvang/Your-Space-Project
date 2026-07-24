# 🚀 Hướng Dẫn Bản PoC (M0): YourSpace (Local PC)

Em đã lập trình xong toàn bộ lõi tính năng cho bảng chạy thử (Prototype) của tính năng thiết kế không gian theo chuẩn **Zero Setup** trên thư mục Local của anh/chị.

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)
- Giao diện: HTML5, CSS3 Glassmorphism UI (Thiết kế giả lập không viền).
- Render 3D: **Three.js** (Sử dụng ES Module nạp trực tiếp qua CDN).
- Server: Python HTTP Server (Chạy ở port `8000`).

## 🖼️ Các Tính Năng Đã Hoàn Thiện

1. **Upload Ảnh Không Gian Nền (Background Texture)**
   - Hệ thống cho phép chọn ảnh `.jpg/.png` bất kỳ trên máy để dải trực tiếp ra sau làm nền Không gian mô phỏng mà không cần backend đẩy ảnh.
2. **Hệ Thống Phân Phối 3D (Asset Loader)**
   - Đọc trực tiếp các file 3D chuẩn web (`.glb`) thông qua nút bấm trên UI. Em đã tích hợp sẵn module Model `box.glb` và `duck.glb` ngay trên máy.
3. **Bộ Nắn Chỉnh Không Gian 3D (Transform Controls)**
   - Cung cấp thao tác kéo trục màu (**X, Y, Z**) để tương tác vật nặng. Tích hợp chuyển đổi trạng thái bằng phím tắt như phần mềm thiết kế chuyên nghiệp.
4. **Hệ Thống Hứng Bóng Ánh Sáng Thực (Shadow Catcher)**
   - Phía dưới không gian 3D được che giấu một tấm "Sàn Phẳng Vô Hình". Khi đèn nền chiếu vào, đồ nội thất sẽ có bóng đổ tự nhiên tiệp vào ảnh nền phía sau.

---

## 🎮 Cách Khởi Chạy Và Trải Nghiệm Ngay

Em đã bật sẵn **Server Python** chạy ngầm giúp anh/chị. Để trải nghiệm ngay dự án, anh/chị chỉ cần làm theo bước sau:

> [!IMPORTANT]
> Mở trình duyệt Web (Chrome/Edge/Cốc Cốc) lên và dán vào thanh địa chỉ đường link này:
> **`http://localhost:8000`**

### Các Bước Test Tính Năng:
1. Nhấp Nút **"1. Tải ảnh không gian phòng"** -> Tải đại 1 ảnh trên máy lên (Nên tải ảnh 1 góc phòng có mặt đất để dễ thử nghiệm bóng đổ).
2. Nhấn nút **"Vịt Đồ Chơi (Duck)"** -> Chờ một tẹo để Model 3D tải xuống và rớt vào giữa khung hình.
3. Dùng Chuột nhấn đè vào các trục Mũi tên (Đỏ, Xanh, Lá) để kéo con Vịt chạy loanh quanh sàn.
4. **Test Phím Tắt Cực Đẹp:**
   - Bấm phím **R**: Từ mũi tên đổi qua Vòng tròn -> Dùng chuột cầm vòng tròn kéo vặn để xoay cổ xoay mình món đồ.
     > [!NOTE]
     > Bản PoC hiện cho xoay tự do quanh mọi trục để thử nghiệm. Ở bản MVP/M1, thao tác xoay sẽ giới hạn **CHỈ theo trục Y** để đồ luôn đứng đúng phối cảnh trong phòng.
   - Bấm phím **S**: Từ vòng tròn đổi qua Giao diện điểm chấm (Cube) -> Kéo để con Vịt to ra như quái vật hoăc nhỏ xíu lại cho hợp với tỷ lệ phòng của anh/chị.
   - Bấm phím **T**: Quay về dạng di chuyển lúc nãy.

*Lưu ý: Mọi code đều nằm trong folder `c:/Users/speed/OneDrive/Desktop/YourSpace Project/`. Tương lai có file bàn ghế 3D thực tế, anh/chị chỉ cần đưa file `.glb` vào đây và cho thêm 1 nút bấm vào UI là chạy luôn!*
