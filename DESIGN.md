---
derives_from: []
---
# Design System — YourSpace (M1 Web Validation)

> Nguồn chuẩn thiết kế. Đọc file này TRƯỚC mọi quyết định UI. Tạo bởi `/design-consultation` 2026-07-24.
> Preview tham chiếu: `~/.gstack/projects/saig0nvang-Your-Space-Project/designs/design-system-20260724/preview.html`

## Product Context
- **Là gì:** web app visual-commerce nội thất — user đặt đồ 3D vào ảnh phòng thật, xem có hợp không rồi mới mua.
- **Cho ai:** người trẻ VN 25–35, có gu, coi không gian là bản sắc.
- **Ngành/peers:** interior visual commerce (IKEA Kreativ); tham chiếu thẩm mỹ: Kinfolk, De La Espada, TRNK.
- **Loại:** web app canvas-3D làm trung tâm (không login, một-phiên).

## Aesthetic Direction
- **Hướng:** Gallery editorial — giao diện như phòng trưng bày ấm, tĩnh; ảnh phòng + đồ là ngôi sao.
- **Decoration:** minimal → intentional (chữ + whitespace làm chính; texture giấy ấm rất nhẹ trên panel, KHÔNG lên canvas).
- **Mood — "điều đáng nhớ":** *"Hóa ra phòng mình hợp đồ này"* (tự tin trước khi mua) + cảm giác **đơn giản, không ồn ào, trung tính** như đọc tạp chí nội thất / xem showroom nghệ thuật.
- **Nguyên tắc vàng:** UI **tàng hình**. Màu đến từ chính phòng + đồ. Accent chỉ ở khoảnh khắc quyết định.

## Typography
- **Display/Hero:** **Fraunces** (serif editorial, optical sizing) — dùng tiết chế cho heading & khoảnh-khắc, KHÔNG cho body/control.
- **Body/UI:** **Instrument Sans** (humanist sans, sạch, tĩnh).
- **UI/Labels:** Instrument Sans.
- **Data/giá:** Instrument Sans với `font-variant-numeric: tabular-nums`.
- **Loading:** Google Fonts — `https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..600;1,9..144,300..500&family=Instrument+Sans:ital,wght@0,400..600;1,400&display=swap` (M1; cân nhắc self-host để privacy/perf sau).
- **Scale (rem, base 16px):** hero clamp(2.5–5.25rem/300) · h2 2.125rem/300 · h3 1.5rem/400 · body 1.0625rem · UI 0.9375rem · caption 0.75rem. Line-height: heading 1.1, body 1.55.
- **Nguyên tắc:** heading nhẹ (weight 300–400), italic Fraunces cho nhấn cảm xúc; serif là "gia vị", không phủ khắp.

## Color
- **Approach:** restrained — warm-neutral gallery + MỘT accent đất nung.
- **Paper (nền):** `#EDE8E0` · **Paper-2:** `#E4DDD2` · **Card:** `#F5F1EA`
- **Ink (chữ):** `#1A1A1A` · **Ink-soft:** `#4A453E` · **Muted:** `#8A8275` · **Line:** `#D8D0C4`
- **Accent — Clay:** `#B0654A` (hover `#93503A`) — **CHỈ** dùng ở CTA chính (mua/lead) và điểm nhấn hiếm.
- **Phụ — Sage:** `#7C8471` (dùng rất tiết chế nếu cần trạng thái/nhấn phụ).
- **Semantic (muted):** success `#5C7355` · warning `#B08A3A` · error `#9E4B3F`.
- **Dark mode** (gallery tối ấm): paper `#1C1A17`, card `#26231D`, ink `#EDE8E0`, line `#332F28`, clay sáng lên `#C87A5E`. Giảm bão hòa ~10–15%.

## Spacing
- **Base:** 8px. **Density:** spacious (gallery = thoáng).
- **Scale:** xs 8 · sm 16 · md 24 · lg 32 · xl 48 · 2xl 64 (px).

## Layout
- **Approach:** hybrid — **màn chọn style** creative-editorial (bất đối xứng, kiểu tạp chí); **màn canvas** app-shell canvas-first (canvas chiếm sân khấu, panel UI mỏng ở rìa).
- **Max content width:** 1120px (màn nội dung); canvas full-bleed.
- **Border radius:** sm 8px · md 12px · lg 14px · pill 999px. Không bo tròn "bong bóng" đồng loạt.
- **Panel dự toán:** cột phải ~300px, nền card, giá tabular, 1 CTA clay full-width, dòng consent nhỏ.

## Motion
- **Approach:** minimal-functional + đặt đồ có cảm giác *vật lý*.
- **Easing:** enter `ease-out` · exit `ease-in` · move `ease-in-out`; đặt/kéo đồ dùng easing hơi "nặng" (mượt, có quán tính nhẹ).
- **Duration:** micro 50–100ms · short 150–250ms · medium 250–400ms. Không choreography phô trương (sẽ phá sự tĩnh).

## Anti-patterns (cấm)
Không gradient tím/xanh-tech · không 3-cột icon-tròn · không center-mọi-thứ · không Inter/Roboto/Space Grotesk · không nút gradient · không bo tròn bong bóng đồng loạt · serif KHÔNG dùng cho control/body.

## Decisions Log
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-07-24 | Tạo design system ban đầu | `/design-consultation`. Gallery-editorial + serif (Fraunces) + warm-neutral + clay accent, canvas-first UI tàng hình. Khớp "điều đáng nhớ" của founder (tĩnh, trung tính, tạp chí/showroom). |
| 2026-07-24 | Serif trong app (không chỉ marketing) | RISK có chủ đích: tín hiệu "curated taste", khác IKEA-Kreativ sans utilitarian. Giới hạn ở heading. |
| 2026-07-24 | Accent đất nung, không xanh/đen | Ấm, buộc vào câu chuyện "nhà = bản sắc"; dùng muted + chỉ ở CTA. |
