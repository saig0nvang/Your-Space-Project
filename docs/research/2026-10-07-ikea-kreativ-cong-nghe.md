---
derives_from: [D3@7fbc47fb, D4@bb7f1ffe, D5@15cdc73a]
---
# IKEA Kreativ: họ làm thế nào, và YourSpace làm theo ra sao

> Ngày: 2026-10-07 · Loại: research, không code · Nguồn: 153 liên kết (IKEA/Ingka newsroom, trang hỗ trợ IKEA, 2 bài báo + 1 workshop của Geomagical, 9 bằng sáng chế, tin tuyển dụng 2025–2026, repo GitHub/Hugging Face để kiểm giấy phép). Ghi chú gốc theo từng mảng nằm trong `docs/research/2026-10-07-ikea-kreativ-ghi-chu/`.
> Bổ sung cho `docs/research/2026-10-04-mock-thanh-chuc-nang-that.md` (nhánh `m1-build`). Hướng "Kreativ-lite" đã có trong D4; tài liệu này không đổi quyết định nào.

## 1. Tóm tắt

- **Kreativ không "đoán" căn phòng từ một tấm ảnh.** Họ bắt người dùng quét nhiều khung hình (xoay 5 điểm + vẫy máy hình số 8, hoặc LiDAR), kèm dữ liệu cảm biến (trọng lực, vị trí máy từ SLAM/ARKit), rồi xử lý trên cụm GPU Google Cloud trong vài phút. Tỷ lệ mét và mặt sàn/tường đến từ **hình học nhiều ảnh + cảm biến**, AI chỉ lấp chỗ trống.
- **Xóa đồ đẹp là nhờ "nắn phẳng rồi mới lấp"**: họ tách từng mặt tường/sàn, nắn nó về nhìn thẳng, rồi mới cho LaMa (đã huấn luyện lại trên ~1 triệu ảnh nội thất) lấp từng mặt. Riêng bước nắn phẳng đã giảm lỗi LPIPS từ 0,37 → 0,31 so với LaMa thường.
- **Che khuất dùng depth + phân vùng, làm sắc mép bằng guided filter**, giống hướng YourSpace đang đi (tách che khuất khỏi tỷ lệ).
- **2025–2026 họ đang tiến tới "bản sao số" (digital twin)**: dựng lại phòng thành mô hình 3D tham số có vật liệu PBR và đèn, đồ cũ thay bằng khối thay thế; đội nghiên cứu tuyển người làm Gaussian Splatting/NeRF/diffusion.
- **Với YourSpace**, ba việc đáng làm nhất, theo thứ tự: (1) tự đoán tầm mắt bằng **GeoCalib** — sửa đúng lỗi "đồ to bất thường" người dùng vừa gặp; (2) **nắn phẳng mặt sàn trước khi lấp** khi xóa đồ — học thẳng từ bài báo của họ, không tốn thêm tiền; (3) ở app M2, **lấy tỷ lệ mét từ phiên AR** (ARCore/ARKit) lúc chụp thay cho giả định chiều cao máy.

## 2. Sản phẩm IKEA Kreativ (2022 → 2026)

| Mốc | Nội dung | Nguồn |
|---|---|---|
| 02/04/2020 | Ingka (nhà bán lẻ IKEA lớn nhất) mua 100% Geomagical Labs (thành lập 2016, CEO Brian Totty — đồng sáng lập Inktomi); vẫn hoạt động như công ty con ở Mountain View | ingka.com/newsroom/ingka-group-acquires-geomagical-labs |
| 22/06/2022 | Ra mắt Kreativ ở Mỹ (app iOS + web, Android theo sau): quét phòng, xóa đồ, đặt đồ 3D, phòng mẫu | ikea.com/us/en/newsroom/…pub58c94890, TechCrunch 22/06/2022 |
| 2023–2024 | Mở UK/Ireland (02/2023), Canada (06/2023), Áo (04/2024), Ấn Độ (~09/2024) | IKEA newsroom các nước |
| 09/12/2024 | Cập nhật "sleep sanctuaries": **Smart Item Placement** — luật đặt đồ tự gợi ý vị trí hợp lý; "Dress the Bed" | IKEA newsroom |
| 2025 | Có mặt ở 29 thị trường (không có Trung Quốc, **không có Việt Nam**); Ingka báo "hơn 7 triệu người dùng thiết kế mỗi năm" (cuối 2024) | Ingka annual summary, IKEA newsroom 20/02/2025 |

**Luồng chụp:** app tự chọn 1 trong 3 chế độ theo máy — 5-Point Panoramic, Ultrawide, 1-Scan LiDAR. Người dùng xoay máy qua 5 điểm rồi vẫy hình số 8 (máy LiDAR bỏ bước này). Có đường tải ảnh lên trên web/app, xử lý xong **báo qua email**. Mẹo IKEA đưa ra: đứng tựa góc phòng, khung ngang, thấy sàn, đủ sáng.

**Chỉnh sửa:** đồ được tự nhận diện, có viền; chạm để xóa hoặc "Hide all"; đặt đồ 3D, xoay/lật; phòng mẫu; thêm vào giỏ.

**Giới hạn IKEA tự ghi nhận và người dùng phàn nàn:** Android không quét cả phòng (cần phần cứng/ARCore); web cần WebGL phần cứng; thiếu tường trống/sàn thì "bị rối"; không có công cụ đo, "Hide All" không hoàn tác được; thiếu ràng buộc vật lý khi đặt đồ (đánh giá UX của Pratt, 02/2024). Con số "~97% chính xác kích thước phòng" được nhắc nhiều nhưng **chỉ thấy ở nguồn thứ ba**, không xác minh được trên trang IKEA. Không tìm thấy số liệu chuyển đổi/giá trị đơn riêng cho Kreativ.

## 3. Công nghệ bên trong (Geomagical Labs)

Ghép từ 2 bài báo, 1 workshop ISMAR 2022 và 9 bằng sáng chế. Thứ tự các bước là suy luận khi các nguồn không nói thẳng.

| Bước | Họ làm gì | Nguồn chính |
|---|---|---|
| Chụp | Video quét + ảnh tĩnh nhiều vị trí, kèm IMU/trọng lực, điểm SLAM (ARKit/ARCore), LiDAR nếu có; app dẫn người dùng theo đường chụp | US11721067B2, US20260030885A1 |
| Máy ảnh & tỷ lệ mét | SLAM + Structure-from-Motion + Multi-View Stereo; tỷ lệ mét lấy từ SLAM hoặc **vật đã biết kích thước** (lon nước, tờ giấy) | US20200302686A1 (bước S570) |
| Ảnh nền | Ghép thành panorama góc rộng chịu được thị sai; mọi depth/mask căn theo panorama này | US11170569B2, US11367250B2 |
| Hiểu phòng | Cạnh kiến trúc, phân vùng ngữ nghĩa, pháp tuyến, depth đơn ảnh → **RANSAC tìm mặt sàn/tường, ép theo vector trọng lực** → depth "bias" theo mặt phẳng rồi ghép từng mảnh | US20200302686A1 (S410–S560) |
| Bố cục tường | Ban đầu PlaneRCNN; sau thay bằng bộ tối ưu riêng: điểm tụ + trọng lực + nối tường-tường + điểm quang trắc, xử lý được phòng không vuông | US20230419526A1, poster ISMAR 2022 |
| **Xóa đồ** | Gộp mask mọi món → **nắn từng mặt phẳng về nhìn thẳng** → LaMa huấn luyện lại ~1 triệu ảnh (600k vòng chung + 300k vòng riêng nội thất) → tinh chỉnh vân (histogram loss) → lượt cuối lấp phần không phẳng. LPIPS 0,2858 (của họ) vs 0,3715 (LaMa gốc) | arXiv 2210.15796 |
| Xóa ở độ phân giải cao | Tối ưu feature map của Big-LaMa theo nhiều tầng tỷ lệ lúc suy luận; tốt hơn ở vùng xóa lớn nhưng **4,56 giây/ảnh vs 0,26 giây** (RTX A5000). Mã nguồn mở: `geomagical/lama-with-refiner` (giấy phép chưa kiểm) | arXiv 2206.13644 |
| Bóng của đồ đã xóa | Trình bày riêng ở workshop (Salma Jiddi), không có bài báo/bằng sáng chế công khai; bài báo xóa đồ tự nhận **chưa đánh giá bóng thật** | geomagical.com/ismar2022-workshop |
| Che khuất | Depth dày + phân vùng → tách vùng liên thông → làm đều depth ở mép vật → shader riêng để vật thật che vật ảo | US12272085B2 |
| Ánh sáng & ghép | Ước lượng nguồn sáng (vị trí, cường độ, màu) từ độ sáng ảnh + vùng ngữ nghĩa; "harmonization" khớp ánh sáng, bóng, nhiễu của vật ảo với ảnh; gửi bản chất lượng thấp trước rồi nâng dần; luật đặt đồ + ràng buộc vật lý | US11367250B2, US11721067B2 |
| Thế hệ mới (nộp 07/2025, công bố 01/2026) | Dựng **mô hình 3D tham số**: mặt bằng nhìn từ trên, cửa/cửa sổ/chân tường thay bằng mô hình chi tiết qua so khớp CLIP, đồ cũ thành khối thay thế, phân loại vật liệu → PBR, dựng đèn kiểu studio + environment map | US20260030885A1 |
| Hạ tầng | Google Cloud, Kubernetes/Docker, Terraform/Pulumi, PostgreSQL, Python/PyTorch/C++; phục vụ "hàng chục triệu người dùng/năm"; đang tuyển NeRF/Gaussian Splatting/diffusion | Tin tuyển dụng Geomagical 2025–2026 |

**Điểm mấu chốt:** sức mạnh của Kreativ nằm ở **dữ liệu đầu vào giàu** (nhiều khung hình + cảm biến) và **xử lý hình học cổ điển kỹ** (RANSAC, trọng lực, nắn phẳng), không phải một model AI thần kỳ. Bài báo và bằng sáng chế đều giả định phân vùng và bố cục đúng; lỗi ở đầu vào lan hết ra sau.

## 4. YourSpace đang ở đâu so với Kreativ

| Mảng | Kreativ | YourSpace demo (`demo/web-pitch`, 2026-10-07) | Khoảng cách |
|---|---|---|---|
| Chụp | Nhiều khung hình + cảm biến + LiDAR | 1 ảnh (chụp hoặc tải lên) | Lớn — gốc của mọi sai tỷ lệ |
| Tỷ lệ mét | SLAM / vật đã biết kích thước | Người dùng kéo tầm mắt + chọn Đứng/Ngồi, chỉnh tay trong popover | Lớn — người dùng đặt sai tầm mắt là đồ to gấp 2–3 lần |
| Mặt sàn/tường | RANSAC + trọng lực + tối ưu bố cục | Mặt sàn suy từ chân trời; chưa có tường | Vừa |
| Chọn đồ để xóa | Tự nhận diện, viền sẵn | Chạm chọn (SlimSAM), lọc mask >35% ảnh, lấp lỗ khe nan | Vừa — thiếu tự nhận diện |
| Xóa đồ | Nắn phẳng từng mặt + LaMa huấn luyện lại + tinh chỉnh vân | LaMa gốc tự host, lấp một lượt từ ảnh gốc, nới mask kéo bóng | Vừa — thiếu nắn phẳng, bóng còn vệt |
| Che khuất | Depth + phân vùng + làm đều mép | Depth Anything V2 Small khớp theo mặt sàn, bỏ pixel sàn, dung sai 5% | Nhỏ — cùng hướng, mép còn thô |
| Ánh sáng | Ước lượng nguồn sáng, harmonization, PBR | Phơi sáng + màu trung bình ảnh, bóng tiếp xúc | Vừa |
| Xử lý | Cloud GPU, vài phút, báo email | Trình duyệt + CPU server, vài giây | YourSpace nhanh hơn, đổi lại kém chính xác hơn |

## 5. Làm theo thế nào — lộ trình đề xuất

Giữ nguyên tắc của repo: AI chỉ gợi ý, người dùng luôn chỉnh được; tách che khuất khỏi tỷ lệ.

### Giai đoạn 1 — web M1 (vài tuần, gần như không tốn tiền thêm)

1. **Tự đoán tầm mắt bằng GeoCalib** (code Apache-2.0, trọng số CC BY 4.0 — giấy phép sạch nhất trong cả nghiên cứu; ~100 ms/ảnh trên GPU, cần đo trên CPU). Điền sẵn đường chân trời ở bước Thử phòng; người dùng chỉ xác nhận hoặc kéo nhẹ; độ bất định cao thì cảnh báo. Spike 2026-10-04 đo GeoCalib lệch trung vị 0,049 chiều cao ảnh so với người kéo cẩn thận. Đây là cách trực tiếp nhất chặn lỗi "đồ to bất thường".
2. **Nắn phẳng mặt sàn trước khi lấp** (học từ arXiv 2210.15796): YourSpace đã có camera + mặt sàn, nên có thể warp vùng sàn chứa đồ về nhìn từ trên xuống, cho LaMa lấp, rồi warp ngược. Bài báo đo được LPIPS 0,37 → 0,31 chỉ nhờ bước này. Tường làm sau khi có bố cục tường.
3. **Vật đã biết kích thước** làm thước đo: cho người dùng chạm vào cửa đi (2,1 m) hoặc chọn "trần cao bao nhiêu" để suy chiều cao máy — đúng cách Kreativ dùng ở bằng sáng chế S570.
4. Giữ thanh "Cỡ" từng món như lối thoát cuối (người dùng quyết 2026-10-07).

### Giai đoạn 2 — app M2 (thay đổi lớn nhất về chất lượng)

5. **Chụp trong app có phiên AR** (ARCore Depth API: hơn 88% thiết bị Android đang hoạt động hỗ trợ, số toàn cầu 05/2026 — không có số riêng Việt Nam; ARKit trên iOS). Lấy chiều cao máy, mặt sàn theo mét, góc nghiêng, thông số ống kính **từ cảm biến**, không đoán. Từ Expo/React Native: ViroReact (MIT, ReactVision bảo trì) cho mặt phẳng/hit-test; cần thêm module native nhỏ để lấy thông số ống kính.
6. **Chụp 3–5 khung** thay vì 1 (gần với chế độ 5-Point của Kreativ) khi máy hỗ trợ; ảnh thư viện vẫn đi đường 1 ảnh + GeoCalib.
7. **Tự nhận diện đồ cũ** để hiện viền như Kreativ: Florence-2 (MIT) hoặc Grounding DINO 1.5 (Apache-2.0) cho khung + SAM nhẹ (MobileSAM/EfficientSAM, Apache-2.0) cho mask.
8. **Xóa đồ lớn có bóng**: giữ LaMa cho đồ nhỏ; đồ lớn sát tường gọi API có giấy phép thương mại rõ — Bria Eraser (~$0,04/ảnh, dữ liệu huấn luyện có bản quyền) hoặc FLUX Fill Pro (~$0,05/ảnh). Đổi nhà cung cấp so với D11 → cần bản ghi quyết định mới.

### Giai đoạn 3 — sau khi có lực kéo

9. Depth theo mét phía server: Depth Anything 3 Metric-Large (Apache-2.0); MoGe-2 tốt hơn trên benchmark nhưng Microsoft chưa xác nhận dùng thương mại cho trọng số (issue #98).
10. Ánh sáng: DiffusionLight-Turbo (MIT, ~30 giây/ảnh GPU) chạy 1 lần/ảnh phòng, cache light probe xuống client.
11. Bố cục tường + "bản sao số" kiểu US20260030885A1 — chỉ khi có đội và dữ liệu.
12. Mô hình 3D sản phẩm từ ảnh nhà cung cấp: Tripo/Meshy gói trả phí (có quyền thương mại) lúc đầu; Hunyuan3D 2.x hoặc SF3D/SPAR3D tự host khi lên quy mô (đọc kỹ điều kiện giấy phép từng model).

### Tránh (giấy phép không cho thương mại hoặc chưa rõ)

Depth Pro (Apple), UniDepth, DUSt3R/MASt3R, trọng số π3, SpatialLM, Perspective Fields, MAT, tự host FLUX.1-dev/Fill-dev, OmniEraser, ZeroComp, IntrinsicCompositing, IC-Light V2; YOLO-World (GPL-3.0); VGGT bản gốc (chỉ dùng bản `-Commercial` sau khi được duyệt). ObjectClear (CVPR 2026, xóa cả bóng — kết quả tốt nhất cho đúng bài toán) **chưa rõ giấy phép**, cần kiểm trước khi dùng.

## 6. Rủi ro và câu hỏi mở

- **Bằng sáng chế**: Geomagical có ít nhất 9 bằng sáng chế/đơn ở Mỹ cho cả chuỗi (chụp → hiểu phòng → xóa → che khuất → ghép); Roomvo (Leap Tools) có 5 bằng sáng chế Mỹ cho "đặt sản phẩm vào ảnh phòng đúng tỷ lệ". YourSpace dùng kỹ thuật công khai (RANSAC, LaMa, nắn phẳng là phương pháp hình học phổ biến), nhưng **cần luật sư rà trước khi công bố pipeline chi tiết hoặc ra thị trường Mỹ**. Ở Việt Nam các bằng này không có hiệu lực trừ khi được đăng ký tại Việt Nam — chưa kiểm.
- **Chụp nhiều khung trên Android tầm trung ở Việt Nam**: chưa có số đo tỷ lệ máy hỗ trợ ARCore Depth tại Việt Nam, chưa đo thời gian xử lý trên máy thật.
- **Quyền riêng tư**: Kreativ lưu mô hình phòng trên cloud; nếu YourSpace lưu ảnh/mô hình phòng (để "Phòng của tôi" đồng bộ) cần consent riêng và DPIA theo NĐ13 (đã nêu trong D10/spec M2).
- **Số liệu kinh doanh**: IKEA không công bố chuyển đổi/giá trị đơn của Kreativ — không dùng Kreativ làm bằng chứng PMF cho pitch, chỉ làm bằng chứng nhu cầu (7 triệu người dùng/năm).
- Đề xuất ở mục 5.8 (đổi nhà cung cấp xóa đồ lớn) và 5.5 (bỏ Expo Go để dùng module native) **cần founder quyết** và ghi bản ghi trong `decisions/` theo `CLAUDE.md`.

## Phụ lục — ghi chú gốc theo mảng

Ghi chú đầy đủ kèm từng URL nằm trong `docs/research/2026-10-07-ikea-kreativ-ghi-chu/`: `A-san-pham.md` (sản phẩm, 43 nguồn), `B-ky-thuat-geomagical.md` (kỹ thuật, 80 nguồn), `C-cong-nghe-thay-the.md` (công nghệ thay thế, 30 nguồn). Các nguồn chính đã dẫn trong bảng ở mục 2–3; danh sách bằng sáng chế: US11170569B2, US11721067B2, US12182938B2, US20200302686A1, US11367250B2, US12272085B2, US12271994, US20230419526A1, US20260030885A1 (patents.google.com).
