# YourSpace Segmentation MVP

> **[TRANG THAI 2026-07-23 — theo Decisions_Log]** Module segmentation (SAM2) phuc vu
> tinh nang **inpainting / erase** (tap chon do -> tao mask -> gui sang pipeline
> Inpainting de xoa do cu). Theo thang bac moc D5, tinh nang nay thuoc **M2 (MVP that)**,
> khong nam trong M1 validation. Ghi chu nay chi cap nhat trang thai — **khong doi code**.
> Nguon chot: `Product_research/Decisions_Log_2026-07-23.md`.

Module nay chua toan bo backend, config, tai lieu setup va output cho tinh nang
SAM2 interactive segmentation. App chinh chi goi API local de user tap object,
xem mask overlay va export `image.png + mask.png` cho pipeline Inpainting.

## Cau truc

```text
Segmentation/
├── app/
│   ├── main.py              # FastAPI endpoints
│   ├── sam2_service.py      # SAM2 model loader + predictor wrapper
│   ├── image_utils.py       # base64, mask, overlay, export helpers
│   └── config.py            # settings loader
├── config/
│   └── settings.json        # model/device/runtime defaults
├── checkpoints/
│   └── README.md            # noi dat checkpoint SAM2
├── outputs/                 # export image/mask/overlay/metadata
├── tests/
├── environment.yml
├── requirements.txt
└── run_server.ps1
```

## Setup nhanh bang Conda Windows

```powershell
cd "c:\Users\speed\OneDrive\Desktop\YourSpace Project"
conda env create -f Segmentation\environment.yml
conda activate yourspace-segmentation
```

Tiep theo cai SAM2 tu repo chinh thuc cua Meta. Tren Windows, Meta khuyen nghi
WSL Ubuntu; neu chay native Windows ma gap loi CUDA extension, van co the tiep
tuc neu package import duoc.

```powershell
git clone https://github.com/facebookresearch/sam2.git Segmentation\vendor\sam2
pip install -e Segmentation\vendor\sam2
```

Dat checkpoint mac dinh vao:

```text
Segmentation/checkpoints/sam2.1_hiera_small.pt
```

Checkpoint co the tai tu repo SAM2 chinh thuc:
https://github.com/facebookresearch/sam2

## Chay API

```powershell
cd "c:\Users\speed\OneDrive\Desktop\YourSpace Project"
conda activate yourspace-segmentation
.\Segmentation\run_server.ps1
```

API mac dinh chay tai `http://127.0.0.1:7861`.

## Test rieng Segmentation

Neu muon test rieng SAM2, khong dung app 3D chinh:

```powershell
cd "c:\Users\speed\OneDrive\Desktop\YourSpace Project"
python -m http.server 8000 --bind 127.0.0.1
```

Mo trang:

```text
http://127.0.0.1:8000/Segmentation/demo.html
```

Luon dam bao Segmentation API dang chay tai `http://127.0.0.1:7861`.

## Endpoints

### `GET /health`

Tra ve trang thai service, config, model da load hay chua va device dang dung.

### `POST /api/v1/segment`

Request:

```json
{
  "image": "<base64 image hoac data URL>",
  "x": 420,
  "y": 260,
  "label": 1
}
```

Response thanh cong:

```json
{
  "status": "success",
  "mask_png_base64": "<png base64>",
  "overlay_png_base64": "<png base64>",
  "bbox": [100, 80, 500, 400],
  "score": 0.93,
  "image_size": {"width": 1024, "height": 768},
  "model": {"checkpoint": "sam2.1_hiera_small.pt", "device": "cuda"}
}
```

Mask output cung kich thuoc voi anh goc: pixel trang la vung can xoa, pixel den
la vung giu lai.

### `POST /api/v1/export`

Luu `image.png`, `mask.png`, `overlay.png`, `metadata.json` vao
`Segmentation/outputs/<job_id>/`.

## Ghi chu GPU

May hien tai co GTX 1050 Ti 4GB. Config mac dinh dung `sam2.1_hiera_small.pt`
theo lua chon MVP, nhung neu gap out-of-memory, doi:

```json
{
  "model_name": "sam2.1_hiera_tiny",
  "checkpoint": "checkpoints/sam2.1_hiera_tiny.pt"
}
```

trong `Segmentation/config/settings.json`.
