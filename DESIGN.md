---
derives_from: [D10@4b681365]
---
# Design System — YourSpace (toàn thương hiệu: web M1 + app M2)

> Nguồn chuẩn thiết kế. Đọc file này TRƯỚC mọi quyết định UI.
> Hướng hiện hành: **"Mềm & chất liệu"** (founder chọn 2026-09-25 sau khi so 4 hướng dựng thật).
> Bản đầy đủ (token sáng/tối, 22 component có preview, brand book): Design System "YourSpace" trên claude.ai —
> https://claude.ai/artifact/914LiXuh4cqEqDVq5kCZp2 · Mock app M2: https://claude.ai/artifact/66TcMVGN97kfCCfmBxkdkj ·
> Spec: `docs/superpowers/specs/2026-09-25-m2-mobile-app-design.md`. File này là bản tóm tắt để code theo; khi lệch nhau, token trên artifact là chuẩn.

## Product Context
- **Là gì:** app visual-commerce nội thất — người dùng đặt đồ 3D vào ảnh phòng thật, xem có hợp không rồi mới mua.
- **Cho ai:** người trẻ VN 25–35, có gu, coi không gian là bản sắc; sợ phòng "đại trà, giống người già".
- **Bề mặt:** web M1 (validation, không login) và app native M2 (escrow; xác minh SĐT bằng OTP khi thanh toán, đặt lịch chuyên gia hoặc đăng thiết kế lên Nhà hàng xóm).

## Aesthetic Direction
- **Hướng:** Mềm & chất liệu — như một thư viện mẫu vật liệu: ấm, ánh sáng ban ngày, cầm nắm được, dễ gần.
- **Nguyên tắc:** (1) ảnh phòng là nhân vật chính; (2) **vật liệu là chữ ký** — chấm mẫu gỗ sồi, óc chó, vải lanh, mây, đá mài,
  đất nung, da bò, thép dùng xuyên suốt (wordmark, bộ lọc, chọn chất liệu, thẻ phong cách); (3) bo góc theo vai trò, không đồng loạt;
  (4) AI gợi ý, người dùng quyết; (5) nói thật về dữ liệu và tiền.
- **Mood — "điều đáng nhớ":** *"Hóa ra phòng mình hợp đồ này"* — tự tin trước khi mua, không ồn ào.

## Typography
- **Một họ chữ: Be Vietnam Pro** (thiết kế cho tiếng Việt — dấu chồng tầng hiển thị đúng). Không serif.
- **Loading:** `https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:ital,wght@0,400;0,500;0,600;1,400&display=swap`
- **Thang:** display-lg 28/34 · 600 · -0.015em — display-md 22/28 · 600 — title 17/22 · 600 — title-sm 15/20 · 600 — body 15/22 · 400 —
  body-sm 14/20 — label 13/18 · 500 — caption 12/16 · 500 — overline 11/14 · 600 · IN HOA · 0.04em — price-lg 22/28 · 600 — price 15/20 · 600.
- Giá luôn `font-variant-numeric: tabular-nums`. Câu thường ≥ 12px; 11px chỉ cho overline in hoa; không dùng 10px.

## Color
| Token | Sáng (Ban ngày) | Tối (Buổi tối) | Dùng cho |
|---|---|---|---|
| surface-page | `#F3EEE6` | `#1B1814` | Nền trang (yến mạch) |
| surface-raised | `#FBF8F3` | `#25211C` | Thẻ, sheet, tab bar (kem) |
| surface-sunken | `#EAE1D4` | `#2E2923` | Ô ảnh sản phẩm, chip (vải lanh) |
| line / line-strong | `#E2D8CA` / `#8F8373` | `#3A342C` / `#7A7064` | Đường chia / viền control (≥3:1) |
| ink / ink-soft / ink-muted | `#2F2A24` / `#5C5349` / `#6E6558` | `#F3EEE6` / `#CFC5B7` / `#A89E90` | Chữ chính / phụ / meta (muted không đặt trên surface-sunken ở theme sáng) |
| terracotta / -strong / -soft | `#B25D3A` / `#9A4A2B` / `#F0DCCF` | `#D98A66` / `#E6A07E` / `#4A2E22` | **Hành động** — tối đa MỘT nút đặc mỗi màn; chữ-link; nền đang chọn |
| sage / -strong / -soft | `#5E6E53` / `#4A5841` / `#DEE3D5` | `#9BAE8C` / `#B5C6A7` / `#2C3326` | **Niềm tin** — bảo vệ người mua, AI, xác nhận |
| on-accent | `#FFFFFF` | `#1B1814` | Chữ trên terracotta/sage |
| success / warning / danger / info | `#4A6B40` / `#8A6417` / `#A2402C` / `#3F5F7A` | `#9CC08F` / `#E0B458` / `#EC8C74` / `#8FB3CF` | Trạng thái — luôn kèm icon + chữ |
| mat-* (cả hai theme) | oak `#CDA878` · walnut `#6E4B34` · linen `#E7DECF` · rattan `#B99257` · stone `#A8A196` · clay `#B8704E` · leather `#A4623A` · steel `#9AA0A6` | | Chấm mẫu vật liệu, không làm nền chữ |

Mọi cặp chữ/nền đạt ≥ 4.5:1 ở cả hai theme (đã kiểm bằng script). Màn camera và xem lại ảnh vừa chụp luôn tối (ảnh + scrim, chữ trắng).

## Spacing
- Nhịp 4/8: 4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48 · 64. Lề màn 16; khoảng giữa thẻ 12; padding thẻ 16; padding sheet 20.

## Layout
- Khung chuẩn app 390 × 844; chừa 54px trên, 34px dưới cho thanh hệ điều hành. Tab bar: Khám phá · Phòng · [＋ Thử phòng] · Yêu thích · Tôi.
- Canvas đặt đồ: ảnh tràn màn, điều khiển nổi trên `surface-overlay` + `shadow-float`; bottom sheet danh mục; thanh tổng tiền.
- Web M1: cùng token và component; bố cục canvas-first như cũ, thay thẻ/nút theo hệ này.
- **Bo góc theo vai trò:** xs 8 · sm 14 · md 18 (tile, input) · img 20 (ảnh) · lg 24 (thẻ) · xl 28 · sheet 32 · pill 999 (nút, chip). Chữ và danh sách giữ vuông.
- **Bóng ấm:** card `0 10px 30px rgba(92,72,50,.10)` · float `0 6px 16px rgba(40,30,20,.14)` · cta `0 4px 10px rgba(178,93,58,.30)` · sheet `0 -8px 30px rgba(47,42,36,.12)`.

## Motion
- Tối giản, có chức năng: micro 90ms · short 200ms · medium 320ms; vào `cubic-bezier(.2,.8,.2,1)`, ra `cubic-bezier(.4,0,1,1)`.
- Thả đồ xuống sàn: `cubic-bezier(.3,1.15,.4,1)` (vượt nhẹ rồi dừng — có trọng lượng). Vạch quét phòng một lượt 1400ms.

## Voice (tóm tắt — đầy đủ trong brand book)
- Gọi người dùng là "bạn"; câu ngắn, động từ trước; không dấu chấm than, không emoji. Tiền `12.400.000 ₫`; kích thước `101 × 119 × 117 cm`.
- Câu bắt buộc: consent "Ảnh được gửi lên hệ thống để xử lý và xóa ngay sau đó."; escrow "YourSpace không cầm tiền của bạn. Khoản thanh
  toán được giữ tại đối tác thanh toán được cấp phép…"; AI "Đã tự căn theo mặt sàn · kéo để chỉnh".

## Anti-patterns (cấm)
Không gradient tím/xanh-tech · không nút gradient · không bo tròn đồng loạt kiểu bong bóng · không emoji · không Inter/Roboto/Space Grotesk ·
không font thiếu glyph tiếng Việt · không hai nút terracotta đặc trên một màn · không dùng màu một mình để báo trạng thái · không vẽ
thanh trạng thái giả trong mock · không nói hay ngụ ý ảnh không rời khỏi máy · không nói YourSpace giữ tiền.

## Decisions Log
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-07-24 | Tạo design system ban đầu | `/design-consultation`. Gallery-editorial + serif (Fraunces) + warm-neutral + clay accent, canvas-first UI tàng hình. |
| 2026-07-24 | Serif trong app (không chỉ marketing) | RISK có chủ đích: tín hiệu "curated taste". Giới hạn ở heading. |
| 2026-07-24 | Accent đất nung, không xanh/đen | Ấm, buộc vào câu chuyện "nhà = bản sắc"; chỉ ở CTA. |
| 2026-09-25 | **Thay toàn bộ hướng thị giác sang "Mềm & chất liệu"** cho web M1 và app M2 | Founder chọn sau khi so 4 hướng dựng thật trên Claude Design (tối/showroom, lưới hiện đại, mềm & chất liệu, editorial cũ làm đối chứng). Dễ gần, hợp thương mại, vật liệu làm chữ ký thương hiệu. Rủi ro đã biết: ít khác biệt hơn — bù bằng hệ mẫu vật liệu + bo góc theo vai trò. |
| 2026-09-25 | Bỏ Instrument Sans và Fraunces; dùng một họ Be Vietnam Pro | Instrument Sans không có glyph tiếng Việt (U+1EA0–1EF1 bị bỏ → "ọ, ự, ế" rơi về font hệ thống, ảnh hưởng cả web M1). Fraunces bị Claude Design xếp vào nhóm font lạm dụng và không hợp hướng mềm. |
| 2026-09-25 | Token mới đạt WCAG AA ở cả hai theme; thêm theme tối "Buổi tối" | Bộ cũ có cặp không đạt: chữ trắng trên clay `#B0654A` 4.37:1, muted `#8A8275` trên nền giấy ~3.1:1. |
