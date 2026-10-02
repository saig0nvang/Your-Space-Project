---
derives_from: [D3@7fbc47fb, D5@15cdc73a, D10@4b681365, D3b@4248a41d]
---
[Quay lại PRD YourSpace](../../PRD.md)

# E06 Lưu, Phòng của tôi & Yêu thích

Epic này gom mọi cách để người dùng giữ lại một không gian đang làm dở và quay lại với nó: lưu bất cứ lúc nào mà không cần đăng nhập, kể cả sau khi đã mua một phần; danh sách Phòng của tôi cho người quay lại; tab Yêu thích cho món và thiết kế đã thả tim, kèm báo giảm giá; và quyền xóa dữ liệu của chính mình. Mục tiêu là đẩy Save/Share Rate (≥ 30%) và Return Rate D7 (≥ 25%) ở M1 mà không bắt người dùng tạo tài khoản. Không gian là của người dùng, không phải giỏ hàng: mua xong vẫn còn đó để chỉnh và mua tiếp.

## Version Control

| Version | Date | Updated by | Note |
| --- | --- | --- | --- |
| 1.0 | 02 Oct 2026 | Phạm Việt Anh | Tạo epic từ PRD v2.0 và flow chốt 02/10/2026. |

## Scope

- **Trong phạm vi** — Lưu và chia sẻ không gian từ trình chỉnh sửa (05-7); giữ nguyên trạng thái khi người dùng rời đi mở link ngoài rồi quay lại; Phòng của tôi (03-0); đồng bộ lên tài khoản tùy chọn (12-3); Yêu thích và báo giảm giá (10-1, 10-2); quyền riêng tư và dữ liệu (12-2).
- **Ngoài phạm vi** — Đăng không gian lên Nhà hàng xóm (E09); gửi link nhờ người duyệt (E10); tài khoản bằng email hoặc mật khẩu; đồng bộ giữa nhiều người dùng.
- **Theo mốc** — M1: stateless, không tài khoản; lưu và chia sẻ = xuất ảnh PNG + link mang trạng thái trong URL (spec M1 §1). · M2: lưu trên máy, Phòng của tôi, đồng bộ tùy chọn có OTP và consent riêng, Yêu thích, báo giảm giá, quyền riêng tư và dữ liệu. · M2+: thả tim thiết kế trên Nhà hàng xóm cũng lưu vào Yêu thích (D10).

## User Stories

## E6-US1 — Lưu và chia sẻ bằng ảnh PNG và link (M1)

 Là Young Aesthetes dùng bản web M1, tôi muốn xuất không gian đang bày thành ảnh và một đường link để giữ lại kết quả và gửi cho người thân xem mà không phải tạo tài khoản.

**Status:** Draft

**Mốc:** M1 · **Priority:** P1 · **Effort:** M

**Màn:** 05-7 (lưu & chia sẻ); web M1: component `ExportShare` trong trình chỉnh sửa.

**Pre-condition:** Người dùng đã tải ảnh phòng và đặt ít nhất một món trong trình chỉnh sửa.

**Post-condition:** Người dùng có một ảnh PNG phối cảnh và một link mở lại được cách bày; sự kiện `SpaceSaved` hoặc `SpaceShared` được ghi (E11).

#### Acceptance Criteria

- AC1: Nút Lưu hiện trên trình chỉnh sửa ở mọi lúc, không yêu cầu đăng nhập hay nhập SĐT trước khi lưu.
- AC2: "Tải ảnh" xuất một file PNG gồm ảnh phòng (kể cả vùng đã xóa đồ cũ) và mọi món đang đặt, đúng như người dùng thấy trên canvas.
- AC3: "Sao chép link" tạo một URL chứa trạng thái không gian (phong cách, các món, vị trí, góc xoay trục Y, tỷ lệ). Không có trạng thái nào được lưu trên máy chủ giữa các phiên (spec M1 §8).
- AC4: Mở lại link trên cùng trình duyệt khi ảnh phòng còn trong phiên thì dựng lại đúng cách bày đã lưu.
- AC5: Mỗi lần xuất ảnh hoặc sao chép link phát đúng một sự kiện `SpaceShared` kèm loại (ảnh hay link).

#### Corner Cases

- CC1: Link được mở ở máy khác hoặc sau khi phiên đã đóng — ảnh phòng không nằm trong link vì M1 không giữ ảnh trên máy chủ. Trang hiện danh sách món, dự toán và nút "Tải lại ảnh phòng" để đặt lại các món; không báo lỗi trống trơn.
- CC2: Mất mạng (13-1) khi bấm Lưu — xuất PNG vẫn chạy vì làm trên máy; sao chép link vẫn được vì trạng thái nằm trong URL.
- CC3: Máy yếu, đang xem ở chế độ 2D (13-3) — ảnh PNG xuất theo đúng chế độ đang hiển thị.
- CC4: Có thu SĐT khi lưu để kiêm luôn thu lead hay không: chưa chốt, xem PRD §8. Bản này không thu.

## E6-US2 — Lưu không gian trên máy bất cứ lúc nào (M2)

 Là Young Aesthetes, tôi muốn lưu không gian đang chỉnh ở bất kỳ bước nào, kể cả sau khi đã mua vài món, để quay lại chỉnh tiếp và mua phần còn lại.

**Status:** Draft

**Mốc:** M2 · **Priority:** P1 · **Effort:** M

**Màn:** 05-7 (lưu & chia sẻ), 05-1 (canvas).

**Pre-condition:** Người dùng đang ở trình chỉnh sửa với một ảnh phòng.

**Post-condition:** Không gian nằm trong Phòng của tôi (03-0) trên máy, mở lại đúng trạng thái đã lưu.

#### Acceptance Criteria

- AC1: Lưu không cần đăng nhập và không cần xác minh SĐT.
- AC2: Một không gian đã lưu gồm: ảnh đã dọn (sau các lần xóa đồ cũ), các món đã đặt với vị trí và tỷ lệ, chất liệu đã chọn, dự toán.
- AC3: Lưu được ở mọi trạng thái của trình chỉnh sửa, kể cả khi chưa đặt món nào hoặc khi đã mua một phần.
- AC4: Món đã mua mang nhãn "Đã mua" trong không gian đã lưu; các món còn lại giữ nguyên để mua tiếp (E07).
- AC5: Không gian và ảnh được lưu trên máy. Lưu không gửi ảnh lên máy chủ; chỉ đồng bộ tùy chọn (E6-US5) mới làm việc đó.

#### Corner Cases

- CC1: Mất mạng (13-1) — lưu vẫn thành công vì lưu trên máy.
- CC2: AI tạm ngưng (13-2) khi đang có một lượt xóa đồ cũ chưa xong — lưu trạng thái trước lượt xóa đó; không lưu ảnh dở dang.
- CC3: Bộ nhớ máy không đủ để lưu ảnh — báo rõ lý do bằng icon + chữ, giữ nguyên không gian đang mở để người dùng giải phóng bộ nhớ rồi lưu lại.
- CC4: Không gian là bản sao từ thiết kế có sẵn (M2+, E02) — lưu thành không gian của người dùng; bản gốc không bị đổi và nguồn vẫn được ghi.

## E6-US3 — Phòng của tôi: mở lại đúng không gian (M2)

 Là Young Aesthetes quay lại app, tôi muốn thấy danh sách các không gian đã lưu và mở lại đúng một không gian để làm tiếp mà không phải chụp lại phòng.

**Status:** Draft

**Mốc:** M2 · **Priority:** P1 · **Effort:** M

**Màn:** 03-0 (Phòng của tôi), tab Phòng; lối vào từ màn mở đầu.

**Pre-condition:** Người dùng mở app; có thể đã lưu hoặc chưa lưu không gian nào.

**Post-condition:** Người dùng ở trình chỉnh sửa với đúng không gian đã chọn, hoặc biết bước tiếp theo khi chưa có không gian nào.

#### Acceptance Criteria

- AC1: Mỗi mục trong Phòng của tôi hiện ảnh đã dọn có các món đã đặt, tên không gian, số món, tổng dự toán và thời điểm lưu gần nhất.
- AC2: Mục có món đã mua hiện nhãn "Đã mua" kèm số món đã mua.
- AC3: Chạm một mục mở trình chỉnh sửa với đúng ảnh, món, chất liệu và dự toán đã lưu; dự toán tính theo giá hiện tại.
- AC4: Màn mở đầu hiện lối "Tiếp tục" tới không gian lưu gần nhất khi có ít nhất một không gian.
- AC5: Người dùng đổi tên hoặc xóa được từng không gian ngay trong danh sách; xóa cần xác nhận một lần.

#### Corner Cases

- CC1: Chưa có không gian nào (13-4) — màn trống nói Phòng của tôi dùng để làm gì và có một nút chính "Thử phòng".
- CC2: Một món trong không gian đã ngừng bán hoặc đổi giá — món vẫn hiện trên ảnh, gắn nhãn "Ngừng bán" hoặc giá mới; dự toán tính lại và nói rõ món nào thay đổi.
- CC3: Máy yếu (13-3) — danh sách vẫn mở được; không gian mở ở chế độ xem 2D.
- CC4: Mất mạng (13-1) — danh sách và ảnh vẫn hiện vì nằm trên máy; giá hiện là giá lần cập nhật gần nhất kèm ghi chú.

## E6-US4 — Giữ nguyên trạng thái khi rời đi mở link ngoài

 Là Young Aesthetes, tôi muốn rời YourSpace để mở trang bán hàng hoặc tin nhắn rồi quay lại mà không mất cách bày đang làm, để không phải đặt lại đồ từ đầu.

**Status:** Draft

**Mốc:** M1 · M2 · **Priority:** P0 · **Effort:** S

**Màn:** 05-1 (canvas), 06-1 (dự toán); web M1: `state/store`, `EstimatePanel`.

**Pre-condition:** Người dùng đang có một không gian với ít nhất một món và bấm một link dẫn ra ngoài (link affiliate ở M1, link chia sẻ, trang nhà cung cấp).

**Post-condition:** Khi quay lại, người dùng thấy đúng không gian như lúc rời đi.

#### Acceptance Criteria

- AC1: Trạng thái không gian được ghi lại trước khi mở bất kỳ link ngoài nào (yêu cầu chung với E07).
- AC2: M1: link ngoài mở ở tab mới; tab YourSpace giữ nguyên ảnh, món, vị trí, dự toán và lịch sử hoàn tác.
- AC3: M1: nếu tab YourSpace bị trình duyệt tải lại, trạng thái món được khôi phục từ URL; ảnh phòng được khôi phục nếu trình duyệt còn giữ, nếu không thì áp dụng như E6-US1 CC1.
- AC4: M2: quay lại app từ link ngoài đưa người dùng về đúng màn và đúng không gian đã rời đi, kể cả khi hệ điều hành đã đóng app ở nền.

#### Corner Cases

- CC1: Mất mạng (13-1) khi quay lại — không gian vẫn hiện từ bản đã ghi trên máy; phần cần mạng (giá mới) báo trạng thái riêng.
- CC2: Người dùng mở nhiều link ngoài liên tiếp từ sheet mua — mỗi lần đều quay về đúng sheet đang mở, không về đầu trình chỉnh sửa.
- CC3: Máy yếu (13-3) khiến hệ điều hành đóng app ở nền thường xuyên — vẫn khôi phục từ bản đã ghi trước khi rời.

## E6-US5 — Đồng bộ phòng lên tài khoản, tùy chọn (M2)

 Là Young Aesthetes, tôi muốn tùy chọn đồng bộ các không gian lên tài khoản để không mất chúng khi đổi máy, và hiểu rõ ảnh phòng của mình sẽ nằm trên máy chủ.

**Status:** Draft

**Mốc:** M2 · **Priority:** P2 · **Effort:** L

**Màn:** 12-3 (đồng bộ phòng), 07-1/07-2 (SĐT, OTP).

**Pre-condition:** Người dùng có ít nhất một không gian lưu trên máy và chủ động bật đồng bộ.

**Post-condition:** Không gian được đồng bộ gắn với SĐT đã xác minh; người dùng tắt đồng bộ được bất cứ lúc nào.

#### Acceptance Criteria

- AC1: Đồng bộ tắt theo mặc định; không bật ngầm, không gợi ý bật bằng hộp thoại tự bật lên.
- AC2: Bật đồng bộ yêu cầu xác minh SĐT bằng OTP; nếu SĐT đã được xác minh lúc thanh toán thì không hỏi lại.
- AC3: Trước khi đồng bộ, người dùng đọc và đồng ý một consent riêng nói rằng ảnh phòng sẽ được lưu trên máy chủ, khác với consent "Ảnh được gửi lên hệ thống để xử lý và xóa ngay sau đó." lúc chụp (D3).
- AC4: Tắt đồng bộ hỏi người dùng có muốn xóa bản trên máy chủ không; bản trên máy giữ nguyên.

#### Corner Cases

- CC1: Mất mạng (13-1) giữa lúc đồng bộ — không gian trên máy không bị ảnh hưởng; đồng bộ chạy lại khi có mạng và báo trạng thái bằng icon + chữ.
- CC2: Cùng một không gian được sửa trên hai máy — giữ cả hai bản, đặt tên phân biệt, không ghi đè ngầm.
- CC3: DPIA cho luồng lưu ảnh trên máy chủ chưa xong (spec M2 §7.5) — tính năng không được bật cho người dùng.
- CC4: Thời hạn giữ ảnh trên máy chủ sau khi tắt đồng bộ: chưa chốt, cần bổ sung vào PRD §8 (liên quan DPIA, spec M2 §7.5).

## E6-US6 — Yêu thích và báo giảm giá (M2)

 Là Young Aesthetes, tôi muốn thả tim các món và thiết kế mình thích để xem lại một chỗ và được báo khi món đó giảm giá, để mua đúng lúc.

**Status:** Draft

**Mốc:** M2 (món) · M2+ (thiết kế, D10) · **Priority:** P2 · **Effort:** M

**Màn:** 10-1 (Yêu thích + báo giảm giá), 10-2 (thông báo), tab Yêu thích; nút tim ở 02-4 và 15-2.

**Pre-condition:** Người dùng xem một món (02-4) hoặc một thiết kế (15-2).

**Post-condition:** Món hoặc thiết kế nằm trong tab Yêu thích; người dùng nhận thông báo khi món đã thả tim giảm giá.

#### Acceptance Criteria

- AC1: Thả tim không cần đăng nhập; chạm lại để bỏ tim. Vùng chạm nút tim ≥ 44px.
- AC2: Tab Yêu thích tách hai nhóm: Món và Thiết kế. Thả tim một thiết kế ở Phòng mẫu hoặc Nhà hàng xóm cũng lưu thiết kế đó vào nhóm Thiết kế (D10).
- AC3: Món đã thả tim có giá thấp hơn lúc thả tim thì hiện nhãn giảm giá kèm giá cũ và giá mới ở 10-1, và gửi một thông báo vào 10-2.
- AC4: Từ một món trong Yêu thích, người dùng đặt được món đó vào một không gian trong Phòng của tôi.

#### Corner Cases

- CC1: Chưa thả tim gì (13-4) — màn trống nói tim dùng để làm gì và dẫn về Khám phá.
- CC2: Thiết kế đã thả tim bị ẩn chờ xem xét hoặc bị gỡ (E09) — mục hiện trạng thái "Không còn hiển thị", không mở được chi tiết.
- CC3: Người dùng tắt thông báo ở hệ điều hành — nhãn giảm giá vẫn hiện trong 10-1.
- CC4: Mất mạng (13-1) — danh sách vẫn hiện từ bản trên máy; giá có ghi chú là giá lần cập nhật gần nhất.

## E6-US7 — Quyền riêng tư và xóa dữ liệu (M2)

 Là Young Aesthetes, tôi muốn xem dữ liệu nào của mình đang nằm ở đâu và xóa được không gian hoặc toàn bộ dữ liệu, để tin rằng ảnh căn phòng của mình nằm trong tay mình.

**Status:** Draft

**Mốc:** M2 · **Priority:** P1 · **Effort:** M

**Màn:** 12-2 (quyền riêng tư & dữ liệu), 12-1 (Tôi), 03-0.

**Pre-condition:** Người dùng mở Tôi → Quyền riêng tư & dữ liệu.

**Post-condition:** Dữ liệu người dùng chọn xóa không còn trên máy và, nếu đã đồng bộ, không còn trên máy chủ.

#### Acceptance Criteria

- AC1: Màn 12-2 liệt kê nơi dữ liệu nằm: không gian trên máy; không gian đã đồng bộ (nếu bật); link nhờ duyệt đang còn hạn (E10); ảnh gửi lên để xử lý AI thì xóa ngay sau đó.
- AC2: Người dùng xóa được từng không gian, hoặc xóa toàn bộ dữ liệu trên máy trong một thao tác có xác nhận.
- AC3: Khi đã đồng bộ, "Xóa toàn bộ dữ liệu" xóa cả bản trên máy chủ và báo khi hoàn tất.
- AC4: Xóa dữ liệu không xóa lịch sử đơn hàng cần giữ cho khiếu nại đang mở (E08); màn nói rõ phần nào được giữ và vì sao.
- AC5: Mọi câu trên màn này nói đúng sự thật về ảnh; không có câu nào ngụ ý ảnh không rời khỏi máy (D3).

#### Corner Cases

- CC1: Mất mạng (13-1) khi xóa dữ liệu đã đồng bộ — xóa trên máy ngay, xếp hàng lệnh xóa trên máy chủ và báo trạng thái "Đang chờ mạng để xóa trên máy chủ".
- CC2: Người dùng xóa một không gian có món đã mua — đơn hàng vẫn còn trong Tôi; chỉ không gian bị xóa.
- CC3: Người dùng xóa không gian là nguồn của một thiết kế đã đăng lên Nhà hàng xóm (M2+) — hỏi có gỡ luôn thiết kế đã đăng không; không tự gỡ.
- CC4: Thời hạn giữ dữ liệu đơn hàng sau khi người dùng xóa dữ liệu: chưa chốt, cần bổ sung vào PRD §8.
