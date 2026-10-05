# Capture Camera Page Overrides — C2 Camera

> **PROJECT:** YourSpace
> **Generated:** 2026-10-03 10:28:53 bởi ui-ux-pro-max (`--page "capture-camera"`, query `"camera viewfinder dark immersive"`), viết lại cho native.
> Quy tắc trong file này **ghi đè** `design-system/yourspace/MASTER.md` cho riêng màn camera. Phần không ghi ở đây theo MASTER.

---

## Vì sao có override

Camera trên iOS luôn tối để khung ngắm là thứ sáng nhất màn và người dùng nhìn đúng màu căn phòng (hướng dẫn iOS; critique 2026-10-03 ghi nhận khung sáng ở C2). Bản sinh tự động chỉ gợi ý "dark-to-light transitions, low white emission, high readability", không có quy tắc cụ thể; phần dưới là bản native.

## Page-Specific Rules

### Color Overrides

- Màn camera **luôn dùng bộ token tối** của MASTER, bất kể theme máy (code: `SchemeOverride scheme="dark"`). Thanh trạng thái chữ sáng.
- Khung ngắm hiển thị ảnh gốc, không phủ màu.

### Component Overrides

- Nút chụp: tròn, viền trắng `onAccent` (theme tối), vùng chạm ≥ 72.
- Thước cân bằng và gợi ý "Thấy rõ sàn nhà": viên thuốc nền `card` tối, chữ `foreground` tối.
- Sheet chọn ảnh mẫu / ảnh thư viện mở từ camera cũng dùng theme tối.

### Layout / Typography / Spacing

- Không override — theo MASTER.
