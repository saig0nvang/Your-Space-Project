# 🦙 Inpainting Module — YourSpace

> **📌 TRẠNG THÁI HƯỚNG ĐI (2026-07-23 — theo Decisions_Log D3):**
> - **MVP = CLOUD inpainting** (API hosted, ảnh xử lý & xóa ngay) → hướng chính thức, xem `integration_architecture.md`.
> - **On-device 100% = TẦM NHÌN DÀI HẠN** (nghiên cứu cho sau, KHÔNG build trong MVP) → xem `on_device_strategy.md`.
> - `lama_refiner_analysis.md` = phân tích kỹ thuật LaMa (model ~200MB, cần GPU) làm nền cho cả hai hướng.
> - Nguồn chốt: `Product_research/Decisions_Log_2026-07-23.md` (D3).

> Tất cả tài liệu thiết kế, nghiên cứu, và kế hoạch triển khai liên quan đến tính năng **Inpainting (Xóa đồ nội thất cũ)** của YourSpace được quản lý tại folder này.

---

## 📂 Cấu trúc Folder

```
Inpainting/
├── README.md                          # Tổng quan (file này)
├── lama_refiner_analysis.md           # Phân tích kỹ thuật LaMa with Refiner
├── integration_architecture.md        # Kiến trúc tích hợp vào YourSpace
└── on_device_strategy.md              # Chiến lược On-device vs Cloud
```

## 🔗 Tài liệu tham chiếu

| Tài liệu | Liên kết |
|---|---|
| **Source Repository** | [geomagical/lama-with-refiner](https://github.com/geomagical/lama-with-refiner) |
| **Paper gốc** | [LaMa: Resolution-robust Large Mask Inpainting with Fourier Convolutions (WACV 2022)](https://arxiv.org/abs/2109.07161) |
| **Paper Refiner** | [Feature Refinement to Improve High Resolution Image Inpainting](https://arxiv.org/abs/2206.13644) |
| **PRD YourSpace** | [PRD_skeleton.md](../PRD_skeleton.md) — Mục 10.7 (Model Selection) & F3 (Fallback UX) |
| **Giấy phép** | Apache License 2.0 ✅ (Thương mại hóa được) |

## 🎯 Vai trò trong YourSpace

Inpainting phục vụ **User Story #2** (Ướm thử trong phòng thật) và **Fallback F3** trong PRD:

> Khi user xóa một món đồ nội thất đã đặt trong ảnh, hệ thống cần **khôi phục lại nền phòng phía sau** (sàn nhà, tường, giấy dán tường...) một cách tự nhiên, thay vì để lại vùng trống hoặc artifact.

---

*Cập nhật lần cuối: 2026-05-08*
