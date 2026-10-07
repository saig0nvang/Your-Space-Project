# calibrate — GeoCalib tự đoán tầm mắt

Service Python nhỏ cho `POST /api/ai/calibrate` của `apps/web`: từ 1 ảnh phòng, GeoCalib (ETH Zürich, [cvg/GeoCalib](https://github.com/cvg/GeoCalib) — code Apache-2.0, trọng số CC BY 4.0, cần ghi công) ước lượng góc nghiêng, góc chúc và FOV dọc. Web đổi ra đường chân trời để điền sẵn ở bước Thử phòng; người dùng vẫn kéo chỉnh được.

## Chạy

    ./setup.sh                 # lần đầu: tạo .venv, cài torch CPU + GeoCalib (~1 GB)
    ./run.sh                   # http://127.0.0.1:8001 — lần chạy đầu tải trọng số (~100 MB) vào ~/.cache/torch

`apps/web` gọi tới `CALIBRATE_URL` (mặc định `http://127.0.0.1:8001`). Service tắt thì bước Thử phòng quay về đường chân trời ở giữa ảnh như trước.

## Số đo (CPU 16 nhân, 4 luồng)

Ảnh 1024 px: ~4 giây/ảnh; nạp model ~3 giây sau lần tải đầu. Spike 2026-10-04: lệch trung vị 0,049 chiều cao ảnh so với người kéo cẩn thận; FOV kém tin hơn (độ bất định trung vị ~10°) nên web chỉ dùng FOV của GeoCalib khi độ bất định ≤ 10° và ảnh không có EXIF.

## Deploy

Không chạy được trên Vercel serverless (torch). Chạy như một service riêng (vd Railway) cạnh `apps/web`, đặt `CALIBRATE_URL` cho web.
