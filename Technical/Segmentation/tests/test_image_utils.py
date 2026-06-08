import base64
import io

import numpy as np
from PIL import Image

from app.image_utils import (
    decode_image_base64,
    encode_png_base64,
    mask_bbox,
    mask_to_png,
    resize_for_model,
)


def _sample_image_base64():
    image = Image.new("RGB", (20, 10), (12, 34, 56))
    buffer = io.BytesIO()
    image.save(buffer, format="PNG")
    return base64.b64encode(buffer.getvalue()).decode("ascii")


def test_decode_image_accepts_plain_base64():
    image = decode_image_base64(_sample_image_base64())
    assert image.size == (20, 10)
    assert image.mode == "RGB"


def test_resize_for_model_scales_point():
    image = Image.new("RGB", (2000, 1000))
    resized, x, y, scale = resize_for_model(image, 1000, 500, 1000)
    assert resized.size == (1000, 500)
    assert (x, y) == (500, 250)
    assert scale == 0.5


def test_mask_to_png_restores_original_size_and_bbox():
    mask = np.zeros((5, 5), dtype=np.float32)
    mask[2, 2] = 1.0
    mask_image = mask_to_png(mask, (10, 10), threshold=0.0, dilation_pixels=0)
    assert mask_image.size == (10, 10)
    assert mask_bbox(mask_image) != [0, 0, 0, 0]


def test_encode_png_base64_roundtrip():
    encoded = encode_png_base64(Image.new("L", (4, 4), 255))
    decoded = Image.open(io.BytesIO(base64.b64decode(encoded)))
    assert decoded.size == (4, 4)

