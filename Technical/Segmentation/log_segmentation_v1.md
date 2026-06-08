# Log Segmentation v1

## Da lam

- Tao module `Segmentation/` cho tinh nang interactive segmentation bang SAM2.
- Them FastAPI service voi cac endpoint:
  - `GET /health`
  - `POST /api/v1/segment`
  - `POST /api/v1/export`
- Them config mac dinh cho `sam2.1_hiera_small.pt`, device `cuda`, resize anh, threshold mask va dilation.
- Cai SAM2 tu repo chinh thuc cua Meta vao Python 3.10.
- Tai checkpoint `sam2.1_hiera_small.pt` vao `Segmentation/checkpoints/`.
- Tao trang test rieng `Segmentation/demo.html` de upload anh, tap object, xem overlay mask va export.
- Tich hop segmentation toi thieu vao app chinh de user upload anh, bat segmentation, tap object va export mask.
- Them unit/API tests cho image utils va API contract.

## Ket qua

- Service da chay bang Python 3.10 tai `http://127.0.0.1:7861`.
- `/health` tra ve `model_loaded=true`, device `cuda`.
- Da test inference that voi anh mau trong `sample/`, endpoint `/api/v1/segment` tra ve `200 success`.
- Trang test rieng mo duoc tai `http://127.0.0.1:8000/Segmentation/demo.html`.
- Export segmentation tao bo file tuong thich Inpainting:
  - `image.png`
  - `mask.png`
  - `overlay.png`
  - `metadata.json`

## Ghi chu

- May hien tai dung GTX 1050 Ti 4GB; neu gap thieu VRAM co the doi config sang checkpoint `sam2.1_hiera_tiny.pt`.
- Mask output dung quy uoc: vung trang la vung can xoa, vung den la vung giu lai.

