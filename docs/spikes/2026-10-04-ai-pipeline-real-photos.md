---
derives_from: [D3@7fbc47fb, D3b@4248a41d, D4@bb7f1ffe]
---
# Spike: pipeline AI của YourSpace trên ảnh phòng thật

> Ngày: 2026-10-04 · Branch: `m1-build` · Người làm: Claude (worker Orca) · Trạng thái: **kết quả sơ bộ, chờ founder chấm lại**
> Thư mục làm việc (git ignore): `.agents/spike-ai-real-photos/` — manifest, script, kết quả, `contact_sheet.html`, `README.md` (lệnh chạy lại).
> Liên quan: spec M1 §4, §5, §10 · D3, D3b, D4 · PRD Phụ lục A (F1–F6).

## 1. Kết luận (đọc phần này trước)

Chạy thật SAM ViT-B, LaMa, GeoCalib, Depth Anything V2 Small và code giải camera của `packages/core` trên 22 ảnh phòng (65 món đồ), CPU, **một quy tắc cố định cho mọi ảnh**, không chỉnh tay theo ảnh. Ảnh, món, điểm chạm, điểm sàn, đường chân trời được chốt trong `manifest.json` **trước** khi chạy model.

Ba con số chính:

| Phần | Con số | Thành chức năng thật được không |
|---|---|---|
| 1. Tách đồ khi chạm (SAM ViT-B) | **47,7%** món đạt sau 1 chạm · **69,2%** sau ≤ 2 chạm. Đồ lớn: 36,1% → 61,1% | **Được, nếu đổi cách tương tác.** Không làm được "chạm một lần là xong". Cần: xem trước mask, cho chạm thêm/bớt nhiều lần, chọn mask lớn hơn mặc định. |
| 2. Xóa đồ (LaMa 512, một lượt) | **41,5%** vùng xóa dùng được · **2/22** ảnh sạch cả lượt · LaMa riêng (khi mask đã đạt): 55,6% | **Chưa**, với đồ lớn. Sofa, giường sát tường để lại mảng tối, bóng ma. Đồ nhỏ, nền đơn giản thì được. F3 (hoàn tác / thử vùng nhỏ hơn) sẽ bị gọi khoảng 6/10 lần. |
| 3. Đặt sofa — "tin được" | **A (tự động, GeoCalib): 45,5%** (10/22) · **B (kéo chân trời, `packages/core`): 59,1%** (13/22) | **Dưới ngưỡng 70%** ở cả hai. Nếu chỉ xét hình học (scale, chạm sàn, che khuất), B đạt 72,7%. Phần còn thiếu do ánh sáng (TB 2,86/5) và lỗi xóa còn sót. |

**Khuyến nghị cho decision gate spec M1 §10: FAIL → ship manual-first.** Đặt đồ bằng mặt sàn từ đường chân trời (chế độ B) + raycast + kéo/scale/xoay trục Y + bóng tiếp xúc. AI chỉ làm trợ giúp bật/tắt: GeoCalib điền sẵn đường chân trời để người dùng xác nhận; che khuất bằng depth. Chi tiết ở §9.

Điều kiện đọc đúng các con số trên:

- **Đây là cận trên.** 6/22 ảnh là ảnh chuyên nghiệp (thường đã dựng đứng các đường dọc, ống kính rộng, ánh sáng đẹp). Trên nhóm này, đặt sofa tin được 5/6 (A) và 6/6 (B). Trên 4 ảnh giống ảnh điện thoại thật (r08, r11, r15, r21): **0/4 ở cả hai chế độ**. Trên 5 ảnh thiếu sáng: **0/5**.
- Điểm chạm, đường chân trời, lần chạm sửa do Claude chọn cẩn thận trên lưới toạ độ. Người dùng thật sẽ kém hơn.
- **Mọi điểm chấm là SƠ BỘ do Claude tự chấm bằng mắt.** Người chọn điểm cũng là người chấm, nên có rủi ro thiên lệch. Founder cần chấm lại trên contact sheet.
- Chưa có ảnh phòng Việt Nam thật chụp bằng điện thoại. Chỉ r07 (nguồn ghi Việt Nam, nghi là ảnh render) và r14 (tác giả tên Việt, chưa xác nhận địa điểm) có thể là phòng Việt Nam; cả hai đều có sẵn trong bộ golden. Ảnh duy nhất tìm được là phòng ngủ Việt Nam chụp điện thoại thì bị loại vì nghi vấn quyền tác giả (xem §3).

## 2. Phát hiện quan trọng ngoài ba con số

1. **Depth "1 lần/ảnh" (D3b) không đủ khi có xóa đồ.** Nếu dùng depth của ảnh gốc, đồ đã xóa vẫn "che" sofa mới: trung bình 25,1% pixel sofa bị ẩn (A), so với 10,0% khi tính lại depth trên ảnh đã xóa. 12/22 ảnh bị che sai thêm ≥ 10 điểm %. → Phải tính lại depth sau mỗi lượt xóa, hoặc thay depth vùng đã xóa bằng mặt sàn/tường. Chi phí depth gấp đôi cho ảnh có xóa. Đây là dữ liệu cho founder; spike không sửa D3b.
2. **Tỷ lệ thật của đồ phụ thuộc chủ yếu vào đường chân trời và chiều cao máy, gần như không phụ thuộc FOV.** Với vật đứng trên sàn, máy gần nằm ngang: `(chiều cao vật trên ảnh) / (khoảng từ chân vật tới đường chân trời trên ảnh) ≈ chiều cao vật thật / chiều cao máy`. FOV chỉ ảnh hưởng bậc hai. Hệ quả: giả định 1,4 m sai bao nhiêu thì scale sai bấy nhiêu. Vật mốc trong 5 ảnh cho sai số tỷ lệ từ ×0,76 tới ×2,04.
3. **Chế độ B nhạy với tay người kéo.** Đường chân trời lệch ±5% chiều cao ảnh → khoảng cách (≈ scale) đổi trung vị 12,8%, tối đa 41,6% (ước tính hình học theo trục giữa ảnh, FOV 60°, trên 22 điểm sàn của manifest).
4. **GeoCalib đoán đường chân trời gần với người kéo cẩn thận** (lệch trung vị 0,049 chiều cao ảnh), nhưng **FOV không tin được** (độ bất định 1σ trung vị 10,7°; r22 ra 25°). Trên ảnh đã dựng đứng đường dọc (r07, r13), GeoCalib coi máy nằm ngang và đặt chân trời giữa ảnh, lệch 0,12–0,21 chiều cao ảnh so với chân trời Claude kéo. Ở r13 sofa ra quá nhỏ (mốc ×1,53). Ở r07 lỗi này tình cờ bù cho giả định chiều cao máy 1,4 m (máy thật thấp) nên trông đúng.
5. **Ánh sáng là tiêu chí yếu nhất** (TB 2,86/5 ở cả hai chế độ). Đây là việc kỹ thuật dựng hình, không phải AI: khớp phơi sáng, nhiệt màu, bóng.
6. Ba giá trị FOV mặc định đang cùng tồn tại trong code: `packages/core` 60° (horizon.ts, calibration.ts), `device-tilt.ts` 55°, `apps/mobile/roomCamera.ts` 67°. Theo phát hiện 2, ảnh hưởng nhỏ, nhưng nên thống nhất. Spike chỉ đọc, không sửa.

## 3. Bộ ảnh và chống cherry-pick

- **22 ảnh**: r01–r14 lấy lại từ `apps/web/public/golden/rooms/` (nguồn ở `apps/web/public/golden/CREDITS.md`). r15–r22 là ảnh mới từ Wikimedia Commons, CC0 hoặc CC BY-SA 4.0. Nguồn, tác giả, giấy phép từng ảnh mới ở `.agents/spike-ai-real-photos/CREDITS.md`.
- Thành phần: 10 phòng khách, 12 phòng ngủ. Có gương/kính: r01, r02, r05, r11, r12, r13, r14, r20, r22 (gương thật: r11, r12, r22). Thiếu sáng: r06, r09, r10, r11, r21. Khổ dọc: r06, r08, r09, r15, r17. Nhiều đồ tiền cảnh: r03, r04, r11, r20, r21. Châu Á: r07, r14 (Việt Nam), r15–r18, r21. Không có người.
- Ảnh làm việc được thu về cạnh dài ≤ 1600 px, đúng mức client downscale trong spec §9. r02–r14 vốn là bản 1280 px.
- **Manifest chốt lúc 2026-10-04T16:05:10+07:00**, sha256 `4b4dfae28e5b6abd…`, gửi cho coordinator trước khi chạy model đầu tiên. File để chỉ đọc. Mỗi ảnh có 2–3 món (luôn có ít nhất 1 món lớn), mỗi món một điểm chạm ở giữa món; 1 điểm sàn đặt sofa; 1 vị trí đường chân trời cho chế độ B; vật mốc có kích thước biết trước nếu có.
- Hai ảnh ứng viên bị thay **trước** khi chốt: một ảnh có hình người trong khung hình; một ảnh phòng ngủ Việt Nam chụp điện thoại (640×640) có metadata IPTC gợi ý tải lại từ mạng xã hội, nên nghi vấn quyền "own work".
- Sau khi chốt: **không đổi ảnh, món, điểm chạm, điểm sàn, đường chân trời**. Các thay đổi code ghi ở §12.
- 3 ảnh không thấy sàn (r09, r10, r12) và vài ảnh có điểm sàn nằm trong vùng sẽ xóa (r13, r16, r18). Đây là cố ý: đặt sofa vào chỗ đồ cũ vừa xóa là luồng thật.

## 4. Quy tắc mặc định đã dùng (một quy tắc cho mọi ảnh)

**Tách đồ.** SAM ViT-B (`sam_vit_b_01ec64.pth`, cùng trọng số với prototype), `segment_anything` chính thức, PyTorch CPU. Chọn ViT-B vì trùng prototype và trùng mô hình mà spec §5 nêu; SAM 2 / MobileSAM chưa thử. Mã hoá ảnh **một lần**, dùng lại embedding cho mọi lần chạm. Chạm 1: một điểm dương, `multimask_output=True`, lấy mask có predicted IoU cao nhất. Chạm sửa (chỉ khi mask 1 hỏng, đúng một lần): thêm một điểm dương hoặc âm, giữ điểm 1, đưa logits mask 1 vào `mask_input`, một mask đầu ra. Hậu xử lý: bỏ đảo < 1% diện tích, lấp lỗ < 1%. Tiêu chí chấm: mask phủ gần trọn món và không lấn đáng kể. Gối, đệm trên sofa/giường tính là một phần của món; đồ trang trí đặt trên bàn/tủ không tính (quy ước này được viết rõ lúc chấm lượt 1, xem §12).

**Xóa đồ.** LaMa ONNX (`Carve/LaMa-ONNX`, đầu vào 512×512, như `build.py`). Mask cuối của mọi món trong ảnh được xóa **trong một lượt**. Món có đáy mask ở nửa dưới ảnh được nới thêm xuống 2,5% chiều cao ảnh để ăn bóng tiếp xúc. Sau đó nới đều 1,2% cạnh dài ảnh. Mỗi cụm liên thông: cắt ô vuông cạnh = clamp(2 × cạnh lớn bbox, 512, min(W, H)), resize về 512, chạy LaMa, resize ngược, dán chỉ trong mask (viền mềm σ = 2 px). Cụm không vừa ô thì xử lý cả ảnh pad phản xạ (7/33 ô). Không dùng mẹo theo từng ảnh của `build.py` (khung gợi ý, `exclude`, `shadow` riêng).

**Hiểu phòng + đặt sofa.** Sofa: `apps/web/public/golden/sofa.glb` (GlamVelvetSofa, Wayfair, CC BY 4.0, đúng kích thước thật 2,19 m), chuẩn hoá đồng dạng về **2,00 m** bề rộng (≈ 0,72 m cao, 0,93 m sâu). Gốc mô hình = tâm mặt đáy, đặt tại điểm sàn trong manifest (như `modelPlacement` của `apps/mobile`), mặt trước hướng về máy. Ghép lên **ảnh đã xóa** (luồng thật: xóa rồi đặt).
- **A — tự động hoàn toàn:** GeoCalib (pinhole) ước lượng trọng lực (roll, pitch) và FOV dọc. Chiều cao máy 1,4 m.
- **B — có trợ giúp như sản phẩm:** đường chân trời người dùng kéo (giá trị trong manifest, đã kẹp [0,03; 0,97] như `HorizonLine.tsx`) → `solveCameraFromHorizon` (FOV dọc mặc định 60°, 1,4 m, roll 0) → `placeOnFloor`. Gọi thẳng code TypeScript của `packages/core` (`scripts/core_camera.ts`). Bản Python dùng để dựng hình khớp kết quả `packages/core` tới 1 mm (có assert).
- Dựng hình: pyrender offscreen (EGL), supersampling 2×. Phơi sáng = clamp((độ sáng tuyến tính TB / 0,18)^0,6; 0,25; 1,8); màu đèn = màu TB của ảnh. Bóng tiếp xúc = hình chiếu đáy sofa làm mờ σ = 6 cm, tối 60%.
- Che khuất: Depth Anything V2 Small trên ảnh đã xóa. Căn affine disparity theo mặt sàn của camera (dải sàn từ điểm đặt xuống đáy ảnh, RANSAC tất định). Pixel sofa ẩn nếu cảnh thật gần hơn quá 5%. Đo thêm bản dùng depth của ảnh gốc.
- Không có chạm tường, không kẹp trong phòng (`clampFootprint` của mobile cần chân tường, spike không có).

**Rubric** (spec §10): 1–5 × 5 tiêu chí (scale đúng · chạm sàn · che khuất đúng · ánh sáng hợp lý · không đường ghép). Thang chi tiết ở `manifest.json → protocol.rubric`.
**Định nghĩa "tin được" đề xuất:** không tiêu chí nào ≤ 2 **và** trung bình 5 tiêu chí ≥ 3,5. Điểm thô đầy đủ ở §7 để founder đặt lại ngưỡng.

## 5. Bảng số liệu ba phần

### 5.1. Tách đồ (65 món, 36 món lớn)

| Chỉ số | Tất cả | Đồ lớn | Đồ nhỏ |
|---|---|---|---|
| Mask đạt sau 1 chạm | 31/65 (47,7%) | 13/36 (36,1%) | 18/29 (62,1%) |
| Mask đạt sau ≤ 2 chạm | 45/65 (69,2%) | 22/36 (61,1%) | 23/29 (79,3%) |
| Lần chạm sửa cứu được | 14/34 (41,2%) | | |
| *Post-hoc, không phải quy tắc đã chốt:* chạm 1 chọn mask **lớn nhất** thay vì điểm cao nhất | 42/65 (64,6%) | 19/36 (52,8%) | |

Mức chấm sau chạm 1: 27 tốt, 4 chấp nhận, 34 hỏng. Lỗi chạm 1 phổ biến nhất: SAM chọn **một phần** của món (một gối, một tấm đệm, một cánh tủ, quyển sách trên bàn kính) — ở các món hỏng, mask có điểm cao nhất thường là một bộ phận nhỏ.

### 5.2. Xóa đồ (65 vùng, 22 lượt)

| Chỉ số | Kết quả |
|---|---|
| Vùng dùng được (tốt + dùng được) | 27/65 (41,5%) — 9 tốt, 18 dùng được, 38 hỏng |
| Vùng đồ lớn dùng được | 11/36 (30,6%) |
| Ảnh sạch cả lượt (mọi vùng dùng được) | 2/22 (9,1%) — r09, r11 |
| LaMa riêng: vùng dùng được khi mask đã đạt | 25/45 (55,6%) |
| Nguyên nhân 38 vùng hỏng | 19 do mask (sót phần món) · 17 do LaMa · 2 do đồ trang trí không chọn còn lơ lửng |
| Diện tích cần xóa | TB 27% ảnh (8–47%) |

### 5.3. Đặt sofa (22 ảnh)

| Chỉ số | A — tự động | B — kéo chân trời |
|---|---|---|
| **Tin được** (đề xuất) | **10/22 (45,5%)** | **13/22 (59,1%)** |
| Tin được nếu chỉ xét hình học (scale, chạm sàn, che khuất) | 15/22 (68,2%) | 16/22 (72,7%) |
| Ngưỡng thay thế: mọi tiêu chí ≥ 3 | 13/22 (59,1%) | 14/22 (63,6%) |
| TB scale · chạm sàn · che khuất · ánh sáng · đường ghép | 3,50 · 3,32 · 4,09 · 2,86 · 3,59 | 3,32 · 3,41 · 4,09 · 2,86 · 3,59 |
| Tia không chạm sàn (fallback) | 0 | 0 |
| Vật mốc: tỷ lệ chiều cao ước lượng / thật | r02 ×0,83 · r04 ×1,12 · r06 ×1,44 · r13 ×1,53 · r17 ×0,94 | r02 ×0,76 · r04 ×0,95 · r06 ×2,04 · r13 ×1,01* · r17 ×0,90* |
| % pixel sofa bị che — depth ảnh đã xóa | 10,0% | 10,7% |
| % pixel sofa bị che — depth ảnh gốc | 25,1% | 26,5% |

\* Ở r13 và r17, Claude dùng chính vật mốc để ước đường chân trời khi chốt manifest, nên với B hai mốc này không độc lập.

Theo nhóm ảnh (tin được A / B): ảnh chuyên nghiệp 5/6 · 6/6; ảnh kiểu điện thoại thật 0/4 · 0/4; thiếu sáng 0/5 · 0/5; không thấy sàn 1/3 · 1/3. Có ít nhất một chế độ tin được: 14/22. Cả hai: 9/22.

## 6. Thời gian chạy trên CPU (12 nhân, không GPU)

| Bước | Thời gian | Ghi chú |
|---|---|---|
| SAM ViT-B nạp mô hình | 0,92 s | một lần |
| SAM mã hoá ảnh | TB 9,67 s · trung vị 10,6 s (5,9–11,8 s) | một lần/ảnh |
| SAM mỗi lần chạm (decoder) | chạm 1: TB 0,126 s, trung vị 0,084 s (tối đa 0,73 s) · chạm sửa: TB 0,082 s | dùng lại embedding |
| LaMa một lượt xóa | TB 4,84 s · trung vị 4,68 s (2,55–7,33 s) | 3,23 s mỗi ô 512; 33 ô cho 22 ảnh |
| Depth Anything V2 Small | TB 1,27 s (0,70–2,33 s) | gồm tiền xử lý, chạy 2 lần/ảnh (gốc + đã xóa) |
| GeoCalib | TB 2,15 s · trung vị 2,08 s (1,22–4,49 s) | |
| Dựng sofa (pyrender, 2× SSAA) | trung vị 1,31 s | dựng offline, không đại diện cho WebGL trên máy người dùng |

Một ảnh đi hết pipeline trên CPU này: khoảng 10 s mã hoá + 5 s xóa + 2,5 s depth (2 lần) + 2 s GeoCalib ≈ 20 s, chưa tính dựng hình.

## 7. Bảng điểm rubric theo ảnh — chế độ A và B (SƠ BỘ, Claude chấm)

Thứ tự: scale · chạm sàn · che khuất · ánh sáng · đường ghép. TB = trung bình 5 tiêu chí. ✓ = tin được (không tiêu chí ≤ 2, TB ≥ 3,5).

| Ảnh | A: điểm | A: TB | A | B: điểm | B: TB | B | A: khoảng cách · FOV dọc | B: khoảng cách | Mốc A / B |
|---|---|---|---|---|---|---|---|---|---|
| r01 | 4 · 4 · 5 · 3 · 4 | 4,00 | ✓ | 4 · 4 · 5 · 3 · 4 | 4,00 | ✓ | 2,84 m · 50° | 2,12 m | — |
| r02 | 4 · 4 · 5 · 3 · 4 | 4,00 | ✓ | 3 · 4 · 5 · 3 · 4 | 3,80 | ✓ | 1,34 m · 90° | 2,35 m | ×0,83 / ×0,76 |
| r03 | 4 · 3 · 4 · 3 · 4 | 3,60 | ✓ | 3 · 4 · 4 · 3 · 4 | 3,60 | ✓ | 3,35 m · 37° | 1,90 m | — |
| r04 | 4 · 4 · 3 · 3 · 3 | 3,40 | ✗ | 5 · 4 · 3 · 3 · 3 | 3,60 | ✓ | 3,46 m · 43° | 2,09 m | ×1,12 / ×0,95 |
| r05 | 3 · 4 · 5 · 3 · 4 | 3,80 | ✓ | 3 · 4 · 5 · 3 · 4 | 3,80 | ✓ | 5,29 m · 40° | 3,78 m | — |
| r06 | 2 · 4 · 4 · 3 · 4 | 3,40 | ✗ | 1 · 4 · 4 · 3 · 4 | 3,20 | ✗ | 2,38 m · 76° | 4,22 m | ×1,44 / ×2,04 |
| r07 | 4 · 3 · 5 · 3 · 4 | 3,80 | ✓ | 1 · 2 · 5 · 3 · 4 | 3,00 | ✗ | 4,95 m · 40° | 7,48 m | — |
| r08 | 3 · 2 · 2 · 3 · 2 | 2,40 | ✗ | 3 · 2 · 2 · 3 · 2 | 2,40 | ✗ | 1,47 m · 46° | 1,17 m | — |
| r09 | 4 · 3 · 5 · 2 · 4 | 3,60 | ✗ | 3 · 3 · 5 · 2 · 4 | 3,40 | ✗ | 3,50 m · 57° | 2,72 m | — |
| r10 | 3 · 2 · 4 · 3 · 3 | 3,00 | ✗ | 2 · 2 · 4 · 3 · 3 | 2,80 | ✗ | 1,76 m · 54° | 2,35 m | — |
| r11 | 4 · 3 · 3 · 2 · 3 | 3,00 | ✗ | 4 · 3 · 3 · 2 · 3 | 3,00 | ✗ | 2,68 m · 67° | 2,94 m | — |
| r12 | 4 · 3 · 5 · 3 · 4 | 3,80 | ✓ | 4 · 3 · 5 · 3 · 4 | 3,80 | ✓ | 1,86 m · 65° | 2,35 m | — |
| r13 | 2 · 3 · 4 · 3 · 4 | 3,20 | ✗ | 4 · 4 · 4 · 3 · 4 | 3,80 | ✓ | 3,32 m · 59° | 2,33 m | ×1,53 / ×1,01 |
| r14 | 4 · 3 · 5 · 3 · 4 | 3,80 | ✓ | 3 · 3 · 5 · 3 · 4 | 3,60 | ✓ | 3,47 m · 44° | 2,10 m | — |
| r15 | 4 · 4 · 3 · 3 · 3 | 3,40 | ✗ | 4 · 4 · 3 · 3 · 3 | 3,40 | ✗ | 1,98 m · 64° | 2,51 m | — |
| r16 | 3 · 3 · 5 · 2 · 4 | 3,40 | ✗ | 3 · 3 · 5 · 2 · 4 | 3,40 | ✗ | 4,77 m · 38° | 2,86 m | — |
| r17 | 5 · 4 · 5 · 3 · 4 | 4,20 | ✓ | 4 · 4 · 5 · 3 · 4 | 4,00 | ✓ | 2,66 m · 65° | 2,81 m | ×0,94 / ×0,90 |
| r18 | 4 · 4 · 5 · 4 · 4 | 4,20 | ✓ | 4 · 4 · 5 · 4 · 4 | 4,20 | ✓ | 2,41 m · 81° | 3,04 m | — |
| r19 | 4 · 4 · 5 · 3 · 4 | 4,00 | ✓ | 4 · 4 · 5 · 3 · 4 | 4,00 | ✓ | 3,73 m · 50° | 2,63 m | — |
| r20 | 4 · 4 · 3 · 3 · 3 | 3,40 | ✗ | 5 · 4 · 3 · 3 · 3 | 3,60 | ✓ | 3,48 m · 39° | 1,76 m | — |
| r21 | 2 · 2 · 2 · 2 · 2 | 2,00 | ✗ | 2 · 2 · 2 · 2 · 2 | 2,00 | ✗ | 3,22 m · 49° | 2,26 m | — |
| r22 | 2 · 3 · 3 · 3 · 4 | 3,00 | ✗ | 4 · 4 · 3 · 3 · 4 | 3,60 | ✓ | 7,37 m · 25° | 2,06 m | — |

Cột "Mốc": chiều cao vật mốc suy ra từ camera của từng chế độ chia cho chiều cao thật (>1 nghĩa là camera tưởng thế giới to hơn → sofa hiện nhỏ hơn thật). Ở r13 và r17, mốc không độc lập với chế độ B.

### Ghi chú chấm theo ảnh

- **r01**: Hai chế độ gần nhau; không vật che; sofa sáng phẳng, bóng tiếp xúc yếu.
- **r02**: Ảnh góc siêu rộng: A bắt FOV 90° đúng hơn; mốc bàn ăn A×0,83, B×0,76 → sofa hơi to.
- **r03**: Sofa sọc phía trước che đúng; A pitch 16° nông hơn sàn thật nên mặt đáy hơi lệch; B hơi to.
- **r04**: Ghế văn phòng và loa che đúng; vệt sọc giữa lưng sofa do kệ tivi xuyên qua (vị trí đặt chồng lên kệ).
- **r05**: Sofa mới nhỏ hơn sofa cũ (bóng ma) phía sau dù đứng trước → thiếu ~25–30%.
- **r06**: Mốc cửa: A×1,44, B×2,04 → sofa quá nhỏ (máy thấp, nghệ thuật). Màng nhựa trong suốt không được mô phỏng.
- **r07**: Ảnh nghi là render, máy thấp (ước ~0,75 m): B (chân trời 0,70 + giả định 1,4 m) đặt sofa 7,5 m, tí hon.
- **r08**: Ảnh điện thoại chúc mạnh, bừa: sofa chồng lên giường, quần áo che sai, viền che nhòe.
- **r09**: Không thấy sàn; sofa quá sáng so với phòng tối ngược sáng.
- **r10**: Cận cảnh giường, không có sàn; sofa ngồi trên chăn nhòe; nét/mờ lệch nhau.
- **r11**: Phòng tối ấm: sofa quá sáng; giường phía trước che chân sofa nên trông lơ lửng.
- **r12**: Không thấy sàn; sofa đặt chỗ giường cũ, gối cũ còn lơ lửng phía sau (lỗi xóa).
- **r13**: A: GeoCalib coi máy nằm ngang (ảnh đã dựng đứng) → mốc tay nắm ×1,53, sofa quá nhỏ. B khớp mốc (mốc này dùng để đặt chân trời, không độc lập).
- **r14**: Sàn bóng nhưng sofa không có phản chiếu → hơi dán; B hơi to.
- **r15**: Phòng nhỏ, sofa vừa bề ngang phòng; bóng ma giường trắng che trái sofa, viền mềm.
- **r16**: Sofa đặt trên vùng giường đã xóa (còn bóng ma tối); hơi to, quá sáng.
- **r17**: Mốc mặt bàn A×0,94 (độc lập), B×0,90.
- **r18**: Sofa cũ không xóa được (mask hỏng) nhưng sofa mới đứng trước, thứ tự đúng; ánh sáng khớp tốt.
- **r19**: Hợp lý so với ghế quầy bar và quầy bếp.
- **r20**: Ghế mây che đúng thứ tự nhưng chân ghế nhòe vào sofa (ranh giới depth mềm).
- **r21**: Lối đi ~0,8 m giữa giường tầng: sofa 2 m không lọt, bị khung che ~69%, chỉ còn mảng xám.
- **r22**: A: GeoCalib FOV 25° (sai) → sofa 7,4 m, quá nhỏ. Bóng ma bàn (lỗi xóa) che trái sofa; gương phía sau không phản chiếu sofa.

## 8. Phân loại lỗi (kèm ví dụ, xem hàng tương ứng trên contact sheet)

### 8.1. Tách đồ

| Loại lỗi | Ví dụ | Tần suất / ghi chú |
|---|---|---|
| Chọn một phần thay vì cả món (mơ hồ phần–toàn thể) | r05 sofa → một gối tựa; r15 tủ → một cánh; r18 sofa → một gối; r22 bàn → một ngăn kéo | Loại lỗi lớn nhất ở chạm 1. Chọn mask lớn nhất (post-hoc) cứu thêm 11 món. |
| Đồ nhiều lớp vải / nhiều bộ phận | r12, r13, r14 giường: gối + chăn + đầu giường là các vùng riêng; r03 sofa phủ khăn sọc | Hai chạm vẫn không đủ. Cần nhiều chạm hoặc kéo khung. |
| Đồ trong suốt / mặt kính | r01, r20 bàn kính: SAM lấy lọ hoa, quyển sách trên mặt kính | Hỏng cả sau chạm sửa. |
| Chạm sửa lấn sang món kề bên | r15 tủ + nửa máy lạnh; r02 bàn ăn + ghế ăn | Điểm dương thứ hai kéo theo vật cùng màu. |
| Vật mảnh, khung rỗng | r21 giường tầng khung sắt; r13 bàn gấp chân chữ X | Chỉ lấy được nệm/khay. |

### 8.2. Xóa đồ

| Loại lỗi | Ví dụ | Ghi chú |
|---|---|---|
| Mảng tối / bẩn ở vùng lớn | r02 ghế bành, r05 bàn trà, r06, r07 sofa L | Nhiều khả năng do LaMa 512 trên ô lớn: vùng xóa chiếm phần lớn ô, thiếu ngữ cảnh sạch (chưa kiểm chứng). |
| Bóng ma của món cũ | r04 tivi, r10 đầu giường, r15 khung giường, r16 giường, r17 rèm voan | Có thể do mask sót viền hoặc bóng đổ nằm ngoài vùng nới (chưa kiểm chứng). |
| Phần món bị sót còn lơ lửng | r12, r13, r14 gối lơ lửng; r20 khung sofa | Lỗi mask truyền sang (19/38 vùng hỏng). |
| Đồ trang trí không chọn bị bỏ lại giữa không trung | r03 bát + vỏ sò; r14 đèn trên tab đầu giường | Người dùng phải chọn cả đồ trên mặt bàn. Sản phẩm nên gợi ý "xóa luôn đồ trên món này". |
| Nền bừa → LaMa vẽ thêm hoa văn nhòe | r08 (giường đầy quần áo) | Ảnh điện thoại bừa là trường hợp xấu nhất. |
| Làm tốt | r09 (nền tối đồng màu), r12 tủ kính → tường trắng, r14 cây treo áo trên tường gạch, r15 tủ áo, r18 bàn trà trên thảm | Nền đồng nhất, có cấu trúc lặp. |

### 8.3. Hiểu phòng + đặt sofa

| Loại lỗi | Ví dụ | Ghi chú |
|---|---|---|
| Giả định chiều cao máy 1,4 m sai | r06 (mốc cửa ×1,44 A, ×2,04 B), r07 B (máy thấp ~0,75 m → sofa đặt 7,5 m, tí hon) | Sai bao nhiêu thì scale sai bấy nhiêu (phát hiện 2). |
| GeoCalib hỏng FOV / đường chân trời | r22 A: FOV 25° → sofa 7,4 m, quá nhỏ; r13 A: ảnh đã dựng đứng, GeoCalib coi máy nằm ngang → mốc ×1,53 | Hay gặp ở ảnh kiến trúc, ảnh crop. |
| Không thấy sàn / cận cảnh | r09, r10, r12 | Không kiểm được chạm sàn. Nên phát hiện và chuyển manual (F4). |
| Đặt chồng lên đồ thật / không lọt phòng | r04 sofa xuyên kệ tivi; r21 lối đi ~0,8 m; r08 sofa chồng lên giường | Không có va chạm với hình học thật. |
| Lỗi xóa phá bố cục | r15, r16, r22 bóng ma của đồ cũ ngay sau sofa | Ảnh hưởng đường ghép + che khuất. |
| Che khuất mềm, viền nhòe | r20 chân ghế mây nhòe vào sofa; r08 quần áo che sai | Depth Anything Small có biên mềm. Ngưỡng 5% cố định. |
| Ánh sáng lệch | r09, r11, r16 (phòng tối) sofa quá sáng; r14, r18 sàn bóng không có phản chiếu | Tiêu chí thấp nhất (TB 2,86). |

## 9. Khuyến nghị

### 9.1. Decision gate spec M1 §10

**Kết quả: FAIL ở cả hai chế độ** (A 45,5%, B 59,1%, ngưỡng 70%). Theo đúng spec §10: **ship manual-first**, AI thành trợ giúp qua toggle. Lý do không nên giữ AI auto-place:

- Ngay cả cận trên (ảnh đẹp, người kéo chân trời cẩn thận, người chấm là người làm) vẫn dưới ngưỡng.
- Trên ảnh giống ảnh người dùng thật và ảnh thiếu sáng: 0/4 và 0/5.
- Chế độ tự động hoàn toàn (A) kém hơn chế độ có một thao tác (B). Thao tác kéo chân trời đã có sẵn ở màn C6.

Bản manual-first nên giữ những gì spike cho thấy chạy được:

1. Mặt sàn + camera từ **đường chân trời** (`solveCameraFromHorizon`), **điền sẵn bằng GeoCalib** để người dùng chỉ xác nhận hoặc kéo nhẹ. GeoCalib lệch trung vị 0,049 chiều cao ảnh so với người kéo cẩn thận; cần thêm cảnh báo khi độ bất định cao.
2. **Tay cầm scale luôn hiện** (F1) và log `ScaleOverride`. Vật mốc cho thấy sai số ×0,76–×2,04.
3. **Che khuất bằng depth, tính lại sau mỗi lượt xóa** (phát hiện 1). Điểm che khuất TB 4,09 là tiêu chí tốt nhất.
4. Đầu tư vào **khớp ánh sáng** (phơi sáng, nhiệt màu, bóng mềm, phản chiếu nhẹ trên sàn bóng). Giả định mọi ảnh có ánh sáng ≥ 3 (các tiêu chí khác giữ nguyên) thì B lên 15/22 (68,2%), A lên 12/22 (54,5%) — vẫn dưới 70%. Tức là sửa ánh sáng thôi chưa đủ để qua gate.
5. Phát hiện ảnh không thấy sàn / cận cảnh → chuyển manual và gợi ý chụp lại (F4).

Để mở lại câu hỏi auto-place sau M1: chạy lại spike này trên ≥ 20 ảnh phòng Việt Nam **thật** chụp bằng điện thoại, và founder chấm lại.

### 9.2. Tách đồ và xóa đồ

- **Tách đồ:** không hứa "chạm một lần". Luồng nên là: chạm → **hiện mask** → chạm thêm để thêm/bớt (không giới hạn 2) hoặc kéo khung → xác nhận → mới gửi xóa. Đổi quy tắc chọn mask sang ưu tiên mask lớn (post-hoc +11 món). Thử SAM 2 / HQ-SAM trong spike tiếp nếu cần; spike này **chưa đo**.
- **Xóa đồ:** LaMa 512 đủ cho đồ nhỏ và nền đơn giản, **không đủ cho sofa, giường, tủ lớn sát tường**. Spec §5 đã nêu "SDXL-inpaint cho vùng lớn" — spike này **chưa đo** model đó. Trước khi coi xóa đồ lớn là chức năng M1, cần một spike riêng so 2–3 model inpainting trên cùng 22 ảnh và cùng mask. Trong lúc đó, F3 (hoàn tác / thử vùng nhỏ hơn) phải là đường chính, không phải đường hiếm.
- Gợi ý xóa kèm đồ đặt trên món (bình hoa trên bàn, gối trên giường) để tránh đồ lơ lửng.

### 9.3. Hiểu phòng: tỷ lệ mét thật từ một ảnh

- Từ một ảnh, **tỷ lệ mét = vị trí đường chân trời + chiều cao máy**. FOV ảnh hưởng bậc hai. Hai thứ cần đúng là: (a) đường chân trời — người dùng kéo (B) hoặc GeoCalib gợi ý; (b) chiều cao máy — hiện là giả định 1,4 m, không có cách đo từ ảnh.
- Muốn ra mét thật, cần thêm **một** thông tin: chạm một vật mốc có kích thước biết trước (cánh cửa, mặt bàn 0,75 m, ổ điện — spec §4 đã gợi ý), hoặc hỏi người dùng tư thế chụp (đứng / ngồi), hoặc ảnh chụp trong app với cảm biến hướng (`device-tilt.ts`) — cách này cho pitch chứ không cho chiều cao.
- Depth tương đối (Depth Anything V2 Small) **không** cho mét. Spike chỉ dùng nó cho thứ tự che khuất, đúng tinh thần spec §4.
- Không nên dùng FOV của GeoCalib làm FOV camera mặc định khi độ bất định > ~10°. Nên dùng FOV từ EXIF nếu có, không thì một FOV mặc định thống nhất (phát hiện 6).

## 10. Ước lượng độ trễ và chi phí trên GPU / Replicate

Spike chạy CPU, **không đo được trên GPU**. Bảng dưới lấy từ trang Replicate, tải ngày 2026-10-04 (bản lưu ở `.agents/spike-ai-real-photos/results/sources/`). "Thời gian điển hình" là số Replicate công bố, **chưa gồm** upload, xếp hàng, cold boot — các khoản này **chưa đo được**.

| Tác vụ | Model trên Replicate | Giá ước tính / lượt | GPU | Thời gian điển hình | Nguồn |
|---|---|---|---|---|---|
| Depth | `chenxwh/depth-anything-v2` | ~$0,0022 | A100 (40GB) | ≤ 2 s | https://replicate.com/chenxwh/depth-anything-v2 |
| Inpainting | `allenhooo/lama` | ~$0,00065 | T4 | ≤ 3 s | https://replicate.com/allenhooo/lama |
| Segmentation | `meta/sam-2` | ~$0,013 | L40S | ≤ 14 s | https://replicate.com/meta/sam-2 |
| Giá phần cứng | — | T4 $0,000225/s · L40S $0,000975/s · A100 80GB $0,0014/s · CPU $0,0001/s | | | https://replicate.com/pricing |

Lưu ý khi đọc bảng:

- `meta/sam-2` trên Replicate nhận tham số kiểu "segment everything" (`points_per_side`, `pred_iou_thresh`), **không phải điểm chạm**. Muốn tách theo chạm có hai đường: (a) chạy "segment everything" một lần khi tải ảnh, chạm = chọn mask có sẵn — chất lượng cách này **chưa đo**; (b) tự triển khai encoder SAM trên server và chạy decoder trên trình duyệt. README của SAM ghi decoder xuất được ONNX và chạy trong trình duyệt như bản demo (https://github.com/facebookresearch/segment-anything#onnx-export). Đo trên CPU ở đây: decoder 0,084 s/chạm (trung vị).
- Model tự triển khai (private) trên Replicate tính tiền cả thời gian khởi động và thời gian chờ, không chỉ thời gian chạy (trang pricing). Encoder SAM riêng và GeoCalib (không thấy bản public trong các trang đã kiểm) rơi vào trường hợp này.
- Spec §3 ghi "LaMa ~$0.0025/lượt". Trang `allenhooo/lama` hiện ghi ~$0,00065. Cần xác nhận lại khi có volume (đúng mục bỏ ngỏ 4 ở spec §15).

**Chi phí một ảnh có xóa đồ, dùng model public (ước tính, chưa gồm lưu trữ và băng thông):** depth 2 lần (vì phát hiện 1) ≈ $0,0044 + LaMa 1–3 lượt ≈ $0,0007–0,002 + SAM-2 "segment everything" 1 lần ≈ $0,013 → **≈ $0,018–0,019 / ảnh**. Bỏ SAM-2 (nếu decoder chạy trên trình duyệt với encoder tự triển khai) thì phần trả theo lượt ≈ $0,005–0,006 / ảnh, cộng chi phí giữ máy cho encoder (**chưa ước được**, phụ thuộc lưu lượng). Chế độ B không gọi model nào.

**Độ trễ người dùng cảm nhận (ước tính từ số công bố):** depth ≤ 2 s chạy song song lúc tải ảnh; mỗi lượt xóa ≤ 3 s; SAM-2 "segment everything" ≤ 14 s (nên chạy nền ngay khi tải ảnh). Trên CPU 12 nhân của spike: mã hoá SAM ~10 s, mỗi lượt LaMa ~5 s.

## 11. Giới hạn của spike

- Điểm do Claude chấm, một người, sơ bộ. Người chọn điểm cũng là người chấm.
- Chấm ở cỡ thu nhỏ (~520–600 px bề ngang) để gần cỡ màn điện thoại. Xem cỡ lớn sẽ thấy nhiều lỗi xóa hơn.
- Chỉ một mô hình sofa (2,0 m, dáng cong, chân mảnh), một màu (xám). Sofa hộp hoặc màu tối sẽ khác.
- Không thử MobileSAM, SAM 2, SDXL-inpaint, nhiều nhà cung cấp inpainting (spec §10 đề nghị 3–4) — **chưa đo**.
- Không đo trên GPU, không đo độ trễ mạng, cold boot.
- Dựng hình bằng pyrender offline, không phải R3F/expo-gl của sản phẩm. Ánh sáng và bóng của sản phẩm có thể tốt hoặc kém hơn.
- 22 ảnh: khoảng tin cậy rộng. Ví dụ 13/22 tương ứng 59% nhưng chỉ cần 3 ảnh đổi kết quả là qua hoặc trượt ngưỡng 70%.

## 12. Changelog (mọi thay đổi trong quá trình chạy)

| Thời điểm | Thay đổi | Ảnh hưởng |
|---|---|---|
| Trước khi chốt manifest | Thay 2 ảnh ứng viên (lý do ở §3); tải lại, sinh lại lưới toạ độ | Chưa có model nào chạy |
| Trước khi chốt | `room-01.jpg` trong golden thiếu 23 byte cuối → đọc bằng `LOAD_TRUNCATED_IMAGES` | Không đáng kể |
| 16:05:10 | **Chốt manifest** (sha256 `4b4dfae28e5b6abd…`) | — |
| Khi chấm chạm 1 | Viết rõ quy ước chấm: gối/đệm trên sofa, giường tính là một phần món; đồ trang trí trên bàn/tủ không tính (`results/seg/grades.json → rule_notes`) | Quy ước chấm, không phải tham số model. Manifest chỉ ghi tiêu chí chung. |
| Sau chạm 1 | Thêm phân tích post-hoc "chọn mask lớn nhất" (`scripts/posthoc_largest.py`) | Báo cáo riêng, **không** thay quy tắc đã chốt |
| Trước khi dựng ảnh đầu tiên | `PyOpenGL` 3.1.0 (bản pyrender ghim) lỗi `glGenTextures` trên Python 3.12 → nâng lên 3.1.9 | Chỉ phần dựng hình |
| Trước khi dựng ảnh đầu tiên | Vật liệu vải mặc định của `sofa.glb` dùng `KHR_materials_sheen` + variants; pyrender không hỗ trợ nên vải ra đen. Cố định biến thể **"Gray"** (màu 0,25/0,25/0,225, roughness 1) cho mọi ảnh. Quyết định sau khi dựng thử riêng mô hình, chưa ghép ảnh nào | **Lệch manifest** (manifest ghi "vật liệu PBR của mô hình"). Có thể ảnh hưởng tiêu chí ánh sáng. |
| Sau dựng thử 3 ảnh (r04, r13, r20) | Không đổi tham số nào | — |

## 13. File kết quả

- Contact sheet (mở trong trình duyệt): `.agents/spike-ai-real-photos/contact_sheet.html` — mỗi ảnh một hàng: gốc · mask chạm 1 · mask sau chạm sửa · kết quả xóa · sofa A · sofa B, kèm điểm từng phần. Có đủ ảnh hỏng.
- Manifest chốt: `.agents/spike-ai-real-photos/manifest.json` · nguồn ảnh: `.agents/spike-ai-real-photos/CREDITS.md`.
- Số liệu tổng hợp: `.agents/spike-ai-real-photos/results/summary.json`. Điểm thô: `results/seg/grades.json`, `results/inpaint/grades.json`, `results/place/grades.json`. Số đo: `results/seg/seg_results.json`, `results/inpaint/inpaint_results.json`, `results/place/calib_results.json`, `results/place/place_results.json`, `results/place/mode_b_core.json`.
- Lệnh chạy lại: `.agents/spike-ai-real-photos/README.md`.

## Phụ lục

### Phụ lục 1. Tách đồ và xóa đồ theo ảnh

| Ảnh | Loại | Đặc điểm | Đạt sau chạm 1 | Đạt sau ≤ 2 chạm | Xóa dùng được | Ghi chú lỗi chính |
|---|---|---|---|---|---|---|
| r01 | khách | kinh, anh-chuyen-nghiep, ngang | 2/3 | 2/3 | 1/3 | sofa-phai: mảng nhòe khối vuông sát tường; ban-tra-kinh: bàn còn, chỉ nhòe một góc |
| r02 | khách | kinh, goc-sieu-rong, ngang | 1/3 | 2/3 | 1/3 | ban-an: ghế ăn bị khoét, bóng ma khăn bàn; ghe-banh: mảng tối lớn trên sàn |
| r03 | khách | nhieu-do-tien-canh, chay-sang, ngang | 1/3 | 2/3 | 1/3 | sofa-sau: sofa còn, lưng bị nhòe; ban-go-truoc: bát + vỏ sò lơ lửng giữa sàn |
| r04 | khách | nhieu-do-tien-canh, ngang | 2/3 | 2/3 | 0/3 | sofa-goc: đoạn sofa sau tivi còn, mảng xám; ghe-banh-da: loa đen bị kéo dài thành khối tối |
| r05 | khách | kinh, san-bong, anh-chuyen-nghiep, ngang | 1/3 | 1/3 | 0/3 | sofa-trai: nửa sofa thành bóng ma xanh; sofa-phai: gối còn + vệt tối |
| r06 | khách | thieu-sang, mang-trong-suot, doc, anh-nghe-thuat | 2/3 | 2/3 | 0/3 | ban-trang: khối tối cạnh cứng; giuong-sofa: khối tối |
| r07 | khách | viet-nam, nghi-anh-render, ngang | 1/3 | 2/3 | 1/3 | sofa-l: còn lưng tựa, vùng ngồi thành mảng tối; ban-tra: mảng tối bẩn trên thảm |
| r08 | ngủ | dien-thoai-that, nghieng, nhieu-hat, bua | 2/3 | 3/3 | 0/3 | nem-giuong: nền bừa → LaMa vẽ thêm vải nhòe; goi-xanh: như trên |
| r09 | ngủ | thieu-sang, khong-thay-san, doc, anh-nghe-thuat | 2/2 | 2/2 | 2/2 |  |
| r10 | ngủ | thieu-sang, khong-thay-san, can-canh, ngang | 2/3 | 3/3 | 2/3 | dau-giuong: viền bóng ma đầu giường trên tường |
| r11 | ngủ | guong, thieu-sang, nhieu-do-tien-canh, dien-thoai-that | 1/3 | 3/3 | 3/3 |  |
| r12 | ngủ | kinh, guong, khong-thay-san, anh-chuyen-nghiep | 0/3 | 2/3 | 2/3 | giuong: gối + khăn chân giường lơ lửng |
| r13 | ngủ | kinh, anh-chuyen-nghiep, ngang | 0/3 | 0/3 | 0/3 | giuong: gối lơ lửng + bóng ma giường; ban-gap: còn chân chữ X, đèn lơ lửng |
| r14 | ngủ | kinh, san-bong, nguoc-sang, viet-nam | 2/3 | 2/3 | 1/3 | giuong: gối lơ lửng + bóng ma xanh; tab-dau-giuong: đèn lơ lửng |
| r15 | ngủ | dien-thoai-that, chau-a, phong-nho, doc | 1/3 | 1/3 | 2/3 | giuong: bóng ma khung giường trắng + vệt xanh |
| r16 | ngủ | chau-a, it-san, ngang | 1/3 | 3/3 | 2/3 | giuong: bóng ma giường tối |
| r17 | ngủ | chau-a, doc | 2/3 | 2/3 | 1/3 | ban-hoc: hộc kéo còn, bàn trong suốt; rem: bóng ma rèm voan |
| r18 | khách | san-bong, anh-chuyen-nghiep, goc-sieu-rong, chau-a | 2/3 | 2/3 | 2/3 | sofa: chỉ xóa gối, sofa còn nguyên |
| r19 | khách | anh-chuyen-nghiep, goc-rong, ngang | 2/3 | 3/3 | 2/3 | ke-tivi: vệt tối dọc trên tường |
| r20 | khách | kinh, nhieu-do-tien-canh, ngang | 1/3 | 1/3 | 0/3 | sofa: khung + gối còn, lõm giữa; ban-tra-kinh: chỉ mất quyển sách |
| r21 | ngủ | thieu-sang, nguoc-sang, nhieu-do-tien-canh, chau-a | 2/3 | 2/3 | 2/3 | giuong-tang: khung sắt còn |
| r22 | ngủ | guong, ngang | 1/3 | 3/3 | 2/3 | ban-go: bóng ma bàn + mảng tối |

### Phụ lục 2. GeoCalib theo ảnh (chế độ A)

| Ảnh | Roll | Pitch | FOV dọc | ±FOV (1σ) | Chân trời A | Chân trời B (kéo tay) |
|---|---|---|---|---|---|---|
| r01 | 1,2° | 10,6° | 50° | 4° | 0,30 | 0,27 |
| r02 | -1,6° | 16,1° | 90° | 6° | 0,35 | 0,32 |
| r03 | -0,0° | 15,8° | 37° | 5° | 0,08 | 0,10 |
| r04 | -0,8° | 13,2° | 43° | 3° | 0,20 | 0,16 |
| r05 | -4,0° | 18,5° | 40° | 4° | 0,04 | 0,03 |
| r06 | 0,5° | -0,2° | 76° | 16° | 0,50 | 0,58 |
| r07 | 0,1° | 0,6° | 40° | 16° | 0,49 | 0,70 |
| r08 | 6,6° | 27,9° | 46° | 7° | -0,13 | 0,03 |
| r09 | 0,4° | -2,6° | 57° | 15° | 0,54 | 0,48 |
| r10 | -7,3° | 14,1° | 54° | 23° | 0,25 | 0,45 |
| r11 | -2,1° | 4,0° | 67° | 23° | 0,45 | 0,43 |
| r12 | -0,6° | 7,2° | 65° | 11° | 0,40 | 0,45 |
| r13 | -0,2° | 0,7° | 59° | 11° | 0,49 | 0,37 |
| r14 | 0,2° | 9,4° | 44° | 6° | 0,30 | 0,22 |
| r15 | -3,1° | 7,7° | 64° | 9° | 0,39 | 0,45 |
| r16 | 1,2° | -0,9° | 38° | 12° | 0,52 | 0,52 |
| r17 | -0,6° | 1,1° | 65° | 11° | 0,49 | 0,47 |
| r18 | 0,9° | -0,7° | 81° | 15° | 0,51 | 0,46 |
| r19 | 1,0° | 3,1° | 50° | 9° | 0,44 | 0,40 |
| r20 | 1,0° | 7,7° | 39° | 8° | 0,31 | 0,25 |
| r21 | 0,6° | 8,3° | 49° | 11° | 0,34 | 0,30 |
| r22 | -0,1° | 1,8° | 25° | 16° | 0,43 | 0,32 |

Pitch dương = máy chúc xuống. Chân trời tính theo tỷ lệ chiều cao ảnh tính từ đỉnh (0 = đỉnh, 1 = đáy; âm = nằm trên mép ảnh).
