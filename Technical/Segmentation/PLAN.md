# Kế hoạch MVP Segmentation SAM2 cho YourSpace

## Tóm tắt
- Xây dựng module `Segmentation/` chứa toàn bộ backend SAM2, cấu hình, tài liệu setup, checkpoint notes, output mẫu và test.
- Tích hợp tối thiểu vào app chính để user upload ảnh phòng, tap vào object/furniture, xem mask overlay, rồi export `image + mask` cho pipeline Inpainting.
- Runtime mặc định: Python 3.10 Conda env, FastAPI service local, checkpoint `SAM2.1 small` theo lựa chọn của bạn.

## Thay đổi chính
- Trong `Segmentation/`, tạo service FastAPI:
  - `POST /api/v1/segment`: nhận ảnh + tọa độ tap `{x, y}` theo pixel ảnh gốc, trả về mask PNG base64, overlay PNG base64, bbox, score, model metadata.
  - `GET /health`: báo service/model đã load.
  - `POST /api/v1/export`: lưu `image.png`, `mask.png`, `overlay.png`, `metadata.json` vào `Segmentation/outputs/<job_id>/`.
- Cấu hình để trong `Segmentation/config/`:
  - model mặc định `sam2.1_hiera_small.pt`.
  - đường dẫn checkpoint, device preference `cuda -> cpu fallback`, image max size, mask threshold, dilation pixels.
- App chính:
  - Thêm chế độ “Segmentation / Remove object”.
  - Khi user tap lên ảnh phòng, frontend gửi ảnh hiện tại + tọa độ tap sang SAM2 service.
  - Hiển thị mask overlay trên ảnh, có nút export để tạo mask dùng cho Inpainting.
  - Không gọi Inpainting tự động trong MVP này.

## Luồng kỹ thuật
- Frontend giữ ảnh upload gốc và tọa độ tap theo kích thước ảnh thật, không theo kích thước canvas đã scale.
- Backend load SAM2 một lần khi service start, dùng `SAM2ImagePredictor` cho image prompt bằng point.
- Backend chọn mask score cao nhất, chuyển thành binary PNG: trắng là vùng cần xóa, đen là vùng giữ lại.
- Nếu CUDA lỗi hoặc hết VRAM, service trả lỗi rõ ràng và hướng dẫn đổi sang CPU hoặc checkpoint nhẹ hơn; không làm app chính crash.
- Output export tương thích Inpainting: ảnh gốc + mask PNG cùng kích thước.

## Test plan
- Unit test xử lý tọa độ tap, resize ảnh, mask threshold, dilation và export folder.
- API test với ảnh mẫu trong `sample/`: gọi `/health`, `/segment`, kiểm tra mask cùng kích thước ảnh, có vùng trắng hợp lệ, metadata đầy đủ.
- Manual test trên app chính:
  - upload ảnh phòng.
  - tap vào object.
  - thấy overlay mask.
  - export được bộ `image.png + mask.png`.
  - service lỗi thì UI hiện trạng thái lỗi, không mất ảnh gốc.

## Giả định
- Bạn sẽ dùng interpreter Python 3.10 trong Conda env riêng cho `Segmentation`.
- Máy hiện có GTX 1050 Ti 4GB; checkpoint `SAM2.1 small` là mặc định theo lựa chọn của bạn, nhưng config sẽ cho đổi sang `tiny` nếu thiếu VRAM.
- Windows có thể chạy được, nhưng tài liệu chính thức SAM2 khuyến nghị WSL Ubuntu cho Windows; plan sẽ ghi cả đường chạy Conda Windows và WSL.
- Nguồn kỹ thuật chính: repo chính thức Meta SAM2: https://github.com/facebookresearch/sam2
