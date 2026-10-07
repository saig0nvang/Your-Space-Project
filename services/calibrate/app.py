"""Service hiệu chỉnh máy ảnh từ 1 ảnh phòng bằng GeoCalib (cvg/GeoCalib: code Apache-2.0, trọng số CC BY 4.0).

POST /calibrate (multipart, trường `image`: JPEG/PNG) → góc nghiêng, góc chúc, FOV dọc và độ bất định.
Trả số thô theo quy ước GeoCalib (pitch âm = máy chúc xuống); đổi sang đường chân trời ở phía TypeScript
(packages/core `horizonFromGravity`). Chạy: xem README.md.
"""

import io
import os
import time

import torch
from fastapi import FastAPI, File, HTTPException, UploadFile
from PIL import Image
from torchvision.transforms.functional import to_tensor

from geocalib import GeoCalib

torch.set_num_threads(int(os.environ.get("CALIBRATE_THREADS", "4")))
MAX_BYTES = 7_000_000
MAX_SIDE = 1024  # GeoCalib tự thu nhỏ khi suy luận; co trước cho nhanh và đỡ RAM

app = FastAPI(title="YourSpace calibrate")
model = GeoCalib().eval()


@app.get("/health")
def health() -> dict:
    return {"ok": True}


@app.post("/calibrate")
async def calibrate(image: UploadFile = File(...)) -> dict:
    data = await image.read()
    if len(data) > MAX_BYTES:
        raise HTTPException(status_code=413, detail="Ảnh quá lớn.")
    try:
        pil = Image.open(io.BytesIO(data)).convert("RGB")
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Không đọc được ảnh.") from exc
    pil.thumbnail((MAX_SIDE, MAX_SIDE))

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
