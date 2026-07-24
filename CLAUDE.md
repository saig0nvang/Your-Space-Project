# YourSpace — Repo Guide

Nền tảng visual-commerce nội thất: user đặt đồ 3D vào ảnh phòng thật → xem hợp không → mua. Đang xây **M1 — Web Validation** (web-first, ~4–6 tuần, solo).

## Nguồn chân lý (đọc trước khi làm)
- **Định hướng sản phẩm:** `Product_research/Decisions_Log_2026-07-23.md` (6 quyết định D1–D6). KHÔNG tự ý đảo ngược.
- **Spec kỹ thuật M1:** `docs/superpowers/specs/2026-07-24-m1-web-validation-design.md`.
- **PRD:** `Product/PRD.md`.

## Design System
Luôn đọc **`DESIGN.md`** trước mọi quyết định UI/visual. Font (Fraunces + Instrument Sans), màu (warm-neutral + clay accent chỉ ở CTA), spacing, layout, motion đều định nghĩa ở đó. Không lệch nếu chưa được duyệt. Ở chế độ QA, flag code không khớp `DESIGN.md`.

## Stack M1 (theo spec)
Next.js (App Router) + TypeScript + React-Three-Fiber. Monorepo: `packages/core` (domain thuần TS, tái dùng M2) + `apps/web`. AI cloud qua Replicate (depth server-side/cache · segmentation · inpainting) sau `AIGateway`. Stateless, không login. Deploy Vercel.

## Nguyên tắc cốt lõi
- Compositing: **tách occlusion (relative depth) khỏi scale (floor plane + chiều cao camera)**. Depth = 1 lần/ảnh.
- Rủi ro #1 = độ thật của compositing → **spike tuần 1**, fallback đặt đồ thủ công.
- AI chỉ **gợi ý**; mọi thay đổi canvas cần thao tác chủ động của user; low-confidence → manual mode.
- Privacy: consent thật ("ảnh gửi lên xử lý & xóa ngay"), KHÔNG dùng câu "không upload ảnh".
