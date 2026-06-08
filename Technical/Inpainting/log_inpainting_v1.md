# Log Inpainting v1

## Da lam

- Tao/cap nhat folder `Inpainting/` de quan ly tai lieu va tai nguyen cho tinh nang xoa vat the bang inpainting.
- Ghi lai kien truc tich hop LaMa with Refiner trong `integration_architecture.md`.
- Ghi lai phan tich model LaMa/refiner va chien luoc on-device vs cloud.
- Dua source `lama-with-refiner` va checkpoint/test assets vao folder Inpainting.
- Xac dinh contract dau vao cho pipeline inpainting:
  - anh goc `image.png`
  - mask PNG cung kich thuoc anh
  - vung trang tren mask la vung can xoa
- Lien ket luong Segmentation -> Inpainting: SAM2 tao mask, Inpainting dung mask de xoa object/furniture.

## Ket qua

- Folder `Inpainting/` da co tai lieu thiet ke, source LaMa/refiner, config va test input/output mau.
- Da co mau input/output trong `Inpainting/lama-with-refiner/test_input*` va `test_output_gpu_refine`.
- Kien truc MVP chon huong cloud/local service cho inpainting, khong chay truc tiep tren frontend.
- Segmentation v1 da export duoc `image.png + mask.png`, san sang lam input cho Inpainting.

## Ghi chu

- Chua tu dong goi Inpainting sau segmentation trong MVP hien tai.
- Buoc tiep theo la dong goi LaMa/refiner thanh API rieng, vi du `POST /api/v1/inpaint`, roi noi tu output segmentation sang endpoint nay.

