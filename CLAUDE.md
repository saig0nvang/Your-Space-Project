# YourSpace — Repo Guide

Nền tảng visual-commerce nội thất: user đặt đồ 3D vào ảnh phòng thật → xem hợp không → mua. Đang xây **M1 — Web Validation** (web-first, ~4–6 tuần, solo).

## Nguồn chân lý (đọc trước khi làm)
- **Định hướng sản phẩm:** `decisions/` (D1–D10, mỗi file một quyết định, bất biến). KHÔNG tự ý đảo ngược. Đổi ý = tạo bản ghi mới với `supersedes:`/`amends:`, chạy `pnpm kb:impact <id>` trước để biết tài liệu nào bị ảnh hưởng. `Product_research/Decisions_Log_2026-07-23.md` là snapshot lịch sử, không còn là nguồn chân lý.
- **Spec kỹ thuật M1:** `docs/superpowers/specs/2026-07-24-m1-web-validation-design.md`.
- **PRD:** `Product/PRD.md` (v2.0 — flow chuẩn ở §4.2; user story theo epic ở `Product/prd/epics/`).

## Design System
Luôn đọc **`design-system/yourspace/MASTER.md`** trước mọi quyết định UI/visual (`DESIGN.md` chỉ trỏ tới đó). Hướng hiện hành từ 2026-10-03: **A · Phòng trưng bày** (Exaggerated Minimalism — đen/trắng, vàng đồng cho giá trị, Bricolage Grotesque cho tiêu đề, ảnh dẫn dắt) do ui-ux-pro-max sinh, founder chọn sau khi xem preview 3 hướng; token màu, chữ, spacing, component đều định nghĩa trong MASTER.md. Không lệch nếu chưa được duyệt. Ở chế độ QA, flag code không khớp MASTER.md.

## Stack M1 (theo spec)
Next.js (App Router) + TypeScript + React-Three-Fiber. Monorepo: `packages/core` (domain thuần TS, tái dùng M2) + `apps/web`. AI cloud qua Replicate (depth server-side/cache · segmentation · inpainting) sau `AIGateway`. Stateless, không login. Deploy Vercel.

## Nguyên tắc cốt lõi
- Compositing: **tách occlusion (relative depth) khỏi scale (floor plane + chiều cao camera)**. Depth = 1 lần/ảnh.
- Rủi ro #1 = độ thật của compositing → **spike tuần 1**, fallback đặt đồ thủ công.
- AI chỉ **gợi ý**; mọi thay đổi canvas cần thao tác chủ động của user; low-confidence → manual mode.
- Privacy: consent thật ("ảnh gửi lên xử lý & xóa ngay"), KHÔNG dùng câu "không upload ảnh".

## UI/UX skills — phân vai
Stack: react-native

**Nguồn sự thật duy nhất cho visual system:** design-system/yourspace/MASTER.md (do ui-ux-pro-max sinh ra).
DESIGN.md chỉ tham chiếu tới MASTER.md, không định nghĩa lại token màu, font hay spacing.

**ui-ux-pro-max = giai đoạn QUYẾT ĐỊNH**
- Dùng khi: tạo màn hình hoặc component mới; chọn style, palette, font; cần guideline theo stack.
- Luôn truyền --stack react-native.
- Không chạy --persist --force nếu tôi chưa đồng ý.

**impeccable = giai đoạn REVIEW / POLISH**
- CHỈ dùng khi tôi gọi /impeccable <lệnh>. Không tự kích hoạt impeccable khi build màn hình mới.
- Mọi lệnh refine phải giữ nguyên token trong MASTER.md. Không thay DESIGN.md hay đổi visual system, trừ khi tôi yêu cầu redesign rõ ràng.
- Trên native, dùng reference bản native cho audit và adapt.

**Khi detector của Impeccable báo lỗi** ở một lựa chọn có chủ đích trong MASTER.md (font, màu, style):
- KHÔNG revert.
- Thêm vào danh sách ignore kèm lý do (npx impeccable ignores add-value ... --reason "...") và báo tôi.

**Không chạy full flow của cả 2 skill trong cùng một task.**

**Quy trình theo công đoạn (founder duyệt 2026-10-03; mục tiêu: UI đủ để launch, quảng cáo, pitching).** Founder lo flow (PRD §4.2 + flow HTML); thiết kế UI giao cho skill. Mỗi công đoạn chỉ một skill chạy trọn quy trình, skill kia chỉ dùng làm checklist:
1. Chốt hệ nhìn — ui-ux-pro-max (`--design-system`, `--domain`, `--stack react-native`); founder chọn preview rồi mới `--persist --force` thay MASTER.
2. Áp hệ mới vào app — ui-ux-pro-max `--stack react-native` (+ page override).
3. Nâng màn chủ lực — impeccable (`onboard`, `bolder`, `distill`, `layout`, `typeset`, `delight`), giữ token MASTER.
4. Chuyển động — impeccable `animate`.
5. Kiểm chất lượng — impeccable `critique`, `audit` (native), `harden`, `polish`.
Ở công đoạn 3–5, Claude được tự gọi lệnh impeccable. Không dùng new-work / concept-seed của impeccable (đụng vai của ui-ux-pro-max); không để impeccable ghi token vào DESIGN.md.

**Font** phải hỗ trợ đầy đủ tiếng Việt (có subset vietnamese). Kiểm tra trước khi chọn.
