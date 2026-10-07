# Nghiên cứu công nghệ: xây trải nghiệm kiểu IKEA Kreativ cho YourSpace (late 2026)

Ngày nghiên cứu: 2026-10-07. Phạm vi: công nghệ khả dụng cuối 2026 cho một startup nhỏ (web-first, sắp mở rộng Expo/React Native) để chụp/scan phòng thật → hiểu không gian 3D ở đơn vị mét → xóa đồ nội thất cũ → đặt sản phẩm 3D đúng tỉ lệ, occlusion/shadow/lighting hợp lý, nhắm thị trường Việt Nam (Android tầm trung phổ biến).

Bối cảnh hiện tại của team: web demo dùng Depth Anything V2 Small + SlimSAM chạy trong browser, LaMa ONNX self-host CPU để xóa đồ, three.js/R3F render, user tự chỉnh horizon + chiều cao camera để suy tỉ lệ. 3 điểm yếu đã đo được: (1) scale từ 1 ảnh cần nhập chiều cao camera — không tự động; (2) xóa vật thể lớn bằng LaMa để lại vết nhoè (smear), không xử lý shadow; (3) lighting/shadow không thực.

Mỗi phần dưới đây tổng hợp từ nghiên cứu web (WebSearch/WebFetch, verify license trực tiếp trên GitHub/Hugging Face khi có thể) và kết thúc bằng "Khuyến nghị cho YourSpace". Claim không xác thực được nguồn chắc chắn được đánh dấu **[chưa kiểm chứng]**.

---

## 1. Capture (thu nhận ảnh/3D phòng)

### ARKit: RoomPlan + sceneDepth/LiDAR
- **Khả năng:** RoomPlan dùng camera + LiDAR Scanner để quét phòng, tự phát hiện tường, cửa, cửa sổ và các vật thể định hình phòng (sofa, tủ, bàn...), xuất ra floor plan 3D tham số hoá (parametric), độ chính xác thường vài centimet. Giới hạn ~9×9m/phòng, quét ~60-90 giây. Output USD/USDZ, tương thích Cinema 4D, Shapr3D, AutoCAD. — [Apple ML Research](https://machinelearning.apple.com/research/roomplan), [RoomPlan Overview](https://developer.apple.com/augmented-reality/roomplan/)
- **Thiết bị hỗ trợ:** Cần LiDAR Scanner → chỉ iPhone 12 Pro/Pro Max và các dòng Pro mới hơn (13/14/15/16 Pro...) + iPad Pro có LiDAR. iPhone thường (non-Pro) không có LiDAR, không chạy được. — [it-jim blog](https://www.it-jim.com/blog/apple-roomplan-api/)
- **License/chi phí:** Một phần ARKit/iOS SDK, miễn phí trong Apple Developer Program ($99/năm), không phí riêng. Nhiều app thương mại lớn (IKEA Place, Houzz, Wayfair) đã dùng ARKit để bán hàng, xác nhận dùng thương mại không vướng license đặc biệt. — [TIME](https://time.com/4920332/apple-arkit-apps/), [MacRumors – IKEA Place](https://forums.macrumors.com/threads/ikea-details-plans-for-furniture-placement-app-powered-by-apples-arkit.2052079/) **[chưa kiểm chứng đầy đủ bằng văn bản pháp lý gốc cho riêng RoomPlan, nhưng minh chứng rõ qua thực tế nhiều app thương mại đang hoạt động]**

### ARCore: Depth API, Geospatial API, Scene Semantics
- **Depth API (depth-from-motion):** Không cần LiDAR/ToF — tính depth bằng nhiều khung hình khi di chuyển máy, dùng ML tăng chất lượng; nếu máy có ToF, ARCore merge dữ liệu phần cứng. — [Google AR Depth](https://developers.google.com/ar/develop/depth)
- **Tỉ lệ thiết bị hỗ trợ:** Theo trang chủ Google: **"As of May 2026, over 88% of active devices support the Depth API"** (số liệu global, không tách Việt Nam). — [developers.google.com/ar/devices](https://developers.google.com/ar/devices)
- **Geospatial API:** Dùng Google Earth 3D + Street View, chủ yếu ngoài trời, ít liên quan indoor. Miễn phí. — [Google AR Geospatial](https://developers.google.com/ar/develop/geospatial)
- **Scene Semantics API:** Gán nhãn ngữ nghĩa pixel (sky, building, tree, road...) — chỉ tối ưu cảnh ngoài trời, không phù hợp phòng trong nhà. — [Google AR Scene Semantics](https://developers.google.com/ar/develop/unity-arf/scene-semantics)
- **License:** ARCore SDK Apache 2.0, nhưng cần "Google Play Services for AR" trên máy người dùng, ràng buộc theo ToS/Privacy chung của Google (phải disclose). Không có giới hạn cấm thương mại. — [arcore-unity-sdk LICENSE](https://github.com/google-ar/arcore-unity-sdk/blob/master/LICENSE)

### Tỉ lệ thiết bị Android Việt Nam hỗ trợ ARCore Depth API
- **Không có số liệu riêng Việt Nam [chưa kiểm chứng].** Dùng số liệu global gần nhất: >88% active devices (5/2026). Android chiếm ~65.7% thị phần OS di động VN (2024), phân khúc tầm trung (Samsung A-series, Redmi, Oppo) đa phần nằm trong danh sách hỗ trợ ARCore chính thức (Android 7+, có Play Store). — [Statcounter VN](https://gs.statcounter.com/android-version-market-share/mobile/viet-nam), [báo cáo thị trường smartphone VN 2026](https://news.laodong.vn/cong-nghe/smartphone-tai-viet-nam-nam-2026-xu-huong-gia-tang-canh-tranh-cao-1641188.ldo). Kết luận thực dụng: máy tầm trung phổ biến ở VN hầu như support Depth API, nhưng số liệu định lượng riêng VN không có nguồn xác thực.

### WebXR trên Chrome Android
- **Depth Sensing Module:** Chrome 90+ hỗ trợ theo spec W3C (Working Draft 25/8/2026), support khác nhau theo thiết bị, phải feature-detect. — [W3C WebXR Depth Sensing](https://www.w3.org/TR/webxr-depth-sensing-1/)
- **Hit-test:** Chrome for Android hỗ trợ `immersive-ar` + hit-test từ Chrome 79+ (dùng ARCore nền dưới), chỉ Android (không desktop/iOS Safari). — [Intent to Ship](https://groups.google.com/a/chromium.org/g/blink-dev/c/QyIz793UdGs/m/PgWUPO1PDQAJ), [caniuse](https://caniuse.com/webxr)
- **Dùng trong web app không cần cài app:** Có — chạy ngay trong Chrome Android, nhưng vẫn cần Google Play Services for AR cài ngầm.
- **Giới hạn:** Chỉ Chrome Android, support không đồng nhất giữa máy, cần fallback.

### Multi-view capture
- SfM/Multi-View Stereo, NeRF, 3D Gaussian Splatting dùng nhiều ảnh góc khác nhau dựng 3D; 3DGS cân bằng tốt nhất chất lượng/tốc độ (real-time render, train vài phút) so với NeRF. — [PyImageSearch 3DGS vs NeRF](https://pyimagesearch.com/2024/12/09/3d-gaussian-splatting-vs-nerf-the-end-game-of-3d-reconstruction/)
- Chủ yếu academic, **không có benchmark "mid-range Android + multi-view" production sẵn sàng [chưa kiểm chứng]**. Lý thuyết: khả thi hơn AR API vì chỉ cần camera RGB thường (không cần LiDAR/ARCore), suy scale thật tốt hơn nhờ baseline giữa ảnh, nhưng đổi lại cần xử lý nặng (thường server/cloud) và UX chụp nhiều ảnh phức tạp hơn.

### Expo/React Native: truy cập ARKit RoomPlan / ARCore Depth
- **ViroReact (`@reactvision/react-viro`):** Morrow Digital mua 1/2025, tách công ty riêng ReactVision cuối 2025, có team full-time maintain. MIT, hỗ trợ ARKit+ARCore, chạy Expo và RN CLI — **lựa chọn tốt nhất hiện có, đang active maintain.** — [GitHub ReactVision/viro](https://github.com/ReactVision/viro)
- **expo-ar:** MIT, bridge ARKit+ARCore vào 1 view TS chung, nhưng mới bản v0.1.0, rủi ro bảo trì dài hạn chưa rõ **[chưa kiểm chứng ổn định production]**. — [stewmore.dev](https://www.stewmore.dev/blog/expo-ar-arkit-arcore-react-native)
- **react-native-arkit:** README repo xác nhận không còn maintain, khuyến nghị chuyển ViroReact.
- **expo-gl:** Chỉ cung cấp WebGL context, không có AR API riêng — cần tự viết native module hoặc dùng ViroReact nếu cần quét phòng thật.
- Hiện **không có module Expo/RN bọc sẵn RoomPlan** — ViroReact chỉ expose AR session cơ bản (plane detection, hit-test, anchors), không expose object-recognition pipeline của RoomPlan. Muốn dùng RoomPlan thật cần viết native module Swift riêng.

### Khuyến nghị cho YourSpace (Phần 1)
**(a) Tốt nhất + rẻ nhất:** Web — giữ pipeline hiện tại (Depth Anything V2 + SlimSAM + LaMa), bổ sung **WebXR hit-test trên Chrome Android** (miễn phí, built-in Chrome) làm "AR calibration mode" tùy chọn để lấy camera height + floor plane tự động, fallback về manual horizon khi không hỗ trợ (iOS Safari, Firefox). Mobile (M2): dùng **ViroReact** (MIT, active maintain) để truy cập ARCore Depth (Android)/ARKit plane detection (iOS) cho auto floor-plane — rẻ nhất, không cần viết native module từ đầu. Không cần RoomPlan đầy đủ ở M1/M2 — over-engineer cho bài toán "đặt 1 món đúng tỉ lệ", chỉ xét khi làm feature "scan toàn phòng" sau này (và chỉ chạy trên iPhone Pro, thiểu số thiết bị ở VN).
**(b) Tránh vì license:** Không cần tránh ARKit/ARCore/WebXR (đều dùng thương mại được). Tránh `react-native-arkit` (không maintain). Nếu dùng ARCore phải disclose việc dùng Google Play Services for AR theo ToS.

---

## 2. Metric geometry từ ảnh

### Bảng tóm tắt license (quan trọng nhất)

| Model | License | Thương mại? |
|---|---|---|
| GeoCalib | Apache-2.0 (code) + CC BY 4.0 (weight) | **CÓ, hoàn toàn** |
| Depth Anything V2/3 Small/Base/Metric-Large | Apache-2.0 | **CÓ** |
| DA-V2/DA3 Giant | CC BY-NC-4.0 | Không |
| MoGe-2/3 | MIT (theo tag HF) nhưng chưa có xác nhận chính thức từ Microsoft | Khả năng CÓ, rủi ro pháp lý nhẹ **[chưa kiểm chứng 100%]** |
| HorizonNet, RoomFormer, Plane-DUSt3R (code) | MIT | CÓ (riêng code) |
| Depth Pro (Apple) | Research-only cho weight | **KHÔNG** |
| UniDepth/V2 | CC BY-NC(-SA) | **KHÔNG** |
| DUSt3R/MASt3R | CC BY-NC-SA | **KHÔNG** |
| Pi3/Pi3X weights | CC BY-NC (code BSD-3 nhưng vô dụng không có weight mở) | **KHÔNG** |
| SpatialLM | CC-BY-NC (encoder chính) | **KHÔNG** |
| Perspective Fields (Adobe Research) | Adobe Research License, cấm thương mại | **KHÔNG** |
| VGGT | Non-commercial gốc; có checkpoint `-Commercial` riêng cần apply | Có, qua checkpoint đặc biệt |

### Chi tiết từng model

**MoGe-2/MoGe-3 (Microsoft):** Code MIT (trừ phần DINOv2 Apache-2.0), weight HF tag MIT nhưng [Issue #98](https://github.com/microsoft/MoGe/issues/98) (mở từ 7/2025) hỏi xác nhận chính thức commercial — chưa có phản hồi từ Microsoft **[chưa kiểm chứng]**. Có port WebGPU browser (`lyonsno/moge-webgpu`), ~2.5s/ảnh trên Apple M4 Max — nặng cho Android tầm trung (backbone ViT-Large). Metric (point maps, depth, normal, FOV từ 1 ảnh). Benchmark: AbsRel 3.81, δ₁ 47.1 — tốt hơn Depth Pro (4.15) và UniDepth V2 (5.60) trên test set paper trích. — [microsoft/MoGe](https://github.com/microsoft/moge), [paper](https://arxiv.org/pdf/2507.02546)

**Depth Pro (Apple):** Code Apple Sample Code License, nhưng weight **research-only, cấm thương mại** (xác nhận LICENSE file + [Issue #66](https://github.com/apple/ml-depth-pro/issues/66)). ~0.3s/ảnh 2.25MP trên GPU, không có bản on-device metric chính thức. AbsRel 4.15. **Loại khỏi production thương mại.**

**Depth Anything 3 (ByteDance Seed):** License đa cấp theo checkpoint — **DA3-BASE (0.12B) và DA3METRIC-LARGE (0.35B, metric) = Apache-2.0**; bản Giant/Nested-Giant-Large = CC BY-NC 4.0. Có port edge/embedded cộng đồng (NPU, TensorRT) nhưng chưa có ONNX/WebGPU browser chính thức. Tự báo vượt VGGT 44.3% camera pose, 25.1% hình học (số của tác giả, chưa verify độc lập **[cần kiểm chứng thêm]**). Có cả bản relative và metric. — [ByteDance-Seed/Depth-Anything-3](https://github.com/bytedance-seed/depth-anything-3)

**Depth Anything V2 (model hiện tại của team) + Metric variant:** Small = Apache-2.0 (cả relative và Metric-Hypersim-Small), Base/Large/Giant = CC-BY-NC-4.0. Bản Small relative đã có `onnx-community` chạy browser qua Transformers.js+WebGPU (đúng setup hiện tại). **Vấn đề:** bản Metric Small **chưa được transformers.js hỗ trợ export ONNX chính thức** ([Issue #1476](https://github.com/huggingface/transformers.js/issues/1476), còn mở) — muốn metric trong browser bằng họ này phải tự convert ONNX.

**UniDepth/V2:** CC BY-NC 4.0 / CC BY-NC-SA 4.0 — **không thương mại** (convert ONNX cộng đồng chỉ MIT cho phần wrapper, không giải phóng license weight gốc). AbsRel 5.60. Tránh dùng thương mại.

**VGGT (Meta/Oxford):** Checkpoint gốc non-commercial; từ 7/2025 có `facebook/VGGT-1B-Commercial` cần apply/approve (miễn phí nếu được duyệt, loại trừ military use). Multi-view, rất nhanh (0.2s/10 frame). CO3Dv2 AUC@30=88.2. Không giải quyết trực tiếp bài "1 ảnh đơn".

**DUSt3R/MASt3R (Naver):** CC BY-NC-SA 4.0 — **không thương mại** trừ mua license riêng từ Naver.

**π3/Pi3X:** Code BSD-3-Clause (thương mại OK) nhưng **weight CC BY-NC** — dùng code mở vô nghĩa nếu không có weight thương mại, phải train lại.

**GeoCalib (ETH Zurich/cvg) — giải quyết trực tiếp vấn đề "manual horizon":** Code Apache-2.0 + weight **CC BY 4.0 (chỉ cần attribution, không NC)** — **license tốt nhất trong toàn bộ danh sách, sạch hoàn toàn cho thương mại.** ~100ms/ảnh để tính intrinsics + gravity direction (roll/pitch/FOV/horizon) từ 1 ảnh, kiến trúc nhẹ (không phải transformer khổng lồ) nên khả năng chạy ONNX/WebGPU browser hoặc server CPU khả thi **[cần kiểm chứng thêm hardware cụ thể]**. Đây chính xác là thứ thay thế bước "user tự kéo đường tầm mắt" (commit `1776f82`, `9e7cf18`). — [cvg/GeoCalib](https://github.com/cvg/GeoCalib), [paper](https://arxiv.org/pdf/2409.06704)

**Perspective Fields:** Đính chính — là của **Adobe Research** (không phải Meta). License Adobe Research — **cấm rõ ràng dùng kinh doanh/tạo lợi nhuận, không phân phối lại.** Tránh dùng; GeoCalib là thay thế tốt hơn và free hơn.

### Room layout models
- **HorizonNet:** MIT, thương mại OK, nhưng chuyên cho ảnh panorama 360° — không fit ảnh perspective thường trừ khi user dùng pano.
- **Plane-DUSt3R:** Code wrapper MIT nhưng phụ thuộc backbone DUSt3R (CC BY-NC-SA) — **thực tế vẫn bị khóa non-commercial** nếu dùng weight gốc.
- **SpatialLM:** Multi-component — encoder chính (SceneScript) CC-BY-NC-4.0 → **tổng thể bị khóa NC**; input là point cloud (cần LiDAR), không phải ảnh RGB đơn.
- **RoomFormer:** MIT, thương mại OK, nhưng input point cloud/density map, không phải ảnh RGB đơn — cần tiền xử lý khác.

### Khuyến nghị cho YourSpace (Phần 2)
**Vấn đề "manual horizon" (ưu tiên #1):** Dùng **GeoCalib** (Apache-2.0 + CC-BY, ~100ms/ảnh, license sạch nhất tìm được trong cả nghiên cứu) để tự động ước lượng roll/pitch/FOV/gravity từ 1 ảnh, thay thế bước user tự kéo đường tầm mắt — dùng làm input calibration giúp depth model suy scale chính xác hơn.

**Vấn đề "suy metric scale từ 1 ảnh không cần nhập thông số":** Ưu tiên **Depth Anything 3 — DA3METRIC-LARGE (Apache-2.0)** vì cùng họ với model đang dùng (dễ migrate), metric thật, license sạch 100%; chạy **server-side qua AIGateway đã có trong kiến trúc M1** (giống cách xử lý depth/segmentation/inpainting qua Replicate hiện tại), không nhồi vào client vì Android tầm trung không đủ mạnh cho transformer metric. **MoGe-2/3 (MIT)** là lựa chọn 2 nếu chấp nhận rủi ro license nhẹ chưa được Microsoft xác nhận chính thức.

**Room layout:** Không có model vừa (a) license sạch, (b) nhận ảnh RGB đơn, (c) chất lượng cao cùng lúc — **không đầu tư room-layout model chuyên dụng ở M1**; dùng GeoCalib (horizon/vanishing point) + segmentation có sẵn để suy floor-plane heuristic đơn giản, đúng tinh thần "fallback đặt đồ thủ công" đã có trong CLAUDE.md.

**Tránh (research-only/NC):** Depth Pro, UniDepth/V2, DUSt3R/MASt3R, Pi3/Pi3X weights, SpatialLM, Perspective Fields, DA-V2/DA3 Giant, VGGT checkpoint gốc (chỉ dùng bản `-Commercial` sau khi apply).

---

## 3. Segmentation/detection đồ nội thất

### SAM 2 / SAM 2.1 (Meta)
Apache 2.0. ~44 FPS GPU, có ONNX (samexporter). Community build WebGPU (sam2-web) — chưa phải chính thức Meta **[chưa kiểm chứng độ ổn định production]**. **Class-agnostic** — cần point/box prompt, không tự biết "đây là sofa", phải ghép với detector.

### SAM 3 / SAM 3.1 (Meta)
License tùy chỉnh "SAM License" (không còn Apache/MIT), cập nhật 19/11/2025 — cho thương mại nhưng cấm quân sự/ITAR, phải tuân luật kiểm soát xuất khẩu, cấm reverse-engineer. Hỗ trợ "concept prompt" (segment trực tiếp bằng từ như "sofa"), gộp detect+segment. Có bản int8 cộng đồng chạy browser (`rusen/sam3-browser-int8`) nhưng không chính thức, nặng hơn SAM2 **[chưa kiểm chứng hiệu năng Android tầm trung]**. — [facebookresearch/sam3](https://github.com/facebookresearch/sam3)

### Bản nhẹ cho mobile/browser
- **MobileSAM:** Apache 2.0. Nhỏ hơn SAM gốc 66×, nhanh hơn 5-38×, chất lượng gần tương đương.
- **EfficientSAM:** Apache 2.0, dùng masked-image-pretraining (SAMI), nhẹ.
- **EdgeTAM:** Apache 2.0, biến thể on-device của SAM2, 16 FPS trên iPhone 15 Pro Max, nhanh hơn SAM2 22×.
- **EdgeSAM:** Nhanh hơn MobileSAM/EfficientSAM >7× trên iPhone 14 — license cần tự verify thêm **[chưa kiểm chứng]**.

### Open-vocabulary detection
- **Grounding DINO 1.5/1.6 (IDEA Research):** Apache 2.0 (relicense từ ~4/2026), thương mại không cần xin phép. — [LICENSE](https://github.com/IDEA-Research/GroundingDINO/blob/main/LICENSE)
- **YOLO-World:** **GPL-3.0 (copyleft)** — thương mại phải mở toàn bộ source hoặc mua Ultralytics Enterprise License. **Rủi ro pháp lý cao cho sản phẩm đóng nguồn.**
- **OWL-ViT/OWLv2 (Google):** Apache 2.0, zero-shot text-conditioned detection, backbone CLIP.
- **Florence-2 (Microsoft):** MIT, xác nhận LICENSE file HF. Nhẹ (230M/770M), detect+caption+grounding+segmentation trong 1 model.

### Khuyến nghị cho YourSpace (Phần 3)
**Tốt nhất + rẻ nhất:** Ghép **Florence-2 (MIT) hoặc Grounding DINO 1.5 (Apache 2.0)** để auto-detect+label đồ nội thất bằng text prompt → đưa box cho **MobileSAM/EfficientSAM (Apache 2.0)** lấy mask chính xác (pattern Grounded-SAM dùng bản nhẹ, chạy browser/RN được). Nâng cấp tự nhiên từ SlimSAM hiện tại, giữ license 100% Apache/MIT. SAM 3 concept-prompt là hướng tốt tương lai nhưng license tùy chỉnh + nặng hơn browser — để sau M1.

**Tránh:** YOLO-World/YOLO Ultralytics nếu không mua Enterprise License — GPL/AGPL buộc mở source hoặc trả phí.

---

## 4. Xóa đồ nội thất (object removal/inpainting) — chú trọng vật LỚN + SHADOW

### LaMa (gốc, team đang dùng)
Apache 2.0, self-host CPU free. **Không có refiner/fix chính thức 2025-2026 khắc phục smear trên vật lớn** tìm được; cải tiến tìm thấy chỉ cho ảnh y tế/historical, không áp dụng. **Không xử lý shadow** ngoài mask.

### MAT (Mask-Aware Transformer)
Repo ghi rõ "research purposes only" + built trên StyleGAN2-ADA (NVIDIA Source Code License — Non-Commercial). **Không dùng được thương mại** nếu không xin phép NVIDIA.

### MI-GAN
MIT (Picsart-AI-Research/MI-GAN), thiết kế riêng cho mobile, nhẹ hơn SOTA ~1 bậc, chạy được Android tầm trung. Không có benchmark riêng smear/shadow **[chưa kiểm chứng, cần tự test]**.

### PowerPaint
Code MIT, dựa base SD1.5-inpainting (CreativeML OpenRAIL-M — thương mại kèm behavioral restrictions). Một số nguồn ghi v2 là Apache 2.0 **[chưa kiểm chứng chính xác version nào]**. Tự nhận xóa tốt hơn Adobe Firefly trong context đông đúc — tuyên bố của tác giả, không phải benchmark độc lập **[chưa kiểm chứng]**.

### BrushNet
Apache 2.0 (TencentARC/BrushNet) "trừ một số thành phần bên thứ ba" — cần check license base SD đi kèm (OpenRAIL). Diffusion-based, nặng, phù hợp server/cloud, không on-device.

### FLUX.1 Fill [dev] / FLUX Pro API
FLUX.1-dev **Non-Commercial License** — cấm hoạt động thương mại trừ khi mua license từ Black Forest Labs. FLUX.1 schnell là Apache 2.0 nhưng không có bản Fill tương ứng. Muốn inpaint chất lượng cao thương mại phải dùng **FLUX Pro API** (đã có license thương mại kèm dịch vụ). Chi phí: FLUX Fill dev (qua fal.ai) ~$0.037/ảnh; FLUX Fill Pro ~$0.05/ảnh. **Tự host FLUX.1-dev cho sản phẩm thương mại là vi phạm license.**

### Bria Eraser
An toàn pháp lý nhất — train trên dữ liệu có license đầy đủ ("IP safety for commercial use"), dùng qua API. Giá $0.04/ảnh (đồng nhất trên fal.ai, DeepInfra, WaveSpeed, Segmind). Marketing nói "context-aware" nhưng không có benchmark riêng về shadow **[chưa kiểm chứng]**.

### Clipdrop
Đã đổi chủ: Stability AI bán cho Jasper (2/2024) — API hiện thuộc Jasper. Cleanup/Remove = 3 credit/ảnh, gói từ $9/tháng (50 calls) đến $299/tháng (2500 calls). Pro plan ($9/tháng) kèm commercial license.

### ObjectClear (CVPR 2026) — khớp nhất với use-case "shadow-aware removal"
arXiv 2505.22636 (Chen Change Loy team). Cơ chế: Adaptive Target-Aware Attention + Attention-Guided Fusion + Spatially-Varying Denoising Strength — xóa vật **và** shadow/reflection cùng lúc, build trên SDXL-Inpainting. Benchmark PSNR-BG vượt trội: 26.35/27.90 (OBER-Test/Wild) vs OmniEraser 23.02/23.83 — bằng chứng chất lượng cụ thể nhất tìm được cho use-case này. **License code/weights chưa xác nhận rõ** (paper arXiv chỉ ghi CC BY 4.0 cho bài báo) — tối thiểu bị ràng buộc CreativeML OpenRAIL++ của base SDXL-Inpainting **[cần tự verify trước khi tích hợp thương mại]**.

### OmniEraser
Weights public trên HF (theSure/Omnieraser). **Không có LICENSE file trên repo** + build trên FLUX.1-dev → khả năng cao bị ràng buộc Non-Commercial License của FLUX. **Tránh dùng thương mại tới khi xác nhận rõ.** Chất lượng thấp hơn ObjectClear trên benchmark cross-test.

### SDXL Inpainting / ControlNet Inpaint
CreativeML Open RAIL++-M — thương mại được kèm hạn chế hành vi sử dụng. Chi phí rẻ: SDXL inpaint cơ bản trên Replicate ~$0.0028/ảnh; bản ControlNet+LoRA mạnh hơn ~$0.24/ảnh.

### Công nghệ mới nổi 2026 (chỉ theo dõi)
OSOR, PredErase, TurboClear, EffectErase — các paper 2026 về object-and-effect removal one-step diffusion, cho thấy xu hướng ngành đúng hướng nhưng chưa có code/license rõ để dùng ngay **[chưa kiểm chứng]**.

### Khuyến nghị cho YourSpace (Phần 4)
**Chiến lược 2 tầng:** (1) Vật nhỏ/trung bình: giữ LaMa self-host (Apache 2.0, free) — không đổi. (2) Vật LỚN + có shadow: gọi API trả phí có chọn lọc (chỉ khi detect vật lớn) — **Bria Eraser ($0.04/ảnh)** an toàn pháp lý nhất (data licensed rõ); nếu cần chất lượng cao hơn cho case khó, **FLUX Fill Pro API ($0.05/ảnh)** thay vì tự host FLUX.1-dev. **ObjectClear** đáng điều tra kỹ nhất về kỹ thuật (benchmark tốt nhất cho đúng use-case shadow) nhưng phải tự verify license code/weights trước khi tích hợp.

**Tránh:** MAT (NC research-only), tự host FLUX.1-dev/Fill-dev thương mại (vi phạm license), OmniEraser (license không rõ + khả năng dính NC của FLUX), Clipdrop cần biết đã đổi chủ sang Jasper.

---

## 5. Relighting/compositing

### DiffusionLight
MIT (CVPR 2024), thương mại được. Bản gốc ~30 phút/ảnh (exposure bracketing HDR chrome-ball); bản **DiffusionLight-Turbo** (single-pass) ~30 giây/ảnh, chất lượng giảm nhẹ. Cần GPU server, có sẵn trên Replicate. SOTA academic 2024 cho light probe estimation. — [github.com/DiffusionLight/DiffusionLight](https://github.com/DiffusionLight/DiffusionLight)

### EverLight
**[chưa kiểm chứng]** — không tìm thấy mã nguồn public/license rõ ràng, chỉ có paper (ICCV 2023) + HF papers page. GAN-based HDR panorama, giá trị academic/offline.

### StyleLight
MIT (Wanggcong/StyleLight), thương mại OK. Dual-StyleGAN (ECCV 2022), nhẹ hơn diffusion nhưng vẫn cần GPU, không realtime. Đã bị các phương pháp diffusion mới (DiffusionLight, LuxDiT) vượt qua về chất lượng.

### ZeroComp
**CC BY-NC-SA 4.0 — non-commercial only.** Dựa ControlNet+SD (intrinsic-conditioned), chất lượng compositing cao nhưng **tránh dùng production vì license.**

### IntrinsicCompositing
Repo ghi "restricted to academic use only... For commercial licensing inquiries, contact SFU Technology Licensing Office." ~1-2s/ảnh sau load checkpoint (RTX 2060, 1024px) — nhanh nhưng **cần xin phép/mua license riêng từ SFU** để dùng thương mại.

### IC-Light (lllyasviel)
Apache 2.0 trên repo chính, nhưng **v1 phụ thuộc BRIA RMBG 1.4 (non-commercial)** — README khuyến cáo thay bằng BiRefNet (MIT) nếu dùng thương mại. **IC-Light V2 (Flux-based) là non-commercial only.** Chỉ IC-Light V1 + thay background remover là an toàn thương mại. Dựa SD v1.5 fine-tuned, cần GPU, vài giây/ảnh trên GPU cloud tầm trung (Replicate `zsxkib/ic-light`) — khả thi cheap-server, không on-device. Rất phổ biến, nhiều pipeline production (ComfyUI, Forge) dùng.

### Shadow synthesis (2025-2026)
Các paper mới (Controllable Shadow Generation single-step diffusion, MultiShadow/CoShadow, VSDiffusion, MetaShadow CVPR 2025, 3D-aware shadow ICASSP 2026) đều ở giai đoạn academic, hầu như chưa có license thương mại rõ, cần GPU diffusion — **không khả thi cho mobile tầm trung VN hiện tại.**

### Giải pháp REALTIME trong three.js (không cần AI nặng)
- **WebXR Lighting Estimation API** (`immersive-web/lighting-estimation`) + three.js `XREstimatedLight`: chỉ hoạt động trong phiên AR live thật, **KHÔNG áp dụng cho ảnh chụp tĩnh** (bài toán YourSpace là ảnh tĩnh upload, không phải live AR session) — lưu ý quan trọng.
- **LightProbe/LightProbeGenerator** (three.js built-in): tạo light probe (SH9) từ cube texture có sẵn — rẻ, realtime, nhưng cần nguồn cubemap/environment map trước.
- **Kỹ thuật rẻ hợp mobile tầm trung:** baked AO/contact shadow (blob-shadow hoặc decal texture) thay shadow map realtime (tốn 1 pass render, giảm nửa FPS trên GPU mobile); tắt SSAO/HBAO trên Android tầm trung, dùng AO bake sẵn; **ambient màu lấy mẫu trung bình từ chính ảnh phòng** làm fake environment light (hemisphere light 3 giá trị RGB) — rẻ nhất, không cần AI.

### Khuyến nghị cho YourSpace (Phần 5)
**Rẻ nhất ngay cho M1:** không chạy AI lighting nặng on-device. Dùng combo: ambient light lấy mẫu màu từ ảnh phòng (không AI) + blob/baked contact shadow theo hướng ánh sáng ước lượng thô. Nếu cần nâng chất lượng, đưa **IC-Light V1 (Apache-2.0, thay BRIA RMBG → BiRefNet)** hoặc **DiffusionLight-Turbo (MIT, ~30s/ảnh)** lên làm job cloud-GPU **1 lần/ảnh phòng** (giống cách xử lý depth hiện tại), cache kết quả ambient/HDR nhỏ xuống client — không chạy model trên máy người dùng.

**Tránh:** ZeroComp (CC BY-NC-SA), IntrinsicCompositing (academic-only, cần xin phép SFU), IC-Light V2/Flux (non-commercial), các paper shadow-synthesis 2025-2026 (academic, cần GPU diffusion, không hợp mobile tầm trung).

---

## 6. Pipeline 3D sản phẩm (ảnh nhà cung cấp → model 3D)

### glTF/USDZ pipeline tiêu chuẩn
glTF/GLB là format chuẩn cho web (three.js/R3F), Android (Scene Viewer), và hầu hết sàn thương mại — 1 file GLB phục vụ web+RN+Android AR. **USDZ cần riêng cho Apple AR Quick Look** (iOS không mở trực tiếp GLB) — quy trình chuẩn: build GLB gốc, convert sang USDZ cho luồng iOS (Reality Converter/usdzconvert). GLB không thay thế hoàn toàn được USDZ cho trải nghiệm AR "native" trên iPhone.

### TRELLIS/TRELLIS.2 (Microsoft)
MIT cho code + model chính, nhưng **TRELLIS.2 dùng DINOv3 encoder có license riêng** → output "commercial-conditional", cộng thêm dependency NVIDIA khác license **[chưa kiểm chứng đầy đủ — cần đọc license file trước production]**. Benchmark ABC dataset: Hunyuan3D vượt TRELLIS về IoU/Chamfer Distance; TRELLIS cũng thua Nexus (method mới hơn). Không còn SOTA tuyệt đối nhưng vẫn baseline mạnh, dễ tự host (MIT).

### Hunyuan3D 2.x (Tencent)
**Tencent Hunyuan3D Community License** (custom) — cho thương mại, hosted API, derivative, **nhưng** nếu MAU toàn sản phẩm/dịch vụ vượt **100 triệu/tháng** phải xin license riêng; cấm dùng output cải thiện model AI khác (trừ dòng Hunyuan); **license không áp dụng tại EU, UK, Hàn Quốc**. Với startup VN nhỏ, ngưỡng 100M MAU không phải vấn đề thực tế. Benchmark chính chủ: Hunyuan3D 2.0 vượt TRELLIS; 2.5 ("Ultimate Details") nâng chi tiết hơn nữa — một trong các model open-weight chất lượng cao nhất hiện có cho image-to-3D.

### SF3D/SPAR3D (Stability AI)
**Stability AI Community License** — miễn phí nghiên cứu, non-commercial, VÀ **commercial nếu doanh thu hàng năm ≤ $1,000,000**; vượt ngưỡng phải mua Enterprise license. Với startup nhỏ mới launch M1, **dùng thương mại miễn phí ngay được**, nhưng đây là giới hạn tạm theo doanh thu — cần nhớ quay lại mua Enterprise nếu scale thành công. SF3D nổi bật về tốc độ; SPAR3D cho real-time editing + point-aware structure. Không có benchmark đối chiếu trực tiếp với Hunyuan3D tìm được **[chưa kiểm chứng]**.

### Meshy (SaaS)
Free (100 credit/tháng), Pro $20/tháng (1000 credit), Studio $60/tháng. License đầu ra: **Free plan → CC BY 4.0** (thương mại được nhưng phải credit Meshy); **Paid plan (Pro+) → full private ownership** (miễn không publish công khai lên Meshy Community, không vi phạm bản quyền vật liệu gốc).

### Tripo (Tripo3D/VAST)
Free 200 credit/tháng (~8 model), Professional $19.9/tháng (3000 credit), Advanced $49.9/tháng (8000 credit); API riêng $1/100 credit (~25 credit/model). License đầu ra: **Free/Basic → CC BY 4.0, công khai, KHÔNG commercial**; **Paid (Professional+) → private + full commercial rights**. Có pipeline riêng cho AR furniture placement (WebXR) theo blog chính chủ — target đúng use-case furniture/ecommerce.

### So sánh cho catalog nội thất
Chất lượng đủ "bán": Hunyuan3D 2.x cao nhất trong nhóm open-weight hiện có (vượt TRELLIS theo benchmark chính chủ), lợi thế rõ cho vật cứng/góc cạnh (ghế, bàn). Meshy/Tripo (SaaS) tiện catalog hoá nhanh số lượng lớn, không cần hạ tầng, nhưng kiểm soát pipeline (retopology/UV/LOD) có thể kém hơn tự host.

### Khuyến nghị cho YourSpace (Phần 6)
**Giai đoạn catalog hoá ban đầu (M1, volume nhỏ-vừa, chưa có đội hạ tầng GPU):** dùng **Tripo hoặc Meshy SaaS plan trả phí (Professional/Pro)** convert ảnh nhà cung cấp → GLB — giữ ownership/commercial rõ, không cần vận hành GPU. Dùng **GLB làm format chuẩn** (web+RN+Android), convert thêm **USDZ riêng cho iOS Quick Look** (1 chiều từ GLB).

**Khi scale lên:** chuyển dần sang tự host **Hunyuan3D 2.x** (chất lượng cao nhất, license cho thương mại tới ngưỡng rất cao 100M MAU) hoặc **SF3D/SPAR3D** (miễn phí thương mại tới $1M doanh thu/năm — đúng giai đoạn startup nhỏ).

**Tránh:** Free tier Meshy/Tripo cho sản phẩm sẽ bán (CC BY 4.0 công khai, không hợp catalog thương mại riêng); cẩn trọng **TRELLIS.2 nếu dùng bản DINOv3 encoder** (đọc kỹ license trước khi coi là "MIT thuần"); nếu mở rộng EU/UK/Hàn Quốc, **Hunyuan3D Community License không áp dụng ở các khu vực đó.**

---

## 7. Đối thủ cạnh tranh 2025-2026

| Đối thủ | Công nghệ | Tự động/thủ công | Điểm mạnh | Điểm yếu |
|---|---|---|---|---|
| **Wayfair Muse/Decorify** | Generative AI (ảnh 2D) cho web/mobile; bản Vision Pro đặt vật 3D full-scale, anchor sàn. — [Decorify](https://investor.wayfair.com/news/news-details/2023/Wayfair-Launches-Decorify-a-Virtual-Room-Styler-Powered-by-Generative-AI/default.aspx), [Muse](https://www.digitalcommerce360.com/2025/02/11/wayfair-debuts-muse-ai-powered-search-discovery-tool/) | Tự động (AI generate), nhưng trên web/mobile thường chỉ ảnh 2D minh hoạ phong cách, **không phải AR true-to-scale** (trừ Vision Pro) | Trải nghiệm "cảm hứng" mạnh, catalog khổng lồ | Không giải quyết "đặt đúng tỉ lệ vào ảnh phòng thật của tôi" trên đa số thiết bị |
| **Amazon View in Your Room/Rufus** | ARKit/ARCore đặt model 3D vào camera feed trực tiếp; Rufus là AI hỏi-đáp, chưa thấy tích hợp sâu AR room — [TechCrunch](https://techcrunch.com/2020/08/25/amazon-rolls-out-a-new-ar-shopping-feature-for-viewing-multiple-items-at-once/) | Tự động (live AR camera) | Catalog 3D rất lớn, tích hợp sẵn app mua sắm | Yêu cầu live camera tại chỗ (không làm việc trên ảnh đã chụp), không có xoá đồ cũ |
| **Houzz Visualizer** | ARKit (iOS), plane detection tự động, true-to-scale — [Houzz Press](https://www.houzz.com/press/398/Houzz-App-Upgrades-3D-Augmented-Reality-Tool-with-ARKit-to-Help-You-Design-and-Shop) | Tự động (AR live) | Scale chính xác nhờ ARKit, catalog 500k+ | Chỉ tốt trên iOS/ARKit, không xử lý ảnh tĩnh cũ, không xoá đồ hiện có |
| **Roomvo** | Upload 1 ảnh phòng → AI tự đặt/thay sản phẩm, không cần live AR. **5 patent Mỹ** (10,817,648; 11,194,952; 11,200,365; 12,020,311) + patent Canada/EU — [Roomvo blog](https://get.roomvo.com/blog-post-showroom-experience-ar-room-visualizer/) | Tự động, dựa ảnh tĩnh upload — **đối thủ gần nhất với mô hình YourSpace** | Render rất thực, mạnh nhất ngành sàn/gạch/wallpaper, đã có patent portfolio mạnh | Không public pipeline kỹ thuật; **rủi ro pháp lý nếu YourSpace làm compositing quá giống** |
| **Planner 5D (Scan Room)** | Dùng chính Apple RoomPlan nền dưới (bản LiDAR); bản mới 2025-2026 chuyển sang CV server-side không bắt buộc LiDAR, data moat ~130M user — [Planner5D blog](https://planner5d.com/blog/scan-room-the-latest-feature-from-planner-5d/) | Tự động, chuyển dần "cần LiDAR" → "AI suy ra không cần LiDAR" | Data moat khổng lồ, đã chứng minh "camera thường thay LiDAR" khả thi ở scale lớn | Chủ yếu dựng floor plan/thiết kế lại, không phải compositing ảnh thật với occlusion/shadow |
| **Hutch** | CV tự phát hiện cấu trúc phòng từ 1 ảnh, overlay sản phẩm theo tỉ lệ; catalog giới hạn sản phẩm có dimension verified (Wayfair, West Elm, Article) — [Business of Home](https://businessofhome.com/articles/new-hutch-design-app-provides-custom-rendering-and-decor-picks-via-smartphone) | Tự động từ 1 ảnh (gần giống input của YourSpace nhất) | Cross-check kích thước với clearance/trần nhà | Cần đường thẳng dọc rõ, sàn-tường không bị che — tương tự điểm yếu occlusion của YourSpace |
| **Interior AI/RoomGPT/Remodel AI** | SD + ControlNet (giữ cấu trúc không gian khi render lại phong cách) — [genroom.io](https://genroom.io/blog/best-ai-room-design-tools) | Tự động (generative, ảnh mới), không phải AR đặt đúng sản phẩm thật | Nhanh, rẻ, viral tốt | Không bán đúng SKU/kích thước — khác mục tiêu visual-commerce của YourSpace |
| **VN — Space T (spacet.vn)** | Marketplace chủ nhà-designer-nhà thầu, tool 2D/3D online, không AR-first — [spacet.vn](https://spacet.vn/) | Thủ công (người dùng tự vẽ) | Mô hình end-to-end (thiết kế→mua→thi công), đã có traction VN | Khác phân khúc — không phải visual-commerce AR/AI tự động |
| **Homestyler (phổ biến ở VN, không phải startup VN)** | Đặt model 3D nội thất thương hiệu vào ảnh phòng, tỉ lệ đúng (dùng ARKit nền dưới theo mô tả phổ biến) | Tự động (AR) | Phổ biến tại VN | Không có đặc thù compositing-từ-ảnh-tĩnh như YourSpace **[chưa kiểm chứng kỹ thuật chi tiết]** |
| **DecorMatters** | App mới 2025, đặt sản phẩm Amazon/Wayfair/IKEA vào ảnh phòng | **[chưa kiểm chứng cơ chế — AI hay AR-live]** | Catalog đa nguồn | Thông tin kỹ thuật công khai rất ít |

**Không tìm được startup Việt Nam nào làm đúng mô hình "chụp ảnh phòng thật → AI xoá đồ cũ → đặt đồ 3D đúng tỉ lệ, occlusion/shadow thật"** như YourSpace — có thể là khoảng trống thị trường thật, hoặc do search chưa tìm ra startup nhỏ/stealth **[chưa kiểm chứng đầy đủ — nên tự khảo sát thêm qua demo day, Tech in Asia, cộng đồng startup VN]**.

### Khuyến nghị cho YourSpace (Phần 7)
**Tốt nhất + rẻ nhất:** Roomvo và Hutch là đối thủ gần nhất về mô hình kỹ thuật (input = 1 ảnh tĩnh, output = AI đặt sản phẩm đúng tỉ lệ) — nên nghiên cứu UX của 2 app này (không copy kỹ thuật) để rút kinh nghiệm flow. Lợi thế khác biệt khả thi của YourSpace: **tách occlusion (relative depth) khỏi scale (floor plane + camera height)** — hầu như không đối thủ nào công khai làm riêng 2 bước này trên ảnh tĩnh (Houzz/Amazon dựa live AR nên scale tự có từ ARKit; Roomvo/Hutch không công khai pipeline). Không cần build "quét toàn phòng floor plan" ở M1 — Planner 5D đã có data moat 130M user, khó cạnh; tập trung "đặt 1 món đúng chỗ, đúng tỉ lệ, nhìn thật" trên ảnh tĩnh — bài toán hẹp hơn, chưa ai làm tốt ở VN.

**Tránh vì lý do license:** **Tránh implement kỹ thuật trùng khớp với 5 patent Mỹ + patent EU/Canada của Roomvo (Leap Tools Inc.)** về cách AI tự động nhận diện/thay thế vật liệu-sản phẩm trong ảnh phòng true-to-scale — cần review pháp lý riêng trước khi công bố pipeline chi tiết hoặc nộp patent riêng. Đối thủ generative-AI (Interior AI, RoomGPT, Remodel AI) dùng SD derivative + ControlNet mở, không rào cản lớn, nhưng kiểm tra license từng checkpoint SD cụ thể (một số non-commercial).

---

## Tổng hợp khuyến nghị ưu tiên cho YourSpace M1/M2

1. **Scale/horizon tự động:** GeoCalib (Apache-2.0 + CC-BY) thay manual horizon; Depth Anything 3 Metric-Large hoặc Depth Anything V2 Metric Small (cả hai Apache-2.0) server-side qua AIGateway cho metric depth.
2. **Segmentation tự động theo tên vật:** Florence-2 (MIT) hoặc Grounding DINO 1.5 (Apache-2.0) + MobileSAM/EfficientSAM (Apache-2.0).
3. **Erase vật lớn + shadow:** Bria Eraser ($0.04/ảnh) hoặc FLUX Fill Pro API ($0.05/ảnh) cho case khó; giữ LaMa cho vật nhỏ/trung; theo dõi ObjectClear (cần verify license).
4. **Lighting/shadow:** Ambient màu lấy mẫu từ ảnh + baked contact shadow (rẻ, không AI) cho M1; nâng cấp bằng IC-Light V1 (sau khi thay BRIA RMBG→BiRefNet) hoặc DiffusionLight-Turbo chạy 1 lần/ảnh server-side khi cần.
5. **3D asset catalog:** Tripo/Meshy paid tier cho giai đoạn đầu; chuyển sang tự host Hunyuan3D 2.x hoặc SF3D/SPAR3D (miễn phí tới $1M doanh thu/năm) khi scale.
6. **Mobile AR (M2):** ViroReact (MIT, active maintain) cho ARCore Depth/ARKit plane detection.
7. **Tránh toàn bộ:** Depth Pro, UniDepth, DUSt3R/MASt3R, Pi3 weights, SpatialLM, Perspective Fields (đều NC/research-only); YOLO-World (GPL); MAT (NC); tự host FLUX.1-dev/OmniEraser thương mại; ZeroComp/IntrinsicCompositing (NC/academic-only); kỹ thuật trùng patent Roomvo.
