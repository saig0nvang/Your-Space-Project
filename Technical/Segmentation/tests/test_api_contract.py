from fastapi.testclient import TestClient
from PIL import Image

from app.image_utils import encode_png_base64
from app.main import app


def test_health_contract():
    client = TestClient(app)
    response = client.get("/health")
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    assert "model_loaded" in body
    assert "model" in body


def test_segment_rejects_out_of_bounds_point():
    client = TestClient(app)
    image = Image.new("RGB", (8, 8), (255, 255, 255))
    response = client.post(
        "/api/v1/segment",
        json={"image": encode_png_base64(image), "x": 20, "y": 1},
    )
    assert response.status_code == 422

