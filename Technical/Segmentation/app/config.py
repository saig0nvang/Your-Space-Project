from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path
from typing import Tuple


SEGMENTATION_ROOT = Path(__file__).resolve().parents[1]


@dataclass(frozen=True)
class SegmentationSettings:
    api_host: str
    api_port: int
    model_name: str
    model_config: str
    checkpoint: str
    device_preference: str
    allow_cpu_fallback: bool
    max_image_side: int
    mask_threshold: float
    dilation_pixels: int
    overlay_color: Tuple[int, int, int]
    overlay_alpha: float

    @property
    def checkpoint_path(self) -> Path:
        path = Path(self.checkpoint)
        if path.is_absolute():
            return path
        return SEGMENTATION_ROOT / path


def load_settings(path: Path | None = None) -> SegmentationSettings:
    settings_path = path or SEGMENTATION_ROOT / "config" / "settings.json"
    data = json.loads(settings_path.read_text(encoding="utf-8"))
    return SegmentationSettings(
        api_host=data.get("api_host", "127.0.0.1"),
        api_port=int(data.get("api_port", 7861)),
        model_name=data.get("model_name", "sam2.1_hiera_small"),
        model_config=data.get("model_config", "configs/sam2.1/sam2.1_hiera_s.yaml"),
        checkpoint=data.get("checkpoint", "checkpoints/sam2.1_hiera_small.pt"),
        device_preference=data.get("device_preference", "cuda"),
        allow_cpu_fallback=bool(data.get("allow_cpu_fallback", True)),
        max_image_side=int(data.get("max_image_side", 1024)),
        mask_threshold=float(data.get("mask_threshold", 0.0)),
        dilation_pixels=int(data.get("dilation_pixels", 8)),
        overlay_color=tuple(data.get("overlay_color", [79, 70, 229])),
        overlay_alpha=float(data.get("overlay_alpha", 0.52)),
    )

