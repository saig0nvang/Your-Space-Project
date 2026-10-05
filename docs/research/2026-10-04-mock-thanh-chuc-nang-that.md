---
derives_from: [D3@7fbc47fb, D3b@4248a41d, D4@bb7f1ffe, D5@15cdc73a]
---
# Research: biến mock nhận diện đồ, xóa đồ, khớp đồ vào không gian thành chức năng thật trên điện thoại

> Ngày: 2026-10-04 · Người làm: Claude (session thiết kế `apps/mobile`) · Loại: **research, không code**
> Nguồn tra ngày 2026-10-04 (GitHub, Hugging Face, Replicate, fal, arXiv, bằng sáng chế, tài liệu Apple/Google/Expo, trang hỗ trợ IKEA). Mục ghi **(chưa kiểm chứng)** là chưa có nguồn xác nhận. Trong phần IKEA, **[C]** = IKEA / Geomagical / bài báo / bằng sáng chế nói rõ; **[S]** = suy luận.
> Phạm vi: các chức năng mock hiện có trong `apps/mobile` — nhận diện đồ cũ, chạm chọn món, xóa đồ (inpainting), hiểu phòng (máy ảnh, mặt sàn, chân tường, tỷ lệ mét), đặt đồ 3D (che khuất, bóng, ánh sáng) — và cách làm chúng chạy thật trên điện thoại.

## Tóm tắt

Làm thành chức năng thật được, nhưng **IKEA không làm bằng một ảnh và không xử lý trên máy**. Họ chụp nhiều ảnh kèm dữ liệu cảm biến (AR, LiDAR nếu có), gửi lên cụm GPU trên cloud xử lý vài phút; điện thoại chỉ dựng món 3D lên kết quả trả về. Muốn "đúng kích thước" như IKEA, mình cũng phải lấy dữ liệu cảm biến lúc chụp. Một ảnh từ thư viện thì sai số tỷ lệ khoảng 10–20%.

---

## 1. IKEA Kreativ / Geomagical làm thế nào

### 1.1. Chụp
- App chọn một trong ba cách theo máy: "5 Point Panoramic, Ultrawide, or 1-Scan LiDAR" [C]. Cách 5 điểm: xoay máy tới 5 điểm trên màn (xoay ở cổ tay), rồi vẫy máy hình số 8 chậm; máy có LiDAR bỏ bước số 8 [C]. Bước số 8 nhiều khả năng để lấy thị sai và theo dõi AR cho độ sâu và tỷ lệ [S]. — [Các cách quét](https://www.ikea.com/pt/en/customer-service/knowledge/articles/c8e14307-3c9b-4c42-a2cd-bcd0d197cee0.html)
- Mẹo chụp IKEA đưa ra: đứng tựa lưng vào góc phòng, khung ngang, thấy sàn, đủ sáng [C]. — [Mẹo chụp](https://www.ikea.com/us/en/customer-service/knowledge/articles/fgcb98bc-357d-4676-b9b1-d2g8cg90736b.html)
- Có đường **"tải ảnh lên"** trên app và web (JPEG/PNG/WebP/HEIC, tối đa 30 MB); người dùng **chờ email** báo xử lý xong [C]. — [Tải ảnh lên](https://www.ikea.com/gb/en/customer-service/knowledge/articles/8780f1d4-ce57-4ada-aa7f-79a5a4d1be4b.html)
- "Full Room Scan" chỉ có trên máy LiDAR, dựng bản sao 3D trống của phòng [C]; có dùng Apple RoomPlan hay không thì không nêu. — [IKEA: LiDAR](https://www.ikea.com/gb/en/customer-service/knowledge/articles/250fg37g-2498-40gg-916c-f27d354683f0.html)
- Bản ra mắt 2022 dùng một loạt ảnh, không cần LiDAR [C]. — [Thông cáo IKEA](https://www.ikea.com/us/en/newsroom/corporate-news/ikea-launches-new-ai-powered-digital-experience-empowering-customers-to-create-lifelike-room-designs-pub58c94890/)
- Bằng sáng chế US11170569: chụp video hoặc ảnh tĩnh, kèm dữ liệu con quay, hướng trọng lực, vị trí máy và điểm 3D "từ SLAM/ARKit/ARCore" [C]. — [US20200302686A1](https://patents.google.com/patent/US20200302686A1/en)

### 1.2. Hiểu phòng (bằng sáng chế US11170569 / US11721067 / US12182938)
- **Máy ảnh:** thông số trong (tiêu cự…) lấy từ nhà sản xuất + thiết lập ảnh đang dùng; vị trí máy lấy từ SLAM của thiết bị; kèm vector trọng lực [C].
- **Mặt sàn:** tìm mặt phẳng (RANSAC) trên các điểm 3D được nhận là "sàn", ép vuông góc với trọng lực [C].
- **Tường:** dựng từ đường thẳng trong ảnh, trọng lực và kết quả phân vùng; gần vuông góc thì nắn cho vuông hẳn; khoảng cách tường lấy từ chỗ sàn gặp tường [C].
- **Độ sâu:** ghép nhiều bản đồ độ sâu: mạng ước độ sâu một ảnh ("MonodepthBTS"), nhiều góc chụp, điểm SLAM hoặc LiDAR, và mạng được "nhắc" bằng mặt phẳng / mask / pháp tuyến lúc chạy; mép độ sâu làm sắc bằng guided filter [C].
- **Phân vùng:** mạng nhiều tầng giữ mép, chạy tới 2560×2560 [C].
- **Tỷ lệ mét:** căn theo vị trí máy SLAM (đã là mét), điểm LiDAR, hoặc một vật biết kích thước (lon Coca, tờ giấy letter); người dùng cũng chỉnh được tỷ lệ chung hoặc nhập một kích thước biết trước (US11367250) [C].
- **Tường bị đồ che:** tách đồ ra rồi kéo dài mặt phẳng tường/sàn vào chỗ khuất (US11367250) [C].
- **Độ chính xác:** IKEA nói kích thước phòng chính xác "approximately 97%" khi làm theo mẹo chụp; **người dùng không đổi cỡ được món** [C]. — [97%](https://www.ikea.com/us/en/customer-service/knowledge/articles/9141b674-4cg8-494g-8c12-1cf3e9c5b41f.html)
- **Khi hỏng:** app "can get confused… if it does not see much floor, or if the walls are completely blank" (Phil Guindi, Geomagical) [C]. — [VentureBeat](https://venturebeat.com/ai/ikea-launches-first-ai-powered-design-experience-no-swedish-meatballs-included)
- Bằng sáng chế: [US11721067B2](https://patents.google.com/patent/US11721067B2/en) · [US11367250](https://patents.google.com/patent/US11367250)

### 1.3. Xóa đồ
- **Trải nghiệm** [C]: đồ được nhận diện tự động có viền vàng; chạm một món để xóa, hoặc Hide All / Show All, xác nhận bằng dấu tick. — [Hướng dẫn Erase](https://www.ikea.com/us/en/customer-service/knowledge/articles/g5dc7429-6f50-4e9c-9fd6-g0343d0c5gcc.html). Bật/tắt thấy tức thì nên nhiều khả năng **xóa sẵn trên cloud** trong lúc xử lý [S].
- **Cách làm** (bài báo Geomagical, [arXiv 2210.15796](https://arxiv.org/abs/2210.15796)) [C]: gộp mask phân vùng các món thành một mask xóa; bố cục phòng lấy từ PlaneRCNN; nắn từng mặt tường/sàn cho nhìn thẳng rồi lấp bằng **LaMa huấn luyện lại trên khoảng 1 triệu ảnh**; một lượt cuối lấp các điểm không thuộc mặt phẳng nào. **Bóng đổ và thay đổi ánh sáng** do món bị xóa để lại thì **không xử lý**.
- **Tốc độ:** bước làm nét ([arXiv 2206.13644](https://arxiv.org/abs/2206.13644), code [geomagical/lama-with-refiner](https://github.com/geomagical/lama-with-refiner)) tốn **4,56 giây cho ảnh 1024²** trên RTX A5000 [C] — mức GPU cloud.
- Geomagical có tổ chức workshop ISMAR 2022, trong đó có một bài riêng về xóa bóng [C]. — [ISMAR 2022](https://www.geomagical.com/ismar2022-workshop.html)
- Lỗi người dùng báo: mép thảm dưới đồ, lấp chưa trọn, lỗi khi chèn sản phẩm [C]. — [Mixed News](https://mixed-news.com/en/ikea-app-now-deletes-your-furniture-and-replaces-it-with-your-own/)

### 1.4. Đặt món và ghép ảnh
- **Che khuất:** so độ sâu từng điểm ảnh giữa món 3D và bản đồ độ sâu + mask của phòng (US11367250) [C].
- **Ánh sáng:** AI ước lượng "light sources in the scene to cast shadows and reflections" (VentureBeat) [C]; bằng sáng chế thêm mask đèn, mask bóng và làm nét dần (mỗi lần dựng bóng chính xác hơn) [C].
- **Luật đặt:** món chỉ đặt trên mặt nằm ngang hoặc mặt tường, căn theo pháp tuyến mặt hoặc trọng lực; có nhắc "settling" vật lý [C].
- **Xoay:** thanh trượt hoặc Shift + kéo; đồ treo tường có "Flip sideways" thay cho xoay [C].
- **Không tìm thấy:** engine dựng hình, cách hít tường, thước xoay. Bằng sáng chế nhắc WebGL; tin tuyển dụng của Geomagical ghi Webpack, Redux; họ giữ bản công khai của tinygltf và screenshot-glb — gợi ý client web/glTF [S].

### 1.5. Cloud hay trên máy, và thời gian
- Ảnh và dữ liệu cảm biến gửi lên "a heavily parallelized GPU compute cluster… containerized… microservices… hosted by Google Cloud Platform" [C, VentureBeat]. Bằng sáng chế: máy chủ làm mọi thứ trừ hiển thị và tương tác; món được dựng trên máy gần thời gian thực [C].
- **Stack** [C, tin tuyển dụng 09/2026]: Python, PyTorch, Kubernetes, Docker, Django, C. Geomagical vẫn hoạt động như "3D R&D lab in partnership with IKEA". — [Tin tuyển dụng](https://himalayas.app/companies/geomagical-labs/jobs/senior-applied-researcher-lead-3d-reconstruction-deep-learning)
- **Thời gian:** bản thử TechCrunch 2022: quét khoảng 2 phút, "preparing/uploading" khoảng 5 phút [C]; xử lý chạy nền, báo bằng email. — [TechCrunch](https://techcrunch.com/?p=2340297)
- **Hướng đi:** đơn sáng chế 2025 [US20260030885A1](https://patents.google.com/patent/US20260030885A1/en) về nhiều góc chụp → bố cục → cửa/cửa sổ tham số → vật liệu PBR → ước lượng ánh sáng → dựng từ góc nhìn tự do [C]; bản công khai VGGT, nerfstudio, Wan2.1 gợi ý đang làm dựng 3D và video diffusion [S].

### 1.6. Sản phẩm tương tự
- **Wayfair Decorify (2023):** tải một ảnh, AI tạo sinh phối lại cả phòng rồi gợi ý món tương tự của Wayfair; không đặt món đúng kích thước. Thay bằng **Muse** (02/2025): cảm hứng tạo sinh áp lên ảnh phòng [C].
- **Houzz View in My Room 3D:** đặt trực tiếp bằng ARKit, đúng tỷ lệ, chiếu sáng theo ánh sáng môi trường; không có xóa đồ [C].
- **Amazon Room Decorator:** AR trực tiếp (ARKit), nhiều món cùng lúc, lưu ảnh chụp AR để xem lại; không có xóa đồ [C].
- **Apple RoomPlan:** chỉ máy LiDAR; ra phòng tham số (tường, cửa, cửa sổ, hộp đồ đạc) theo mét, xuất USD; "Scan Room" của Planner 5D dùng nó [C].
- **Hover:** 8 ảnh ngoại thất theo hướng dẫn, dựng ảnh trên cloud, ra mô hình 3D có số đo sau vài giờ tới 24 giờ [C].
- **Matterport:** xóa đồ trên ảnh 360° bằng Stable Diffusion, không ước lượng bố cục (CVPR Workshops 2024) [C]. — [arXiv 2405.03682](https://arxiv.org/abs/2405.03682)
- **Mã nguồn mở:** không có bản sao Kreativ đầy đủ; `lama-with-refiner` là bản duy nhất Geomagical công khai.

---

## 2. Đề xuất cho YourSpace theo từng chức năng

### 2.1. Bảng tổng hợp

| Chức năng | Nên dùng | Giấy phép | Tốc độ / chi phí |
|---|---|---|---|
| **Máy ảnh: tiêu cự, độ nghiêng** | Chụp trong app: tiêu cự từ EXIF, độ nghiêng từ cảm biến trọng lực lúc bấm chụp. Ảnh thư viện: GeoCalib hoặc MoGe-2 | Dùng thương mại được | Gần như tức thì |
| **Độ sâu, tỷ lệ mét** | **MoGe-2** (Microsoft: điểm 3D, thông số máy, pháp tuyến). Dự phòng: Depth Pro (Apple), Depth Anything 3 bản metric-large | MIT / dùng thương mại được / Apache | ~30 ms trên A100; Depth Pro ~7 giây trên Replicate |
| **Sàn, tường, chân tường** | Phân vùng sàn/tường (SAM 3 với từ khóa "floor", "wall"), dựng mặt sàn từ điểm 3D, dựng các mặt tường đứng theo trọng lực; chân tường = giao tường với sàn, tự kéo dài qua chỗ đồ che | Dùng thương mại được | Theo một lượt MoGe |
| **Nhận diện mọi món** | **SAM 3 / 3.1** với danh sách từ khóa cố định (sofa, bàn trà, tivi, kệ, đèn, ổ điện, điều hòa, rèm, thảm…) → mask kèm nhãn | Giấy phép SAM: thương mại được, kèm vài điều cấm | ~1–3 giây (chưa kiểm chứng); fal $0.005, Replicate cộng đồng ~$0.002 |
| **Chạm chọn món (dự phòng)** | Cloud: SAM theo điểm chạm. Trên máy: **EdgeTAM** (Core ML, 16 khung hình/giây trên iPhone 15 Pro Max) hoặc MobileSAM | Apache | Trên máy gần như tức thì sau lần mã hóa ảnh đầu |
| **Xóa đồ** | Chất lượng cao: **FLUX Erase** (tuyên bố xóa cả bóng) hoặc Bria Eraser. Rẻ, cho món nhỏ: LaMa + bước làm nét của Geomagical. Cắt vùng quanh món ~1–2k px, lấp xong dán lại ảnh 12 MP gốc | Dịch vụ thương mại / Apache | FLUX ~$0.05–0.12/lần, ~10 giây; Bria $0.04; LaMa ~$0.0005, 2–3 giây |
| **Hướng sáng** | Đơn giản: tìm vùng cửa sổ/đèn sáng trong ảnh. ARCore có ước lượng ánh sáng HDR; ARKit chỉ cho độ sáng môi trường | — | — |
| **Dựng 3D trên điện thoại** | Giữ **three.js trong WebView** như bản thử hiện tại (đúng engine bản web); cử chỉ kéo/xoay xử lý ngay trong WebView; vẽ ảnh phòng trong cảnh 3D; che khuất bằng lớp ghi độ sâu từ depth map | — | Chưa đo tốc độ kéo trên máy tầm trung |

### 2.2. Máy ảnh: tiêu cự, độ nghiêng
- **GeoCalib**: ước tiêu cự, trọng lực (độ chúc, độ nghiêng) và méo ống kính; nhận tiêu cự hoặc trọng lực đã biết làm đầu vào. Code Apache-2.0, trọng số CC-BY-4.0 → thương mại được. Trên LaMAR: ~92% ảnh có độ nghiêng sai trong 5°, nhưng chỉ ~55% độ chúc sai trong 1°; góc nhìn (FoV) yếu hơn: ~42% trong 5°. Có bản cộng đồng trên Replicate. — [GitHub](https://github.com/cvg/geocalib) · [Replicate](https://replicate.com/visionaix/geocalib)
- **Depth Pro** ước tiêu cự: 85–96% ảnh sai tiêu cự dưới 50%, ~65% dưới 25% — tốt nhất hiện có nhưng quá thô để dùng một mình. — [arXiv 2410.02073](https://arxiv.org/html/2410.02073)
- **Perspective Fields**: giấy phép Adobe Research, cấm thương mại — loại. — [GitHub](https://github.com/jinlinyi/PerspectiveFields)
- **DeepCalib**: cũ, đã bị thay thế; không đánh giá thêm.
- **EXIF**: tiêu cự đúng ở độ phân giải gốc; `FocalLengthIn35mmFilm` của iPhone tính sai khi ảnh nhỏ hơn và gộp cả zoom số. — [Apple forum 745938](https://developer.apple.com/forums/thread/745938). Ngay tiêu cự `fx` của ARKit cũng trôi ~36 px giữa các khung (~2–3%) do lấy nét. — [Apple forum 827789](https://developer.apple.com/forums/thread/827789). `expo-image-picker` với `exif: true` trả EXIF nhưng trường có thể null. — [Expo docs](https://docs.expo.dev/versions/latest/sdk/imagepicker/). Ảnh gửi lại qua chat / mạng xã hội mất EXIF (chưa kiểm chứng).
- **Cảm biến trọng lực (DeviceMotion)** lúc bấm chụp: độ chúc/nghiêng sai dưới 1° (chưa kiểm chứng). Quan trọng: điểm sàn ở 20° dưới đường chân trời, sai 1° độ chúc ≈ sai ~5% khoảng cách (tự tính).

### 2.3. Độ sâu mét và hình học từ một ảnh

| Model | Giấy phép | Độ chính xác trong nhà | Ghi chú |
|---|---|---|---|
| **MoGe-2** (Microsoft) | Code + trọng số MIT | NYUv2 sai số tương đối 4,4%; HAMMER 13,4% | 29 ms trên A100; ra điểm 3D, thông số máy, pháp tuyến, mask. [GitHub](https://github.com/microsoft/moge) · [arXiv 2507.02546](https://arxiv.org/html/2507.02546v1) · [HF](https://huggingface.co/Ruicheng/moge-2-vitl-normal) |
| MoGe-3 (08/2026) | Giấy phép trọng số chưa nêu | — | [GitHub](https://github.com/microsoft/moge) |
| **Depth Pro** (Apple) | Giấy phép Apple, thương mại được | NYUv2 6,1% | ~7 giây trên Replicate. [LICENSE](https://raw.githubusercontent.com/apple/ml-depth-pro/main/LICENSE) · [Replicate](https://replicate.com/garg-aayush/ml-depth-pro) |
| **DA3METRIC-LARGE** | Apache-2.0 | NYUv2 7,8% | Cần tiêu cự: mét = tiêu cự × đầu ra / 300. Các bản DA3 Giant/Large khác là CC-BY-NC. [GitHub](https://github.com/ByteDance-Seed/Depth-Anything-3) · [arXiv 2511.10647](https://arxiv.org/pdf/2511.10647) · [Replicate](https://replicate.com/david20321/depth-anything-v3-metric-large) |
| Metric3D v2 | BSD-2 | — | Cần thông số máy. [GitHub](https://github.com/YvanYin/Metric3D) |

### 2.4. Sàn, tường, bố cục phòng
- **Phân vùng sàn/tường/trần:** SAM 3 hiểu từ khóa "floor", "wall"; giấy phép cho thương mại kèm hạn chế. — [README SAM 3](https://huggingface.co/AEmotionStudio/sam3/blob/main/README.md). OneFormer (ADE20K) là MIT nhưng điều khoản bộ ADE20K cần kiểm; SegFormer cấm thương mại. — [So sánh OneFormer / SegFormer](https://roboflow.com/compare/oneformer-vs-segformer)
- **Model bố cục học sẵn:** NonCuboidRoom (được nói là MIT nhưng GitHub không nhận ra giấy phép — chưa kiểm chứng) [GitHub](https://github.com/CYang0515/NonCuboidRoom); nó và Plane-DUSt3R [arXiv 2502.16779](https://arxiv.org/abs/2502.16779v2) học trên Structured3D (cấm thương mại) [GitHub](https://github.com/Xia0ben/Structured3D) → trọng số rủi ro giấy phép. PlaneRecTR++: giấy phép chưa rõ. — [arXiv 2307.13756](https://arxiv.org/html/2307.13756v4)
- **Cách dựng hình học đề xuất:** (1) nhãn sàn/tường từ phân vùng + điểm 3D của MoGe-2; (2) tìm mặt sàn (RANSAC); (3) tìm các mặt tường đứng, ép theo trọng lực; (4) chân tường = giao mặt tường với mặt sàn, tự kéo dài qua chỗ đồ che; (5) góc phòng = giao tường với tường; (6) tường bị che gần hết thì quay về thao tác kéo tay đang có.
- **SpatialLM** (đám điểm → tường, cửa, cửa sổ) chỉ có ích khi chụp nhiều góc. — [GitHub](https://github.com/manycore-research/SpatialLM)

### 2.5. Nhận diện mọi món (viền tự động khi vào Xóa)

| Lựa chọn | Giấy phép | Cỡ / tốc độ | Nhận xét |
|---|---|---|---|
| **SAM 3 / 3.1** — [repo](https://github.com/facebookresearch/sam3) · [HF (cần xin quyền)](https://huggingface.co/facebook/sam3) | Giấy phép SAM: thương mại được; phải kèm bản giấy phép; cấm quân sự và hàng kiểm soát xuất khẩu — [LICENSE](https://huggingface.co/facebook/sam3/blob/main/LICENSE) | 848M tham số. Meta nói 30 ms cho ảnh 100+ vật trên H200; Ultralytics đo 2,9 s FP32 trên RTX PRO 6000 — hai số trái nhau ([Roboflow](https://blog.roboflow.com/what-is-sam3/), [Ultralytics](https://docs.ultralytics.com/models/sam-3)) | **Tốt nhất.** Một cụm từ trả về mọi vật khớp dưới dạng mask; nhiều cụm từ trong một lần gọi. LVIS zero-shot 47,0 AP so với 38,5 của bản tốt nhất trước. 3.1 ra 2026-03-27 |
| Grounded-SAM-2 — [repo](https://github.com/IDEA-Research/Grounded-SAM-2) | Apache-2.0 | — | Dùng được nhưng tìm ít vật hơn SAM 3; cập nhật cuối 11/2025 |
| Florence-2 ([HF](https://huggingface.co/microsoft/Florence-2-large)) / OWLv2 ([HF](https://huggingface.co/google/owlv2-base-patch16-ensemble)) + SAM | MIT / Apache | [owl-sam trên Replicate](https://replicate.com/c-barron/owl-sam): ~53 s, $0.051 | Quá chậm |
| SAM "segment everything" — [meta/sam-2](https://replicate.com/meta/sam-2) | Apache | ~14 s, ~$0.013 | Không có nhãn; cắt cả tường thành mảnh |

Cách làm: gửi SAM 3 một danh sách cụm từ cố định cho phòng khách Việt Nam (sofa, coffee table, TV, TV cabinet, shelf, lamp, ceiling light, power outlet, air conditioner, curtain, rug, plant…). Tìm được đồ nhỏ như ổ điện hay không: **chưa kiểm chứng**.

### 2.6. Chạm chọn món
- **EdgeTAM** ([repo](https://github.com/facebookresearch/EdgeTAM)): Apache; bộ dự đoán ảnh của SAM 2, xuất Core ML (encoder ~9,6 MB), 16 khung hình/giây trên iPhone 15 Pro Max. Lựa chọn an toàn giấy phép tốt nhất.
- **MobileSAM** ([repo](https://github.com/ChaoningZhang/MobileSAM)): Apache, 9,66M tham số, 12 ms trên GPU, xuất ONNX.
- **EfficientSAM**: Apache, ONNX, ngừng cập nhật từ 12/2024.
- **SAM 2.1 tiny**: 38,9M tham số, 91 khung hình/giây trên A100.
- **EfficientViT-SAM** ([repo](https://github.com/mit-han-lab/efficientvit)): làm cho GPU máy chủ.
- **EfficientSAM3** ([repo](https://github.com/SimonZeng7108/efficientsam3)): 89–95M tham số, bản ONNX cộng đồng, chưa có Core ML; nhận diện theo chữ trên máy về lý thuyết được nhưng chưa ai chứng minh.
- **Apple `VNGenerateForegroundInstanceMaskRequest`** ([docs](https://developer.apple.com/documentation/vision/vngenerateforegroundinstancemaskrequest)): iOS 17+, tìm vật tiền cảnh không kèm nhãn; chưa có số tốc độ; dùng được trong ảnh phòng hay không: **chưa kiểm chứng**.
- **ML Kit Subject Segmentation** ([docs](https://developers.google.com/ml-kit/vision/subject-segmentation)): chỉ Android, beta, ~200 ms trên Pixel 7 Pro; vật chạm nhau bị gộp làm một — bất lợi với đồ sát tường.
- **MediaPipe Interactive Segmenter** ([docs](https://developers.google.com/edge/mediapipe/solutions/vision/interactive_segmenter)): Android, iOS, web; 208 ms trên CPU Pixel 10; cầu nối React Native cần module riêng (chưa kiểm chứng).

### 2.7. Xóa đồ (inpainting)
- **LaMa / big-lama** ([repo](https://github.com/advimman/lama)): Apache. Sạch trên tường, sàn trơn và hoa văn lặp; mềm ở lỗ lớn; dùng tốt tới ~2k px. Trên [Replicate](https://replicate.com/allenhooo/lama): ~$0.0005, 2–3 s trên T4.
  - [Qualcomm LaMa-Dilated](https://huggingface.co/qualcomm/LaMa-Dilated) chạy 34–54 ms ở 512 px trên chip Snapdragon cao cấp, nhưng bản này học trên ảnh khuôn mặt (CelebA-HQ).
  - **LaMa + bước làm nét** ([bài báo](https://arxiv.org/abs/2206.13644), [code](https://github.com/geomagical/lama-with-refiner)) của **Geomagical Labs**: làm nét kết quả độ phân giải cao; tốc độ chưa kiểm chứng ngoài số 4,56 s/1024² trên RTX A5000 ở mục 1.3.
- **MI-GAN** ([repo](https://github.com/Picsart-AI-Research/MI-GAN)): MIT, 5,9M tham số, chỉ 512 px; 539 ms trên iPhone 14 Pro Max; ~6 ms trên GPU Pixel 8a ([bản LiteRT](https://huggingface.co/litert-community/MI-GAN-512-Places2-LiteRT)). Chỉ đủ cho đồ nhỏ.
- **Model diffusion mở tự triển khai:** RORem ([repo](https://github.com/leeruibin/RORem); Apache, SDXL inpainting, 4 bước, 512/1024), PowerPaint (MIT, SD1.5).
- **[IOPaint](https://github.com/Sanster/IOPaint)**: lưu trữ từ 2025-08-13; vẫn đáng tham khảo cách cắt vùng cho ảnh lớn.
- **Dịch vụ:**
  - **FLUX Erase** ([BFL, 2026-05-21](https://bfl.ai/blog/flux-erase-remove-anything-leave-no-trace)): chỉ cần ảnh + mask; tuyên bố xóa cả bóng và phần mask sót. ~$0.03 cho MP đầu + $0.004 mỗi MP thêm ([fal](https://fal.ai/models/fal-ai/flux-pro/v1/erase/llms.txt)), ~10 s ([Runware](https://runware.ai/docs/models/bfl-flux-erase.md)). **Không có trên Replicate** (404).
  - **Bria Eraser**: học trên dữ liệu có bản quyền, $0.04, có trên Replicate và fal.
  - **FLUX Fill pro**: ~$0.05/ảnh.
  - **Qwen-Image-Edit-2511**: Apache; sửa theo câu lệnh ("remove the sofa"), vẽ lại cả ảnh ở ~1 MP nên chỉ dán lại phần mask.
- **Ra ảnh 12 MP:** cắt khung bao mask + lề, lấp ở ~1–2k px, phóng ngược và chỉ trộn các điểm trong mask vào ảnh gốc với mép mềm — chế độ CROP của IOPaint (lề mặc định 128 px theo mã nguồn).
- **Bóng đổ:** nới mask, nhất là xuống phía sàn. LaMa không bao giờ xóa bóng nằm ngoài mask; FLUX Erase chỉ *tuyên bố* làm được.
- **Nhiều món và hoàn tác:** gộp mask vào một lần gọi; điện thoại giữ ảnh gốc + chồng các mảng đã xóa, hoàn tác là bỏ một mảng → máy chủ vẫn không lưu trạng thái.
- **Riêng tư:** ảnh vẫn được gửi lên cloud để xử lý; điểm cộng là có thể chỉ gửi bản thu nhỏ cho bước nhận diện và vùng cắt quanh món + mask cho bước xóa, không cần gửi ảnh gốc 12 MP.

### 2.8. Chạy model trên máy từ Expo SDK 57
Không runtime nào dưới đây chạy trong Expo Go; tất cả cần bản dev build.
- **[onnxruntime-react-native](https://github.com/microsoft/onnxruntime/tree/main/js/react_native)** 1.24.3: có config plugin cho Expo (chạy prebuild); Core ML trên iOS, NNAPI trên Android.
- **react-native-executorch** 0.10.4 (2026-09-28; v0.10.0 thêm Core ML, MLX, Vulkan): cần iOS 17+ và Android 13+. [Phân vùng thực thể](https://docs.swmansion.com/react-native-executorch/docs/extensions/instance-segmentation.md) dựng sẵn có FastSAM (**AGPL**), RF-DETR Nano Seg (Apache, nhưng chỉ 80 lớp COCO — không có đèn, kệ, ổ điện), YOLO26 Seg (**AGPL**). Chưa có SAM chạm chọn hay inpainting dựng sẵn; model khác phải xuất sang định dạng `.pte`.
- **react-native-fast-tflite** 3.0.1: config plugin có cờ `enableCoreMLDelegate`, `enableAndroidGpuLibraries`; hợp với bản LiteRT của MI-GAN.
- **Core ML qua module Expo tự viết**: đường cho EdgeTAM hoặc Apple Vision.

### 2.9. Endpoint cloud

| Nhu cầu | Endpoint | Giá / thời gian |
|---|---|---|
| SAM 3 theo từ khóa | [fal sam-3](https://fal.ai/models/fal-ai/sam-3/image/llms.txt) | $0.005/lần, ≤ 32 mask |
| | [vufinder/sam3](https://replicate.com/vufinder/sam3) (cộng đồng, Replicate) | ~$0.002, ~3 s trên L40S |
| | Không có `meta/sam-3` chính thức trên Replicate (404); có thể tự triển khai SAM 3.1 trên Replicate | — |
| LaMa | [allenhooo/lama](https://replicate.com/allenhooo/lama) (Replicate) | ~$0.0005, 2–3 s |
| Xóa kèm bóng | FLUX Erase (fal / BFL / Runware) | ~$0.05–0.12, ~10 s |
| | Bria Eraser (Replicate / fal) | $0.04 |

Khởi động nguội của model cộng đồng trên Replicate là rủi ro độ trễ (chưa kiểm chứng theo từng model).

### 2.10. Hướng sáng
- **ARCore Environmental HDR**: hướng nguồn sáng chính, ánh sáng môi trường, cubemap HDR. — [Docs](https://developers.google.com/ar/develop/lighting-estimation)
- **ARKit**: khi theo dõi không gian chỉ cho cường độ và nhiệt màu môi trường; ước lượng đèn có hướng chỉ có trong phiên theo dõi khuôn mặt. — [Docs](https://developer.apple.com/documentation/arkit/ardirectionallightestimate.md)
- **DiffusionLight**: MIT, dựa trên SDXL, chậm (vài giây). — [GitHub](https://github.com/DiffusionLight/DiffusionLight)
- **EverLight**: giấy phép code chưa rõ. — [arXiv 2304.13207](https://arxiv.org/abs/2304.13207)
- **Thực tế:** tìm vùng cửa sổ/đèn sáng bằng phân vùng + pháp tuyến để lấy hướng sáng chính; lấy trung bình ảnh cho ánh sáng môi trường.

### 2.11. Dựng 3D trên điện thoại
- **Phiên bản (2026-10-04):** SDK 57 dùng RN 0.86 ([changelog](https://expo.dev/changelog/sdk-57)); `expo@latest` 57.0.26, SDK 58 ở tag `next` ([npm](https://registry.npmjs.org/expo)). Expo Go cho SDK 57 không có trên App Store; với iPhone thật phải dùng `eas go` qua TestFlight, cần tài khoản Apple Developer trả phí ([Expo](https://expo.dev/changelog/expo-go-and-app-store-may-2026)).
- **three.js / R3F trên expo-gl (chạy trong Expo Go):** expo-gl giống WebGL2 nhưng thiếu `compressedTexImage2D/3D` (không có KTX2), `renderbufferStorageMultisample`, `fenceSync`, không kiểm tham số nên đầu vào sai gây crash native ([docs](https://docs.expo.dev/versions/v57.0.0/sdk/gl-view.md)); PR thêm texture nén chưa được gộp ([#35022](https://github.com/expo/expo/pull/35022)). Texture GLB hỏng vì Blob của React Native vẫn báo lỗi "Creating blobs from 'ArrayBuffer'" ([BlobManager.js](https://github.com/facebook/react-native/blob/main/packages/react-native/Libraries/Blob/BlobManager.js)) mà GLTFLoader dùng đường này cho texture nhúng ([R3F #3558](https://github.com/pmndrs/react-three-fiber/issues/3558)). iOS chạy OpenGL ES (Apple đã ngừng phát triển), three.js dựng trên luồng JS ([react-native-filament README](https://github.com/margelo/react-native-filament)); crash gần đây: [#41625](https://github.com/expo/expo/issues/41625), [#42520](https://github.com/expo/expo/issues/42520). Nhóm R3F nói expo-gl có "SIGNIFICANT performance issues" và chuyển sang WebGPU; `@react-three/native` ghi "pre-alpha… DO NOT USE" ([pmndrs/native](https://github.com/pmndrs/native)). **Không hợp cho bản thật.**
- **DOM component / WebView (chạy trong Expo Go):** props được tuần tự hóa, gửi bất đồng bộ và dựng lại cả cây React trong WebView ([docs](https://docs.expo.dev/guides/dom-components.md)) → **không điều khiển kéo bằng props**; xử lý cử chỉ trong WebView, chỉ gửi kết quả cuối về native. Trong WebView có đủ WebGL2, WebAssembly, Worker → giải nén Draco, meshopt, KTX2 đều được; WKWebView có WebGPU từ iOS 26 ([Apple forum](https://developer.apple.com/forums/thread/770862)). Giới hạn bộ nhớ WKWebView không nâng được ([thread](https://developer.apple.com/forums/thread/771787)); GLB 45 MB từng làm crash ([three.js forum](https://discourse.threejs.org/t/ios-webview-crash-when-45mb-glb-loaded/61515)). Đừng phụ thuộc nền trong suốt: vẽ ảnh phòng trong cảnh GL (che khuất và bóng cũng cần thế). Dùng lại được code cảnh của `apps/web`. Chưa có số đo độ trễ kéo — cần đo.
- **react-native-filament** (chỉ dev build): v1.11.0 (2026-05-27). Filament mạnh nhất về chất lượng: Metal trên iOS, sheen, transmission, bóng PCSS/EVSM, bóng tiếp xúc, SSAO, TAA; giải nén Draco, KTX2, meshopt, không có WebP ([Filament](https://github.com/google/filament)); react-native-filament có lộ hết các thứ đó không: chưa kiểm chứng. Có vật liệu hứng bóng `shadowMultiplier` (chỉ đèn có hướng) ([materials](https://google.github.io/filament/main/materials.html)); dựng trên luồng riêng, điều khiển vật từ worklet cử chỉ ([docs](https://github.com/margelo/react-native-filament/blob/main/docs/docs/guides/REANIMATED.mdx)). Rủi ro: phụ thuộc `react-native-worklets-core`, chuyển sang `react-native-worklets` còn nháp ([#349](https://github.com/margelo/react-native-filament/issues/349)); lỗi mở: mặt hứng bóng trong suốt [#298](https://github.com/margelo/react-native-filament/issues/298), crash Expo + New Architecture [#322](https://github.com/margelo/react-native-filament/issues/322), crash khi đổi nguồn mô hình [#323](https://github.com/margelo/react-native-filament/issues/323), rò bộ nhớ [#297](https://github.com/margelo/react-native-filament/issues/297), crash báo trên Expo 57 [#350](https://github.com/margelo/react-native-filament/issues/350); shader phải biên dịch sẵn `.filamat`, vật liệu không ghi độ sâu theo điểm ảnh; là engine thứ hai bên cạnh three.js của web.
- **Khác:**
  - **react-native-webgpu** v0.10.4 (2026-09-29), dựa trên Dawn, chạy được renderer WebGPU của three.js và R3F qua bản vá; có template Expo + config plugin, cần dev build và New Architecture ([docs](https://github.com/wcandillon/react-native-webgpu/tree/main/apps/docs/content/docs)); `createImageBitmap` nhận ArrayBuffer, có thể sửa lỗi texture GLB (chưa kiểm chứng); rò bộ nhớ với three r184 ([#445](https://github.com/wcandillon/react-native-webgpu/issues/445)).
  - **Babylon React Native** 2.0.5: nhắm RN 0.81.6, không hỗ trợ Expo chính thức, vấn đề New Architecture mở từ 2023 ([#595](https://github.com/BabylonJS/BabylonReactNative/issues/595)).
  - **Skia**: có trong Expo Go ([danh sách](https://docs.expo.dev/versions/v57.0.0/sdk/third-party-overview.md)) nhưng chỉ 2D.
  - **ViroReact** 3.0.2 (2026-10-01): có plugin Expo, PBR, bóng, nhưng làm cho AR trực tiếp; che khuất theo độ sâu của ảnh: chưa kiểm chứng.
  - **Native:** SceneKit chuyển sang chế độ bảo trì ở WWDC25 ([video](https://developer.apple.com/videos/play/wwdc2025/288/)); RealityKit không đọc glTF, chỉ USDZ, bóng `GroundingShadowComponent` có thể không hiện trên iPhone ([forum](https://developer.apple.com/forums/thread/840525)); cầu nối React Native của SceneView còn alpha và dùng RealityKit trên iOS ([repo](https://github.com/sceneview/sceneview)) → phải giữ hai định dạng mô hình.
- **Kỹ thuật:**
  - **Che khuất**, ba cách: (a) một lượt toàn màn ghi độ sâu từ depth map, tắt ghi màu — three.js đã làm đúng việc này trong [WebXRDepthSensing.js](https://github.com/mrdoob/three.js/blob/dev/src/renderers/webxr/WebXRDepthSensing.js); (b) lưới dựng từ depth map, cắt ở chỗ độ sâu nhảy, vẽ không màu (dùng được với Filament, RealityKit); (c) mask phân vùng đồ thật làm vật che, mép sắc. Tốt nhất: độ sâu để biết trước sau, mask cho mép, so độ sâu mềm để mép mượt. Tham khảo: [ARCore Depth Lab](https://github.com/googlesamples/arcore-depth-lab).
  - **Bóng:** `ShadowMaterial` của three.js trên mặt sàn + `ContactShadows` / `AccumulativeShadows` của drei ([drei](https://github.com/pmndrs/drei)), ví dụ `webgl_shadow_contact`; với Filament: `shadowMultiplier` + bóng tiếp xúc.
  - **Ánh sáng:** nhanh: cuộn ảnh thành environment map, lọc PMREM, lấy spherical harmonics bằng `LightProbeGenerator`. Tốt hơn: [DiffusionLight](https://github.com/DiffusionLight/DiffusionLight) dự đoán light probe HDR từ một ảnh. Hoàn thiện phía máy chủ: [ZeroComp](https://github.com/lvsn/ZeroComp), [IntrinsicCompositing](https://github.com/compphoto/IntrinsicCompositing).
  - Không có dự án mở trưởng thành "đặt nội thất vào một ảnh có che khuất theo độ sâu"; gần nhất là [openhouse-3d](https://github.com/yunfanye/openhouse-3d) (dựng offline bằng Blender).
- **Tài nguyên mô hình:** glTF-Transform 4.5.1 làm meshopt / Draco, KTX2 (ETC1S cho màu, UASTC cho normal), WebP, giảm cỡ, lượng tử hóa ([CLI](https://gltf-transform.dev/cli)). three.js trong WebView đọc được tất cả; three.js native trên Hermes (expo-gl hoặc WebGPU) chỉ đọc định dạng không cần giải nén (mesh lượng tử + JPEG/PNG), meshopt hỏng trên RN ([forum](https://discourse.threejs.org/t/unable-to-load-meshopt-compressed-glb-file-in-react-native/70180)), Hermes có WebAssembly không: chưa kiểm chứng; Filament: Draco, meshopt, KTX2, JPEG/PNG, không WebP. Thêm "Xem bằng AR": USDZ trong AR Quick Look (iOS), GLB trong [Scene Viewer](https://developers.google.com/ar/develop/scene-viewer) (Android); USDZ tạo bằng `USDZExporter` của three.js hoặc Blender; chưa thấy module Expo làm sẵn (chưa kiểm chứng).
- **Khuyến nghị dựng hình:** bản thật: three.js trong WebView, cử chỉ trong WebView, ảnh vẽ trong GL, lượt ghi độ sâu để che khuất, ShadowMaterial + bóng tiếp xúc, light probe từ ảnh, tài nguyên KTX2/meshopt. Về sau: chuyển sang react-native-webgpu + renderer WebGPU của three.js (cùng code cảnh) khi tới 1.0 và R3F v10 ổn định. Filament chỉ khi đo thấy WebView không giữ được 60 khung hình/giây trên Android tầm trung. Bản thử trong Expo Go: giữ DOM component hiện tại, không chuyển sang expo-gl.

---

## 2a. Model đã loại vì giấy phép

Cấm dùng thương mại hoặc giấy phép copyleft (GPL/AGPL):

| Model / dữ liệu | Lý do | Nguồn |
|---|---|---|
| Perspective Fields | Giấy phép Adobe Research, cấm thương mại | [GitHub](https://github.com/jinlinyi/PerspectiveFields) |
| UniDepth V2 | CC-BY-NC | [GitHub](https://github.com/lpiccinelli-eth/UniDepth) |
| Depth Anything V2 bản metric Base/Large | CC-BY-NC (chỉ bản Small là Apache) | [GitHub](https://github.com/DepthAnything/Depth-Anything-V2) |
| Depth Anything 3 Giant/Large (trừ DA3METRIC-LARGE) | CC-BY-NC | [GitHub](https://github.com/ByteDance-Seed/Depth-Anything-3) |
| SegFormer | NVIDIA, cấm thương mại | [So sánh](https://roboflow.com/compare/oneformer-vs-segformer) |
| EdgeSAM | S-Lab License, cấm thương mại | [GitHub](https://github.com/chongzhou96/EdgeSAM) |
| MAT | CC BY-NC | — |
| ObjectClear | S-Lab, cấm thương mại (dù xóa được bóng, phản chiếu) | [GitHub](https://github.com/zjx0101/ObjectClear) |
| Trọng số mở của Bria (erase) | CC-BY-NC (dịch vụ Bria Eraser trả phí thì dùng được) | [HF](https://huggingface.co/briaai/erase) |
| LuxDiT | NVIDIA, cấm thương mại | [HF](https://huggingface.co/nvidia/LuxDiT/blob/main/README.md) |
| YOLO-World / YOLOE | GPL-3.0 / AGPL-3.0 | — |
| FastSAM, YOLO26 Seg (trong react-native-executorch) | AGPL | [Docs](https://docs.swmansion.com/react-native-executorch/docs/extensions/instance-segmentation.md) |
| Model học từ ADE20K (Mask2Former/OneFormer…) | Ảnh ADE20K cấm thương mại → trọng số là vùng xám pháp lý | [Điều khoản ADE20K](https://ade20k.csail.mit.edu/terms) |
| Model bố cục học từ Structured3D (NonCuboidRoom, Plane-DUSt3R…) | Structured3D cấm thương mại | [GitHub](https://github.com/Xia0ben/Structured3D) |

Cần kiểm thêm trước khi dựa vào: điều khoản ADE20K, giấy phép trọng số MoGe-3, giấy phép NonCuboidRoom. Các endpoint Replicate cộng đồng nêu trên nên tự triển khai bản riêng khi chạy thật.

---

## 3. Hai đường chụp nên có

### 3.1. Chụp trong app (bám theo cách IKEA)
- Mở một phiên AR ngắn rồi chụp; lưu kèm thông số ống kính, vị trí máy, mặt sàn theo mét, và các mặt tường nếu bắt được.
- **ARKit cho:** thông số ống kính mỗi khung ([docs](https://developer.apple.com/documentation/arkit/arcamera/intrinsics.md)); mặt phẳng có nhãn sàn hoặc tường ([docs](https://developer.apple.com/documentation/arkit/arplaneanchor/classification-swift.enum.md)); độ sâu LiDAR (`sceneDepth`) chỉ trên máy có LiDAR ([docs](https://developer.apple.com/documentation/arkit/arframe/scenedepth.md)); RoomPlan cũng cần LiDAR ([RoomPlan](https://developer.apple.com/augmented-reality/roomplan/)).
- **ARCore:** Depth API chạy không cần cảm biến độ sâu, chính xác nhất ở 0,5–5 m; Google nói hơn 88% máy ARCore đang hoạt động hỗ trợ (05/2026); tỷ lệ trên toàn bộ máy Android, nhất là ở Việt Nam: chưa kiểm chứng. — [Depth](https://developers.google.com/ar/develop/depth) · [Thiết bị](https://developers.google.com/ar/devices)
- **IKEA Kreativ** dùng chụp nhiều ảnh và LiDAR khi có; quét cả phòng cần LiDAR. — [IKEA](https://www.ikea.com/gb/en/customer-service/knowledge/articles/250fg37g-2498-40gg-916c-f27d354683f0.html)
- **Từ React Native:** ViroReact 3.0.2 (MIT, 2026-10-01) hỗ trợ Expo 57 / RN 0.86, cần dev build; có nhãn mặt phẳng, vị trí máy, độ sâu, lưới không gian, ánh sáng môi trường, chụp màn; **không lộ thông số ống kính** (đã xem trong định nghĩa kiểu). — [GitHub](https://github.com/ReactVision/viro) · [Expo starter](https://github.com/reactvision/expo-starter-kit-typescript). Nên viết một module Expo native nhỏ (Swift + Kotlin, ước ~300 dòng).
- Độ chính xác đo bằng AR trên chiều dài tường được báo 3–20 cm (TB 8,5 cm) — chưa kiểm chứng. — [nomtek](https://www.nomtek.com/blog/getting-a-room-plan-with-arkit)
- **Có AR:** thông số máy, độ chúc/nghiêng, độ cao máy (khoảng cách máy tới mặt sàn) lấy từ phiên AR; tường lấy từ mặt phẳng đứng của AR nếu bắt được, không thì dựng trên cloud.
- **Không có AR:** tiêu cự từ EXIF + trọng lực từ DeviceMotion lúc chụp; trên cloud, một lần/ảnh: MoGe-2 (độ sâu, pháp tuyến, khoảng cách tới sàn theo mét) → phân vùng → dựng mặt phẳng; độ cao máy = khoảng cách tới sàn của MoGe-2, kẹp trong 1,1–1,7 m (giả định chụp cầm tay).
- **Sai số tỷ lệ ước:** khoảng 2–5% có AR, 5–15% không có AR (chưa kiểm chứng; dựa trên sai số NYUv2 / HAMMER của MoGe-2).

### 3.2. Ảnh từ thư viện
- Không có cảm biến. GeoCalib (lấy tiêu cự EXIF làm gợi ý nếu EXIF còn) cho độ chúc, nghiêng, tiêu cự; không thì thông số máy của MoGe-2.
- Tỷ lệ từ MoGe-2 + khoảng độ cao máy; độ cao máy giới hạn trong 1,1–1,7 m.
- **Sai số khoảng 10–20%**: sofa dài 2 m có thể lệch 20–40 cm.
- Khi độ tin cậy thấp, hỏi người dùng một kích thước đã biết (cửa đi, trần, hoặc kéo thước).

---

## 4. Những việc cần founder quyết

1. **Bỏ Expo Go, chuyển sang bản dev build** (app tự đóng gói có module native riêng):
   - Phiên AR lúc chụp cần module native riêng (ViroReact không trả thông số ống kính).
   - Model chạy trên máy (EdgeTAM, MobileSAM) cũng cần dev build.
   - Thêm: Expo Go cho SDK 57 trên iPhone giờ phải qua TestFlight bằng `eas go`, cần tài khoản Apple Developer trả phí ([Expo](https://expo.dev/changelog/expo-go-and-app-store-may-2026)).
2. **Nhà cung cấp AI:**
   - FLUX Erase không có trên Replicate, chỉ có ở fal / BFL. SAM 3 chưa có bản chính thức trên Replicate, phải tự triển khai.
   - Spec ghi "Replicate sau AIGateway". Đổi sang nhà khác là đổi quyết định: theo `CLAUDE.md` phải tạo bản ghi mới trong `decisions/` và chạy `pnpm kb:impact` trước.
3. **Xử lý đồng bộ hay chạy nền:**
   - IKEA chạy nền vài phút rồi báo xong.
   - YourSpace có thể: sau khi chụp chạy một lượt khoảng 10–30 giây (độ sâu, phân vùng, dựng tường), rồi xóa sẵn vài món chính trong nền để lúc chạm thấy ngay.

---

## 5. Rủi ro lớn nhất

- **Tỷ lệ mét với ảnh không có AR / ảnh thư viện:** đúng lời hứa "có vừa không" của sản phẩm. IKEA giải bằng cảm biến, không giải bằng AI một ảnh.
- **Ánh sáng chưa khớp:** khoảng cách lớn nhất về độ thật khi ghép món.
- **Viền che khuất bị quầng** khi độ sâu mềm (cần chế độ thủ công dự phòng).
- **Bộ nhớ WebView** khi có nhiều mô hình 10 MB cùng ảnh lớn: thu ảnh về ~2K, đặt ngân sách texture, xử lý khi tiến trình web bị kill.
- **Độ phủ ARCore trên máy Android giá rẻ ở Việt Nam:** chưa có số liệu.
- **Khác:** tường bị che gần hết; nhiều trình điều khiển GPU Android; phần lớn thư viện native nêu trên còn 0.x hoặc alpha; vật liệu transmission nặng trên máy yếu; Expo Go trên iOS giờ phụ thuộc `eas go`.

---

## 6. Code hiện tại dùng lại được (`apps/mobile`)

- **`src/features/editor/roomCamera.ts`**: khớp đúng đầu ra cần có — tiêu cự, tâm ảnh, độ chúc/nghiêng, hướng phòng, độ cao máy, các mặt tường (chiếu điểm, tìm điểm trên sàn, đặt mô hình, khung chiếu lên ảnh, va tường).
- **Lớp 3D chạy trong WebView (`src/features/editor/Room3DView.tsx`, DOM component)**: chính là hướng được khuyên cho bản thật (cần chuyển cử chỉ vào trong WebView và vẽ ảnh phòng trong GL).
- **`src/services/ai.ts`**: phải đổi kiểu dữ liệu — nhận mask và ảnh đã lấp thật, thay cho mã món tra dữ liệu dựng sẵn.

---

## Link chính

- Bằng sáng chế: [US11721067 (dựng phòng)](https://patents.google.com/patent/US11721067B2/en) · [US11367250 (tương tác)](https://patents.google.com/patent/US11367250) · [US20200302686A1](https://patents.google.com/patent/US20200302686A1/en) · [US20260030885A1](https://patents.google.com/patent/US20260030885A1/en)
- Geomagical: [bài báo xóa đồ arXiv 2210.15796](https://arxiv.org/abs/2210.15796) · [arXiv 2206.13644](https://arxiv.org/abs/2206.13644) · [lama-with-refiner](https://github.com/geomagical/lama-with-refiner) · [ISMAR 2022](https://www.geomagical.com/ismar2022-workshop.html)
- Model: [SAM 3](https://github.com/facebookresearch/sam3) · [MoGe](https://github.com/microsoft/moge) · [GeoCalib](https://github.com/cvg/geocalib) · [EdgeTAM](https://github.com/facebookresearch/EdgeTAM) · [LaMa](https://github.com/advimman/lama) · [MI-GAN](https://github.com/Picsart-AI-Research/MI-GAN)
- Dịch vụ: [FLUX Erase](https://bfl.ai/blog/flux-erase-remove-anything-leave-no-trace) · [fal sam-3](https://fal.ai/models/fal-ai/sam-3/image/llms.txt) · [Replicate LaMa](https://replicate.com/allenhooo/lama)
- Dựng hình: [mẫu ghi độ sâu để che khuất trong three.js](https://github.com/mrdoob/three.js/blob/dev/src/renderers/webxr/WebXRDepthSensing.js) · [Expo DOM components](https://docs.expo.dev/guides/dom-components.md) · [react-native-filament](https://github.com/margelo/react-native-filament) · [react-native-webgpu](https://github.com/wcandillon/react-native-webgpu)
- IKEA: [thông cáo](https://www.ikea.com/us/en/newsroom/corporate-news/ikea-launches-new-ai-powered-digital-experience-empowering-customers-to-create-lifelike-room-designs-pub58c94890/) · [VentureBeat](https://venturebeat.com/ai/ikea-launches-first-ai-powered-design-experience-no-swedish-meatballs-included) · [Erase](https://www.ikea.com/us/en/customer-service/knowledge/articles/g5dc7429-6f50-4e9c-9fd6-g0343d0c5gcc.html)
