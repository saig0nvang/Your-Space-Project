from __future__ import annotations

from dataclasses import dataclass
from typing import Any

import numpy as np

from .config import SegmentationSettings
from .image_utils import clamp_point, mask_to_png, resize_for_model


@dataclass
class SegmentResult:
    mask_png_base64: str
    overlay_png_base64: str
    bbox: list[int]
    score: float
    image_width: int
    image_height: int
    model: dict[str, Any]


class Sam2UnavailableError(RuntimeError):
    pass


class Sam2Segmenter:
    def __init__(self, settings: SegmentationSettings):
        self.settings = settings
        self.predictor = None
        self.device = "unknown"
        self.load_error: str | None = None

    @property
    def is_loaded(self) -> bool:
        return self.predictor is not None

    def load(self, raise_on_error: bool = True) -> None:
        if self.predictor is not None:
            return

        try:
            import torch
            from sam2.build_sam import build_sam2
            from sam2.sam2_image_predictor import SAM2ImagePredictor

            if self.settings.device_preference == "cuda" and torch.cuda.is_available():
                self.device = "cuda"
            elif self.settings.allow_cpu_fallback:
                self.device = "cpu"
            else:
                raise Sam2UnavailableError("CUDA is not available and CPU fallback is disabled.")

            checkpoint = self.settings.checkpoint_path
            if not checkpoint.exists():
                raise Sam2UnavailableError(
                    f"Missing checkpoint: {checkpoint}. Put SAM2 checkpoint in Segmentation/checkpoints."
                )

            model = build_sam2(
                self.settings.model_config,
                str(checkpoint),
                device=self.device,
            )
            self.predictor = SAM2ImagePredictor(model)
            self.load_error = None
        except Exception as exc:
            self.predictor = None
            self.load_error = (
                f"{type(exc).__name__}: {exc}. "
                "Check Python 3.10 env, SAM2 install, checkpoint path, and GPU memory. "
                "If GTX 1050 Ti runs out of VRAM, switch settings.json to sam2.1_hiera_tiny."
            )
            if raise_on_error:
                raise Sam2UnavailableError(self.load_error) from exc

    def predict(self, image, x: int, y: int, label: int):
        self.load(raise_on_error=True)

        import torch

        original_size = image.size
        resized, model_x, model_y, _ = resize_for_model(
            image,
            x,
            y,
            self.settings.max_image_side,
        )
        model_x, model_y = clamp_point(model_x, model_y, resized.width, resized.height)

        image_np = np.array(resized)
        point_coords = np.array([[model_x, model_y]], dtype=np.float32)
        point_labels = np.array([label], dtype=np.int32)

        autocast_enabled = self.device == "cuda"
        autocast_dtype = torch.bfloat16 if torch.cuda.is_bf16_supported() else torch.float16
        with torch.inference_mode():
            if autocast_enabled:
                with torch.autocast("cuda", dtype=autocast_dtype):
                    return self._predict_mask(image_np, point_coords, point_labels, original_size)
            return self._predict_mask(image_np, point_coords, point_labels, original_size)

    def _predict_mask(self, image_np, point_coords, point_labels, original_size):
        self.predictor.set_image(image_np)
        masks, scores, _ = self.predictor.predict(
            point_coords=point_coords,
            point_labels=point_labels,
            multimask_output=True,
        )
        best_index = int(np.argmax(scores))
        mask_image = mask_to_png(
            masks[best_index],
            original_size,
            self.settings.mask_threshold,
            self.settings.dilation_pixels,
        )
        return mask_image, float(scores[best_index])

    def model_info(self) -> dict[str, Any]:
        return {
            "name": self.settings.model_name,
            "checkpoint": self.settings.checkpoint_path.name,
            "config": self.settings.model_config,
            "device": self.device,
            "loaded": self.is_loaded,
            "load_error": self.load_error,
        }
