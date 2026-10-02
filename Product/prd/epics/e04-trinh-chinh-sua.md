---
derives_from: [D1@d0d780f3, D3b@4248a41d, D4@bb7f1ffe]
---
[Quay lại PRD YourSpace](../../PRD.md)

# E04 Trình chỉnh sửa: đặt đồ & AI Spatial Placement

Trình chỉnh sửa là màn duy nhất nơi người dùng biến ảnh phòng thật thành căn phòng mình muốn: chọn đồ từ khay theo phong cách, chạm sàn để đặt, để AI tự căn tỷ lệ theo mặt sàn, rồi kéo, xoay, chỉnh tay cho tới khi ưng. Thanh dự toán luôn nằm ở đáy để người dùng thấy tổng tiền mỗi lúc. Xóa đồ cũ là một công cụ cùng màn (E05), dùng xen kẽ với thêm đồ. Mục tiêu là vòng lõi P0 của M1: đặt được ít nhất một món, thấy dự toán, bấm mua.

AI Spatial Placement theo hướng Kreativ-lite (D4): một ảnh, depth tương đối cho occlusion, mặt sàn và chiều cao máy cho tỷ lệ. AI chỉ gợi ý; sau mỗi việc AI làm có một chip nói nó đã làm gì và cách sửa; độ tin cậy thấp thì chuyển sang chế độ tự chỉnh. Chế độ tự chỉnh là đường lui có chủ đích, không phải thất bại.

## Version Control

| Version | Date | Updated by | Note |
| --- | --- | --- | --- |
| 1.0 | 02 Oct 2026 | Phạm Việt Anh | Tạo epic từ PRD v2.0 và flow chốt 02/10/2026. |

## Scope

- **Trong phạm vi** — Chọn phong cách cho phòng (05-0); canvas và khay đồ (tab phong cách, chip loại đồ, tab "Bộ món"); chạm sàn để đặt, tự căn tỷ lệ theo mặt sàn, chip AI; occlusion bằng depth tương đối; kéo, chọn, xoay trục Y, chỉnh tay (F1, F2); đổi chất liệu (05-5); chế độ thủ công khi AI tạm ngưng (F5, 05-6, 13-2); máy yếu xem 2D (13-3); hoàn tác nhiều bước (F6); thanh dự toán luôn hiện; các nút Lưu, Mua, Nhờ duyệt, Đăng nổi trên canvas.
- **Ngoài phạm vi** — Chụp và hiểu phòng (E03); công cụ xóa đồ cũ (E05); nội dung sheet mua và thanh toán (E07); lưu không gian và Phòng của tôi (E06); link nhờ duyệt (E10); đăng lên Nhà hàng xóm (E09). Epic này chỉ định nghĩa nút dẫn sang các luồng đó. Xoay nhiều trục, relighting, dựng 3D toàn phòng (D4).
- **Theo mốc** — M1: web, 2–3 phong cách (spec M1 chốt Japandi · Mid-Century · Bauhaus), catalog 16–24 model, mọi tính năng trừ đổi chất liệu. · M2: app native, đổi chất liệu (05-5), 3 phong cách × 8 món. · M2+: tab "Bộ món" từ Thiết kế có sẵn (D10); nút Đăng lên Nhà hàng xóm.

## User Stories

## E4-US1 — Chọn phong cách cho phòng

 Là Young Aesthetes, tôi muốn chọn phong cách cho căn phòng vừa chụp bằng ảnh để khay đồ chỉ hiện những món hợp gu mình.

**Status:** Draft

**Mốc:** M1 · **Priority:** P0 · **Effort:** S

**Màn:** 05-0

**Pre-condition:** Người dùng vừa hiểu phòng xong (E03) và chưa chọn phong cách nào trong luồng này.

**Post-condition:** Trình chỉnh sửa mở với tab phong cách đã chọn đang hiện trong khay.

#### Acceptance Criteria

- AC1: Màn 05-0 hiện mỗi phong cách bằng một ô ảnh vuông kèm tên; M1 có 2–3 phong cách.
- AC2: Người dùng đến từ chi tiết phong cách (E01) thì phong cách đó đã được chọn sẵn; vẫn đổi được.
- AC3: Chọn phong cách ghi sự kiện `StyleSelected` (bước đầu của Activation, E11).

#### Corner Cases

- CC1: Người dùng mở lại một không gian đã lưu → bỏ qua 05-0, mở thẳng trình chỉnh sửa với các tab như lúc lưu.
- CC2: Ảnh phong cách chưa tải được do mất mạng (13-1) → hiện ô giữ chỗ có tên phong cách, vẫn chọn được.

## E4-US2 — Canvas, khay đồ và thanh dự toán

 Là Young Aesthetes, tôi muốn thấy ảnh phòng mình tràn màn, khay đồ chia theo phong cách và loại đồ, cùng tổng tiền luôn ở đáy để chọn đồ mà không mất dấu chi phí.

**Status:** Draft

**Mốc:** M1 (tab "Bộ món": M2+) · **Priority:** P0 · **Effort:** L

**Màn:** 05-1 · 06-1 (danh sách dự toán mở ra)

**Pre-condition:** Đã có ảnh phòng và cảnh đã hiệu chỉnh (E03), hoặc đang ở chế độ tự chỉnh.

**Post-condition:** Người dùng thấy canvas, khay và thanh dự toán; sẵn sàng đặt món (E4-US3).

#### Acceptance Criteria

- AC1: Ảnh phòng tràn màn; điều khiển nổi trên canvas: thanh công cụ Thêm · Xóa · Chất liệu · Hoàn tác, nút Lưu ở đầu màn, nút Mua trên thanh dự toán, và lối vào Nhờ duyệt, Đăng. Chỉ một nút đặc terracotta trên màn (`DESIGN.md`).
- AC2: Khay có một tab cho mỗi phong cách và chip lọc loại đồ (ví dụ Tất cả · Sofa · Bàn · Đèn · Kệ). Mỗi món hiện ảnh, tên, giá dạng `12.400.000 ₫`.
- AC3: Đổi tab phong cách không xóa, không đổi món đã đặt; một phòng có thể chứa món của nhiều phong cách.
- AC4: Thanh dự toán luôn hiện ở đáy màn với tổng tiền và số món đang có trong không gian; cập nhật ngay khi thêm, xóa món hoặc hoàn tác. Chạm vào thanh mở danh sách món nhóm theo nhà cung cấp (06-1, chi tiết mua ở E07).
- AC5: Người dùng đến từ nhánh "Lấy bộ món" (M2+) thấy thêm tab "Bộ món" ghi nguồn thiết kế, đứng cạnh các tab phong cách.

#### Corner Cases

- CC1: Màn trống (13-4) — chưa có món nào trong không gian → thanh dự toán hiện `0 ₫ · 0 món`, nút Mua mờ; khay gợi ý chạm một món để bắt đầu.
- CC2: Chip loại đồ không có món nào trong phong cách đang chọn → không hiện chip đó.
- CC3: Món có giá tham khảo dạng khoảng giá (M1 dùng giá tham khảo) → dự toán ghi rõ là giá tham khảo; cách cộng khoảng giá chưa chốt (E07).

## E4-US3 — Chạm sàn để đặt, AI tự căn theo mặt sàn

 Là Young Aesthetes, tôi muốn chạm vào sàn trong ảnh để đặt món đồ đúng kích thước thật ở đó để biết ngay món đó có vừa phòng mình không.

**Status:** Draft

**Mốc:** M1 · **Priority:** P0 · **Effort:** L

**Màn:** 05-1

**Pre-condition:** Người dùng đã chọn một món trong khay; cảnh có mặt sàn và camera ảo (E03).

**Post-condition:** Món nằm trên sàn tại điểm chạm, đúng tỷ lệ theo mặt sàn, đã cộng vào dự toán; chip AI hiện.

#### Acceptance Criteria

- AC1: Chạm lên sàn trong ảnh → hệ thống chiếu điểm chạm xuống mặt sàn và đặt món tại đó; đế món luôn chạm sàn, không lơ lửng.
- AC2: Món dùng kích thước thật (mét) từ catalog; tỷ lệ theo khoảng cách tự đúng nhờ mặt sàn và chiều cao máy. Không dùng depth mét tuyệt đối để định tỷ lệ (spec M1 §4).
- AC3: Món bị vật thật đứng trước che khuất đúng chỗ, dựa vào thứ tự trước–sau của depth tương đối (occlusion); có bóng đổ mềm dưới đế và độ sáng khớp ảnh.
- AC4: Sau khi đặt, chip AI hiện đúng câu "Đã tự căn theo mặt sàn · kéo để chỉnh". Không món nào được thêm, xóa hay dời khi người dùng chưa thao tác.
- AC5: Render ≥ 30fps trên thiết bị tầm trung. Đặt món ghi sự kiện `ItemPlaced`.

#### Corner Cases

- CC1: Chạm lên tường hoặc trần thay vì sàn → bám món xuống đường sàn gần nhất (F2), chip nói đã dời xuống sàn.
- CC2: File 3D của món lỗi hoặc không tải được → hiện khối giữ chỗ đúng kích thước và thử tải lại (spec M1 §9); dự toán vẫn tính món đó.
- CC3: Món to hơn khoảng sàn còn trống → vẫn đặt, không tự thu nhỏ; người dùng tự quyết.
- CC4: AI tạm ngưng (13-2) → không có tự căn; xem E4-US6.

## E4-US4 — Kéo, xoay trục Y, chỉnh tay món đã đặt

 Là Young Aesthetes, tôi muốn kéo, xoay và chỉnh kích thước món đã đặt khi AI căn chưa đúng để căn phòng trông đúng như tôi hình dung.

**Status:** Draft

**Mốc:** M1 · **Priority:** P0 · **Effort:** M

**Màn:** 05-2 (đang kéo) · 05-3 (món đang chọn) · 05-4 (xoay trục Y + chỉnh tay)

**Pre-condition:** Có ít nhất một món trong không gian.

**Post-condition:** Món ở vị trí, hướng và kích thước người dùng chọn; mọi thay đổi vào lịch sử hoàn tác.

#### Acceptance Criteria

- AC1: Chạm một món → món được chọn (05-3), hiện tên, giá, và các thao tác: kéo, xoay, chỉnh kích thước, xóa khỏi không gian. Vùng chạm mỗi thao tác ≥ 44px.
- AC2: Kéo món (05-2) → món trượt trên mặt sàn và luôn bám sàn; khi đặt sai chỗ (đồ lơ lửng), món bám xuống đường sàn gần nhất, có lưới mờ giúp căn (F2).
- AC3: Xoay chỉ quanh trục Y (xoay ngang để đổi hướng món), không xoay các trục khác (D4).
- AC4: Người dùng chỉnh kích thước tự do bằng tay cầm (F1). Mỗi lần chỉnh tay ghi sự kiện `ScaleOverride` để đo AI Placement Accuracy (PRD §6).
- AC5: Xóa món khỏi không gian trừ tiền món đó khỏi dự toán ngay.

#### Corner Cases

- CC1: Kích thước người dùng chỉnh chênh lớn so với tỷ lệ AI gợi ý (PRD 1.x dùng mốc > 30%) → vẫn giữ theo ý người dùng, chỉ ghi log; không bật cảnh báo chặn.
- CC2: Kéo món ra ngoài khung ảnh → món dừng ở mép sàn nhìn thấy được, không biến mất.
- CC3: Hai món chồng lên nhau → cho phép; không tự đẩy món ra.
- CC4: Chế độ tự chỉnh (05-6) → mọi thao tác trên vẫn chạy như cũ.

## E4-US5 — Đổi chất liệu món đã đặt

 Là Young Aesthetes, tôi muốn đổi chất liệu hoặc màu của món đã đặt để xem biến thể nào hợp tông sàn và tường nhà mình.

**Status:** Draft

**Mốc:** M2 · **Priority:** P1 · **Effort:** M

**Màn:** 05-5

**Pre-condition:** Có một món đang chọn và món đó có ít nhất hai biến thể chất liệu trong catalog.

**Post-condition:** Món hiện chất liệu mới; dự toán cập nhật theo giá biến thể.

#### Acceptance Criteria

- AC1: Công cụ Chất liệu hiện các biến thể bằng chấm mẫu vật liệu của hệ thiết kế (gỗ sồi, óc chó, vải lanh, mây…) kèm tên và giá.
- AC2: Chọn biến thể → món đổi chất liệu tại chỗ, giữ nguyên vị trí, hướng, kích thước; dự toán cập nhật nếu giá khác.
- AC3: Đổi chất liệu vào lịch sử hoàn tác như mọi thao tác khác.

#### Corner Cases

- CC1: Món chỉ có một biến thể → công cụ Chất liệu mờ và có chữ giải thích.
- CC2: Mất mạng (13-1) khi tải chất liệu → giữ chất liệu cũ, báo lỗi bằng icon + chữ.
- CC3: Máy yếu (13-3) → đổi chất liệu hiện trên ảnh 2D của biến thể thay vì trên mô hình 3D.

## E4-US6 — Đặt tay khi AI tạm ngưng hoặc máy yếu (F5)

 Là Young Aesthetes, tôi muốn vẫn đặt đồ và xem dự toán được khi AI không chạy hay máy tôi yếu để không phải bỏ dở việc chọn đồ.

**Status:** Draft

**Mốc:** M1 · **Priority:** P0 · **Effort:** M

**Màn:** 05-6 (chế độ thủ công) · 13-2 (AI tạm ngưng) · 13-3 (máy yếu → xem 2D)

**Pre-condition:** Không lấy được depth (timeout ~20 giây, rate limit, vượt ngân sách ngày, nhà cung cấp lỗi), ảnh khó phân tích (F4), người dùng không đồng ý gửi ảnh, hoặc máy không chạy được 3D.

**Post-condition:** Người dùng vẫn đi hết được vòng lõi: đặt món, thấy dự toán, bấm mua.

#### Acceptance Criteria

- AC1: Khi không lấy được depth, hệ thống tắt AI depth và mở chế độ thủ công (05-6): camera mặc định, món vẫn bám sàn và có bóng đổ, người dùng tự kéo, chỉnh kích thước, xoay trục Y.
- AC2: Màn 13-2 nói ngắn AI đang tạm ngưng và người dùng đặt tay được; không có câu đổ lỗi cho người dùng. Vượt ngân sách AI là "tắt mềm" sang thủ công, không báo lỗi chặn (spec M1 §5).
- AC3: Máy không hỗ trợ WebGL hoặc không đạt mức render tối thiểu → chuyển sang xem 2D (13-3); khay, thanh dự toán và nút Mua vẫn dùng được.
- AC4: Nếu spike tuần 1 không đạt ngưỡng, M1 ship đặt thủ công làm mặc định và tự căn thành công tắc trợ giúp (D4). Cả hai cách đều qua được vòng lõi.

#### Corner Cases

- CC1: AI hồi lại giữa phiên (hết rate limit) → không tự căn lại các món đã đặt; chỉ gợi ý bật lại cho món đặt sau, người dùng chủ động bật.
- CC2: Mất mạng (13-1) khi đang ở chế độ thủ công → vẫn đặt, kéo, xoay được với món đã tải; món chưa tải hiện trạng thái chờ mạng.
- CC3: Cách hiển thị cụ thể của chế độ xem 2D (13-3) chưa chốt; tối thiểu phải thấy được món nào đã chọn và tổng tiền.

## E4-US7 — Hoàn tác nhiều bước (F6)

 Là Young Aesthetes, tôi muốn hoàn tác từng bước mọi thao tác trên canvas để thử thoải mái mà không sợ làm hỏng căn phòng đang bày.

**Status:** Draft

**Mốc:** M1 · **Priority:** P0 · **Effort:** M

**Màn:** nút Hoàn tác trên mọi màn canvas (05-1…05-6, 04-1…04-4)

**Pre-condition:** Người dùng đã làm ít nhất một thao tác trên canvas.

**Post-condition:** Không gian về đúng trạng thái trước thao tác được hoàn tác, kể cả dự toán.

#### Acceptance Criteria

- AC1: Nút Hoàn tác luôn hiện trên thanh công cụ canvas; hỗ trợ ≥ 10 bước liên tiếp, có làm lại (spec M1 §9).
- AC2: Hoàn tác áp dụng cho mọi thao tác: thêm món, xóa món, kéo, xoay, chỉnh kích thước, đổi chất liệu, xóa đồ cũ (E05), chỉnh chiều cao máy.
- AC3: Hoàn tác không gọi lại AI và không tốn phí: trạng thái trước đó được giữ trên máy.
- AC4: Dự toán và số món cập nhật đúng sau mỗi lần hoàn tác hoặc làm lại.

#### Corner Cases

- CC1: Hết lịch sử hoàn tác → nút Hoàn tác mờ, có nhãn chữ (không chỉ đổi màu).
- CC2: Hoàn tác một lượt xóa đồ cũ → đồ cũ hiện lại vì đó là trạng thái trước lượt xóa; đây là hoàn tác, khác với "hiện lại pixel gốc" đã bỏ khỏi F3 (E05).
- CC3: Lịch sử hoàn tác có được giữ qua lần lưu và mở lại không gian chưa chốt (E06).
