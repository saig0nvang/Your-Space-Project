from __future__ import annotations

import base64
import io
import json
import uuid
from pathlib import Path
from typing import Any, Dict, Tuple

import numpy as np
from PIL import Image, ImageFilter


def strip_data_url(value: str) -> str:
    if "," in value and value.strip().lower().startswith("data:"):
        return value.split(",", 1)[1]
    return value


def decode_image_base64(value: str) -> Image.Image:
    raw = base64.b64decode(strip_data_url(value))
    return Image.open(io.BytesIO(raw)).convert("RGB")


def encode_png_base64(image: Image.Image) -> str:
    buffer = io.BytesIO()
    image.save(buffer, format="PNG")
    return base64.b64encode(buffer.getvalue()).decode("ascii")


def resize_for_model(
    image: Image.Image,
    x: int,
    y: int,
    max_side: int,
) -> Tuple[Image.Image, int, int, float]:
    width, height = image.size
    if max(width, height) <= max_side:
        return image, x, y, 1.0

    scale = max_side / float(max(width, height))
    resized = image.resize((round(width * scale), round(height * scale)), Image.LANCZOS)
    return resized, round(x * scale), round(y * scale), scale


def clamp_point(x: int, y: int, width: int, height: int) -> Tuple[int, int]:
    return max(0, min(width - 1, x)), max(0, min(height - 1, y))


def mask_to_png(
    mask: np.ndarray,
    original_size: Tuple[int, int],
    threshold: float,
    dilation_pixels: int,
) -> Image.Image:
    if mask.ndim == 3:
        mask = np.squeeze(mask)
    binary = (mask > threshold).astype(np.uint8) * 255
    mask_image = Image.fromarray(binary, mode="L")
    if mask_image.size != original_size:
        mask_image = mask_image.resize(original_size, Image.NEAREST)
    if dilation_pixels > 0:
        mask_image = mask_image.filter(ImageFilter.MaxFilter(dilation_pixels * 2 + 1))
    return mask_image


def mask_bbox(mask_image: Image.Image) -> list[int]:
    bbox = mask_image.getbbox()
    if bbox is None:
        return [0, 0, 0, 0]
    left, top, right, bottom = bbox
    return [left, top, right, bottom]


def overlay_mask(
    image: Image.Image,
    mask_image: Image.Image,
    color: Tuple[int, int, int],
    alpha: float,
) -> Image.Image:
    base = image.convert("RGBA")
    mask = mask_image.convert("L")
    color_layer = Image.new("RGBA", base.size, (*color, 0))
    alpha_mask = mask.point(lambda value: int(value * alpha))
    color_layer.putalpha(alpha_mask)
    return Image.alpha_composite(base, color_layer).convert("RGB")


def export_segmentation(
    outputs_root: Path,
    image_base64: str,
    mask_base64: str,
    overlay_base64: str | None,
    metadata: Dict[str, Any],
    job_id: str | None = None,
) -> Dict[str, str]:
    export_id = job_id or uuid.uuid4().hex
    target = outputs_root / export_id
    target.mkdir(parents=True, exist_ok=False)

    image = decode_image_base64(image_base64)
    mask = Image.open(io.BytesIO(base64.b64decode(strip_data_url(mask_base64)))).convert("L")
    image.save(target / "image.png")
    mask.save(target / "mask.png")

    if overlay_base64:
        overlay = Image.open(io.BytesIO(base64.b64decode(strip_data_url(overlay_base64)))).convert("RGB")
        overlay.save(target / "overlay.png")

    metadata_path = target / "metadata.json"
    metadata_path.write_text(json.dumps(metadata, indent=2), encoding="utf-8")

    return {
        "job_id": export_id,
        "folder": str(target),
        "image": str(target / "image.png"),
        "mask": str(target / "mask.png"),
        "overlay": str(target / "overlay.png") if overlay_base64 else "",
        "metadata": str(metadata_path),
    }

