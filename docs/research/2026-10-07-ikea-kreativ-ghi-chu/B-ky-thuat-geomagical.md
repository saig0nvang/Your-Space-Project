# Công nghệ sau IKEA Kreativ — Geomagical Labs

Nghiên cứu sâu, tổng hợp từ bài báo khoa học, patent, trang công ty, tin tuyển dụng. Mọi nhận định suy luận (không có nguồn trực tiếp xác nhận) được đánh dấu **[suy luận]**.

---

## 1. Background công ty / team

- **Geomagical Labs, Inc.** thành lập năm 2016 bởi **Brian Totty** (Founder & CEO). Totty có PhD Computer Science (University of Illinois Urbana-Champaign), MPA Harvard Kennedy School, BS MIT; trước đó là founder của **Inktomi Corp.** (1996, IPO lớn nhất 1998) và **Ludic Labs, Inc.** (2006), từng làm Principal tại Silicon Graphics, Foundation Capital, SVP Engineering tại Groupon (2010-2011). https://www.crunchbase.com/person/brian-totty ; https://www.geomagical.com/about.html
- VP Engineering: **Paul Gauthier** — cũng là co-founder & CTO Inktomi, co-founder Ludic Labs. VP Product: **Phil Guindi** — từng dẫn dắt team Adobe Illustrator và logistics e-commerce tại Shipwire. https://www.geomagical.com/about.html
- Team có khoảng 40% research, 64% quốc tế; trụ sở Mountain View, California (sau đó các job posting ghi "downtown Palo Alto"). https://www.geomagical.com/about.html ; https://www.builtinsf.com/job/senior-applied-researcher-lead-3d-reconstruction-deep-learning/7354944
- **Salma Jiddi** — Head of Research / Research Scientist tại Geomagical từ 03/2019, PhD "Photometric Registration of Indoor Real Scenes using an RGB-D Camera with Application to Mixed Reality" (Technicolor/Irisa Rennes). https://theorg.com/org/geomagical-labs/org-chart/salma-jiddi
- **Konstantinos-Nektarios Lianos** — nghiên cứu room layout estimation, trước đó có bài "VSO: Visual Semantic Odometry" (ETH Zürich). https://demuc.de/papers/lianos2018vso.pdf
- Các tác giả khác xuất hiện lặp lại trên paper + patent: Prakhar Kulshreshtha, Brian Pugh, Qiqin Dai, Angus Dorbie, Luis Puig Morales, Jianfeng Yin, Kevin Wong, Marc Eder, Christopher Sweeney, Javier Civera, Michael Otrada, Ajaykumar Unagar, Akash Garg, Michael Campbell, Benn Herrera, Philip Kuan, Ashkon Nima, Bryan Tyler Parker.

### Acquisition

- **Ingka Investments** (nhánh đầu tư của **Ingka Group** — nhà bán lẻ IKEA lớn nhất, vận hành 380+ store ở 30 nước) mua lại 100% Geomagical Labs, công bố **2/4/2020**. Geomagical tiếp tục hoạt động như một **subsidiary độc lập**, vẫn ở Mountain View, CA. https://news.cision.com/ingka-group/r/ingka-group-acquires-geomagical-labs,c3353108 ; https://www.ingka.com/newsroom/ingka-group-acquires-geomagical-labs/
- Mục tiêu công bố: dùng công nghệ 3D/visual-AI của Geomagical để khách hàng dễ dàng chụp và "furnish" nhà bằng hình ảnh 3D photorealistic sản phẩm IKEA. https://www.ikea.com/us/en/newsroom/corporate-news/ikea-launches-new-ai-powered-digital-experience-empowering-customers-to-create-lifelike-room-designs-pub58c94890/

### Sản phẩm ra mắt — IKEA Kreativ

- IKEA Kreativ ra mắt công khai **6/2022** (TechCrunch đưa tin 22/6/2022), gồm **Scene Scanner** (quét phòng thật thành bản sao 3D editable trong IKEA App), kết hợp spatial computing, machine learning, 3D mixed-reality. https://techcrunch.com/2022/06/22/ikea-rolls-out-an-ai-powered-interactive-design-experience-for-shoppers/ ; https://www.ingka.com/newsroom/ikea-launches-new-ai-powered-experience-empowering-customers-to-create-lifelike-room-designs/
- Mô tả chính thức: "AI neural networks trained to recognize objects and geometry of indoor spaces, stereo vision algorithms, và computational photography algorithms". https://www.ingka.com/newsroom/ikea-launches-new-ai-powered-experience-empowering-customers-to-create-lifelike-room-designs/

### Tình trạng hiện tại (2025-2026) / stack lộ qua tin tuyển dụng

- Tính đến 2025-2026 Geomagical Labs vẫn tuyển dụng tích cực dưới tên riêng, mô tả là "3D R&D lab in partnership with IKEA" phục vụ "hundreds of millions / tens of millions of users". https://www.builtinsf.com/job/senior-applied-researcher-lead-3d-reconstruction-deep-learning/7354944 ; https://builtin.com/job/platform-engineering-lead-ikea-kreativ-3d-ai-app/7354950
- **Stack lộ qua JD "Senior Applied Researcher & Lead – 3D Reconstruction & Deep Learning"** (Palo Alto/remote US-CA, $180K-$250K): PyTorch (framework ML chính), Python, C++ (bonus); các hướng nghiên cứu hiện tại gồm Novel View Synthesis (NeRF/Gaussian Splatting), diffusion models, cộng với kỹ thuật 3D kinh điển SfM/SLAM, Multi-View Stereo, RGB-D Fusion; publication track record kỳ vọng ở CVPR/ECCV/ICCV/SIGGRAPH/ISMAR/NeurIPS. https://www.builtinsf.com/job/senior-applied-researcher-lead-3d-reconstruction-deep-learning/7354944
- **Stack lộ qua JD "Platform Engineering Lead (IKEA Kreativ 3D AI app)"** ($195K-$260K, bị gỡ 30/1/2026): **Google Cloud Platform** là cloud chính, **Kubernetes** + **Docker** để deploy/scale, **Terraform hoặc Pulumi** (Infrastructure-as-Code), **PostgreSQL**, Python (data I/O + Django UI nội bộ), team backend 3-5 người vận hành product catalog, search, identity, 3D assets, room models, "AI pipelines", "cloud auto-scaling infrastructure", MLOps, vận hành 24/7 cho "tens of millions of users a year". https://builtin.com/job/platform-engineering-lead-ikea-kreativ-3d-ai-app/7354950
- **Senior Computer Vision Engineer** (remote, $170K-$200K): yêu cầu Python mạnh, thuật toán CV cổ điển + tích hợp neural network vision, xây hệ thống/pipeline resilient, low-latency. https://himalayas.app/companies/geomagical-labs/jobs/senior-computer-vision-engineer

---

## 2. Research papers

### 2.1 arXiv 2210.15796 — "Layout Aware Inpainting for Automated Furniture Removal in Indoor Scenes"

- Tác giả: **Prakhar Kulshreshtha, Konstantinos-Nektarios Lianos, Brian Pugh, Salma Jiddi** (Geomagical Labs). Nộp 27/10/2022, 6 trang 10 hình, cs.CV. https://arxiv.org/abs/2210.15796
- **Bài toán**: phát hiện và "xoá" đồ nội thất khỏi ảnh góc rộng của phòng; inpaint vùng lớn thường gây mất nhất quán hình học (geometric inconsistency) ở background. https://arxiv.org/abs/2210.15796
- **Pipeline** (từ bản HTML full text): Input Processor tạo segmentation map (dùng các mô hình instance segmentation tham khảo [43],[4],[12],[8]) + room layout qua **PlaneRCNN** [22] → union toàn bộ object mask thành inpainting mask → **per-plane inpainting**: mỗi mặt phẳng tường/sàn được **rectify về fronto-parallel** theo phương trình mặt phẳng 3D, resize theo độ phân giải train gốc của mạng inpaint, rồi dùng **LaMa** (Fourier-convolution inpainting, [32]) để inpaint riêng từng mặt phẳng → **texture refinement** 2 giai đoạn (fine-tune lại mạng + tối ưu feature-map theo histogram loss) để chống artefact "gray texture" (do train trên Places2) → forward-pass cuối để lấp phần không phẳng (non-planar). https://arxiv.org/html/2210.15796
- **Dataset train**: khoảng **1 triệu ảnh**, gộp từ SUN-RGBD, Diode, Unsplash, Hypersim, OpenImages, Google-Landmark + ảnh phòng thật/synthetic tự thu thập; lịch train: 600k iteration trên toàn bộ dataset rồi transfer 300k iteration nữa chỉ trên indoor scenes. https://arxiv.org/html/2210.15796
- **Eval set**: 229 lượt capture phòng trống (empty room) với mask đồ nội thất "ảo" làm ground-truth.
- **Kết quả** (bảng ablation, test ảnh phòng trống + mask virtual furniture):

| Method | LPIPS↓ | Incoherence↓ | PSNR↑ |
|---|---|---|---|
| PatchMatch+P | 0.4329 | 0.0203 | 17.001 |
| LaMa | 0.3715 | 0.0121 | 20.033 |
| LaMa+P (per-plane) | 0.3115 | 0.0063 | 20.689 |
| **LaMa+P+R (full, có refinement) — của paper** | **0.2858** | **0.0036** | **21.141** |

Nguồn: https://arxiv.org/html/2210.15796 — "Incoherence" là **metric tự đề xuất** = trung bình xác suất edge trên toàn ảnh, đo "false edge" do inpaint sinh ra.
- **Giới hạn tự nhận**: mask đồ nội thất "ảo" trong test set không đổ bóng, không chặn ánh sáng (cửa sổ/đèn) → chưa đánh giá được shadow/relighting; hệ thống **giả định segmentation + layout đầu vào là hoàn hảo**, lỗi ở input processor sẽ lan sang; phần không phẳng (non-planar) xử lý tách biệt kém chặt hơn phần phẳng. https://arxiv.org/html/2210.15796
- Không đề cập trực tiếp tích hợp IKEA Kreativ hay yêu cầu thời gian thực trong paper, nhưng có demo "Furniture Eraser application" cho phép click để xoá object và đặt đồ ảo thay thế (trình bày lại tại workshop ISMAR 2022, xem mục dưới). https://arxiv.org/html/2210.15796

### 2.2 arXiv 2206.13644 — "Feature Refinement to Improve High Resolution Image Inpainting"

- Tác giả: **Prakhar Kulshreshtha, Brian Pugh, Salma Jiddi** (Geomagical Labs). Nộp 27/6/2022, công bố ở **CVPR Workshop on Computer Vision for Augmented and Virtual Reality 2022** (New Orleans). https://arxiv.org/abs/2206.13644
- **Vấn đề**: mạng inpainting (LaMa) train ở resolution thấp (512px) không sinh ra cấu trúc global-coherent khi test ở resolution cao hơn (1024px, 2k) vì receptive field tĩnh. https://huggingface.co/papers/2206.13644
- **Phương pháp**: tối ưu **feature map trung gian** của **Big-LaMa** tại inference-time (không train lại mạng) bằng **multiscale consistency loss**: dựng image pyramid (hệ số downscale 2x, scale nhỏ nhất ≈ resolution train), ở mỗi scale downscale output (Gaussian filter + bilinear) để so khớp L1 với kết quả scale thấp hơn liền trước; mỗi scale chạy **15 iteration refinement** bằng **Adam, learning rate 0.002**; mask bị **erode bằng kernel tròn 15px** để tránh tối ưu nhầm vùng mỏng vốn đã tốt. Mạng được chia encoder ("front")/decoder ("rear"), chỉ feature-map đầu ra của phần downscaler được optimize. https://arxiv.org/html/2206.13644
- **Kết quả** (Unsplash 1024×1024, FID / LPIPS):

| Method | Thin brush | Medium brush | Thick brush |
|---|---|---|---|
| Big-LaMa | 13.143 / 0.114 | 21.169 / 0.116 | 29.022 / 0.140 |
| **Big-LaMa + Refinement (ours)** | 13.193 / 0.112 | **19.864 / 0.115** | **26.401 / 0.135** |

Nguồn: https://arxiv.org/html/2206.13644 — cải thiện rõ ở mask medium/thick, mask mỏng gần như không đổi (đã có đủ context xung quanh).
- **Chi phí tính toán**: **4.56 giây/ảnh** so với **0.26 giây** của Big-LaMa gốc, trên **NVIDIA RTX A5000**; do phải giữ gradient ở runtime nên tốn nhiều memory hơn, giới hạn resolution tối đa xử lý được — tác giả tự nhận đây là overhead đáng kể. https://arxiv.org/html/2206.13644
- Code public: **https://github.com/geomagical/lama-with-refiner** (fork của advimman/lama, có nhánh `amp_float16` tối ưu GPU; cũng được PR ngược vào repo gốc advimman/lama #112). https://github.com/geomagical/lama-with-refiner ; https://github.com/advimman/lama/pull/112
- Paper không nêu rõ việc triển khai production/IKEA, chỉ nói ứng dụng chung "image restoration, image editing, AR, Diminished Reality". https://arxiv.org/html/2206.13644

### 2.3 ISMAR 2022 Workshop "Inpainting Techniques for Object Removal in Indoor Scenes" (21/10/2022, Singapore time 4-7pm)

- Do Geomagical Labs tổ chức/đồng tổ chức; coi việc "xoá object khỏi scene" cần 3 trụ: **room layout estimation, image inpainting, shadow removal** (+ geometry completion, texture synthesis, loại bỏ hiệu ứng ánh sáng). https://www.geomagical.com/ismar2022-workshop.html
- Diễn giả Geomagical: **Prakhar Kulshreshtha** (RGB inpainting cho indoor scenes, demo "Furniture Eraser application"); **Nektarios Lianos** (room layout estimation từ ảnh perspective + photogrammetry); **Salma Jiddi** (shadow removal cho diminished reality). Diễn giả ngoài: Shohei Mori (Graz, diminished reality không dùng neural network), Dimitrios Zarpalas & Vasileios Gkitsas (CERTH, diminished reality cho panorama hình cầu). https://www.geomagical.com/ismar2022-workshop.html
- Bài liên quan trình bày cùng dịp (poster ISMAR 2022): **"Robust Planar Optimization for General 3D Room Layout Estimation"** — tác giả **Konstantinos-Nektarios Lianos, Luis Puig, Ajaykumar Unagar, Salma Jiddi** (đều Geomagical). Phương pháp 2 giai đoạn: segment layout plane ban đầu → optimization với connectivity constraint + Manhattan-world assumption, nhằm mô hình hoá room geometry **phức tạp/non-Manhattan** mà các phương pháp trước (giả định phòng hình hộp chữ nhật) không xử lý được. https://aunagar.github.io/publication/ismar20223dv/

### 2.4 Không tìm thấy

- Không tìm thấy paper CVPR/ICCV/SIGGRAPH chính thức nào do Geomagical Labs là tác giả ngoài 2 arXiv paper + poster ISMAR trên (paper "Semantically supervised appearance decomposition for virtual staging from a single panorama" SIGGRAPH 2022 là của **Carnegie Mellon + Zillow Group** — KHÔNG liên quan Geomagical, dù chủ đề trùng "virtual staging". https://arxiv.org/abs/2205.13150). **[suy luận]** Có thể nhóm Geomagical publish ít, chủ yếu giữ kỹ thuật dưới dạng patent nội bộ + 2 paper workshop/arXiv nói trên.

---

## 3. Patents

Tất cả cùng một "họ" patent lõi quay quanh application gốc **16/823,123** (nộp 18/3/2019) của Brian Totty et al., được publish/issue lại nhiều lần dưới các số khác nhau (continuation), cộng thêm nhóm patent mới (2023-2026) về room-layout/room-reconstruction riêng.

### US11170569B2 — "System and method for virtual modeling of indoor scenes from imagery"
- Inventors: Brian Totty, Kevin Wong, Jianfeng Yin, Luis Puig Morales, Paul Gauthier, Salma Jiddi, Qiqin Dai, Brian Pugh, Konstantinos Nektarios Lianos, Angus Dorbie, Yacine Alami, Marc Eder, Christopher Sweeney, Javier Civera. Assignee Geomagical Labs. Filed 18/3/2019, published 9/11/2021. https://patents.google.com/patent/US11170569B2/en
- **Vấn đề**: 3D reconstruction cổ điển fail trong nhà vì thiếu sáng (noise/blur), thiếu texture đặc trưng để match keypoint, không phát hiện được mặt phẳng ít-texture (tường/sàn/trần), và buộc user phải ở tại phòng để dùng model.
- **Pipeline 6 bước**: (S100) Scene Capture — thu ảnh/metadata từ các vị trí định trước, có SLAM dẫn hướng; (S200) Low-Level Information — SLAM + Structure-from-Motion + Multi-View Stereo cho nhiều representation hình học dư thừa; (S300) Virtual Scene Generation — stitch thành panorama photorealistic, align camera pose, tạo depth map theo hệ toạ độ panorama; (S400) High-Level Scene Understanding — detect edge kiến trúc, semantic segmentation, surface normal, depth map thô từ monocular network; (S500) Scene Refinement — tổng hợp nhiều nguồn qua network được "bias" theo prior tường/sàn đã detect, refine mask, enhance occlusion edge, xác định mặt phẳng tường chính xác, scale về đơn vị mét bằng vật tham chiếu/SLAM; (S600) Model Transmission — đóng gói panorama + depth + plane equation + mask + lighting params gửi cho client. https://patents.google.com/patent/US11170569B2/en
- **Claim 1** (diễn giải): method capture scene data từ các vantage point định trước → xác định low-level info (geometric feature) → sinh virtual scene representation → xác định high-level info (context-aware) → xác định refined info (tổng hợp nhiều nguồn) → transmit virtual model tới user device.

### US11721067B2 — cùng tiêu đề, continuation
- Cùng inventor list. Filed (continuation) 29/9/2021, priority 18/3/2019, published 8/8/2023. https://patents.google.com/patent/US11721067B2/en
- **Vấn đề nêu rõ hơn**: quy trình thủ công tạo model nhà truyền thống tốn **hàng ngày đến hàng tuần**; mục tiêu là tự động hoá nhanh, không cần hardware chuyên dụng, model phải **scale theo đơn vị mét** và dùng lại được trên nhiều device/vị trí khác lần capture.
- **Chi tiết pipeline bổ sung** so với '569: Phase S100 nêu cụ thể capture **video quét phòng + ảnh tĩnh từ nhiều vị trí + có thể capture thêm vị trí thứ hai**, upload lên "remote platform"; Phase S400 có detect **vanishing point**, nhận diện "object kích thước đã biết" để làm scale reference; Phase S500 có **xác định floor plane bằng point-consensus (RANSAC-like)**, **estimate lighting parameters (vị trí nguồn sáng, cường độ, màu)**, và **fuse theo kiểu piecewise** các representation khác nhau vào 1 model cuối. https://patents.google.com/patent/US11721067B2/en
- Claim mở rộng nhấn mạnh: (a) sinh **nhiều dense depth map** bằng cách "bias" network khác nhau với scene prior khác nhau, (b) hệ thống có nhiều "engine" (SLAM, photogrammetry, ML, lighting estimation) điều phối cùng nhau, (c) VSVR-aligned depth cho mỗi pixel + refined mask + plane + lighting, (d) **fusion piecewise** nhiều geometric representation thành 1 model cuối.

### US11367250B2 — "Virtual interaction with three-dimensional indoor room imagery"
- Inventors: Brian Totty, Yacine Alami, Michael Otrada, Qing Guo, Hai Shang, Aaron Shea, Philip Guindi, Paul Gauthier, Jianfeng Yin, Kevin Wong, Angus Dorbie. Assignee Geomagical Labs. Filed 18/3/2020, priority 18/3/2019, published 21/6/2022, hết hạn dự kiến 18/3/2040. https://patents.google.com/patent/US11367250B2/en
- **Vấn đề kinh doanh**: khách hàng home-décor e-commerce không tự tin đồ có "fit" không gian/aesthetic → return cao; AR hiện có giới hạn: phải đứng tại phòng thật, FOV hẹp kiểu "porthole".
- **Pipeline**: (S100-200) capture ảnh/video + IMU/depth → sinh **virtual room model** + **Virtual Room Visual Representation (VRVR)** qua panorama stitching rộng-FOV; (S300) trích "room feature" (geometry, lighting, object hiện có, style) → **deliver incremental** cho client, bắt đầu bằng bản chất lượng thấp để tương tác ngay; (S400) user chọn virtual object (catalog/ảnh/QR/gợi ý tự động) → hệ thống xác định **vị trí đặt hợp lệ theo rule thiết kế + constraint vật lý**; (S500-600) render warping/shading theo hình học + ánh sáng phòng, xử lý occlusion/shadow/harmonize ánh sáng; (S700) update model theo feedback user. https://patents.google.com/patent/US11367250B2/en
- Claim 1: method sinh visual scene representation + virtual room model gắn với nó → gửi cho user device → nhận lựa chọn virtual object + vị trí → render object tại vị trí đó dựa trên virtual room model → trả về ảnh render cuối để hiển thị.
- Nhấn mạnh kỹ thuật: panorama stitching chịu parallax cho ảnh indoor dễ xoay; rendering progressive/incremental theo chất lượng ánh sáng; "harmonization" là thuật ngữ patent dùng cho việc khớp ánh sáng/bóng/noise của vật thể ảo với đặc tính ảnh phòng thật. https://patents.google.com/patent/US11367250B2/en

### US12182938B2 — cùng family '569/'067, continuation mới hơn
- Cùng inventor list ('569/'067). Filed 16/6/2023, priority 18/3/2019, published 31/12/2024. https://patents.google.com/patent/US12182938B2/en
- Nội dung pipeline S100-S600 lặp lại gần như '067 (xem trên) — xác nhận đây là một họ claim được tiếp tục bảo vệ/mở rộng qua nhiều năm từ cùng 1 phát minh gốc 2019.

### US20200302686A1 — bản publication gốc (application) của family trên
- Filed 18/3/2020, priority 18/3/2019, published 24/9/2020 — chính là **bản mô tả chi tiết nhất** tìm được của pipeline, với các mã bước con cụ thể: S410 (perceptual edges), S420 (semantic segmentation per-pixel), S430 (monocular depth), S440 (surface normal); S510/S560 (**RANSAC detect floor/wall plane, constrained bởi gravity vector + surface normal**), S520 (prior-biased depth network theo từng component), S530 (refine segmentation mask theo geometry consistency), S550 (**guided filtering để giữ occlusion edge**), S570 (metric scaling qua SLAM alignment hoặc known-object reference), S580 (**lighting estimation từ độ sáng ảnh + vùng semantic**). https://patents.google.com/patent/US20200302686A1/en
- Đây là nguồn rõ nhất cho thấy **RANSAC + gravity vector** được dùng để tách mặt phẳng tường/sàn, và **guided filter** để giữ biên occlusion sắc nét — khớp với nguyên tắc "tách occlusion khỏi scale" mà nhiều hệ compositing AR theo đuổi.

### US20230419526A1 — "Method, apparatus, and computer-readable medium for room layout extraction"
- Inventors: Konstantinos Nektarios Lianos, Prakhar Kulshreshtha, Brian Pugh, Luis Puig Morales, Ajaykumar Unagar, Michael Otrada, Angus Dorbie, Benn Herrera, Patrick Rutkowski, Qing Guo, Jordan Braun, Paul Gauthier, Philip Guindi, Salma Jiddi, Brian Totty. Filed 22/6/2023, published 28/12/2023. https://patents.google.com/patent/US20230419526A1/en
- **Vấn đề**: hệ layout-estimation cũ chỉ dùng ảnh RGB, bỏ qua gravity vector/depth, giả định sai về wall-connectivity và ceiling hình chữ nhật, không xử lý được occlusion do đồ nội thất/kiến trúc (arch, baseboard).
- **Pipeline**: trích scene prior (semantic map, edge map, depth map, **photogrammetry point**, normal map) → tính **vanishing point** từ đường ngang + gravity vector để định hướng mặt phẳng → detect **wall-wall connectivity** (seam dọc, validate bằng normal map + junction analysis) → đưa **photogrammetry point cloud** vào optimization để constrain vị trí mặt phẳng → hỗ trợ **non-Manhattan geometry** (mặt cong, kiến trúc phức tạp) bằng phương trình mặt phẳng linh hoạt thay vì giả định hình hộp → tối ưu non-linear cân bằng connectivity loss, depth alignment, orientation constraint, semantic-occlusion handling. https://patents.google.com/patent/US20230419526A1/en
- Patent này chính là bản "full" hoá poster ISMAR 2022 "Robust Planar Optimization for General 3D Room Layout Estimation" nói ở mục 2.3.

### US12272085B2 — "Method and system for scene image modification"
- Inventors: Brian Pugh, Angus Dorbie, Salma Jiddi, Qiqin Dai, Paul Gauthier, Marc Eder, Jianfeng Yin, Luis Puig Morales, Michael Otrada, Konstantinos Nektarios Lianos, Philip Guindi, Brian Totty. Filed 20/6/2023, priority 12/11/2019, published 8/4/2025. https://patents.google.com/patent/US12272085B2/en
- **Vấn đề**: depth estimate noisy + object boundary không chính xác → occlusion giữa vật ảo/thật không thuyết phục trong mixed-reality.
- **Pipeline 7 bước**: (S100) thu nhiều ảnh + metadata camera/sensor; (S200) trích feature 2D/3D (keypoint, edge, depth); (S300) rectify + stitch panorama (warp hình học + blend); (S400) **Dense Geometry Estimation** — ước lượng object boundary, semantic segmentation, dense depth map, metric scale, detect horizontal plane, **regularize geometry**, enhance segmentation; (S500) **Occlusion Data Computation** — tính connected component, **regularize depth tại object edge**, lưu occlusion mask; (S600) Interactive Rendering — render có occlusion theo depth, dùng graphics-engine plugin/custom shader; (S700) Scene Modification — user đặt vật ảo + xoá vật thật, "context-aware filling". https://patents.google.com/patent/US12272085B2/en
- Đây là patent mô tả rõ nhất cơ chế **occlusion dựa trên depth + segmentation với custom shader**, hỗ trợ cả desktop và mobile.

### US20260030885A1 — "Method, apparatus, and computer-readable medium for room reconstruction" (MỚI, 2025-2026)
- Inventors: Konstantinos Nektarios Lianos, Prakhar Kulshreshtha, Salma Jiddi, Ajaykumar Unagar, Akash Garg, Michael Campbell, Philip Guindi, Benn Herrera, Philip Kuan, Ashkon Nima, Bryan Tyler Parker, Brian Totty. Filed **24/7/2025**, published **29/1/2026** (patent application này đã có thật, publish ngay trước "hôm nay" 7/10/2026 — là patent **mới nhất** tìm được). https://patents.google.com/patent/US20260030885A1/en
- Đây rõ ràng là **thế hệ pipeline mới nhất**, đi xa hơn các patent 2019-2023 nhiều: không chỉ depth/segmentation/mesh thô, mà tạo **parametric 3D model đầy đủ vật liệu + ánh sáng ("digital twin")**.
- **Pipeline 2 giai đoạn**:
  1. *Parametric Model Creation*: capture ảnh/sensor (accelerometer, LiDAR, depth sensor optional) → chọn frame chất lượng cao + trích **perceptual parameters** (depth map, semantic map, gravity vector, edge map, normal map, instance mask, **shadow mask**, camera pose) → **Architectural Layout Estimation**: dựng 3D semantic reconstruction rồi project xuống **floorplan view (top-down)** bằng deep learning + layout-fitting cổ điển → nhận diện **built-in element** (cửa, cửa sổ, chân tường) qua semantic reconstruction + bounding volume → nhận diện **movable furniture** bằng **3D instance segmentation** (tách khỏi kiến trúc) → refine parametric model: chèn core element, extrude wall plane, update ceiling geometry.
  2. *Architectural Embellishment*: thay bounding-box built-in element bằng 3D model độ chi tiết cao qua **CLIP embedding matching** vào database; sinh **proxy furniture** bằng vector-embedding search hoặc **shape-completion network**; **Material Estimation** — phân loại vật liệu (sơn, gỗ, carpet, tile, marble, kính) và gán **PBR (physically-based rendering) material**, hiệu chỉnh màu/bù ánh sáng; **Illumination Setup** — model nguồn sáng trong phòng, calibrate "studio lighting" (point/spot/area light), sinh environment map; **3D rendering** cuối cùng ghép model + material + lighting thành digital twin tương tác. https://patents.google.com/patent/US20260030885A1/en
- **Mạng/kỹ thuật được nêu tên**: **CLIP** (match asset architecture), **Semantic Segmentation Network** (baseboard/moulding), **Multimodal LLM** (phân tích thuộc tính baseboard), 3D segmentation network (furniture instance), material-estimation network có **majority voting qua nhiều frame**.
- Patent này **trích dẫn trực tiếp** application 18/213,115 (= US20230419526A1, layout extraction) là nguồn cho phần layout refinement/prior — xác nhận các patent liên kết chuỗi, pipeline hiện tại = layout patent (2023) + room-reconstruction patent (2025) nối tiếp nhau.
- Claim 1 (abstract, verbatim ý chính): lưu parametric model của phòng (sinh từ perceptual parameter + architectural layout) → augment bằng cách nhận diện architectural element và thay bằng architectural model tương ứng → gán material cho surface dựa trên perceptual parameter → xác định lighting setup dựa trên perceptual parameter → render 3D model dựa trên parametric model + material + lighting.

### Patent khác không kiểm chứng được / không tìm thấy nguyên bản
- Có patent liên quan **US12271994** ("Virtual interaction with three-dimensional indoor room imagery", filed 18/6/2022, granted 8/4/2025) và **US12272085** — 2 patent cùng ngày issue, cho thấy USPTO cấp 1 loạt continuation cùng lúc đầu 4/2025. Nguồn liệt kê (chưa fetch full-text riêng, chỉ có từ danh sách Justia): https://patents.justia.com/assignee/geomagical-labs-inc (trang này trả 403 khi fetch trực tiếp, thông tin lấy qua WebSearch snippet).

---

## 4. Pipeline end-to-end tái dựng (tổng hợp từ paper + patent)

**[Phần này là tổng hợp/diễn giải kết hợp nhiều nguồn ở trên — các bước cụ thể đã có nguồn riêng ở mục 2-3; phần kết nối thành luồng duy nhất mang tính suy luận ở mức tổ chức, đánh dấu [suy luận] khi không có câu trích trực tiếp nào nói "đây là đúng thứ tự production dùng".]**

1. **Capture**: multi-image (ảnh tĩnh nhiều vị trí + video quét) + metadata cảm biến — IMU/gravity, SLAM points, camera pose, optional LiDAR/depth sensor. Có SLAM-guided capture (hướng dẫn user di chuyển camera đúng pattern). Nguồn: US11721067B2, US20260030885A1.
2. **Camera intrinsics/extrinsics & pose**: suy ra qua SLAM + Structure-from-Motion + Multi-View Stereo (classical photogrammetry), tạo ra "nhiều representation hình học dư thừa" để sau đó fuse. Nguồn: US11170569B2, US11721067B2.
3. **Metric scale**: gắn vào qua 2 đường — SLAM/IMU alignment, hoặc **vật thể kích thước đã biết (known-object reference)** làm thước đo. Nguồn: US11721067B2, US20200302686A1.
4. **Virtual Scene Visual Representation (VSVR)**: panorama photorealistic ghép từ nhiều ảnh (stitching chịu parallax), là "mặt phẳng tham chiếu" để mọi depth/segmentation/mask align vào. Nguồn: US11170569B2, US11367250B2.
5. **Layout tường/sàn/trần**: ban đầu PlaneRCNN (paper 2022) → sau đó thay bằng pipeline nội bộ riêng: vanishing point (từ gravity vector) + wall-wall connectivity + photogrammetry point + RANSAC (constrained bởi gravity) → tối ưu non-linear hỗ trợ **non-Manhattan** (US20230419526A1, US20200302686A1). Đây khớp với mô tả "PlaneRCNN?" trong yêu cầu — **xác nhận**: paper 2210.15796 dùng PlaneRCNN, nhưng patent layout riêng (2023) mô tả một hệ **tự phát triển khác**, không nêu tên PlaneRCNN — **[suy luận]** PlaneRCNN có thể chỉ là baseline/giai đoạn đầu, sau đó Geomagical tự phát triển "Robust Planar Optimization" thay thế.
6. **Dense depth**: kết hợp depth sensor (nếu có) + monocular depth network, sau đó depth được "bias" bởi scene prior (mặt phẳng đã detect) để sinh nhiều depth map theo từng component rồi fuse kiểu piecewise. Nguồn: US11721067B2, US20200302686A1.
7. **Semantic segmentation** độ phân giải cao: phân loại pixel (tường/sàn/đồ vật), refine bằng geometry consistency, enhance occlusion edge bằng **guided filtering**. Nguồn: US20200302686A1, US12272085B2.
8. **Object/furniture erasure**: union mask các object cần xoá → rectify mặt phẳng chứa object về fronto-parallel → inpaint per-plane bằng **LaMa** (Fourier conv) đã fine-tune trên ~1M ảnh phòng → refine texture (histogram loss) → xử lý phần non-planar riêng. Khi cần resolution cao hơn train-res, dùng **feature-refinement multiscale** (paper 2206.13644) để tránh mất coherence ở ảnh lớn (2k). Nguồn: arXiv 2210.15796, arXiv 2206.13644.
9. **Shadow removal**: trình bày riêng tại ISMAR 2022 bởi Salma Jiddi (không có paper/patent public chi tiết tìm được — chỉ có workshop slide). Nguồn: https://www.geomagical.com/ismar2022-workshop.html.
10. **Lighting estimation**: ước lượng nguồn sáng (vị trí, cường độ, màu) từ độ sáng ảnh + vùng semantic (US11721067B2, US20200302686A1); ở patent mới nhất (2026) mở rộng thành "Illumination Setup" đầy đủ — point/spot/area light + environment map, phục vụ **PBR rendering** vật liệu thật. Nguồn: US20260030885A1.
11. **Occlusion vật ảo-vật thật**: dùng depth + segmentation mask, regularize depth tại biên object, custom shader để vật ảo bị che đúng bởi vật thật gần camera hơn. Nguồn: US12272085B2.
12. **Rendering/compositing**: ban đầu (patent 2019-2022) là render warp/shade vật ảo lên panorama 2.5D (không nói rõ engine, không thấy nhắc glTF/WebGL trực tiếp trong các patent đã đọc — **[suy luận]** vì stack web dùng Python/Django + "3D assets" trong JD Platform Engineering, nhiều khả năng client render bằng WebGL/three.js hoặc tương tự, nhưng **không có nguồn xác nhận trực tiếp định dạng asset (glTF) hay engine cụ thể**). Ở patent 2026 mới, pipeline tạo hẳn **parametric 3D model + PBR material** → "digital twin" render tương tác, gần với một mesh/scene-graph đầy đủ hơn là chỉ ảnh 2.5D composite. Nguồn: US20260030885A1.
13. **Cloud/vận hành**: xử lý nặng (AI pipeline, 3D reconstruction) chạy trên **Google Cloud Platform**, orchestrate bằng **Kubernetes/Docker**, IaC bằng **Terraform/Pulumi**, dữ liệu catalog/identity/3D asset/room-model lưu **PostgreSQL**, phục vụ "tens of millions of users/year", vận hành 24/7 với auto-scaling. Nguồn: https://builtin.com/job/platform-engineering-lead-ikea-kreativ-3d-ai-app/7354950. Không có số liệu công khai về **processing time** từ capture đến model sẵn sàng cho người dùng (**[suy luận]** dựa trên UX "incremental delivery" mô tả ở US11367250B2 — hệ thống gửi bản chất lượng thấp trước rồi nâng cấp dần, gợi ý thời gian xử lý đầy đủ không tức thời, có thể vài chục giây đến vài phút, nhưng không có số cụ thể nào được công bố).

---

## 5. Số liệu chính xác & giới hạn đã công bố

### Từ paper (có số liệu cụ thể, đáng tin nhất vì peer-reviewed workshop)
- Furniture-removal inpainting (LaMa+P+R, mô hình đầy đủ): **LPIPS 0.2858, Incoherence 0.0036, PSNR 21.141** trên test 229 ảnh phòng trống + mask ảo — tốt hơn LaMa gốc (LPIPS 0.3715) và PatchMatch (LPIPS 0.4329). https://arxiv.org/html/2210.15796
- Feature-refinement cho inpaint resolution cao: cải thiện FID từ 29.022→26.401 (thick mask, 1024px) nhưng **tốn 4.56s/ảnh so với 0.26s** baseline (RTX A5000) — tức **~17x chậm hơn**, giới hạn rõ việc dùng trực tiếp trong pipeline thời gian thực. https://arxiv.org/html/2206.13644
- Giới hạn tự nhận quan trọng nhất của paper furniture-removal: **test set không có shadow/relighting thật** (mask ảo không đổ bóng/không chặn sáng) → chưa đánh giá được trường hợp khó nhất trong thực tế là xoá đồ có bóng đổ rõ hoặc đồ chặn nguồn sáng (cửa sổ/đèn). https://arxiv.org/html/2210.15796
- Giới hạn kiến trúc: hệ thống giả định **segmentation + room layout đầu vào đã đúng** — bài báo chỉ tối ưu riêng phần inpainting, không đánh giá lỗi lan truyền từ layout/segmentation sai. https://arxiv.org/html/2210.15796

### Từ sản phẩm thật (IKEA Kreativ) — số liệu marketing, độ tin cậy thấp hơn paper
- Một bài review bên thứ ba ghi "khoảng **97% accuracy** khi quét kích thước phòng qua app nếu theo đúng best practice", showroom offline "100% accuracy" — đây là số liệu từ trang review/marketing (toolworthy.ai), **không có nguồn chính thức IKEA xác nhận số 97%** nên cần xem là **chưa được kiểm chứng độc lập**. https://www.toolworthy.ai/tool/ikea-home-design
- Giới hạn người dùng thực tế được báo cáo: lỗi scan không có thông báo nguyên nhân cụ thể; **không có công cụ đo đạc / undo-redo** nên user không tự kiểm tra được scale/khoảng cách; độ chính xác phụ thuộc camera + điều kiện ánh sáng thiết bị; trải nghiệm "chưa phản ánh đầy đủ chuyên môn thiết kế nội thất của IKEA". https://www.ixd.prattsi.org/2024/02/design-critique-ikea-kreativ-ios-app/ ; nguồn tổng hợp qua WebSearch (medium.com/@nawarat.eriksson/ai-feature-improvement-for-ikea-kreativ).

### Giới hạn chung rút ra [suy luận tổng hợp]
- Khoảng cách giữa paper (2022, peer-review, số liệu rõ) và sản phẩm thật (JD 2025-2026 vẫn tuyển "Novel View Synthesis/NeRF/Gaussian Splatting/diffusion") cho thấy: **pipeline đã evolve đáng kể từ 2019-2022 (depth+plane+LaMa cổ điển) sang 2025-2026 (parametric model + CLIP + LLM + PBR + có thể NeRF/diffusion)** — tức công nghệ nền 2022 không còn là "trạng thái cuối" mà chỉ là một giai đoạn.
- Chi phí tính toán cao của bước refinement (17x so với baseline) là lý do hợp lý để nghĩ rằng **production không dùng refinement đầy đủ cho mọi ảnh real-time**, mà có thể giới hạn theo ngân sách GPU/latency — **không có nguồn trực tiếp xác nhận** Geomagical có áp dụng refinement này trong IKEA Kreativ production hay chỉ dùng cho nghiên cứu.

---

## Danh sách nguồn chính (tổng hợp)

- https://news.cision.com/ingka-group/r/ingka-group-acquires-geomagical-labs,c3353108
- https://www.ingka.com/newsroom/ingka-group-acquires-geomagical-labs/
- https://www.ingka.com/newsroom/ikea-launches-new-ai-powered-experience-empowering-customers-to-create-lifelike-room-designs/
- https://techcrunch.com/2022/06/22/ikea-rolls-out-an-ai-powered-interactive-design-experience-for-shoppers/
- https://www.geomagical.com/about.html
- https://www.geomagical.com/ismar2022-workshop.html
- https://arxiv.org/abs/2210.15796 , https://arxiv.org/html/2210.15796
- https://arxiv.org/abs/2206.13644 , https://arxiv.org/html/2206.13644
- https://github.com/geomagical/lama-with-refiner
- https://aunagar.github.io/publication/ismar20223dv/
- https://patents.google.com/patent/US11170569B2/en
- https://patents.google.com/patent/US11721067B2/en
- https://patents.google.com/patent/US11367250B2/en
- https://patents.google.com/patent/US12182938B2/en
- https://patents.google.com/patent/US20200302686A1/en
- https://patents.google.com/patent/US20230419526A1/en
- https://patents.google.com/patent/US12272085B2/en
- https://patents.google.com/patent/US20260030885A1/en
- https://www.builtinsf.com/job/senior-applied-researcher-lead-3d-reconstruction-deep-learning/7354944
- https://builtin.com/job/platform-engineering-lead-ikea-kreativ-3d-ai-app/7354950
- https://himalayas.app/companies/geomagical-labs/jobs/senior-computer-vision-engineer
- https://www.crunchbase.com/person/brian-totty
- https://theorg.com/org/geomagical-labs/org-chart/salma-jiddi
- https://www.ixd.prattsi.org/2024/02/design-critique-ikea-kreativ-ios-app/
- https://www.toolworthy.ai/tool/ikea-home-design
