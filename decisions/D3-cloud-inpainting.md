---
id: D3
title: MVP dùng cloud inpainting qua API hosted
status: amended
date: 2026-07-23
supersedes: null
superseded_by: null
amends: null
amended_by: [D3b]
---

**Quyết định:** **MVP = cloud inpainting qua API hosted trả-theo-lượt** (Replicate hoặc tương đương), KHÔNG tự nuôi GPU server. Giữ được trải nghiệm "xóa đồ cũ trong phòng thật" (non-negotiable gốc).

**Nuance quan trọng (founder nhấn mạnh):**
- **"100% on-device" vẫn là killer decision / tầm nhìn dài hạn** — mục tiêu privacy khác biệt hóa (moat Shopee khó copy). Chỉ dùng cloud vì HIỆN chưa khả thi kỹ thuật (LaMa 200MB không chạy nổi máy tầm trung). **Revisit khi công nghệ cho phép** (model inpainting nhẹ hơn, NPU mobile mạnh hơn).

**Hệ quả cần đồng bộ:**
- **Gỡ lời hứa "AI 100% on-device / không upload / zero-cost API" khỏi PRD 10.7/10.8, `Business_Assumptions` (API cost ≠ 0), `rules_rails_ritual`, `territorial_scope`** — thay bằng: "MVP: depth on-device, inpainting cloud; ảnh gửi lên xử lý và xóa ngay".
- **Privacy = consent thật:** onboarding phải ghi "ảnh của bạn được gửi lên hệ thống để xử lý và xóa ngay" (KHÔNG dùng câu "không upload ảnh" — đó là tuyên bố sai, dính rủi ro Điều 198). Ghi rõ mục tiêu on-device tương lai.
- **NĐ13:** ảnh phòng lên cloud (có thể xuyên biên giới) → cần DPIA + cơ chế zero-retention. Cập nhật `territorial_scope` theo thực tế cloud.
- **COGS:** thêm chi phí API inpainting/lượt vào mô hình tài chính (không còn = 0).
- `Technical/Inpainting/` (LaMa Refiner tự host) → đánh dấu là **nghiên cứu cho phase sau / hướng on-device tương lai**, không phải build MVP.
