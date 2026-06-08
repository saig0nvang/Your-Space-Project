# 🏗️ Kiến trúc tích hợp Inpainting — YourSpace

> Tài liệu này mô tả cách tích hợp LaMa with Refiner vào hệ thống YourSpace, từ luồng người dùng đến kiến trúc kỹ thuật.

---

## 1. Luồng người dùng (User Flow)

```
User chụp ảnh phòng
        │
        ▼
Upload ảnh vào YourSpace
        │
        ▼
Chọn phong cách → Kéo thả đồ 3D vào phòng
        │
        ▼
User muốn XÓA một món đồ (đồ cũ hoặc đồ vừa đặt)
        │
        ├── Cách 1: Tap vào đồ → nhấn "Xóa"
        │                │
        │                ▼
        │        Hệ thống tạo mask tự động từ vị trí đồ
        │                │
        │                ▼
        │        Gửi ảnh + mask → LaMa Inpainting
        │                │
        │                ▼
        │        Nhận ảnh đã khôi phục nền
        │                │
        │                ▼
        │        ✅ Hiển thị kết quả
        │
        └── Cách 2 (Advanced): Brush tool vẽ vùng xóa thủ công
                         │
                         ▼
                 User vẽ mask bằng ngón tay
                         │
                         ▼
                 Gửi ảnh + mask → LaMa Inpainting
                         │
                         ▼
                 ✅ Hiển thị kết quả
```

---

## 2. Kiến trúc hệ thống

### 2.1 MVP Architecture (Cloud-based Inpainting)

Dựa trên kết luận từ `on_device_strategy.md`, MVP sẽ sử dụng **cloud-based approach** cho inpainting:

```
┌─────────────────────────────────────────────────────────────┐
│                    YourSpace Mobile App                      │
│                   (React Native / Flutter)                   │
│                                                             │
│  ┌──────────┐  ┌──────────────┐  ┌───────────────────────┐ │
│  │ Camera /  │  │ 3D Renderer  │  │ Inpainting Client     │ │
│  │ Gallery   │  │ (Three.js /  │  │                       │ │
│  │ Upload    │  │  SceneKit)   │  │ - Tạo mask từ vị trí  │ │
│  └──────────┘  └──────────────┘  │   đồ đã xóa           │ │
│                                  │ - Gửi request tới API  │ │
│                                  │ - Nhận & hiển thị kết  │ │
│                                  │   quả                  │ │
│                                  │ - Fallback: reveal ảnh │ │
│                                  │   gốc nếu API fail     │ │
│                                  └──────────┬────────────┘ │
└─────────────────────────────────────────────┼──────────────┘
                                              │
                                     HTTPS / WebSocket
                                              │
                                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  Inpainting Microservice                     │
│                    (Docker Container)                         │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ FastAPI /     │  │ LaMa with    │  │ big-lama         │  │
│  │ Flask Server  │  │ Refiner      │  │ model weights    │  │
│  │               │  │ (PyTorch)    │  │ (~200MB)         │  │
│  │ Endpoints:    │  │              │  │                  │  │
│  │ POST /inpaint │  │ refine=True  │  │ Places2 trained  │  │
│  │               │  │              │  │                  │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
│                                                             │
│  GPU: NVIDIA T4 / A10G (AWS/GCP) hoặc CPU fallback         │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 API Design

#### `POST /api/v1/inpaint`

**Request:**
```json
{
  "image": "<base64_encoded_image>",
  "mask": "<base64_encoded_mask>",
  "refine": true,
  "max_resolution": 1024
}
```

**Response:**
```json
{
  "status": "success",
  "result_image": "<base64_encoded_result>",
  "processing_time_ms": 2300,
  "model_version": "big-lama-refiner-v1"
}
```

**Error Response (Fallback trigger):**
```json
{
  "status": "error",
  "error_code": "PROCESSING_TIMEOUT",
  "fallback": "reveal_original"
}
```

### 2.3 Mask Generation Strategy

Trong YourSpace, mask được tạo tự động dựa trên vị trí đồ 3D mà user đã đặt:

```
Khi user xóa 1 món đồ:
  1. Lấy bounding box / silhouette của model 3D tại vị trí đã đặt
  2. Render silhouette thành mask trắng trên nền đen
  3. Dilate mask thêm 5-10px (mở rộng nhẹ) để cover shadow/edge
  4. Gửi ảnh gốc + mask → Inpainting API
```

> **Lưu ý:** Đối với tính năng "Magic Eraser" nâng cao (xóa đồ cũ TRONG ảnh gốc — đồ chưa do user đặt), cần kết hợp thêm **SAM (Segment Anything Model)** để user tap chọn đồ → auto-generate mask. Tính năng này thuộc phase NEXT, không nằm trong MVP.

---

## 3. Fallback Chain (Theo PRD - F3)

```
User xóa đồ
     │
     ▼
Gọi Inpainting API ──── Timeout / Error? ───→ Fallback Level 1:
     │                                         Reveal ảnh gốc
     │                                         (pixel ban đầu)
     ▼
Nhận kết quả
     │
     ▼
Kiểm tra chất lượng ── Artifact rõ rệt? ───→ Fallback Level 2:
     │                   (user report)         Hiện nút
     │                                         "Khôi phục ảnh gốc"
     ▼
✅ Hiển thị kết quả inpainted
```

**Nguyên tắc Fallback:**
- App **LUÔN** lưu bản gốc của ảnh phòng (trước mọi chỉnh sửa)
- Nếu inpainting API không khả dụng → **không block user** → reveal ảnh gốc
- User có thể nhấn "Khôi phục ảnh gốc" bất kỳ lúc nào

---

## 4. Chi phí vận hành ước tính

### 4.1 Self-hosted (Khuyến nghị cho MVP)

| Hạng mục | Chi phí | Ghi chú |
|---|---|---|
| **GPU Server** (AWS g4dn.xlarge) | ~$0.526/giờ (~$380/tháng nếu chạy 24/7) | NVIDIA T4, 16GB VRAM |
| **Spot Instance** | ~$0.16/giờ (~$115/tháng) | Giảm 70% nhưng có thể bị gián đoạn |
| **Serverless GPU** (RunPod / Modal) | ~$0.0002/request | Chỉ trả khi dùng — tối ưu cho MVP traffic thấp |

### 4.2 Ước tính cho MVP (1000 MAU)

| Kịch bản | Requests/tháng | Chi phí/tháng |
|---|---|---|
| **Conservative** (2 xóa/user/session, 3 sessions/tháng) | ~6,000 | ~$1.2 (serverless) |
| **Moderate** (5 xóa/user/session, 5 sessions/tháng) | ~25,000 | ~$5 (serverless) |
| **Heavy** (10 xóa/user/session, 10 sessions/tháng) | ~100,000 | ~$20 (serverless) |

> **Kết luận:** Với serverless GPU, chi phí Inpainting **gần như không đáng kể** trong giai đoạn MVP. Nằm thoải mái trong budget bootstrap <10 triệu VNĐ.

---

## 5. Deployment Plan

### Phase 1: MVP (Tuần 1-2)

```bash
# 1. Clone repo
git clone https://github.com/geomagical/lama-with-refiner.git

# 2. Download pre-trained model
curl -LJO https://huggingface.co/smartywu/big-lama/resolve/main/big-lama.zip
unzip big-lama.zip

# 3. Wrap trong FastAPI server
# (Xem file api_server.py mẫu bên dưới)

# 4. Dockerize
docker build -t yourspace-inpainting .
docker run -p 8080:8080 --gpus all yourspace-inpainting

# 5. Deploy lên cloud (RunPod/Modal/AWS)
```

### Phase 2: Optimization (Tuần 3-4)
- Thêm caching (ảnh đã xử lý)
- Batch processing cho multiple masks
- Rate limiting & auth

### Phase 3: NEXT (Post-MVP)
- Tích hợp SAM cho auto-mask (tap đồ cũ → xóa)
- Explore on-device options (CoreMLaMa cho iOS)
- A/B test Refiner vs non-Refiner quality

---

## 6. Skeleton API Server (Tham khảo)

```python
# api_server.py - Skeleton cho Inpainting microservice
from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
import base64
import io
import time

app = FastAPI(title="YourSpace Inpainting API")

# TODO: Load model on startup
# model = load_lama_model("big-lama")

@app.post("/api/v1/inpaint")
async def inpaint(
    image: UploadFile = File(...),
    mask: UploadFile = File(...),
    refine: bool = True,
    max_resolution: int = 1024
):
    """
    Inpaint vùng mask trong ảnh phòng.
    
    - image: Ảnh phòng gốc (PNG/JPG)
    - mask: Mask trắng = vùng xóa, đen = giữ (PNG)
    - refine: Bật Feature Refinement (chất lượng cao hơn, chậm hơn)
    - max_resolution: Giới hạn cạnh dài (giảm để tăng tốc)
    """
    start_time = time.time()
    
    try:
        # TODO: Implement inference pipeline
        # 1. Đọc image + mask
        # 2. Resize nếu > max_resolution
        # 3. Chạy LaMa inference (refine=refine)
        # 4. Encode kết quả
        
        processing_time = (time.time() - start_time) * 1000
        
        return JSONResponse({
            "status": "success",
            "result_image": "<base64_result>",
            "processing_time_ms": processing_time,
            "model_version": "big-lama-refiner-v1"
        })
    except Exception as e:
        return JSONResponse({
            "status": "error",
            "error_code": "PROCESSING_FAILED",
            "message": str(e),
            "fallback": "reveal_original"
        }, status_code=500)


@app.get("/health")
async def health():
    return {"status": "ok", "model_loaded": True}
```

---

*Cập nhật lần cuối: 2026-05-08*
