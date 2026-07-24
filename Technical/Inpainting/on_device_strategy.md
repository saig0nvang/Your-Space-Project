# 📱 Chiến lược On-device vs Cloud — Inpainting

> **🔵 TRẠNG THÁI (2026-07-23 — theo Decisions_Log D3): NGHIÊN CỨU cho TẦM NHÌN on-device tương lai — KHÔNG build trong MVP.**
> Founder đã chốt: MVP dùng **cloud inpainting** (xem `integration_architecture.md`). "100% on-device" là **tầm nhìn dài hạn / killer decision** để khác biệt hóa privacy, revisit khi công nghệ cho phép (model nhẹ hơn, NPU mobile mạnh hơn). Tài liệu này là phân tích nền cho hướng đó, không phải hạng mục build MVP. Xem `Product_research/Decisions_Log_2026-07-23.md` (D3).
> *Ghi chú chỉ cập nhật trạng thái; phần phân tích kỹ thuật bên dưới giữ nguyên (bao gồm cả câu trích PRD cũ "AI chạy hoàn toàn on-device" — được giữ nguyên làm bối cảnh lịch sử).*

> Tài liệu này phân tích trade-off giữa việc chạy LaMa Inpainting trực tiếp trên thiết bị (on-device) và trên cloud, trong bối cảnh PRD yêu cầu **"AI chạy hoàn toàn on-device"**.

---

## 1. Vấn đề cần giải quyết

PRD YourSpace (Mục 10.7 & 10.8) nêu rõ:

> *"AI trong MVP chạy **hoàn toàn on-device** (depth estimation + inpainting) → không cần server AI, không có chi phí API per-request."*

Câu hỏi: **LaMa with Refiner có đáp ứng được yêu cầu on-device không?**

---

## 2. Phân tích On-device Feasibility

### 2.1 Yêu cầu phần cứng của LaMa

| Thông số | Giá trị |
|---|---|
| **Model size** | ~200MB (big-lama weights) |
| **Framework** | PyTorch (không native mobile support) |
| **GPU VRAM cần** | 2-4GB (inference, ảnh 1024px) |
| **Inference time (GPU server)** | 1-3s (không refine), 3-5s (có refine) |
| **Inference time (CPU server)** | 10-30s |

### 2.2 Khả năng thiết bị mobile

| Thiết bị | RAM | GPU | Chạy LaMa được? |
|---|---|---|---|
| iPhone 15 Pro (A17 Pro) | 8GB | Apple Neural Engine | ⚠️ Cần convert sang CoreML — khả thi nhưng phức tạp |
| iPhone 12/13 (A15/A16) | 4-6GB | Apple Neural Engine | ❌ Thiếu RAM cho model 200MB + ảnh |
| Samsung Galaxy S24 | 8-12GB | Snapdragon 8 Gen 3 | ⚠️ Cần convert sang ONNX/TFLite — chưa được test |
| Android tầm trung (2020+) | 4-6GB | Adreno 619/Mali-G57 | ❌ Không đủ |
| Điện thoại target YourSpace | 4-6GB (phổ biến) | Varies | ❌ Không khả thi |

### 2.3 Các nỗ lực convert on-device đã biết

| Project | Platform | Status | Ghi chú |
|---|---|---|---|
| [CoreMLaMa](https://github.com/mallman/CoreMLaMa) | iOS (Core ML) | ✅ Hoạt động | Chỉ iOS 16+, model nặng, chưa có refiner |
| ONNX export | Cross-platform | ⚠️ Thử nghiệm | FFC layer convert không hoàn chỉnh |
| TensorFlow Lite | Android | ❌ Chưa có | Không ai đã convert thành công |

---

## 3. So sánh chiến lược

### 3.1 Option A: On-device (Như PRD yêu cầu)

| Ưu điểm | Nhược điểm |
|---|---|
| ✅ Zero latency mạng | ❌ Model 200MB tăng app size đáng kể |
| ✅ Không cần server → zero cost | ❌ Inference 15-30s trên CPU mobile → UX tệ |
| ✅ Privacy (ảnh không rời device) | ❌ Chỉ hoạt động trên flagship phones |
| ✅ Offline support | ❌ Convert PyTorch → CoreML/TFLite: 2-4 tuần effort |
| | ❌ Không có Refiner (chất lượng thấp hơn) |
| | ❌ RAM crash trên thiết bị 4GB |

### 3.2 Option B: Cloud API (Khuyến nghị)

| Ưu điểm | Nhược điểm |
|---|---|
| ✅ Chất lượng cao nhất (GPU + Refiner) | ❌ Cần kết nối internet |
| ✅ Inference 2-5s (nhanh hơn on-device) | ❌ Chi phí server (~$1-20/tháng MVP) |
| ✅ Hoạt động trên MỌI thiết bị | ❌ Ảnh upload lên server → privacy concern |
| ✅ Dễ cập nhật model (không cần update app) | ❌ Thêm latency mạng (~1-2s) |
| ✅ Deploy nhanh (Docker, 1 tuần) | |

### 3.3 Option C: Hybrid (Tối ưu dài hạn)

| Thiết bị | Chiến lược |
|---|---|
| iPhone 15 Pro+ (8GB+ RAM) | On-device via CoreML (nếu có thời gian convert) |
| Tất cả thiết bị khác | Cloud API |
| Offline mode | Fallback → reveal ảnh gốc (không inpainting) |

---

## 4. Khuyến nghị cho YourSpace

### 🏆 MVP: Chọn Option B (Cloud API) + Fallback ảnh gốc

**Lý do:**

1. **Timeline constraint** (4-6 tuần ship MVP): Convert LaMa sang mobile mất 2-4 tuần riêng effort này, chiếm gần hết timeline. Cloud deploy chỉ mất 3-5 ngày.

2. **Budget constraint** (<10 triệu VNĐ): Chi phí cloud cho 1000 MAU chỉ ~$1-5/tháng (serverless). Rẻ hơn nhiều so với thời gian solo founder bỏ ra để optimize on-device.

3. **Target device coverage**: User target của YourSpace (25-35 tuổi, thu nhập 15-40 triệu/tháng) phổ biến dùng điện thoại tầm trung (4-6GB RAM) → on-device LaMa không chạy được.

4. **Chất lượng > Privacy cho MVP**: Inpainting cần chất lượng cao để WOW user. Cloud + Refiner cho kết quả tốt nhất. Privacy concern có thể mitigate bằng:
   - Không lưu ảnh user sau khi xử lý
   - Xóa ảnh ngay sau khi trả kết quả
   - Ghi rõ trong Privacy Policy

5. **PRD Fallback F3 đã cover**: Khi API fail → reveal ảnh gốc. User không bao giờ bị "kẹt".

### Điều chỉnh PRD cần thực hiện

Câu trong PRD hiện tại:
> *"AI trong MVP chạy hoàn toàn on-device"*

**Đề xuất sửa thành:**

> *"AI Depth Estimation chạy on-device (Depth Anything V2, ~25MB). AI Inpainting sử dụng cloud microservice (LaMa with Refiner) do yêu cầu phần cứng vượt khả năng thiết bị tầm trung. Ảnh user được xử lý real-time và XÓA ngay sau khi trả kết quả — không lưu trữ trên server."*

**Lý do tách biệt:**
- **Depth Estimation**: Cần real-time (mỗi lần drag đồ) → BẮT BUỘC on-device → Depth Anything V2 Small (25MB) đáp ứng tốt
- **Inpainting**: Chỉ cần khi user XÓA đồ (thao tác ít thường xuyên hơn) → cloud chấp nhận được về latency

---

## 5. Roadmap On-device (Post-MVP)

Nếu traction tốt và có thêm nguồn lực:

| Phase | Timeline | Mục tiêu |
|---|---|---|
| **MVP** | Tuần 1-6 | Cloud API (LaMa + Refiner via Docker) |
| **NEXT** | Tháng 3-6 | CoreMLaMa cho iOS flagship (giảm cloud cost) |
| **LATER** | Tháng 6-12 | Explore model nhẹ hơn (MAT, CoModGAN) cho Android on-device |
| **SCALE** | Năm 2+ | Custom lightweight model trained trên indoor-only dataset |

---

## 6. Tham chiếu

- PRD Mục 10.7 — Model Selection Rationale
- PRD Mục 10.8 — Data Requirements
- PRD Mục 10.9 — Fallback UX (F3)
- Conversation log: Phân tích on-device feasibility (2026-05-07)
- [CoreMLaMa GitHub](https://github.com/mallman/CoreMLaMa)

---

*Cập nhật lần cuối: 2026-05-08*
