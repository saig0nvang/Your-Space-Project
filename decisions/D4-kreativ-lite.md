---
id: D4
title: AI Spatial Placement kiểu Kreativ-lite, có fallback thủ công
status: accepted
date: 2026-07-23
supersedes: null
superseded_by: null
amends: null
amended_by: []
---

**Bắc Đẩu:** trải nghiệm kiểu **IKEA Kreativ** (chụp phòng → xóa đồ cũ → đặt đồ 3D đúng scale/phối cảnh). Founder muốn đúng như vậy.

**Quyết định:** **AI Spatial Placement = MUST-HAVE trong MVP**, nhưng làm bản LEAN ("Kreativ-lite") + có FALLBACK:
- **MVP scope thực tế:** **1 ảnh** + **Depth Anything V2** (depth từ ảnh đơn) để auto-scale/đặt đồ đúng phối cảnh; + cloud inpainting (D3) để xóa đồ cũ trong phòng. KHÔNG clone full Kreativ (panorama 5-ảnh/stereo, LiDAR digital twin, relighting) — để phase sau.
- **FALLBACK PLAN (founder yêu cầu ghi rõ):** nếu depth-từ-1-ảnh quá thiếu chính xác trong ràng buộc MVP → **degrade mượt về đặt đồ THỦ CÔNG** (user tự kéo/scale/xoay — đúng bản gốc "user-controlled"). Đây là hedge, không phải thất bại.
- **Decision gate:** làm **technical spike depth-placement SỚM** (tuần đầu). Nếu chất lượng dưới ngưỡng chấp nhận được tới mốc đã định → kích hoạt fallback. (Tránh dồn rủi ro tính năng yếu nhất vào phút chót.)
- **Lưu ý drift:** ý tưởng gốc KHÔNG có AI; đây là **tiến hóa CÓ CHỦ ĐÍCH** do founder chọn theo chuẩn Kreativ, không phải drift vô thức.

**Dọn dẹp kèm (đã duyệt):**
- **Xoay đồ:** cắt 360° → **chỉ trục Y**. Sửa `PRD.md:75` khớp Stress-Test.
- **Catalog MVP:** khởi đầu **~16-24 models (2-3 phong cách × ~8)**, không phải 75. 5 phong cách là mục tiêu SAU khi validate. Cập nhật `PRD:114,127` + `MVP_Research`.

**Hệ quả:** MVP giờ gồm escrow + cloud inpainting + AI depth placement + catalog → **rất nặng cho solo founder** → D5 (timeline) BẮT BUỘC phải thực tế lại.
