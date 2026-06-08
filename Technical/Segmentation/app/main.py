from __future__ import annotations

from contextlib import asynccontextmanager
from typing import Any, Dict, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from .config import SEGMENTATION_ROOT, load_settings
from .image_utils import (
    decode_image_base64,
    encode_png_base64,
    export_segmentation,
    mask_bbox,
    overlay_mask,
)
from .sam2_service import Sam2Segmenter, Sam2UnavailableError


settings = load_settings()
segmenter = Sam2Segmenter(settings)


@asynccontextmanager
async def lifespan(app: FastAPI):
    segmenter.load(raise_on_error=False)
    yield


app = FastAPI(title="YourSpace Segmentation API", version="0.1.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


class SegmentRequest(BaseModel):
    image: str = Field(..., description="Base64 image or data URL")
    x: int = Field(..., ge=0)
    y: int = Field(..., ge=0)
    label: int = Field(1, description="1 positive point, 0 negative point")


class ExportRequest(BaseModel):
    image: str
    mask: str
    overlay: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)
    job_id: Optional[str] = None


@app.get("/health")
def health() -> dict[str, Any]:
    return {
        "status": "ok",
        "model_loaded": segmenter.is_loaded,
        "model": segmenter.model_info(),
        "settings": {
            "max_image_side": settings.max_image_side,
            "mask_threshold": settings.mask_threshold,
            "dilation_pixels": settings.dilation_pixels,
            "allow_cpu_fallback": settings.allow_cpu_fallback,
        },
    }


@app.post("/api/v1/segment")
def segment(payload: SegmentRequest) -> dict[str, Any]:
    try:
        image = decode_image_base64(payload.image)
        if payload.x >= image.width or payload.y >= image.height:
            raise HTTPException(
                status_code=422,
                detail=f"Tap point ({payload.x}, {payload.y}) is outside image {image.width}x{image.height}.",
            )

        mask_image, score = segmenter.predict(image, payload.x, payload.y, payload.label)
        overlay = overlay_mask(
            image,
            mask_image,
            settings.overlay_color,
            settings.overlay_alpha,
        )
        return {
            "status": "success",
            "mask_png_base64": encode_png_base64(mask_image),
            "overlay_png_base64": encode_png_base64(overlay),
            "bbox": mask_bbox(mask_image),
            "score": score,
            "image_size": {"width": image.width, "height": image.height},
            "model": segmenter.model_info(),
        }
    except HTTPException:
        raise
    except Sam2UnavailableError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Segmentation failed: {exc}") from exc


@app.post("/api/v1/export")
def export(payload: ExportRequest) -> dict[str, Any]:
    try:
        paths = export_segmentation(
            SEGMENTATION_ROOT / "outputs",
            payload.image,
            payload.mask,
            payload.overlay,
            payload.metadata,
            payload.job_id,
        )
        return {"status": "success", **paths}
    except FileExistsError as exc:
        raise HTTPException(status_code=409, detail="job_id already exists") from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Export failed: {exc}") from exc
