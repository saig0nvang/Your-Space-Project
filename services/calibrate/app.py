"""Service phân tích 1 ảnh phòng.

POST /calibrate (multipart, trường `image`: JPEG/PNG) → góc nghiêng, góc chúc, FOV dọc và độ bất định, bằng GeoCalib
(cvg/GeoCalib: code Apache-2.0, trọng số CC BY 4.0). Trả số thô theo quy ước GeoCalib (pitch âm = máy chúc xuống);
đổi sang đường chân trời ở phía TypeScript (packages/core `horizonFromGravity`).
POST /detect (cùng đầu vào) → khung các món nội thất, bằng Grounding DINO tiny (IDEA-Research, Apache-2.0) tìm theo
chữ — như lớp segmentation_0 IKEA Kreativ tính sẵn lúc quét. Chạy: xem README.md.
"""

import io
import os
import threading
import time

import torch
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.concurrency import run_in_threadpool
from PIL import Image
from torchvision.transforms.functional import to_tensor

from geocalib import GeoCalib

torch.set_num_threads(int(os.environ.get("CALIBRATE_THREADS", "4")))
MAX_BYTES = 7_000_000
MAX_SIDE = 1024  # GeoCalib tự thu nhỏ khi suy luận; co trước cho nhanh và đỡ RAM

app = FastAPI(title="YourSpace calibrate")
model = GeoCalib().eval()

DETECT_MODEL = "IDEA-Research/grounding-dino-tiny"
# Tên tiếng Anh (Grounding DINO hiểu) → nhãn hiển thị. Không có rèm: vùng quá lớn để xóa đẹp. Model hay gộp cụm
# gần nghĩa ("armchair chair", "table desk") nên các cụm đó cùng một nhãn chung; "picture frame" để tranh treo tường
# không bị nhận là cây.
LABELS = {
    "sofa": "Sofa", "armchair": "Ghế", "chair": "Ghế", "stool": "Ghế", "table": "Bàn", "desk": "Bàn", "bed": "Giường",
    "cabinet": "Tủ", "wardrobe": "Tủ", "shelf": "Kệ", "lamp": "Đèn", "potted plant": "Cây", "rug": "Thảm",
    "television": "TV", "picture frame": "Tranh",
}
DETECT_TEXT = ". ".join(LABELS) + "."
DETECT_SIDE = 512  # cạnh ngắn đưa vào model: 800 mặc định chậm gấp ~2 mà khung đồ lớn không tốt hơn
_detector = None
_detector_lock = threading.Lock()


def detector():
    """Nạp lười (~700 MB, lần đầu tải từ Hugging Face) để /calibrate khởi động nhanh như trước."""
    global _detector
    with _detector_lock:
        if _detector is None:
            from transformers import AutoModelForZeroShotObjectDetection, AutoProcessor

            _detector = (AutoProcessor.from_pretrained(DETECT_MODEL), AutoModelForZeroShotObjectDetection.from_pretrained(DETECT_MODEL).eval())
    return _detector


async def read_image(image: UploadFile) -> Image.Image:
    data = await image.read()
    if len(data) > MAX_BYTES:
        raise HTTPException(status_code=413, detail="Ảnh quá lớn.")
    try:
        pil = Image.open(io.BytesIO(data)).convert("RGB")
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Không đọc được ảnh.") from exc
    pil.thumbnail((MAX_SIDE, MAX_SIDE))
    return pil


@app.get("/health")
def health() -> dict:
    return {"ok": True}


@app.post("/calibrate")
async def calibrate(image: UploadFile = File(...)) -> dict:
    pil = await read_image(image)

    t0 = time.time()
    with torch.no_grad():
        r = model.calibrate(to_tensor(pil))
    roll, pitch = (float(v) for v in r["gravity"].rp[0])
    return {
        "rollRad": roll,
        "pitchRad": pitch,
        "vfovRad": float(r["camera"].vfov[0]),
        "rollUncertainty": float(r["roll_uncertainty"].flatten()[0]),
        "pitchUncertainty": float(r["pitch_uncertainty"].flatten()[0]),
        "vfovUncertainty": float(r["vfov_uncertainty"].flatten()[0]),
        "ms": round((time.time() - t0) * 1000),
    }


def _label(text: str) -> str | None:
    """Grounding DINO có thể gộp nhiều cụm ("armchair chair") — lấy cụm đầu tiên có trong LABELS."""
    for k in sorted(LABELS, key=len, reverse=True):
        if text.startswith(k):
            return LABELS[k]
    return None


@app.post("/detect")
async def detect(image: UploadFile = File(...)) -> dict:
    # Suy luận ~8 s: chạy trong threadpool để /calibrate (gọi cùng lúc ở bước Thử phòng) không phải chờ.
    return await run_in_threadpool(_detect, await read_image(image))


def _detect(pil: Image.Image) -> dict:
    proc, det = detector()
    t0 = time.time()
    inputs = proc(images=pil, text=DETECT_TEXT, return_tensors="pt", size={"shortest_edge": DETECT_SIDE, "longest_edge": 1333})
    with torch.no_grad():
        out = det(**inputs)
    r = proc.post_process_grounded_object_detection(
        out, inputs.input_ids, threshold=0.35, text_threshold=0.25, target_sizes=[pil.size[::-1]]
    )[0]
    w, h = pil.size
    objects = []
    for box, score, text in zip(r["boxes"].tolist(), r["scores"].tolist(), r["text_labels"]):
        label = _label(text)
        if label:
            x0, y0, x1, y1 = box
            objects.append({"label": label, "score": round(score, 3), "box": [x0 / w, y0 / h, x1 / w, y1 / h]})
    return {"objects": objects, "ms": round((time.time() - t0) * 1000)}
