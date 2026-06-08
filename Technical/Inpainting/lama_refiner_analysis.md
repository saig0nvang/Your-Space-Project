# 🔬 Phân tích kỹ thuật: LaMa with Refiner

> Tài liệu này tổng hợp toàn bộ nghiên cứu kỹ thuật về `geomagical/lama-with-refiner` và đánh giá mức độ phù hợp cho YourSpace MVP.

---

## 1. Tổng quan mô hình

### 1.1 LaMa gốc (advimman/lama)
- **Tên đầy đủ:** Resolution-robust Large Mask Inpainting with Fourier Convolutions
- **Tác giả:** Roman Suvorov et al. (Samsung AI Center Moscow)
- **Công bố:** WACV 2022
- **Điểm mạnh cốt lõi:**
  - Sử dụng **Fourier Convolutions (Fast Fourier Convolution)** → mô hình có receptive field toàn cục, hiểu được cấu trúc lặp lại trong ảnh (sàn gạch, giấy dán tường, rèm cửa...)
  - Xử lý được **large mask** (xóa vùng rất lớn, ví dụ cả chiếc sofa 3m) mà vẫn tái tạo nền hợp lý
  - **Resolution-robust:** Train ở 256×256 nhưng generalize tốt lên ~2K resolution — quan trọng vì ảnh điện thoại chụp thường 3000×4000px+

### 1.2 Bản Refiner (geomagical/lama-with-refiner)
- **Tổ chức:** Geomagical Labs (đội ngũ đứng sau IKEA Kreativ)
- **Cải tiến:** Thêm module **Feature Refinement** vào pipeline inference
- **Lợi ích:**
  - Cải thiện đáng kể chất lượng inpainting ở **độ phân giải cao** (>1K)
  - Giảm artifact ở biên vùng mask (ranh giới xóa mượt mà hơn)
  - Đặc biệt tốt cho **indoor scene** — chính xác use-case của YourSpace
- **Giấy phép:** Apache License 2.0 ✅

---

## 2. Kiến trúc kỹ thuật

### 2.1 Pipeline Inference

```
┌─────────────┐     ┌──────────────┐     ┌───────────────┐     ┌──────────────┐
│ Ảnh phòng   │ ──→ │ Mask (vùng   │ ──→ │ LaMa Model    │ ──→ │ Refiner      │ ──→ Ảnh output
│ (input.png) │     │ cần xóa)     │     │ (FFC-based)   │     │ (Feature     │     (clean bg)
└─────────────┘     └──────────────┘     └───────────────┘     │  Refinement) │
                                                               └──────────────┘
```

### 2.2 Input/Output Format

| Thuộc tính | Chi tiết |
|---|---|
| **Input Image** | RGB, bất kỳ resolution (khuyến nghị ≤ 2048px cạnh dài) |
| **Input Mask** | Grayscale, cùng kích thước ảnh. Trắng = vùng cần xóa, đen = giữ nguyên |
| **Output** | RGB, cùng kích thước input, vùng mask đã được khôi phục |
| **Naming Convention** | `image1.png` + `image1_mask001.png` |

### 2.3 Cách chạy Inference (cơ bản)

```bash
# Không refine (LaMa gốc)
python3 bin/predict.py \
  model.path=$(pwd)/big-lama \
  indir=$(pwd)/input_images \
  outdir=$(pwd)/output

# Có refine (chất lượng cao hơn, chậm hơn)
python3 bin/predict.py \
  refine=True \
  model.path=$(pwd)/big-lama \
  indir=$(pwd)/input_images \
  outdir=$(pwd)/output
```

### 2.4 Pre-trained Models

| Model | Dataset | Kích thước | Use-case |
|---|---|---|---|
| **big-lama** ⭐ | Places2 + Places Challenge | ~200MB | **Khuyến nghị cho YourSpace** — train trên ảnh indoor/outdoor thực tế |
| lama-fourier | Places365-Standard | ~200MB | Phiên bản nhẹ hơn |
| lama-celeba | CelebA-HQ | ~200MB | Chuyên cho khuôn mặt — KHÔNG phù hợp |

---

## 3. Đánh giá phù hợp cho YourSpace

### 3.1 Mapping với PRD Requirements

| PRD Requirement | LaMa with Refiner | Đánh giá |
|---|---|---|
| **F3 - Xóa đồ, khôi phục nền** (Fallback UX) | Xóa furniture, vẽ lại sàn/tường | ✅ Khớp hoàn hảo |
| **User Story #2** - Ướm thử phong cách | Xóa đồ cũ trước khi đặt đồ mới | ✅ Nâng cấp trải nghiệm |
| Xử lý **large mask** (xóa cả sofa/giường) | Fourier Convolution, receptive field toàn cục | ✅ Điểm mạnh cốt lõi |
| **High-res photos** từ điện thoại | Refiner module cải thiện ở >1K | ✅ Chính xác mục đích |
| Hiểu **indoor scene** (sàn, tường, cửa) | Trained trên Places2 (indoor scenes) | ✅ Rất phù hợp |
| **Apache 2.0** license → thương mại | ✅ | ✅ Không rủi ro pháp lý |

### 3.2 Điểm mạnh

1. **Chất lượng SOTA** cho large mask inpainting (đặc biệt indoor)
2. **Pre-trained sẵn** — không cần train lại, tiết kiệm GPU/thời gian/tiền
3. **Refiner** tối ưu cho high-res — đúng nhu cầu ảnh chụp điện thoại
4. **Docker support** — dễ deploy thành microservice
5. **Geomagical Labs** (IKEA Kreativ) đã validate cho use-case nội thất

### 3.3 Hạn chế & Rủi ro

| Hạn chế | Impact | Mitigation |
|---|---|---|
| **Nặng cho mobile on-device** (~200MB model, cần GPU) | Không chạy được trên điện thoại tầm trung | Xem chi tiết tại `on_device_strategy.md` |
| **Inference time** ~2-5s trên GPU server, chậm hơn trên CPU | Ảnh hưởng UX real-time | Chấp nhận được — user xóa đồ không cần instant |
| **Cần mask input** (user phải vẽ vùng xóa) | Thêm bước tương tác | Kết hợp SAM (Segment Anything) để auto-mask từ tap |
| **Không hiểu ngữ nghĩa 3D** | Đôi khi vẽ sai perspective sàn nhà | PRD đã có Fallback F3: reveal ảnh gốc nếu inpainting xấu |

---

## 4. Ecosystem liên quan (có thể tích hợp)

| Tool | Mô tả | Ứng dụng cho YourSpace |
|---|---|---|
| [simple-lama-inpainting](https://github.com/enesmsahin/simple-lama-inpainting) | Pip package đơn giản hóa LaMa | Nhanh chóng prototype |
| [lama-cleaner](https://github.com/Sanster/lama-cleaner) | Self-host interactive tool | Tham khảo UX brush tool |
| [Inpaint-Anything](https://github.com/geekyutao/Inpaint-Anything) | SAM + LaMa combo | Auto-mask từ click → inpaint |
| [CoreMLaMa](https://github.com/mallman/CoreMLaMa) | LaMa → Apple Core ML | Tiềm năng iOS on-device |

---

## 5. Kết luận

> **LaMa with Refiner là lựa chọn tối ưu cho tính năng Inpainting của YourSpace MVP.**

- Giải quyết chính xác bài toán xóa nội thất cũ trong ảnh phòng thật
- Đã được Geomagical Labs (IKEA) validate cho use-case tương tự
- Giấy phép thương mại an toàn (Apache 2.0)
- Có sẵn pre-trained model, không cần train → tiết kiệm ngân sách bootstrap
- Trade-off on-device vs cloud cần quyết định rõ → xem `on_device_strategy.md`

---

*Cập nhật lần cuối: 2026-05-08*
