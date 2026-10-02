---
derives_from: [D1@d0d780f3, D2@499c7e4d, D3@7fbc47fb, D3b@4248a41d, D4@bb7f1ffe, D5@15cdc73a, D7@96011236, D8@4efe52c0, D10@4b681365]
---
# YourSpace M2 — App mobile: UX & hệ thiết kế — Design Spec

> Ngày: 2026-09-25 · Branch: `m1-build` · Trạng thái: **founder đã duyệt hướng và danh sách màn**; mock đang dựng trên Claude Design.
> **Cập nhật 2026-10-02 (D10, PRD v2.0):** thêm Thiết kế có sẵn (2 tab Phòng mẫu · Nhà hàng xóm), Dùng làm mẫu 2 nhánh, đăng thiết kế
> và báo cáo (nhóm màn 15, M2+); đăng thiết kế là chỗ thứ ba cần xác minh SĐT; dọn phòng gộp thành công cụ trong canvas 05, dùng xen kẽ
> với thêm đồ; mua cả bộ một lần thanh toán, tách đơn theo nhà cung cấp; mua xong về đúng nơi xuất phát; lưu không cần đăng nhập;
> giả định mở 4 (tự nhận diện đồ vật) đã chốt là chạm để chọn. Sửa ở mục 1, 2, 3, 4, 7.
> **Mock trên canvas Claude Design (mục 8) CHƯA được cập nhật theo các thay đổi này** — vẫn theo luồng và danh sách màn ngày 2026-09-25.
> Nguồn: `decisions/` D1–D10, `Product/PRD.md`, spec M1 `2026-07-24-m1-web-validation-design.md`.
> Mock và hệ thiết kế là artifact trên claude.ai (mục 8). Spec này ghi lại quyết định và cấu trúc để build M2 không phải đoán.

---

## 0. Mục tiêu & phi mục tiêu

**Mục tiêu:** mock end-to-end app native M2 (iOS/Android) — khám phá phong cách → chụp & hiểu phòng (depth) → dọn phòng
(tách đồ + inpainting) → đặt đồ 3D → dự toán → thanh toán giữ tiền (escrow) → hậu mãi — với design system có theme sáng/tối.
Mọi hình ảnh AI trong mock là đầu ra thật của pipeline (Depth Anything V2, SlimSAM, LaMa, model 3D CC0) trên ảnh phòng thật.

**Phi mục tiêu:** viết code M2; đổi quyết định D1–D9. Mock này nằm đúng D2 (escrow ở M2) và D5 (mobile native ở M2).

## 1. Quyết định chốt trong brainstorm 2026-09-25

| Chủ đề | Chốt | Ghi chú |
|---|---|---|
| Mốc | App native M2 | Màn nào web M1 dùng lại được thì đánh dấu [M1] |
| Hướng thị giác | **C · Mềm & chất liệu**, áp dụng **toàn thương hiệu** (web M1 + app M2) | Chọn từ 4 hướng dựng thật trên canvas. `DESIGN.md` sẽ được thay theo C |
| Thanh toán | Trả đủ qua **đối tác thanh toán được cấp phép** (giữ tiền tới khi nhận hàng) + **trả góp 0% qua đối tác** (đối tác trả đủ vào khoản giữ tiền) | Không COD, không đặt cọc — giữ nguyên tinh thần escrow của D2 |
| Khám phá | **Duyệt phong cách** (3 phong cách, 8 món mỗi phong cách) + **Thiết kế có sẵn** mở từ chi tiết phong cách (cập nhật 2026-10-02, D10) | Không quiz (PRD xếp Style Quiz vào LATER). Thiết kế có sẵn là M2+ |
| Module thêm | Kết nối chuyên gia (danh sách, hồ sơ, đặt lịch, chat) · Yêu thích + báo giảm giá · Gửi người khác duyệt | Chuyên gia đầy đủ là M2+ theo D7 |
| Tài khoản | **Chỉ xác minh SĐT bằng OTP ở ba chỗ: thanh toán, đặt lịch chuyên gia, đăng thiết kế lên Nhà hàng xóm** (chỗ thứ ba thêm theo D10) | Không có màn đăng nhập ở đầu app. Dùng, thử, lưu trên máy không cần đăng nhập |
| Ảnh & phòng | Phòng và ảnh **lưu trên máy**; đồng bộ lên tài khoản là tùy chọn, **consent riêng** | Khớp D3: ảnh gửi lên chỉ để xử lý và xóa ngay |
| Xóa đồ cũ | Bắt đầu từ **cú chạm của người dùng** (SAM theo điểm), không tự nhận diện/gắn nhãn | **Đã chốt ở D10:** chạm để chọn như IKEA Kreativ, không tự xóa. (Trước 2026-10-02: tự nhận diện cần thêm model — chưa quyết) |
| Thiết kế có sẵn | **2 tab: Phòng mẫu** (YourSpace tuyển chọn và dựng) · **Nhà hàng xóm** (người dùng đăng) | D10, M2+. Không dùng tên ngụ ý có kiến trúc sư tuyển chọn |
| Dùng làm mẫu | **2 nhánh:** *Dùng cả không gian* (nhà cùng layout: bản sao ảnh phòng + cách bày của người đăng vào Phòng của tôi để chỉnh tiếp) · *Lấy bộ món* (các món vào khay thành một tab riêng, người dùng tự đặt vào ảnh phòng mình) | Bản gốc không bị đổi; mọi bản dùng lại ghi nguồn. Người đăng tắt riêng được nhánh dùng cả không gian (chỉ nhánh này sao chép ảnh phòng) |
| Cộng đồng | Người đăng **không được chia hoa hồng**; phần thưởng là **thả tim** (lưu luôn vào Yêu thích), lượt dùng làm mẫu và ghi nguồn. **Kiểm duyệt hậu kiểm:** hiện ngay khi đăng; đủ vài lượt báo cáo từ các tài khoản khác nhau → ẩn chờ xem xét → khôi phục hoặc gỡ hẳn | Cơ quan quản lý yêu cầu → gỡ trong 24 giờ (Nghị định 147/2024). Con số "vài lượt" chưa chốt (mục 7) |
| Mua cả bộ | Mua lẻ hoặc cả bộ trong một sheet; mua cả bộ = **một lần thanh toán, hệ thống tách đơn theo nhà cung cấp** | Mua xong về đúng nơi xuất phát (mục 4) |
| Dọn phòng | **Công cụ trong canvas đặt đồ (05)**, dùng xen kẽ với thêm đồ — không còn là bước riêng trước khi đặt đồ | Màn nhóm 04 giữ mã, là các trạng thái của công cụ này |

## 2. Điều hướng

- Tab bar 5 ô: **Khám phá · Phòng · [＋ Thử phòng] · Yêu thích · Tôi**. Giỏ hàng ở góc trên các màn mua sắm. Đơn hàng nằm trong Tôi;
  đơn cần xác nhận nhận hàng hiện nhắc ở thông báo và trong Tôi.
- Ba cửa vào: **Thử phòng** (chụp ảnh luôn) · **Khám phá phong cách** · **Phòng của tôi** (người quay lại).
- Luồng chính (viết lại 2026-10-02; mock trên canvas vẫn chạy luồng cũ, dọn phòng trước rồi mới đặt đồ): Khám phá → chi tiết phong cách →
  chụp → xem lại + consent → quét phòng → xác nhận mặt sàn → chọn phong cách cho phòng → **canvas đặt đồ: thêm đồ và dọn phòng (chạm để
  chọn) dùng xen kẽ**, đổi chất liệu, hoàn tác, thanh dự toán luôn hiện → dự toán → sheet mua lẻ hoặc cả bộ → OTP (chỉ lần đầu) →
  giao hàng → thanh toán → VietQR → thành công → **nút chính quay về nơi xuất phát** (không gian đang sửa). Đơn hàng theo dõi trong Tôi:
  chi tiết đơn → xác nhận nhận hàng → đánh giá.
- Luồng phụ — Thiết kế có sẵn → mua: Khám phá → chi tiết phong cách → Thiết kế có sẵn (`15-1`) → chi tiết thiết kế (`15-2`) → mua lẻ
  hoặc cả bộ (một lần thanh toán, tách đơn theo nhà cung cấp) → OTP → … → thành công → **về đúng tab thiết kế đang xem**.
- Luồng phụ — Thiết kế có sẵn → dùng làm mẫu: `15-2` → sheet "Dùng thiết kế này thế nào?" (`15-3`):
  *Dùng cả không gian* → bản sao vào Phòng của tôi (`03-0`) → canvas `05-1` để chỉnh tiếp, mua xong về không gian đó;
  *Lấy bộ món* → các món vào khay thành một tab riêng → chụp hoặc chọn ảnh phòng mình (`03-1`) → hiểu phòng → canvas `05-1`.
- Luồng đăng thiết kế: canvas → lưu & chia sẻ (`05-7`) → Đăng lên Nhà hàng xóm → xác minh SĐT nếu chưa (`07-1`, `07-2`) → xem trước ảnh
  công khai + consent + công tắc cho phép dùng cả không gian (`15-4`) → hiện ngay trong tab Nhà hàng xóm. Người xem báo cáo từ `15-2` → `15-5`.

## 3. Danh sách màn (66 màn + 4 màn theme tối)

> Cập nhật 2026-10-02: thêm 5 màn nhóm 15 (trước đó 61 màn + 4 màn theme tối).

| Nhóm | Màn (file trên canvas) | M1 |
|---|---|---|
| 1 · Mở đầu | Màn chào (`Main`), giới thiệu 3 bước (`01-2a` Tìm gu, `01-2b` Thử phòng, `01-2c` Mua an toàn), xin quyền camera (`01-3`) | — |
| 2 · Khám phá | Trang phong cách (`02-1`), chi tiết phong cách (`02-2`), danh sách món có lọc (`02-3`), chi tiết sản phẩm có xem 3D (`02-4`), tìm kiếm (`02-5`) | 02-1…02-4 |
| 3 · Chụp & hiểu phòng | Phòng của tôi (`03-0`), chọn nguồn ảnh (`03-1`), camera có thước cân bằng gyro (`03-2`), xem lại + consent (`03-3`), quét phòng (`03-4`), xác nhận mặt sàn + chiều cao máy (`03-5`), ảnh thư viện: kéo đường chân trời (`03-6`), ảnh khó phân tích F4 (`03-7`) | 03-1…03-7 |
| 4 · Dọn phòng | *Từ 2026-10-02 là công cụ trong canvas `05`, dùng xen kẽ với thêm đồ — không còn là bước riêng.* Chạm chọn (`04-1`), đã chọn (`04-2`), đang xóa (`04-3`), so sánh trước/sau + khôi phục F3 (`04-4`) | cả nhóm |
| 5 · Đặt đồ | **Chọn phong cách cho phòng bằng ô ảnh vuông** (`05-0`, thêm 2026-09-28), canvas + danh mục đã lọc theo phong cách (`05-1`), đang kéo (`05-2`), món đang chọn (`05-3`), xoay trục Y + chỉnh tay F1 (`05-4`), đổi chất liệu (`05-5`), chế độ thủ công F5 (`05-6`), lưu & chia sẻ (`05-7`) | 05-0…05-4, 05-6, 05-7 |
| 6 · Dự toán & giỏ | Dự toán theo nhà cung cấp (`06-1`), giỏ hàng (`06-2`) | 06-1 (nút affiliate/để lại SĐT) |
| 7 · Thanh toán | SĐT (`07-1`), OTP (`07-2`), giao hàng & lịch lắp đặt (`07-3`), chọn phương thức (`07-4`), trả góp (`07-5`), VietQR (`07-6`), thành công (`07-7`, nút chính quay về nơi xuất phát: không gian đang sửa hoặc tab thiết kế đang xem) | — |
| 8 · Đơn hàng | Danh sách (`08-1`), chi tiết + dòng thời gian escrow (`08-2`), xác nhận nhận hàng (`08-3`), báo sự cố (`08-4`), theo dõi khiếu nại (`08-5`), đánh giá (`08-6`) | — |
| 9 · Chuyên gia | Danh sách (`09-1`), hồ sơ (`09-2`), đặt lịch (`09-3`), chat (`09-4`) | — (M1 chỉ thu lead, D7) |
| 10 · Yêu thích | Yêu thích + báo giảm giá (`10-1`, gồm cả thiết kế đã thả tim), thông báo (`10-2`) | — |
| 11 · Gửi duyệt | Tạo link có consent (`11-1`), trang web cho người nhận không cần app (`11-2`), phản hồi trong app (`11-3`) | — |
| 12 · Tôi | Tôi (`12-1`, có chọn giao diện Ban ngày/Buổi tối/Theo máy), quyền riêng tư & dữ liệu (`12-2`), đồng bộ phòng (`12-3`) | — |
| 13 · Trạng thái | Mất mạng (`13-1`), AI tạm ngưng → đặt tay (`13-2`), máy yếu → xem 2D (`13-3`), màn trống (`13-4`) | cả nhóm |
| 14 · Theme tối | Khám phá, Đặt đồ, Thanh toán, Tôi ở theme Buổi tối | — |
| 15 · Thiết kế có sẵn & cộng đồng (thêm 2026-10-02, D10, M2+) | Thiết kế có sẵn, 2 tab Phòng mẫu · Nhà hàng xóm (`15-1`), chi tiết thiết kế: ảnh, tác giả, thả tim, danh sách món, tổng giá (`15-2`), sheet "Dùng thiết kế này thế nào?" 2 nhánh Dùng cả không gian · Lấy bộ món (`15-3`), đăng thiết kế: xem trước ảnh công khai + consent + công tắc cho phép dùng cả không gian (`15-4`), báo cáo thiết kế (`15-5`) | — |

## 4. Nguyên tắc UX xuyên suốt

- **AI chỉ gợi ý.** Mọi thay đổi trên ảnh cần thao tác chủ động; sau mỗi hành động AI hiện chip nói AI đã làm gì và cách sửa
  ("Đã tự căn theo mặt sàn · kéo để chỉnh"). Độ tin cậy thấp → chế độ tự chỉnh. Fallback PRD F1–F6 ánh xạ vào màn 05-4 (F1), 05-2 (F2),
  04-4 (F3), 03-7 (F4), 05-6/13-2 (F5), nút Hoàn tác trên mọi màn canvas (F6).
- **Consent thật.** Trước lần gửi ảnh đầu: "Ảnh được gửi lên hệ thống để xử lý và xóa ngay sau đó." Không bao giờ nói hay ngụ ý ảnh
  không rời khỏi máy. Link nhờ duyệt và đồng bộ tài khoản mỗi thứ có consent riêng vì chúng lưu ảnh trên máy chủ. Đăng lên Nhà hàng xóm
  cũng có consent riêng vì ảnh phòng được công khai (`15-4`).
- **Tiền.** Luôn nói tiền được giữ tại **đối tác thanh toán được cấp phép**, không phải YourSpace (ràng buộc pháp lý D2). Nhà cung cấp
  nhận tiền khi người dùng bấm "Xác nhận đã nhận hàng" sau checklist; báo sự cố thì tiền tiếp tục được giữ.
- **Về đúng nơi xuất phát.** Mua từ không gian thì nút chính ở `07-7` về không gian đó; mua từ thiết kế có sẵn thì về đúng tab thiết kế
  đang xem (D10).
- **Lưu không cần đăng nhập.** Lưu bất cứ lúc nào, kể cả sau khi đã mua một phần; món đã mua mang nhãn "Đã mua" trong không gian.
  Xác minh SĐT chỉ ở ba chỗ: thanh toán, đặt lịch chuyên gia, đăng thiết kế lên Nhà hàng xóm.
- **Tiếp cận.** Vùng chạm ≥ 44px; tương phản chữ ≥ 4.5:1 ở cả hai theme; trạng thái luôn có icon + chữ; cỡ chữ câu thường ≥ 12px.

## 5. Hệ thiết kế C — tóm tắt

Chi tiết đầy đủ (token, component, brand book) ở artifact Design System (mục 8).
- **Chữ:** chỉ Be Vietnam Pro (thiết kế cho tiếng Việt). Thang: display-lg 28/34 · display-md 22/28 · title 17/22 · body 15/22 · caption 12/16.
- **Màu:** nền yến mạch `#F3EEE6`, thẻ kem `#FBF8F3`, vải lanh `#EAE1D4`, chữ `#2F2A24`; **terracotta `#B25D3A`** là hành động (tối đa một
  nút đặc mỗi màn); **sage `#5E6E53`** là niềm tin (bảo vệ người mua, AI, xác nhận). Theme Buổi tối có bộ giá trị riêng, accent sáng lên,
  chữ trên accent chuyển tối.
- **Chữ ký:** hệ mẫu vật liệu (gỗ sồi, óc chó, vải lanh, mây, đá mài, đất nung, da bò, thép) dùng xuyên suốt — bộ lọc, chọn chất liệu,
  thẻ phong cách, wordmark.
- **Bo góc theo vai trò:** ảnh 20 · thẻ 24 · sheet 32 · nút/chip viên thuốc; chữ và danh sách giữ vuông.
- **Lỗi của `DESIGN.md` cũ (lý do phải thay, kể cả cho web M1):** Instrument Sans không có glyph tiếng Việt (dải U+1EA0–1EF1 bị bỏ,
  chữ như "ọ, ự, ế" rơi về font hệ thống); chữ trắng trên clay `#B0654A` chỉ 4.37:1; muted `#8A8275` trên nền giấy khoảng 3.1:1.

## 6. Bằng chứng kỹ thuật thu được khi dựng mock

Chạy trên CPU máy dev (onnxruntime-node, fp32), **một ảnh phòng** — là dữ liệu định hướng, không thay spike rubric ≥70% của M1:
- Depth Anything V2 small: suy luận ~1 giây. Cần chuẩn hóa log vì vật gần (cây treo) kéo giãn dải giá trị.
- SlimSAM: mã hóa ảnh ~1,8 giây, mỗi mask 0,2–0,4 giây. Bản ONNX bỏ qua prompt dạng hộp — chỉ prompt điểm dùng được.
- LaMa (512×512, fp32 208 MB): ~2 giây mỗi lượt. Xóa sạch sofa + bàn một lượt trên vùng cắt ~1080 px khi mask nới 14 px và kéo thêm
  45 px xuống dưới (để xóa bóng). **Không dựng lại được chân tường bị che** (thành vệt xám mờ); vùng lấp hơi mềm khi phóng 512 → 1080.
  Xóa hai lượt (bàn trước, sofa sau) hoặc chia ô đều sinh "bóng ma" đồ cũ.
- Ảnh chuyên nghiệp đã chỉnh thẳng đường dọc có đường chân trời ở 58% chiều cao ảnh — ảnh điện thoại thật sẽ khác. Đọc tư thế máy
  (gyro) lúc chụp trong app, như `apps/web/app/capture/page.tsx` đang thử, là hướng đáng giữ.

## 7. Giả định mở cần founder chốt

1. Hạn báo sự cố sau khi nhận hàng (mock dùng 3 ngày) và có tự chuyển tiền cho nhà cung cấp khi hết hạn không.
2. Đối tác thanh toán giữ tiền và đối tác trả góp cụ thể (mock để trống tên, không dùng logo).
3. Tên nhà cung cấp, giá, chuyên gia trong mock là dữ liệu mẫu.
4. **ĐÃ CHỐT — chạm để chọn (D10, 2026-10-02).** ~~Có thêm model tự nhận diện đồ vật hay giữ chạm-để-chọn.~~
5. DPIA cho hai luồng lưu ảnh trên máy chủ: link nhờ duyệt (ảnh phối cảnh, mock đặt hết hạn sau 7 ngày) và đồng bộ tài khoản.
6. Bộ icon chính thức và logo (hiện dùng wordmark + ba chấm vật liệu).
7. Giấy phép mạng xã hội theo Nghị định 147/2024 khi mở Nhà hàng xóm — **cần luật sư** xác nhận YourSpace có thuộc diện phải xin phép
   không (D10). Ảnh phòng công khai cần consent riêng theo NĐ13.
8. Con số "vài lượt báo cáo" từ các tài khoản khác nhau để ẩn một thiết kế chờ xem xét.
9. Ngưỡng số thiết kế để mở tab Nhà hàng xóm (tránh tab trống lúc đầu; Phòng mẫu gánh nội dung giai đoạn đầu).
10. Ai dựng nội dung Phòng mẫu.

## 8. Artifact

- So 4 hướng thị giác (đã chọn C): https://claude.ai/artifact/FLxL7mLnjNUAnagZjhKm2a
- Design System "YourSpace": https://claude.ai/artifact/914LiXuh4cqEqDVq5kCZp2
- App M2 (65 màn, bấm được ở chế độ Play): https://claude.ai/artifact/66TcMVGN97kfCCfmBxkdkj

**Bước tiếp:** thay `DESIGN.md` theo hệ C (có ghi Decisions Log); chuyển web M1 sang Be Vietnam Pro và token C; chốt các giả định mục 7.
